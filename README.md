# Scrawdle

A daily drawing game: a new prompt (or a few) each day, a browser canvas with drawing tools (pen, pencil, brush, eraser, paint bucket, lines), and a chance to see what other players drew once you finish your own. Built for artists and for anyone who wants a quick daily creative pastime.

TCSS 490 Artifact 4, built by a team of three: [kevlam1](https://github.com/kevlam1), [arcangieo](https://github.com/arcangieo), [trentenmuw](https://github.com/trentenmuw).

**Live at [scrawdle.vercel.app](https://scrawdle.vercel.app)** (currently shows only the placeholder canvas — see Status).

## Status

Still in planning — `frontend/` and `backend/` currently hold placeholder scaffolding only, not the real app. The live URL was 404'ing at `/` as of 2026-10-31 because the repo had no top-level `index.html`; a `vercel.json` was added to point Vercel at `frontend/`, not yet confirmed live after redeploy. See `CLAUDE.md` for the project plan and `log.md` for the build log.

## Stack

- Frontend: plain HTML5 Canvas, no framework (proposed, not locked).
- Database: Supabase (decided, pending the rest of the team's sign-off).
- Hosting: Vercel.

## Running locally

There's no build step and no backend connection yet, so there's just the one placeholder page:

- Open `frontend/index.html` directly in a browser (double-click it, or drag it into a browser window). You should see a canvas you can draw a single line on with a mouse or touch.
- Or serve it so it behaves more like the real site will once there's a backend: from the repo root, `npx serve frontend` (or `python -m http.server 8000 --directory frontend`), then open the printed address.

There's nothing to install and no `.env` needed yet — `backend/supabase/schema.sql` hasn't been run against a real Supabase project, so there's no database to connect to. Once that exists, this section will need real setup steps (copying `.env.example` to `.env`, filling in Supabase keys).
