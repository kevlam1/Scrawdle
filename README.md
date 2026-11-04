# Scrawdle

A daily drawing game: a new prompt (or a few) each day, a browser canvas with drawing tools (pen, pencil, brush, eraser, paint bucket, lines), and a chance to see what other players drew once you finish your own. Built for artists and for anyone who wants a quick daily creative pastime.

TCSS 490 Artifact 4, built by a team of four: [kevlam1](https://github.com/kevlam1), [arcangieo](https://github.com/arcangieo), [trentenmuw](https://github.com/trentenmuw), [zainasuw](https://github.com/zainasuw).

**Live at [scrawdle.vercel.app](https://scrawdle.vercel.app)** (see Status for what is live).

## Status

**Built**
- Home screen with Basic, Detailed, and Free play, and a reveal screen that spins through parts from `frontend/prompts.json`.
- Daily parts: everyone playing on the same date gets the same ones, with no server needed. Free play gives random parts any time.
- Drawing tools: pen, pencil, line, eraser, paint bucket, and a brush with seven types (round, marker, calligraphy, crayon, watercolor, spray, dry bristle). 12 colors plus a custom color, and a size for each tool. The tools have illustrated icons, and the Brushes panel previews each brush.
- Undo and redo.
- Auto-save in the browser: today's drawing and a Free play drawing save separately and survive a refresh. Today's is cleared when the day changes, and Free play stays.
- Finish screen with a PNG download that includes the prompts and date.
- Replay: watch your drawing redraw itself stroke by stroke from the finish screen. It speeds up smoothly and takes about 2 to 4 seconds, however long the drawing took. It ends on an exact match of the drawing.
- Self-judged win: Accurate and Inaccurate buttons under the canvas show a verdict and lock the drawing until you start over. A refresh clears the verdict, because it isn't saved.
- A gallery of clearly labeled sample drawings, from the home and finish screens, until real drawings are connected (see the top of `frontend/gallery.js`).
- **Daily Scrawl** (written 2026-11-04): a free-draw mode with no parts. It saves in the browser and clears each day like the others, and publishes to the gallery. Needs `backend/supabase/updates/001-...` run on the live database before publishing works.
- **Lobbies** (written 2026-11-04): Create Lobby or join with a 5-letter code or a link like `scrawdle.vercel.app/?BCDFG`. A lobby room shows who's in it, with a host and up to 8 players, and has a small contract for games to plug into (`frontend/lobby.js`). There are no games in it yet.

Daily Scrawl and Lobbies were tested here (the logic, the SQL against a real Postgres, and the screens in a browser with a stand-in for Supabase's realtime service). Kevin reported testing them against the live Supabase project before pushing; that wasn't observed in the session that wrote them. They need `backend/supabase/updates/001-...` run and the cleanup function redeployed, or the Lobby card shows but Create Lobby fails.

**Not built yet**
- Confirmation that the daily wipe has run on its own. Publishing and the public gallery are connected to a real Supabase project, and the cleanup (`backend/supabase/functions/purge-old-drawings/index.ts`) is deployed and scheduled for 10:00 UTC daily (Kevin reported a real test run worked), but nobody has seen a scheduled run yet. Check the function's Logs tab after the first one. Setup notes are in `backend/README.md`.
- Reporting or hiding drawings, which a public gallery will need. For now, moderation is a teammate manually editing the database by hand (see `backend/README.md`).
- Replaying other players' drawings. Replay only works on your own for now.
- Any multiplayer game. The lobby is just the room; games (a Pictionary mode is on the team's list) register with it and sync players through its message helper.

**Live site:** it deploys from `main`, so it only shows what has been merged. A `vercel.json` was added to fix a 404 at `/`, and nobody has confirmed the fix after a deploy.

See `CLAUDE.md` for the project plan and `log.md` for the build log.

## Stack

- Frontend: plain HTML5 Canvas, no framework (proposed, not locked).
- Database: Supabase (decided, pending the rest of the team's sign-off).
- Hosting: Vercel.

## Running locally

There's no build step:

- Serve the frontend folder (opening `index.html` straight from disk won't work, because the page loads `prompts.json` with `fetch`): from the repo root, run `npx serve frontend` (or `python -m http.server 8000 --directory frontend`), then open the printed address.
- You should see the Basic / Detailed start screen. Pick one to spin the slot machine, then draw on the canvas with a mouse, finger, or stylus.
- Tests: `node --test tests/drawing.test.js tests/brush-width.test.js tests/purge.test.js tests/lobby.test.js` (`purge` covers the daily-wipe logic with a fake Supabase client; `lobby` covers code parsing, host choice, and names).
- To try a lobby, open the page in two windows (one normal, one private) and join the same code. It needs the Supabase update in `backend/README.md` to have been run.

There's nothing to install. `frontend/supabase-config.js` holds the real project's URL and publishable key (a plain committed JS file, not a `.env`, because there's no build step; see `backend/README.md` for why that's safe). **That means a local copy publishes to the same real Supabase project as the live site**, so test drawings you publish while developing show up in the real gallery until the daily wipe removes them. To work without publishing, temporarily empty the two values in `supabase-config.js` (the Publish button and real gallery then stay hidden), and don't commit that change.
