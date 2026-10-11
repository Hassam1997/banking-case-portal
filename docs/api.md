# API Reference

All endpoints are JSON over HTTP. In Docker everything goes through nginx at `http://localhost:8080`. In development the Vite dev server (port 5173) proxies `/api` to the services, and each service can also be called directly (auth 8081, case 8082, activity 8083).

## Conventions

**Authentication.** Every endpoint except `POST /api/auth/login` requires a JWT:

```
Authorization: Bearer <accessToken>
```

Tokens are signed with HS256, last 30 minutes, and carry `sub` (username), `iss`, `iat`, `exp` and `roles` (for example `["AGENT"]`).

**Roles.**

| Role | Can do |
|---|---|
| AGENT | View, create and edit cases, add notes, set any status except APPROVED/REJECTED |
| MANAGER | Everything an agent can, plus approve/reject and delete cases |

**Error format.** Errors from the services use one shape:

```json
{
  "timestamp": "2026-10-09T10:41:48.034Z",
  "status": 400,
  "error": "Bad Request",
  "message": "title must not be blank",
  "path": "/api/cases"
}
```

**Status codes.**

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | Success, no body (delete) |
| 400 | Validation failed, malformed JSON, or invalid parameter value |
| 401 | Missing, invalid or expired token. A missing or invalid token returns an empty body with a `WWW-Authenticate` header. A failed login returns the JSON error shape. |
| 403 | Authenticated, but the role is not allowed to do this |
| 404 | Resource not found |
| 409 | Optimistic-lock conflict: the case was changed by someone else |
| 500 | Unexpected error. The message is generic and details are only logged server-side. |

**Enumerations.**

- Status: `OPEN`, `IN_PROGRESS`, `PENDING_DOCUMENTS`, `APPROVED`, `REJECTED`, `CLOSED`
- Priority: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- Activity type: `NOTE`, `CUSTOMER_CONTACTED`, `DOCUMENTS_REQUESTED`, `STATUS_CHANGE`, `APPROVED`, `REJECTED`

---

## Auth service

### POST /api/auth/login

Public. Exchanges credentials for a token.

Request:

```json
{ "username": "agent1", "password": "Passw0rd!" }
```

| Field | Rules |
|---|---|
| username | required, not blank, max 50 |
| password | required, not blank, max 100 |

Response `200`:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 1800,
  "username": "agent1",
  "role": "AGENT"
}
```

Errors: `400` for blank or malformed input, `401` with `"Invalid credentials"`. The same message and a similar response time are used for an unknown user, a wrong password and a disabled account, so usernames cannot be enumerated.

### GET /api/auth/me

Returns the owner of the token.

Response `200`:

```json
{ "username": "manager1", "roles": ["MANAGER"] }
```

---

## Case service

### GET /api/cases

Lists cases, newest first.

| Query parameter | Default | Notes |
|---|---|---|
| status | none | Optional enum filter |
| priority | none | Optional enum filter |
| page | 0 | Zero-based. Negative values become 0. |
| size | 10 | Clamped to 1..100 |

Response `200`:

```json
{
  "content": [
    {
      "id": "23aa7135-5608-43fa-8a11-be9b3d0026a6",
      "caseNumber": "CASE-2026-000001",
      "customerName": "Anna Meyer",
      "title": "Loan application",
      "description": "Needs review",
      "status": "OPEN",
      "priority": "HIGH",
      "createdBy": "agent1",
      "createdAt": "2026-10-09T10:41:48.034435Z",
      "updatedAt": "2026-10-09T10:41:48.034435Z",
      "version": 0
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1
}
```

Errors: `400` for an invalid enum value, `401`.

### GET /api/cases/{id}

Returns one case (same fields as above). Errors: `400` if the id is not a UUID, `401`, `404`.

### POST /api/cases

Roles: AGENT, MANAGER. Creates a case with status `OPEN`. The creator comes from the token, and the case number is generated from a database sequence.

Request:

```json
{
  "customerName": "Anna Meyer",
  "title": "Loan application",
  "description": "Needs review",
  "priority": "HIGH"
}
```

| Field | Rules |
|---|---|
| customerName | required, not blank, max 100 |
| title | required, not blank, max 150 |
| description | optional, max 2000 |
| priority | required, enum |

Response `201`: the created case. Errors: `400`, `401`, `403`.

### PUT /api/cases/{id}

Roles: AGENT, MANAGER. Replaces the editable fields. Status is changed through a separate endpoint.

Request:

```json
{
  "customerName": "Anna Meyer",
  "title": "Loan application (updated)",
  "description": "Needs review",
  "priority": "CRITICAL",
  "version": 0
}
```

`version` is required and must be the version the client last read. If the case has changed since, the server answers `409` and nothing is saved. On success the response contains the new version.

Errors: `400`, `401`, `403`, `404`, `409`.

### PATCH /api/cases/{id}/status

Roles: AGENT, MANAGER. Only a MANAGER may set `APPROVED` or `REJECTED`.

Request:

```json
{ "status": "IN_PROGRESS" }
```

Response `200`: the updated case. When the status really changes, case-service records a `STATUS_CHANGE` entry in activity-service using the caller's token. This call is best effort: if it fails, the status change still succeeds.

Errors: `400`, `401`, `403` (agent approving or rejecting), `404`.

### DELETE /api/cases/{id}

Role: MANAGER. Response `204`. Errors: `401`, `403`, `404`.

---

## Activity service

### GET /api/cases/{caseId}/activities

Returns all activities for a case, newest first.

Response `200`:

```json
[
  {
    "id": "44de6291-b4c7-4ece-8305-ba0d5978b9c0",
    "caseId": "df0c1d55-c1a3-4344-a607-60cc8753161f",
    "type": "STATUS_CHANGE",
    "content": "Status changed from IN_PROGRESS to APPROVED",
    "createdBy": "manager1",
    "createdAt": "2026-10-09T14:20:09.289246Z"
  }
]
```

An unknown `caseId` returns an empty list, because this service does not look cases up.

### POST /api/cases/{caseId}/activities

Roles: AGENT, MANAGER. Appends an entry. The author comes from the token. Entries cannot be edited or deleted.

Request:

```json
{ "type": "CUSTOMER_CONTACTED", "content": "Called customer, waiting for documents" }
```

| Field | Rules |
|---|---|
| type | required, enum. `APPROVED` and `REJECTED` require the MANAGER role. |
| content | required, not blank, max 2000 (whitespace is trimmed) |

Response `201`: the created activity. Errors: `400`, `401`, `403`.

---

## Health checks

Each service exposes `GET /actuator/health` (public, returns `{"status":"UP"}`). In Docker these ports are not published, so check them with `docker compose ps` or `docker compose logs`.

## Example session

```bash
TOKEN=$(curl -s -X POST localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"agent1","password":"Passw0rd!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

curl -s -X POST localhost:8080/api/cases \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"customerName":"Anna Meyer","title":"Loan application","description":"x","priority":"HIGH"}'

curl -s "localhost:8080/api/cases?status=OPEN&page=0&size=10" -H "Authorization: Bearer $TOKEN"
```

## Design notes

- Resources are nested where ownership is clear (`/cases/{id}/activities`), and status has its own sub-resource because it follows different permission rules than field edits.
- Requests and responses use DTOs, never database entities.
- Listing is paginated with a capped page size, and the response shape is our own `PageResponse`, so it does not change if the framework does.
- Optimistic locking uses a `version` field in the body, with `409` on conflict.

## Known limitations

- No API versioning (`/api/v1`) and no OpenAPI/Swagger document yet. Adding `springdoc-openapi` would generate one per service.
- Any status can be set from any other status, because there is no transition state machine.
- Activity-service does not verify that the case exists.
- The `STATUS_CHANGE` type is meant for the system, but the API does not stop a user from posting it directly.
- No rate limiting.