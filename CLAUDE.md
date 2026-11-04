# CLAUDE.md: Scrawdle (TCSS 490 Artifact 4, "For Someone Else")

Read this file first. It is shared by four people's Claude sessions (GitHub: `kevlam1`, `arcangieo`, `trentenmuw`, `zainasuw`), so your agents do not talk to each other — this file is how they stay on the same plan. Kevin's personal workflow preferences live in `../CLAUDE.md` (not part of this repo, not binding on teammates).

## What this is
- Artifact 4 of TCSS 490: a team of four building something for people outside the team. Due **Sunday, November 8, 2026 at 11:59 PM** on Canvas. Portfolio status check at end of Week 4 (Sunday, November 1).
- Idea, from the team's own pitch (`../Unit 4/Artifact 4_ Scrawdle.pdf`): a daily drawing game like Wordle or NYT's minigames.
  - Browser-based. New prompts appear once a day at a fixed time, 5-10 prompts per day, drawn from categories (exact prompt format still undecided — see Open questions in the source PDF: either a few related choices per round, e.g. [Cat ears][Bear ears][Human ears], or one fixed prompt per round).
  - Tools: pen, pencil, brush, eraser, paint bucket, lines.
  - A player can export their finished drawing (the export includes that day's prompts and the date).
  - After finishing, a player can see what other players drew for that day's prompts.
  - Drawings are stored only for the current day, then sanitized (wiped) — keeps the database small and keeps the game "daily."
  - UI reference is doodle-heavy, closer to skribbl.io's drawing screen than a polished app.
- Who it's for: the team's own framing is artists first, and the general public as a casual daily pastime — broader than the assignment's example shapes (a club, a relative's business, an open-source PR). That's a deliberate scope call by the team, not mine to second-guess, but it means "hand it over" at the end will mean putting it in front of real outside users/testers rather than one named person — worth the team confirming that's the plan.

## Team roles
**Partly assigned, per the group chat on 2026-11-01 and the updated plan doc read 2026-11-04:** Kevin owns Supabase, publishing, and (per the plan doc's "Things to do this week") multiplayer lobbies and syncing player actions — the last two are a separate, bigger feature from publishing and not started. Zainab has built the drawing side (`frontend/drawing.js`: tools, undo, auto-save, finish screen) plus icons and the current look; her week's list also has more tool/color work. Angie built the start screen, slot machine, and daily parts; her week's list is UI updates, one-prompt-at-a-time, and category names. Trenten built the self-judged win condition; his week's list is an AI judge, "AI versus," removing the "New set" button, and a Pictionary mode. "Anybody" items in the plan doc: light/dark settings, a full showcase page, a home-page navigation bug, font choices, a "daily draw: draw anything" mode, and a colorblind color tooltip — unclaimed.

Before building past this, the four of you should agree on anything that still overlaps:
- The daily prompt system (built, in `frontend/daily.js`/`prompts.json`) vs. backend/database (Kevin's; see Stack)
- Hosting, deploy

Once fully settled, replace this section with the final split and a date, so every agent reads the same ownership and doesn't duplicate or collide with someone else's part.

## Branch and merge workflow
**Not agreed yet.** Proposed, pending the team's actual agreement — do not treat this as settled:
- Feature branches off `main`, one feature per branch.
- Open a pull request before merging; at least one other teammate looks at it first.
- `main` is the branch that gets deployed.

Replace this with whatever the four of you actually agree on.

## Stack
**Database: Supabase — now a team decision, not just Kevin's.** The updated plan doc (`../Unit 4/Artifact 4_ Scrawdle.pdf`, read 2026-11-04) crosses out Firebase under "Database considerations," so this is settled.
- No framework mandated by the idea doc. Built: plain HTML5 Canvas with vanilla JS, no UI framework — matches the doodle-heavy, low-chrome UI the idea doc asked for.
- Database: **Supabase**, over Firebase, for a specific reason tied to the daily-wipe requirement, not just a general preference (checked 2026-10-29, third-party sources only — confirm against Supabase's and Firebase's own docs before relying on this further):
  - Scrawdle needs a scheduled job that wipes the day's drawings. Supabase's free tier ships Postgres's `pg_cron` extension, so that's a plain scheduled SQL job, no billing account required ([rapidevelopers.com](https://www.rapidevelopers.com/md/supabase-tutorial/how-to-schedule-cron-jobs-with-supabase)).
  - Firebase's equivalent (a scheduled Cloud Function) needs the **Blaze** (pay-as-you-go) plan just to deploy — the free Spark plan can't deploy a scheduled function at all, even if usage would stay inside the free quota ([crontap.com](https://crontap.com/blog/firebase-scheduled-functions-without-blaze), [cronic.pages.dev](https://cronic.pages.dev/blog/scheduling-firebase-functions-without-cloud-scheduler/)).
  - Caveat: free Supabase projects pause after about a week of inactivity, so it needs a periodic ping or steady use during the term ([runhooks.app](https://runhooks.app/blog/preventing-supabase-free-tier-pausing/)).
  - **Scope, decided 2026-11-04:** Supabase only stores finished drawings for the daily gallery (`backend/supabase/schema.sql`, a real schema now, not a draft — run against Kevin's real project on 2026-11-04; the daily wipe that deletes old drawings is deployed and scheduled, see Status). It does **not** store prompts — those stay in `frontend/prompts.json`, a plain committed file, specifically so any teammate can edit the prompt pool without needing access to Kevin's Supabase project. Multiplayer lobbies and syncing player actions (also on Kevin's list in the plan doc) are a separate, bigger feature than the daily gallery and are not built yet.
  - **Keys:** the anon/public key (used in `frontend/supabase-config.js`) is meant to be public in browser code — it is not the same kind of secret the "no secrets in the repo" rule below is about, as long as Row Level Security is configured (it is, in `schema.sql`). The `service_role` key bypasses RLS entirely and must never appear anywhere in this repo. See `backend/README.md`.
  - **Known gap:** there's no login system, so anyone who has the anon key (trivially easy, since it's meant to be public) could insert a row directly, bypassing the game. `schema.sql`'s policies restrict *what* can be inserted, not *who*. There's no report/hide button in the app yet, so moderation means a teammate manually edits the database by hand.
- Hosting: Vercel (already specified in the idea doc). Live at **https://scrawdle.vercel.app**. **Once a card links to this URL, never move or rename it** (same rule as the other artifacts). Checked 2026-10-31: the deployed page 404'd at `/` because the repo has no top-level `index.html` and the real page is under `frontend/`; added `vercel.json` (`"outputDirectory": "frontend"`) to fix it. Not yet re-checked live after that push — whoever owns hosting should confirm `/` loads after the next deploy, and check whether the Vercel dashboard's own "Root Directory" project setting also needs to point at `frontend` (I can't see or change Vercel dashboard settings from here).
- Local caching: browser storage (IndexedDB), built in `frontend/drawing.js` — today's drawing and a Free play drawing save separately and survive a refresh.

## Shared rules (all four agents should follow)
- No secrets, keys, or API tokens in the repo — it's public. Use environment variables and a gitignored `.env`. **Exception:** Supabase's anon/public key is meant to be shipped in browser code and is not a secret — see the Stack section's "Keys" note and `backend/README.md`. The `service_role` key is the one that must never appear anywhere here.
- No new dependency without checking with your teammates first and noting it in `log.md`.
- Keep `log.md` updated in the repo: what was planned, what changed, and why — this is required by the assignment, not optional.
- New file names lowercase (`log.md`, not `LOG.md`); `CLAUDE.md` and `README.md` keep their standard names.
- Before using any API field, file format, or library feature, print the raw data or docs and show your teammate/session user — don't build on an assumption.

## The log protocol
- `log.md` is required by the assignment (a shared record of what was planned and what changed) and is shared by all four of us, so **add to it on your own, without being asked, right after any real decision, build step, or correction** — not only when the session user says "update the log." A real decision/change is: a stack or tooling choice, a feature built or dropped, a bug found and fixed, a plan the team agreed on, or a correction to something said earlier in this file or in the log.
- Write in the voice of whichever of us is in the session (first person, "I"), matching the existing entries' tone and level of detail. Say what you added so it can be reviewed in the diff.
- **Name every numbered entry's heading with whoever's session actually wrote it:** `## N. Title (YYYY-MM-DD) — Name`. "Name" is whoever the "I" in that entry is, not whoever happens to run the commit that adds it to `main` — those are often different people. Entry 22 is the example that taught us this: it's written in Trenten's voice ("(Trenten) I want..."), but it reached `main` inside Zainab's merge commit, so `git blame` alone would call it hers. If you're merging someone else's branch and their log entries come along, keep their name on their entries and only put your own name on entries that are actually yours.
- `git blame log.md` (or `git log -p -- log.md`) can help reconstruct who wrote what if the name ever goes missing or is in doubt, since each of us commits under our own GitHub identity — but it's a fallback, not the source of truth, for the reason above. Trust the entry's own name first.
- Never rewrite or delete a past entry without asking first. If a past entry turns out to be wrong, add a new entry (or a line in "Where AI misread me") that corrects it — don't edit history.
- List the agent's own mistakes in the log too, not just the user's corrections. Do not claim something was tested or checked if it wasn't.
- Structure, copied from `../midi-companion/log.md` (the model for this course) so a `/logs/` page script can read it later if the team wants one: a title and tool/host/stack line, then `## What I set out to build`, then numbered `## N. Title (YYYY-MM-DD) — Name` sections with bold labels (`**What I asked for**`, `**What changed**`, `**What I checked**`, `**Decisions**`), then two closing sections, `## Where AI misread me, or I had to correct course` and `## Decisions and abandoned ideas`. No other `##` headings — a page-generator script looks for exactly these.

## Status
- 2026-10-29: `frontend/` and `backend/` scaffolded as placeholders, at Kevin's request, matching the proposed stack above. `frontend/index.html` is a bare canvas you can draw a single line on with a mouse or touch — no prompts, no tools, no backend connection. `backend/supabase/schema.sql` is a draft schema (`daily_prompts`, `drawings`) and a commented-out `pg_cron` daily-wipe job — not run against any real database, since no Supabase project exists yet. `.env.example` and `.gitignore` added for the Supabase keys the frontend will eventually need. None of this is final; it exists so there's something to build on top of or replace once roles and the stack are actually confirmed by all four of us.
- `log.md` exists (see "The log protocol" above). Branch workflow is still open, as noted above.
- 2026-11-01: drawing tools, brush types, undo, auto-save, and the finish screen are built on the `zainab` branch. See `log.md` entry 14 and the README's Status section. The canvas is no longer a placeholder once that branch is merged.
- 2026-11-01: daily parts (`frontend/daily.js`), Free play, and the post-finish gallery with labeled sample doodles (`frontend/gallery.js`) are also on the `zainab` branch. See `log.md` entry 16. Angie: this changes how the slot machine's result is picked, so please review it.
- 2026-11-02: the `zainab` branch merged into `main`, with Trenten's self-judged win condition moved onto the new drawing board. See `log.md` entry 23.
- 2026-11-02: new look for the whole game, keeping Basic, Detailed, Free play, and the win condition. See `log.md` entry 25.
- 2026-11-04: the real Supabase schema (`backend/supabase/schema.sql`), the frontend glue (`frontend/supabase-config.js`, `frontend/publish.js`), and the `supabase-js` CDN script tag in `index.html` are written, wired to the `window.scrawdlePublish`/`window.scrawdleGallery` hooks Zainab built into `drawing.js`/`gallery.js`. **None of it is connected yet** — `supabase-config.js` has empty placeholders, so the Publish button and real gallery stay hidden. Kevin still needs to: create the Supabase project, run `schema.sql`, fill in `supabase-config.js`, and check the flow end to end. One unverified detail in `publish.js`: the exact property name on `getPublicUrl()`'s return value couldn't be confirmed against Supabase's own docs (the reference page's examples don't show it) — check the console the first time a real gallery call runs.

- 2026-11-04 (later): Kevin created the real Supabase project, ran `schema.sql`, made the `drawings` bucket, and filled in `frontend/supabase-config.js`; he reported that publishing saves and the gallery shows the drawing publicly (reported by Kevin, not observed in this repo's sessions). **The daily wipe is deployed and scheduled** (`backend/supabase/functions/purge-old-drawings/index.ts`, called daily at 10:00 UTC by `pg_cron`; date and folder logic tested in `tests/purge.test.js`). What was observed in a session: a dry run through the same `pg_net` call the schedule makes returned 200 with `"dryRun":true` and no old files (a screenshot Kevin sent). What Kevin reported, not observed: a real run deleted a test file and row he made under an old date, and he replaced the `CRON_SECRET` after it appeared in a screenshot, then re-ran the dry run. Not yet seen: the first scheduled run at 10:00 UTC (check the function's Logs tab). The function's "Verify JWT" setting must stay **off** (Settings tab); its own `CRON_SECRET` check is the only guard. Also fixed: the schema compared days to the database's UTC date, which would have broken publishing every evening in US time (see `log.md` entries 27 and 28).

## Open questions
- Team roles: partly assigned (see Team roles above).
- Branch/merge convention: proposed above, not yet agreed.
- Whether "for artists and the general public" needs narrowing to fit the assignment's "someone who is not on your team" framing, or whether the team is treating the general public itself as that audience.
- Whether the plan doc's "Win Condition" section (AI and/or human interpretation of a drawing, replacing the current self-judged Accurate/Inaccurate) replaces or sits alongside what Trenten already built — his week's list has "AI judge" as new work, so this reads as planned, not yet reconciled with what's live.
