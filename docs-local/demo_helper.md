# Demo Helper

Step-by-step guide to run a **successful end-to-end demo** (catalog data, seeded logins, match flow). For basic startup commands, see [startup_helper.md](startup_helper.md).

## What “success” looks like

- Backend responds on `http://localhost:8080` with **Tomcat started on port(s): 8080**.
- `GET /api/institutions` returns **200** and a **non-empty** JSON array (not `[]`).
- Login with a seeded account returns **200** from `POST /api/auth/login`.
- Frontend at `http://localhost:5173` loads; Network tab shows `/api/*` calls succeeding.

## One-time: database and seed data

1. Create the database your app uses (name is in `backend/src/main/resources/application.properties`, often `transfer_credit`).
2. Load schema + seed in one shot from the repo root (adjust user, host, and DB name):

   ```powershell
   mysql -u root -p your_database_name < database/setup_database.sql
   ```

   Alternatively apply `database/01_schema.sql` then your chosen seed scripts in the order your team uses.

3. If you added columns (e.g. `courses.skill_earned`) after an old DB existed, run a one-off `ALTER TABLE` or recreate the DB from the current scripts.

## Run the stack (full demo — use MySQL default profile)

**Terminal A — backend** (from `backend/`):

```powershell
mvn spring-boot:run
```

Do **not** use `-Dspring-boot.run.profiles=demo` for the class demo: the H2 demo profile does not load your MySQL seed users and often shows empty institutions/programs.

**Terminal B — frontend** (from `frontend-react/`):

```powershell
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Seeded demo accounts (after `setup_database.sql`)

| Role    | Email                         | Password            |
|---------|-------------------------------|---------------------|
| Admin   | `eve.thompson@admin.com`      | `hashed_password_5` |
| Director| `alice.johnson@roosevelt.edu` | `hashed_password_1` |
| Student | `charlie.davis@roosevelt.edu` | `hashed_password_3` |

## Quick API checks (PowerShell)

Public reads:

```powershell
curl http://localhost:8080/api/institutions
curl http://localhost:8080/api/summary
```

Login:

```powershell
curl -Method POST http://localhost:8080/api/auth/login `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"email":"charlie.davis@roosevelt.edu","password":"hashed_password_3"}'
```

Authenticated calls use **HTTP Basic** (email + password). Example for courses (replace with real credentials):

```powershell
$cred = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("charlie.davis@roosevelt.edu:hashed_password_3"))
curl -Headers @{ Authorization = "Basic $cred" } http://localhost:8080/api/courses
```

## Suggested 5-minute demo script

1. **Landing** — confirm live counts from `/api/summary` (if non-zero).
2. **Institutions** — pick current + target institution/program; confirm navigation to Match carries real IDs.
3. **Programs** — expand a program; confirm courses load from `/api/programs/{id}/courses`.
4. **Login** as student — **Match** — select two existing courses (or known IDs); run match; confirm structured JSON response.
5. **Login** as director/admin — **Dashboard** — institutions, programs, courses, knowledge units, and course↔KU mappings.

## Troubleshooting

| Problem | What to do |
|--------|------------|
| `Communications link failure` / DB errors | Start MySQL; verify URL, user, password, and database name in `application.properties`; run `setup_database.sql`. |
| `/api/institutions` is `[]` | Seed not applied, wrong database, or backend running with **demo** profile instead of MySQL default. |
| Port 8080 in use | Stop the other process: `netstat -ano \| findstr :8080` then end the PID, or set `server.port` for one run. |
| Login 400 / user not found | Wrong profile or seed; use MySQL default + seeded users above. |
| Frontend 404 on `/api/...` | Start frontend from `frontend-react` so Vite proxy applies; backend must be on `8080`. |

## Optional: H2 demo profile (developers only)

Quick backend smoke **without** MySQL:

```powershell
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=demo"
```

Expect empty or minimal catalog and different users than the table above. Use this for “does the app start?” only, not for stakeholder demos.

## Related

- [startup_helper.md](startup_helper.md) — prerequisites, exact commands, and network debugging tips.
