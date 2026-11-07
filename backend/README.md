# backend

Supabase is the team's decided database (see `../CLAUDE.md`; Firebase is crossed out in the team's own plan doc as of 2026-11-04). Supabase is a managed Postgres service, so there's no server process to run here — this folder holds the database schema as SQL.

Kevin owns this part, and the Supabase project lives on his machine: nobody else can run SQL against it. If your work needs a database change, see "Applying an update" below.

- `supabase/schema.sql`: the full schema for a fresh project, for two jobs. (1) Storing finished drawings for the gallery: a `drawings` table with Row Level Security (anyone can read recent visible drawings and publish one for today; nobody can edit or delete through the public key). (2) Remembering which lobby codes exist: a `lobbies` table nobody can touch directly, plus two functions the public key may call, `create_lobby()` and `lobby_exists(code)`. The drawings part was run against Kevin's real project and he reported that publishing and the public gallery work; the daily wipe is deployed and scheduled (see below). The lobby part and the Daily Scrawl mode are in `updates/001-...`; Kevin reported they were run and tested on the live project (not observed by the session that wrote them).
- `supabase/updates/`: numbered files with only the changes a project that already exists needs, run once each, in order. `001-lobbies-and-daily-scrawl.sql` adds the `lobbies` table and functions, allows the `scrawl` drawing mode, and schedules a daily cleanup of old lobby codes. It was tested against a real Postgres (PGlite) on top of the old schema, and runs twice without error. `002-votes.sql` (Trenten, 2026-11-05) adds thumbs up/down votes: a `votes` table nobody can touch directly (votes are deleted with their drawing, so the daily wipe clears them too), and two functions the public key may call, `cast_vote(target_drawing, voter, vote)` and `vote_counts(drawing_ids, voter)`. Tested against a real Postgres (PGlite) on top of the original schema plus `001`, run twice without error, with votes cast as the public role (see `log.md` entry 35). **Run on Kevin's project on 2026-11-05, before the voting frontend reached `main`** (reported by Kevin, not observed in a session: he ran it in the SQL Editor, the check queries gave the expected results, and voting works on the deployed site). `003-reports.sql` adds reporting: a `reports` table with Row Level Security and no policies, and one function the public key may call, `report_drawing(target_drawing, reporter)`, which hides a drawing once 3 different players have reported it. Tested against PGlite on top of the current schema and run twice, and as part of a fresh `schema.sql` (see `log.md` entry 47). **Not run yet on Kevin's project.** `004-daily-scrawl.sql` (Angie, 2026-11-06) allows the new drawing mode `daily` (Daily Scrawl, the merged Basic + Detailed) in the mode constraint and the insert policy, keeping `basic`, `detailed` and `scrawl`; see `log.md` entry 56. **Not run yet on Kevin's project, and not tested against a Postgres:** it only changes the allowed values, in the same two statements as `001`. Keep `schema.sql` in step with the updates, so a fresh project needs no updates.
- Who is *in* a lobby and every message a game sends are not stored anywhere. That's Supabase Realtime (presence and broadcast), handled by `../frontend/lobby.js`. See "Lobbies and adding a multiplayer game" in `../CLAUDE.md`.
- `supabase/functions/purge-old-drawings/index.ts`: the daily wipe, an Edge Function. Deletes old drawings' files from the `drawings` bucket and their rows. Its date and folder logic is tested in `../tests/purge.test.js`. It is deployed on Kevin's project, and a dry run through the schedule's own call returned 200; Kevin reported a real run also deleted a test file and row. No scheduled run has been observed yet. The file in this repo now cleans every mode folder under a day (so Daily Scrawl's `scrawl` folder is cleaned too), where the first deployed copy only knew `basic` and `detailed`. It has to be redeployed after any change to this file: paste it over the old code in the dashboard editor, then check the Settings tab still has "Verify JWT with legacy secret" off. Kevin reported redeploying it before this was pushed (not observed).
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

## Applying an update to the live project

Which updates are still waiting is listed under "Pending database updates" at the top of `../CLAUDE.md`, with the steps for each. For each file in `supabase/updates/` that hasn't been run yet, in number order:

1. Open the file, read it, and paste the whole thing into the SQL Editor. Run it once. (Every update is written so a second run doesn't fail, but there's no reason to.)
2. For `001`: if publishing a Daily Scrawl is still refused afterwards, the old mode constraint has a different name than the file assumes. The comment at the top of the file has the query that finds it.
3. Redeploy the Edge Function if its file changed (see above).
4. Check it from the app: Create Lobby should open a lobby whose invite link ends in `/?` and a 5-letter code; open that link in a second window and both should list two players.
5. For `002`: publish a drawing in one window, open today's gallery in a private window, and give it a thumbs up. The first window's gallery should then say "You won!" on your own card. If the gallery shows no vote buttons, the browser console has the raw error from `vote_counts`.
6. For `003`: publish a test drawing, then open today's gallery in three different private windows and press Report on it in each. After the third, it should disappear from the gallery. To bring it back, set `hidden` to false on its row in the `drawings` table and delete its rows from `reports`.
7. For `004`: publish a Daily Scrawl drawing from the app. Before the update it is refused; after it, it succeeds and shows on the Public drawings page.

A teammate who needs a database change writes a new numbered file here (and updates `schema.sql` to match) and asks Kevin to run it.

## Known gaps in lobbies

- Anyone with the public key can call `create_lobby()` as often as they like. The rows are tiny and deleted after a day, so this costs little, but it isn't rate-limited.
- A lobby's code is its only privacy. Anyone who guesses or is told a code can join and read every message in it. The codes are 5 random consonants (3.2 million), so guessing a live one is unlikely but not impossible.
- The 8-player limit is enforced by the page, not by the server.

## Known gap: no moderation UI yet

There's no login system, so publishing a drawing isn't tied to a real person — anyone who finds the anon key (trivial, since it's meant to be public) could insert a row directly, bypassing the game entirely. The schema only restricts *what* can be inserted (today's date, a valid mode), not *who* inserts it. Until a report/hide button exists in the app, moderation means a teammate manually sets a row's `hidden` flag or deletes it from the Supabase dashboard.

Next real step: watch the first scheduled runs (the Edge Function's Logs tab after 10:00 UTC, and that old lobby codes disappear after 10:15 UTC).
