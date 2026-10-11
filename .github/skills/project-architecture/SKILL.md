---
name: project-architecture
description: 'Use when understanding or changing the banking case portal architecture, service boundaries, request flows, or cross-service behavior.'
---

# Project Architecture

## System at a glance

This is an internal banking case-management portal. The browser uses a React + TypeScript SPA served by nginx. In Docker, nginx is the single published entry point (`localhost:8080`), serves the SPA, and proxies `/api` to three Spring Boot services. A single PostgreSQL container hosts three separate databases: `authdb`, `casedb`, and `activitydb`.

- `auth-service` authenticates users and issues JWTs.
- `case-service` owns case CRUD, filtering/pagination, workflow rules, and case numbers.
- `activity-service` stores append-only notes and case history.
- `frontend` provides login, dashboard, case list/detail, and drag-and-drop board.

Each service owns its database/schema. Services communicate over HTTP, not shared tables. The case service forwards the caller's JWT when asking the activity service to record a status change.

## Request flow and invariants

1. Login is posted to `/api/auth/login`; the frontend stores the returned bearer token in `sessionStorage`.
2. The Axios client attaches the token to API requests. Services validate HS256 JWTs and map the `roles` claim to `ROLE_*`.
3. The backend is authoritative for permissions. Agents can create/edit cases and add notes; only managers can approve/reject or delete cases.
4. Case edits require the client's `version`; stale updates return `409`.
5. Status changes are saved in case-service first. A changed status is recorded in activity-service best-effort; an activity-service outage does not roll back the case status.
6. Activity records are append-only. Their `case_id` is a value reference, not a cross-database foreign key.

## Change guidance

- Preserve service ownership: do not query or write another service's database directly.
- Treat endpoint payloads, error shape, permissions, case versioning, and activity history as cross-layer contracts. Coordinate changes in backend, frontend, and `docs/api.md`.
- Check `docs/adr/` before changing the microservice split, database ownership, JWT model, or synchronous HTTP communication.
- Use `docs/architecture.md` and the root `README.md` for fuller diagrams, data model, running instructions, and known limitations.
- The board/dashboard intentionally show at most the 100 newest cases. Activity persistence is currently best-effort; reliable delivery would need a deliberate design change.

## Useful locations

- `services/` — backend services
- `frontend/src/` — React application
- `infra/docker/postgres/init-db.sql` — creation of per-service databases
- `docker-compose.yml` — local multi-service deployment
- `docs/architecture.md`, `docs/adr/`, `docs/api.md`, `docs/security.md` — design references
