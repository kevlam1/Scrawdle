-- Update 001 (2026-11-04): lobbies, and Daily Scrawl as a drawing mode.
--
-- Run ONCE, in the Supabase SQL Editor, on a project that already ran the earlier schema.sql
-- (that's Kevin's project). A brand-new project doesn't need this file: schema.sql already
-- includes everything here.
--
-- Also redeploy the Edge Function (backend/supabase/functions/purge-old-drawings/index.ts):
-- it now cleans every mode folder, including the new "scrawl" one. See ../../README.md.

-- 1. Daily Scrawl: allow the mode 'scrawl' for drawings.
-- (If the next line reports nothing to drop and a 'scrawl' publish is still refused, the old
--  constraint has a different name. Find it with:
--    select conname from pg_constraint where conrelid = 'public.drawings'::regclass and contype = 'c';
--  and drop that one instead.)
alter table public.drawings drop constraint if exists drawings_mode_check;
alter table public.drawings add constraint drawings_mode_check
  check (mode in ('basic', 'detailed', 'scrawl'));

drop policy if exists "public can publish a drawing for today" on public.drawings;
create policy "public can publish a drawing for today"
  on public.drawings for insert
  to anon
  with check (day between current_date - 1 and current_date + 1 and mode in ('basic', 'detailed', 'scrawl'));

-- 2. Lobbies. Same objects as the "Lobbies" section of schema.sql; see the comments there.
create table if not exists public.lobbies (
  code text primary key check (code ~ '^[A-Z]{5}$'),
  created_at timestamptz not null default now()
);
alter table public.lobbies enable row level security;

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

-- 3. Forget lobby codes older than a day, every day at 10:15 UTC (pg_cron is already enabled
-- from the drawings cleanup). Plain SQL is enough here: there are no files to delete.
select cron.schedule(
  'purge-old-lobbies',
  '15 10 * * *',
  $$ delete from public.lobbies where created_at < now() - interval '1 day' $$
);
