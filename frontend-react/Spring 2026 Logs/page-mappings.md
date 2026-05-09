# Legacy HTML → React Page Mappings

This document maps each legacy static HTML file to its React counterpart for the Transfer Credit Match frontend rewrite.

## Route & Page Mapping

| Legacy File          | React Route | React Page     | Notes |
|----------------------|-------------|----------------|-------|
| `frontend/index.html`         | `/`         | LandingPage    | Home / landing; hero "Transfer Credit", college cards, footer |
| `frontend/auth.html`          | `/login`    | LoginPage      | Login form (email, password) |
| `frontend/auth.html`          | `/register` | RegisterPage   | Sign-up form (name, email, password, role); same legacy file had tabs |
| `frontend/match.html`         | `/match`    | MatchPage      | Course matching form and result area |
| `frontend/director_view.html` | `/dashboard`| DashboardPage  | Program director view: institutions, programs, courses, KUs |
| `frontend/about.html`         | `/about`    | AboutPage      | About: mission, features (Efficient, Secure, User-Friendly, Scalable) |

## Legacy-Only Pages

The following routes exist in React but have no single legacy file equivalent; they are logical splits or future pages:

| React Route      | React Page       | Notes |
|------------------|------------------|--------|
| `/institutions`  | InstitutionsPage | Institution selection/browse (can be linked from Dashboard or standalone) |
| `/programs`       | ProgramsPage     | Program selection/browse (can be linked from Dashboard or standalone) |

## Summary

- **Legacy pages:** 5 files → 6 React pages (auth split into Login + Register).
- **React-only routes:** `/institutions`, `/programs` (supporting flows).
- Every legacy HTML page has a corresponding React page and route.
