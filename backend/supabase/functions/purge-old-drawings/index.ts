// Daily cleanup: deletes old drawings' files from the "drawings" storage bucket and their rows
// from the drawings table. Runs as a Supabase Edge Function, called once a day by pg_cron
// (see backend/supabase/schema.sql and backend/README.md).
//
// Why a function and not SQL: Supabase's docs say deleting storage objects with a SQL query
// "will result in the object being orphaned" -- the file stays and keeps using space. Files
// have to be removed through the Storage API, which needs the project's secret key. That key
// only ever lives inside Supabase's function environment, never in this repo or the browser.
//
// UNVERIFIED against a live project: the Deno.serve / npm: import style, the SUPABASE_SECRET_KEYS
// parsing, and the shape of .delete().lt().select(). The date and folder logic is unit-tested
// in tests/purge.test.js with a fake client. Use ?dryRun=1 first (see backend/README.md).
//
// Written without TypeScript-only syntax on purpose, so Node can import it for the tests.

const BUCKET = "drawings";
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const MODES = ["basic", "detailed"];
const PAGE = 1000; // Supabase's docs state remove() takes 1000 objects at a time

// Keep today and yesterday by UTC date (matches the one-day window in schema.sql's policies,
// which exists because the game's "day" is the player's local date, not UTC). Anything older goes.
export function cutoffDay(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  return d.toISOString().slice(0, 10);
}

async function listAll(bucket, path) {
  const items = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await bucket.list(path, { limit: PAGE, offset });
    if (error) throw new Error(`list "${path}": ${error.message}`);
    items.push(...data);
    if (data.length < PAGE) return items;
  }
}

export async function purge(client, { now = new Date(), dryRun = false } = {}) {
  const cutoff = cutoffDay(now);
  const bucket = client.storage.from(BUCKET);

  const oldDays = (await listAll(bucket, ""))
    .map((item) => item.name)
    .filter((name) => DAY_RE.test(name) && name < cutoff)
    .sort();

  const paths = [];
  for (const day of oldDays) {
    for (const mode of MODES) {
      for (const item of await listAll(bucket, `${day}/${mode}`)) {
        paths.push(`${day}/${mode}/${item.name}`);
      }
    }
  }

  let filesDeleted = 0;
  if (!dryRun) {
    for (let i = 0; i < paths.length; i += PAGE) {
      const chunk = paths.slice(i, i + PAGE);
      const { error } = await bucket.remove(chunk);
      if (error) throw new Error(`remove: ${error.message}`); // rows are kept so tomorrow retries
      filesDeleted += chunk.length;
    }
  }

  let rows;
  if (dryRun) {
    rows = await client.from("drawings").select("id").lt("day", cutoff);
  } else {
    rows = await client.from("drawings").delete().lt("day", cutoff).select("id");
  }
  if (rows.error) throw new Error(`drawings rows: ${rows.error.message}`);

  return {
    cutoff,
    dryRun,
    oldDays,
    filesFound: paths.length,
    filesDeleted,
    rows: rows.data.length, // deleted, or (dry run) found; a dry run caps near 1000
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function secretKey() {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    try {
      const keys = JSON.parse(raw);
      if (keys.default) return keys.default;
    } catch {
      // fall through to the legacy variable
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
}

async function handle(req) {
  // This function's own gate. It must be deployed with JWT verification OFF (cron can't send a
  // user JWT), so this shared secret is the only thing stopping anyone who finds the URL.
  const expected = Deno.env.get("CRON_SECRET");
  if (!expected || req.headers.get("x-cron-secret") !== expected) {
    return json({ error: "unauthorized" }, 401);
  }
  const url = Deno.env.get("SUPABASE_URL");
  const key = secretKey();
  if (!url || !key) return json({ error: "project settings missing in function environment" }, 500);

  const { createClient } = await import("npm:@supabase/supabase-js@2");
  const client = createClient(url, key);
  try {
    const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";
    const result = await purge(client, { dryRun });
    console.log(JSON.stringify(result));
    return json(result);
  } catch (err) {
    console.error("purge failed:", err);
    return json({ error: String(err && err.message ? err.message : err) }, 500);
  }
}

if (typeof Deno !== "undefined" && Deno.serve) Deno.serve(handle);
