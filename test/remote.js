'use strict';
// Remote checks: each referenced plugin repo must EXIST and be PUBLIC.
// Separated from the offline suite because it needs network and a token —
// a network flake must not fail the everyday `npm test`.
//
// Run: npm run test:remote   (needs GITHUB_TOKEN for rate limits; works without)

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const m = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '.claude-plugin', 'marketplace.json'), 'utf8')
);

for (const p of m.plugins) {
  if (p.source.source !== 'github') continue;
  test(`${p.name}: ${p.source.repo} exists and is installable`, async () => {
    const headers = { 'User-Agent': 'marketplace-validate' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${p.source.repo}`, { headers });
    assert.strictEqual(res.status, 200, `${p.source.repo} returned HTTP ${res.status}`);
    const repo = await res.json();
    // A private repo cannot be installed by anyone but the owner — the
    // marketplace would list a plugin nobody can actually get.
    assert.strictEqual(repo.private, false, `${p.source.repo} is PRIVATE; installs will fail`);
  });
}
