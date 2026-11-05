# Scrawdle

A daily drawing game. Every day everyone gets the same set of animal parts (Basic or Detailed) to combine into a creature, or can just draw anything in Daily Free Play. Players draw in the browser, can replay and download their drawing, publish it, and see what other players drew that day. Friends can also meet in private lobbies with a 5-letter code. Built for artists and for anyone who wants a quick daily creative pastime.

TCSS 490 Artifact 4, built by a team of four: [kevlam1](https://github.com/kevlam1), [arcangieo](https://github.com/arcangieo), [trentenmuw](https://github.com/trentenmuw), [zainasuw](https://github.com/zainasuw).

**Live at [scrawdle.vercel.app](https://scrawdle.vercel.app).** The build log is a page at `scrawdle.vercel.app/logs` (every entry of `log.md`, with who wrote it and a one-sentence summary), linked from the bottom of the game's home screen ("Read our build log"). It goes live with the first deploy that includes `frontend/logs/`; once it does, check that `/logs` loads without a trailing slash.

## Status

**Checked on the live site (2026-11-04, with `curl`):** `scrawdle.vercel.app/` loads (the earlier 404 at the root is fixed by `vercel.json`), and the deployed `lobby.js` is byte-for-byte the one in this repo, so the latest push deployed.

**Built**
- **Home screen** with Basic, Detailed, Daily Free Play, Free play, and Lobby, and a reveal screen that spins through parts from `frontend/prompts.json`.
- **Daily parts:** everyone playing on the same date gets the same ones, with no server needed. Free play gives random parts any time.
- **Drawing tools:** pen, pencil, line, eraser, paint bucket, and a brush with seven types (round, marker, calligraphy, crayon, watercolor, spray, dry bristle). 12 colors plus a custom color, a size for each tool, illustrated tool icons, a Brushes panel that previews each brush, and undo and redo.
- **Auto-save in the browser:** Basic/Detailed (one drawing a day), Daily Free Play, and Free play each save separately and survive a refresh. The first two clear when the day changes; Free play stays.
- **Finish screen** with a PNG download that includes the prompts and date, and **Replay**, which redraws the drawing stroke by stroke in about 2 to 4 seconds, ending on an exact match.
- **Self-judged win** for Basic and Detailed: Accurate and Inaccurate buttons show a verdict and lock the drawing until you start over. The verdict isn't saved, so a refresh clears it.
- **Daily Free Play:** (internal mode id `scrawl`; the name "Daily Scrawl" is saved for the planned Basic + Detailed merge, see `CLAUDE.md`) a free draw with no parts, no slot machine, and no judge buttons. It has its own save slot and publishes to the gallery like the others.
- **Publishing and the gallery:** a finished drawing can be published to Supabase and shown to other players that day (`frontend/publish.js`). A separate gallery of clearly labeled sample drawings opens from the home screen.
- **Daily wipe:** old drawings' files and rows are deleted by a scheduled Supabase function at 10:00 UTC every day; lobby codes older than a day are deleted too (`backend/README.md`).
- **Lobbies:** Create Lobby, or join with a 5-letter code or a link like `scrawdle.vercel.app/?BCDFG`. A lobby room shows who's in it, with a host and up to 8 players, and has a small contract for games to plug into (`frontend/lobby.js`). There are no games in it yet.
- **Build-log page** at `/logs`, generated from `log.md` (see Running locally): entries grouped by day, each opening to its full text, with the author's name, a Contents menu, and Expand all / Collapse all. Checked in a browser at desktop and phone width.

**Reported by Kevin, not observed in a session:** that publishing and the public gallery work against the live Supabase project; that the database update for lobbies and Daily Scrawl (`backend/supabase/updates/001-...`) was run and the cleanup function redeployed; and that lobbies and Daily Scrawl were tested live. The logic, the SQL (against a real Postgres), and the screens (in a browser, with a stand-in for Supabase's realtime service) were tested in the sessions that wrote them. Two details only a live run can confirm: the shape of a broadcast message, and how a repeated name change updates presence. If a lobby message or a rename doesn't reach the other window, check those first.

**Not built or not confirmed yet**
- **The first scheduled daily wipe.** It's deployed and a manual test run was reported to work, but nobody has seen a scheduled run. Check the function's Logs tab after 10:00 UTC.
- **Reporting or hiding drawings,** which a public gallery will need. Moderation is a teammate editing the database by hand (see `backend/README.md`).
- **Replaying other players' drawings.** Replay only works on your own.
- **Any multiplayer game.** The lobby is just the room; games register with it and sync players through its message helper.
- **Items on the team's plan doc** (read 2026-11-04) that aren't in `main` as far as this README knows: an AI judge, "AI versus", a Pictionary mode, light and dark settings, a showcase page of every player's drawings, and a tooltip naming each color. Teammates may have some in progress on their own branches.

See `CLAUDE.md` for the project plan and the rules for working in this repo, and `log.md` (or `/logs`) for the build log.

## Stack

- **Frontend:** plain HTML5 Canvas and vanilla JavaScript, no framework and no build step. The parts to draw are in `frontend/prompts.json`, a plain file anyone can edit, not in the database.
- **Backend:** Supabase on the free plan: Postgres and Storage for drawings and lobby codes, Realtime for lobbies, and an Edge Function with `pg_cron` for the daily wipe. The team chose it over Firebase because its free plan can run the scheduled wipe. There's no login: the public key is safe in the page because Row Level Security limits what it can do (see `backend/README.md`).
- **Hosting:** Vercel, serving the `frontend/` folder (`vercel.json`). Every push to `main` deploys.
- **Build log:** a small Node script generates `frontend/logs/index.html` from `log.md`.

## Running locally

There's no build step:

- Serve the frontend folder (opening `index.html` straight from disk won't work, because the page loads `prompts.json` with `fetch`): from the repo root, run `npx serve frontend` (or `python -m http.server 8000 --directory frontend`), then open the printed address.
- You should see the home screen with Basic, Detailed, Daily Free Play, Free play, and Lobby. Pick Basic or Detailed to spin the slot machine, then draw on the canvas with a mouse, finger, or stylus.
- Tests: `node --test tests/drawing.test.js tests/brush-width.test.js tests/purge.test.js tests/lobby.test.js tests/logs-page.test.js` (`purge` covers the daily-wipe logic with a fake Supabase client; `lobby` covers code parsing, host choice, and names; `logs-page` fails if `frontend/logs/index.html` is out of date with `log.md`).
- The logs page is generated: after editing `log.md`, add a summary for any new entry to `scripts/log-summaries.mjs` and run `node scripts/make-logs-page.mjs`.
- To try a lobby, open the page in two windows (one normal, one private) and join the same code. It needs the lobby update in `backend/supabase/updates/` to have been run on the Supabase project (it was, on Kevin's).

There's nothing to install. `frontend/supabase-config.js` holds the real project's URL and publishable key (a plain committed JS file, not a `.env`, because there's no build step; see `backend/README.md` for why that's safe). **That means a local copy publishes to the same real Supabase project as the live site**, so test drawings and lobbies you create while developing show up there until the daily jobs remove them. To work without publishing, temporarily empty the two values in `supabase-config.js` (the Publish button, real gallery, and Lobby card then stay hidden), and don't commit that change.
