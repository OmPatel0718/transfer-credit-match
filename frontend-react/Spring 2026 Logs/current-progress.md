# Current Progress – Transfer Credit Match React Frontend

Log of changes and progress for teammates. Intended to be committed and pushed with the repo as development continues.

**Location:** This log lives under `frontend-react/Spring 2026 Logs/` so all frontend deliverables (code + docs) are in one place when pushing to origin.

---
## 2026-05-07

### Mobile-friendly viewport wrapper, deployment fix, and Dashboard merge

**Vercel preview build fix**
- Fixed a TypeScript compile error (`TS2552: Cannot find name 'currentProgramLabel'`) that was breaking the preview deployment on Vercel.
- The preview repo (`lucamacie9/ru-transfer-site-preview-2026`) was on a divergent commit from `origin/dev`; resynced its `main` branch to the working frontend so the live preview rebuilds cleanly.

**Mobile / viewport infrastructure**
- New `useMediaQuery` hook (`src/hooks/useMediaQuery.ts`) wrapping `matchMedia` — fires only when a breakpoint flips rather than on every resize event, with a Safari-pre-14 listener fallback.
- New `ViewportProvider` + `useViewport()` (`src/context/ViewportContext.tsx`) exposing `{ breakpoint, isMobile, isTablet, isDesktop, isTabletOrSmaller, isTabletOrLarger }`. Single source of truth for mobile/tablet/desktop cutoffs (default mobile < 768, desktop ≥ 1024); breakpoints can be overridden via provider props.
- New declarative wrappers (`src/components/responsive/Responsive.tsx`): `<Mobile>`, `<Tablet>`, `<Desktop>`, `<TabletOrSmaller>`, `<TabletOrLarger>`, and `<ResponsiveSwitch mobile={...} tablet={...} desktop={...} />`.
- `main.tsx` wraps the app in `<ViewportProvider>` so any component can deliver mobile-specific UI without each one attaching its own resize listener.

**Mobile navigation**
- Existing nav extracted into `DesktopNav.tsx` (byte-identical for desktop users — no visual change at ≥1024px).
- New `MobileNav.tsx`: sticky top bar with brand, theme toggle, and a hamburger that opens a slide-in drawer (≤320px wide) listing every route, the logged-in identity, and Login/Register or Logout.
  - Body-scroll lock while the drawer is open.
  - Closes on Esc, on backdrop tap, on route change, and on the explicit ×.
  - 44px touch targets and 16px form font sizes to satisfy iOS Safari (no auto-zoom on input focus).
- `AppLayout.tsx` collapsed to just a `<ResponsiveSwitch>` between the two navs plus the existing `<Outlet />` and footer.

**Page-level mobile tunes**
- `LandingPage`: hero padding, banner height, and title size shrink on mobile via `useViewport` (3rem → 1.5rem padding; 180px → 120px banner; 2rem → 1.5rem title).
- `InstitutionsPage`: existing `@media (max-width: 991.98px)` block extended with a new `@media (max-width: 600px)` rule — smaller title (44 → 36px), shorter hero (210 → 160px), centered hero text, full-width CTA, 16px form font.
- `ProgramsPage`: hero padding cut on mobile (`70px 20px 45px` → `32px 16px 24px`); search input and select drop their `minWidth` on mobile so they fit a 360px viewport instead of overflowing.
- `MatchPage`, `AboutPage`, `LoginPage`, `RegisterPage`, `DashboardPage` already used responsive primitives (`auto-fit minmax(...)`, `clamp()`, `flex-wrap`) and only needed the global defenses below.

**Defensive global CSS (`index.css`)**
- `overflow-x: hidden` on `html`/`body` to kill rogue horizontal scroll.
- `max-width: 100%` on `img/video/canvas/svg` so media can't blow out the layout.
- `word-break` and `overflow-wrap` on mobile to break long unbreakable strings such as URLs and course IDs.
- 16px minimum font on `input`/`select`/`textarea` below 768px to prevent iOS Safari from auto-zooming when an input gains focus.
- `-webkit-text-size-adjust: 100%` on `body`.

**Backend / config posture this round**
- No new Java/Spring code was needed for any of the above — the wrapper is a pure frontend addition and the existing `SecurityConfig`/CORS/JDBC auth from the 2026-04-15 work continues to back it.
- Pulled `origin/dev` (Matthew Gebara's `d2718c6 "Dashboard"`) into the local branch. That commit also added a backend bootstrap class (`backend/src/main/java/com/transfercreditmatch/bootstrap/DemoDataLoader.java`) and edits to `database/setup_database.sql`, both of which now ride along on `dev`.

**Dashboard merge (hybrid)**
- `DashboardPage.tsx` had a real conflict: Matthew's tweaks were against the older stat-cards UI, while `b65a0c7` had already replaced that page with a full CRUD dashboard for the live preview. Resolved as a hybrid so neither contributor's work is lost:
  - Base: the CRUD dashboard (Institutions / Programs / Courses / KUs / Course-KU mappings) backed by the live REST API.
  - Layered on top: Matthew's role/stat header — dynamic `{roleLabel}` (no longer hardcoded "Director"), `View-as-Admin` / `View-as-Director` / `View-as-Student` switch with `flex-wrap: wrap`, and the four stat cards. Stat counts are now driven by the CRUD page's already-loaded `institutions` / `programs` / `courses` / `knowledgeUnits` arrays, so they're always live, and the Courses card shows `0` instead of `"Login as admin/director"` when unauthenticated.

**Repo / delivery**
- Mobile + Vercel-fix work pushed to `preview/main` (`lucamacie9/ru-transfer-site-preview-2026`) so the live preview rebuilds with mobile nav.
- This commit pushes the same work plus the merged Dashboard hybrid back to `origin/dev` (`dr-celkin/transfercreditmatch`). Only `frontend-react/` (and the merge-pulled backend bootstrap from Matthew) is in scope for this push; no `docs-local/` or `target/` build artifacts.

*— Luca M, May 7, 2026*

---
## 2026-04-27

### Transcript Upload 

- **Transcript upload functionality** - Giselle Rodriguez
- Created new "Upload Transcript" section styled consistently with other cards
- File input field supports .pdf, .doc, .docx, .txt
- Confirmation message and file name displays after upload 

---
## 2026-04-26

### Autocomplete Search

- **AutoComplete Search implementation** - Yinka Yussuf, Darius Gillard
- Replaced Basic dropdown course selection with dynamic autocomplete search inputs
- Integrated reusable Autocomplete component for course search
- Mapped API course data into searchable options
- Implemented debounced search input
- Added filtering logic to return matching results based on user input

---
## 2026-04-15

### Full-stack auth and API wiring (session)

**Frontend**
- Shared API helpers in `src/lib/api.ts`: `apiUrl` (relative `/api` in dev vs optional `VITE_API_BASE` in production), Basic auth header builder, `getJson` / `postJson` / `postJsonText`, `ApiError`, and `parseRoleFromLoginMessage` for Spring plain-text login success messages.
- Vite dev proxy: `/api` → `http://localhost:8080` (`vite.config.ts`).
- `LoginPage` posts to `/api/auth/login`, derives role from the response, updates `RoleViewContext` (login state and credentials for secured calls), routes directors/admins to `/dashboard` and students to `/`.

**Backend (Spring)**
- Security and CORS configuration aligned with the SPA: public `/api/auth/**`, role-based access on other `/api/**` routes, JDBC authentication against the `users` table.

**Repo / delivery**
- Changes prepared to push to `origin` and the class preview repository (`ru-transfer-site-preview-2026`).

*— Luca M, April 15, 2026*

---
## 2026-04-14

### Light and Dark Mode

- **Light and Dak Mode implementation** - Sabrina Aldakka
- Added theme context - light/dark
- Added toggle button in navigation
  - switches between light and dark mode
  - updates automatically on toggle 
- Includes icon change - sun/moon
- Updated light/dark mode to different shades of green

---
## 2026-04-13

### Role Based Access Update

- **Role Based Access Routing** - Matthew Gebara
- Only Admins can access director view dashboard, hides access from students
- Redirects
  - not logged in - login page
  - not admin - home page
- Added role switch feature
  - can toggle between student and admin
  - used for testing different views
- Updated Dashboard
  - shows current role
  - buttons to switch role 

---
## 2026-04-06

### Dashboard Page Update 

- **Dashboard Page implementation** - Matthew Gebara
- Added metric cards displaying totals for each section
- Structured sections using card based layout for consistency 
- Added input fields with add functionality for creating new entries
- Displayed placeholder data for testing 

---
## 2026-04-01

### Programs and Match Page Update 

**Match Page**
- Match Page implementation - Giselle Rodriguez 
- Updated the `/match` page layout to match Programs page styling 
- Search and dropdown selection for both **From Course** and **To Course** fields
- Placeholder course options (Course 1-6) for demo/testing purposes
- Mock matching behavior to display **Full Match**, **Partial Match**, or **No Match** results
- **Save Transfer Plan** functionality
- **Saved Transfer Plans** section so users can view saved selections after saving

**Programs Page**
- Programs page implementation - Giselle Rodriguez
- Placeholder Roosevelt program cards (Program 1, Program 2, Program 3) for demo and layout purposes
- Search functionality for filtering visible programs
- Location filter options (All, Chicago, Schaumburg, Online)
- Expandable **View Course Details** behavior for each program card to display placeholder course descriptions
-  **Start Matching** button on each card to route users to the `/match` page

---
## 2026-03-31

### Landing and About Page Update

**Landing Page**
- Landing Page implementation - Sabrina Aldakka 
- Added introductory section and primary action cards 
- Updated layout and design to match the other pages
- Styled cards with consistent layout 
- **Learn More** button routes users to the `/about` page
- **Start Matching** button routes users to the `/match` page
- **View Programs** button routes users to the `/programs` page 

**About Page**
- About Page implementation - Natalia Smiech
- Structured page with card based layout 
- Updated layout and design to match existing pages 
- Added step by step explanation of how the system processes transfer credits 
- **Try the match tool** button routes users to the `/match` page
- **Start matching your credits** button routes users to the `/match` page 

---
## 2026-03-26

### Institutions Page Update (Contributor Note)
- **Institutions page implementation credited to team member Yinka Yussuf.**
- Added the institution/program selector experience on `/institutions`, including:
  - Current institution selection
  - Target institution selection
  - Target program filtering based on selected target institution
  - Confirm action and summary display
- Integration behavior uses backend endpoints for institutions and programs.

---
## 2026-03-18

### Login & Registration Pages Update + Validation

**Login Page**
- Login Page implementation - Darius Gillard
- Implemented login form with email and password inputs
- Validation to show generic error messaging ("Invalid email or password")

**Registration Page** 
- Registration Page implementation - Giselle Rodriguez 
- Implemented create account form with required input field
- Password requirement messaging (minimum length)

**Validation**
- Required fields
- Email format
- Paswword requirements (minimum length - 6)
- Passwords must match 

  
## 2026-03-09

### Site skeleton

- **Layout:** Single layout route with `AppLayout` wrapping all pages (placeholder `<nav>`, `<Outlet />`, `<footer>`). No real Navbar or Footer components yet.
- **Routes:** All page routes in place: `/` (Landing), `/login`, `/register`, `/dashboard`, `/match`, `/institutions`, `/programs`, `/about`. Each route renders a placeholder page component (e.g. `<h1>LandingPage</h1>`).
- **Stack:** Vite, React 18, TypeScript, React Router 7. Entry in `main.tsx` with `BrowserRouter`; route definitions in `App.tsx`.
- **Folders:** `src/pages/`, `src/components/layout/`, `src/components/shared/` (and placeholders for `services/`, `types/`). Skeleton is the base for Sprint 2 (real Navbar/Footer) and later sprints.

---
## 2026-02-24

### Global Navigation, Loading indicators and API error handling

**Loading indicators**
- Loading indicators - Matthew Gebara
- Implemented loading states across multiple pages
  - Dashboard
  - Institutions
  - Programs
  - Match
- Displayed Loading messages while data is being fetched

**API error handling**
- API error handling implementation - Matthew Gebara
- Added error handling for all failed API requests
- Displayed user-friendly error messages when requests fail
- Implemented retry button to allow users to reload data 

**Global Navigation**
- Global Navigation Implementation - Abaad Zaheer
- Implemented global layout structure with navigation bar/ main content areas 
- Added navigation links for
  - Home
  - Dashboard
  - Institutions
  - Programs
  - Match
  - About
- Added authentication links (Login, Register) aligned seperately 

---
## 2026-02-15

### About page and Spring 2026 Logs

- **About page added.** `about.html` now has a React counterpart: `AboutPage` at route `/about`. Placeholder content only (Sprint 2 scope).
- **Spring 2026 Logs directory created.** Holds documentation for the frontend rewrite:
  - **page-mappings.md** – Legacy HTML → React page/route mapping (one-to-one for all legacy pages).
  - **current-progress.md** – This file; dated changelog for frontend progress.
- **No push.** Changes are local only; ready for commit when the team is ready.

### Current sprint position

- **Sprint 1:** ✅ Complete (project setup, routing).
- **Sprint 2:** In progress (global layout + navigation; Navbar/Footer not yet implemented).
- **Sprint 3–7:** Not started.

---

### Scope and push strategy (same day)

- **Spring 2026 Logs** and all frontend docs moved inside `frontend-react/`. Only `frontend-react/` (including its docs and logs) is committed and pushed; nothing outside that folder is in scope for the frontend team.
- **docs-local/** at repo root is for personal notes and Cursor agent use only; it is not pushed.

### First push to origin

- **frontend-react pushed to `dev`.** Initial commit (`frontend: add React app with routing and Spring 2026 Logs`) added the full React app: Vite + React 18 + TypeScript, React Router with all page routes (Landing, Login, Register, Dashboard, Match, Institutions, Programs, About), AppLayout placeholder, and Spring 2026 Logs (page-mappings.md, current-progress.md).
- **Push scope confirmed.** Only `frontend-react/` is committed and pushed. Architecture, sprint plan, legacy mapping, and team-collaboration docs live in `docs-local/` (not pushed); only Spring 2026 Logs are pushed with the app.

*— Frontend lead (lucamacie9), 2026-02-15*

---

*Add new entries above this line with the format: `## YYYY-MM-DD` then `### Brief title` and bullet points.*
