---
name: frontend
description: 'Use when changing the React, TypeScript, routing, styling, authentication UI, API clients, React Query data flow, or case board.'
---

# Frontend

## Stack and structure

The SPA uses React 19, TypeScript, Vite, React Router, TanStack React Query, Axios, and dnd-kit. Source is under `frontend/src/`:

- `api/` contains Axios setup and endpoint clients.
- `auth/` contains session storage, provider, protected routes, and login.
- `features/cases/`, `features/activities/`, and `features/dashboard/` contain feature UI and hooks.
- `components/`, `types/`, and `utils/` hold shared UI, API types, and formatting helpers.

## Patterns to preserve

- Prefer typed function components and named domain types from `src/types/`.
- Keep HTTP calls in the existing `api/*Api.ts` modules and share the configured Axios instance from `api/client.ts`; do not create feature-local fetch clients.
- Put server state and mutations in React Query hooks. Keep query keys centralized with the feature hooks, invalidate affected queries after writes, and retain rollback behavior for optimistic board status changes.
- Use `useAuth()` / `AuthProvider` for session and role-aware presentation. UI role checks are convenience only; backend authorization remains mandatory.
- `sessionStorage` currently holds the token/session. The Axios request interceptor adds the bearer token; a non-login 401 clears auth and cached user data. Preserve the login-401 exception.
- Routes are composed in `App.tsx`; protected pages render within `ProtectedRoute` and `Layout`.
- Surface API errors through the shared error-message/toast patterns; keep accessible labels and the existing UI style.

## Workflow

1. Trace feature UI -> hook -> API client -> backend endpoint and inspect related tests.
2. Keep request/response types aligned with `docs/api.md` and backend DTOs.
3. Test behavior with Vitest and Testing Library; add regression coverage for auth, API, query/cache, or interaction changes.
4. Run `cd frontend && npm test`, `npm run lint`, and `npm run build`.

The app uses `npm ci` for reproducible installs. Dev server runs on port 5173 and Vite proxies `/api` to the individual services; Docker serves the production build through nginx.
