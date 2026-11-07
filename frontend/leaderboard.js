/* Today's leaderboard (/leaderboard/): today's published drawings ranked by thumbs up, one list for
 * Daily Scrawl and one for Daily Free Play. It resets with the day, because the drawings it reads are
 * only today's (by the player's local date) and the daily wipe deletes them.
 *
 * It ranks drawings, not players: a published drawing doesn't carry a name. Drawings with no thumbs
 * up yet aren't ranked. Ties share a place; fewer thumbs down breaks a tie.
 *
 * The data comes from publish.js's window.scrawdlePublicGallery, the same loader as the Public
 * drawings page, with the same rule: Daily Scrawl stays locked until this player has posted theirs
 * (window.scrawdleHasPosted), so its drawings aren't even loaded before then.
 *
 * The ranking is tested in tests/leaderboard.test.js.
 */
(function (root) {
  "use strict";

  const GROUPS = [
    { id: "daily", label: "Daily Scrawl", modes: ["daily", "basic", "detailed"] },
    { id: "free", label: "Daily Free Play", modes: ["scrawl"] },
  ];
  const TOP = 10;

  // Drawings with at least one thumbs up, best first, each with its `place`. Equal thumbs up and
  // equal thumbs down share a place (1, 2, 2, 4).
  function rank(items) {
    const scored = (Array.isArray(items) ? items : []).filter((it) => it && it.votes && it.votes.up >= 1);
    scored.sort((a, b) => b.votes.up - a.votes.up || a.votes.down - b.votes.down);
    const out = [];
    for (const [i, it] of scored.entries()) {
      const prev = out[i - 1];
      const tied = prev && prev.votes.up === it.votes.up && prev.votes.down === it.votes.down;
      out.push({ ...it, place: tied ? prev.place : i + 1 });
    }
    return out;
  }

  // Where this player's drawing stands in a group's ranking: { place, of } if it's ranked,
  // { unranked: true } if it's there but has no thumbs up yet, or null if they have none here.
  function myStanding(items, ranked) {
    const mine = (items || []).find((it) => it && it.mine);
    if (!mine) return null;
    const hit = (ranked || []).find((it) => it.id === mine.id);
    return hit ? { place: hit.place, of: ranked.length } : { unranked: true };
  }

  function standingText(s) {
    if (!s) return "";
    if (s.unranked) return "Your drawing has no thumbs up yet, so it isn't ranked.";
    return `Yours is #${s.place} of ${s.of} today.`;
  }

  const groupOf = (mode) => GROUPS.find((g) => g.modes.includes(mode)) || null;

  // The top TOP places. Drawings tied for the last place shown all show, so a tie isn't cut in half.
  const topOf = (ranked) => (ranked || []).filter((it) => it.place <= TOP);

  /* ----- Yesterday's winners (publish.js's scrawdleYesterdayWinners, database update 005) ----- */
  // What a winner was drawn to: yesterday's parts, or "Draw anything" for Daily Free Play.
  function winnerCaption(card) {
    if (!card) return "";
    if (card.mode === "scrawl") return "Daily Free Play · Draw anything";
    const parts = (card.prompts || []).map((p) => p && p.value).filter(Boolean).join(", ");
    return parts ? `Daily Scrawl · ${parts}` : "Daily Scrawl";
  }
  const hasWinners = (w) => Boolean(w && ((w.daily && w.daily.length) || (w.free && w.free.length)));
  function yesterdayHeadline(w) {
    if (!hasWinners(w)) return "";
    const all = [...(w.daily || []), ...(w.free || [])];
    return all.some((c) => c.mine) ? "🏆 Your drawing won yesterday!" : "Yesterday's winners";
  }

  const pure = { GROUPS, TOP, rank, myStanding, standingText, groupOf, topOf, winnerCaption, hasWinners, yesterdayHeadline };
  if (typeof module !== "undefined" && module.exports) { module.exports = pure; return; }

  /* ---------- The page ---------- */
  const LOCK_WHY = "Post your own Daily Scrawl drawing to unlock everyone else's, here and on Public drawings.";
  function el(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  const votesText = (v) => `👍 ${v.up} · 👎 ${v.down}`;

  function entry(it, big) {
    const li = el("li", ["lb-entry", big ? "lb-podium-entry" : "", it.mine ? "mine" : ""].filter(Boolean).join(" "));
    const place = el("span", "lb-place", `#${it.place}`);
    place.setAttribute("aria-label", `Place ${it.place}`);
    const img = el("img");
    img.src = it.imageUrl;
    img.alt = it.mine ? `Your drawing, place ${it.place}` : `Drawing in place ${it.place}`;
    img.loading = "lazy";
    const info = el("span", "lb-info");
    info.append(el("span", "lb-votes", votesText(it.votes)));
    if (it.mine) info.append(el("span", "lb-yours", "Yours"));
    li.append(place, img, info);
    return li;
  }

  function section(group, items, { locked }) {
    const sec = el("section", "lb-group");
    sec.setAttribute("aria-labelledby", `lb-${group.id}`);
    const h = el("h2", "", group.label);
    h.id = `lb-${group.id}`;
    sec.append(h);
    if (locked) {
      sec.classList.add("locked");
      sec.append(el("p", "lb-note", `🔒 ${LOCK_WHY}`));
      return sec;
    }
    const inGroup = items.filter((it) => groupOf(it.mode) === group);
    const ranked = rank(inGroup);
    const standing = standingText(myStanding(inGroup, ranked));
    if (standing) sec.append(el("p", "lb-standing", standing));
    if (!ranked.length) {
      sec.append(el("p", "lb-note", inGroup.length ? "No thumbs up yet today. Vote on Public drawings to start the leaderboard." : "Nobody has posted one today yet."));
      return sec;
    }
    const top = topOf(ranked);
    const podium = el("ol", "lb-podium");
    podium.append(...top.slice(0, 3).map((it) => entry(it, true)));
    sec.append(podium);
    if (top.length > 3) {
      const rest = el("ol", "lb-list");
      rest.start = 4;
      rest.append(...top.slice(3).map((it) => entry(it, false)));
      sec.append(rest);
    }
    return sec;
  }

  // Yesterday's winners as a section, or null when there are none. `compact` (the home screen) shows
  // one winner per list; the leaderboard shows everyone tied for first, up to three per list.
  function yesterdaySection(w, { compact = false, link = null } = {}) {
    if (!hasWinners(w)) return null;
    const sec = el("section", compact ? "yesterday compact" : "yesterday");
    sec.setAttribute("aria-labelledby", compact ? "yesterday-home-title" : "yesterday-title");
    const h = el("h2", "yesterday-title", yesterdayHeadline(w));
    h.id = compact ? "yesterday-home-title" : "yesterday-title";
    sec.append(h);
    const grid = el("ul", "yesterday-grid");
    for (const [key, label] of [["daily", "Daily Scrawl"], ["free", "Daily Free Play"]]) {
      const cards = (w[key] || []).slice(0, compact ? 1 : 3);
      for (const card of cards) {
        const li = el("li", card.mine ? "yesterday-card mine" : "yesterday-card");
        const img = el("img");
        img.src = card.imageUrl;
        img.alt = card.mine ? `Your winning ${label} drawing from yesterday` : `Yesterday's winning ${label} drawing`;
        img.loading = "lazy";
        const text = el("p", "yesterday-text");
        const caption = el("span", "yesterday-caption", winnerCaption(card));
        caption.title = winnerCaption(card);
        text.append(caption, el("span", "yesterday-votes", `👍 ${card.votes.up}${card.mine ? " · Yours" : ""}`));
        li.append(img, text);
        grid.append(li);
      }
    }
    sec.append(grid);
    if (link) {
      const a = el("a", "quiet yesterday-link", link.text);
      a.href = link.href;
      sec.append(a);
    }
    return sec;
  }

  async function show(container) {
    const header = el("header", "app-header");
    header.append(el("span", "wordmark", "Scrawdle"));
    const back = el("a", "quiet", "Back to Scrawdle");
    back.href = "../";
    header.append(back);
    const heading = el("div", "gallery-heading");
    heading.append(el("h1", "", "Today's top drawings"));
    const note = el("p", "gallery-note", "Loading…");
    note.setAttribute("role", "status");
    const body = el("div", "lb-body");
    const links = el("p", "lb-links");
    const pub = el("a", "quiet", "See all of today's drawings on Public drawings");
    pub.href = "../public-drawings/";
    links.append(pub);
    container.replaceChildren(header, heading, note, body, links);

    if (typeof root.scrawdlePublicGallery !== "function") {
      note.textContent = "The leaderboard isn't connected on this copy of the game.";
      return;
    }
    const posted = typeof root.scrawdleHasPosted === "function" && root.scrawdleHasPosted();
    let items;
    try {
      items = await root.scrawdlePublicGallery({ modes: posted ? GROUPS.flatMap((g) => g.modes) : GROUPS[1].modes });
    } catch (err) {
      note.textContent = "Couldn't load today's drawings. Reload this page to try again.";
      return;
    }
    note.textContent = "Ranked by thumbs up. It starts over at midnight.";
    body.replaceChildren(...GROUPS.map((g) => section(g, items, { locked: g.id === "daily" && !posted })));
    // Yesterday's winners go above today's lists. They can't spoil today's parts, so there's no lock.
    if (typeof root.scrawdleYesterdayWinners === "function") {
      try {
        const yesterday = yesterdaySection(await root.scrawdleYesterdayWinners());
        if (yesterday) body.prepend(yesterday);
      } catch (err) { /* no winners shown; today's lists still work */ }
    }
  }

  root.ScrawdleLeaderboard = { ...pure, show, yesterdaySection };
})(typeof window !== "undefined" ? window : globalThis);
