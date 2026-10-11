# 1. Split into auth, case and activity services

Status: accepted

## Context
The assignment asks for 2-3 Spring Boot services and suggests this split.

## Decision
Three services with separate responsibilities and databases.

## Consequences
+ Clear boundaries; each service can change and scale independently.
- For an application this small, a modular monolith would be simpler to operate. Distribution adds network calls, partial-failure handling and more deployment work.