// Run with: node --test tests/syntax.test.js
// Every browser script parses: each frontend/*.js file and the inline <script> of each page. The other tests load
// only the parts they test, so a typo elsewhere (one stray apostrophe once broke gallery.js) would slip through.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const FRONTEND = path.join(__dirname, "..", "frontend");
const PAGES = ["index.html", "public-drawings/index.html", "leaderboard/index.html"];

for (const name of fs.readdirSync(FRONTEND).filter((f) => f.endsWith(".js"))) {
  test(`${name} parses`, () => {
    assert.doesNotThrow(() => new vm.Script(fs.readFileSync(path.join(FRONTEND, name), "utf8"), { filename: name }));
  });
}

for (const page of PAGES) {
  test(`the scripts inside ${page} parse`, () => {
    const html = fs.readFileSync(path.join(FRONTEND, page), "utf8");
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    for (const [i, code] of scripts.entries()) {
      assert.doesNotThrow(() => new vm.Script(code, { filename: `${page} script ${i + 1}` }));
    }
  });
}
