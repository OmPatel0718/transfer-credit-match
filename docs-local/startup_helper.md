# Startup Helper

## Goal
Run frontend + backend locally, verify endpoints, and demo login.

## Prerequisites
- Java 17+
- Maven (or run using full path to `mvn.cmd`)
- Node.js 18+ and npm
- MySQL running locally with seeded transfer-credit data (required for demo credentials)

## Start Backend (Use Pre-Seeded Accounts)

From `backend/`:

### Required for class/demo credentials (MySQL profile)
```powershell
mvn spring-boot:run
```

If `mvn` is not recognized in terminal, run:
```powershell
& "C:\Users\user\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
```

### Not for seeded-account demos (H2 demo profile)
```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=demo"
```

Use this only for quick backend bring-up. The demo profile does not include your pre-seeded MySQL users, so login with class credentials can fail with `User not found`.

Backend base URL: `http://localhost:8080`

## Start Frontend

From `frontend-react/`:

```powershell
npm install
npm run dev
```

Frontend URL: usually `http://localhost:5173`

Notes:
- Vite proxy forwards `/api/*` to `http://localhost:8080`.
- Keep backend and frontend in separate terminals.

## Smoke Tests

### Test an open endpoint
```powershell
curl http://localhost:8080/api/institutions
```

Expected: JSON payload and HTTP 200.

### Test login endpoint
```powershell
curl -Method POST http://localhost:8080/api/auth/login `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"email":"eve.thompson@admin.com","password":"hashed_password_5"}'
```

Expected: success message containing user name and role.

## Demo Credentials

- Admin: `eve.thompson@admin.com` / `hashed_password_5`
- Director: `alice.johnson@roosevelt.edu` / `hashed_password_1`
- Student: `charlie.davis@roosevelt.edu` / `hashed_password_3`

## Recommended Demo Sequence (5 minutes)

1. Start backend with MySQL profile (`mvn spring-boot:run`).
2. Start frontend (`npm run dev`).
3. Open the app in browser.
4. Open DevTools > Network.
5. Refresh and show `/api/institutions` response + timing.
6. Log in with one of the credentials above.
7. Show `/api/auth/login` request/response.
8. Navigate to a data-backed page and show additional `/api/*` calls.

## Troubleshooting

### "Unable to connect to the remote server" on localhost:8080
- Backend is not running or failed startup.
- Confirm Spring log includes: `Tomcat started on port(s): 8080`.

### Backend fails with database connection errors
- Verify MySQL is running and `transfer_credit` schema/data are loaded.
- Confirm credentials in `backend/src/main/resources/application.properties`.
- If absolutely needed for smoke-only checks, use H2 demo profile (seeded login accounts will not be available):
```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=demo"
```

### Frontend loads but API calls fail
- Ensure backend is running on `8080`.
- Ensure frontend started from `frontend-react` with `npm run dev`.
- Confirm requests are being made to `/api/...` in browser Network tab.
