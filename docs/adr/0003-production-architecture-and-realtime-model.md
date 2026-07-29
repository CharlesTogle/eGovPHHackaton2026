# Production architecture and realtime model

Status: accepted

HANDA production will use a tiered architecture aligned with eGovPH integration: eGovPH owns citizen identity and notifications, HANDA owns the disaster assessment backend, AWS ALB fronts a Go API, and RDS PostgreSQL stores tenant-scoped relational data. The barangay dashboard receives live count updates over SSE, not websocket, because dashboard counts are server-to-client updates and do not need bidirectional socket complexity.

Production request flow:

1. Citizen opens the HANDA surface inside eGovPH.
2. eGovPH SSO resolves the citizen identity and profile.
3. HANDA caches the citizen profile needed for the assessment flow.
4. Citizen submits one answer per active assessment through HANDA `/v1` REST APIs.
5. Backend validates tenant scope by `barangay_code`, applies idempotency, encrypts PII fields, writes the check-in, and appends audit events in the same transaction where required.
6. Barangay dashboard connects to `/v1/assessments/:id/events` for SSE count updates.
7. If SSE disconnects, the client retries with backoff. No polling fallback is required for the first production architecture.

Multi-tenancy is enforced by `barangay_code`. One barangay must never read another barangay's data. City, province, and national rollup dashboards are future ADRs, not part of this first production architecture.

Assessment model:

- Multiple active incidents per barangay are supported.
- One citizen may submit one answer per assessment.
- Dedupe key is `(assessment_id, citizen_uniqid)`.
- The older household-matching model is superseded for production.

Admin model:

- Barangay staff use HANDA-managed staff accounts, not personal citizen eGovPH records.
- Semantic emails are acceptable, for example `captain.<barangay_code>@egov.ph`.
- MFA is required for admin access.
- Audit actor data includes barangay code, staff account, session ID, IP address, user agent, timestamp, and action details.
- All admin mutations that change assessments, statuses, staff access, or sensitive data must write append-only audit events in the same transaction.

PII and encryption model:

- Production stores full PII in relational `citizens` records because HANDA needs a queryable operating database, not just a transient integration cache.
- All sensitive PII columns are encrypted at the application layer using AWS KMS-managed keys.
- RDS encryption at rest and TLS in transit are mandatory but not sufficient by themselves.
- Search/index fields such as `barangay_code`, `assessment_id`, and operational status remain plaintext.
- `citizen_uniqid` is stored in a form that supports dedupe: hashed for lookup and encrypted where the original value must be recoverable.

Considered options:

- Websocket dashboard: rejected for now because counts are one-way server updates. SSE is simpler to operate through ALB/Cloudflare and easier to retry with backoff.
- Direct database-connected dashboard: rejected because production must protect tenant isolation, auditability, encryption, and idempotency behind the backend.
- One shared barangay account: rejected because audit logs need actor accountability. Semantic role accounts reduce churn when officials change without adding role columns to all 32M citizen records.
- Add citizen role columns to all eGovPH users: rejected because HANDA should not mutate the eGovPH citizen population for barangay staff turnover.

Consequences:

- The backend must own authorization and tenant scoping; frontend checks are convenience only.
- SSE fanout can start in-process. Redis can be added later only if multiple app instances need coordinated event fanout beyond what database notifications or lightweight in-process streams can support.
- Documentation and code referring to single-barangay Supabase MVP behavior are historical and must not be treated as production architecture.
