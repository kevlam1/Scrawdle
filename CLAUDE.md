# CLAUDE.md: Scrawdle (TCSS 490 Artifact 4, "For Someone Else")

Read this file first. It is shared by three people's Claude sessions (GitHub: `kevlam1`, `arcangieo`, `trentenmuw`), so your agents do not talk to each other — this file is how they stay on the same plan. Kevin's personal workflow preferences live in `../CLAUDE.md` (not part of this repo, not binding on teammates).

## What this is
- Artifact 4 of TCSS 490: a team of three building something for people outside the team. Due **Sunday, November 8, 2026 at 11:59 PM** on Canvas. Portfolio status check at end of Week 4 (Sunday, November 1).
- Idea, from the team's own pitch (`../Unit 4/Artifact 4_ Scrawdle.pdf`): a daily drawing game like Wordle or NYT's minigames.
  - Browser-based. New prompts appear once a day at a fixed time, 5-10 prompts per day, drawn from categories (exact prompt format still undecided — see Open questions in the source PDF: either a few related choices per round, e.g. [Cat ears][Bear ears][Human ears], or one fixed prompt per round).
  - Tools: pen, pencil, brush, eraser, paint bucket, lines.
  - A player can export their finished drawing (the export includes that day's prompts and the date).
  - After finishing, a player can see what other players drew for that day's prompts.
  - Drawings are stored only for the current day, then sanitized (wiped) — keeps the database small and keeps the game "daily."
  - UI reference is doodle-heavy, closer to skribbl.io's drawing screen than a polished app.
- Who it's for: the team's own framing is artists first, and the general public as a casual daily pastime — broader than the assignment's example shapes (a club, a relative's business, an open-source PR). That's a deliberate scope call by the team, not mine to second-guess, but it means "hand it over" at the end will mean putting it in front of real outside users/testers rather than one named person — worth the team confirming that's the plan.

## Team roles
**Not assigned yet.** Nobody owns a part of the codebase yet. Before building past a shared skeleton, the three of you should agree (in person or on Discord) who owns:
- The drawing canvas and tools (pen/pencil/brush/eraser/bucket/lines, undo, export)
- The daily prompt system and backend/database (today's prompts, storing today's drawings, the daily sanitize/reset)
- Hosting, deploy, and the "see other players' drawings" gallery view

Once decided, replace this section with the actual split and a date, so every agent reads the same ownership and doesn't duplicate or collide with someone else's part.

## Branch and merge workflow
**Not agreed yet.** Proposed, pending the team's actual agreement — do not treat this as settled:
- Feature branches off `main`, one feature per branch.
- Open a pull request before merging; at least one other teammate looks at it first.
- `main` is the branch that gets deployed.

Replace this with whatever the three of you actually agree on.

## Stack
**Database decided (Kevin, 2026-10-29): Supabase.** The rest is still open. Proposal below for what isn't locked yet:
- No framework mandated by the idea doc. Proposed: plain HTML5 Canvas with vanilla JS/TS, no UI framework — matches the doodle-heavy, low-chrome UI shown in the reference screenshots, and avoids pulling in a new dependency before the team agrees it's needed.
- Database: **Supabase**, over Firebase, for a specific reason tied to the daily-wipe requirement, not just a general preference (checked 2026-10-29, third-party sources only — confirm against Supabase's and Firebase's own docs before building against it):
  - Scrawdle needs a scheduled job that wipes the day's drawings. Supabase's free tier ships Postgres's `pg_cron` extension, so that's a plain scheduled SQL job, no billing account required ([rapidevelopers.com](https://www.rapidevelopers.com/md/supabase-tutorial/how-to-schedule-cron-jobs-with-supabase)).
  - Firebase's equivalent (a scheduled Cloud Function) needs the **Blaze** (pay-as-you-go) plan just to deploy — the free Spark plan can't deploy a scheduled function at all, even if usage would stay inside the free quota ([crontap.com](https://crontap.com/blog/firebase-scheduled-functions-without-blaze), [cronic.pages.dev](https://cronic.pages.dev/blog/scheduling-firebase-functions-without-cloud-scheduler/)).
  - Supabase also gives real-time subscriptions on a Postgres table for free, which fits "show other players' drawings after they finish."
  - Caveat: free Supabase projects pause after about a week of inactivity, so it needs a periodic ping or steady use during the term ([runhooks.app](https://runhooks.app/blog/preventing-supabase-free-tier-pausing/)).
  - **Kevin decided this in his own session on 2026-10-29. Angie and Trenten have not weighed in yet** — if either of you has a reason to prefer Firebase, raise it before real backend code is built against Supabase.
- Hosting: Vercel (already specified in the idea doc).
- Local caching: browser storage (e.g. `localStorage`/IndexedDB) so a player can keep today's drawing before the daily database reset, per the idea doc.

## Shared rules (all three agents should follow)
- No secrets, keys, or API tokens in the repo — it's public. Use environment variables and a gitignored `.env`.
- No new dependency without checking with your teammates first and noting it in `log.md`.
- Keep `log.md` updated in the repo: what was planned, what changed, and why — this is required by the assignment, not optional.
- New file names lowercase (`log.md`, not `LOG.md`); `CLAUDE.md` and `README.md` keep their standard names.
- Before using any API field, file format, or library feature, print the raw data or docs and show your teammate/session user — don't build on an assumption.

## The log protocol
- `log.md` is required by the assignment (a shared record of what was planned and what changed) and is shared by all three of us, so **add to it on your own, without being asked, right after any real decision, build step, or correction** — not only when the session user says "update the log." A real decision/change is: a stack or tooling choice, a feature built or dropped, a bug found and fixed, a plan the team agreed on, or a correction to something said earlier in this file or in the log.
- Write in the voice of whichever of us is in the session (first person, "I"), matching the existing entries' tone and level of detail. Say what you added so it can be reviewed in the diff.
- Never rewrite or delete a past entry without asking first. If a past entry turns out to be wrong, add a new entry (or a line in "Where AI misread me") that corrects it — don't edit history.
- List the agent's own mistakes in the log too, not just the user's corrections. Do not claim something was tested or checked if it wasn't.
- Structure, copied from `../midi-companion/log.md` (the model for this course) so a `/logs/` page script can read it later if the team wants one: a title and tool/host/stack line, then `## What I set out to build`, then numbered `## N. Title (YYYY-MM-DD)` sections with bold labels (`**What I asked for**`, `**What changed**`, `**What I checked**`, `**Decisions**`), then two closing sections, `## Where AI misread me, or I had to correct course` and `## Decisions and abandoned ideas`. No other `##` headings — a page-generator script looks for exactly these.

## Status
- 2026-10-29: repo created, no real code yet — only test commits from setting up branches and permissions (`Test`, `Test 2`, merge tests, a placeholder `README.md` saying "temp"). `log.md` exists now (see "The log protocol" above). Team roles, stack, and branch workflow are all still open, as noted above.

## Open questions
- Team roles: unassigned.
- Database: Kevin picked Supabase (see Stack above); needs Angie and Trenten's sign-off since it's a team decision made solo. Whether any drawing/canvas library is used is still open too.
- Exact prompt format: a few related choices per round vs. one fixed prompt per round (see idea doc, "Undecided: Prompts").
- Branch/merge convention: proposed above, not yet agreed.
- Whether "for artists and the general public" needs narrowing to fit the assignment's "someone who is not on your team" framing, or whether the team is treating the general public itself as that audience.
