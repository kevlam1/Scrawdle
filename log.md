# Build log: Artifact 4 (Scrawdle)

**AI:** Claude Code | **Editor:** IntelliJ IDEA Ultimate | **Host:** not chosen yet (public repo `kevlam1/Scrawdle`, team of three: `kevlam1`, `arcangieo`, `trentenmuw`)
**Stack:** not locked yet — leaning Supabase for the database, plain HTML5 Canvas for drawing. See `CLAUDE.md`.

---

## What I set out to build

Artifact 4 is "For Someone Else," due Sunday, November 8. My team (me, Angie, Trenten) is building Scrawdle, a daily drawing game like Wordle or NYTimes' minigames: a prompt (or a few) each day, a browser canvas with drawing tools, and a chance to see what other players drew once you finish your own. We pitched it for artists and for the general public as a casual daily pastime. Nothing is built yet — this entry covers getting the repo and the shared `CLAUDE.md` set up, not any real feature.

---

## 1. Cloning the repo (2026-10-28)

**What I asked for**
- Asked Claude Code to clone `kevlam1/Scrawdle` into my local `Scrawdle` folder.

**What changed**
- The folder already had an `.idea` folder from opening it in IntelliJ before the clone, so git refused to clone straight into it. Claude cloned into a temporary subfolder instead, moved `.git` and the repo's other files up, and merged the two `.idea` folders without overwriting my already-open IntelliJ session's files, then deleted the temp folder.

**What I checked**
- Didn't check anything myself yet; Claude reported `git status` afterward, which showed the repo as attached to `origin/Angie` with four `.idea` files (`.gitignore`, `checkstyle-idea.xml`, `misc.xml`, `vcs.xml`) showing as modified, from the merge.

**Decisions**
- Left the four modified `.idea` files alone for now rather than guessing whether to keep my local versions or the repo's.

---

## 2. Committing to a branch called "main" that didn't exist yet (2026-10-28)

**What I asked for**
- Told Claude, "while I'm on main branch, can you commit and push to main."

**What changed**
- There was no `main` branch — only `Angie`, both locally and on the remote. Claude also found an empty file, `TESTING 2`, already staged for commit, which neither of us had created on purpose (likely IntelliJ auto-adding a new file to the git index). Claude flagged both instead of guessing, and I chose to create `main` from the current `Angie` state. It committed `TESTING 2` and pushed `main` as a new branch on the remote.

**What I checked**
- Nothing beyond Claude's report of the branch list and the push result (`[new branch] main -> main`).

**Decisions**
- `main` now exists, branched from `Angie` as of that commit. Left the `Testing` file and the `.idea` changes out of that commit since I hadn't asked about those.

---

## 3. Checking main for new commits (2026-10-29)

**What I asked for**
- Asked Claude to check if there was anything new on `main`.

**What changed**
- Nothing in the repo; this was a read-only check. Claude fetched and found `origin/main` was 7 commits ahead of what we'd pushed — Angie and/or Trenten had opened and merged GitHub's "create a pull request" flow after our push, plus a "Create README.md" commit and a "Remove test files" commit.

**What I checked**
- Just read the commit log Claude showed me; didn't pull yet.

**Decisions**
- Nothing decided yet about pulling; this was just a status check.

---

## 4. Reading the Artifact 4 assignment and our own pitch, writing the first `CLAUDE.md` (2026-10-29)

**What I asked for**
- Asked Claude to look at how my other artifacts' `CLAUDE.md` files are set up (`midi-companion`, `readme-architect`) and read our own pitch doc and the Artifact 4 assignment PDF, then set up Scrawdle's `CLAUDE.md` — balanced for a team of three, not just my own preferences, since my personal `CLAUDE.md` in the parent folder isn't shared with Angie's or Trenten's sessions.
- Told Claude: no roles split yet, stack not locked, and that Scrawdle is for artists and the general public as a pastime.

**What changed**
- New `CLAUDE.md`: what the project is (from the pitch PDF), team roles and branch workflow both marked "not assigned/agreed yet" rather than invented, a stack section proposing plain Canvas + Supabase but marked as a proposal, shared rules that apply to all three of our agents (no secrets, no new dependency without asking, keep `log.md`, lowercase file names), a status line, and open questions.
- Flagged one scope point for the team to confirm: "artists and the general public" is broader than the assignment's example shapes (a club, a relative's business, an open-source PR), which matters for what "hand it over" means at the end.

**What I checked**
- Claude found both PDFs itself after I said they "should be within the root file" — they were actually in `Unit 4/`, not the repo root. It read both fully before writing anything.
- Didn't check with Angie or Trenten yet. This `CLAUDE.md` is a draft for me to share with them, not a team-agreed document.

**Decisions**
- Nothing locked. The file states facts from the pitch doc and the assignment as facts, and everything the team hasn't agreed on (roles, stack, branch workflow) as open, on purpose.

---

## 5. Database pick: leaning Supabase, and the log protocol (2026-10-29)

**What I asked for**
- Asked Claude to set up `log.md` the way I do it in Artifacts 2, 3, and 5, make sure `CLAUDE.md` knows to keep it updated on its own after real decisions (not just when asked), and asked which database fits our idea better.

**What changed**
- This file (`log.md`), structured like `midi-companion`'s and `Overloaded`'s.
- `CLAUDE.md` got a "The log protocol" section telling any of our three agents to add to `log.md` on their own after a real decision, build step, or correction, not only when told to.
- `CLAUDE.md`'s Stack section now states a specific reason for leaning Supabase, not just "generous free tier."

**What I checked**
- Claude searched the web (third-party sources, not Supabase's or Firebase's own docs) before answering: scheduled Firebase Cloud Functions need the paid Blaze plan just to deploy, even within free usage limits, while Supabase's free tier includes Postgres's `pg_cron` for scheduled jobs with no billing account. That matters directly for Scrawdle's daily-wipe requirement. Also found: free Supabase projects pause after about a week of inactivity.
- Not checked against Supabase's or Firebase's own documentation yet — flagged in `CLAUDE.md` as needing that confirmation before the pick is locked in.

**Decisions**
- Leaning Supabase for the specific reason that its free tier can run the daily sanitize job without a paid plan, where Firebase's equivalent can't. Still a recommendation for the team, not a final decision.

---

## 6. Deciding on Supabase (2026-10-29)

**What I asked for**
- Told Claude Supabase sounds like the best option and to go with it.

**What changed**
- `CLAUDE.md`'s Stack section now states Supabase as decided rather than a lean, but marks it as my own call made solo in this session, not something Angie or Trenten have agreed to yet. Moved the open item in "Open questions" from "Supabase vs. Firebase" to "needs Angie and Trenten's sign-off."

**What I checked**
- Nothing new; this builds on the research from entry 5.

**Decisions**
- Database is Supabase. Still need to tell Angie and Trenten and get their sign-off before any backend code depends on it, since this was my call alone.

---

## 7. Updated the README, and scaffolded frontend/backend placeholders (2026-10-29)

**What I asked for**
- Asked Claude to update the README (not comprehensive), then to set up the backend and frontend, with a placeholder index for the frontend being fine.

**What changed**
- `README.md`: replaced the "temp" placeholder with a short description, the team credit, and pointers to `CLAUDE.md`/`log.md`. I edited the first line myself afterward to drop the "like Wordle or NYTimes' minigames" comparison.
- `frontend/index.html`: a bare canvas page — draw a single line with a mouse or touch, nothing else. `frontend/README.md` explains it's a placeholder pending the team's stack confirmation.
- `backend/`: `README.md` explaining Supabase has no server process to run, just schema and config; `supabase/schema.sql`, a draft schema (`daily_prompts`, `drawings`) with a commented-out `pg_cron` daily-wipe job, not run against any real database since no Supabase project exists yet.
- Root `.env.example` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, both empty) and a new `.gitignore` (`.env`, `node_modules/`).
- `CLAUDE.md`'s Status section updated to describe all of this as a placeholder scaffold, not a locked structure.

**What I checked**
- Nothing against a real Supabase project — none exists yet. The schema is a draft only.

**Decisions**
- Scaffolded now so there's something to build on, but explicitly marked as replaceable: table names, columns, and the folder split could all change once Angie and Trenten weigh in on the stack and roles.

---

## Where AI misread me, or I had to correct course

- In session 2, I said "while I'm on main branch," but there was no `main` branch yet. Claude didn't assume what I meant — it asked whether to commit to `Angie` instead, create `main` from `Angie`, or stop, and I picked creating `main`.
- In session 4, I said the two PDFs "should be within the root file." Claude had already searched the repo root and my home folder and found nothing; once I pointed at "the root file," it searched the whole `TCSS 490` folder and found both PDFs in `Unit 4/`, not the repo root.

---

## Decisions and abandoned ideas

- Nothing abandoned yet. Team roles, exact prompt format, branch workflow, and the Supabase-vs-Firebase pick are all still open (see `CLAUDE.md`), not decided and discarded.
