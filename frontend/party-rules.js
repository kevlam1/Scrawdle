/* Scrawdle Party's rules, kept apart from the screens so they can be tested in Node
 * (tests/party-rules.test.js). party.js is the game itself.
 *
 * A round: everyone draws the same random parts, then gives each OTHER drawing a thumbs up or
 * down. A drawing with at least one thumbs up won the round (the same rule as the daily gallery,
 * see votes.js); the most thumbs up is the round's top drawing. Each thumbs up is one point,
 * added up over the rounds. Thumbs down don't take points away. */
(function (root) {
  "use strict";

  const OPTIONS = { mode: ["basic", "detailed"], rounds: [1, 3, 5], seconds: [60, 90, 120] };
  const DEFAULTS = { mode: "basic", rounds: 3, seconds: 90 };
  const VOTE_SECONDS = 30;
  const GRACE_SECONDS = 6; // how long the host waits past the timer for late drawings or votes

  // A drawing travels as one message, and Supabase's free plan allows 256 KB per message. The
  // limit leaves room for the rest of the message. party.js tries these in order and sends the
  // first that fits; a typical drawing fits at the first step (measured 2026-11-05).
  const MAX_IMAGE_CHARS = 230000;
  const ENCODE_STEPS = [
    { type: "image/webp", quality: 0.8, width: 900 },
    { type: "image/jpeg", quality: 0.8, width: 900 },
    { type: "image/jpeg", quality: 0.6, width: 900 },
    { type: "image/jpeg", quality: 0.45, width: 900 },
    { type: "image/jpeg", quality: 0.6, width: 750 },
    { type: "image/jpeg", quality: 0.4, width: 600 },
  ];

  // Anything the host didn't choose, or a value that isn't offered, falls back to the default.
  function cleanSettings(s) {
    const pick = (key) => (s && OPTIONS[key].includes(s[key]) ? s[key] : DEFAULTS[key]);
    return { mode: pick("mode"), rounds: pick("rounds"), seconds: pick("seconds") };
  }

  // Random parts for a round, from prompts.json. Detailed is Basic's parts plus its own.
  function rollParts(promptData, mode, random = Math.random) {
    const entries = Object.entries(promptData.basic);
    if (mode === "detailed") {
      for (const [key, part] of Object.entries(promptData.detailed)) if (key !== "includes") entries.push([key, part]);
    }
    return entries.map(([, part]) => ({
      label: part.label,
      value: part.options[Math.floor(random() * part.options.length)],
      optional: Boolean(part.optional),
    }));
  }

  // A shuffled copy, so drawings show in a different order from the player list while voting
  // (otherwise the order would give away who drew what). The host shuffles once and sends the
  // order, so everyone sees the same one.
  function shuffled(items, random = Math.random) {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // ballots: { voterId: { drawingOwnerId: 1 | -1 | 0 } }. Votes for yourself, for someone who
  // didn't draw, or that aren't 1 or -1 don't count.
  function tally(owners, ballots) {
    const votes = {};
    for (const id of owners) votes[id] = { up: 0, down: 0 };
    for (const [voter, ballot] of Object.entries(ballots || {})) {
      if (!ballot || typeof ballot !== "object") continue;
      for (const [owner, value] of Object.entries(ballot)) {
        if (owner === voter || !votes[owner]) continue;
        if (value === 1) votes[owner].up++;
        else if (value === -1) votes[owner].down++;
      }
    }
    return votes;
  }

  function roundResults(owners, ballots) {
    const votes = tally(owners, ballots);
    const winners = owners.filter((id) => votes[id].up >= 1);
    const most = Math.max(0, ...owners.map((id) => votes[id].up));
    const top = most > 0 ? owners.filter((id) => votes[id].up === most) : [];
    return { votes, winners, top };
  }

  function addScores(scores, votes) {
    const out = { ...scores };
    for (const [id, v] of Object.entries(votes)) out[id] = (out[id] || 0) + v.up;
    return out;
  }

  // Highest points first. Players with the same points share a place (1, 2, 2, 4).
  function standings(scores, names) {
    const list = Object.entries(scores)
      .map(([id, points]) => ({ id, name: (names && names[id]) || "Player", points }))
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
    list.forEach((row, i) => { row.place = i > 0 && row.points === list[i - 1].points ? list[i - 1].place : i + 1; });
    return list;
  }

  // True once every player still in the lobby who is in this round is done. Players who left
  // aren't waited for.
  function everyoneDone(roundPlayers, presentIds, doneIds) {
    const waiting = roundPlayers.filter((id) => presentIds.includes(id));
    return waiting.length > 0 && waiting.every((id) => doneIds.includes(id));
  }

  const api = { OPTIONS, DEFAULTS, VOTE_SECONDS, GRACE_SECONDS, MAX_IMAGE_CHARS, ENCODE_STEPS, cleanSettings, rollParts, shuffled, tally, roundResults, addScores, standings, everyoneDone };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ScrawdlePartyRules = api;
})(typeof window !== "undefined" ? window : globalThis);
