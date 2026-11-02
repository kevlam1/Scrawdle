# Scrawdle

A daily drawing game: a new prompt (or a few) each day, a browser canvas with drawing tools (pen, pencil, brush, eraser, paint bucket, lines), and a chance to see what other players drew once you finish your own. Built for artists and for anyone who wants a quick daily creative pastime.

TCSS 490 Artifact 4, built by a team of four: [kevlam1](https://github.com/kevlam1), [arcangieo](https://github.com/arcangieo), [trentenmuw](https://github.com/trentenmuw), [zainasuw](https://github.com/zainasuw).

**Live at [scrawdle.vercel.app](https://scrawdle.vercel.app)** (see Status for what is live).

## Status

**Built**
- Start screen with Basic and Detailed modes, and the slot machine that spins through parts from `frontend/prompts.json`.
- Daily parts: everyone playing on the same date gets the same ones, with no server needed. Free play gives random parts any time.
- Drawing tools: pen, pencil, line, eraser, paint bucket, and a brush with seven types (round, marker, calligraphy, crayon, watercolor, spray, dry bristle). Colors and a size for each tool.
- Undo and redo.
- Auto-save in the browser: a drawing and its prompts survive a refresh, and are cleared when the day changes.
- Finish screen with a PNG download that includes the prompts and date.
- Gallery after you finish, showing clearly labeled sample doodles until real drawings are connected (see the top of `frontend/gallery.js`).

**Not built yet**
- Publishing, and real players' drawings in the gallery. The Publish button stays off until publishing is connected (see the top of `frontend/drawing.js`).
- Reporting or hiding drawings, which a public gallery will need.
- The database. `backend/supabase/schema.sql` is a draft and hasn't been run against a real Supabase project.

**Live site:** it deploys from `main`, so it only shows what has been merged. A `vercel.json` was added to fix a 404 at `/`, and nobody has confirmed the fix after a deploy.

See `CLAUDE.md` for the project plan and `log.md` for the build log.

## Stack

- Frontend: plain HTML5 Canvas, no framework (proposed, not locked).
- Database: Supabase (decided, pending the rest of the team's sign-off).
- Hosting: Vercel.

## Running locally

There's no build step and no backend connection yet:

- Serve the frontend folder (opening `index.html` straight from disk won't work, because the page loads `prompts.json` with `fetch`): from the repo root, run `npx serve frontend` (or `python -m http.server 8000 --directory frontend`), then open the printed address.
- You should see the Basic / Detailed start screen. Pick one to spin the slot machine, then draw on the canvas with a mouse, finger, or stylus.
- Tests for the paint bucket, undo, and daily parts: `node --test tests/drawing.test.js`

There's nothing to install and no `.env` needed yet — `backend/supabase/schema.sql` hasn't been run against a real Supabase project, so there's no database to connect to. Once that exists, this section will need real setup steps (copying `.env.example` to `.env`, filling in Supabase keys).
