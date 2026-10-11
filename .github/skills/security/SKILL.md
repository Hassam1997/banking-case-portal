---
name: security
description: 'Use when changing authentication, JWTs, authorization, validation, secrets, browser session handling, CORS, nginx headers, or container exposure.'
---

# Security

## Existing controls

- Passwords are BCrypt-hashed. Login failures share a generic message; a dummy BCrypt comparison reduces user-enumeration timing differences.
- Auth issues 30-minute HS256 JWTs with issuer, subject, timestamps, and a `roles` claim. Other services validate tokens as stateless resource servers.
- Role claims map to `ROLE_*`; authorization is enforced server-side with Spring Security/method security and business checks where the rule depends on the requested status/type.
- Request DTOs use Bean Validation; case list size is capped; creator/author values come from the authenticated principal.
- Flyway owns schema creation and Hibernate uses `ddl-auto: validate`.
- CORS origins are explicit. Docker publishes nginx only; nginx sends `nosniff`, frame-deny, and referrer-policy headers. Runtime containers use non-root users.
- Secrets are configured via environment variables; `.env` is ignored by git. Never read, print, or commit secret values.

## Sensitive design limitations

- Every service has the shared HS256 secret, so any verifier can forge tokens. RS256/JWKS is a documented future improvement.
- The frontend stores access tokens in `sessionStorage`, which is readable by injected scripts.
- There is no login rate limiting/account lockout, demo setup has no TLS, and Docker fallback database credentials are development-only.
- Do not describe these controls as production-ready. Consult `docs/security.md` and the security ADR before altering the trust model.

## Security change checklist

1. Preserve backend enforcement; hiding a button or route is not authorization.
2. Keep error responses generic where details reveal credentials, account existence, secrets, or internal implementation.
3. Keep CORS allow-listed and JWT secret configuration aligned across all services; avoid wildcard origins and hard-coded real secrets.
4. Review browser storage, reverse-proxy headers/routes, exposed ports, container users, and failure behavior if those surfaces change.
5. Add tests for unauthenticated, forbidden, malformed/expired token, and role-specific cases as applicable. Update `docs/security.md` when controls or limitations change.

This skill is project context, not a substitute for a requested security review.
