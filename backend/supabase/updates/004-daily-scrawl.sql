-- Update 004 (2026-11-06): "Daily Scrawl", the merged Basic + Detailed mode, gets its own drawing mode id: 'daily'.
--
-- Run ONCE, in the Supabase SQL Editor, on a project that already ran schema.sql plus updates 001 to 003
-- (that's Kevin's project). A brand-new project doesn't need this file: schema.sql already includes it.
--
-- Run it BEFORE the frontend that publishes Daily Scrawl drawings is deployed, or publishing them is refused.
-- 'basic' and 'detailed' stay allowed on purpose: a page that was already open, or a draft saved in a
-- player's browser, can still publish them for a day or so. Drop them in a later numbered update once the
-- daily wipe has cleared the old rows. 'scrawl' (Daily Free Play) is unchanged. The daily wipe needs no
-- change, because it cleans every mode folder.
--
-- (If the next line reports nothing to drop and a 'daily' publish is still refused, the old constraint has
--  a different name. Find it with:
--    select conname from pg_constraint where conrelid = 'public.drawings'::regclass and contype = 'c';
--  and drop that one instead.)
alter table public.drawings drop constraint if exists drawings_mode_check;
alter table public.drawings add constraint drawings_mode_check
  check (mode in ('basic', 'detailed', 'scrawl', 'daily'));

drop policy if exists "public can publish a drawing for today" on public.drawings;
create policy "public can publish a drawing for today"
  on public.drawings for insert
  to anon
  with check (day between current_date - 1 and current_date + 1 and mode in ('basic', 'detailed', 'scrawl', 'daily'));
