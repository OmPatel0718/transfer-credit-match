# Transfer Credit Match – Frontend Architecture

## Frontend Responsibilities

The frontend team owns:

- **User interface**: All UI components, forms, and layout
- **Routing**: Client-side navigation and route definitions
- **Secure login UI**: Login and registration forms (authentication logic deferred to backend integration sprint)
- **Form presentation**: Collecting and displaying user input

The frontend does **not** (in Phase 1 / Sprint 1) couple directly to backend APIs. Backend integration is deferred to a later sprint.

## Routing Structure

- **Layout route**: Wraps all pages with `AppLayout` (Navbar, `<Outlet />`, Footer)
- **Page routes**:
  - `/` → LandingPage
  - `/login` → LoginPage
  - `/register` → RegisterPage
  - `/dashboard` → DashboardPage
  - `/match` → MatchPage
  - `/institutions` → InstitutionsPage
  - `/programs` → ProgramsPage
  - `/about` → AboutPage

## Backend Integration

**Status**: Deferred.

- No API calls in Phase 1
- TypeScript interfaces will be added when integrating with the backend
- Interfaces will represent: `Institution`, `Program`, `Course`, `KnowledgeUnit`, `User`
- Contract must be agreed with the backend team before coupling

## Folder Structure

```
frontend-react/
├── Spring 2026 Logs/        # Progress log and page mappings (pushed with repo)
├── src/
│   ├── components/
│   │   ├── layout/     # AppLayout, Navbar, Footer
│   │   └── shared/     # Reusable UI components
│   ├── pages/          # Route-level page components
│   ├── services/       # API and service layer (future)
│   ├── types/          # TypeScript interfaces (future)
│   └── ...
└── ...
```

Development docs (architecture, sprint plan, legacy mapping, team collaboration) live in **`docs-local/`** and are not pushed.
