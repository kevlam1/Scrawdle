/* Today's parts: everyone playing on the same date gets the same ones.
 * The pick depends only on the date and the part, so no server is needed. Editing an options
 * list in prompts.json can change that day's pick for anyone who loads it afterward. */
(function (root) {
  "use strict";

  function dailyIndex(day, partKey, count) {
    let h = 0x811c9dc5;
    for (const ch of `${day}|${partKey}`) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 0x01000193);
    }
    h ^= h >>> 15;
    h = Math.imul(h, 0x2c1b3c6d);
    h ^= h >>> 12;
    return (h >>> 0) % count;
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { dailyIndex };
  else root.ScrawdleDaily = { dailyIndex };
})(typeof window !== "undefined" ? window : globalThis);
