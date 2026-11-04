# frontend

- `index.html`: the home screen, reveal screen, parts above the canvas, and the win buttons.
- `prompts.json`: the parts the slot machine picks from.
- `daily.js`: picks the same parts for everyone on a given date.
- `drawing.js`: the drawing tools, brush types, undo and redo, auto-save, replay, and the finish screen.
- `drawing.css`, `studio.css`, and `flow.css`: the look of the game, loaded in that order. Later files override earlier ones.
- `fonts/`: Patrick Hand and Gochi Hand.
- `assets/tools/`: the illustrated icons for the drawing tools.
- `gallery.js` and `assets/sample-strawberries.webp`: the gallery, with labeled sample drawings until real drawings are connected.
- `supabase-config.js`: the Supabase project URL and anon key. Filled in with Kevin's real project; safe to commit (the key is meant to be public, see `../CLAUDE.md`). Running the page locally publishes to that same real project.
- `publish.js`: wires `window.scrawdlePublish` and `window.scrawdleGallery` to Supabase. Does nothing until `supabase-config.js` has real values, so the Publish button and gallery stay hidden exactly as before.

Publishing needs `supabase-config.js` filled in and the schema in `../backend/supabase/schema.sql` run against a real project; both are done. With the two config values emptied, the page works without publishing — see the comments at the top of `drawing.js` and `gallery.js` for the hooks.

Stack is proposed in `../CLAUDE.md`, not locked: plain HTML5 Canvas with vanilla JS/TS, no UI framework. Replace or restructure this folder once the team confirms that and splits up ownership.
