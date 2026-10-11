# AI usage

## Tools
- Claude (Anthropic), via chat, as a development assistant.

## What it was used for
- Proposing the architecture, repository layout and security approach
- Generating first drafts of boilerplate: entities, DTOs, controllers, React components, Docker files
- Generating test scaffolding
- Explaining and helping debug errors (Spring Boot 4 test imports, Flyway, CORS, nginx 502)
- Drafting documentation
- Fixed a failing test: `getIssuer()` parses the issuer as a URL, so the test reads the `iss` claim as a string.
- Removed the generated `*ApplicationTests` classes, which need a live database and fail in CI.
- Fixed the Docker 403 by adding the Docker origin to `CORS_ORIGINS`.
- Fixed nginx 502 after container recreation (resolver plus variables in `proxy_pass`).
- Fixed CI after adding per-service DB users: the docker job needed the three DB passwords and a tracked `init-db.sh`.

## How the output was reviewed and validated
- I ran every service and tested each endpoint manually with curl (status codes for success, 400, 401, 403, 404, 409).
- I ran the unit and controller tests in every service and the frontend tests.
- I checked the security configuration myself: roles, token validation, and that the author is taken from the token.
- I tested the end-to-end flow in Docker (agent creates a case, manager approves, history appears).
- I fixed problems the generated code had, for example <list real ones: the `getIssuer()` test failure, the Docker CORS origin, the nginx DNS caching>.
- I can explain each file and change it on request.