---
name: api-contracts
description: 'Use when adding or changing REST endpoints, JSON DTOs, query parameters, status codes, pagination, frontend API calls, or API documentation.'
---

# API Contracts

## Shared contract rules

- JSON over HTTP; Docker uses nginx at `localhost:8080`. Local Vite proxies API paths to service ports auth 8081, cases 8082, activities 8083.
- All endpoints except `POST /api/auth/login` require a bearer JWT. Roles are `AGENT` and `MANAGER`.
- Keep request/response DTOs separate from JPA entities. Use Jakarta validation for request constraints and preserve the standard error JSON fields: `timestamp`, `status`, `error`, `message`, `path`.
- Use explicit, appropriate HTTP responses: `201` for creation, `204` for deletion, `401` unauthenticated, `403` unauthorized, `404` missing case, and `409` stale case edit.

## Current domain endpoints

- Auth: `POST /api/auth/login`; `GET /api/auth/me`.
- Cases: `GET/POST /api/cases`; `GET/PUT/DELETE /api/cases/{id}`; `PATCH /api/cases/{id}/status`.
- Activities: `GET/POST /api/cases/{caseId}/activities`. Entries are append-only; status change entries are emitted by case-service best-effort.
- Case listing is zero-based pagination, optionally filtered by status/priority; size is clamped to 1..100. Edits include `version` for optimistic locking.
- Status values: `OPEN`, `IN_PROGRESS`, `PENDING_DOCUMENTS`, `APPROVED`, `REJECTED`, `CLOSED`. Priority: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. Activity types: `NOTE`, `CUSTOMER_CONTACTED`, `DOCUMENTS_REQUESTED`, `STATUS_CHANGE`, `APPROVED`, `REJECTED`.

## Changing an API

1. Update the service DTO/controller/business rule and tests.
2. Update corresponding frontend types and `frontend/src/api/*Api.ts`; update React Query hooks/UI if behavior changes.
3. Update `docs/api.md` examples, constraints, role rules, and status/error behavior; check the root README summary if relevant.
4. Verify backend with `./mvnw -B verify` in the affected service and frontend with `npm test` / `npm run build`.

There is currently no API version prefix or OpenAPI specification. Do not imply otherwise.
