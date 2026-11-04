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
  mode text not null check (mode in ('basic', 'detailed', 'scrawl')), -- scrawl = Daily Scrawl (free draw)
  prompts jsonb not null, -- the exact set drawn: [{ key, label, value, optional }]
  image_path text not null unique, -- path inside the "drawings" storage bucket
  hidden boolean not null default false, -- manual moderation flag; no report button exists yet
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
-- known gap: there's no report/hide button in the app yet (tracked in README.md), so moderation
-- today means a teammate manually sets hidden = true or deletes the row from the Supabase
-- dashboard. No update/delete policy is granted to anon on purpose.
create policy "public can publish a drawing for today"
  on drawings for insert
  to anon
  with check (day between current_date - 1 and current_date + 1 and mode in ('basic', 'detailed', 'scrawl'));

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
