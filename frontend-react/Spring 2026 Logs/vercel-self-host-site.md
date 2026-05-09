# Vercel self-hosted preview site

This note describes the **second GitHub remote** and how we use it with **Vercel** so the graphic design team can review the React template on a live URL while the canonical course repo stays under the professor’s organization.

---

## Why this exists

- **Canonical repo:** [`dr-celkin/transfercreditmatch`](https://github.com/dr-celkin/transfercreditmatch) (`origin`) — official class source; the owner does not want to run Vercel or another host from that account.
- **Self-hosted mirror:** [`lucamacie9/seniorproject2026-selfhosted`](https://github.com/lucamacie9/seniorproject2026-selfhosted) — a student-controlled copy of the same codebase (or the branches we choose to push) used only for **deployment and design collaboration**.

Pushing to `selfhosted` does not replace work on `origin`. Treat `origin` as the record for class submission; treat `selfhosted` as the deployable mirror for previews.

---

## Git setup (local clone)

This workspace adds a second remote alongside `origin`:

| Remote       | URL |
|-------------|-----|
| `origin`    | `https://github.com/dr-celkin/transfercreditmatch.git` |
| `selfhosted` | `https://github.com/lucamacie9/seniorproject2026-selfhosted.git` |

If you ever need to add it on another machine:

```bash
git remote add selfhosted https://github.com/lucamacie9/seniorproject2026-selfhosted.git
```

---

## Push workflow

After committing on your usual branch (e.g. `dev`):

1. **Class / PR flow:** `git push origin dev` (or your team’s branch convention).
2. **Preview site:** push the same commits to the self-hosted repo.

For an empty GitHub repo, the first push often maps local `dev` to the remote default branch `main`:

```bash
git push -u selfhosted dev:main
```

**Tip:** If your local `dev` should keep tracking `origin/dev` (class repo), after that first push prefer updates **without** `-u`:

```bash
git push selfhosted dev:main
```

Using `-u` again can point `dev` at `selfhosted/main` instead of `origin/dev`; fix with `git branch --set-upstream-to=origin/dev dev` if needed.

If you prefer to keep a branch named `dev` on the mirror as well:

```bash
git push -u selfhosted dev
```

Use one convention consistently so Vercel’s “production branch” matches what you push.

---

## Vercel project settings

1. In [Vercel](https://vercel.com), **Import** the `lucamacie9/seniorproject2026-selfhosted` GitHub repository.
2. This monorepo keeps the app under **`frontend-react`** (Vite + React), so set:
   - **Root Directory:** `frontend-react`
   - **Framework preset:** Vite (or “Other” with the commands below)
   - **Install Command:** `npm install` (or `npm ci` if you commit `package-lock.json`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Connect the **production branch** to the branch you actually push (e.g. `main` after `dev:main`, or `dev`).

Deployments run on every push to that branch; share the Vercel URL with design so they always see the latest template.

---

## API / data on the preview

The React app’s Vite build is static on Vercel. Some pages call a **Spring Boot** API. Today, calls may still target `http://localhost:8080` in code, which **does not exist in the browser on Vercel**—so live previews are mainly useful for **layout, typography, navigation, and static UI** until the frontend uses a **deployed API base URL** (for example via `import.meta.env.VITE_API_BASE`) and the backend allows that origin (**CORS**).

Document any production API URL and env vars in the Vercel project **Settings → Environment Variables** when backend hosting is ready.

---

## Summary

| Goal | Where |
|------|--------|
| Official source / class ownership | `origin` → `dr-celkin/transfercreditmatch` |
| Design preview + Vercel | `selfhosted` → `lucamacie9/seniorproject2026-selfhosted` |
| Log you are reading | `frontend-react/Spring 2026 Logs/` |

Keep this file updated if the branch mapping, Vercel root directory, or API strategy changes.
