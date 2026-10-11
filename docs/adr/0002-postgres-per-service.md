# 2. PostgreSQL, one database per service

Status: accepted

## Context
Cases, users and history are structured, related data that needs transactions and constraints. This is banking-style data.

## Decision
PostgreSQL in a single container with three databases (authdb, casedb, activitydb). Flyway manages schemas.

## Consequences
+ ACID guarantees, constraints, sequences for case numbers, mature tooling.
+ No shared tables, so services stay decoupled.
- No foreign keys across services; consistency between them is the application's job.
- One Postgres instance is a single point of failure (production: managed, replicated database).
Alternatives considered: MongoDB (flexible but weaker constraints and transactions for this data), file storage (no concurrency safety).