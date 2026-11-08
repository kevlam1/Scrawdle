/* Streak: how many days in a row this player has finished a daily drawing (Daily Scrawl or Daily
 * Free Play, not Free Play, and not a blank canvas). A day counts when the finish screen opens for
 * that drawing. Days are the player's local date, like the rest of the game ("YYYY-MM-DD", from
 * dayKey in drawing.js).
 *
 * Kept in this browser only, as the list of days drawn (localStorage "scrawdle-streak"), so there's
 * nothing to sign in to and nothing on the database. Clearing site data, or another browser or
 * device, starts over.
 *
 * The date math is tested in tests/streak.test.js.
 */
(function (root) {
  "use strict";

  const KEEP_DAYS = 400; // more than a year of days; a longer streak still counts through `best`
  const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

  // "2026-11-07" -> a whole number of days, so consecutive dates differ by exactly 1, across months,
  // years and leap days. Uses UTC on purpose: these are dates, not moments, so clock changes can't
  // make a day 23 or 25 hours long.
  function dayNumber(day) {
    if (typeof day !== "string" || !DAY_RE.test(day)) return NaN;
    const [y, m, d] = day.split("-").map(Number);
    const t = Date.UTC(y, m - 1, d);
    const back = new Date(t);
    if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) return NaN; // 2026-02-30
    return Math.round(t / 86400000);
  }

  // Sorted, no repeats, only real dates, and only the most recent KEEP_DAYS.
  function addDay(days, day) {
    const all = (Array.isArray(days) ? days : []).concat(day == null ? [] : [day]);
    const good = [...new Set(all.filter((d) => !Number.isNaN(dayNumber(d))))];
    good.sort((a, b) => dayNumber(a) - dayNumber(b));
    return good.slice(-KEEP_DAYS);
  }

  function longestRun(days) {
    let best = 0;
    let run = 0;
    let prev = NaN;
    for (const n of addDay(days).map(dayNumber)) {
      run = n === prev + 1 ? run + 1 : 1;
      best = Math.max(best, run);
      prev = n;
    }
    return best;
  }

  // current: the run ending today, or ending yesterday if today isn't drawn yet (it's still alive
  // until today ends). best: the longest run ever, or `bestSoFar` if that's higher (old days may
  // have been dropped). drewToday: whether today is already in.
  function streakOf(days, today, bestSoFar = 0) {
    const set = new Set(addDay(days).map(dayNumber));
    const t = dayNumber(today);
    const drewToday = set.has(t);
    let current = 0;
    for (let n = drewToday ? t : t - 1; set.has(n); n--) current++;
    return { current, best: Math.max(longestRun(days), Number(bestSoFar) || 0, current), drewToday };
  }

  // A streak only shows once it's a real one: this many days in a row. Days 1 and 2 still count, quietly.
  const SHOW_FROM = 3;

  // What the home screen says, or "" when there's no streak to show.
  function homeText(s) {
    if (!s || s.current < SHOW_FROM) return "";
    const days = `${s.current}-day streak`;
    return s.drewToday ? days : `${days} · Draw today to keep it going`;
  }

  // What the finish screen says. `added` is true when this drawing is the first to count today.
  function finishText(s, added, bestBefore) {
    if (!s || s.current < SHOW_FROM) return "";
    if (!added) return `${s.current}-day streak`;
    if (s.current > bestBefore) return `New best: ${s.current} days in a row!`;
    return `That's ${s.current} days in a row!`;
  }

  const pure = { dayNumber, addDay, longestRun, streakOf, homeText, finishText, KEEP_DAYS, SHOW_FROM };
  if (typeof module !== "undefined" && module.exports) { module.exports = pure; return; }

  /* ---------- This browser's streak ---------- */
  const KEY = "scrawdle-streak"; // localStorage: { days: ["YYYY-MM-DD", ...], best: n }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      return { days: addDay(saved.days), best: Number(saved.best) || 0 };
    } catch (err) { return { days: [], best: 0 }; }
  }
  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (err) { /* private mode: the streak just isn't kept */ }
  }

  // The streak as of `today`.
  function read(today) {
    const data = load();
    return streakOf(data.days, today, data.best);
  }

  // Counts `day` (the drawing's own day) and returns { ...streak as of today, added, bestBefore }.
  function record(day, today) {
    const data = load();
    const before = streakOf(data.days, today, data.best);
    const added = !data.days.includes(day);
    data.days = addDay(data.days, day);
    const after = streakOf(data.days, today, data.best);
    data.best = after.best;
    save(data);
    return { ...after, added, bestBefore: before.best };
  }

  root.ScrawdleStreak = { ...pure, read, record };
})(typeof window !== "undefined" ? window : globalThis);
