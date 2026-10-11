---
name: backend-services
description: 'Use when implementing or changing Java/Spring Boot APIs, business logic, authentication, case workflows, or activity history in services/.'
---

# Backend Services

## Conventions

- Java 21 is the project runtime in Docker and CI. Services are independent Maven projects under `services/<service>/`; use their checked-in `./mvnw`.
- Follow the existing package-by-feature layout: feature classes such as controllers, services, entities, repositories, and DTOs live together under the service package; shared error/config code lives in `common/` and `config/`.
- Keep controllers thin. Validate request DTOs with Jakarta Bean Validation, derive user identity from Spring `Authentication`, and put business rules and transactional work in a `@Service`.
- Use response/request DTOs; never expose JPA entities. Map entities to response records with the existing `from` pattern.
- Use constructor injection, explicit `@Transactional` boundaries, and read-only transactions for reads. Reuse existing exception types and `GlobalExceptionHandler` error responses.
- Follow existing Java formatting and naming; avoid introducing a new framework or abstraction for a single endpoint.

## Service ownership

- `auth-service`: login, BCrypt password checking, JWT issuance, seeded demo users.
- `case-service`: CRUD, query filters, pagination, optimistic locking, status authorization, and the activity-service HTTP client.
- `activity-service`: append-only activity listing and creation, including manager-only approval/rejection entries.

Maintain existing API behavior unless the task explicitly changes it: page is zero-based; size is clamped to 1..100; case update requires the current version; creator/author identity comes from the token. Only managers may set `APPROVED`/`REJECTED` or delete cases.

## Changing an endpoint

1. Inspect the relevant controller, service, DTO, repository/entity, exception handler, security config, and tests.
2. Update validation and business rules at the appropriate layer. Do not rely on frontend checks for authorization or data integrity.
3. Keep JSON API errors consistent (`timestamp`, `status`, `error`, `message`, `path`) and use appropriate status codes.
4. Update API reference and frontend types/client/hooks if the contract changes.
5. Add or adjust unit/controller tests for success and relevant invalid, forbidden, not-found, or conflict cases.
6. Run `cd services/<service> && ./mvnw -B verify`.

## Related references

`docs/architecture.md`, `docs/api.md`, `docs/security.md`, `services/*/src/main/java/`, and `services/*/src/test/java/`.
