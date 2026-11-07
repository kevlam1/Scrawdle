/* Countdowns, shared by the Time Challenge (index.html) and Scrawdle Party (party.js).
 *
 *   const stop = ScrawdleTimer.run(element, 60, { onEnd, onTick });
 *
 * shows "1:00" and counts down in `element`, adding the class "hurry" for the last HURRY seconds,
 * and calls onEnd once at 0:00. stop() cancels it. The time is worked out from the clock on each
 * tick, not by counting ticks, so a busy or backgrounded page can't make it run slow.
 *
 * The math is tested in tests/timer.test.js.
 */
(function (root) {
  "use strict";

  const HURRY = 10; // the last ten seconds turn red

  // Whole seconds left until `endsAt` (a Date.now() time), never below 0.
  const secondsLeft = (endsAt, now) => Math.max(0, Math.ceil((endsAt - now) / 1000));

  // 65 -> "1:05", 9 -> "0:09".
  function clockText(seconds) {
    const s = Math.max(0, Math.floor(Number(seconds) || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  // How long a challenge took, in whole seconds, from its start to `now`, at most its length.
  const secondsUsed = (startedAt, now, length) => Math.min(length, Math.max(0, Math.round((now - startedAt) / 1000)));

  const pure = { HURRY, secondsLeft, clockText, secondsUsed };
  if (typeof module !== "undefined" && module.exports) { module.exports = pure; return; }

  function run(target, seconds, { onEnd, onTick, now = () => Date.now() } = {}) {
    const endsAt = now() + seconds * 1000;
    let done = false;
    const tick = () => {
      if (done) return;
      const left = secondsLeft(endsAt, now());
      target.textContent = clockText(left);
      target.classList.toggle("hurry", left <= HURRY);
      if (onTick) onTick(left);
      if (left === 0) { stop(); if (onEnd) onEnd(); }
    };
    const id = setInterval(tick, 250);
    function stop() { done = true; clearInterval(id); }
    tick();
    return stop;
  }

  root.ScrawdleTimer = { ...pure, run };
})(typeof window !== "undefined" ? window : globalThis);
