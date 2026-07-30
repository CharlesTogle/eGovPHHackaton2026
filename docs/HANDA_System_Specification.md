# System Specification: HANDA Engine
**An Automated Post-Disaster Incident Assessment & Real-Time Intelligence Platform**

**Document Version:** 1.2.0  
**Status:** Core System Specification & Roadmap  
**Target Architecture:** API-First / eGovPH Super App Integration  
**Date:** July 30, 2026  

---

## 1. Executive Summary

**HANDA** is an API-first, Government-as-a-Service (GaaS) disaster response engine designed to automate post-disaster assessments and real-time citizen safety check-ins. It bridges national weather feeds (PAGASA, NDRRMC), Local Government Unit (LGU) command centers, and citizens operating within the official **eGovPH Super App** ecosystem.

Rather than acting as a rigid, standalone silo, HANDA functions on a **Dual Integration Architecture**:
1. **HANDA Developer Console (`developers.handa.gov.ph`):** Provides API keys, interactive OpenAPI docs, SDKs, and webhooks (similar to developer platforms like Clerk, Supabase, or Agora) so tech-enabled cities can pipe HANDA data into their existing city apps and command centers.
2. **LGU Incident Command Center (`barangay.handa.gov.ph`):** Provides a turnkey, zero-code administrative web dashboard for local Barangay officials to review AI drafts, activate assessments, and manage relief needs in real time.

**Layer 2 is the HANDA control plane and primary service boundary.** The Developer Console, Barangay Portal, future City Dashboard, and external LGU integrations all operate through Layer 2 APIs. Layers 3 and 4 remain HANDA/eGovPH-controlled citizen-facing flows: external developers do not directly send citizen push notifications or write citizen check-in responses.

To ensure maximum data accuracy and eliminate alert fatigue, HANDA operates **strictly at the Barangay level** for core deployment, reserving city-wide cascading pushes for future roadmap phases.

---

## 2. The 4 Operational Layers (Barangay-Scoped)

```
 [ LAYER 1: ALERT INGESTION ]  ──► PAGASA/NDRRMC Webhook → Threshold Check → AI Auto-Draft (Draft State)
                                     │
                                     ▼
 [ LAYER 2: LGU CONTROL ]      ──► Barangay Official logs into Portal → Reviews & Hits "Publish"
                                     │
                                     ▼
 [ LAYER 3: CITIZEN PING ]     ──► eGovPH Push Delivery (Targeted to Barangay PSGC + Geofence)
                                     │
                                     ▼
 [ LAYER 4: CITIZEN PONG ]     ──► 1:1 Citizen Response → Live Barangay Dashboard Reflection
```

### Layer 1: Inbound Alert Ingestion (Backend Middleware)
* **Trigger:** National agencies (PAGASA, NDRRMC, PHIVOLCS) issue weather alerts via REST Webhooks (`POST /v1/alerts/webhook`) or SMS shortcodes using international **CAP (Common Alerting Protocol v1.2)** format.
* **Location Mapping:** Extracts 9-digit Philippine Standard Geographic Code (PSGC) data and maps it to target Barangay database IDs.
* **Threshold Check:** Evaluates severity metrics (e.g., rainfall volume > 30 mm/hr or *RED Rainfall Warning* status).
* **AI Auto-Drafting:** An internal AI Copilot parses weather metrics and pre-fills standardized questions grounded in official frameworks (**NDRRMC RDANA**, **DSWD DROMIC**, **BDRRM CP Forms**).
* **Output State:** Saves a **`DRAFT`** assessment record scoped to that specific Barangay.
* **Invariant:** **Zero push notifications are sent to citizens during Layer 1.**

### Layer 2: LGU Control & Activation (Barangay Admin Portal)
* **Portal Access:** Barangay Officials log into `barangay.handa.gov.ph` using official **eGovPH Administrator Credentials**.
* **Notification Alert:** A banner alerts officials: *"PAGASA logged a Red Rainfall Warning for your area. An Incident Assessment draft is ready for review."*
* **Official Action:** The official inspects the AI-curated questions, makes minor edits if necessary, and taps **"Publish"**.
* **Output State:** Flips assessment status from **`DRAFT` → `ACTIVE`**.
* **Service Boundary:** Layer 2 is exposed through the HANDA API Gateway for authorized LGU systems. It owns assessment review, editing, publishing, dashboard data, exports, aggregates, non-respondent lists, and real-time administrative feeds.
* **Citizen-Flow Boundary:** Publishing an assessment requests HANDA/eGovPH to perform Layer 3 delivery. External developers do not call citizen push APIs directly.

### Layer 3: Outbound Citizen Ping (App Delivery)
* **Trigger:** The state change to `ACTIVE` initiates outbound dispatching.
* **Targeting Logic:**
  1. **Registered Address (Primary):** Matches residents registered under that specific Barangay's PSGC in their eGovPH profile.
  2. **GPS Geofence (Secondary):** Captures active devices physically located inside the Barangay's geographic boundary coordinates.
* **Delivery:** High-priority push notification and pop-up banner appear inside the citizen's **eGovPH Super App**.

### Layer 4: Citizen "Pong" & Reflection (1:1 Data Loop)
* **Citizen Check-In:** Residents complete a 30-second check-in (*"Are you affected?"* + itemized needs selection: Food, Water, Medical, Housing).
* **1:1 Direct Record:** Each submission logs a verified entry directly into the database (`1 Response = 1 Affected Citizen Record`).
* **Real-Time Reflection:** The Barangay dashboard map and itemized need counters update live without forcing a page refresh.
* **Non-Respondent Target List:** Automatically tracks unreached households/citizens in the barangay, providing a targeted list for door-to-door barangay tanods and rescue teams.
* **Data Export:** Supports one-click CSV/PDF exports formatted to match mandated government CP Forms 4A/6/8 for DSWD and Mayor's office hand-offs.
* **API Boundary:** Citizen responses are submitted only through HANDA/eGovPH-controlled app flows. External LGU developers consume response aggregates, exports, maps, and authorized record views through Layer 2 APIs, but do not directly write citizen check-ins.

---

## 3. Dual Architectural Ecosystem

HANDA supports two deployment environments to eliminate adoption friction across different government tiers:

```
                               ┌─────────────────────────────────────────┐
                               │       HANDA Core Engine & API Gateway   │
                               └────────────────────┬────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 ▼                                                                     ▼
┌─────────────────────────────────────────┐                           ┌─────────────────────────────────────────┐
│     PATH A: Custom City App / API       │                           │    PATH B: Turnkey Web Portal           │
│     (`developers.handa.gov.ph`)         │                           │    (`barangay.handa.gov.ph`)            │
├─────────────────────────────────────────┤                           ├─────────────────────────────────────────┤
│ • Developers use Layer 2 APIs/Webhooks  │                           │ • Zero coding required                  │
│ • API keys, OpenAPI docs, SDKs          │                           │ • Out-of-the-box Barangay Dashboard     │
│ • Dashboard data feeds City Apps        │                           │ • Publishes into eGovPH citizen flows   │
└─────────────────────────────────────────┘                           └─────────────────────────────────────────┘
```

### Technical API Protocols

| Component | Protocol / API Standard | Payload / Auth Format |
| :--- | :--- | :--- |
| **Authentication** | OAuth 2.0 / OpenID Connect (OIDC) | eGovPH SSO JWT Token (`Bearer`) |
| **Inbound Weather Alerts** | REST Webhook / SMS Gateway | CAP v1.2 XML / JSON via HTTPS `POST` |
| **Assessment Admin & Analytics** | Stateless REST API | Standard JSON via HTTPS `POST` / `GET` |
| **Dashboard Live Feed** | Server-Sent Events (SSE) | HTTP Stream (`text/event-stream`) |

### API Gateway Exposure

The public Developer Console exposes **Layer 2 administrative and analytics APIs**, not raw citizen delivery endpoints.

| API Area | Example Endpoints | External Access |
| :--- | :--- | :--- |
| **Barangay & Jurisdiction Scope** | `GET /v1/barangays`, `GET /v1/barangays/{psgc}` | Exposed to authorized LGU developers |
| **Incidents & Assessments** | `GET /v1/incidents`, `GET /v1/assessments`, `PATCH /v1/assessments/{id}`, `POST /v1/assessments/{id}/publish` | Exposed through Layer 2 service boundary |
| **Dashboard Data** | `GET /v1/assessments/{id}/aggregates`, `GET /v1/assessments/{id}/responses`, `GET /v1/assessments/{id}/non-respondents` | Exposed with PSGC-scoped authorization |
| **Exports** | `GET /v1/assessments/{id}/export.csv`, `GET /v1/assessments/{id}/export.pdf` | Exposed to authorized officials/systems |
| **Live Administrative Feeds** | `GET /v1/live/assessments/{id}` | Exposed via SSE for dashboards |
| **Developer Webhooks** | `POST /v1/webhooks`, `GET /v1/webhooks`, `DELETE /v1/webhooks/{id}` | Exposed for city app integrations |
| **Citizen Push Delivery** | Internal dispatch APIs | Not exposed directly to developers |
| **Citizen Check-In Writes** | Internal response submission APIs | Not exposed directly to developers |
| **National Alert Ingestion** | `POST /v1/alerts/webhook` | Restricted to trusted national agency integrations |

### Expanded Layer 2: Parent LGU Dashboard

Layer 2 also supports a future parent-level LGU dashboard for cities and municipalities. This dashboard lets authorized LGU users view all barangays under their jurisdiction without removing barangay-level data boundaries.

Example parent-scope APIs:

| API Area | Example Endpoints |
| :--- | :--- |
| **LGU Barangay Coverage** | `GET /v1/lgu/barangays` |
| **LGU Incidents** | `GET /v1/lgu/incidents` |
| **LGU Assessments** | `GET /v1/lgu/assessments` |
| **LGU Aggregates** | `GET /v1/lgu/aggregates` |
| **LGU Non-Respondents** | `GET /v1/lgu/non-respondents` |
| **LGU Live Feed** | `GET /v1/lgu/live` |

Parent LGU APIs aggregate across child barangays for command visibility, while write actions such as publishing still preserve barangay-scoped audit trails and telemetry.

---

## 4. Platform Ecosystem Comparison

HANDA is designed to complement—not replace—existing modules within the eGovPH Super App ecosystem:

| Dimension | `eLGU` | `eReport` | **HANDA Engine** |
| :--- | :--- | :--- | :--- |
| **Primary Focus** | Municipal business & taxes (BPLS, property tax, Cedula). | Individual crime, fire, or government complaint tickets. | Automated top-down disaster management & emergency check-ins. |
| **Directionality** | 1-to-1 Administrative transactions. | Bottom-up citizen reporting (Citizen → Agency). | Top-down campaigns & bidirectional verification. |
| **Alert Trigger** | Manual citizen application. | Citizen incident submission. | Automated weather ingestion (PAGASA) + LGU activation. |
| **Output Data** | Permits, receipts, civil certificates. | Incident tickets for PNP/BFP dispatch. | Live affected headcounts, non-respondent target lists, DSWD-aligned exports. |

---

## 5. System Roadmap & Future Expansions

### Expansion 1: City-Wide Cascading Push (Parent-Child Multi-Tenancy)
* **Concept:** Grants City Mayors and City Disaster Risk Reduction and Management Offices (CDRRMO) parent-tenant controls (`city.handa.gov.ph`).
* **Capability:** During major natural disasters (e.g., Category 5 Typhoons, major earthquakes), city admins can trigger a single **"Publish City-Wide"** action that cascades across all child barangays simultaneously while preserving individual barangay-level telemetry.

### Expansion 2: Third-Party Crowdfunding & Verification API Gateway
* **Concept:** Exposes a secure, privacy-preserving verification API (`GET /v1/verifications/citizen`) for external fintechs and community apps (e.g., GCash, Maya, GoFundMe).
* **Capability:** 
  1. Citizen logs into external donation platform using **eGovPH SSO**.
  2. External app queries HANDA to verify if the citizen completed an active Layer 4 check-in.
  3. External app displays an official **"eGov Verified Disaster Victim"** trust badge on the campaign card.
  4. Donors fund specific itemized needs using **Anonymized Beneficiary Tokens (`BEN-xxxx`)**, preserving citizen data privacy under RA 10173.
