---
name: docker-deployment
description: 'Use when changing Dockerfiles, Compose services, nginx routing, local startup, container networking, health checks, or deployment configuration.'
---

# Docker and Deployment

## Topology

`docker-compose.yml` runs PostgreSQL 16, the three Spring services, and the frontend. Only frontend/nginx publishes a host port (`8080:80`); services and PostgreSQL communicate on the Compose network. PostgreSQL initializes `authdb`, `casedb`, and `activitydb` from `infra/docker/postgres/init-db.sql`.

The frontend image builds the Vite SPA with Node 22, then serves `dist/` from nginx. Nginx proxies auth, cases, and nested case activities to their respective service names. Its Docker DNS resolver re-resolves service IPs to handle container replacement. Keep SPA fallback routing (`try_files ... /index.html`) for client routes.

Backend Dockerfiles use a Maven wrapper in a Java 21 build stage and run the packaged JAR in a non-root Java 21 JRE image. Keep images multi-stage and do not copy local build output or secrets into images.

## Configuration and operations

- Copy `.env.example` to `.env` for local use and set `JWT_SECRET`; never check `.env` in. Compose requires the secret.
- Service URLs use Compose DNS names, not `localhost`. Browser-facing requests stay same-origin via nginx. Vite dev-server proxy is configured separately in `frontend/vite.config.ts`.
- Keep service ports internal unless there is a deliberate need to expose them. Preserve DB health dependency for service startup and persistent `pgdata`.
- Start: `docker compose up --build -d`; inspect: `docker compose ps` and `docker compose logs`; stop without removing data: `docker compose down`.
- `docker compose down -v` deletes persisted DB data; do not use unless data deletion is intended.

## Validation

After deployment/config changes, validate image builds and the integrated path: `docker compose build`, then (with an appropriate local `.env`) start the stack and verify `http://localhost:8080` plus login/API routing. CI also builds images and smoke-tests demo login.

Update `docs/architecture.md` and `docs/security.md` if topology, network exposure, secret handling, headers, or runtime behavior changes.
