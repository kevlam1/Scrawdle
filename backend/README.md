# backend

Supabase is the decided database (see `../CLAUDE.md`), pending Angie and Trenten's sign-off. Supabase is a managed Postgres service, so there's no server process to run here — this folder holds the database schema and the daily cleanup job as SQL, plus connection config.

**Nothing is connected yet.** No Supabase project has been created, so there are no real keys and nothing has been tested against a live database.

- `supabase/schema.sql`: a draft schema (prompts for the day, submitted drawings) and the `pg_cron` job that wipes drawings daily. Draft only — not run against a real database, table names and columns will likely change once someone builds the actual submit/fetch flow.
- `.env.example` (repo root): the environment variable names the frontend will need once a Supabase project exists (`SUPABASE_URL`, `SUPABASE_ANON_KEY`). Copy it to `.env` locally and fill in real values once the project exists; `.env` itself is gitignored.

Next real step: someone creates the actual Supabase project, confirms this schema or changes it, and runs it for real.
