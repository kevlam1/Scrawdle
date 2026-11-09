/* Likes on published drawings: a small heart, one per player per drawing. The database keeps them as
 * votes (1 is a like; -1, an older thumbs down, still counts in the database but has no button now).
 * The win condition lives here so it can change without a database update: today a drawing has won once
 * anyone likes it. A drawing's votes look like { up, down, mine }, where `up` is its likes and `mine` is
 * this player's own vote: 1, -1, or 0 for none. */
(function (root) {
  "use strict";

  const NO_VOTES = Object.freeze({ up: 0, down: 0, mine: 0 });

  function isWin(votes) {
    return Boolean(votes) && votes.up >= 1;
  }

  // The words under the player's own drawing, beside its heart count; "" for none.
  function resultText(votes) {
    if (!votes) return "Publish it so others can like it.";
    return votes.up === 1 ? "Your first like!" : ""; // the heart shows the count; "won" is for yesterday's winners
  }

  // The heart: an outline, filled red once liked. Public drawings, the leaderboard and Scrawdle Party all use it.
  const HEART = "M12 20.6s-7.6-4.6-9.4-9.3C1.3 7.9 3.4 4.4 6.9 4.4c2.1 0 3.7 1.2 5.1 3 1.4-1.8 3-3 5.1-3 3.5 0 5.6 3.5 4.3 6.9-1.8 4.7-9.4 9.3-9.4 9.3z";
  function heartIcon(filled) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", filled ? "heart filled" : "heart");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", HEART);
    svg.append(path);
    return svg;
  }
  // A heart and its number, for showing likes without a button (your own drawing, the leaderboard).
  function likeCount(count, filled) {
    const span = document.createElement("span");
    span.className = "like-count";
    span.setAttribute("role", "img");
    span.setAttribute("aria-label", `${count} ${count === 1 ? "like" : "likes"}`);
    span.append(heartIcon(filled), String(count));
    return span;
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
  else root.ScrawdleVotes = { ...api, heartIcon, likeCount };
})(typeof window !== "undefined" ? window : globalThis);
