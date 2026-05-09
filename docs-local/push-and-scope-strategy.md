# Frontend Push and Scope Strategy

**Audience:** Frontend lead + Cursor agent. This file is for local/personal use and is **not** pushed to origin.

---

## What we push

The frontend team **only** commits and pushes the **`frontend-react/`** directory (and its contents). Nothing outside that folder is in our scope to change or push.

Inside `frontend-react/` you have:

- **Source code** – `src/` (components, pages, etc.)
- **Config** – `package.json`, `vite.config.js`, `tsconfig.*`, etc.
- **Logs** – `frontend-react/Spring 2026 Logs/` (page mappings, current progress) — only these docs are pushed with the app.

When we say “commit, lint and push to origin,” we:

1. Lint inside `frontend-react/` (e.g. `npm run lint`).
2. Stage only paths under `frontend-react/` (and optionally root `.gitignore` if we own frontend-related ignores; otherwise avoid).
3. Commit with a clear message (e.g. `frontend: ...` or `fe: ...`).
4. Push to origin (e.g. `git push origin <branch>`).

We do **not** stage or push:

- `backend/`
- `database/`
- `frontend/` (legacy HTML; we don’t own it)
- **`docs-local/`** (this folder)

---

## What docs-local is for

**`docs-local/`** at the repo root is for:

- **Personal notes** for the frontend lead.
- **Cursor agent context** during development (e.g. this strategy, scratch notes, reminders).

Contents of `docs-local/` are **not** pushed. They stay local so only you and the agent use them. They include **architecture.md**, **legacy-mapping.md**, **sprint-plan.md**, and **team-collaboration.md**. The only docs pushed with the app are **`frontend-react/Spring 2026 Logs/`** (page mappings, current progress).

---

## Summary

| Location | Purpose | Pushed? |
|----------|---------|--------|
| `frontend-react/` | React app + Spring 2026 Logs only | **Yes** |
| `docs-local/` | Personal notes, strategy, architecture, sprint plan, legacy mapping, team collaboration | **No** |
| `backend/`, `database/`, `frontend/` | Other teams / out of scope | **No** (by us) |
