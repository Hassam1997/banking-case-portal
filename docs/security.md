# Security

| Concern | Measure |
|---|---|
| Password storage | BCrypt hashes (salted, slow by design); never plaintext |
| Authentication | JWT, HS256, 30-minute expiry, issuer and subject claims |
| User enumeration | One generic "Invalid credentials" message; a dummy hash check equalises response time for unknown users |
| Authorization | Role claim mapped to ROLE_* authorities; `@PreAuthorize` for role rules, service-level checks where the rule depends on the request (approve/reject) |
| Identity of authors | `createdBy` always comes from the token, never from the request body |
| Input validation | Bean Validation on every request DTO; page size capped at 100; enum parameters validated |
| Error handling | Consistent JSON errors; no stack traces or internals returned; unexpected errors logged server-side |
| Concurrency | Optimistic locking (`@Version`) returns 409 on lost updates |
| Secrets | From environment variables (`.env`, git-ignored); the code defaults are for local development only |
| Network exposure | In Docker only nginx is published; Postgres and the services are internal |
| Containers | Multi-stage builds, non-root runtime user |
| Browser | React escapes content (XSS); nginx adds nosniff, frame-deny and referrer headers |
| CSRF | Disabled: stateless API with a bearer header, no cookies |
| CORS | Explicit allow-list, never `*` |

## Known gaps

- Shared HS256 secret (every verifier can forge tokens). Fix: RS256 + JWKS.
- Token in `sessionStorage`. Fix: HttpOnly cookie plus refresh-token rotation.
- No rate limiting or lockout on login.
- No TLS in the demo setup; production would terminate HTTPS at the proxy.
- Default database credentials are for local use only.
- No dependency vulnerability scanning yet (add it to CI).