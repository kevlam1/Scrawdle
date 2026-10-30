-- Scrawdle draft schema. NOT run against a real database yet.
-- Table names and columns will likely change once the submit/fetch flow is built.
-- See ../README.md and ../../CLAUDE.md.

create table if not exists daily_prompts (
  id uuid primary key default gen_random_uuid(),
  prompt_date date not null,
  prompt_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists drawings (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references daily_prompts (id),
  player_name text,
  image_data text not null, -- placeholder: likely a data URL or storage path, not decided
  created_at timestamptz not null default now()
);

-- Daily sanitize: wipe yesterday's drawings. Requires the pg_cron extension,
-- which is available on Supabase's free tier (see CLAUDE.md for the source).
-- Not yet enabled or scheduled against a real project.
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'wipe-old-drawings',
--   '0 0 * * *', -- daily at midnight UTC; exact reset time not decided
--   $$ delete from drawings where created_at < now() - interval '1 day'; $$
-- );
