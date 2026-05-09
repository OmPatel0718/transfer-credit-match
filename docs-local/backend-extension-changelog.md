# Backend Extension Changelog

This document summarizes backend changes made to support fully data-backed frontend workflows.

## New Endpoints

- `GET /api/programs/catalog`
  - Returns program catalog rows for frontend cards/filters.
  - Includes institution name/location, inferred program type, description, and course count.
  - DTO: `ProgramCatalogDto`.

- `GET /api/match/alternatives?courseIdFrom={id}&programId={id}`
  - Returns ranked alternative target courses for a selected source course within a program.
  - DTO: `MatchResultDto[]`.

- `GET /api/match/for-program?fromCourseId={id}&programId={id}`
  - Returns ranked matches for all target courses in a program.
  - DTO: `MatchResultDto[]`.

- `GET /api/transfer-plans`
  - Returns authenticated user's persisted transfer plans.
  - DTO: `TransferPlanDto[]`.

- `POST /api/transfer-plans`
  - Persists a transfer plan for authenticated user.
  - Request DTO: `TransferPlanCreateRequest`.
  - Response DTO: `TransferPlanDto`.

- `DELETE /api/transfer-plans/{id}`
  - Deletes the authenticated user's transfer plan by request id.

- `POST /api/auth/forgot-password`
  - Placeholder reset-request endpoint used by login UX.
  - Returns confirmation text.

## Existing Endpoints Changed

- `POST /api/match`
  - Changed response type from plain text to structured JSON (`MatchResultDto`).
  - Adds status/message fields (`FULL`, `PARTIAL`, `NONE`) based on coverage threshold.

- Catalog management additions in `NavigationController`:
  - `POST /api/knowledge_units`
  - `DELETE /api/knowledge_units/{id}`
  - `POST /api/courses`
  - `DELETE /api/courses/{id}`

## Repository/Query Additions

- `ProgramRepository.findByInstitutionId(Integer institutionId)`
- `CourseRepository.findByProgramId(Integer programId)`
- `CourseRepository.findByInstitutionId(Integer institutionId)`
- `TransferRequestRepository.findByStudentIdOrderByRequestDateDesc(Integer studentId)`
- `StudentRepository.findByUserId(Integer userId)`

## Security and Auth Updates

- `SecurityConfig`:
  - Restricts `POST/PUT/DELETE` on institutions/programs/knowledge_units/courses to `ADMIN` and `DIRECTOR`.
  - Leaves read-only `GET` access open for institutions/programs/knowledge_units.
  - Keeps `match` and `transfer-plans` endpoints authenticated for `ADMIN`, `DIRECTOR`, and `STUDENT`.

- `AuthService.register(...)`:
  - Public registration now restricted to `student` role only.

## Frontend Consumers Updated

- `frontend-react/src/pages/InstitutionsPage.tsx`
  - Uses `GET /api/institutions` and `GET /api/programs/catalog`.
  - Navigates with selected transfer goal context.

- `frontend-react/src/pages/ProgramsPage.tsx`
  - Uses `GET /api/programs/catalog`.
  - Enables real filtering by location and inferred type.

- `frontend-react/src/pages/MatchPage.tsx`
  - Uses `GET /api/courses`, `POST /api/match`, `GET /api/match/alternatives`.
  - Persists plans with `POST/GET/DELETE /api/transfer-plans`.

- `frontend-react/src/pages/DashboardPage.tsx`
  - Hydrates lists from API.
  - Adds create operations via catalog write endpoints.

- `frontend-react/src/pages/LoginPage.tsx`
  - Uses `POST /api/auth/forgot-password`.

## Backward-Compatibility Notes

- **Breaking change**: `POST /api/match` now returns JSON instead of a plain text message.
- New security write restrictions may block unauthenticated/low-privilege callers that previously wrote directly to catalog endpoints.
