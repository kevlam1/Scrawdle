-- Scrawdle schema: storing finished drawings for the daily gallery.
-- Written 2026-11-04. Not yet run against a real Supabase project.
-- See ../README.md and ../../CLAUDE.md for the design reasoning.
--
-- Scope: only "store today's finished drawings, show them in the gallery" (matches
-- window.scrawdlePublish and window.scrawdleGallery in ../../frontend/drawing.js and
-- gallery.js). Multiplayer lobbies / syncing (also listed under Kevin's tasks in the
-- team's plan doc) are a separate, bigger feature and are NOT covered here.
--
-- Prompts are NOT stored here on purpose: they stay in ../../frontend/prompts.json so any
-- teammate can edit them by committing a file, with no Supabase access needed. See CLAUDE.md.

create table if not exists drawings (
  id uuid primary key default gen_random_uuid(),
  day date not null,
  mode text not null check (mode in ('basic', 'detailed')),
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
  with check (day between current_date - 1 and current_date + 1 and mode in ('basic', 'detailed'));

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
