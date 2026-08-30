'use strict';
// Validation for .claude-plugin/marketplace.json
//
// This repo is a manifest, not an application — but a malformed or
// mis-referenced manifest breaks `claude plugin install` for every user with
// no error anyone here would see. These checks are the only feedback loop.
//
// Run: npm test        (offline: structure only)
//      npm run test:remote   (also verifies each plugin repo exists and is public)

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const MANIFEST = path.join(__dirname, '..', '.claude-plugin', 'marketplace.json');

function load() {
  return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
}

test('manifest is parseable JSON', () => {
  // A trailing comma here is invisible locally and fatal at install time.
  assert.doesNotThrow(load, 'marketplace.json must parse');
});

test('required top-level fields are present', () => {
  const m = load();
  for (const key of ['name', 'owner', 'metadata', 'plugins']) {
    assert.ok(m[key], `missing "${key}"`);
  }
  assert.ok(Array.isArray(m.plugins), 'plugins must be an array');
  assert.ok(m.plugins.length > 0, 'an empty marketplace serves no one');
});

test('owner has a contact address', () => {
  // Users hitting a broken plugin need somewhere to go.
  const { owner } = load();
  assert.ok(owner.name, 'owner.name missing');
  assert.ok(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(owner.email || ''),
    `owner.email is not a valid address: ${owner.email}`);
});

test('every plugin has name, description and source', () => {
  for (const p of load().plugins) {
    assert.ok(p.name, 'a plugin is missing "name"');
    assert.ok(p.description, `${p.name}: missing "description"`);
    assert.ok(p.source, `${p.name}: missing "source"`);
  }
});

test('plugin names are unique', () => {
  // A duplicate name silently shadows one entry.
  const names = load().plugins.map((p) => p.name);
  assert.strictEqual(new Set(names).size, names.length, `duplicate plugin name in ${names}`);
});

test('every github source names a real owner/repo pair', () => {
  for (const p of load().plugins) {
    if (p.source.source !== 'github') continue;
    assert.match(p.source.repo, /^[\w.-]+\/[\w.-]+$/,
      `${p.name}: repo must be "owner/name", got "${p.source.repo}"`);
  }
});

test('version is semver-shaped', () => {
  const v = load().metadata.version;
  assert.match(v, /^\d+\.\d+\.\d+/, `metadata.version "${v}" is not semver`);
});
