# frontend

- `index.html`: the start screen, slot machine, and prompt bar.
- `prompts.json`: the parts the slot machine picks from.
- `drawing.js` and `drawing.css`: the drawing tools, brush types, undo and redo, auto-save, and the finish screen.

There's no backend connection yet. To connect publishing, see the comment at the top of `drawing.js`.

Stack is proposed in `../CLAUDE.md`, not locked: plain HTML5 Canvas with vanilla JS/TS, no UI framework. Replace or restructure this folder once the team confirms that and splits up ownership.
