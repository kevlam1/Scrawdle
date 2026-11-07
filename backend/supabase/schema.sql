-- Scrawdle schema: finished drawings for the daily gallery, plus the registry of lobby codes.
-- Written 2026-11-04. This file is the full picture for a fresh project. A project that already
-- exists gets only the changes, from updates/ (run in order, each once).
-- See ../README.md and ../../CLAUDE.md for the design reasoning.
--
-- Scope: "store today's finished drawings, show them in the gallery" (matches
-- window.scrawdlePublish and window.scrawdleGallery in ../../frontend/drawing.js and
-- gallery.js), and "remember which lobby codes exist" (frontend/lobby.js). Who is IN a lobby is
-- never stored: that's Supabase Realtime (presence and broadcast), which needs no tables.
--
-- Prompts are NOT stored here on purpose: they stay in ../../frontend/prompts.json so any
-- teammate can edit them by committing a file, with no Supabase access needed. See CLAUDE.md.

create table if not exists drawings (
  id uuid primary key default gen_random_uuid(),
  day date not null,
  mode text not null check (mode in ('basic', 'detailed', 'scrawl', 'daily')), -- scrawl = Daily Free Play (free draw); daily = Daily Scrawl (the merged Basic + Detailed, update 004)
  prompts jsonb not null, -- the exact set drawn: [{ key, label, value, optional }]
  image_path text not null unique, -- path inside the "drawings" storage bucket
  hidden boolean not null default false, -- set by three players' reports (report_drawing below) or by a teammate
  created_at timestamptz not null default now()
);

create index if not exists drawings_day_mode_idx on drawings (day, mode) where not hidden;

alter table drawings enable row level security;

-- Anyone can read recent visible drawings for the gallery. The frontend's day is the player's
-- LOCAL date but current_date is the database's UTC date, so these policies allow a one-day
-- window either side instead of an exact match (an exact match breaks every evening in US time).
create policy "public can read today's visible drawings"
  on drawings for select
  to anon
  using (day between current_date - 1 and current_date + 1 and not hidden);

-- Anyone can publish a drawing for today only. There's no login, so this can't be tied to a
-- real user; anyone with the anon key (which is meant to be public, see CLAUDE.md) could insert
-- directly, bypassing the game. The check constraint and this policy both reject anything
-- outside today's valid modes, but can't stop spam or inappropriate images outright. That's a
-- known gap. Players can report a drawing (reports, below), and three different players' reports
-- hide it; a teammate can also set hidden = true or delete the row from the Supabase dashboard. No update/delete policy is granted to anon on purpose.
create policy "public can publish a drawing for today"
  on drawings for insert
  to anon
  with check (day between current_date - 1 and current_date + 1 and mode in ('basic', 'detailed', 'scrawl', 'daily'));

-- Storage: a public bucket for the PNGs. Run once, by hand, after the project exists
-- (the Supabase dashboard's Storage tab can also create this bucket).
-- insert into storage.buckets (id, name, public) values ('drawings', 'drawings', true)
--   on conflict (id) do nothing;

-- Storage RLS: anon may upload into the "drawings" bucket, but not overwrite or delete.
-- Uncomment once the bucket exists. Run in the SQL editor, not inside this file automatically.
create policy "public can upload drawings"
   on storage.objects for insert
   to anon
   with check (bucket_id = 'drawings');

-- Votes: thumbs up / thumbs down on published drawings. Same objects as updates/002-votes.sql;
-- the reasoning is in the comments there. A drawing with at least one thumbs up has won (that rule
-- lives in frontend/votes.js). RLS is on with no policies, like lobbies below: visitors go through
-- cast_vote and vote_counts, so nobody can read voter ids or vote in someone else's name.
create table if not exists public.votes (
  drawing_id uuid not null references public.drawings (id) on delete cascade,
  voter_id uuid not null,
  value smallint not null check (value in (1, -1)), -- 1 = thumbs up, -1 = thumbs down
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (drawing_id, voter_id)
);
alter table public.votes enable row level security;

create or replace function public.cast_vote(target_drawing uuid, voter uuid, vote int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if voter is null or vote is null or vote not in (1, 0, -1) then
    raise exception 'a vote is 1 (thumbs up), -1 (thumbs down) or 0 (clear)';
  end if;
  if not exists (
    select 1 from public.drawings
    where id = target_drawing and not hidden and day between current_date - 1 and current_date + 1
  ) then
    raise exception 'that drawing is not open for votes';
  end if;
  if vote = 0 then
    delete from public.votes where drawing_id = target_drawing and voter_id = voter;
  else
    insert into public.votes (drawing_id, voter_id, value) values (target_drawing, voter, vote)
    on conflict (drawing_id, voter_id) do update set value = excluded.value, updated_at = now();
  end if;
end;
$$;

create or replace function public.vote_counts(drawing_ids uuid[], voter uuid)
returns table (drawing_id uuid, up int, down int, my_vote int)
language sql
security definer
set search_path = ''
stable
as $$
  select d.id,
         (count(*) filter (where v.value = 1))::int,
         (count(*) filter (where v.value = -1))::int,
         coalesce(max(v.value) filter (where v.voter_id = voter), 0)::int
  from unnest(drawing_ids) as d(id)
  left join public.votes v on v.drawing_id = d.id
  group by d.id;
$$;

grant execute on function public.cast_vote(uuid, uuid, int) to anon;
grant execute on function public.vote_counts(uuid[], uuid) to anon;

-- Reports: three different players' reports hide a drawing. Same objects as updates/003-reports.sql;
-- keep the two identical.
-- 1. The reports. One per reporter per drawing, so reporting twice counts once. There are no
-- logins, so a reporter is the same random browser id votes use (see publish.js). Clearing
-- browser data gives a new id, so one person determined to hide a drawing could do it alone;
-- this stops accidents and casual misuse, not a determined attacker. A teammate can bring a
-- wrongly hidden drawing back by setting hidden = false in the dashboard.
-- "on delete cascade": the daily wipe deletes old drawings, and their reports go with them.
create table if not exists public.reports (
  drawing_id uuid not null references public.drawings (id) on delete cascade,
  reporter_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (drawing_id, reporter_id)
);

-- RLS on with NO policies, like votes and lobbies: the public key can't read who reported what.
-- Visitors go through the function below.
alter table public.reports enable row level security;

-- Records one report and hides the drawing once enough different players have reported it.
-- Returns true when the drawing is hidden (now or already). The number lives here, not in the
-- browser, so nobody can change it from a page; the gallery's confirm message says 3 too.
create or replace function public.report_drawing(target_drawing uuid, reporter uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  reports_to_hide constant int := 3;
  is_hidden boolean;
begin
  if reporter is null then
    raise exception 'a report needs a reporter id';
  end if;
  select hidden into is_hidden from public.drawings
  where id = target_drawing and day between current_date - 1 and current_date + 1;
  if not found then
    raise exception 'that drawing is not open for reports';
  end if;
  if is_hidden then
    return true;
  end if;
  insert into public.reports (drawing_id, reporter_id) values (target_drawing, reporter)
  on conflict (drawing_id, reporter_id) do nothing;
  if (select count(*) from public.reports where drawing_id = target_drawing) >= reports_to_hide then
    update public.drawings set hidden = true where id = target_drawing;
    return true;
  end if;
  return false;
end;
$$;

grant execute on function public.report_drawing(uuid, uuid) to anon;

-- Yesterday's winner: the best drawing(s) of a given day. Same as updates/005-yesterdays-winner.sql;
-- the reasoning is in the comments there. It exists because the read policy above only covers a day
-- either side of UTC today, which in US time drops the player's yesterday each evening.
create or replace function public.top_drawings(target_day date, modes text[], max_count int default 3)
returns table (id uuid, mode text, image_path text, prompts jsonb, up int, down int)
language sql
security definer
set search_path = ''
stable
as $$
  with counted as (
    select d.id, d.mode, d.image_path, d.prompts, d.created_at,
           (count(v.value) filter (where v.value = 1))::int as up,
           (count(v.value) filter (where v.value = -1))::int as down
    from public.drawings d
    left join public.votes v on v.drawing_id = d.id
    where d.day = target_day
      and d.mode = any (modes)
      and not d.hidden
      and target_day between current_date - 2 and current_date + 1
    group by d.id
  ),
  best as (
    select c.up, c.down from counted c where c.up >= 1 order by c.up desc, c.down asc limit 1
  )
  select c.id, c.mode, c.image_path, c.prompts, c.up, c.down
  from counted c
  join best b on c.up = b.up and c.down = b.down
  order by c.created_at, c.id
  limit least(greatest(coalesce(max_count, 3), 1), 10);
$$;

grant execute on function public.top_drawings(date, text[], int) to anon;


-- Lobbies: private rooms joined by a 5-letter code (https://scrawdle.vercel.app/?ABCDE).
-- The table only records that a code exists, so a mistyped code can be told apart from a real
-- lobby. RLS is on with NO policies, so the public key can't read or write the table directly
-- (otherwise anyone could list every lobby code). Visitors go through the two functions below.
create table if not exists public.lobbies (
  code text primary key check (code ~ '^[A-Z]{5}$'),
  created_at timestamptz not null default now()
);
alter table public.lobbies enable row level security;

-- Makes a new lobby and returns its code. Codes use 20 consonants only, so a random code almost
-- never spells a word (nobody gets a rude lobby code). 20^5 = 3.2 million codes.
-- security definer = runs as the table's owner, which is why it can write to a table the public
-- key can't touch; the empty search_path is what the Supabase docs require when you do that.
create or replace function public.create_lobby()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  letters constant text := 'BCDFGHJKLMNPQRSTVWXZ';
  new_code text;
  attempts int := 0;
begin
  loop
    new_code := '';
    for i in 1..5 loop
      new_code := new_code || substr(letters, 1 + floor(random() * length(letters))::int, 1);
    end loop;
    begin
      insert into public.lobbies (code) values (new_code);
      return new_code;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts >= 20 then
        raise exception 'could not find a free lobby code';
      end if;
    end;
  end loop;
end;
$$;

-- True if a lobby with this code exists. Typed codes can be any case, so it upper-cases first.
create or replace function public.lobby_exists(lobby_code text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (select 1 from public.lobbies where code = upper(lobby_code));
$$;

grant execute on function public.create_lobby() to anon;
grant execute on function public.lobby_exists(text) to anon;

-- Daily wipe. Plain SQL can't free storage: Supabase's docs say deleting storage objects with a
-- SQL query "will result in the object being orphaned". So pg_cron just calls the Edge Function in
-- functions/purge-old-drawings/index.ts once a day, and that function deletes the files (through
-- the Storage API) and the old rows. It keeps today and yesterday by UTC date and removes
-- anything older, so a drawing lives roughly one to two days (the window is one day wide because
-- the game's "day" is the player's local date; see the policies above).
--
-- ALREADY RUN on Kevin's project (the block below is the record of what was run, with
-- placeholders; running it again would fail on the duplicate secret names). Order of setup,
-- if it ever has to be repeated (full steps in ../README.md):
--   1. Deploy the function and set its CRON_SECRET secret, with JWT verification OFF.
--   2. Test it by hand with ?dryRun=1, then for real.
--   3. Enable the pg_cron and pg_net extensions (dashboard > Database > Extensions).
--   4. Replace the two placeholders below with your real values and run this block ONCE in the
--      SQL Editor. Never commit the real secret or paste it into this file.
--
-- select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
-- select vault.create_secret('<the same value as the function''s CRON_SECRET>', 'purge_cron_secret');
-- select cron.schedule(
--   'purge-old-drawings',
--   '0 10 * * *', -- 10:00 UTC daily (middle of the night in US time)
--   $$
--     select net.http_post(
--       url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
--              || '/functions/v1/purge-old-drawings',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'purge_cron_secret')
--       ),
--       body := '{}'::jsonb
--     ) as request_id;
--   $$
-- );

-- Forget lobby codes older than a day. Not scheduled here, same as the block above; on Kevin's
-- project this was scheduled by updates/001-lobbies-and-daily-scrawl.sql.
-- select cron.schedule(
--   'purge-old-lobbies',
--   '15 10 * * *',
--   $$ delete from public.lobbies where created_at < now() - interval '1 day' $$
-- );
