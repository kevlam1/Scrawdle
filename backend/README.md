# backend

Supabase is the team's decided database (see `../CLAUDE.md`; Firebase is crossed out in the team's own plan doc as of 2026-11-04). Supabase is a managed Postgres service, so there's no server process to run here — this folder holds the database schema as SQL.

**Nothing is connected yet.** No Supabase project has been created, so there are no real keys and nothing has been tested against a live database. Kevin owns this part and the project will live on his machine.

- `supabase/schema.sql`: the real schema for the one job Supabase actually does right now — storing finished drawings so they can be shown in the gallery. A `drawings` table, Row Level Security policies (anyone can read today's visible drawings and publish one; nobody can edit or delete through the public key), and a commented-out daily job to hide old drawings. Not yet run against a real database.
- Prompts are **not** stored here on purpose — they stay in `../frontend/prompts.json` so any teammate can edit them by committing a file, with no Supabase access needed, since Supabase will only be set up on Kevin's machine.
- `../frontend/supabase-config.js` and `../frontend/publish.js`: the frontend side that actually calls Supabase (upload a drawing, insert its row, read today's drawings back for the gallery). See `../frontend/README.md`.

## Keys: what's actually secret

Supabase gives two different keys, and only one of them is a secret:
- The **anon / public key** is meant to be shipped in browser code. It goes in `../frontend/supabase-config.js`, which is safe to commit once filled in. Row Level Security (the policies in `schema.sql`) is what actually limits what it can do — without RLS, this key could read or write anything.
- The **service_role key** bypasses Row Level Security entirely and must never appear in `supabase-config.js`, any committed file, or anywhere in the frontend. It's only for trusted server-side use, which this project doesn't have yet.

## Known gap: no moderation UI yet

There's no login system, so publishing a drawing isn't tied to a real person — anyone who finds the anon key (trivial, since it's meant to be public) could insert a row directly, bypassing the game entirely. The schema only restricts *what* can be inserted (today's date, a valid mode), not *who* inserts it. Until a report/hide button exists in the app, moderation means a teammate manually sets a row's `hidden` flag or deletes it from the Supabase dashboard.

Next real step: Kevin creates the actual Supabase project, runs `schema.sql`, fills in `../frontend/supabase-config.js`, and checks the publish/gallery flow end to end.
