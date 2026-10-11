# 4. Synchronous call for status-change history

Status: accepted for the assignment, to be replaced

## Context
When a case status changes, a history entry must appear in activity-service.

## Decision
Case-service calls activity-service over REST with the user's JWT, using short timeouts. The call is best effort and never fails the status change.

## Consequences
+ Simple, easy to demonstrate, and the entry carries the real author.
- If activity-service is down or slow, the entry is lost and nothing retries it.
- Case-service is temporarily coupled to activity-service.
Next step: the outbox pattern (write the event in the same transaction, deliver asynchronously with retries) or a message broker.