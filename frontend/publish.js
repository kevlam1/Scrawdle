/* Wires window.scrawdlePublish and window.scrawdleGallery (see the comments at the top of
 * drawing.js and gallery.js) to Supabase. Does nothing if supabase-config.js has no real
 * url/anonKey yet, so the Publish and gallery buttons stay hidden exactly as before.
 *
 * Also sets window.scrawdleReport (update 003), window.scrawdleVote, and adds vote counts to the gallery's cards (update 002 in
 * backend/supabase/updates/, rules in votes.js).
 *
 * Scope: only "store today's finished drawings, show them in the gallery." Multiplayer
 * lobbies and syncing player actions (also on Kevin's list in the team's plan doc) are a
 * separate, bigger feature and are not built here. See backend/README.md.
 *
 * UNVERIFIED: the exact property name on the object returned by
 * supabase.storage.from(...).getPublicUrl(path) was not confirmed against Supabase's own
 * docs (the reference page's examples don't show it). `publicUrl` is used below because
 * it's the name shown everywhere else in Supabase's own examples, but the first real
 * publish should log the raw return value and someone should check it's actually there
 * before trusting this in front of real players. */
(function (root) {
  "use strict";

  const cfg = root.SCRAWDLE_SUPABASE || {};
  if (!cfg.url || !cfg.anonKey) return; // no project yet; leave both hooks undefined

  if (typeof root.supabase === "undefined" || typeof root.supabase.createClient !== "function") {
    console.error("publish.js: supabase-js didn't load (check the CDN <script> tag in index.html)");
    return;
  }

  const client = root.supabase.createClient(cfg.url, cfg.anonKey);
  const BUCKET = "drawings";
  // localStorage: { "YYYY-MM-DD|mode": drawing id }. Drawings published before votes existed
  // are stored as `true`, with no id, so they can't show their votes.
  const PUBLISHED_KEY = "scrawdle-published";
  const VOTER_KEY = "scrawdle-voter"; // localStorage: this browser's random voter id

  function publishedId(key) {
    try {
      const raw = JSON.parse(localStorage.getItem(PUBLISHED_KEY) || "{}");
      return raw[key] || null;
    } catch {
      return null;
    }
  }
  const alreadyPublished = (key) => Boolean(publishedId(key));

  function markPublished(key, id) {
    try {
      const raw = JSON.parse(localStorage.getItem(PUBLISHED_KEY) || "{}");
      raw[key] = id;
      localStorage.setItem(PUBLISHED_KEY, JSON.stringify(raw));
    } catch {
      // localStorage unavailable (private browsing, etc.) -- publishing still works,
      // it just won't remember across a refresh.
    }
  }

  // There are no logins, so a voter is a random id this browser keeps. Without localStorage it
  // lasts until the page closes.
  let sessionVoter = null;
  function voterId() {
    try {
      let id = localStorage.getItem(VOTER_KEY);
      if (!id) { id = crypto.randomUUID(); localStorage.setItem(VOTER_KEY, id); }
      return id;
    } catch {
      return (sessionVoter = sessionVoter || crypto.randomUUID());
    }
  }

  root.scrawdlePublish = async function ({ blob, mode, prompts, day }) {
    const key = `${day}|${mode}`;
    if (alreadyPublished(key)) {
      const err = new Error("already published");
      err.alreadyPublished = true;
      err.userMessage = "You've already published today's drawing.";
      throw err;
    }

    // The id is made here, not by the database, so the game knows which drawing is yours
    // without reading the row back. The file is named after it too.
    const id = crypto.randomUUID();
    const path = `${day}/${mode}/${id}.png`;
    const { error: uploadError } = await client.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: "image/png", upsert: false });
    if (uploadError) {
      console.error("publish.js upload error (raw):", uploadError);
      const err = new Error(uploadError.message || "upload failed");
      err.userMessage = "Couldn't share right now. Your drawing is still saved here, so try again.";
      throw err;
    }

    const { error: insertError } = await client
      .from("drawings")
      .insert({ id, day, mode, prompts, image_path: path });
    if (insertError) {
      console.error("publish.js insert error (raw):", insertError);
      const err = new Error(insertError.message || "insert failed");
      err.userMessage = "Couldn't share right now. Your drawing is still saved here, so try again.";
      throw err;
    }

    markPublished(key, id);
  };

  // Each card is { id, imageUrl, caption, mine, votes }. `votes` is { up, down, mine } (see
  // votes.js), or null if voting isn't set up on the database yet (update 002 not run), in which
  // case the gallery shows no vote buttons. Your own published drawing is always included with
  // mine: true, even when it's older than the 24 shown, so the gallery can show your result.
  root.scrawdleGallery = async function ({ day, mode }) {
    const { data, error } = await client
      .from("drawings")
      .select("id, image_path")
      .eq("day", day)
      .eq("mode", mode)
      .order("created_at", { ascending: false })
      .limit(24);
    if (error) {
      console.error("publish.js gallery error (raw):", error);
      return [];
    }
    const myId = publishedId(`${day}|${mode}`);
    const ids = data.map((row) => row.id);
    if (typeof myId === "string" && !ids.includes(myId)) ids.push(myId);

    let counts = null;
    const { data: rows, error: countError } = await client.rpc("vote_counts", { drawing_ids: ids, voter: voterId() });
    if (countError) console.error("publish.js vote_counts error (raw):", countError);
    else counts = root.ScrawdleVotes.countsById(rows, ids);

    const cards = data.map((row) => {
      const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(row.image_path);
      if (!urlData || !urlData.publicUrl) {
        console.warn("publish.js: getPublicUrl returned an unexpected shape (raw):", urlData);
      }
      return { id: row.id, imageUrl: urlData && urlData.publicUrl, caption: "", mine: row.id === myId, votes: counts && counts[row.id] };
    }).filter((card) => card.imageUrl);
    if (typeof myId === "string" && !cards.some((card) => card.mine)) {
      cards.push({ id: myId, imageUrl: null, caption: "", mine: true, votes: counts && counts[myId] });
    }
    return cards;
  };

  // value: 1 = thumbs up, -1 = thumbs down, 0 = take your vote back.
  root.scrawdleVote = async function ({ drawingId, value }) {
    const { error } = await client.rpc("cast_vote", { target_drawing: drawingId, voter: voterId(), vote: value });
    if (error) {
      console.error("publish.js cast_vote error (raw):", error);
      const err = new Error(error.message || "vote failed");
      err.userMessage = "Couldn't save your vote. Try again.";
      throw err;
    }
  };

  // Reports a drawing (update 003). Three different players' reports hide it from the gallery for
  // everyone; the database decides that, so it can't be changed from a page. Resolves to
  // { hidden: true } once the drawing is hidden.
  root.scrawdleReport = async function ({ drawingId }) {
    const { data, error } = await client.rpc("report_drawing", { target_drawing: drawingId, reporter: voterId() });
    if (error) {
      console.error("publish.js report_drawing error (raw):", error);
      const err = new Error(error.message || "report failed");
      // PGRST202 is PostgREST's "no such function": update 003 hasn't been run on this project yet.
      err.userMessage = error.code === "PGRST202" ? "Reporting isn't switched on yet." : "Couldn't send your report. Try again.";
      throw err;
    }
    return { hidden: data === true };
  };
})(typeof window !== "undefined" ? window : globalThis);
