# Legacy HTML to React Component Mapping

This document maps legacy static HTML files to future React pages and components.

## File Mapping

| Legacy File          | React Page                   | UI Sections                                                                                                                                       |
| -------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`         | LandingPage                  | Navbar, hero header "Transfer Credit", college cards (Roosevelt, Harold Washington, etc.), footer                                                 |
| `auth.html`          | LoginPage / RegisterPage     | Navbar, header banner, Login/Sign Up tabs, login form (email, password), signup form (name, email, password, role)                                |
| `match.html`         | MatchPage                    | Navbar, "Course Matching" banner, hero section, form (courseIdFrom, courseIdTo, email, password), match result area                               |
| `director_view.html` | DashboardPage                | Navbar, "Program Director View" banner, Manage Institutions (add, list), Manage Programs (add, list), Manage Courses (add, list), Add KUs section |
| `about.html`         | AboutPage                    | Navbar, "About" banner, Our Mission, Efficient Credit Transfers, Secure & Reliable, User-Friendly, Scalable sections                              |

## Component Mapping (Future)

Legacy sections that translate to React components:

- **College cards** (index.html) → `InstitutionCard` or similar in `components/shared/`
- **Login form** (auth.html) → `LoginForm` in `components/shared/` or page-specific
- **Sign Up form** (auth.html) → `RegisterForm` in `components/shared/`
- **Course match form** (match.html) → `MatchForm` component
- **Manage Institutions section** (director_view.html) → `InstitutionManager` or split into `InstitutionList` + `AddInstitutionForm`
- **Manage Programs section** → `ProgramManager`, `ProgramList`, `AddProgramForm`
- **Manage Courses section** → `CourseManager`, `CourseList`, `AddCourseForm`
- **Add KUs section** → `KnowledgeUnitForm` or similar
- **Navbar** (all pages) → `Navbar` in `components/layout/`
- **Footer** (all pages) → `Footer` in `components/layout/`
- **Header banner** (common pattern) → `PageHeader` or `HeroBanner` in `components/shared/`

## Legacy Assets

`about.html` references `assets/styles.css`, `assets/about-bg.jpg`, and `assets/script.js`. These assets are not present in the repository. Restore or recreate them for full legacy parity when needed.
