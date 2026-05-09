# Team Collaboration Rules

## Backend Coupling

- No direct backend coupling without contract agreement
- API contracts (request/response shapes) must be agreed before integration

## Forms

- Use controlled components for forms
- Form state managed via React state (no premature global state)

## Component Organization

- **Shared components** → `components/shared/`
- **Layout components** → `components/layout/`

## State Management

- No premature global state (Redux, Zustand, etc.)
- Add only when needed and agreed by the team

## Code Review

- All PRs require review before merge

## Running the Project

- **React dev server**: `cd frontend-react && npm run dev` (e.g. http://localhost:5173)
- **Legacy HTML**: (owned by other team; reference only) `frontend/` at repo root
