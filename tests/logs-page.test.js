// Run with: node --test tests/logs-page.test.js
// The logs page (frontend/logs/index.html) is generated from log.md. If someone adds or edits a log entry and
// doesn't regenerate it, this fails with what to do. See scripts/make-logs-page.mjs.
const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

test("the logs page matches log.md and scripts/log-summaries.mjs", () => {
  const run = spawnSync(process.execPath, ["scripts/make-logs-page.mjs", "--check"], {
    cwd: path.join(__dirname, ".."),
    encoding: "utf8",
  });
  assert.equal(run.status, 0, `${run.stderr}${run.stdout}`.trim());
});
