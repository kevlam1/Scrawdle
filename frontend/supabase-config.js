/* Supabase project config. The "anon" key below is meant to be public in browser code --
 * Supabase's own guidance is that it's safe to ship as long as Row Level Security is on
 * (see ../CLAUDE.md and ../backend/README.md). It is NOT the same as the service_role key,
 * which must never appear here or anywhere in this repo.
 *
 * Filled in with the real project. If these two values are ever emptied, publish.js no-ops and
 * the Publish button and real gallery stay hidden. */
window.SCRAWDLE_SUPABASE = {
  url: "https://dxsbcawgvjtixkrlwduj.supabase.co",
  anonKey: "sb_publishable_ssCeq3OtqHjooV5TY7mRmQ_mFHYQtre",
};
