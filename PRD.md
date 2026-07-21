# HANDA — Hazard Assessment and Needs Determination Application

## Problem Statement

When a natural disaster strikes, national agencies confirm the event within hours. What remains unknown for days or weeks is **which specific households in a given barangay were affected, how badly, and what they need**. During Super Typhoon Odette (2021), the government's affected-family count rose from 452,307 to over 3 million in two months — not because the storm's impact grew, but because barangay-to-LGU-to-region reporting broke down due to communication outages.

Today, barangays gather this information through physical door-to-door canvassing or informal word-of-mouth. Both are slow, incomplete, and personnel-dependent. Families who are isolated, lack transportation, or are missed during a canvass risk being excluded from the response effort entirely.

Barangay officials already have a mandated step to produce affected-household lists (CP Forms 4A, 6, 8 in existing BDRRM Plans). The gap is not process — it's **tooling**: the current paper-based approach cannot deliver household-level visibility fast enough to inform response decisions.

## Solution

HANDA is an integrated disaster incident reporting and household assessment module embedded in the eGovPH Super App. It enables a barangay to **rapidly discover who was affected and what they need** — and stops there. It does not manage donations, logistics, or relief distribution.

**How it works:**

1. A barangay official creates a disaster check-in campaign (name, type, date) and defines custom follow-up questions (e.g., home damage, medical needs, food/water).
2. Residents receive a simple "Are you affected by [Disaster]?" prompt. Tapping "Yes" triggers a short questionnaire; tapping "No" dismisses it.
3. Resident check-ins are automatically matched to existing household profiling records. Duplicate reports from the same family are collapsed into a single household entry.
4. A barangay dashboard displays real-time counts: total affected households, need-type breakdowns, unresolved cases, and non-respondent visibility.
5. Officials can mark cases as visited/resolved and export the affected-household list (CSV) for hand-off to the LGU or relief organizations.

## User Stories

### Barangay Official

1. As a barangay official, I want to log in with my eGovPH credentials, so that only authorized personnel can create and manage campaigns.
2. As a barangay official, I want to create a new campaign by entering the disaster name, type, and date, so that resident check-ins are scoped to a specific event.
3. As a barangay official, I want to define custom follow-up questions per campaign (e.g., "Is your home damaged?", "Do you need medical attention?", "Is your family short on food/water?"), so that I can tailor the assessment to the specific disaster.
4. As a barangay official, I want to reuse a question set from a previous campaign, so that I don't have to redefine standard questions for recurring disaster types.
5. As a barangay official, I want to publish a campaign to open it for resident check-ins, so that I control when data collection begins.
6. As a barangay official, I want to close or archive a campaign once the relief period ends, so that the dashboard reflects only active situations.
7. As a barangay official, I want to see the total count of distinct affected households (not raw report count), so that I understand the true scope of impact without double-counting.
8. As a barangay official, I want to see a breakdown of affected households by need type (e.g., medical, shelter, food/water), so that I can prioritize response resources.
9. As a barangay official, I want to see affected households listed with their address, so that I can dispatch response teams to specific locations.
10. As a barangay official, I want to filter the affected list by need type (e.g., show only medical-need households), so that I can route cases to the right responders.
11. As a barangay official, I want to filter the affected list by resolution status (visited, resolved, unresolved), so that I can track outstanding cases.
12. As a barangay official, I want to mark a household's case as "visited" or "resolved," so that the dashboard reflects response progress in near real time.
13. As a barangay official, I want to see which profiled households have not checked in at all (non-respondents), so that I can dispatch field teams to canvass them in person.
14. As a barangay official, I want to export the affected-household list as a CSV file, so that I can hand off data to the LGU or local relief organizations.
15. As a barangay official, I want to manually enter a resident's check-in responses on their behalf (for offline field deployment scenarios), so that households without connectivity are still counted.
16. As a barangay official, I want the dashboard to update in near real time as new check-ins arrive, so that I'm always working with current data during a live response.

### Resident

17. As a resident, I want to see a simple "Are you affected by [Disaster]?" yes/no prompt when I open the app, so that I can report or dismiss with one tap.
18. As a resident, I want to be automatically matched to my household record when I check in, so that I don't have to re-enter my address or family details.
19. As a resident, I want to manually select my household from the barangay's family list if auto-matching fails, so that my report is still correctly attributed.
20. As a resident, I want to answer the barangay-defined question set (e.g., home damage, medical need, food/water) after confirming I'm affected, so that officials know what I specifically need.
21. As a resident, I want my report to be merged under my household entry if another family member already checked in, so that our family is counted once, not multiple times.
22. As a resident, I want to receive an on-screen confirmation that my report was submitted, so that I know the barangay has been notified.
23. As a resident, I want to complete the entire check-in flow in under one minute, in plain Filipino/English, on a basic smartphone, so that it works even on slow connections and low-end devices.

### System

24. As the system, I must authenticate users using existing eGovPH credentials and retrieve citizen profile information (name, address, barangay), so that identity is trusted without a separate login.
25. As the system, I must use eGovPH role information to identify barangay officials, so that campaign creation and configuration are restricted to authorized users.
26. As the system, I must collapse multiple check-in reports from the same household (via household-matching) into a single family entry on the dashboard, so that counts are accurate.
27. As the system, I must ensure that deduplication never double-counts a family or loses a submitted report, so that officials can trust the numbers.
28. As the system, I must be fully demonstrable end-to-end (campaign creation → resident check-in → dashboard update) without requiring a live disaster, push notifications, or real-time feeds.

## Implementation Decisions

### Tech Stack

- **Frontend:** React 19 + TypeScript 6 + Vite 8, styled with Tailwind CSS v4 and shadcn/ui components (already scaffolded in this repo).
- **Data layer:** Supabase (Postgres) accessed directly from the frontend using the anon key via `@supabase/supabase-js`. No backend, no Edge Functions. RLS disabled — minimal security for hackathon speed, identity stored as plain columns. Repository interface still available for swapping to mock data offline.
- **Auth:** Real eGovPH SSO (OAuth 2.0 authorization code flow, endpoints 12-14 in `api-catalog.md`). The client calls eGovPH directly: redirect to eGovPH login → get exchange code → POST `/api/token` with partner credentials → POST `/api/partner/sso_authentication` with access token → receive full user profile. The user profile (uniqid, name, barangay_code, role) is stored in the app state and passed as a plain column value to Supabase on writes. No JWT minting, no middleware, no refresh-token rotation — just the eGovPH user object held in memory for the session.
- **Location data:** Real eGovPH location APIs (`api-catalog.md` endpoints 2-5): regions → provinces → municipalities → barangays. Called live from the frontend using the integration token.

### Architecture

The system is organized into seven modules, with two "deep modules" designed for isolation and testability:

| Module | Responsibility |
|---|---|
| **CampaignService** | Create, activate, close/archive campaigns; store campaign metadata and question sets. Simple CRUD interface. |
| **QuestionBuilder** | UI and logic for officials to define, edit, and reuse question sets per campaign. |
| **CheckInFlow** | Resident-facing sequence: disaster prompt → yes/no → household match/select → answer questions → confirmation. |
| **HouseholdMatcher** (deep) | Resolves a resident's check-in to an existing household record, or returns candidates for manual selection. `match(residentInfo) → household \| candidates[]` |
| **DashboardAggregator** (deep) | Aggregates raw check-in responses into: total affected households, need-type breakdown, resolved/unresolved lists, and non-respondents. Pure data transformation, independent of rendering. |
| **StatusTracker** | Simple state machine: marks a household's case as `unresolved` → `visited` → `resolved` for a given campaign. |
| **ExportService** | Generates CSV export of affected households from DashboardAggregator output. |

### Data Model (Supabase)

**campaigns**
- `id` (UUID, PK)
- `name` (text) — e.g., "Super Typhoon Odette"
- `disaster_type` (text) — e.g., "typhoon", "fire", "flood"
- `disaster_date` (date)
- `status` (enum: `draft`, `active`, `closed`, `archived`)
- `created_by` (text) — eGovPH uniqid of the official
- `barangay_code` (text) — from official's eGovPH profile
- `created_at`, `updated_at` (timestamptz)

**campaign_questions**
- `id` (UUID, PK)
- `campaign_id` (UUID, FK → campaigns)
- `question_text` (text)
- `need_category` (text) — e.g., "shelter", "medical", "food_water"
- `display_order` (int)

**households**
- `id` (UUID, PK)
- `barangay_code` (text)
- `household_head_name` (text)
- `address` (text)
- `member_count` (int)

**household_members**
- `id` (UUID, PK)
- `household_id` (UUID, FK → households)
- `first_name`, `last_name` (text)

**check_ins**
- `id` (UUID, PK)
- `campaign_id` (UUID, FK → campaigns)
- `household_id` (UUID, FK → households)
- `submitted_by` (text) — eGovPH uniqid of the person who checked in
- `status` (enum: `unresolved`, `visited`, `resolved`)
- `created_at`, `updated_at` (timestamptz)

**check_in_answers**
- `id` (UUID, PK)
- `check_in_id` (UUID, FK → check_ins)
- `question_id` (UUID, FK → campaign_questions)
- `answer` (text) — "yes" / "no" for boolean questions, or free text

### Key Design Decisions

1. **Single-barangay scope.** No multi-barangay or LGU-wide rollup dashboards in the current scope. A barangay official sees only their barangay's data.
2. **Deduplication by household, not user.** Multiple family members submitting from the same household produce one household entry on the dashboard. New answers are merged (union of reported needs) rather than creating separate entries.
3. **Non-respondent discovery via household list.** The dashboard compares profiled households against those who checked in, rather than relying on residents to proactively say "no." This mirrors the real workflow: barangay already has a household list; they need to know who to canvass.
4. **Campaign lifecycle: draft → active → closed → archived.** Officials explicitly publish to open check-ins, and explicitly close when the relief period ends. This prevents stale campaigns from appearing live.
5. **Frontend-only, no backend.** The client calls eGovPH SSO directly, holds the user profile in state, and calls Supabase directly with the anon key. No Edge Functions, no middleware, no JWT minting. User identity (uniqid, barangay_code) is stored as plain columns on Supabase rows. RLS disabled for speed; add proper RLS + JWT auth post-hackathon.

## Testing Decisions

### What Makes a Good Test

Tests verify external behavior (what the module does), not implementation details (how it does it). A broken test means the contract broke, not that a function was renamed.

### Modules to Test

Unit tests are prioritized for the two deep modules, which contain the core business logic:

1. **HouseholdMatcher**
   - Given resident info and a household list, returns the correct household when name/address match.
   - Returns `null` or a candidate list when no unique match exists.
   - Handles edge cases: partial name match, different spelling, same name but different barangay.

2. **DashboardAggregator**
   - Given raw check-in data, returns correct household count (deduplicated).
   - Correctly computes need-type breakdowns.
   - Filters by resolution status and need type.
   - Correctly identifies non-respondents (households with zero check-ins).

### Prior Art

No existing tests in this repo (greenfield). Tests will use a simple test runner via `vitest` (Vite-native) with no framework — plain `describe`/`it`/`expect` blocks. Mock data is supplied inline as typed fixtures.

## Out of Scope

- Relief distribution, logistics, or routing of goods and volunteers.
- Donation handling, payment processing, or monetary transactions.
- Physical goods collection or inventory tracking.
- Live disaster detection, geofencing, or automatic push notifications tied to real sensor/feed data — disaster occurrence is an already-confirmed external fact.
- Real-time, during-disaster features; the system operates in the post-disaster window.
- Identity verification/KYC beyond matching against barangay profiling records.
- AI-based resource allocation or predictive disaster analytics.
- Multi-barangay or LGU-wide rollup dashboards.
- Integration with DSWD logistics systems or weather services.
- Supabase RLS policies and proper JWT-based auth (identity stored as plain columns for now; add post-hackathon).
- National-level dashboard.

**Guiding principle:** "If the LGU or local organizations can already do it, let them." HANDA's sole value-add is faster discovery of affected families, not relief execution.

## Further Notes

- The eGovPH SSO response shape is fully documented in `api-catalog.md` (endpoints 12-14). The auth flow is: redirect to eGovPH → receive exchange code → POST `/api/token` (partner_code + partner_secret) → POST `/api/partner/sso_authentication` (Bearer access_token) → user profile. The client stores the eGovPH profile in React context for the session duration and passes `uniqid` + `barangay_code` as plain columns on Supabase rows.
- Supabase project must be provisioned before development begins. Tables defined above; no RLS policies needed for hackathon. Use anon key for all operations from the client.
- eGovPH integration token is obtained once via POST `/api/integration/token` (with access_code from `.env`) and reused for location dataset calls.
- The resident-facing flow must work on a basic smartphone browser — no heavy animations, minimal JS bundle, form inputs that work with poor connectivity.
- Demo scenario: seed data with a populated household list, create a campaign, run through the check-in flow as a resident, then view the dashboard as an official — all in under 3 minutes.
