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

-- Anyone can read today's visible drawings for the gallery. Scoped to CURRENT_DATE so a
-- browser can't list past days even though the table isn't wiped by this policy alone.
create policy "public can read today's visible drawings"
  on drawings for select
  to anon
  using (day = current_date and not hidden);

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
  with check (day = current_date and mode in ('basic', 'detailed'));

-- Storage: a public bucket for the PNGs. Run once, by hand, after the project exists
-- (the Supabase dashboard's Storage tab can also create this bucket).
-- insert into storage.buckets (id, name, public) values ('drawings', 'drawings', true)
--   on conflict (id) do nothing;

-- Storage RLS: anon may upload into the "drawings" bucket, but not overwrite or delete.
-- Uncomment once the bucket exists. Run in the SQL editor, not inside this file automatically.
-- create policy "public can upload drawings"
--   on storage.objects for insert
--   to anon
--   with check (bucket_id = 'drawings');

-- Daily sanitize: hide yesterday's drawings from the gallery. Requires the pg_cron extension,
-- which is available on Supabase's free tier with no billing account (see CLAUDE.md for the
-- source). Not yet enabled or scheduled against a real project.
-- NOTE: this only updates the table. It does NOT delete the underlying file from the
-- "drawings" storage bucket, which pg_cron (plain SQL) can't do on its own -- that needs a
-- scheduled Edge Function calling the Storage API, which isn't built yet. Until then, storage
-- keeps accumulating files even after the gallery stops showing them.
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'hide-old-drawings',
--   '0 0 * * *', -- daily at midnight UTC; exact reset time not decided
--   $$ update drawings set hidden = true where day < current_date; $$
-- );
