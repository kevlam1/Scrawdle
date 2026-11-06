# frontend

- `index.html`: the home screen, reveal screen, and parts above the canvas.
- `prompts.json`: the parts the slot machine picks from.
- `daily.js`: picks the same parts for everyone on a given date.
- `drawing.js`: the drawing tools, brush types, undo and redo, auto-save, replay, and the finish screen.
- `drawing.css`, `studio.css`, and `flow.css`: the look of the game, loaded in that order. Later files override earlier ones.
- `fonts/`: Patrick Hand and Gochi Hand.
- `assets/tools/`: the illustrated icons for the drawing tools.
- `gallery.js` and `assets/sample-strawberries.webp`: today's gallery, with thumbs up/down buttons on other players' drawings and your result on your own, plus a separate gallery of labeled sample drawings.
- `votes.js`: the vote rules, including the win condition (one thumbs up wins). Change the rule here; no database update needed. Tested in `../tests/votes.test.js`.
- `supabase-config.js`: the Supabase project URL and anon key. Filled in with Kevin's real project; safe to commit (the key is meant to be public, see `../CLAUDE.md`). Running the page locally publishes to that same real project.
- `publish.js`: wires `window.scrawdlePublish`, `window.scrawdleGallery`, and `window.scrawdleVote` to Supabase (votes need `../backend/supabase/updates/002-votes.sql`). Tested against a stand-in for Supabase in `../tests/publish-votes.test.js`. Does nothing until `supabase-config.js` has real values, so the Publish button and gallery stay hidden exactly as before.
- `lobby.js` and `lobby.css`: lobbies, joined with a 5-letter code or a link like `/?BCDFG`: the Lobby card on the home screen, the lobby room, and the contract games plug into (`ScrawdleLobby.registerGame`). Read the comment at the top of `lobby.js` before building a multiplayer game, and the "Lobbies and adding a multiplayer game" section of `../CLAUDE.md`. Does nothing if `supabase-config.js` is empty. Its pure logic is tested in `../tests/lobby.test.js`.
- `logs/index.html`: the build-log page, served at `/logs`. **Generated** from `../log.md`, `../scripts/log-summaries.mjs`, and `../scripts/logs-template.html` by `node scripts/make-logs-page.mjs`; edit those, not this file. The game links to it from the bottom of the home screen ("Read our build log").
- Daily Free Play (a card on the home screen; internal id `scrawl`, kept so the database and saved drawings don't change) is a free-draw mode with no parts. It is a normal round with mode `scrawl` and one pseudo-prompt, "Draw anything", so the prompt bar, finish screen, PNG export, and gallery work unchanged. It has its own save slot in `drawing.js` (cleared each day, like Basic and Detailed). Its drawings get votes like the others; with no parts, a thumbs up just means another player liked it.

Publishing needs `supabase-config.js` filled in and the schema in `../backend/supabase/schema.sql` run against a real project; both are done. With the two config values emptied, the page works without publishing — see the comments at the top of `drawing.js` and `gallery.js` for the hooks.

Stack is proposed in `../CLAUDE.md`, not locked: plain HTML5 Canvas with vanilla JS/TS, no UI framework. Replace or restructure this folder once the team confirms that and splits up ownership.
