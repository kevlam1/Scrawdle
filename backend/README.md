# backend

Supabase is the team's decided database (see `../CLAUDE.md`; Firebase is crossed out in the team's own plan doc as of 2026-11-04). Supabase is a managed Postgres service, so there's no server process to run here — this folder holds the database schema as SQL.

**Nothing is connected yet.** No Supabase project has been created, so there are no real keys and nothing has been tested against a live database. Kevin owns this part and the project will live on his machine.

- `supabase/schema.sql`: the real schema for the one job Supabase actually does right now — storing finished drawings so they can be shown in the gallery. A `drawings` table, Row Level Security policies (anyone can read recent visible drawings and publish one; nobody can edit or delete through the public key), and a commented-out daily job that calls the cleanup function below. The table, policies, and bucket have been run against Kevin's real project, and he reported that publishing and the public gallery work; the daily wipe is deployed and scheduled (see below).
- `supabase/functions/purge-old-drawings/index.ts`: the daily wipe, an Edge Function. Deletes old drawings' files from the `drawings` bucket and their rows. Its date and folder logic is tested in `../tests/purge.test.js`. It is deployed on Kevin's project, and a dry run through the schedule's own call returned 200; Kevin reported a real run also deleted a test file and row. No scheduled run has been observed yet.
- Prompts are **not** stored here on purpose — they stay in `../frontend/prompts.json` so any teammate can edit them by committing a file, with no Supabase access needed, since Supabase will only be set up on Kevin's machine.
- `../frontend/supabase-config.js` and `../frontend/publish.js`: the frontend side that actually calls Supabase (upload a drawing, insert its row, read today's drawings back for the gallery). See `../frontend/README.md`.

## Keys: what's actually secret

Supabase gives two different keys, and only one of them is a secret:
- The **anon / public key** is meant to be shipped in browser code. It goes in `../frontend/supabase-config.js`, which is safe to commit once filled in. Row Level Security (the policies in `schema.sql`) is what actually limits what it can do — without RLS, this key could read or write anything.
- The **service_role key** bypasses Row Level Security entirely and must never appear in `supabase-config.js`, any committed file, or anywhere in the frontend. It's only for trusted server-side use, which this project doesn't have yet.

## Setting up the daily wipe

These steps have been done on Kevin's project; they're kept here so the setup can be repeated (a new project, or if the function is lost). On the free plan, in order:

1. **Deploy the function.** Dashboard > Edge Functions > Deploy a new function > Via Editor. Name it exactly `purge-old-drawings`, paste in `supabase/functions/purge-old-drawings/index.ts`, and deploy. The docs warn the editor has no version control for edits, so this repo copy is the source of truth. Then open the function's **Settings** tab and turn **"Verify JWT with legacy secret" off**, and save. Cron can't send a user token, and with it on Supabase's front door rejects the call with a 401 `UNAUTHORIZED_NO_AUTH_HEADER` before the function's own check runs.
2. **Set the function's secret.** In the function's secrets, add `CRON_SECRET` with a long random value you make up (for example 40 random characters). This is the only thing protecting the function once JWT checking is off. Don't put it in the repo.
3. **Dry run.** Call the function by hand with `?dryRun=1` and the header `x-cron-secret: <your value>`. It lists what it would delete and deletes nothing. Check the `oldDays` and counts make sense.
4. **Real run.** Same call without `?dryRun=1`. Then confirm in Storage that the old day folders are gone and in the Table Editor that the old rows are gone.
5. **Schedule it.** Enable the `pg_cron` and `pg_net` extensions (dashboard > Database > Extensions), then run the commented block at the bottom of `supabase/schema.sql` once in the SQL Editor, with the two placeholders replaced by your real project URL and the same `CRON_SECRET` value.
6. **Check the first scheduled run** the next day (Edge Functions logs).

What gets deleted: anything dated before yesterday by UTC date, so a drawing lives about one to two days, not exactly 24 hours. That window is deliberate (the game's day is the player's local date; the database's is UTC). Files with no matching row, which a failed publish can leave behind, are removed too, because the function works from the storage folders, not only from the table.

## Known gap: no moderation UI yet

There's no login system, so publishing a drawing isn't tied to a real person — anyone who finds the anon key (trivial, since it's meant to be public) could insert a row directly, bypassing the game entirely. The schema only restricts *what* can be inserted (today's date, a valid mode), not *who* inserts it. Until a report/hide button exists in the app, moderation means a teammate manually sets a row's `hidden` flag or deletes it from the Supabase dashboard.

Next real step: Kevin creates the actual Supabase project, runs `schema.sql`, fills in `../frontend/supabase-config.js`, and checks the publish/gallery flow end to end.
