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

## 38. The browser's Back button stays in the game (2026-11-05) — Zainab

**What I asked for**
- Pressing the browser's Back button while drawing left Scrawdle completely. It's the home-page navigation bug on the team's list, and I took it.

**What changed**
- `frontend/index.html`: opening a drawing adds one entry to the browser's history. Back now closes the finish screen, the gallery, or help first, then returns to the home screen, where the drawing is offered under "Continue drawing". Forward reopens it. One more Back from the home screen leaves the site, as before.
- The "Back to home" buttons on the game and finish screens, and Start over, go through the same history, so the browser's Back afterwards doesn't need an extra press.
- The lobby's invite links already change the address with `replaceState`. This keeps whatever state is there and only adds its own key.

**What I checked**
- All 42 logic tests pass. 29 checks in Chromium: Back and Forward from Basic, Daily Free Play, and Free play; Back during the Detailed reveal; Back from the finish screen, the gallery, and help; the in-page Back to home buttons; after a refresh; after Start over; with two saved drawings; and no page errors. One check failed at first because it compared a label without noticing the page shows it in capitals. The page was right.
- Not checked: Safari, Firefox, a phone's back gesture, or the lobby, because joining one would create a real lobby in Kevin's project.

**Decisions**
- Back never throws a drawing away. It stays saved and shows on the home screen.

---

## 39. Color names, for colorblind players and screen readers (2026-11-05) — Zainab

**What I asked for**
- The color buttons only had codes like "#da382e" as their names, so a screen reader read the code out and nothing helped anyone who can't tell two colors apart. A colorblind color tooltip is on the team's list, and I took it.

**What changed**
- `frontend/drawing.js`: each of the 12 colors has a plain name (Black, Gray, White, Red, Orange, Yellow, Green, Teal, Light blue, Dark blue, Purple, Pink). Hovering shows it, and screen readers read it instead of the code.
- Hovering doesn't work on touch screens, so the settings panel's title now names the color too: "Pen · Red", "Brushes · Red", "Bucket · Red". The eraser just says "Eraser". A color from the color wheel says "Custom color".
- `tests/colors.test.js`: every color has a name, no two share one, and no name is a code.

**What I checked**
- 44 logic tests pass. 23 checks in Chromium: the names on hover and for screen readers match, the title follows the tool and color, the eraser and custom color, and that the title fits on one line without overlapping the size at 1440x900, 1280x800, 390x844, and 320x740. I looked at the panel at the widest and narrowest sizes.
- Not checked with a real screen reader, or by a colorblind player.

**Decisions**
- The names are short, everyday words rather than exact shade names, so they're quick to read.

---

## 40. My drawings: keeping drawings after their day ends (2026-11-05) — Zainab

**What I asked for**
- The team asked me to add saving. Drawings already saved in the browser, but today's was thrown away when the day ended, and a Free play drawing was lost when a new set replaced it. I wanted players to keep what they make.

**What changed**
- `frontend/drawing.js`: when a day ends, that day's Basic, Detailed, or Daily Free Play drawing is kept instead of thrown away. So is a Free play drawing, or today's in the other mode, when a new round replaces it. A drawing cleared with Start over isn't kept, because that button already says it will be lost, and blank rounds aren't kept either. The 60 most recent are kept, and the oldest go first.
- They're stored in the same browser storage as the drafts, under their own keys, so the storage didn't need a new version. A page still open on the old code keeps saving normally.
- The download with the parts and date written under the drawing is now one shared function, used by the finish screen and by My drawings.
- `frontend/sketchbook.js` and `sketchbook.css`: a "My drawings" link on the home screen opens a page in the gallery's style. Today's drawings show as "in progress" with Continue and Download, and kept ones show their mode, date, and parts with Download and Delete.
- The two confirmations that replace a drawing now say the old one is kept in My drawings.
- `tests/my-drawings.test.js`: kept drawings sort oldest first, only the oldest go past the limit, and drafts are never dropped.

**What I checked**
- 47 logic tests pass. 21 checks in Chromium: the empty page, an in-progress drawing with Continue and Download, the downloaded PNG's size, a replaced Free play drawing, a day ending (by changing a saved drawing's date to an earlier day), Daily Free Play, switching Basic to Detailed, Start over, a blank round, Delete surviving a refresh, a phone-size page with nothing running off the side, and no page errors. The Back button and color checks from entries 38 and 39 still pass. I looked at the page on a laptop and a phone.
- Not checked: Safari or Firefox, a real phone, or what happens when a browser runs out of storage.

**Decisions**
- Drawings stay only in that browser and are never uploaded. Clearing the browser's data deletes them, and Safari deletes a site's saved data after about 7 days without a visit. The page says so.

---

## 41. The sample drawings are gone (2026-11-05) — Zainab

**What I asked for**
- The team didn't like the strawberry sample drawings, so I took them out.

**What changed**
- `frontend/index.html`: the home screen's "Explore sample drawings" button is gone. "My drawings" takes its place and its spacing.
- `frontend/drawing.js`: the finish screen's "View sample gallery" button is gone. When publishing isn't connected, the finish screen just has no gallery button.
- Not removed yet: the samples code in `frontend/gallery.js`, its two CSS rules in `flow.css`, and `assets/sample-strawberries.webp`. Nothing in the game reaches them now, and the image only loads when that code runs. Trenten's unmerged gallery changes edit the same lines, so I'll remove them after his work is merged instead of causing a conflict.
- `README.md` and `frontend/README.md` say the same.

**What I checked**
- 47 logic tests pass. 12 checks in Chromium, with publishing connected and with it turned off: no sample drawings on the home or finish screen, My drawings still there, the gallery button only when publishing is on, Download and Replay still there, and no page errors. The checks from entries 38, 39, and 40 still pass.

**Decisions**
- Left the leftover code for one more merge instead of editing lines Trenten is changing.

---

## 42. Old Free play drawings move to My drawings (2026-11-05) — Zainab

**What I asked for**
- An old Free play drawing from testing kept showing as "Continue drawing" on the home screen days later, because Free play drawings never expired. I wanted the home screen to only show today's drawings.

**What changed**
- `frontend/drawing.js`: when the day changes, a Free play drawing now moves to My drawings, the same as Basic, Detailed, and Daily Free Play. It can still be downloaded there, but not drawn on any more, which is how the daily drawings already worked.
- `README.md` says the same.

**What I checked**
- 74 logic tests pass. 25 My drawings checks in Chromium pass, including new ones: today's Free play is offered to continue, and one from an earlier day leaves the home screen and shows in My drawings with its date. The Back button checks still pass.

**Decisions**
- Someone mid-way through a Free play drawing at midnight can't keep drawing on it the next day. That matches the daily drawings, and nothing is lost.

---

## 43. Dark mode (2026-11-05) — Zainab

**What I asked for**
- Light and dark settings are on the team's list, and I took them. I asked for the colors to follow what designers recommend for dark mode, not guesses.

**What changed**
- `frontend/theme.css`: dark mode, applied only when the page has `data-theme="dark"`, so the light look is the other style files exactly as they were. It changes colors only. The canvas, every drawing, the finished picture, and the drawings in the gallery and My drawings stay white, so a drawing looks the same in both modes.
- `frontend/index.html`: a "Dark mode" button beside "How to play" on the home screen (it says "Light mode" while dark is on). The choice is remembered in this browser and set before the page draws, so it doesn't flash light first. Light is the default, so nobody's game changes unless they pick dark.
- The colors follow Material Design's dark theme and Apple's dark mode guidance: a warm dark gray instead of pure black (Material's own is #121212), raised cards a little lighter than the page, off-white text instead of pure white, a calmer yellow, and WCAG AA contrast (4.5:1 for text, 3:1 for the edges of buttons and text boxes). Yellow buttons keep dark text. Brush previews sit on a strip of white so they show in any color, and the color dots have a light ring so black, dark blue, and purple don't disappear.

**What I checked**
- 74 logic tests pass. 60 checks in Chromium at 1440x900 and 390x844: on the home, help, reveal, drawing, brush, finish, gallery, and My drawings screens in dark mode, every piece of text measured at least 4.5:1 (3:1 for large text) and every visible button and text-box edge at least 3:1; the canvas stays white; nothing runs off the side. Light mode, compared pixel by pixel with the version before this change, is identical except for the new button. The choice is remembered after a refresh, in both directions. I looked at each dark screen.
- The automatic checks caught problems I then fixed: two of my style rules were accidentally stronger than the ones meant to win, which turned the yellow buttons gray with dark text and kept some grey text too faint; black, dark blue, and purple color dots almost disappeared; and button and text-box edges were too faint. Two checks of mine were also too strict at first (faint anti-aliasing in a screenshot comparison, and buttons that have no border at all, which are known by their words and pictures).
- Not checked: the lobby room and Scrawdle Party screens in dark mode, because opening them creates a real lobby in Kevin's project; the /logs page, which has its own style and stays light; Safari, Firefox, and real phones.

**Decisions**
- Light by default instead of following the computer's own dark setting, so the team doesn't see the game change without choosing it. Following the system setting is a one-line change if the team wants it.
- Kept in its own file instead of editing the existing style files, so the light look can't change by accident.

---

## 44. The leftover sample-drawing code is gone (2026-11-05) — Zainab

**What I asked for**
- Finish removing the sample drawings, now that Trenten's gallery changes are merged and the lines can change without a conflict (see entry 41).

**What changed**
- `frontend/gallery.js`: the samples function, its "Sample drawings" tag, and the samples mention in the top comment are gone. The gallery itself is unchanged.
- `frontend/flow.css` and `frontend/theme.css`: the two sample styles are gone.
- `frontend/assets/sample-strawberries.webp` (196 KB) is deleted. `frontend/README.md` no longer mentions it.
- Left alone: a comment in Kevin's `frontend/lobby.css` still mentions the old "Explore sample drawings" button. It's only a comment, and lobby files are Kevin's to change.

**What I checked**
- 74 logic tests pass, and `flow.css` still has matching braces. The checks from entries 38, 40, 41, and 43 pass again in Chromium, including opening today's gallery and dark mode on every screen.

---

## 45. A Share button for finished drawings (2026-11-05) — Zainab

**What I asked for**
- A quick way to share a finished drawing, the way daily puzzles like Wordle spread: one button that opens the phone's own share menu.

**What changed**
- `frontend/drawing.js`: the finish screen has a Share button next to Download PNG. It shares the same picture as the download, with the parts and date written under it, plus a short line such as "My Scrawdle Basic drawing for November 5: Parrot, T-rex arms, ... Draw yours:" and the game's link. Free play leaves out the date, and Daily Free Play leaves out its "Draw anything" placeholder.
- Where there's no share menu (many laptop browsers), it copies the picture to paste into a message or post. Where that isn't possible either, it downloads the picture and says why. Closing the share menu does nothing. A blank drawing has no Share button.
- The finish screen's fallback message when publishing fails now says "Couldn't publish" instead of "Couldn't share", so the two buttons don't get mixed up.
- `tests/share.test.js`: the share line for Basic, Detailed, Free play, and Daily Free Play.

**What I checked**
- 77 logic tests pass. 17 checks in Chromium with a stand-in share menu that records what it receives: one PNG file with the parts and date (1880 pixels wide), the right text and link, "Shared." afterwards, nothing when the menu is closed, the copy fallback (the clipboard really holds a PNG), the download fallback, no button for a blank drawing, and all three buttons fitting at 1280x800, 390x844, and 320x740. Dark mode, the Back button, My drawings, and the color checks still pass.
- Not checked: a real phone's share menu, Safari, or Firefox. The stand-in only shows the game hands the right things to the browser.

**Decisions**
- Inviting friends to a lobby the same way ("Invite friends" opening the share menu with the code and link) would help too, but the lobby is Kevin's, so I'm asking him first.

---

## 46. Invite friends to a lobby in one tap (2026-11-05) — Zainab

**What I asked for**
- Inviting friends to a lobby meant copying the link and pasting it into a message. I wanted one button that opens the phone's share menu, so a friend can be picked straight from Messages or WhatsApp. The lobby is Kevin's, and the team said I could add this.

**What changed**
- `frontend/lobby.js` (Kevin's file; this is the only change in it): the lobby room has an Invite friends button beside the invite link. It opens the browser's share menu with "Join my Scrawdle lobby! Code BCDFG" and the invite link filled in. It only shows where the browser has a share menu (phones, and some laptop browsers). Elsewhere it stays hidden and Copy link is the main button, as before. Closing the menu does nothing.
- No phone numbers or contacts ever reach the game: the phone's own menu handles who it goes to.

**What I checked**
- 77 logic tests pass. 12 checks in Chromium with a stand-in for Supabase, so no real lobby was created in Kevin's project (checked: no request reached it): the button shows with a share menu and is the main button, the menu gets the right text and link, closing it does nothing, without a share menu it stays hidden and Copy link still copies the link, and both buttons fit at 390x844 and 320x740. I looked at the lobby room on a phone and in dark mode, which entry 43 couldn't check.
- Not checked: a real phone's share menu, or a real lobby.

---

## 47. Reporting drawings: the database part (2026-11-05) — Zainab

**What I asked for**
- A Report button for the public gallery, which the team said I could add. A drawing should only be hidden once a few different players report it, not one.

**What changed**
- `backend/supabase/updates/003-reports.sql`, copied into `schema.sql` the same way votes were: a `reports` table nobody can read or write through the public key, and a `report_drawing` function that records one report per player per drawing and hides the drawing once 3 different players have reported it. The number 3 is set in that function, so it can't be changed from a browser. Only today's drawings can be reported. The daily wipe deletes a drawing's reports along with it.
- It uses the drawings' existing `hidden` setting, which the gallery already leaves out, so no gallery query changed.
- `CLAUDE.md` lists it under "Pending database updates" with steps for Kevin, and `backend/README.md` describes it, says it hasn't been run yet, and adds how to check it in the app.
- The Report button itself comes in the next entry.

**What I checked**
- 32 checks against a real Postgres (PGlite), with Supabase's roles stubbed: on top of the current schema with the update run twice, and as part of a fresh `schema.sql`. One or two reports leave a drawing visible; the same player twice counts once; the third player hides it and the public key can no longer read it; a fourth report is fine; other drawings aren't affected; old drawings and reports with no reporter id are refused; the public key can't read reports, add them directly, or unhide a drawing; deleting a drawing deletes its reports; and votes still work.
- Not checked against Kevin's real project, which only he can run it on.

**Decisions**
- Three players, as the team asked. There are no logins, so a reporter is the same random browser id votes use. Someone who keeps clearing their browser data could report one drawing three times alone. That stops accidents and casual misuse, not a determined person, and a teammate can bring a wrongly hidden drawing back from the dashboard.

---

## 48. A tidier home screen: My drawings appears when there's something in it (2026-11-05) — Zainab

**What I asked for**
- Hide the My drawings link until someone has actually drawn something, since drawings go there by themselves. And drop "Your drafts save in this browser." from the home screen, because saving just happens.

**What changed**
- `frontend/index.html`: the My drawings link is hidden until there's a drawing in progress (one the home screen offers to continue) or a kept one. Deleting the last kept drawing hides it again as soon as My drawings closes. A round opened and left blank doesn't count. The "Your drafts save in this browser." line is gone.
- `frontend/drawing.js`: My drawings can count its drawings without loading their pictures, so the home screen stays quick.
- `frontend/theme.css`: dropped the dark-mode color for the removed line.

**What I checked**
- 77 logic tests pass. In Chromium: 30 My drawings checks, including the link hidden on a first visit and after a blank round, showing once there's a drawing or only a kept one, and hiding right after the last one is deleted. The Back button (29), dark mode (51), and sample-drawing (12) checks pass.

---

## 49. The Report button (2026-11-05) — Zainab

**What I asked for**
- The Report button itself, using the database part from entry 47.

**What changed**
- `frontend/gallery.js`: other players' drawings in today's gallery have a small Report button under the votes. Your own drawing has none. It asks first ("Report this drawing? It's hidden from the gallery once 3 players report it."), then says "Reported" and can't be pressed again. This browser remembers what it reported, so it still says "Reported" after the gallery reopens. When a report is the third, the drawing disappears from the gallery straight away.
- `frontend/publish.js`: `window.scrawdleReport` sends the report to `report_drawing` with the same browser id votes use. Until Kevin runs update 003, pressing Report says "Reporting isn't switched on yet." and nothing else changes. Any other failure can be tried again.
- `frontend/flow.css` and `frontend/theme.css`: the button's small grey style, in both modes. `README.md` and `frontend/README.md` describe it.

**What I checked**
- 77 logic tests pass. 16 checks in Chromium with a stand-in for Supabase holding three other players' drawings, so nothing reached Kevin's project (checked): a button on each other drawing and none on yours, the confirmation mentioning 3 players, the drawing id and browser id sent, "Reported" afterwards and after reopening, the third report removing the drawing, cancelling sending nothing, the "isn't switched on yet" message, a failed report being retryable, votes still there, and phone and dark-mode layouts. The dark mode, Share, Back button, and My drawings checks still pass.
- Not checked on the live site, which needs update 003 first.

---

## 50. A play button for Replay (2026-11-05) — Zainab

**What I asked for**
- Replay (entries 18 and 20) started from a "Watch it redraw" text link under the drawing. A play button on top of the drawing is clearer, so I swapped it.

**What changed**
- `frontend/drawing.js`: the finish screen has a round play button over the middle of the finished drawing instead of the text link. It fades away while the drawing redraws, then comes back as a "watch again" arrow. Reopening the finish screen shows play again. A blank drawing has no button, as before. Screen readers still hear "Watch it redraw" and "Watch it again". Replay itself didn't change.
- `frontend/flow.css`: the button's look: a dark see-through circle with a white edge, slightly bigger on hover, smaller on phones, and no animation for players who turn motion off.

**What I checked**
- 77 logic tests pass. 13 checks in Chromium: the button is centered on the drawing, the old link is gone, it fades while redrawing and returns as "Watch it again", the replay still ends on an exact match of the drawing, it can play again, reopening shows play, reduced motion, no button for a blank drawing, and it fits on a phone and in dark mode. I looked at it before, during, and after a replay. The dark mode, Share, My drawings, and Report checks still pass.

---

## 51. The Publish button shows that publishing worked (2026-11-05) — Zainab

**What I asked for**
- After pressing Publish drawing, the screen looked stuck. Publishing had worked, but the only sign was a small line of text, and the button stayed yellow with the same words. I wanted it to be obvious.

**What changed**
- `frontend/drawing.js`: the button now shows where publishing is up to. It says "Publishing…" while sending, then turns green as "Published ✓". If publishing fails, it goes back to "Publish drawing" so it can be tried again. Coming back to the finish screen, or trying again after a refresh (which says it's already published), shows "Published ✓" too. The line under it now says "Your drawing is published. See it in today's drawings."
- `frontend/flow.css`: the green published style, which also works in dark mode.

**What I checked**
- 77 logic tests pass. 10 checks in Chromium with a stand-in for Supabase whose upload waits, so each step could be seen: "Publishing…" while sending, "Published ✓" in green with the new line, still published when the finish screen reopens, a failed publish going back to "Publish drawing", already published after a refresh, and dark mode. Nothing reached Kevin's project. The dark mode, Share, play button, and Report checks still pass.

---

## 52. Invite friends everywhere, with the message already written (2026-11-05) — Zainab

**What I asked for**
- Inviting friends should never mean copying and pasting. On my laptop, Invite friends (entry 46) didn't show at all, because it only appeared where the browser has a share menu, so it looked like it had never been built. I also didn't want the invite to be about the code.

**What changed**
- `frontend/lobby.js` (Kevin's file, with the team's OK): Invite friends always shows and is the main button. Where the browser has a share menu, it opens that, as before. Elsewhere, or if the share menu fails, it opens a small menu: Text message (opens Messages with the invite written, so you just pick who it goes to), WhatsApp, Email (with a subject), and Copy invite. The invite is now "Join my Scrawdle lobby!" and the link, with no code to type. The menu closes when the lobby closes. Copy link stays.
- `frontend/lobby.css`: the menu, four across on a laptop and two on a phone.

**What I checked**
- 77 logic tests pass. 16 checks in Chromium with a stand-in for Supabase, so no real lobby was created: the button shows without a share menu, the menu opens and closes, each option's message is exactly "Join my Scrawdle lobby!" and the link, Copy invite and Copy link copy the right things, a new lobby starts with the menu closed, a phone with a share menu opens that instead, closing the share menu does nothing, a failed share menu falls back to ours, and phone and dark-mode layouts.
- Not checked: that Messages, WhatsApp, and email apps open on a real phone or Mac. The links use their standard formats.

---

## 53. The Scrawdle name goes home (2026-11-05) — Zainab

**What I asked for**
- Clicking the Scrawdle name in the top-left corner should take me back home from anywhere, instead of having to find Start over, Back to home, or Leave lobby each time.

**What changed**
- `frontend/index.html`: on the reveal, drawing, finish, gallery, My drawings, and lobby screens, the Scrawdle name is a link home. It closes whatever is open (the finish screen, gallery, My drawings, or help), leaves a lobby the same way its Leave lobby button does, and returns home through the browser's history, so Back afterwards leaves the site with no extra press (entry 38). It works with the keyboard too, and its hover hint says "Back to home". The name on the home screen stays as it was.
- `frontend/flow.css`: a pointer, a slight fade on hover, and a focus outline for the name.
- The existing Start over, Back to home, and Leave lobby buttons stay for now.

**What I checked**
- 77 logic tests pass. 13 checks in Chromium, with a stand-in for Supabase for the lobby: the home screen's name isn't a link and the six others are; going home from the drawing, the reveal (and the spin doesn't reappear), the finish screen, the gallery, My drawings, and a lobby (which it leaves, clearing the code from the address); Back afterwards; Enter on the name; and no errors. The first run of my own check failed because its stand-in couldn't create a lobby; the page was fine. The Back button, dark mode, and My drawings checks still pass.

---

## 54. No more lobby codes on screen (2026-11-05) — Zainab

**What I asked for**
- I'm not a fan of the lobby code. After entry 52 it was still shown big at the top of the lobby, and the home screen still had a box for typing one in. Friends should just tap the invite link.

**What changed**
- `frontend/lobby.js` and `lobby.css` (Kevin's files, with the team's OK): the lobby opens with "Invite your friends" where the big code was, with Invite friends right under it. The home screen's Lobby card no longer has the Code box and Join button, and says "Make a private room, then invite friends with a link." Joining by tapping an invite link works as before: the code is still inside the link, because that's how the database knows the lobby, but nobody has to see or type it.
- `README.md`, `frontend/README.md`, `backend/README.md`, and the lobby section of `CLAUDE.md` describe joining by link instead of by code.

**What I checked**
- 77 logic tests pass. 10 checks in Chromium with a stand-in for Supabase, so no real lobby was created: no code box or Join button on the home card, no code in the lobby, the new heading (which still names the lobby for screen readers), Invite friends under it, joining by opening an invite link, no errors, and phone and dark-mode layouts. The Invite friends (16), name-goes-home (13), and dark mode (51) checks still pass.

**Decisions**
- Someone who only knows a code, with no link, can't join any more. The invite link is the way in.

---

## 55. A copy icon and an invite pop-up in the lobby (2026-11-05) — Zainab

**What I asked for**
- Copy link should be a small copy sign right next to the link, like GitHub's, and the invite options should be a little pop-up instead of a row of big buttons.

**What changed**
- `frontend/lobby.js` and `lobby.css` (Kevin's files, with the team's OK): the Copy link button is now a copy icon inside the right end of the link box. It copies the link and turns into a check that says "Copied!" for two seconds. Its hover hint and screen-reader name are "Copy link".
- Invite friends opens a small pop-up list just under it, with an icon for each option: Text message, WhatsApp, Email, and Copy invite. It closes when an option is picked, on a click outside it, or on Esc, which also returns focus to the button. On a phone it spans the width under the button. Phones with a share menu still open that instead.
- `frontend/theme.css`: the pop-up and icon in dark mode.

**What I checked**
- 77 logic tests pass. 20 checks in Chromium with a stand-in for Supabase, so no real lobby was created: the icon sits inside the link box and there's no separate Copy link button, its hint and name, copying the link, the check and its return to the copy icon, the pop-up's four options right under the button, focus moving into it, the written invite, closing by clicking outside, Esc, picking an option, and Copy invite, a phone with a share menu, a phone without one, and dark mode. The lobby (10), name-goes-home (13), and dark mode (51) checks still pass.

---

## 56. Daily Scrawl, hover cards, and Multiplayer Games on the home screen (2026-11-06) — Angie

**What I asked for**
- Use the hover-to-learn-more format again on the buttons of the first screen. Get rid of Basic and Detailed and make one mode called "Daily Scrawl", with three main buttons (Daily Scrawl, Daily Free Play, and Open Canvas, which is Free play renamed) and a "Multiplayer Games" button below them that for now just goes to the create-lobby screen we already have.

**What changed**
- `frontend/index.html` and a new `frontend/home.css`: the home screen is now five cards (Daily Scrawl, Daily Free Play, Open Canvas, Multiplayer Games, Public drawings, which is entry 57). Hovering a card, or tabbing to it, opens a short description under it, and for Daily Scrawl the list of parts. The description floats over what's below instead of pushing it down. On touch screens, where there's no hover, the descriptions are always shown. The small links (My drawings, the build log, How to play, Dark mode) are left as links.
- Daily Scrawl is a new mode id, `daily`, as `CLAUDE.md` asks for the merge, and it uses every part (the old Detailed set, 10 parts, three of them optional). Which parts the merged mode uses was still open in `CLAUDE.md`, so that was my call; it's one line in `partsFor` to change. It shares today's save slot, so a refresh and the "Continue drawing" notice find it. A Basic or Detailed drawing already started today still opens from its notice, and pressing Daily Scrawl over one asks first, then keeps the old one in My drawings.
- Open Canvas is only a new name. It still gives random Basic parts and keeps the `free` slot. The name also changed in the share text and in My drawings.
- Multiplayer Games presses Create Lobby on the Lobby card that `lobby.js` adds. That card is hidden in `home.css` and its error message now shows under the new buttons. I did not edit `lobby.js`, since `CLAUDE.md` says to leave it to Kevin.
- `backend/supabase/updates/004-daily-scrawl.sql`, and the same change in `schema.sql`: the database allows the mode `daily`. `basic`, `detailed` and `scrawl` stay allowed, as `CLAUDE.md` says, for at least a day. Added 004 to "Pending database updates" in `CLAUDE.md`.
- `frontend/sketchbook.js` and `frontend/drawing.js`: Daily Scrawl's name in My drawings and in the share text.

**What I checked**
- 84 logic tests pass, including new ones for the share text and the save slot.
- 22 checks in headless Chrome against the real page (see entry 58 for the rest): the three main cards and the old two being gone, the hover description opening, the Daily Scrawl slot machine rolling all 10 parts, the game labelled Daily Scrawl, and Daily Scrawl reopening the same drawing with its strokes still on it. I looked at screenshots of the home screen with a card hovered, and at a phone width.
- Not checked: the SQL against a Postgres, since it only changes the allowed values; nothing was run against the live Supabase project. Until Kevin runs 004, publishing a Daily Scrawl drawing is refused. The lobby button was not pressed, because that creates a lobby on the real project. The always-shown descriptions on touch screens were not tried on a real phone (headless Chrome's phone mode still reports hover).

**Decisions**
- Daily Scrawl uses all the parts. The other choices were Basic's short set or a new one; the team can change it.
- Open Canvas keeps random Basic parts for now. It's a rename only, because nobody asked for it to change.

---

## 57. A Public drawings page (2026-11-06) — Angie

**What I asked for**
- A button on the main menu that shows every drawing posted, with a bubble to switch Daily Scrawl on and another for Daily Free Play, so both can show at once. The Daily Scrawl bubble stays locked until I post my own Daily Scrawl, with a small ? that says why.

**What changed**
- `frontend/gallery.js`: `showPublic()`, which reuses the gallery page. Two bubbles at the top; Daily Free Play starts on and Daily Scrawl starts on only if it's unlocked. While it's locked it has a dashed look and a lock, and the ? (and clicking the bubble) shows "Post your own Daily Scrawl drawing to unlock everyone else's." Drawings from the older Basic and Detailed modes show under the Daily Scrawl bubble. Each card has the same thumbs up/down and Report as today's gallery; your own drawings are marked and have neither. Pictures load lazily.
- `frontend/publish.js`: `scrawdlePublicGallery` (loads up to 500 drawings in the asked-for modes, with vote counts, and says so if the load fails) and `scrawdleHasPosted` (true once this browser has published a Daily Scrawl today; an older Basic or Detailed from today counts). The Public drawings card stays hidden if Supabase isn't set up.
- `frontend/home.css`: the bubbles and the ?.

**What I checked**
- Four new logic tests with the Supabase stand-in: Daily Free Play, or a Daily Scrawl from another day, doesn't unlock it; today's Daily Scrawl, Basic or Detailed does; the public gallery returns the asked-for modes and marks only the player's own; a failed load is reported instead of shown as empty.
- Not checked: the page itself in a browser, because opening it reads the live Supabase project. The lock is only in the page: anyone can read published drawings through the database's public key, so this is a courtesy, not security. "Every single drawing" really means every drawing still in the database, since old ones are wiped daily, and the page caps at 500.

**Decisions**
- It asks only for the modes that are unlocked, so a locked player's page never even loads Daily Scrawl drawings.

---

## 58. Dismissable notices, staying on the export screen, Opacity, and a plainer history bar (2026-11-06) — Angie

**What I asked for**
- An x on each "Continue drawing" notice that only hides it. Refreshing at the export screen should stay there. A nicer, still colorless, Undo/Redo/Clear. An Opacity slider under Size for every tool.

**What changed**
- `frontend/index.html`: each notice has an x. It only hides the notice; the drawing stays saved, still opens from its card or from Daily Scrawl, and stays in My drawings. It's remembered in this browser per drawing, and the notice comes back if the drawing is changed later (it then counts as a new one in progress).
- `frontend/drawing.js`: the finish screen records in the tab that it's open and `index.html` reopens it after a refresh. Closing it clears that, so a refresh then goes to the drawing.
- `frontend/drawing.js`: an Opacity slider (5 to 100%) under Size, remembered separately for each tool. A stroke below 100% is drawn on its own transparent layer and shown over the picture at that opacity, so crossing itself doesn't darken it. The paint bucket mixes its color with what was there. Opacity is stored with each stroke, so replay matches, and older saved drawings with no opacity count as 100%. Marker and watercolor multiply their own softness by it. The bucket has no size, so only its Size controls dim.
- `frontend/tools.css`: Undo, Redo and Clear are one outlined pill with thin dividers, in the page's own ink color so they stay plain in light and dark mode. Opacity slider styles are there too.

**What I checked**
- 84 logic tests pass, including one for the bucket's blending.
- In headless Chrome, with real mouse input: a stroke at 100% is black (41,43,44) and one at 40% is 169, as expected; a stroke that crosses itself at 40% stays 169; opacity is kept per tool; the bucket's Opacity slider works while its Size is off; refreshing on the export screen stays on it, and after closing it a refresh goes to the drawing; the x removes the notice and it stays gone after a refresh; Daily Scrawl reopens the drawing with its strokes. I looked at screenshots of the toolbar in light and dark mode.
- Not checked: opacity with each of the seven brush types, the Line tool and replay by eye (the code covers them, but I only drew with the pen), and the phone layout of the new slider.

**Decisions**
- A dismissed notice returns when the drawing changes, rather than staying hidden for the day.

---

## 59. The home cards go back to the chunky look (2026-11-06) — Angie

**What I asked for**
- Make the home cards look like my first version: thick outlines, a hard shadow, and a tint on hover, with the details opening inside the card.

**What changed**
- `frontend/home.css`: the cards have a 4px dark outline, a hard offset shadow, bold names, and their own tint (blue, pink, green, lavender, and yellow). On hover they lift, tilt a little, and open the description inside the card, so only the hovered card grows. This replaces the soft cards that opened a floating box underneath (entry 56). Dark mode keeps the dark surface with a black shadow.

**What I checked**
- Looked at screenshots in headless Chrome with Daily Scrawl and Multiplayer Games hovered: the outline, shadow, tilt, tint, and the list opening inside the card all show. Did not check dark mode or the phone layout by eye, and the 84 logic tests don't cover styling.

**Decisions**
- Kept the site's own handwriting font instead of the first version's Comic Sans look, so the cards match the rest of the page.

---

## 60. A calmer home screen: logo on top, three buttons, Daily opens into two (2026-11-06) — Angie

**What I asked for**
- Fewer distracting buttons on the first screen. After looking at mock-up images (kept outside the repo), I chose the stacked layout with three buttons, Daily, Multiplayer, and Free Play, the Scrawdle logo on top, and a big pink "Scrawdle" behind the page that spans its whole width. Hovering Daily should open it into two halves, Daily Scrawl and Daily Free Play, each with its description, and I click the half I want. Multiplayer and Free Play keep their hover descriptions. Public drawings goes at the bottom right.

**What changed**
- `frontend/index.html`: the home screen is now one column. The header's small logo is gone; the logo sits above the date and heading instead. Daily is one card holding two buttons, which keep the ids `mode-daily` (Daily Scrawl) and `mode-scrawl` (Daily Free Play), so the click handlers did not change. Multiplayer and Free Play (the old Open Canvas, still slot `free`) are buttons with their descriptions. Public drawings is a corner button, still hidden unless the Supabase project is connected. The big background word is a decorative element a screen reader skips. The "How to play" text says Free Play now.
- `frontend/home.css`: the stacked layout, the Daily card that opens on hover or keyboard focus (and is always open on a touch screen, which can't hover), the background word sized in vw (its width is 3.81 times its font size, measured in Chrome, so 25vw is about 95% of the page), the corner button, and dark-mode versions of all of them. On a phone the two halves stack and Public drawings sits under the build-log link instead of floating.
- `frontend/index.html` and `frontend/sketchbook.js`: the on-screen name "Open Canvas" is now "Free Play" (prompt label, slot label, the replace-drawing confirm, My drawings). The share text in `drawing.js` and its test still say "Open Canvas"; I left those alone.

**What I checked**
- The 84 logic tests pass. In headless Chrome I looked at screenshots at desktop width (light and dark, with Daily forced open) and at 500px wide, and checked the background word's real width. I did not hover with a real mouse, only forced the open state with CSS, and I did not click through to the games after the change. Not checked: keyboard use by hand, and Safari.

**Decisions**
- No new ids or database change. Free Play (random parts, slot `free`) and Daily Free Play (draw anything, id `scrawl`) now have close names; the ids keep them apart in code.
- Public drawings lost its hover description (it is a tooltip now), because a description opening upward from the corner looked wrong.

---

## 61. Doodles behind every page (2026-11-06) — Angie

**What I asked for**
- After seeing a mock-up image, add little doodles to the background of the main menu, and to the other pages too. I also said the Free Play button wasn't working and asked Claude to check that it is connected to what Open Canvas / Free play was connected to before.

**What changed**
- New `frontend/doodles/`: four plain SVG files, `doodles-wide.svg` and `doodles-tall.svg` (for phones), each also in a pale-ink version for dark mode. They hold about 19 (wide) or 10 (tall) line drawings: stars, a cat, a fish, a bird, a pencil, hearts, a cloud, a moon, a flower, and squiggles. They are faint, and the middle of the wide one is left mostly empty. Claude first tried a generator script for them; I declined that, so they are written out as ready-made files and are edited by hand.
- `frontend/home.css`: lays the right file under the paper of the page itself and of each full-screen page (the parts screen, finish, lobby, lobby game, Public drawings, My drawings). `body` no longer paints its own paper, because that hid the doodles on the page behind it. The game screen sits on the page itself, so it gets them too. The build-log page at `/logs` is separate and does not have them.
- Free Play: no code change. In `frontend/index.html` the button is still wired to `startFreePlay`, which starts random parts exactly as the old Open Canvas button did.

**What I checked**
- The 84 logic tests pass. In headless Chrome, with a local copy served on a throwaway server, I looked at screenshots of the home screen (light, dark, and a 500px-wide window), the parts screen, the drawing screen, and Public drawings, and the doodles show behind each. Not looked at: My drawings, the lobby, the finish screen, and Safari or a real phone.
- For Free Play, I clicked it with a script and with real mouse events (also moving down from the open Daily card) at 1280×800, 1280×600, and 1366×650, and it opened the parts screen each time. At 1000×560 the button sits below the visible area, so it was not clicked there. I could not make it fail, so I cannot say what went wrong on your side.

**Decisions**
- Plain SVG files instead of one long CSS rule or a generator, so there is no tooling to rerun and a doodle can be changed in one small file. The cost is that a change has to be made by hand in all four files.
- The doodles use a CSS variable that switches the file for dark mode and phone shapes, so a page needs no extra markup.

---

## 62. Start over stays put, part bubbles, a way back from the build log (2026-11-06) — Angie

**What I asked for**
- Start over on a daily drawing should just erase it, not send me to the main page. The part categories at the top of the drawing screen should each be in their own bubble. The build log needs a button back to the Scrawdle main page. And the Daily Scrawl filter on the Public drawings page should unlock when I publish my own Daily Scrawl.
- Before that, I had said the Free Play button and the build log link didn't work. They were fine when the page was served properly; I was opening `index.html` as a file, so the browser blocked `prompts.json` and `/logs/` pointed at the drive's root. Claude served `frontend/` on a local web server and the buttons worked.

**What changed**
- `frontend/index.html` and `frontend/drawing.js`: Start over (Daily Scrawl and Daily Free Play) now calls a new `board.clear`, which is the same erase as the Clear button. It keeps the same round and parts, stays on the drawing, and Undo brings the drawing back. If the board is already blank it does nothing. The question now says so. New set (Free Play) is unchanged.
- `frontend/home.css`: each part above the drawing is a rounded bubble with its small category label inside. Optional parts are green with a dashed edge, and dark mode has its own colors. I made them small enough that the ten Daily Scrawl parts fit in two rows, so the drawing board doesn't move down.
- `scripts/logs-template.html` and the regenerated `frontend/logs/index.html`: a "← Back to Scrawdle" button above the title, linking to `/`. The page already had a small "Play Scrawdle" text link under the intro; the button is easier to see.
- `frontend/drawing.js`: after publishing a Daily Scrawl, the message adds that everyone's Daily Scrawl drawings are now unlocked on the Public drawings page.

**What I checked**
- The 84 logic tests pass. In headless Chrome on a local server I drew a stroke, pressed Start over, and counted the ink: 4,753 dark pixels before, 0 after; the same Daily Scrawl screen and the same parts stayed up; Undo brought back all 4,753. I looked at screenshots of the bubbles in light mode and of the build log's new button.
- Unlock: the lock already worked in the code (`scrawdleHasPosted`, with tests). In the browser I faked the "published" marker instead of publishing for real, so nothing reached the live project. With nothing published, or only Daily Free Play, Daily Scrawl stayed locked; with a Daily Scrawl marked as published, it opened. I did not do a real publish, so a failure on my side that I didn't find is still possible.
- Not checked: the bubbles in dark mode and on a phone, and the new build log button on a phone.

**Decisions**
- Start over erases instead of throwing the round away, so the parts you got stay, and Undo is a safety net. The old behavior (discard, then go home) is gone.
- The unlock still depends on this browser remembering your own publish. A drawing published from another browser, a private window, or a different address (for example the file you opened versus `localhost`) does not count, and neither does publishing only Daily Free Play.

---

## 63. One Public drawings page, and the lock breaks (2026-11-06) — Angie

**What I asked for**
- Publishing a Daily Scrawl drawing wasn't unlocking the Daily Scrawl bubble on Public drawings. "See today's drawings" on the finish screen showed everything on one separate page; it should go to the same Public drawings page as the home screen's button. Add a little animation of the lock breaking when it unlocks. Make sure Daily Scrawl drawings land under Daily Scrawl and Daily Free Play drawings under Daily Free Play.

**What changed**
- `frontend/drawing.js`: the finish screen's button now says "See public drawings" and opens the Public drawings page (`gallery.showPublic`), starting with the bubble that matches the drawing you just made (Daily Scrawl or Daily Free Play). The old separate Today's drawings page is no longer reached from the game. The publish message now says "See it under Public drawings", plus that Daily Scrawl is unlocked when you posted one.
- `frontend/gallery.js`: `showPublic({ focus })` takes an optional starting category. The first time the page opens after you have posted a Daily Scrawl on a given day, the Daily Scrawl bubble starts with a padlock, the padlock shakes, its shackle pops off and its body splits and falls, then the bubble opens with a small burst and a line saying "Unlocked!". This browser remembers the day it last played (`scrawdle-unlock-seen`), so it plays once per day. With reduced motion switched on, it unlocks with no animation. Your own drawing on the page also shows how it did (the thumbs-up result), which the old page did.
- `frontend/home.css`: the padlock (now an SVG, no emoji) and the animation. Every drawing already sorted by its mode: Daily Scrawl (and the older Basic and Detailed) under Daily Scrawl, Daily Free Play under its own bubble; I only checked that here.

**What I checked**
- The 84 logic tests pass. In headless Chrome, with the Supabase requests faked so nothing reached the live project, I drew a Daily Scrawl, published it, pressed See public drawings, and watched the page: Public drawings opens, the lock shows then breaks, the bubble opens, and Daily Scrawl drawings appear. A Daily Free Play published the same way left Daily Scrawl locked and showed Daily Free Play. With a mix of fake drawings in all the modes, Daily Scrawl showed only the Daily Scrawl ones and Daily Free Play only its own. I looked at screenshots of the lock before, during, and after breaking.
- Not checked: a real publish to the live project, dark mode and phone width for the new animation, and Safari.

**Decisions**
- The most likely reason the unlock didn't happen for me is not in the page. I read the live project (read-only, no publishing): it has recent Daily Free Play and old Basic drawings from today and no Daily Scrawl (`daily`) drawings at all. `backend/supabase/updates/004-daily-scrawl.sql`, which lets the database accept the new mode, is still on the "to run" list in `CLAUDE.md`, so the database is probably refusing Daily Scrawl publishes ("Couldn't share right now"), so nothing is marked as posted and nothing unlocks. Only Kevin can run it. I did not change the code to work around that.
- "Today's drawings" is gone from the game; one page does both jobs.

---

## 64. Scrawdle's own color picker (2026-11-07) — Trenten

**What I asked for**
- The "Custom" color button opened the browser's built-in color picker, so it looked different in every browser (a pop-up in Chrome, a system window in Firefox, the Mac color panel in Safari). I asked for the picker to be defined in our own project, as the new top priority before the streak, and approved Claude's plan before it built anything.

**What changed**
- `frontend/color-picker.js` and `color-picker.css` (new): clicking the rainbow button opens a panel above it with a shade square (grey to full color, light to dark), a hue bar, a hex box with a swatch of the current color, the last six custom colors (kept in this browser), and a Done button. The color applies as you drag. It closes on Done, Enter in the hex box, Esc, or a click outside, and works with mouse, finger, stylus and keyboard (arrow keys move the square and bar, Shift for bigger steps; screen readers hear values like "Hue 210 degrees"). On a phone it's pinned across the bottom of the screen. It uses the theme's colors, so dark mode works.
- `frontend/drawing.js`: the rainbow button is now a real button that opens the panel, instead of a label wrapped around the browser's hidden color input. With a custom color chosen, that color shows in the middle of the rainbow. Each board gets its own picker, so the main game and Scrawdle Party don't share one. `drawing.css`: removed the rule for the old hidden input. `index.html`: loads the two new files.
- `tests/color-picker.test.js` (new). `README.md`: the test command is now `node --test tests/`, which runs every test file; the old list had missed four of them.

**What I checked**
- 7 Node tests for the color math: hex codes in any form, bad codes refused, pure colors and black, white and grey landing in the right place, every tray color and a sample of all colors surviving a round trip unchanged, and the recent-colors list. All 92 tests pass.
- In Chromium: opening and closing (button, Done, Enter, Esc, a click outside); dragging the square and the bar; arrow keys; typing a hex code (half-typed codes are marked invalid until they're complete); a recent color; the pen then drew exactly the color picked (`#e07b39`); the panel stays on screen and nothing covers or clips it at 1280 by 800 and at phone width; dark mode; and a second board inside a full-screen dialog, like Scrawdle Party's, gets its own picker. A real Esc key press closed only the picker, not the dialog around it.
- Not checked: Safari, Firefox, a real phone or stylus. The whole point is that it looks the same everywhere, so it's worth a look in those. The preview pane was too small for useful screenshots, so the look was checked by measuring, not by eye.

**Decisions**
- Built from plain page elements and CSS gradients, with no library and no `<input type="color">`, so no browser draws any part of it.
- The recent colors are shared by every board on the page and kept in this browser only.

---

## 65. Kicking players, and votes to kick (2026-11-07) — Trenten

**What I asked for**
- A way for the lobby's host to kick a player, then a vote to kick: any player can call a vote on another, and if all the other players agree (everyone except the player being kicked), that player is kicked. Claude planned it first and pointed out that `CLAUDE.md` says only Kevin edits the lobby code; Kevin OK'd it. I went with Claude's recommendations: a kick lasts for the rest of that day, votes happen in the lobby room, and the host can still kick during a game.

**What changed**
- `frontend/lobby.js` and `lobby.css`: in the lobby room, the host has a Kick button next to each other player (with a "Kick Ben?" check first). Everyone else has "Vote to kick", which is off, with the reason on hover, when there are fewer than 3 players, a vote is already going, or that player was voted on less than a minute ago. A vote shows a bar to everyone: "Ana wants to kick Ben. Everyone else has to agree. 1 of 2 agree · 30s left", with Yes and No for the voters. It passes once every player except the target has said yes; one No, or 30 seconds, fails it. Players who leave stop counting. The host can be voted out, and the next player in line carries out the kick and becomes host. During a game, the host gets a Players button in the bottom-left corner to kick from there; a vote in progress is called off when a game starts.
- The kicked player's page leaves, says "You were removed from that lobby" (or "voted out"), and remembers the lobby so the same invite link won't put it back in that day. If someone kicked comes back in the same tab anyway, the host's page kicks them again.
- The rules are pure functions in `lobby.js` with 8 new tests in `tests/lobby.test.js`.
- `frontend/party.js`: the host's setup screen now keeps its player list up to date when someone leaves or is kicked, without resetting the settings already picked. It used to keep showing players who had gone.
- `CLAUDE.md` (lobby section) and `README.md`: what kicking does and its limits.

**What I checked**
- All 100 Node tests pass.
- In a browser with a stand-in for Supabase (each player is the real page in its own frame, running the real `lobby.js` and `party.js`, with messages and the player list passed between them): the host kicking a player (everyone's list updates and says so; the kicked page shows the message and remembers it); the kicked browser being refused when it opens the invite link again; a fake kick sent by a player who isn't the host being ignored; a vote failing on one No, with that player's Vote to kick button then off for a minute; voting out the host (the next player carried out the kick and became host); a vote passing when the only player who hadn't voted left; a vote failing after 30 seconds with nobody voting; the Players button showing only for the host during a game, and kicking from it, with the game carrying on for everyone else.
- On the live lobby, with three tabs of the local page as Ana (host), Ben and Cal (lobby `QRRCT`, deleted by the daily job): Ben's vote to kick Cal showed the right bar in all three tabs, passed when Ana said yes, and both remaining tabs said "Cal was voted out of the lobby"; Cal's home screen showed "You were voted out of that lobby" under Multiplayer, and opening the invite link again was refused for the day. Then Ana kicked Ben, and Ben's home screen said "You were removed from that lobby". No errors from the test in any tab's console. Afterwards Claude cleared the remembered kick, since the test tabs share one browser's storage.
- Not checked: the host's Players button during a game on the live lobby (only in the stand-in), players on different computers, Safari or Firefox, and how it looks (the preview pane was too small for useful screenshots).

**Decisions**
- The same trust limits as the rest of the lobby, written down in `CLAUDE.md` rather than hidden: messages say who sent them and nothing can check that, and a kicked player can come back from another browser. Doing better needs logins or a server deciding who's in a lobby.
- Votes need at least 3 players; with 2, one person would decide alone, and the host can already kick.

---

## 66. A streak of days in a row (2026-11-07) — Trenten

**What I asked for**
- A streak that keeps track of consecutive days of drawing, planned before building. I went with Claude's recommendations: a day counts when you finish a daily drawing, it starts counting from now (not from old drawings), and it shows on the home screen, the finish screen, and the share text.

**What changed**
- `frontend/streak.js` (new): a day counts when the finish screen opens for a daily drawing that isn't blank (Daily Scrawl or Daily Free Play, not Free Play). The days are the player's local date, like the rest of the game. The streak counts back from today, or from yesterday if today isn't drawn yet (it's still alive until today ends); a whole missed day ends it. The best streak is remembered too. Kept in this browser only, as the list of days drawn, so there's no database change and nothing to sign in to.
- `frontend/index.html` and `flow.css`: under the date on the home screen, "🔥 5-day streak", or "🔥 5-day streak · Draw today to keep it going" before today's drawing is done; hidden with no streak.
- `frontend/drawing.js`: the finish screen records the day and says "🔥 That's 5 days in a row!", "🔥 New best: 7 days in a row!", or "🔥 Day 1 of a new streak", and just "🔥 5-day streak" when today already counted. The share text for a daily drawing ends with the streak, like "… Draw yours: [link] 🔥 5".
- `tests/streak.test.js` (new) and one new test in `tests/share.test.js`.

**What I checked**
- 12 Node tests for the date math (the next day across months, years, a leap day and a clock change; refusing dates like 2026-02-30; counting from today or yesterday; a missed day; the best streak; the wording), and one for the share text with and without a streak. All 113 tests pass.
- In the browser, with past days written straight into the saved streak to stand in for earlier visits: finishing Daily Free Play turned two days into three on the finish screen, finishing it again didn't count twice, the share text ended with 🔥 3, and the home screen showed the streak; with only yesterday drawn the home screen showed the "Draw today" nudge; a missed day hid it; Free Play and a blank Daily Scrawl didn't count. The home line fits at phone width and follows dark mode. Claude put the browser's real saved streak back afterwards.
- Not checked: an actual change of date while the page is open (the streak updates the next time the home or finish screen is shown), Safari or Firefox.

**Decisions**
- Finishing counts, not publishing, so the streak works even when publishing doesn't.
- Per browser only, the same as My drawings. A leaderboard that compares streaks would need them on the database; that's a question for the leaderboard plan.

---

## 67. Today's leaderboard (2026-11-07) — Trenten

**What I asked for**
- A daily leaderboard that resets each day, planned first. Claude found that the Public drawings page already loads every drawing posted today with its votes, so a leaderboard could be built with no database change, but it can only rank drawings, not players, because a published drawing doesn't carry a name. I went with its recommendations: rank drawings, give it its own page, and rank by thumbs up.

**What changed**
- `frontend/leaderboard/index.html`, `leaderboard.js` and `leaderboard.css` (new), served at `/leaderboard/`: "Today's top drawings", with a list for Daily Scrawl (including the older Basic and Detailed) and one for Daily Free Play. The top three are a podium with gold, silver and bronze place badges; places 4 to 10 are rows below, and every drawing tied for 10th shows. Drawings with no thumbs up aren't ranked; ties share a place (1, 2, 2, 4), and fewer thumbs down breaks a tie. Your own drawing is marked "Yours", with "Yours is #4 of 23 today" (or "no thumbs up yet, so it isn't ranked") above the list. Daily Scrawl's list is locked until you've posted your own Daily Scrawl drawing, the same rule as Public drawings, and its drawings aren't even loaded until then.
- It reuses `publish.js`'s `scrawdlePublicGallery` unchanged, so it starts over at local midnight like Public drawings, and the daily wipe clears its drawings.
- Links: "Today's leaderboard" on the home screen (shown only when Supabase is connected, like Public drawings) and on the finish screen next to "See public drawings", and "See today's leaderboard" under the Public drawings page.
- `tests/leaderboard.test.js` (new).

**What I checked**
- 8 Node tests for the ranking (order, tie-breaks, shared places, unranked drawings, your standing, which list each mode goes in, and ties at 10th). All 121 tests pass.
- The page against the live project, read-only (it only loads): no Daily Free Play drawings posted yet today, and Daily Scrawl locked, because this browser hadn't posted one.
- With stand-in data (14 Daily Scrawl drawings with ties and one of them yours, and Daily Free Play drawings with no thumbs up): the places, the shared places, "Yours is #7 of 12 today", the unranked message, the lock (Daily Scrawl not even requested), and the message when loading fails. Measured at 1280 by 800 (podium side by side) and phone width (stacked), with nothing scrolling sideways, and checked dark mode. Both new links appear and point to `leaderboard/`.
- That first stand-in test caught a tie problem: three drawings tied for 10th, but only one showed. Fixed so everyone tied for the last place shown appears, with a test.
- Not checked: the page with real votes (there were none today when it was tested), Safari or Firefox. The small local test server doesn't serve a folder's `index.html` the way Vercel does, so the page was opened as `/leaderboard/index.html` locally; `/leaderboard/` relies on the same Vercel behavior as `/public-drawings/`.

**Decisions**
- Drawings, not players, so there's no database update and no public player names to moderate. Ranking players later would mean storing a name with each published drawing (a new update for Kevin).
- Its own page rather than a section of Public drawings, so Angie's and Kevin's page only gained one link.

---

## 68. Yesterday's winner (2026-11-07) — Trenten

**What I asked for**
- Show yesterday's winner, planned first. Claude found that the daily wipe keeps yesterday's drawings for the whole of the player's local day, but the database only lets the game read drawings within a day of its own (UTC) date, so in US time the player's yesterday stops being readable every evening. So it needs one small database update. I went with its recommendations: show it on the home screen and the leaderboard, show everyone tied for first, and write the update for Kevin.

**What changed**
- `backend/supabase/updates/005-yesterdays-winner.sql` (new) and `schema.sql`: a function, `top_drawings(target_day, modes, max_count)`, that returns a day's best drawing(s): the most thumbs up (at least one), then the fewest thumbs down, with every drawing tied on both, oldest first, up to `max_count` (three by default, never more than ten). Hidden drawings never count, and it only answers for days the daily wipe still keeps. It changes no table and no policy and stores nothing. It took the number `005`, so the planned update that drops `basic` and `detailed` from the mode constraint becomes `006`.
- `frontend/publish.js`: `scrawdleYesterdayWinners()` asks for yesterday by the player's local date, once for Daily Scrawl (with the older Basic and Detailed) and once for Daily Free Play, and marks a winner as yours the same way the gallery does. It returns nothing when the function isn't on the database yet.
- `frontend/leaderboard.js` and `leaderboard.css`: "Yesterday's winners" (or "🏆 Your drawing won yesterday!") with each winner's picture, yesterday's parts (two lines, the full list in a tooltip) and its thumbs up. On the leaderboard it's above today's lists and shows up to three tied winners per list; there's no lock, since yesterday can't spoil today's parts. On the home screen (`index.html`), a compact copy with one winner per list sits under the Continue cards, with a link to the leaderboard.
- `CLAUDE.md`: update 005 is under "Pending database updates" with steps for Kevin's session. `README.md`, `frontend/README.md`, `backend/README.md` updated.

**What I checked**
- The SQL in PGlite (a real Postgres) on top of the original schema and updates 001 to 004: 9 of 9 checks pass. It runs twice without error; the winner is the most thumbs up, then fewest thumbs down; a hidden drawing with more votes never wins; each list sees only its own modes; ties come back oldest first up to the limit; a day with no thumbs up has no winner; days the wipe has cleared return nothing even if the rows are still there; the public key still can't read old drawings or the votes table; and a fresh project's `schema.sql` has the function. Breaking the SQL on purpose in a copy (letting hidden drawings count, and dropping the day limit) failed 2 checks, as it should. The test script and PGlite stayed in a temporary folder, not the repo.
- 3 new Node tests that load the real `publish.js` against a stand-in, and 2 more in `tests/leaderboard.test.js`. All 126 tests pass.
- The real page against the live project, which doesn't have the function yet: no winner shows, nothing breaks, and the console says `top_drawings` wasn't found.
- With stand-in winners: the home card (including "🏆 Your drawing won yesterday!") and the leaderboard section with three tied winners, at 1280 by 800 and phone width, with nothing scrolling sideways, and in dark mode. This caught Daily Scrawl's long parts list being cut off after a few words; it now wraps to two lines with the full list in a tooltip.
- Not checked: the live function (Kevin hasn't run the update), Safari or Firefox.

**Decisions**
- A function that returns only the winners, rather than widening who can read drawings, so the read rule stays as Kevin wrote it.
- Nothing extra is stored or kept: the winners are drawings the daily wipe already keeps through the player's whole yesterday-plus-today.

---

## 69. Time Challenge (2026-11-07) — Trenten

**What I asked for**
- A time challenge, planned first. I went with Claude's recommendations: four random parts, a choice of 30, 60 or 90 seconds, not published (so no database change), and its own card on the home screen.

**What changed**
- `frontend/index.html`: a "Time Challenge" card on the home screen. The slot machine rolls four parts (Basic's head, arms, legs and tail, without the optional extra), the reveal screen offers 30, 60 or 90 seconds (the last choice is remembered) and "Start the clock", then "3, 2, 1, Draw!" over the canvas (just "Draw!" with reduced motion), with the canvas locked until the clock starts. The clock sits beside the parts and turns red for the last ten seconds. At 0:00 the canvas locks, "Time's up!" shows, and the finish screen opens; Done drawing finishes early. Leaving the drawing or reloading ends the challenge and keeps what was drawn, so a reload can't buy extra time. "New challenge" replaces it.
- `frontend/drawing.js`: a Time Challenge has its own save slot (`"timed"`), so it never replaces the Free Play drawing; the round carries `timed: { seconds, startedAt, used }` through saves and restores; the finish screen says "⏱ Drawn in 30 seconds!", "⏱ Finished in 3 of 30 seconds!", or that it ended when you left; the share text and downloaded picture name it as a Time Challenge. It isn't published and doesn't count toward the streak (it isn't a daily drawing). My drawings (`sketchbook.js`) lists it as "30-second Time Challenge".
- `frontend/timer.js` (new): the countdown, now shared: Scrawdle Party's clock uses its math.
- `flow.css`: the clock, the 3-2-1, the time choices, and the finish line, in light and dark mode.
- `tests/timer.test.js`, `tests/time-challenge.test.js` (new), and one more test in `tests/share.test.js`.

**What I checked**
- 7 new Node tests (the clock's wording and rounding, time used, the save slot, the finish line, the share text). All 133 tests pass.
- In the browser, with the clock sped up 30 times so 30 seconds took about one: the card and the reveal (four parts, the choices, "Start the clock"); the canvas refusing to draw during "3, 2, 1"; the clock running from 0:30, red from 0:10, to 0:00; "Time's up!", the canvas locked, and the finish screen saying "Drawn in 30 seconds!" with no publish, Public drawings or leaderboard buttons and no streak line; the share text; finishing early ("Finished in 3 of 30 seconds!"); the 30-second choice remembered; reloading mid-challenge (the drawing kept and locked, "Time's up" on the clock, the finish screen saying it ended); a new challenge sending the last one to My drawings; the Free Play drawing untouched (last saved 43 minutes before the test). Scrawdle Party's clock still counts down with the shared timer. At phone width the time buttons are 44 px tall and fit, the clock doesn't cover the parts or the help button, and nothing scrolls sideways; dark mode checked.
- Not checked: Safari or Firefox, a real phone, and a real 60- or 90-second challenge at normal speed (the clock is worked out from the time on each tick, the same as Scrawdle Party's).

**Decisions**
- Not published, so there's no database update and no new list on Public drawings or the leaderboard. That can be added later with a new mode on the database.
- When a challenge ends by reload, the time it took isn't known, so the finish screen says it ended rather than guessing.

---

## 70. Drawings save in Safari private windows (2026-11-07) — Zainab

**What I asked for**
- Check the game in Firefox, Safari and Chrome, since we'd only ever tested Chrome, and fix whatever is broken, one thing at a time.

**What changed**
- `frontend/drawing.js`: in a Safari private window, drawings never saved. The status under the canvas said "Couldn't save", refreshing the page lost the drawing, and finished drawings never showed up in My drawings. Safari's private windows won't keep a picture file in the browser's storage, but they do keep text. Now, if saving the picture file doesn't work, the game saves the same picture as text instead, and it can read either one back, both when reopening a drawing and in My drawings. It skips that second try if a newer save has already happened, so an older copy of a drawing can't replace a newer one. Chrome, Firefox and normal Safari windows keep saving the same way as before.

**What I checked**
- All 133 tests pass.
- In Chrome, Firefox and Safari's engine, each in a private window and a normal one: drawing says "Saved in this browser", a refresh brings the drawing back, and a Free Play drawing replaced with New set shows up in My drawings. Before the fix the Safari private window failed 4 of these 33 checks; now all 33 pass, and the other browsers still save picture files. Downloading from My drawings in a Safari private window works too.
- A walkthrough of the whole game (home, dark mode, How to play, Daily Scrawl, all six tools, Undo and Redo, Opacity, the color picker, the finish screen, Download, Share, Replay, Free Play, Time Challenge, the leaderboard, Public drawings and the build log) passes in Chrome, Firefox and Safari's engine at laptop and phone sizes. I didn't find anything that breaks only in Firefox.
- A code review of the change found one rare case: in a Safari private window, leaving the tab in the split second while a save was being retried could put back a slightly older copy of the drawing. The retry now checks for a newer save first, and the save checks above were run again after that change.
- While testing, clicking Multiplayer made a few empty test rooms in the live database, since it creates a room right away. They're removed after a day like any other room.
- Not checked: a real iPhone or the real Safari app (only Safari's engine), and publishing, voting or rooms with other players, because those write to the live database.

**Decisions**
- The text copy is only used when saving the picture file fails, so nothing changes in browsers that were already saving fine.

---

## 71. Size buttons on laptops (2026-11-07) — Zainab

**What I asked for**
- On laptop screens the Small, Medium and Large size buttons didn't show, only the slider. Fix that without making anything else worse.

**What changed**
- `frontend/flow.css`: the Small, Medium and Large buttons were hidden on every screen 920 pixels tall or less, which is almost every laptop, by a rule from the Nov 2 redesign (entry 25). Now they show there too. On those screens they sit on the same row as "Size" instead of a row of their own, so the settings panel doesn't get taller, and the brush style buttons are a little shorter.

**What I checked**
- In Chrome, Firefox and Safari's engine at 1440x900, 1366x768, 1280x800, 1280x720, 1024x768 and 1920x1080, with the Pen and with the Brush: the three buttons show and set the size (Large sets it to 24), nothing in the settings panel is cut off, and nothing scrolls sideways.
- The page never scrolls further than before. On the shortest screen (1280x720) with the Brush picked it now scrolls a little less: 20 pixels instead of 27 in Chrome and Firefox, and 13 instead of 22 in Safari's engine.
- All 133 tests pass.
- Not checked: phones and tablets (narrower than 1000 pixels), where the size buttons are still hidden on purpose and only the slider shows. That's part of the next fix, for phones.

**Decisions**
- The change only applies to laptop-height screens. Taller screens keep the layout they had.

---

## 72. The drawing screen fits phones again (2026-11-08) — Zainab

**What I asked for**
- Check the drawing screen on phones and fix what's wrong, one thing at a time, starting with what's most broken.

**What changed**
- `frontend/flow.css`: on phones, the settings box under the tools fit "Pen · Black", Size and its slider, and Opacity and its slider all on one line. Since the Opacity slider joined that line, it didn't fit anymore: the Opacity label and slider stuck out past the right edge of the screen, so phones zoomed the whole drawing screen out to fit it (a 375-pixel-wide iPhone showed it as if it were 426 pixels wide), and the Opacity slider got squeezed into a tiny dot at the edge. Now, on phones and tablets, Size and Opacity each get their own line with the slider next to the label, and nothing sticks out past the edge. Laptops and bigger screens don't change.

**What I checked**
- In Chrome, Firefox and Safari's engine, on seven phone and tablet sizes (iPhone SE, a small Android, iPhone 14, Pixel, iPhone Pro Max, iPad, and a phone held sideways), in Daily Scrawl, Free Play and Daily Free Play, with the Pen, the Brush and the Bucket: the drawing screen fits the screen every time, 252 of 252 checks. Before the fix, none of them did. Tapping the Size and Opacity sliders changes them.
- All 133 tests pass.
- Found while checking, not changed here: with a phone held sideways, the canvas covers the row of tools, so they can't be tapped. That was already happening before this change. It's on the list for the next phone fixes, along with making the parts take less room.
- Not checked: a real phone.

**Decisions**
- Only phones and tablets change. On laptops the settings box stays the way it was.

---

## 73. Yesterday's winners move off the home screen (2026-11-08) — Zainab

**What I asked for**
- When I opened the game, the first thing on the home screen was yesterday's winning drawing, so big that I couldn't see how to start a game. Put it on another screen.

**What changed**
- `frontend/index.html`: the home screen no longer shows the "Yesterday's winners" card (Trenten's, entry 68). With only one winner, the card stretched to the full width of the home column and showed the drawing full size, which pushed Daily, Multiplayer, Free Play and Time Challenge below the bottom of the screen on laptops and phones. It only started showing tonight, once database update 005 was run. Yesterday's winners are still on the leaderboard page, which builds them on its own, and the home screen's Today's leaderboard link goes there.

**What I checked**
- In Chrome, Firefox and Safari's engine at 1440x900, 1280x720 and 390x844, with the live database: before the change the game buttons were below the screen at every size. Now, on laptops all four are on the first screen, and on phones Daily and Multiplayer are (Free Play and Time Challenge are a short scroll down). Daily still starts a game, and the leaderboard page still shows "Yesterday's winners".
- All 133 tests pass.

**Decisions**
- Moved off the home screen rather than shrunk, so the game buttons come first. The card's styles in `leaderboard.css` (`#yesterday-slot`) are left in place, unused, in case it comes back somewhere else.

---

## 74. The arcade drawing screen, hearts for likes, and fixes from a full playtest (2026-11-08) — Zainab

**What I asked for**
- Bring my arcade drawing screen over to the team's game (the team said I could, and Kevin liked it), keep the wooden easel around the canvas, add the big red ball joystick, put the navy top bar back, and give the whole drawing screen a light and a dark version.
- Make it keep its shape when you zoom the browser in or out.
- Replace the thumbs up / thumbs down and "Waiting for votes" with a small heart in the corner of each drawing that fills red when you like it and shows how many likes it has.
- Show the streak only from 3 days in a row, with no emoji.
- Then go through the whole game like a player and a grader would, and fix what doesn't work.
- On the home page, make "Continue drawing" small and up in a corner, and use icons for Dark mode and How to play like my own redesign has, instead of the words.
- Pressing Daily Scrawl after I'd published took me to the finish screen instead of the canvas; it should go to the canvas.

**What changed**
- The drawing screen (`frontend/arcade.css`, new, and the `#game` markup in `frontend/index.html`): the parts on a pinned sticky note with a box to tick for each, the tools as chunky keys, the canvas in a wooden frame on an easel with the twelve colors and Custom standing as markers on its tray, Small / Medium / Large as cards, and a control deck with a joystick, round Undo / Redo / Clear and a big red Done drawing. The navy top bar has a house button for home. Light mode is a cream cabinet and dark mode a dark one. Every size is based on the window, so zooming in or out keeps the proportions, with a floor so small text never goes under 11px. On phones the canvas is on the first screen, the parts note is two columns, the top bar (and the Time Challenge clock) stays at the top, and Undo / Redo / Clear / Done drawing stay at the bottom. `createBoard` in `drawing.js` takes an optional `palette` element for the colors, so Scrawdle Party's board is unchanged. All of it is scoped to `#game`.
- New files: `frontend/arcade.css`; `frontend/assets/arcade/joystick.svg` and `easel-clamp.svg` (drawn for this, nothing downloaded); `frontend/fonts/fredoka.woff2` (Fredoka, SIL Open Font License, the cabinet's font); `tests/syntax.test.js`.
- Likes (`votes.js`, `gallery.js`, `leaderboard.js`, `party.js`, `flow.css`): a heart icon instead of 👍 / 👎 on Public drawings, the leaderboard, yesterday's winners, your own drawing, and Scrawdle Party's voting and results. "Waiting for votes." is gone; your own drawing shows its heart count, and "You won!" once someone likes it. The database is unchanged: a like is still a vote of 1, and older thumbs-down votes stay but have no button.
- Streak (`streak.js`, `drawing.js`): shown from 3 days in a row, with no emoji, on the home screen, the finish screen and in the share text.
- A published drawing (`publish.js`, `index.html`, `drawing.js`): no longer offered as "Continue drawing" on home; pressing its mode again still opens it on the canvas, as before; and the finish screen says it's already published and no longer offers Publish again after a refresh. `window.scrawdleIsPublished` works even when Supabase can't load.
- Time Challenge (`index.html`): leaving during "3, 2, 1" really cancels it (before, the clock started anyway and the finish screen popped up over home later), and Done drawing waits during the countdown.
- Navigation (`index.html`): the reveal and drawing screens open scrolled to the top on phones; the drawing screen is hidden behind the reveal (on a phone you could scroll down to the tools and Done); links home from Public drawings and the leaderboard land on home instead of reopening the finish screen, while a refresh still returns to the drawing; sessionStorage calls are wrapped so blocked storage doesn't stop the buttons.
- Public drawings (`gallery.js`): opened for Daily Scrawl before posting, it shows Daily Free Play and says why Daily Scrawl is locked (it used to show an empty page), and a line under the title says drawings "leave this page at midnight and are deleted within two days".
- Scrawdle Party (`party.js`, `party.css`): guests get a Leave game button (they couldn't leave a running game), the bar with the round and End game / Leave game shows while drawing too, and the host's Players button no longer sits over Undo.
- Home (`home.css`, `index.html`): "Continue drawing" is a small card in the top-left corner (a little picture, one line of parts, the full list on hover, and the x) instead of a wide banner above the menu; Dark mode and How to play are square icon buttons in the top right (a moon, or a sun in dark mode, and a question mark), drawn like the Public drawings button, with their names as the tooltip and for screen readers; every card's description is always shown, so hovering no longer moves the other cards (clicks could land on the wrong mode) and phones no longer cut the text off; the "parts couldn't load" error shows under the buttons; part checkboxes have screen-reader labels ("Head: Rabbit").
- Finish screen (`drawing.js`): a blank canvas says "Nothing drawn yet." with no Download; a failed publish says "Couldn't publish"; sharing a Free Play drawing says "Free Play" (not "Open Canvas").
- Leaderboard (`leaderboard.js`, `leaderboard.css`): heading "Today's leaderboard", links in ink instead of browser blue, the doodles show behind it, and the name links home.
- How to play and `README.md` rewritten to match the game (the README said dark mode wasn't built and that the winner was on the home screen).

**What I checked**
- A full review of the game in Chrome, Firefox and Safari's engine, at laptop and phone sizes and in light and dark mode, with every problem re-checked independently, plus research on how daily and drawing games handle flow, streaks, likes and sharing. Nothing wrote to the live database: publishing and lobbies were tested with a stand-in Supabase.
- After the fixes: the 29-step walkthrough passes in all three browsers on laptop; the drawing screen fits with no overlaps at 12 window sizes from 823x514 (175% zoom) to 2560x1440; on 3 phone sizes the canvas is on the first screen and Done drawing is always reachable; the color picker can be used on phones; the heart toggles and counts; refreshing, publishing, Time Challenge and the home links behave as above.
- The home changes and the canvas fix, in Chrome at laptop and phone size, light and dark: the corner notice and the icons show and the theme button still switches; a published Daily Scrawl drawing reopens on the canvas.
- All 150 tests pass (17 new in `tests/syntax.test.js`, which checks every browser script parses).

**Decisions**
- One commit for the whole set, as the team asked, instead of many small ones.
- Thumbs down has no button now; nothing is removed from the database, so it can come back.
- The old thumbs button styles in `flow.css` (`.vote-bar`, `.vote`) are left in place, unused.
- Not done tonight: a phone held sideways still lets the canvas cover most of the tools (already noted in entry 72); renaming Daily Free Play; replacing the Arial fallback with the game's fonts; a "done for today" home screen with a countdown.

---

## 75. Design review fixes: the drawing screen, home, gallery, Play again, and phones (2026-11-08) — Zainab

**What I asked for**
- A second, harder design review of the whole game against skribbl.io, Gartic Phone, Jackbox and Wordle, then fix what it found. Make my private copy the best version, taking anything useful from a second private copy I had another session working on.
- Let people play again after finishing, with a clean canvas.
- The drawing screen should keep its look in a split-screen window instead of shrinking with the window's height, and the tools should sit under the canvas on phones.

**What changed**
- Home (`index.html`, `home.css`): the moon and ? buttons stay top-right (the Continue card's slot had replaced the header's spacer); the cards open on hover again; the yellow Daily title is a button that opens its two halves; "Daily Scrawl · Continue" / "· Done ✓" on the card once today's drawing exists, with "New parts in 8h 32m" under the date; "Daily Free Play" is "Daily Doodle" on screen (the id stays `scrawl`); an invite-code field under the cards hands a code to the lobby the way an invite link does (no `lobby.js` change); the build-log link is small.
- Drawing screen (`arcade.css`, `drawing.js`, `index.html`): no bar across the top; a flat warm grey (#E6E1D6; dark mode: the dark page) behind the easel instead of the beige cabinet; size and opacity behind one Size key beside the tools, so the right column is gone and the canvas takes the room; the easel always fits a laptop window (the note's list scrolls inside itself on short windows); windows taller than 4:3 get a stacked layout (parts in one scrolling row, no easel legs, canvas as wide as fits, tools under it, the Size key as a seventh tool); a phone on its side puts Undo/Redo/Clear/Done in a column on the right; the joystick is a real button that opens the colour picker; Start over is a text link that asks "Clear the canvas? Undo brings it back." in the game's own box and flashes "Cleared!"; Done drawing is dimmed on a blank canvas and says "Draw something!"; the ticks reset with the canvas; a broken `font: 700 700 …` shorthand meant six things fell back to Arial, fixed; "Saved in this browser" no longer shows (only a failure would); 24px colour markers and 22px tick boxes on phones.
- Leaving a drawing (`index.html`, `home.css`): the house, the Scrawdle name and the browser's Back ask "Leave your drawing?" with Save draft, Keep drawing and Discard (a red link); no question on a blank, published or finished drawing or during a Time Challenge; Esc or a click outside keeps drawing.
- Finish screen (`drawing.js`): "Daily Scrawl · done ✓" (or Daily Doodle / Free Play / Time Challenge); "New parts in …"; the share text in a box labelled "What Share sends"; Publish goes straight to Public drawings on success; a drawing already published shows "See it in Public drawings" beside the greyed "Published ✓" and the leaderboard link; Play again starts a clean canvas with the same parts and keeps the finished one in My drawings (a second drawing can't be published the same day, the database allows one; the note says so); Back to home never asks.
- Public drawings and the leaderboard (`gallery.js`, `leaderboard.js`, `votes.js`, `home.css`): one All · Daily Scrawl · Daily Doodle switch (Daily Scrawl locked until you post, with the unlock animation), kind labels only in the All view; the heart and count under the picture; Report asks in the game's own box; "Back to home" on every page; "Your first like!" instead of "You won!"; an outline heart on your own card; empty states say "Be the first: draw today's parts".
- Fixes: Free Play's Cancel opens the saved drawing; the reveal screen has Back to home; a tab left open past midnight rebuilds home for the new day and `restore()` refuses another day's draft; a Time Challenge you walked out of says "Ended" and "You left after N seconds"; typing the address goes home while a reload returns to the drawing; Start over leaves no blank Continue card (`isMarked` ignores a trailing clear); `discard()` waits for a save in flight; the old 88dvh rule in `drawing.css` that let a sideways phone's canvas cover the tools is gone; `#board` uses `aspect-ratio: auto 3 / 2` so a drawing isn't stretched; the reduced-motion rules get the same `:is(html, …)` prefix as what they switch off.
- supabase-js 2.119.0 is served with the game as `frontend/vendor/supabase.js` (the UMD build from npm, MIT) instead of from the jsDelivr CDN, so a slow or blocked CDN can't stall the page. Same library, same version pinned; the three pages point at it.
- New copy: "Start Daily Scrawl? Your drawing for today is replaced and kept in My drawings." (the old text named Basic and Detailed); "New set of parts? Your Free Play drawing is kept in My drawings."; "Pick Daily Scrawl or Daily Doodle above to see drawings."; "No drawings yet today."

**What I checked**
- Two more review passes (a code review of the day's changes and a UX critique with sources), then every fix in headless Chrome: the leave box in every path, Publish → Public drawings, Play again, the Size key, the gallery switch in posted, unposted and unlocking states, dark mode, and the layout at 1440×900, 1280×720, 1200×700, 1920×1080, 1024×768, 756×957, 768×1024, 390×844 and 844×390: no sideways overflow, Done drawing always on screen, the colour tray never under the deck. Reload returns to the drawing in Chrome and Safari's engine. Nothing reached the live database (Supabase stubbed, `*.supabase.co` blocked).
- All 150 tests pass.
- Not checked: real phones (viewport sizes stood in), Firefox's reload under the test harness (it reports a reload as a plain visit there), anything against the real database.

**Decisions**
- "Daily Free Play" → "Daily Doodle" on screen only; the id `scrawl`, the database and My drawings are untouched. Team: say if you want the old name back.
- The stacked layout for tall or narrow windows (and the Size key, the phone layout and the vendored library) came from my second private copy; the rest is from here. Both copies started from main at 23f6895.
- Left for later: one header and button style across all pages; fewer typefaces; a faster parts reveal and player words for the categories; the home page fitting 1440×900 without scrolling; phone leaderboard as rows; Scrawdle Party's Ctrl+Z (the lobby dialog stays open under the game and blocks it).

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
- **A Time Challenge losing its name in My drawings (Claude's slip, entry 69, caught in the browser):** My drawings copies only some fields when it keeps a drawing, and Claude added the challenge's length to the round without adding it there, so a kept challenge showed as an ordinary drawing. Fixed in `myDrawings.keep`. The current one was also labeled "in progress" with a Continue button, which is wrong for a challenge that's already over; it now says "today" with an Open button.
- **Two mistakes in Claude's first version of kicking (entry 65), both caught by the stand-in lobby test, not by the unit tests:** (1) after a vote failed, the player list was redrawn just before the one-minute wait was recorded, so that player's Vote to kick button still looked usable (pressing it would still have been refused). (2) When a vote passed because the last undecided player left, the kicked player's own page saw it first and left, and the other pages then saw the target gone and reported "Dan left, so the vote ended" instead of a kick. Fixed by checking for a pass before checking whether the target is still there, with a test for it.
- **A party round that would have stalled (Claude's slip, entry 37, caught by the stand-in lobby test):** the host counted everyone in the lobby as a voter, including a player who joined mid-round and never got the drawings, so the round would have waited the full 30 seconds plus grace for a vote that couldn't come. Fixed so only the round's players are waited for. Claude's helper in that test also first grabbed the real lobby's empty game area instead of the test's, which looked like a missing button until it checked what was on the page.
- **The generator would have stopped on our own headings (found before running it, entry 31):** the copied script only accepted `## N. Title (date)`, and every heading here now ends with `— Name`. Reading the script first caught it; running it unchanged would have failed with "Unexpected section".
- **Backticks in a shell command, the exact mistake our shared notes warn about (Claude's slip, entry 32):** a one-line script that edited four docs had backticks inside a single-quoted shell string, so the shell refused to run it. Nothing was changed, but it was a mistake the notes list by name. The edits were made with the editing tool instead. Separately, Claude's first check of the new link's colour failed because it expected the link to match the "Explore sample drawings" button, which turns out to have its own softer grey set in `flow.css`; the link was changed to match.

- **A phone screenshot that wasn't the screen I thought (Claude's slip, entry 33):** Claude's browser check printed the right text for the phone home screen and moved on, but the screenshot it took was the game screen, because the page had restored the drawing left open by the desktop run. Claude noticed when it looked at the image instead of trusting the printed values, cleared the saved state, and retook it.
- **The lobby code stayed on screen after I asked to drop it (entries 52 and 54):** when I said I wasn't a fan of the code, only the invite message changed at first, and the big code and the Join box stayed because the lobby was Kevin's design. It should have been checked whether I meant all of it. Fixed in entry 54.
- **A guessed measurement in a code comment (Claude's slip, entry 60):** the first CSS comment said the big background word is "about 3.05 times its font size" wide, which Claude had not measured. Measuring it in Chrome gave 3.81, so the word ran off the page until the size and the comment were corrected.
- **I said Free Play was broken and Claude could not find it (entry 61):** I reported that the Free Play button didn't work. Claude checked it in a real browser with scripted clicks and with real mouse movements, at several window sizes, and it opened the parts screen every time, wired to the same `startFreePlay` as the old Open Canvas button. The cause is not found yet. One guess is the "Replace your Free Play drawing?" question, which only appears when a Free Play drawing already exists.
- **I blamed the browser for a lock that probably wasn't a browser problem (Claude's slip, entries 62 and 63):** when you said the Daily Scrawl filter didn't unlock, Claude tested the unlock with a faked "published" marker and listed the browser, the private window, and the file-versus-localhost address as likely causes. That left out the likeliest one, which Claude only checked next time: the live database has no Daily Scrawl drawings, so update 004 was probably never run and publishing it is refused.
- **My own edit helper dropped changes without saying so (Claude's slip, entries 56 to 58):** a script that patched the Supabase test stand-in returned the old text, so three of its edits vanished and the new tests failed with "is not a function". The failing tests caught it, nothing was committed, and the edits were redone. A check at the time of the home-screen change also looked at the export screen 700 ms after pressing Done drawing, before it had finished opening, and reported a failure that was only timing.

---

## Decisions and abandoned ideas

- Nothing abandoned yet. Team roles, exact prompt format, branch workflow, and the Supabase-vs-Firebase pick are all still open (see `CLAUDE.md`), not decided and discarded.
- (Kevin, 2026-11-04, entry 33) The free-draw mode is "Daily Free Play" on screen but keeps the id `scrawl` underneath, and the name "Daily Scrawl" is saved for the Basic + Detailed merge a teammate will build, which gets its own new id. Dropped: renaming the id now, because that needs a database update for a cosmetic gain.
- (Kevin, 2026-11-04, entry 33) Basic and Detailed will go away as separate modes and become the one "Daily Scrawl". When that ships, their database values stay allowed for a day and are removed in a later update; they are not renamed in place. Noted in `CLAUDE.md`.
- (Angie, 2026-11-06, entry 56) Daily Scrawl (id `daily`) is live in the page and uses the full Detailed set of parts. Basic and Detailed are gone from the home screen, but their database values are still allowed (update 004 keeps them) until a later numbered update drops them once the daily wipe has cleared the old rows. Open Canvas is only Free play renamed.
