# Graph Report - eGovPHHackaton2026  (2026-08-11)

## Corpus Check
- 104 files · ~85,627 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 812 nodes · 1003 edges · 84 communities (56 shown, 28 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4a19c41d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 21 edges
2. `db()` - 16 edges
3. `table()` - 16 edges
4. `compilerOptions` - 15 edges
5. `HANDA Production Infrastructure Plan` - 15 edges
6. `json()` - 13 edges
7. `useSession()` - 12 edges
8. `Endpoints` - 12 edges
9. `HANDA Residency Check-in & Live Dashboard ΓÇö Data Report` - 12 edges
10. `processInboundAlert()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `AppRouter()` --calls--> `useSession()`  [INFERRED]
  src/App.tsx → src/features/auth/session-context.tsx
- `runPipelineTests()` --calls--> `getPresetScenarios()`  [EXTRACTED]
  scratch/test-full-pipeline.mjs → src/features/alerts/alert-service.ts
- `runPipelineTests()` --calls--> `processInboundAlert()`  [EXTRACTED]
  scratch/test-full-pipeline.mjs → src/features/alerts/alert-service.ts
- `runPipelineTests()` --calls--> `parseSmsReport()`  [EXTRACTED]
  scratch/test-full-pipeline.mjs → src/features/alerts/sms-parser.ts
- `DeveloperConsole()` --calls--> `useSession()`  [INFERRED]
  src/features/developer/DeveloperConsole.tsx → src/features/auth/session-context.tsx

## Import Cycles
- None detected.

## Communities (84 total, 28 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (43): AccessTokenResponse, BASE_URL, EXCHANGE_CODE_PATH, ExchangeCodeResponse, generateAccessToken(), generateExchangeCode(), getExchangeCodeFromUrl(), MOCK_PROFILES (+35 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (19): Authentication, Barangay List by Params, Complaints, Confirm OTP, Datasets, Email Verification, Environment Variables, eReport Integration API Documentation (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (43): Shell(), ShellProps, SidebarTab, LguDashboard(), ResidentConsole(), Campaign, CampaignQuestion, CampaignStatus (+35 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (18): 10. Reports List, 11. View Report by Case Number, 12. Generate Exchange Code, 13. Generate Access Token, 14. SSO Authentication, 1. Report Type List, 2. Region List, 3. Province List by Region (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (18): Architecture, Barangay Official, Data Model (Supabase), Further Notes, HANDA — Hazard Assessment and Needs Determination Application, Implementation Decisions, Key Design Decisions, Modules to Test (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (17): 1. Auth Consolidation (One Path), 2. Mock SSO Keys Logging, 3. RBAC, 4. Resident Console, 5. Data/Official Plumbing, 6. Ponytail Cleanup (Surgical), Delete, Edit (+9 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (15): 1. Data And App State Shell, 2. Barangay Official Login And Campaign Setup, 3. Campaign Activation And Dashboard Aggregator, 4. Status Tracker And Case Modal, 5. Resident Check-In Flow, 6. Offline Outreach Manual Submission, 7. Export Service And Archive Campaign, 8. Optional Supabase Wiring Last (+7 more)

### Community 10 - "Community 10"
Cohesion: 0.09
Nodes (45): AlertIngestionResult, getPresetScenarios(), processInboundAlert(), AlertSimulator(), AlertSimulatorProps, CAPAlertInfo, CAPParameter, extractPSGCCodes() (+37 more)

### Community 11 - "Community 11"
Cohesion: 0.05
Nodes (43): dependencies, @base-ui/react, class-variance-authority, clsx, @fontsource-variable/jetbrains-mono, @phosphor-icons/react, react, react-dom (+35 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (12): Database Schema Changes, Demo Happy Path, Executive Summary, Files Created, Files Modified, HANDA Residency Check-in & Live Dashboard ΓÇö Data Report, Module Breakdown, Next Steps (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.17
Nodes (11): Architecture, Context, Data model changes, Dependencies to add, Goal, Non-goals, Official happy path (`/dashboard`), Out of scope (re-affirmed) (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (10): Global Constraints, Residency Check-in & Live Barangay Dashboard — Implementation Plan, Task 1: Install vitest + write shared types + HouseholdMatcher with tests, Task 2: DashboardAggregator with tests, Task 3: CSV ExportService, Task 4: Database migrations (unique constraint + realtime publication), Task 5: Campaigns feature (types, service, builder, hooks), Task 6: Check-in feature (service, matcher-query, useActiveCampaign, CheckInPage) (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (8): Current State, Flow A — Authentication (eGovPH SSO) — shared by both actors, Flow B — Setup/Seeding (one-time, demo prerequisite), Flow C — Barangay Official Flow (campaign setup + monitoring), Flow D — Resident Flow (check-in, < 60 seconds), HANDA — Happy Path Flows, Proposed Demo Happy Path Narrative (3-minute run), The Flows

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (6): Commits Created, Concerns, Files Created, Status: DONE, Supabase DB Push, Task 4 Report

### Community 17 - "Community 17"
Cohesion: 0.33
Nodes (4): css, defined, missing, root

### Community 18 - "Community 18"
Cohesion: 0.15
Nodes (16): 1. Login Screen & Access, 2. Role-Based Capabilities, A. Barangay Level (Command Center), B. Citizen/Resident Access (eGov App / Any App), C. LGU Command Center (Parent Dashboard), D. Developer Role (The eHanda Service Ecosystem), D. Developer Role (The Handa Service Ecosystem), eHanda: Disaster Response & Assessment Platform (+8 more)

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (3): FILIPINO_FALLBACK_COPY, PREVIEW_CARDS, QUICK_SERVICES

### Community 27 - "Community 27"
Cohesion: 0.20
Nodes (9): Concerns, Controller Verification Follow-Up, Files Changed, Self-Review Notes, Status, Summary of Edits, Task 1 Report, Verification Command(s) (+1 more)

### Community 30 - "Community 30"
Cohesion: 0.20
Nodes (9): Concerns, Files Changed, Self-Review Notes, Status, Summary of Edits, Task 3 Completion Report, Task 3 Report, Verification Command(s) (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.12
Nodes (15): 1. Executive Summary, 2. The 4 Operational Layers (Barangay-Scoped), 3. Dual Architectural Ecosystem, 4. Platform Ecosystem Comparison, 5. System Roadmap & Future Expansions, API Gateway Exposure, Expanded Layer 2: Parent LGU Dashboard, Expansion 1: City-Wide Cascading Push (Parent-Child Multi-Tenancy) (+7 more)

### Community 46 - "Community 46"
Cohesion: 0.12
Nodes (15): Backup And Disaster Recovery, CI/CD And Releases, Compute Runtime, Core Decisions, Cost Tiers, Database Plan, Explicitly Deferred, First Build Checklist (+7 more)

### Community 47 - "Community 47"
Cohesion: 0.18
Nodes (10): Assessments, Barangay, Error Responses, Export CSV, Get Aggregates, Get Assessment, Get Barangay, Get Responses (+2 more)

### Community 48 - "Community 48"
Cohesion: 0.11
Nodes (31): AccessTokenResponse, AiAssistantResponse, AiResponseSource, assistant(), confirmOtp(), corsHeaders, CreditBalanceResponse, credits() (+23 more)

### Community 49 - "Community 49"
Cohesion: 0.29
Nodes (6): **4.1 In Scope**, **4.2 Out of Scope / Limitations**, **4. Scope and Limitations**, **General Objective**, **Objectives**, **Specific Objectives**

### Community 50 - "Community 50"
Cohesion: 0.29
Nodes (6): **6.1 Barangay Official Workflow (Incident Assessment Setup & Monitoring)**, **6.2 Resident Check-In Workflow**, **6.3 End-to-End Flow Summary**, **6. Context Diagram**, **6. System Workflow**, Architecture Integration Hierarchy

### Community 51 - "Community 51"
Cohesion: 0.50
Nodes (3): **3.1 Functional Requirements**, **3.2 Non-Functional Requirements**, **3. Requirements Engineering**

### Community 58 - "Community 58"
Cohesion: 0.22
Nodes (8): 1. Executive Purpose & Operational Mandate, 2. Official OCD RDANA Form-1 Structure, 3. Data Collection Workflow & Official Cascading, NDRRMC Official RDANA (Rapid Damage Assessment and Needs Analysis) Post-Disaster Reference, SECTION I: General Disaster Profile, SECTION II: Human Impact & Displaced Population, SECTION III: Sectoral Damage & Urgent Needs Clusters, SECTION IV: Local Response Capacity & Augmentation Requests

### Community 59 - "Community 59"
Cohesion: 0.22
Nodes (8): ApiKey, Barangay, DeveloperConsole(), DevRecord, DevSidebarTab, ENDPOINT_DOCS, EndpointDoc, formatMaskedApiKey()

### Community 60 - "Community 60"
Cohesion: 0.40
Nodes (4): name, organization_id, organization_slug, ref

### Community 61 - "Community 61"
Cohesion: 0.50
Nodes (3): Design Principles, Layout & Architecture, Overview

### Community 62 - "Community 62"
Cohesion: 0.13
Nodes (14): AI Assistant, AI Generation Endpoints, Authentication, Document Extractor, eGov Hackathon 2026 AI Integration API Documentation, Environment Variables, Generate Access Token, Laws & Regulations (+6 more)

### Community 63 - "Community 63"
Cohesion: 0.13
Nodes (24): BarangayItem, getBarangays(), getEReportToken(), getMunicipalities(), getProvinces(), getRegions(), getReportTypes(), MunicipalityItem (+16 more)

### Community 64 - "Community 64"
Cohesion: 0.17
Nodes (9): DEMO_ANSWERS, DEMO_CAMPAIGNS, DEMO_CASES, DEMO_CHECK_INS, DEMO_QUESTIONS, DemoCaseTemplate, hasHistoricalCampaigns(), mergeHistoricalDemoData() (+1 more)

### Community 65 - "Community 65"
Cohesion: 0.33
Nodes (3): HandaBottomSheetProps, SheetState, SNAP_TRANSLATE_Y

### Community 66 - "Community 66"
Cohesion: 0.22
Nodes (8): 1. Executive Purpose & Operational Mandate, 2. Official OCD RDANA Form-1 Structure, 3. Data Collection Workflow & Official Cascading, NDRRMC Official RDANA (Rapid Damage Assessment and Needs Analysis) Post-Disaster Reference, SECTION I: General Disaster Profile, SECTION II: Human Impact & Displaced Population, SECTION III: Sectoral Damage & Urgent Needs Clusters, SECTION IV: Local Response Capacity & Augmentation Requests

### Community 67 - "Community 67"
Cohesion: 0.19
Nodes (15): AiAssistantResponse, AiResponseSource, askAiAssistant(), CreditBalanceResponse, getCreditBalance(), getEgovAiToken(), getLiveClientToken(), getLocalFallbackAnswer() (+7 more)

### Community 71 - "Community 71"
Cohesion: 0.50
Nodes (3): Design Principles, Layout & Architecture, Overview

### Community 75 - "Community 75"
Cohesion: 0.12
Nodes (17): HISTORICAL_INCIDENTS, HistoricalIncidentMeta, buildLguIncidentRows(), CampaignEReportDefaults, getCampaignEReportDefaults(), getHistoricalIncidentMeta(), LguIncidentRow, NeededSupplySummary (+9 more)

### Community 76 - "Community 76"
Cohesion: 0.70
Nodes (4): run(), testIntegrationToken(), testLiveAIWithToken(), testToken()

### Community 81 - "Community 81"
Cohesion: 0.20
Nodes (7): DeveloperApplication, DeveloperApplicationStatus, INCIDENTS, IncidentStatus, IncidentSummary, LguTab, MOCK_DEVELOPER_APPLICATIONS

### Community 82 - "Community 82"
Cohesion: 0.80
Nodes (4): getLiveClientToken(), run(), testAsk(), testTranslate()

## Knowledge Gaps
- **442 isolated node(s):** `buttonVariants`, `$schema`, `style`, `rsc`, `tsx` (+437 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useSession()` connect `Community 0` to `Community 75`, `Community 2`, `Community 59`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `OfficialConsole()` connect `Community 75` to `Community 0`, `Community 2`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `useHandaStore()` connect `Community 2` to `Community 75`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `buttonVariants`, `$schema`, `style` to the rest of the system?**
  _442 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06918238993710692 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07111756168359942 - nodes in this community are weakly interconnected._