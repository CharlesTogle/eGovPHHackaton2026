**Implementation**

HANDA is built as an integrated module inside the eGovPH Super App, not a standalone system — it authenticates users via existing eGovPH credentials, pulls citizen profile data from eGovPH, and uses eGovPH role data to identify barangay officials (FR-1). So the implementation leans on eGovPH for identity and profile, it doesn't duplicate that layer.

The system is organized into seven modules, with two called out specifically as "deep modules"  , small interfaces hiding logic that can evolve independently and are unit-tested in isolation from the UI: **HouseholdMatcher** and **DashboardAggregator**. The rest, IncidentAssessmentService, QuestionBuilder, CheckInFlow, StatusTracker, ExportService are simpler CRUD/UI-facing components. HouseholdMatcher's interface is deliberately narrow: match(residentInfo) → household | candidates[], resolving a check-in to an existing household record or returning candidates for manual selection. DashboardAggregator is pure aggregation logic — total affected households, need-type breakdown, resolved/unresolved lists, non-respondents — kept independent of how the dashboard renders it.

Data persistence is intended to be Supabase, but the non-functional requirements explicitly call for the persistence layer to be swappable between Supabase and local mock/seed data with minimal code change and  that's what makes the system demoable without a live backend.

**Scalability**

If a panelist asks about scaling, the honest original-document answer is: HANDA wasn't designed with a scaling strategy it was scoped as a single-barangay hackathon/capstone build, with the guiding principle "if the LGU or local organizations can already do it, let them." The non-functional requirements focus on testability, data portability, and access control, not on multi-tenancy or horizontal scaling. So rather than describing scalability mechanisms that aren't there, the stronger answer is naming this as a known, intentional boundary of the current version  and if pushed on "what would it take to scale it," that's a design question the original document doesn't answer, since AI-based allocation, predictive analytics, and automatic disaster detection were also explicitly excluded.

QUICK NOTES:
We built and validated the model at single-barangay scale first, because that's the fastest way to prove the core mechanism > resident self-report → household match → barangay dashboard actually works before scaling it. 

Scaling to all barangays is a configuration and deployment question:  not a redesign one: each barangay runs its own household-matching dataset and its own set of Incident Assessments. Nationwide rollout means replicating that per barangay, plus adding a rollup layer on top so an LGU or national dashboard can see across barangays which is the next build phase.
