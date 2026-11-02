# frontend

- `index.html`: the start screen, slot machine, and prompt bar.
- `prompts.json`: the parts the slot machine picks from.
- `daily.js`: picks the same parts for everyone on a given date.
- `drawing.js` and `drawing.css`: the drawing tools, brush types, undo and redo, auto-save, replay, and the finish screen.
- `assets/tools/`: the illustrated icons for the drawing tools.
- `gallery.js`: the gallery shown after finishing, with sample doodles until real drawings are connected.

There's no backend connection yet. To connect publishing and real drawings, see the comments at the top of `drawing.js` and `gallery.js`.

Stack is proposed in `../CLAUDE.md`, not locked: plain HTML5 Canvas with vanilla JS/TS, no UI framework. Replace or restructure this folder once the team confirms that and splits up ownership.
