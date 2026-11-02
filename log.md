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

## 8. Tried readme-architect, then wrote the README update by hand (2026-10-31)

**What I asked for**
- Asked Claude to run `readme-architect` (my Artifact 3 tool) against this repo, then to have it update the README. When generate mode couldn't produce a draft, I said to just write the update myself.

**What changed**
- Ran `readme-architect` in check mode first: PASS, 13 claims, 2 backed by code (`frontend/index.html`), 11 backed only by `CLAUDE.md`/`log.md` since most of the README describes planned features that aren't built yet. Cost about $0.43.
- Ran generate mode next, hoping for a drafted README. It stopped at step 2: gather couldn't tell what kind of project this is (no top-level `package.json`, and the only HTML file is under `frontend/`, not at the repo root), a limitation already written down in `readme-architect`'s own `CLAUDE.md`. Cost about $0.22, no file written.
- `README.md` updated directly (not by the tool): added a Status section naming `frontend/` and `backend/` as placeholder scaffolding, and a short Stack section (Canvas frontend proposed, Supabase decided pending sign-off, Vercel hosting).

**What I checked**
- Both `readme-architect` runs only touched its own gitignored `readme-architect-out/` folder; nothing in Scrawdle was changed by either run.

**Decisions**
- Didn't extend `readme-architect`'s gather script to handle a `frontend`/`backend` split just for this one README — that's a change to a different repo and needs its own tests, not a one-off fix. Wrote the README by hand instead.

---

## 9. Added a "Running locally" section (2026-10-31)

**What I asked for**
- Asked Claude to add a guide for running the project locally.

**What changed**
- `README.md`: a "Running locally" section saying to open `frontend/index.html` directly, or serve the folder with `npx serve frontend` or Python's `http.server`, and noting there's nothing to install or configure yet since no Supabase project exists.

**What I checked**
- Read `frontend/index.html` for `fetch`, `import`, or `type="module"` before saying it can be opened directly with no server — found none, so opening the file works for now (that'll stop being true once it talks to Supabase).

**Decisions**
- Kept it short and tied to what actually exists today (one static page, no backend wired up), rather than writing setup steps for a backend connection that doesn't exist yet.

---

## 10. Live Vercel link added, and a 404 found and fixed (2026-10-31)

**What I asked for**
- Told Claude a Vercel app is live at scrawdle.vercel.app and asked it to update whatever needed updating.

**What changed**
- Found the real problem first, not just assumed the link worked: the site responded 404 at `/`, but the actual file was reachable at `/frontend/index.html` (HTTP 200), because there's no top-level `index.html` and no `vercel.json` to tell Vercel where the site root is.
- Added `vercel.json` (`{"outputDirectory": "frontend"}`) so the next deploy should serve the real page at `/`.
- `CLAUDE.md`: Stack section now has the live URL, the "never move or rename it" rule from the other artifacts, and the 404 finding, marked not yet re-checked after the fix deploys.
- `README.md`: live link added near the top, and the Status section now mentions the 404 and the fix.

**What I checked**
- `curl`'d the live URL directly: `/` and `/index.html` both 404, `/frontend/index.html` returned 200. Didn't just take the link at face value.
- Could not check: whether the fix actually works, since it hasn't been pushed and redeployed yet. Also couldn't check or change the Vercel dashboard's own "Root Directory" project setting — if that's set to something else, it may need changing there too, and I have no way to see it from here.

**Decisions**
- Fixed via `vercel.json` in the repo rather than guessing at a dashboard setting I can't see. Whoever owns hosting should confirm `/` loads after the next deploy and check the dashboard setting if it doesn't.

---

## 11. Temporary prompt "database" as a JSON file (2026-11-01)

**What I asked for**
- Asked Claude whether a JSON file would be easier than putting prompts in Supabase, then asked it to generate `prompts.json` as a temporary database with two categories: `basic` (head, front limbs, back limbs, tail, optional extra like wings/shell/spines) and `detailed` (all of basic plus ears, eyes, mouth/snout, optional skin/pattern, optional accessory), each filled with a list of animals/things to pull from.

**What changed**
- `frontend/prompts.json`: new file. `basic` has 5 parts and `detailed` has 5 more, with `"includes": "basic"` so the basic parts aren't copied. Each part has a `label`, an `optional` flag, and an `options` list (18-44 entries each). It lives in `frontend/` because Vercel only serves that folder, so the page can `fetch` it; `backend/` isn't served.
- Nothing reads it yet. `frontend/index.html` is unchanged, and the draft `daily_prompts` table in `backend/supabase/schema.sql` is now unused for prompts.

**What I checked**
- Loaded the file with Node: valid JSON, and the option counts per part match what I expected. Did not test it in the browser, since nothing fetches it yet.

**Decisions**
- Prompts stay in a static JSON file for now. Supabase is still needed later for storing drawings, not for prompts. Option lists are Claude's first draft and can be edited freely.
- Claude's first two attempts to write the file were denied because I didn't click "Apply" on the permission prompt, not because of a problem with the file.

---

## 12. Start screen, slot machine, and prompt bar (2026-11-01)

**What I asked for**
- A first page with two boxes, "Basic" and "Detailed", that list what each includes on hover; a "What is this?" button explaining the game and how to play; and, after picking a mode, a slot-machine animation that rolls a random set from `prompts.json` and then shrinks into labeled boxes at the top left, above the existing drawing canvas.

**What changed**
- `frontend/index.html` rewritten as a single file (inline CSS and JS, no new dependency). Start screen with two mode cards; `<dialog>` for "What is this?"; a full-screen slot overlay with one reel per part that stops one after another; the reels then animate into chips ("Head: Cat") in a bar above the canvas; a "New set" button returns to the start screen. Optional parts are tinted green. Respects `prefers-reduced-motion` (skips the animation). On touch screens, where there's no hover, the include lists are always shown.
- Kept the placeholder canvas behavior (one pen), but gave it a white fill and made it scale with the screen width.
- `README.md`: "Running locally" now says the page must be served, since it loads `prompts.json` with `fetch` and opening the file from disk will fail. This corrects entry 9, which said opening the file directly works.

**What I checked**
- Syntax-checked the page's script with `node --check`: OK. Did not open it in a browser, so the layout, hover behavior and the shrink animation are untested by Claude. Needs a visual check from someone running it.

**Decisions**
- Optional parts always roll (no way to turn them off yet). "What is this?" only describes what exists today: no daily prompts, gallery or export, since those aren't built.
- The slot is a JS-driven word shuffle rather than a true scrolling reel, to keep the code small.

---

## 13. Moved "What is this?" and enlarged the canvas (2026-11-01)

**What I asked for**
- The "What is this?" button overlapped the "New set" button at the top right, so I asked to move it to the bottom left, and to make the drawing box a bit bigger for now.

**What changed**
- `frontend/index.html`: "What is this?" is now fixed at the bottom left; removed the extra right padding on the prompt bar that was only there to make room for it. Canvas went from 600x400 to 900x600 (still shrinks to fit narrower screens).

**What I checked**
- Nothing in a browser. These are small CSS/size edits, not run by Claude.

**Decisions**
- Canvas size is a stopgap until the real layout and tools are decided.

---

## Where AI misread me, or I had to correct course

- Claude's first version of the start page put "What is this?" in the top right, where it collided with the "New set" button on the game screen. I caught it by running the page; Claude hadn't opened it in a browser.
- In session 2, I said "while I'm on main branch," but there was no `main` branch yet. Claude didn't assume what I meant — it asked whether to commit to `Angie` instead, create `main` from `Angie`, or stop, and I picked creating `main`.
- In session 4, I said the two PDFs "should be within the root file." Claude had already searched the repo root and my home folder and found nothing; once I pointed at "the root file," it searched the whole `TCSS 490` folder and found both PDFs in `Unit 4/`, not the repo root.

---

## Decisions and abandoned ideas

- Nothing abandoned yet. Team roles, exact prompt format, branch workflow, and the Supabase-vs-Firebase pick are all still open (see `CLAUDE.md`), not decided and discarded.
