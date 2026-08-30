# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

Official marketplace for Claude Code plugins and extensions by HexStack.

## Repository location

- Local: `/var/minis/repos/claude-marketplace-hexstack` — **all repos live under `/var/minis/repos/`**
- Remote: `hexstack-apps/claude-marketplace-hexstack` (private)

## Conventions

- One logical change = one commit, with the measurements behind it.
- Add a `Requested: "..."` trailer citing the originating request.
- Push to the private `hexstack-apps` remote — that is the backup.
- Never `mv` a git repo inside `/var/minis` (it corrupts the object
  store on this Android FS); re-clone from GitHub instead.
- Run tests AND build before deploying; smoke-test the bundle.

## Validation

This repo is a manifest, not an application — but a malformed or
mis-referenced `marketplace.json` breaks `claude plugin install` for every
user, with no error anyone here would ever see. The tests are the only
feedback loop.

```sh
npm test           # offline: structure, uniqueness, semver, email, repo shape
npm run test:remote  # network: every plugin repo exists AND is public
```

**A private plugin repo is the failure mode that matters most** — the
marketplace would list something nobody but the owner can install, and the
manifest itself looks perfectly valid. Only the remote check catches it, which
is why it is separate: a network flake must not fail everyday `npm test`.

Verified by mutation (5/5 caught): trailing comma, duplicate plugin name,
malformed owner email, a `repo` without an `owner/name` slash, and a
non-semver version each turn the suite red.
