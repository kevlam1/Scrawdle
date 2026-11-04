/* Wires window.scrawdlePublish and window.scrawdleGallery (see the comments at the top of
 * drawing.js and gallery.js) to Supabase. Does nothing if supabase-config.js has no real
 * url/anonKey yet, so the Publish and gallery buttons stay hidden exactly as before.
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
  const PUBLISHED_KEY = "scrawdle-published"; // localStorage: { "YYYY-MM-DD|mode": true }

  function alreadyPublished(key) {
    try {
      const raw = JSON.parse(localStorage.getItem(PUBLISHED_KEY) || "{}");
      return Boolean(raw[key]);
    } catch {
      return false;
    }
  }

  function markPublished(key) {
    try {
      const raw = JSON.parse(localStorage.getItem(PUBLISHED_KEY) || "{}");
      raw[key] = true;
      localStorage.setItem(PUBLISHED_KEY, JSON.stringify(raw));
    } catch {
      // localStorage unavailable (private browsing, etc.) -- publishing still works,
      // it just won't remember across a refresh.
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

    const path = `${day}/${mode}/${crypto.randomUUID()}.png`;
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
      .insert({ day, mode, prompts, image_path: path });
    if (insertError) {
      console.error("publish.js insert error (raw):", insertError);
      const err = new Error(insertError.message || "insert failed");
      err.userMessage = "Couldn't share right now. Your drawing is still saved here, so try again.";
      throw err;
    }

    markPublished(key);
  };

  root.scrawdleGallery = async function ({ day, mode }) {
    const { data, error } = await client
      .from("drawings")
      .select("image_path")
      .eq("day", day)
      .eq("mode", mode)
      .order("created_at", { ascending: false })
      .limit(24);
    if (error) {
      console.error("publish.js gallery error (raw):", error);
      return [];
    }
    return data.map((row) => {
      const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(row.image_path);
      if (!urlData || !urlData.publicUrl) {
        console.warn("publish.js: getPublicUrl returned an unexpected shape (raw):", urlData);
      }
      return { imageUrl: urlData && urlData.publicUrl, caption: "" };
    }).filter((card) => card.imageUrl);
  };
})(typeof window !== "undefined" ? window : globalThis);
