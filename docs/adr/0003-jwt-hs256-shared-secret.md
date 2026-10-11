# 3. JWT with HS256 and a shared secret

Status: accepted for the assignment, to be replaced

## Context
Every service must verify who the caller is without calling auth-service on each request.

## Decision
Auth-service signs HS256 JWTs; the other services verify them with the same secret from an environment variable.

## Consequences
+ Simple, fast, no key distribution infrastructure.
- Any service that can verify a token can also forge one.
- Rotating the secret requires redeploying all services.
Next step: RS256 with a JWKS endpoint (only auth-service holds the private key), plus refresh-token rotation.