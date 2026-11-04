# Build log: Artifact 4 (Scrawdle)

**AI:** Claude Code | **Editor:** IntelliJ IDEA Ultimate | **Host:** not chosen yet (public repo `kevlam1/Scrawdle`, team of three: `kevlam1`, `arcangieo`, `trentenmuw`)
**Stack:** not locked yet — leaning Supabase for the database, plain HTML5 Canvas for drawing. See `CLAUDE.md`.

---

## What I set out to build

Artifact 4 is "For Someone Else," due Sunday, November 8. My team (me, Angie, Trenten) is building Scrawdle, a daily drawing game like Wordle or NYTimes' minigames: a prompt (or a few) each day, a browser canvas with drawing tools, and a chance to see what other players drew once you finish your own. We pitched it for artists and for the general public as a casual daily pastime. Nothing is built yet — this entry covers getting the repo and the shared `CLAUDE.md` set up, not any real feature.

---

## 1. Cloning the repo (2026-10-28) — Kevin

**What I asked for**
- Asked Claude Code to clone `kevlam1/Scrawdle` into my local `Scrawdle` folder.

**What changed**
- The folder already had an `.idea` folder from opening it in IntelliJ before the clone, so git refused to clone straight into it. Claude cloned into a temporary subfolder instead, moved `.git` and the repo's other files up, and merged the two `.idea` folders without overwriting my already-open IntelliJ session's files, then deleted the temp folder.

**What I checked**
- Didn't check anything myself yet; Claude reported `git status` afterward, which showed the repo as attached to `origin/Angie` with four `.idea` files (`.gitignore`, `checkstyle-idea.xml`, `misc.xml`, `vcs.xml`) showing as modified, from the merge.

**Decisions**
- Left the four modified `.idea` files alone for now rather than guessing whether to keep my local versions or the repo's.

---

## 2. Committing to a branch called "main" that didn't exist yet (2026-10-28) — Kevin

**What I asked for**
- Told Claude, "while I'm on main branch, can you commit and push to main."

**What changed**
- There was no `main` branch — only `Angie`, both locally and on the remote. Claude also found an empty file, `TESTING 2`, already staged for commit, which neither of us had created on purpose (likely IntelliJ auto-adding a new file to the git index). Claude flagged both instead of guessing, and I chose to create `main` from the current `Angie` state. It committed `TESTING 2` and pushed `main` as a new branch on the remote.

**What I checked**
- Nothing beyond Claude's report of the branch list and the push result (`[new branch] main -> main`).

**Decisions**
- `main` now exists, branched from `Angie` as of that commit. Left the `Testing` file and the `.idea` changes out of that commit since I hadn't asked about those.

---

## 3. Checking main for new commits (2026-10-29) — Kevin

**What I asked for**
- Asked Claude to check if there was anything new on `main`.

**What changed**
- Nothing in the repo; this was a read-only check. Claude fetched and found `origin/main` was 7 commits ahead of what we'd pushed — Angie and/or Trenten had opened and merged GitHub's "create a pull request" flow after our push, plus a "Create README.md" commit and a "Remove test files" commit.

**What I checked**
- Just read the commit log Claude showed me; didn't pull yet.

**Decisions**
- Nothing decided yet about pulling; this was just a status check.

---

## 4. Reading the Artifact 4 assignment and our own pitch, writing the first `CLAUDE.md` (2026-10-29) — Kevin

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

## 5. Database pick: leaning Supabase, and the log protocol (2026-10-29) — Kevin

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

## 6. Deciding on Supabase (2026-10-29) — Kevin

**What I asked for**
- Told Claude Supabase sounds like the best option and to go with it.

**What changed**
- `CLAUDE.md`'s Stack section now states Supabase as decided rather than a lean, but marks it as my own call made solo in this session, not something Angie or Trenten have agreed to yet. Moved the open item in "Open questions" from "Supabase vs. Firebase" to "needs Angie and Trenten's sign-off."

**What I checked**
- Nothing new; this builds on the research from entry 5.

**Decisions**
- Database is Supabase. Still need to tell Angie and Trenten and get their sign-off before any backend code depends on it, since this was my call alone.

---

## 7. Updated the README, and scaffolded frontend/backend placeholders (2026-10-29) — Kevin

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

## 8. Tried readme-architect, then wrote the README update by hand (2026-10-31) — Kevin

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

## 9. Added a "Running locally" section (2026-10-31) — Kevin

**What I asked for**
- Asked Claude to add a guide for running the project locally.

**What changed**
- `README.md`: a "Running locally" section saying to open `frontend/index.html` directly, or serve the folder with `npx serve frontend` or Python's `http.server`, and noting there's nothing to install or configure yet since no Supabase project exists.

**What I checked**
- Read `frontend/index.html` for `fetch`, `import`, or `type="module"` before saying it can be opened directly with no server — found none, so opening the file works for now (that'll stop being true once it talks to Supabase).

**Decisions**
- Kept it short and tied to what actually exists today (one static page, no backend wired up), rather than writing setup steps for a backend connection that doesn't exist yet.

---

## 10. Live Vercel link added, and a 404 found and fixed (2026-10-31) — Kevin

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

## 11. Temporary prompt "database" as a JSON file (2026-11-01) — Angie

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

## 12. Start screen, slot machine, and prompt bar (2026-11-01) — Angie

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

## 13. Moved "What is this?" and enlarged the canvas (2026-11-01) — Angie

**What I asked for**
- The "What is this?" button overlapped the "New set" button at the top right, so I asked to move it to the bottom left, and to make the drawing box a bit bigger for now.

**What changed**
- `frontend/index.html`: "What is this?" is now fixed at the bottom left; removed the extra right padding on the prompt bar that was only there to make room for it. Canvas went from 600x400 to 900x600 (still shrinks to fit narrower screens).

**What I checked**
- Nothing in a browser. These are small CSS/size edits, not run by Claude.

**Decisions**
- Canvas size is a stopgap until the real layout and tools are decided.

---

## 14. Drawing tools, undo, auto-save, and the finish screen (2026-11-01) — Zainab

**What I asked for**
- Joined the team and took the drawing side, since nobody had started it and everyone is back Tuesday: tools, paint bucket, undo, auto-save, and a finish screen with export. Kevin keeps Supabase and publishing, and Angie's start screen and slot machine stay as they are.

**What changed**
- `frontend/drawing.js` and `frontend/drawing.css`: new files, kept out of `index.html` to avoid colliding with other work. Pen, pencil, brush, line, eraser, and paint bucket, with colors and a size per tool. Undo and redo (buttons and Ctrl/Cmd+Z) with a 96 MB limit. The drawing and its prompts auto-save in the browser (IndexedDB), come back after a refresh, and are dropped when the day changes. Done opens a finish screen with a PNG download that includes the prompts and date.
- `frontend/index.html`: replaced the placeholder canvas with the board, moved the prompt bar into its own function so a saved round can rebuild it, added the toolbar spot, and updated "What is this?". "New set" now clears the drawing and asks first if there's anything drawn. Before, the old drawing stayed on the canvas.
- Canvas is now stored at 1800x1200 and shown at up to 900x600, so lines stay sharp and every drawing is the same size.
- The brush has seven types that draw differently: round, marker (see-through, doesn't darken where it crosses itself), calligraphy (a slanted nib), crayon (waxy grain), watercolor (soft see-through edge), spray, and dry bristle (hairs that run out of paint).
- Publish button is off until someone sets `window.scrawdlePublish`. Kevin: the comment at the top of `drawing.js` shows what it receives.
- `tests/drawing.test.js`: tests for the bucket and undo history, using Node's built-in test runner, so no new dependency.

**What I checked**
- `node --test tests/drawing.test.js`: 10 passed.
- Ran the page in Chromium through scripted checks: each tool, exact undo and redo, bucket staying inside a shape, refresh, wrong-day drafts, download, a stand-in publish function including a failed publish, the slot machine, each brush type, and a simulated finger on a phone-size screen. All passed.
- Not checked: Safari, Firefox, a real phone or stylus. Pressure in the brush is untested on real hardware. Connecting real publishing isn't done.

**Decisions**
- Eraser paints white instead of making pixels transparent, because the canvas is always white and the bucket and export stay simpler.
- The bucket treats colors close to the clicked one as the same area, so it fills soft line edges. A gap in a shape will leak, like real paint.
- Undo doesn't survive a refresh. The drawing does.
- On a phone, the tools take up most of the first screen and the "What is this?" button overlaps the canvas corner. Left for the team to decide, since that button and layout aren't only mine.

---

## 15. Updated the notes so finished work shows as finished (2026-11-01) — Zainab

**What I asked for**
- The README and team notes still called the canvas a placeholder, so I wanted them to say what's actually done and what isn't, so nobody redoes finished work.

**What changed**
- `README.md`: Status now lists what's built and what isn't, and I added my name to the team credit.
- `frontend/README.md`: describes the real files instead of a placeholder.
- `CLAUDE.md`: team is now four people, Team roles and Status record the drawing work and Kevin owning Supabase and publishing.

**What I checked**
- Compared each "built" line with what ran in entry 14's checks. Nothing new was tested, since only notes changed.

**Decisions**
- From now on, anything I add also gets a line in the README's Status and an entry here, in the same change.

---

## 16. Same parts for everyone each day, Free play, and the gallery (2026-11-01) — Zainab

**What I asked for**
- Make it an actual daily game, so people draw the same thing and can compare, and show what others drew after finishing (my inspiration idea from the group chat). Nothing that depends on Kevin's database.

**What changed**
- `frontend/daily.js`: picks each part from the date and the part's name, so everyone on the same date gets the same parts with no server. Detailed shares Basic's parts and adds its own.
- `frontend/index.html`: the slot machine now lands on the daily parts. Its animation is unchanged. Added a Free play button for random parts, and "New set" reads "Start over" in a daily round, since spinning again gives the same parts. Updated "What is this?".
- `frontend/gallery.js`: a gallery opened from the finish screen, with your drawing first. Until real drawings are connected it shows five doodles labeled as samples. Anyone connecting it sets `window.scrawdleGallery`, and the samples then disappear.
- Free play rounds can't be published and don't open the gallery.

**What I checked**
- `node --test tests/drawing.test.js`: 13 passed, including that picks are repeatable and spread across the options.
- In Chromium: 25 new checks passed, including two players matching on one date, the next day changing, Free play staying random, a refresh keeping the kind of round, an empty and a failed gallery, and a caption not being able to inject code. The 37 earlier checks still pass.
- Not checked: real players, since nothing is published yet. Safari, Firefox, and real phones are still untested.

**Decisions**
- "Today" is the player's local date, so people in different time zones change over at different moments.
- This replaces random prompts as the default, which the group chat described as how it works for now. The team hasn't agreed to this yet, so it's only on my branch until they've seen it.
- Changing an options list in `prompts.json` can change that day's parts for anyone loading afterward, so edits shouldn't land mid-day once it's live.

---

## 17. Fixed seven bugs (2026-11-01) — Zainab

**What I asked for**
- Find and fix real bugs in the drawing side. Each one was reproduced with a failing check before I fixed it.

**What changed**
- `frontend/drawing.js`:
- A stroke the browser dropped with no pointerup left the board stuck. The board now ends the stroke when the pointer capture is lost.
- Undo during a stroke put history out of order, so undo, redo and Clear now wait for the stroke to finish.
- A damaged save threw an error on load. It's now removed and the start screen opens.
- A blank drawing could be published and could open the gallery. Both are now blocked, and the finish screen says to draw something first.
- Clear on a blank canvas added a pointless undo step.
- Start over warned about losing a drawing even when everything had been undone. It now checks the canvas itself.
- Refreshing right after a stroke lost that stroke, because the save waits 400 ms. The page now saves as it closes.
- Also made a slower, older save unable to overwrite a newer state. That check already passed before the change, so it's a precaution, not a reproduced bug.

**What I checked**
- In Chromium, 2 of 9 bug checks passed before the fixes and 9 of 9 pass now. The 62 earlier browser checks and 13 logic tests still pass.
- Not checked: Safari, Firefox, or a real phone. The save on closing relies on `transaction.commit()`, which I haven't tested in Safari or Firefox.

---

## 18. Replay (2026-11-01) — Zainab

**What I asked for**
- Something impressive: watch a drawing redraw itself stroke by stroke.

**What changed**
- `frontend/drawing.js`: every stroke, fill and clear is recorded as you draw, and saved with the draft. A "Watch it redraw" button on the finish screen plays them back on a separate canvas using the same drawing code, in 2.5 to 10 seconds depending on length. Brushes with random texture now use a saved seed, so they come out the same each time.
- `frontend/drawing.css`, `README.md`, `frontend/README.md`: styling for the replay and notes that it exists.

**What I checked**
- 14 of 14 replay checks pass in Chromium. The main one uses every tool and brush type plus undo, redo and clear, and the replay ends pixel-for-pixel on the drawing, including after a refresh. The 9 bug checks, 62 other browser checks and 13 logic tests still pass.
- Not checked: Safari, Firefox, a real phone, or how it performs on a very long drawing.

**Decisions**
- Replay only works on your own drawing. Showing it in the gallery means publishing the strokes too, which depends on the database.
- A save from before this feature has no strokes, so the button is hidden for it.

---

## 19. Replay speed (2026-11-01) — Zainab

**What I asked for**
- Replay should be able to speed up, and it should start a bit sped up, because people may spend a long time on a drawing.

**What changed**
- `frontend/drawing.js`: replay now starts at 2x, and a button that only shows while it plays changes it to 4x or 1x, even partway through. The speed goes back to 2x when the finish screen reopens.
- `README.md`: says how the speed works.

**What I checked**
- 17 of 17 speed checks pass in Chromium. The same test drawing took about 8 seconds at 1x, 4 at 2x and 2 at 4x, and it ended pixel-for-pixel on the drawing at every speed, including when the speed changed partway through. The 14 replay checks, 9 bug checks, 62 other browser checks and 13 logic tests still pass.
- Not checked: Safari, Firefox, or a real phone.

**Decisions**
- Started at 2x. At 1x a replay already never runs past 10 seconds, so this makes the longest one about 5. A very short drawing can finish in about a second.

---

## 20. Replay speeds up by itself (2026-11-01) — Zainab

**What I asked for**
- No speed button. Replay should speed up naturally and look graceful, so it gets you to the finished drawing, and it only plays if someone presses the button. This replaces the speed button from entry 19.

**What changed**
- `frontend/drawing.js`: removed the speed button. Replay now eases in, glides through the middle, and settles on the finished drawing, in about 2 to 4 seconds however long the drawing took.
- `README.md`: says how replay is paced.

**What I checked**
- 17 of 17 pacing checks pass in Chromium. A long test drawing took about 4 seconds, was about 6% drawn at 15% of the time, 50% at the halfway point, and 94% at 85%. A small drawing takes about 2 seconds, and a single dot about 1. It ended pixel-for-pixel, including with every brush type. The 14 replay checks, 9 bug checks, 62 other browser checks and 13 logic tests still pass.
- Not checked: Safari, Firefox, or a real phone.

**Decisions**
- A very long drawing gets the same 4 seconds as a medium one, so the replay doesn't drag. People who want to see it press the button; otherwise the finish screen just shows the drawing.

---

## 21. Brush width stays steady (2026-11-02) — Zainab

**What I asked for**
- Fix the round brush getting thinner when you move the mouse quickly.

**What changed**
- `frontend/drawing.js`: with a mouse or finger, the round brush now keeps the selected size at any speed. With a stylus, pressure changes the width but it can't go past the selected size. Each new stroke is marked as using this rule, so drawings saved before this change still replay with their original widths.
- `tests/brush-width.test.js`: new tests for the mouse, the stylus, and older saved drawings.

**What I checked**
- In Chromium, the same brush at size 24 settled about 14 canvas pixels apart between a slow and a fast stroke before the fix, and within 2 pixels after it. A drawing saved by the old code still replays pixel-for-pixel with the new code. 16 of 16 logic tests pass, as do the 14 replay, 17 replay pacing, 9 bug and 62 other browser checks.
- Not checked: a physical stylus, Safari, Firefox, or a real phone. The stylus rule was only checked with logic tests.

**Decisions**
- A stroke still starts slightly thinner and grows to full width over its first few points, whatever the speed.

---

## 22. Self-judged win condition (2026-11-02) — Trenten

**What I asked for**
- (Trenten) I want Scrawdle to have a win condition that involves judging the player's drawing. For now, I asked for the player to judge their own drawing as accurate or inaccurate to the parts they rolled.

**What changed**
- `frontend/index.html`: under the canvas, a "Done? Does your drawing match the parts?" row with **Accurate** and **Inaccurate** buttons. Picking one hides the buttons, shows a verdict ("You win!" in green, or "Not this time" in pink), and locks the canvas so the drawing can't change after it's judged. "New set" brings the buttons back and unlocks the canvas.
- The "What is this?" help dialog has a new step explaining the judging.

**What I checked**
- Served `frontend/` locally and drove it in a browser with Claude: rolled a Basic set, drew a stroke, clicked Accurate (win verdict shown, further strokes blocked), clicked New set and rolled again (buttons back, drawing works again), then clicked Inaccurate (lose verdict shown). Didn't check phone widths, where the judge row may sit close to the "What is this?" button.

**Decisions**
- Self-judging is a stand-in. A real win condition will probably need someone or something other than the player to judge (other players voting, or an automated check). Nothing is saved yet: the verdict only lives on the page.
- The previous drawing still stays on the canvas after "New set". That's how it already worked, and I didn't change it here.
- This entry is numbered 14 on `main`. The `zainab` branch also adds entries starting at 14, so the numbers will need fixing when that branch is merged.

---

## 23. Merged the zainab branch into main (2026-11-02) — Zainab

**What I asked for**
- My teammates liked what was on the `zainab` branch and asked me to merge it into `main`. Trenten's win condition had reached `main` first, so it needed to keep working after the merge.

**What changed**
- Trenten's Accurate and Inaccurate buttons were written for the old placeholder canvas, which the drawing board replaced. I moved them onto the board: `frontend/drawing.js` now has `setLocked()`, which blocks new strokes, the paint bucket, Undo, Redo, Clear, and the undo shortcut once a drawing is judged. Starting a new round unlocks it.
- Done still opens the finish screen after judging, so download, replay, and the gallery keep working. Its "Keep drawing" button says "Back" while the drawing is locked.
- The "Not this time" verdict now names the button on screen, because daily rounds say "Start over" and only Free play says "New set".
- `#stage` has more room at the bottom. On phone widths, the "What is this?" button covered Accurate, which Trenten's entry had flagged as unchecked. The row can now scroll clear of it.
- The help dialog keeps both the judging step and the gallery and Free play steps. `README.md` and `CLAUDE.md` are updated.
- Trenten's entry is now number 22, as he said it would need to be. Its text is unchanged.

**What I checked**
- 16 of 16 logic tests pass. In Chromium, on the merged page: 38 checks of judging, locking, starting over, Free play, download, replay, the gallery, and auto-save after a refresh, and the slot machine still lands with its animation on. The 110 earlier browser checks for bugs, replay, replay pacing, brush width, daily parts, and the drawing tools also pass.
- At 1280x800, 1280x900, 390x844, and 320x740, I clicked both verdict buttons in the browser and nothing covered them. Those phone sizes are narrow Chromium windows. I didn't check real phones, Safari, or Firefox.

**Decisions**
- A verdict still lives only on the page, as in Trenten's entry, so a refresh brings back the drawing and the buttons.
- Publishing stays out of this merge. The finish screen still says it isn't available yet, and the gallery still shows labeled samples.
- Correction to entry 21: it says the brush settled "about 14" canvas pixels apart before the fix. The final measurement was 17.

---

## 24. Illustrated tool icons (2026-11-02) — Zainab

**What I asked for**
- I wanted the tool icons from my design work in the team's game, without bringing over the rest of the redesign.

**What changed**
- `frontend/assets/tools/`: six illustrations, one each for pen, pencil, brush, line, eraser, and bucket. I split them out of my 884 KB icon sheet because some tools crossed into the next tool's slot. Together they're 68 KB.
- `frontend/drawing.js` and `frontend/drawing.css`: the six tool buttons show their illustration above their name, and Undo, Redo, and Clear have small line icons beside theirs. What the buttons do hasn't changed.

**What I checked**
- 16 of 16 logic tests pass. In Chromium at 1280x800, 1280x900, 1024x768, 390x844, and 320x740: all six icons load, every button keeps its word, nothing runs off the screen, and no files are missing. Clicking each picture selects that tool, and Undo, Redo, the brush type dropdown, and locking after a verdict still work.
- The earlier browser checks from entries 22 and 23 pass again. I didn't check real phones, Safari, or Firefox.

**Decisions**
- Only the icons moved. The rest of my redesign and online publishing aren't in the team's game.

---

## 25. New look for the whole game (2026-11-02) — Zainab

**What I asked for**
- My teammates said I could bring over the design I'd been working on. I wanted it in the team's game without losing anyone's work.

**What changed**
- `frontend/index.html`, `drawing.js`, `drawing.css`, `gallery.js`, and the new `studio.css` and `flow.css`: warm paper look, a "Ready to draw?" home screen, a reveal screen with one reel per part, and a drawing screen with a tool tray, 12 colors, a custom color, size presets, and a Brushes panel that previews each brush with the real drawing code. The finish screen is "Made by you." and the gallery shows six labeled sample drawings.
- `frontend/fonts/`: Patrick Hand and Gochi Hand. `frontend/assets/sample-strawberries.webp`: the sample drawings, reduced from 2 MB to about 196 KB.
- Today's drawing and Free play now save separately, and the home screen offers to continue either one. A drawing saved by the previous version moves over.
- Kept from the team's game: Basic and Detailed with the same daily parts, Free play, Trenten's Accurate and Inaccurate buttons with the lock, the smooth replay, and the split tool icons. The help dialog is shorter and covers the same steps.

**What I checked**
- 16 of 16 logic tests pass. In Chromium at 1440x900, 1366x768, 1280x800, 390x844, and 320x740, 93 checks cover every screen, judging, locking, starting over, saving, refreshing, switching modes, and the sample gallery. Today's parts match the live game.
- 43 more checks cover each tool, all seven brushes, custom color, undo and redo, an exact replay, replay time, and tapping the main buttons at phone size in a touch browser.
- Most of the older browser checks were written for the old screens, so they don't all run on this one. The 8 bug checks that still apply pass. The ninth expected a turned-off Publish button, and that button is now hidden until publishing is connected. I didn't check real phones, Safari, Firefox, or a real stylus.

**Decisions**
- Publishing isn't included, so its button and message stay hidden until it's connected.
- One daily prompt instead of animal parts (a "Simple mode" from my design work) isn't included. The animal parts stay the game.
- The verdict still isn't saved, so a refresh or switching drawings brings the buttons back.

---

## 26. Real Supabase schema and the publish/gallery glue code (2026-11-04) — Kevin

**What I asked for**
- Pulled Zainab's, Angie's, and Trenten's work, then gave Claude the team's updated plan doc (Firebase now crossed out, my week's list: database, multiplayer lobbies, syncing player actions). I said the only real purpose of storing images is to show them once a player finishes, that prompts should use the date as a seed since everyone gets the same ones, and asked whether keeping prompts out of Supabase would still let a teammate change them without my Supabase access.

**What changed**
- Found Zainab had already built the exact hooks I needed: `window.scrawdlePublish({ blob, mode, prompts, day })` and `window.scrawdleGallery({ day, mode, prompts })` in `drawing.js`/`gallery.js`, and `frontend/daily.js` already does the date-seeded pick client-side with no server involved.
- `backend/supabase/schema.sql`: rewritten for real. A `drawings` table (day, mode, the exact prompts drawn, an image path, a `hidden` flag for manual moderation), Row Level Security (anyone can read today's visible drawings and publish one; nobody can edit or delete through the public key), and a commented-out daily job to hide old rows. Prompts are explicitly not stored here.
- `frontend/supabase-config.js` (new, placeholder URL/key) and `frontend/publish.js` (new): implements both hooks against Supabase, with a `localStorage`-backed "already published this round" check so `err.alreadyPublished` is real even after a refresh, and does nothing at all until the config has real values.
- `index.html`: added the `supabase-js` CDN script tag plus `supabase-config.js` and `publish.js` — a new dependency, flagged here and in `CLAUDE.md`'s shared rules.
- `CLAUDE.md`: Stack section now documents the real scope (drawings only, not prompts), the anon-key-isn't-a-secret distinction, the moderation gap, and Firebase being crossed out as a team decision, not just mine. Team roles section filled in with everyone's actual week-of items from the plan doc.

**What I checked**
- Read `daily.js` and the publish/gallery call sites in `drawing.js` directly before designing anything, instead of assuming the shape of `prompts`/`day`/`mode`.
- Verified with web searches, not memory: that Supabase's anon key is meant to be public when RLS is on, and the exact `supabase-js` CDN script tag and `createClient` usage, against the library's own README.
- Could not confirm one thing: the exact property name on `getPublicUrl()`'s return value. Supabase's reference page's own examples destructure `data` but never show what's read off it afterward. Left `publicUrl` in the code since it's what every other Supabase example uses, but flagged it in the code, in `CLAUDE.md`, and here — it needs a real console check the first time this runs against a real project.
- Nothing has been tested against a live Supabase project; none exists yet.

**Decisions**
- Prompts stay in `prompts.json`, not Supabase — confirmed this is more flexible for the team, not less, since Supabase only exists on my machine and a teammate can edit a committed file without my credentials.
- Scoped this to "store and show finished drawings" only. Multiplayer lobbies and syncing player actions, also listed as mine in the plan doc, are a separate and bigger task I haven't started.
- No login system, so publishing can't be tied to a real person. Accepted that as a known gap rather than building accounts under deadline pressure — documented it plainly in `backend/README.md` instead of hiding it.

---

## Where AI misread me, or I had to correct course

- Claude's first version of the start page put "What is this?" in the top right, where it collided with the "New set" button on the game screen. I caught it by running the page; Claude hadn't opened it in a browser.
- In session 2, I said "while I'm on main branch," but there was no `main` branch yet. Claude didn't assume what I meant — it asked whether to commit to `Angie` instead, create `main` from `Angie`, or stop, and I picked creating `main`.
- In session 4, I said the two PDFs "should be within the root file." Claude had already searched the repo root and my home folder and found nothing; once I pointed at "the root file," it searched the whole `TCSS 490` folder and found both PDFs in `Unit 4/`, not the repo root.

---

## Decisions and abandoned ideas

- Nothing abandoned yet. Team roles, exact prompt format, branch workflow, and the Supabase-vs-Firebase pick are all still open (see `CLAUDE.md`), not decided and discarded.
