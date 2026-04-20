# Security Specification - Portal Síntese de Imprensa

## 1. Data Invariants
- A `News` item must refer to a valid `Summary` ID.
- `Summaries` and `News` can only be created or modified by users with the `admin` role.
- Public readers can read all `Summaries` and `News` but cannot write anything.
- The user profile is immutable by the user themselves once created (roles are managed by existing admins).

## 2. The Dirty Dozen (Vulnerability Payloads)

| Attack Type | Payload Description | Expected Result |
|-------------|---------------------|-----------------|
| Identity Spoofing | authenticated reader tries to create a summary | PERMISSION_DENIED |
| Unauthenticated Write | guest tries to delete a news item | PERMISSION_DENIED |
| State Shortcutting | editor tries to set status to 'Hoje' without required fields | PERMISSION_DENIED |
| Resource Poisoning | admin tries to inject a 2MB string into `tituloCapa` | PERMISSION_DENIED |
| ID Poisoning | injecting `summaryId` with special characters | PERMISSION_DENIED |
| Role Escalation | user tries to update their own `role` to 'admin' | PERMISSION_DENIED |
| Orphaned News | creating news without identifying a summary | PERMISSION_DENIED |
| Missing Schema | creating summary with missing `paisId` | PERMISSION_DENIED |
| PII Leak | guest tries to list all emails in `/users` | PERMISSION_DENIED |
| Update Gap | updating news `titulo` but trying to remove `sinteseId` | PERMISSION_DENIED |
| Self-Assigned Role | user creating their profile and setting `role: admin` | PERMISSION_DENIED |
| Timestamp Trust | client providing a `createdAt` in the past | PERMISSION_DENIED |

## 3. Test Runner Strategy
- We will bootstrap `nosnadiaspora@gmail.com` as an admin via `exists(/databases/$(database)/documents/users/$(request.auth.uid))` where the doc has `role == 'admin'`.
- Default: Deny all.
- Explicit: Allow read for summaries/news to everyone.
- Explicit: Allow write for summaries/news to admins.
