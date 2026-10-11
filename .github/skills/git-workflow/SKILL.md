---
name: git-workflow
description: 'Use when preparing, reviewing, or validating changes in this repository, including secret scanning, gitignore, and pre-commit behavior.'
---

# Git Workflow

## Repository conventions

There is no repository-documented branch naming, commit-message, or PR template policy; do not invent one as an existing convention. Keep changes focused and preserve unrelated work in the working tree.

- `.gitignore` excludes `.env`, build `target/`, `node_modules/`, `dist/`, IDE metadata, `.DS_Store`, and logs.
- `.pre-commit-config.yaml` runs Gitleaks (`.gitleaks.toml`) to scan for secrets. Preserve this check and do not add real credentials to source, tests, docs, or images.
- CI runs on pushes to `main` and pull requests; see `.github/workflows/ci.yml`.
- `frontend/package-lock.json` is checked in; use `npm ci`, not a loose dependency install, for reproducible validation.

## Change hygiene

1. Inspect `git status --short` before editing and again before presenting changes. Do not discard pre-existing user changes.
2. Keep changes scoped to the task; update related docs and tests alongside implementation.
3. Run the narrow relevant tests/build first; ensure secret scanning/configuration remains intact when changing security-sensitive files.
4. Never stage or expose `.env` contents. If a commit is explicitly requested, include only intended files and follow any commit instructions from the user.

Useful checks: `git diff --check`, `git status --short`, and (when installed/configured) `pre-commit run --all-files`.
