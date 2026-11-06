/* Votes on published drawings: thumbs up or thumbs down, one per player per drawing.
 * The win condition lives here so it can change without a database update: today a drawing
 * has won once anyone gives it a thumbs up. A drawing's votes look like { up, down, mine },
 * where `mine` is this player's own vote: 1, -1, or 0 for none. */
(function (root) {
  "use strict";

  const NO_VOTES = Object.freeze({ up: 0, down: 0, mine: 0 });

  function isWin(votes) {
    return Boolean(votes) && votes.up >= 1;
  }

  // What the player sees under their own drawing.
  function resultText(votes) {
    if (!votes) return "Publish it to get votes.";
    const tally = `👍 ${votes.up} · 👎 ${votes.down}`;
    if (isWin(votes)) return `You won! ${tally}`;
    return votes.down ? `No thumbs up yet. ${tally}` : "Waiting for votes.";
  }

  // Pressing the vote you already gave takes it back; pressing the other one switches it.
  // Returns the value to send (1, -1, or 0 to clear) and the counts to show straight away.
  function applyVote(votes, pressed) {
    const v = votes || NO_VOTES;
    const next = v.mine === pressed ? 0 : pressed;
    const up = v.up - (v.mine === 1 ? 1 : 0) + (next === 1 ? 1 : 0);
    const down = v.down - (v.mine === -1 ? 1 : 0) + (next === -1 ? 1 : 0);
    return { value: next, votes: { up, down, mine: next } };
  }

  // Turns the database's rows into { [drawingId]: votes }. A drawing with no row gets no votes,
  // and anything malformed counts as zero rather than breaking the gallery.
  function countsById(rows, ids) {
    const out = {};
    for (const id of ids || []) out[id] = { ...NO_VOTES };
    for (const row of Array.isArray(rows) ? rows : []) {
      if (!row || typeof row.drawing_id !== "string") continue;
      const n = (x) => (Number.isInteger(x) && x > 0 ? x : 0);
      out[row.drawing_id] = { up: n(row.up), down: n(row.down), mine: [1, -1].includes(row.my_vote) ? row.my_vote : 0 };
    }
    return out;
  }

  const api = { isWin, resultText, applyVote, countsById, NO_VOTES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ScrawdleVotes = api;
})(typeof window !== "undefined" ? window : globalThis);
