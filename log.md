# Build log: Artifact 4 (Scrawdle)

**AI:** Claude Code | **Editor:** IntelliJ IDEA Ultimate | **Host:** not chosen yet (public repo `kevlam1/Scrawdle`, team of four: `kevlam1`, `arcangieo`, `trentenmuw`, `zainasuw`)
**Stack:** not locked yet — leaning Supabase for the database, plain HTML5 Canvas for drawing. See `CLAUDE.md`.

---

## What we set out to build

Artifact 4 is "For Someone Else," due Sunday, November 8. Our team of four (Kevin, Angie, Trenten, and Zainab) is building Scrawdle, a daily drawing game like Wordle or NYTimes' minigames: a prompt (or a few) each day, a browser canvas with drawing tools, and a chance to see what other players drew once you finish your own. We pitched it for artists and for the general public as a casual daily pastime. When this log started, nothing was built yet: the first entries cover getting the repo and the shared `CLAUDE.md` set up, not any real feature.

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

## 27. Supabase set up for real, a timezone bug fixed, and the daily wipe written (2026-11-04) — Kevin

**What I asked for**
- Asked Claude to walk me through setting up Supabase, then ran it myself: created the project, ran `schema.sql`, made the `drawings` bucket, and filled in `supabase-config.js`. Publishing and the public gallery worked. Then I asked Claude to confirm the database wipes itself daily. It doesn't, so I said I want a real daily deletion so storage doesn't overflow, and that I'm on the free plan.

**What changed**
- `backend/supabase/schema.sql`: the two policies and the cron stub compared `day` to `current_date`, the database's UTC date, but the frontend's `dayKey()` is the player's local date. In Pacific time that breaks publishing and the gallery every evening. Now they allow one day either side. Fixed in the file before the setup walkthrough, but I haven't confirmed which version of the policies is live in my project.
- `backend/supabase/functions/purge-old-drawings/index.ts` (new): an Edge Function that deletes old day folders from the `drawings` bucket through the Storage API and old rows from the table. Keeps today and yesterday by UTC date. Has a `?dryRun=1` mode. Protected by its own `CRON_SECRET` header because JWT checking has to be off for cron to call it.
- `schema.sql`: the old "hide old rows" cron stub is replaced by a commented-out block that schedules the function daily at 10:00 UTC through `pg_cron` and `pg_net`, with the secrets in Vault. Placeholders only, nothing real.
- `tests/purge.test.js` (new, 9 tests): the date maths and folder logic against a fake Supabase client.
- `backend/README.md`: six setup steps for the wipe. `CLAUDE.md` and `README.md` say plainly that the wipe is written but not running.

**What I checked**
- Supabase's docs, read through a fetch agent: deleting storage objects with SQL leaves them orphaned and must go through the Storage API; `remove()` takes up to 1000 paths per call; Edge Functions are on the free plan (500,000 invocations a month); cron callers send a secret on the `apikey` header; and the secret-key environment variable is `SUPABASE_SECRET_KEYS` (with the legacy `SUPABASE_SERVICE_ROLE_KEY` still listed).
- The 9 tests pass, and I broke the function nine different ways one at a time (wrong cutoff, no day-folder check, dry run deleting, ignored errors, skipped batches, missing folder, wrong rows) and every one was caught. The file was restored byte for byte afterward.
- Not checked: anything on the live project. The function has not been deployed or run. The docs didn't show the current Edge Function starter code, so the `Deno.serve` and `npm:` import style, the `SUPABASE_SECRET_KEYS` parsing, the `delete().lt().select()` return, and whether the dashboard has a switch for JWT verification are all unverified until it runs. The docs also never said whether `pg_cron` is on the free plan.

**Decisions**
- Real deletion through an Edge Function rather than a hide flag, since the hide flag frees no space and I want the daily wipe in my pitch to be true.
- A drawing lives about one to two days, not exactly 24 hours, because of the same UTC-versus-local-date gap that broke the policies.
- A dedicated `CRON_SECRET` instead of storing the project's secret key in Vault, so a leak of the cron secret can only trigger a cleanup, not bypass the database.
- Deployed through the dashboard editor, which the docs say has no version control, so the file in this repo is the source of truth.

---

## 28. The daily wipe deployed and scheduled (2026-11-04) — Kevin

**What I asked for**
- Followed Claude through deploying the cleanup function from entry 27, scheduling it, and testing it, sending screenshots at each step. Then told Claude the real delete test and the secret replacement were both done and asked for the docs to match.

**What changed**
- I deployed `purge-old-drawings` in the dashboard editor by pasting the repo file over the starter code, set `CRON_SECRET` in its secrets, and scheduled it through `pg_cron` for 10:00 UTC daily, with the project URL and secret stored in Vault.
- First test through the schedule's own call returned 401 `UNAUTHORIZED_NO_AUTH_HEADER`. That came from Supabase's front door, not the function, because "Verify JWT with legacy secret" was on. I turned it off on the function's Settings tab (the page itself recommends off when the function has its own auth).
- After that, the same call returned 200 with `"dryRun":true`, `"cutoff":"2026-11-03"`, no old days, and no files.
- `CLAUDE.md`, `README.md`, `backend/README.md`, `frontend/README.md`, the header comment in `schema.sql`, and the comment in `supabase-config.js` now say the wipe is deployed. They also say a local copy of the game publishes to the real project, since the real URL and key are committed.

**What I checked**
- Seen in screenshots: the policies in the live database use the one-day UTC window (entry 27's fix is live), the 401 and then the 200 dry run, and the cron job being created (job id 2).
- Reported by me, not seen by Claude: a real run deleted a test file and row I made under `2026-01-01`, and I replaced the `CRON_SECRET` and re-ran the dry run after the first one appeared in a screenshot. The docs say "reported by Kevin" for these.
- That 200 settled what entry 27 listed as unverified: the `Deno.serve` style and the `npm:` import work, the secret key is read correctly, and the listing and row query work. `pg_cron` works on the free plan.
- Not seen yet: a scheduled run at 10:00 UTC on its own. To do: check the function's Logs tab after the first one.

**Decisions**
- Left "Verify JWT" off and kept the `CRON_SECRET` header as the only guard. Rotating that secret if it leaks means changing it in two places (function secrets and Vault).
- Left the publishable key and project URL committed in `supabase-config.js`, since the key is meant to be public. The cost is that anyone running the game locally publishes to the real gallery, which the README now says.

---

## 29. Lobbies, and a Daily Scrawl mode (2026-11-04) — Kevin

**What I asked for**
- Asked Claude to set up multiplayer lobbies joined by a 5-letter code or a link like `scrawdle.vercel.app/?ABCDE`, with a Create Lobby option on the front page that just makes a private room, so my teammates' Claudes can build their games on top of it. Also asked for a "Daily Scrawl" card on the front page: like the original but a free draw that saves and deletes daily.

**What changed**
- `frontend/lobby.js` and `lobby.css` (new): a Lobby card on the home screen (Create Lobby, or type a code), invite links, and a lobby room that shows the code, a copy-link box, who's in it (the longest-present player is the host, up to 8 players), and a Games list. Games plug in with `ScrawdleLobby.registerGame`, and the contract is written at the top of the file.
- `backend/supabase/schema.sql` and `updates/001-lobbies-and-daily-scrawl.sql`: a `lobbies` table that nobody can read or write directly, plus two functions the public key may call (`create_lobby()` makes a code, `lobby_exists()` checks one), the `scrawl` drawing mode, and a daily cleanup of old lobby codes. Who is in a lobby and every game message are not stored: that's Supabase Realtime.
- Daily Scrawl: a home card, its own save slot in `drawing.js` that clears each day, no slot machine, and no "does it match the parts?" buttons. It uses one pseudo-prompt, "Draw anything", so the prompt bar, finish screen, PNG, and gallery work without changes. I touched `drawing.js` and `index.html` only in a few small spots because Zainab's and Angie's work is live in them.
- The cleanup function now walks whatever mode folders exist, instead of a fixed list, so Daily Scrawl's `scrawl` folder (and a teammate's future game) is cleaned too. **The deployed copy is still the old one.**
- `CLAUDE.md` has a new "Lobbies and adding a multiplayer game" section for the other three sessions; `README.md`, `backend/README.md`, and `frontend/README.md` are updated.

**What I checked**
- 41 logic tests pass (14 drawing, 3 brush, 11 cleanup, 13 lobby). I broke each new module on purpose several ways and every broken copy was caught after I fixed two weak spots in my own tests.
- Ran the SQL against a real Postgres (PGlite, installed in a scratch folder outside the repo, Apache-2.0, deleted afterwards): 17 checks, including the old schema with update 001 on top (twice), the public key being unable to read or touch lobby rows, and what happens when every code is taken.
- 65 checks in headless Chrome across up to ten tabs at once, then screenshots at desktop and phone width: lobby create, join by link and by typed code, bad codes, rename, leave, host hand-over, the 8-player cap, a test game started, played, joined mid-game, and ended, and the whole Daily Scrawl flow including a day rollover.
- **Not checked:** anything against the live Supabase project. The browser tests used an in-page stand-in for Supabase's realtime service. It had to guess the shape of a broadcast callback's argument and how a repeated `track()` updates presence (the docs don't say); `lobby.js` tolerates both, but that is a guess until it runs for real. Not checked either: a real phone, Safari, Firefox, or more than a few real people at once.

**Decisions**
- Lobby codes are made by the database and recorded, so a mistyped code can be told from a real lobby, instead of the page inventing codes. That costs one small table and means I run one SQL file.
- Generated codes use 20 consonants only, so a random code almost never spells a word (nobody gets a rude lobby). Typed codes can be any 5 letters. My example `ABCDE` has vowels, so generated codes won't look like it.
- The lobby has no game of its own: the room, the player list, and a contract only, because that's the part I own.
- Daily Scrawl is a mode with a pseudo-prompt, not a new kind of round, to keep my edits to my teammates' files tiny.
- Nothing is pushed. Before it goes to `main` I have to run update 001 and redeploy the cleanup function, or the Lobby card will show on the live site and fail, and Daily Scrawl drawings will be refused by the database.

---

## 30. Pushing lobbies and Daily Scrawl to main (2026-11-04) — Kevin

**What I asked for**
- Asked how to redeploy the cleanup function, asked what happens to an inactive lobby code, then told Claude "everything's tested" and to commit and push all of it to `main`.

**What changed**
- The docs (`CLAUDE.md`, `README.md`, `backend/README.md`) now say the lobby SQL, the redeploy, and the live testing were done by me, marked "reported by Kevin", instead of saying they were still to do. Claude was not able to see my Supabase project, so it did not write them as observed.
- Everything from today goes to `main` in one push, including the two earlier commits that were never pushed (the Supabase scaffold and the daily wipe).
- Answer to my question about inactive lobby codes: a code is deleted by age, not by use. The cleanup runs at 10:15 UTC and removes codes more than a day old, so a code lives 24 to 48 hours whether or not anyone is in it. People already inside stay connected, but nobody new can join once it's gone. I chose to leave it that way for now.

**What I checked**
- Claude ran all 41 logic tests once more before the commit (all pass) and scanned the files for keys; found none.
- I did not give Claude which checks I ran on the live project. So whether update 001 ran cleanly, the function was redeployed with "Verify JWT" still off, and the two realtime details held (the shape of a broadcast message, and how a name change updates presence) has not been confirmed in a session.

**Decisions**
- Pushed straight to `main` as I asked, instead of `kevin` first, even though Claude suggested a branch first, because I'd tested it.
- Left lobby codes expiring by age. If lobbies need to last longer than a day while in use, the fix is a `last_used` column that joining refreshes.

---

## 31. A logs page at /logs (2026-11-04) — Kevin

**What I asked for**
- Asked Claude for a logs page that displays `log.md`, something like `scrawdle.vercel.app/logs`.

**What changed**
- My rules say to copy the generator from MIDI Companion instead of writing a new one, so `scripts/make-logs-page.mjs`, `scripts/logs-template.html`, and `scripts/log-summaries.mjs` are copies, adapted. They write `frontend/logs/index.html`, which Vercel serves at `/logs` because `frontend/` is the site's output folder.
- Adaptations for this repo: headings may end with `— Kevin`, `— Angie`, and so on, and the author shows as a yellow tag on each entry (the old generator stopped on that heading); a `--check` mode that fails if the page is out of date; titles with code in them show it as code; and the page is themed like the game (paper and yellow, the game's own Patrick Hand heading font) instead of MIDI Companion's dark orange one. I dropped the favicon and font links that don't exist in this repo.
- The page has all 30 entries, the "What I set out to build" intro, and the two closing lists, with a Contents menu and Expand all / Collapse all. Nothing in the game links to it.
- `tests/logs-page.test.js` fails if `log.md` changed and the page wasn't regenerated. **That adds a step for everyone who writes a log entry:** write a one-sentence summary in `scripts/log-summaries.mjs` and run the generator. It is now in the log protocol in `CLAUDE.md`.
- Claude drafted the one-sentence summaries. For my entries they are in my voice; for Angie's, Zainab's, and Trenten's entries Claude wrote them in the first person of each author from their entries, and they haven't seen them.

**What I checked**
- The generator checks that every word of `log.md` is on the page, and it passed. The page shows 32 entries (30 plus the two closing lists) with 15 tags for me, 11 for Zainab, 3 for Angie, and 1 for Trenten, which matches the log.
- Broke the log and the summaries six ways (a changed word with no regeneration, a new entry with no summary, the same entry with one, a heading with no author, skipped numbering, a stray heading): each failed or behaved as it should. Every file was restored byte for byte afterward.
- 21 checks in headless Chrome and screenshots at desktop and phone width: the Contents menu, opening an entry from it, Expand all and Collapse all, a `#entry-22` link opening Trenten's entry, no sideways scroll on a phone, no console errors. The font loaded.
- On my live MIDI Companion site, `/logs` and `/logs/` both answer 200, and Vercel's docs (as summarized by a fetch agent, not read directly) say both forms are served when `trailingSlash` isn't set. **Not checked: that this site's `/logs` answers without the slash, because it isn't deployed yet.**

**Decisions**
- Kept the page out of the game's own screens and kept the `noindex` tag, as on MIDI Companion.
- Left the existing text alone even though two parts are out of date: "What I set out to build" says nothing is built and lists three people, and "Decisions and abandoned ideas" says everything is still open. The page shows them as written because the log protocol says not to rewrite old entries without asking. I should rewrite those two when I have a minute.

---

## 32. A link to the build log from the game (2026-11-04) — Kevin

**What I asked for**
- Asked Claude to add a way to reach the log from inside Scrawdle, saying this is the last change from me, and then to commit and push everything to both the `kevin` branch and `main`.

**What changed**
- The home screen has a "Read our build log" link, next to "Explore sample drawings", that opens `/logs/`. Before this, nothing in the game linked to the logs page.
- The game's quiet-link style was made for buttons and an anchor would have shown in the browser's default blue, so `frontend/lobby.css` (the stylesheet that loads last) sets the link to the same grey as the sample-drawings button beside it. I did it there instead of in a teammate's CSS file.
- The four places that said "nothing in the game links to it" (the page template, `CLAUDE.md`, `README.md`, `frontend/README.md`) now say it's linked from the bottom of the home screen. The `/logs` page was regenerated.
- The link uses `/logs/` with the trailing slash, since that is the form I have seen work on my MIDI Companion site.

**What I checked**
- 10 checks in headless Chrome with screenshots at desktop and phone width: the link exists and points at `/logs/`, it is the same colour as its neighbour and underlined, it is 44 pixels tall, nothing scrolls sideways on a phone, clicking it opens the log page with all 33 entries and the two closing lists and a way back to the game, and there were no failed requests or console errors.
- All 42 tests pass, including the one that fails if the logs page is out of date.
- Not checked: the live site. This log page isn't deployed until this is pushed, so whether `/logs` also works without the trailing slash on this site is still unconfirmed.

**Decisions**
- Used a small text link at the bottom of the home screen, not a card or a header button, because the log is for reading about the project and not part of playing.
- Kept the `noindex` tag on the logs page so search engines still skip it, even though the game now links to it.

---

## 33. Renaming Daily Scrawl to Daily Free Play (2026-11-04) — Kevin

**What I asked for**
- Asked Claude whether renaming the mode in the table would cause problems, because what I built as "Daily Scrawl" should have been called "Daily Free Play", and someone else on the team will later combine Basic and Detailed and call that "Daily Scrawl". After Claude's answer I kept the name Daily Free Play, and asked for a note in `CLAUDE.md` that picks up if a teammate is working on the merge.

**What changed**
- Only the name people see changed: the home card heading and button, the prompt label on the game screen, the label in the "Continue drawing" card, the one-line "prompt" that ends up on the finished PNG, and the How to play text, all in `frontend/index.html`, plus the wording in `README.md` and `frontend/README.md`.
- The internal id `scrawl` did not change. Claude searched the repo first: the database's `drawings.mode` check constraint and insert policy (`schema.sql`, update `001`), the save slot in `drawing.js`, and two test files all use it, and changing it would have needed a new database update that I'd have to run before pushing. A database that refuses the id would make publishing fail.
- `CLAUDE.md` has a new section, "Mode names, and the planned Basic + Detailed merge". It says the name "Daily Scrawl" is reserved for the merged mode, that nobody is known to be building it yet, that whoever does should add a line under Status saying who and on which branch, that it needs a new id and a new `002-...` database update run before the frontend is pushed, and that "Free play" and "Daily Free Play" are two different things.

**What I checked**
- All 42 tests pass.
- Claude drove headless Chrome at desktop and phone width: the home card says Daily Free Play, the game screen says Daily Free Play with "Draw anything", the judge buttons are still hidden, nothing scrolls sideways, and I looked at the screenshots. The first phone "home" screenshot was really the game screen (see below), so it was retaken.
- Not checked: the live site (nothing pushed), the finished PNG, the gallery, or the "Continue drawing" card. A drawing someone has already saved today probably still carries the old "Daily Scrawl" label inside it until the day rolls over; that comes from reading the code, not from a test.

**Decisions**
- Kept the id `scrawl` and the filename `001-lobbies-and-daily-scrawl.sql` as they are, rather than renaming them for tidiness; the old entries in this log also still say "Daily Scrawl", since they describe what was true then.
- The merged mode will need its own new id (for example `daily`), not `scrawl`, so a player's saved free draw isn't opened as the merged mode.

---

## 34. Fixed lag in the line tool and the marker and watercolor brushes (2026-11-05) — Trenten

**What I asked for**
- The line tool lags badly when I draw more than a few lines in quick succession, and the brushes lag too. I asked Claude to find out why, then to fix both the line tool and the layered brushes (marker and watercolor).

**What changed**
- `frontend/drawing.js`:
- The line tool used to put back the whole 1800×1200 canvas and redraw its preview for every point the mouse sent, which can be many per frame. Now it redraws at most once per frame, and only puts back the area the previous preview covered.
- Marker and watercolor did the same full-canvas redraw for every point. Now they redraw at most once per frame, and only inside the stroke's own area.
- A line now saves just its start and end points instead of every point the mouse passed through (about 67 per line in a test), so saves are smaller and replay has less to redo. Lines saved before this still replay, since replay draws whatever points a line has.
- Letting go always finishes the drawing right away, even if no frame was drawn since the last move, so a quick flick still leaves its line.

**What I checked**
- Claude timed the strokes in a browser before and after, on the same 1800×1200 canvas. Letting go of a line went from 60–120 ms to about 4 ms; marker and watercolor from about 240–260 ms to about 12–13 ms. Each mouse movement went from 1.4–5.5 ms to about the same as the pen (under 0.1 ms). A long line drag with 120 mouse points used to put back about 260 million pixels; now it's about 16 million in total, roughly 0.6 ms per frame.
- A replay of a drawing with lines, marker, watercolor, a marker crossing a line, and pen came out pixel-for-pixel the same as the live drawing. Undo after a line that wandered across the canvas restored it exactly. The line's preview disappears from where it was once the line moves on.
- I installed Node so the team's tests could run. All 42 pass, both on `main` before this change and with it. Those tests cover helper functions (the paint bucket, undo history, save slots), not the stroke drawing itself, so the browser checks above are what cover this change. Regenerated the `/logs` page with `node scripts/make-logs-page.mjs`.
- Not checked: timings came from the app's built-in browser running in the background, with a timer standing in for screen frames, so the numbers are rough; I haven't felt it with a real mouse, a stylus, or on a phone.

**Decisions**
- Kept everything inside `drawing.js` rather than adding a second see-through canvas on top of the board for the line preview. Redrawing just the line's area once per frame was enough, and it doesn't touch the page's layout.
- Every new stroke still copies the whole canvas once when it starts (about 10–15 ms), for undo. That's the same for every tool, so I left it for now.
- `drawing.js` is Zainab's code; she gave me permission to work on it.

---

## 35. Votes replace the self-judged win (2026-11-05) — Trenten

**What I asked for**
- A real win-lose condition: other players vote on shared drawings with a thumbs up or thumbs down, and one thumbs up from anyone means you've won that drawing. I asked Claude to plan it first, since the system will be built on and changed later, then to build it with the choices it recommended: remove my Accurate/Inaccurate buttons, let anyone vote with an id kept in their browser, hide the buttons on your own drawing, and allow votes in every mode, Daily Free Play included.

**What changed**
- `backend/supabase/updates/002-votes.sql` (new) and `backend/supabase/schema.sql`: a `votes` table (drawing, voter, up or down) that the public key can't read or write directly, like Kevin's lobby codes, plus two functions it may call: `cast_vote` (vote, change your vote, or take it back) and `vote_counts` (thumbs up and down for a list of drawings, plus your own vote). Votes are deleted with their drawing, so the daily wipe clears them with no new schedule. Only drawings the gallery can show (today's, not hidden) take votes.
- `frontend/votes.js` (new): the rules on their own, so they're easy to change: one thumbs up wins, pressing your vote again takes it back, pressing the other button switches it.
- `frontend/publish.js`: a published drawing's id is now made in the browser and remembered, so the game knows which drawing is yours. The gallery's cards now carry their id and votes, and `window.scrawdleVote` saves a vote. Each browser gets a random voter id. If the database doesn't have update 002 yet, the gallery still loads, just without vote buttons.
- `frontend/gallery.js` and `flow.css`: 👍 and 👎 buttons with counts on other players' drawings, showing the new vote straight away and putting the old one back with a message if saving fails. Your own card says "You won!" with the tally, "Waiting for votes.", or "Publish it to get votes."
- `frontend/index.html` and `flow.css`: removed the Accurate/Inaccurate buttons and their styles, and updated How to play.
- `tests/votes.test.js` and `tests/publish-votes.test.js` (new). The second runs the real `publish.js` against an in-memory stand-in for Supabase.
- `README.md`, `frontend/README.md`, `backend/README.md`, `CLAUDE.md`: what was built, the new test files, and that Kevin needs to run update 002.

**What I checked**
- All 58 Node tests pass: the 42 from before, 9 for the vote rules, and 7 for `publish.js` (publishing marks the drawing as yours, someone else's thumbs up is a win, changing and taking back a vote, your drawing's result still showing when it's older than the 24 the gallery lists, a drawing published before votes existed, and the gallery still loading before update 002 is run).
- In a browser, with stand-ins in place of Supabase so nothing reached the live project: the vote buttons, counts, taking a vote back, switching it, a failed save putting the old vote back, the "You won!", "Waiting for votes." and "Publish it to get votes." results, and no buttons when voting isn't set up. Looked at it at desktop and phone width (buttons stay 44 px tall, nothing scrolls sideways), and the drawing screen without the judge row.
- The SQL, in PGlite (real Postgres in WebAssembly, what Kevin used for update 001), with stand-ins for Supabase's public role, storage schema and `cron.schedule`: 16 of 16 checks pass. Update 002 runs on top of Kevin's original schema plus update 001, and runs a second time without an error; a fresh project's `schema.sql` runs on its own. As the public role: publishing with an id the game made, counting, one vote per voter, switching and taking back a vote, refusing bad votes and votes on hidden, old or missing drawings, no way to read or write the `votes` table directly, and votes deleted with their drawing. To check the checks, Claude broke the SQL two ways in a copy (dropped the hidden-drawing rule, and the table's Row Level Security), and 4 checks failed as they should. The test script and PGlite stayed in a temporary folder, not in the repo, so no new dependency was added.
- Not checked: nothing has been tried against the live project.

**Decisions**
- Votes are the win condition for every mode. In Daily Free Play, which has no parts, a thumbs up just means another player liked it.
- There's still no login, so a determined player can vote twice (by clearing browser data) or vote for their own drawing (by calling the database directly). Supabase's anonymous sign-in would fix the first; recording who published each drawing would fix the second. Both are left for later.
- The win rule lives in `votes.js` rather than the database, so it can change without asking Kevin to run another update.
- Kevin has to run `002-votes.sql` on the live project before this reaches `main`.

---

## 36. A to-do list for database updates in `CLAUDE.md` (2026-11-05) — Trenten

**What I asked for**
- Kevin will probably have his AI run the votes update, so I asked Claude to make sure there's a note it will find, with what to run and what to update afterwards.

**What changed**
- `CLAUDE.md`: a new section near the top, "Pending database updates", which every session reads first. It lists `002-votes.sql` with steps: read it, run it once, stop and report the raw error if it fails, two SQL queries and an in-app check to confirm it worked, and which notes to update afterwards. Whoever runs an update removes its entry, so the list shows what's still waiting.
- `backend/supabase/updates/002-votes.sql` and `backend/README.md`: both point to that section.

**What I checked**
- The steps match what was tested in entry 35 (running it twice is harmless). Nobody has followed them on the live project yet.

**Decisions**
- Put the note in `CLAUDE.md` rather than only in the SQL file, because every teammate's session reads `CLAUDE.md` first, and Kevin's session won't necessarily open the updates folder. It only reaches Kevin's session once this branch is merged into `main`, or if his session reads the `Trent` branch.

---

## 37. Scrawdle Party, the first lobby game (2026-11-05) — Trenten

**What I asked for**
- A checklist for the features we're keeping (a lobby game, a streak, a daily leaderboard that resets each day, yesterday's winner, a time challenge, and guess the parts), starting with the lobby game: plan it fully before any code, then build it. I asked whether drawings could be sent at 900 by 600 instead of the 600 by 400 in the plan, and Claude measured it first (see Decisions).

**What changed**
- `frontend/party.js`, `party-rules.js`, `party.css` (new), loaded after `lobby.js` in `index.html`. The host picks Basic or Detailed parts, 1, 3 or 5 rounds, and 60, 90 or 120 seconds. Each round: everyone sees the same random parts, draws with the full set of tools against a timer, then gives every other drawing a thumbs up or down with names hidden. The results show who drew what, the votes, "Won the round" for anyone with a thumbs up (the daily gallery's rule) and "Top drawing" for the most thumbs up. Each thumbs up is a point; the last screen shows the final standings.
- The host's page runs the game (rolls the parts, ends each phase, counts votes) and every page draws from the messages, so everyone sees the same result. A round ends as soon as everyone is done, or when the timer runs out (drawings send themselves, spread over about a second so they don't all hit Supabase at once). Players who join mid-round sit it out; players who leave keep their points and aren't waited for; if the host leaves, the game ends.
- Nothing is stored and there's no database update: drawings and votes only travel as lobby messages, as the lobby rules in `CLAUDE.md` ask.
- `frontend/drawing.js`: `createBoard` takes an optional `idPrefix`, so a second board's controls don't repeat the main board's ids. The party reuses Zainab's board this way, and never gives it a round, so it never saves over a player's own drawings.
- `tests/party-rules.test.js` (new); `README.md`, `frontend/README.md`, `CLAUDE.md` updated.

**What I checked**
- 11 new Node tests for the rules (scoring, winners, ties, self-votes not counting, a phase ending without waiting for players who left, settings, rolling parts from the real `prompts.json`). All 69 Node tests pass.
- Before building: a second board on the page draws, undoes, has no repeated ids, and left the saved drafts exactly as they were.
- In a browser with a stand-in lobby (each player is the real page in its own frame; messages are passed between them as JSON with small random delays): a full 3-round game with Ana, Ben and Cal: same parts for everyone, Cal's blank canvas left out of voting, no buttons on your own drawing, a switched vote counted once, correct scores and tied places. Round 2: Cal left mid-drawing and the round went on without her (her points stayed); Dan joined mid-round, was told he'd join next round, and played round 3. Round 3: nobody pressed Done, and the drawings sent themselves when the timer hit 0:00, and voting ended by itself after 30 seconds. Final scores, "Back to lobby", and the host leaving mid-round (everyone sees "The host left" and the new host ends it). Layout measured at 1280 by 800 and 375 by 812: nothing overlaps or scrolls sideways; on a phone the drawing screen scrolls down to "Done drawing", like the main one.
- On the live lobby, with two tabs of the local page as two players (lobby `CLCPM`, made for the test and deleted by the daily job): both got the same parts over Supabase Realtime, both drawings arrived (WebP, about 12 to 13 KB each), the votes counted on both sides, the results and "Ben wins!" final screen showed in both tabs, "Back to lobby" returned both to the lobby room, and both left cleanly. No errors in either tab's console.
- Not checked: more than two real players, players on different computers or networks, Safari or Firefox, a real phone, and a close look at the screens (the preview pane was too small for useful screenshots, so the layout was checked by measuring).

**Decisions**
- 900 by 600 drawings: Claude drew test pictures on the real board and measured them at that size. A simple drawing was 21 KB as WebP, a busy one 49 KB, and one loaded with spray, watercolor, crayon and paint-bucket fills 113 KB (136 KB as JPEG), all under the 256 KB message limit even after the third added by sending it as text. PNG was too big (up to 636 KB). So it's WebP where the browser can make it, JPEG otherwise, with lower quality and then a smaller size only as a fallback.
- Names are hidden while voting, so votes go to the drawing. Thumbs down don't take points away.
- The parts are random each round (not the daily ones), so a party doesn't spoil today's.
- A short "Your parts" screen replaces the slot machine from the main game, to keep the game's code separate from `index.html`.
- If the host leaves, the game ends rather than passing a half-finished round to someone else.

---

## Where AI misread me, or I had to correct course

- Claude's first version of the start page put "What is this?" in the top right, where it collided with the "New set" button on the game screen. I caught it by running the page; Claude hadn't opened it in a browser.
- In session 2, I said "while I'm on main branch," but there was no `main` branch yet. Claude didn't assume what I meant — it asked whether to commit to `Angie` instead, create `main` from `Angie`, or stop, and I picked creating `main`.
- In session 4, I said the two PDFs "should be within the root file." Claude had already searched the repo root and my home folder and found nothing; once I pointed at "the root file," it searched the whole `TCSS 490` folder and found both PDFs in `Unit 4/`, not the repo root.
- **Wrong day comparison in the Supabase schema (Claude's slip, entry 26, found while writing the setup walkthrough on 2026-11-04):** `schema.sql` compared each drawing's `day` to `current_date`, which is the database's UTC date, but `dayKey()` in `drawing.js` is the player's local date. In Pacific time, after about 4 to 5 pm the two differ, so publishing would have been refused and the gallery would have come back empty every evening, and the hide job would have hidden drawings still counted as today's. Nothing had been run against a real project yet. Fixed by allowing a one-day window either side (`current_date - 1` to `current_date + 1`) and hiding only rows older than `current_date - 1`. I also broke the `$$` in the commented cron job with a JavaScript `String.replace` while fixing it, the exact pitfall in the shared notes, and caught it when I re-read the file.
- **An invented date, and a scheduling block that was easy to run unfilled (Claude's slips, entries 27 and 28):** Claude wrote into `backend/README.md` that publishing was checked "on 2026-11-05", a date it had no evidence for, and caught it and changed it to say only what Kevin had reported. Separately, Claude gave Kevin the scheduling SQL as a commented block with several placeholders, and Kevin ran it once before filling them in, which created a scheduled job and two Vault secrets with junk values. It was harmless (the job could only call a URL that doesn't exist), and Claude gave him statements to remove them; whether he ran them was not confirmed in the session, though the next job id (2) suggests he did. The block should have been handed over with the project URL already filled in and one obvious placeholder, which is how Claude gave it the second time. Kevin also showed his `CRON_SECRET` in a screenshot and replaced it afterward (reported by him).
- **Two real bugs in the first lobby code, both found by running it in a browser, not by reading it (Claude's slips, entry 29):** (1) Leaving a lobby cleared the channel before telling Supabase to untrack, and the untrack triggers one last update that the handler read from the channel Claude had just cleared, so it crashed and the lobby never closed; every handler now ignores a channel that's no longer the current one. (2) Dropping a late joiner into a game already running was only attempted on the first presence update, but that update can contain only the joiner (the others' entries arrive after), so it silently did nothing; it is now a short window after joining that closes when any game starts or ends. Neither was caught by the helper tests, because both depend on the order events arrive in.
- **A layout that passed every check and was visibly broken (Claude's slip, entry 29):** the Lobby card's Join button overflowed the card whenever a saved drawing was showing, because an existing rule in `flow.css` forces every home button to full width with an id selector. All 65 browser checks passed anyway, because the checks tested values, not how it looked; only the screenshot showed it. Fixed by matching that rule's specificity, after printing what the browser actually computed instead of guessing.
- **Weak or wrong tests of my own (Claude's slips, entry 29):** a lobby test compared two different random names (nonsense, fixed to check that every generated name survives cleaning); a cleanup test expected a file three folders deep to be found, which our code never makes (fixed the test, not the code); and one broken copy of the host ordering survived because the test's ids happened to be alphabetical in join order, so it passed with the join-time sort deleted (added a case where they differ). I also wrote "54 logic tests" in `CLAUDE.md` from memory and recounted to find 41.
- **Four faults in my own checks while building the logs page, none in the page (Claude's slips, entry 31):** (1) A "break it on purpose" test changed a phrase that isn't in `log.md`, so nothing changed and it reported "survived"; I only noticed because it should have failed. (2) Another one read a file from `/tmp`, which Node on Windows resolves to a different folder than Git Bash does. (3) The browser script waited forever for a page-load event that never comes when only the `#hash` of a page changes, and hung until it was stopped. (4) A link check searched the whole page for "midi-companion", which the log text legitimately mentions twice, so it failed on correct output. Each was fixed in the check, and the page's real links were read directly to confirm they were right.
- **A party round that would have stalled (Claude's slip, entry 37, caught by the stand-in lobby test):** the host counted everyone in the lobby as a voter, including a player who joined mid-round and never got the drawings, so the round would have waited the full 30 seconds plus grace for a vote that couldn't come. Fixed so only the round's players are waited for. Claude's helper in that test also first grabbed the real lobby's empty game area instead of the test's, which looked like a missing button until it checked what was on the page.
- **The generator would have stopped on our own headings (found before running it, entry 31):** the copied script only accepted `## N. Title (date)`, and every heading here now ends with `— Name`. Reading the script first caught it; running it unchanged would have failed with "Unexpected section".
- **Backticks in a shell command, the exact mistake our shared notes warn about (Claude's slip, entry 32):** a one-line script that edited four docs had backticks inside a single-quoted shell string, so the shell refused to run it. Nothing was changed, but it was a mistake the notes list by name. The edits were made with the editing tool instead. Separately, Claude's first check of the new link's colour failed because it expected the link to match the "Explore sample drawings" button, which turns out to have its own softer grey set in `flow.css`; the link was changed to match.

- **A phone screenshot that wasn't the screen I thought (Claude's slip, entry 33):** Claude's browser check printed the right text for the phone home screen and moved on, but the screenshot it took was the game screen, because the page had restored the drawing left open by the desktop run. Claude noticed when it looked at the image instead of trusting the printed values, cleared the saved state, and retook it.

---

## Decisions and abandoned ideas

- Nothing abandoned yet. Team roles, exact prompt format, branch workflow, and the Supabase-vs-Firebase pick are all still open (see `CLAUDE.md`), not decided and discarded.
- (Kevin, 2026-11-04, entry 33) The free-draw mode is "Daily Free Play" on screen but keeps the id `scrawl` underneath, and the name "Daily Scrawl" is saved for the Basic + Detailed merge a teammate will build, which gets its own new id. Dropped: renaming the id now, because that needs a database update for a cosmetic gain.
- (Kevin, 2026-11-04, entry 33) Basic and Detailed will go away as separate modes and become the one "Daily Scrawl". When that ships, their database values stay allowed for a day and are removed in a later update; they are not renamed in place. Noted in `CLAUDE.md`.
