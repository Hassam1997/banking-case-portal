---
name: database-migrations
description: 'Use when changing PostgreSQL schemas, JPA entities, repositories, Flyway migrations, database initialization, or persistence behavior.'
---

# Database and Migrations

## Ownership and persistence

One PostgreSQL container hosts three separate databases: `authdb` belongs to auth-service, `casedb` to case-service, and `activitydb` to activity-service. Each service owns its schema and migrations; cross-service references are identifiers exchanged through HTTP, not cross-database foreign keys.

Flyway is the schema authority. Migrations are under `services/<service>/src/main/resources/db/migration/` and use names like `V1__create_cases.sql`. Hibernate is configured with `ddl-auto: validate`; do not rely on automatic schema updates.

## Safe schema-change procedure

1. Identify the owning service and inspect its entity, repository, DTOs, application config, current migrations, and tests.
2. Add a new forward-only, versioned Flyway migration; do not edit an already-applied migration. Consider existing rows, defaults, nullability, indexes, and deployment order.
3. Update the matching JPA entity and any repository/service/DTO mapping so the migrated schema and model agree.
4. Keep the other services independent; coordinate cross-service changes through API contracts, not shared tables.
5. Test the service with `cd services/<service> && ./mvnw -B verify`; check that startup validates against the migrated schema.
6. Update `docs/architecture.md` if the owned data model or persistence boundary changes.

`infra/docker/postgres/init-db.sql` creates the three databases only; service tables are created by each service's Flyway migrations. Deleting the Compose `pgdata` volume resets all local DB data.
