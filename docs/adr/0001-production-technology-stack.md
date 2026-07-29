# Production technology stack

Status: accepted

HANDA production will replace the hackathon Supabase-direct frontend with a small Go backend, PostgreSQL, and eGovPH integration boundaries. The production stack is React/PWA for the eGovPH-embedded citizen UI and barangay dashboard, Go + Gin for a single modular backend, REST `/v1` APIs, SSE for live dashboard counts, RDS PostgreSQL for relational data, AWS KMS for encryption keys, and GitHub Actions/Jenkins for CI/CD.

This supersedes the MVP stack documented elsewhere in the repo where the React client writes directly to Supabase. Supabase remains acceptable for demos only, not for production PII, auditability, tenant isolation, or eGovPH integration security.

Considered options:

- Keep Supabase in production: rejected because the current direct-client model exposes too much trust to the browser and does not give enough control over audit logging, idempotency, app-level encryption, and eGovPH backend integration.
- Split into microservices: rejected for now because HANDA is a focused integration product; one Go service with internal modules is easier to operate, explain to DICT, and scale vertically/horizontally before introducing service boundaries.
- Add Redis immediately: rejected for now because SSE dashboard counts can be served directly from the Go backend and database at the expected first production scale. Redis remains a future option for SSE fanout, session/rate-limit coordination, or queueing if metrics prove it is needed.
- Use GraphQL: rejected because eGovPH-facing integration and government technical Q&A are clearer with stable versioned REST endpoints.

Consequences:

- Backend modules should stay inside one deployable service: auth, admin accounts, assessments, check-ins, dashboard summaries, audit logs, notifications integration, and encryption.
- API contracts are versioned by path: `/v1`, `/v2`, `/v3`.
- The citizen check-in endpoint must require idempotency keys and dedupe by `(assessment_id, citizen_uniqid)` because the production model is one citizen equals one answer per assessment, not household matching.
