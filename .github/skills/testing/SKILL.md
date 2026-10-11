---
name: testing
description: 'Use when adding or updating tests, choosing validation commands, or changing CI checks for the banking case portal.'
---

# Testing and CI

## Existing test approach

- Backend tests are per-service JUnit 5 tests under `services/<service>/src/test/java/`. Existing coverage includes Mockito service tests and Spring controller/security tests; follow nearby tests and verify both behavior and HTTP contract where relevant.
- Frontend uses Vitest, jsdom, and Testing Library. Tests live next to source (for example `*.test.tsx`) or under `frontend/src/`; test user-visible behavior and shared API/session behavior.
- GitHub Actions runs `./mvnw -B verify` for each backend service, `npm ci`, `npm run lint --if-present`, `npm test`, and `npm run build` for the frontend. Docker build and login smoke test run after these jobs.

## Targeted commands

- Backend: `cd services/<service> && ./mvnw -B verify`
- Frontend tests: `cd frontend && npm test`
- Frontend lint/build: `cd frontend && npm run lint && npm run build`
- Full local equivalent: verify all three Maven projects, frontend lint/test/build, and optionally Compose build/smoke test when deployment behavior changes.

## Test design

- Cover validation, authorization by role, authenticated identity source, API status/error shape, optimistic-lock conflict, and cross-service failure behavior when touched.
- For frontend changes, include loading/error/empty states and relevant interactions; verify optimistic updates restore prior data on failure.
- Keep unit tests isolated with existing Mockito/testing tools. Add broader integration infrastructure only if required by the behavior; Testcontainers and end-to-end browser tests are documented future improvements, not current defaults.
- Avoid tests coupled to incidental implementation details when observable contract behavior is available.
