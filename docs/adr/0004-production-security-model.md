# Production security model

Status: accepted

HANDA production will use backend-owned security boundaries: eGovPH owns citizen identity and notifications, HANDA owns admin access, tenant authorization, PII protection, idempotent writes, audit logging, and secret handling. The browser must never hold eGovPH partner secrets, database credentials, encryption keys, or direct production database write access.

Authentication and authorization:

- Citizens authenticate through eGovPH SSO.
- HANDA caches only the citizen profile fields needed for assessment operation.
- Barangay staff use HANDA-managed staff accounts with semantic emails such as `captain.<barangay_code>@egov.ph`.
- Staff accounts require MFA.
- Staff accounts are separate from personal citizen eGovPH identities to avoid mutating 32M citizen records when barangay officials change.
- Backend authorization is mandatory; frontend role checks are only UI convenience.
- Tenant isolation is enforced by `barangay_code`, and one barangay must never read or mutate another barangay's data.

PII and encryption:

- Production stores full PII in relational `citizens` records because HANDA needs an operational database for assessment flows.
- TLS in transit and RDS encryption at rest are mandatory but not sufficient.
- Sensitive PII columns are encrypted at the application layer with AWS KMS-managed keys.
- Search and routing fields such as `barangay_code`, `assessment_id`, and operational status remain plaintext for indexes and filtering.
- `citizen_uniqid` is stored hashed for lookup/dedupe and encrypted where the original value must be recoverable.

Writes, idempotency, and audit:

- Citizen check-ins require an idempotency key.
- Check-ins are deduped by `(assessment_id, citizen_uniqid_hash)` because production uses one citizen answer per assessment.
- Admin mutations that change assessments, statuses, staff access, or sensitive data must append immutable audit events in the same database transaction.
- Audit events include barangay code, staff account, session ID, IP address, user agent, timestamp, action name, target record, and correlation/request ID.
- Audit logs are append-only in PostgreSQL first; OpenSearch is optional later for search/analytics if DICT or volume requires it.

Secrets and network boundaries:

- eGovPH partner secrets, database credentials, and encryption material live only in AWS Secrets Manager/SSM/KMS-backed server-side configuration.
- Frontend env vars may contain public config only.
- Production database is private and not reachable from the public internet.
- Cloudflare provides edge protection, AWS ALB is the app gateway, and backend instances accept traffic only from the ALB.
- mTLS or IP allowlisting between eGovPH and HANDA should be used when eGovPH supports or requires it.

Considered options:

- Direct Supabase/browser database access: rejected for production because it weakens backend-owned authorization, audit, encryption, and secret boundaries.
- Shared barangay account only: rejected because auditability needs named staff actors. Semantic role accounts still avoid adding roles to all citizen records.
- Store only eGovPH IDs and no PII: rejected because HANDA needs a relational operating database for disaster assessment workflows; PII must therefore be protected, not pretended away.
- RDS encryption only: rejected because application-level PII encryption provides a stronger boundary if database snapshots, backups, or lower-level access are exposed.

Consequences:

- Every production endpoint must be designed as an authorization boundary, not a pass-through to the database.
- Schema design must separate plaintext routing/index fields from encrypted PII fields.
- CI/CD must prevent frontend exposure of secret env vars.
- Security review must cover admin MFA, tenant isolation tests, idempotency tests, audit transaction tests, and encrypted PII storage before production launch.
