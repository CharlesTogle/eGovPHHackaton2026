# HANDA: Disaster Aid & Assessment Platform

HANDA is an eGovPH-aligned disaster assessment and aid coordination platform for barangay officials, residents, LGUs, and approved developer integrations. It turns incoming disaster alerts into structured RDANA assessments, publishes those assessments to residents, collects household check-ins, and gives response teams a live operational queue.

## Current System Flow

```text
eGov SSO / demo identity
        |
        v
Role routing: official | resident | LGU | developer
        |
        +--> Official creates an assessment
        |       |
        |       +--> Adds or copies RDANA questions
        |       +--> Publishes draft
        |              |
        |              +--> eGovPH eSMS notification
        |              +--> Telegram dynamic survey card
        |              +--> eGovPH resident assessment becomes active
        |
        +--> Resident answers the active assessment
        |       |
        |       +--> eHanda check-in saved to Supabase
        |       +--> Filipino/English presentation support
        |       +--> eReport emergency-report option
        |
        +--> Official reviews the dashboard queue
                |
                +--> Filter, sort, and inspect responses
                +--> Mark cases visited or resolved
                +--> Add offline/manual entries
                +--> Export CSV
```

Only one assessment is active for intake at a time. Publishing a new assessment closes the previous active assessment.

## Demo Walkthrough

### 1. Sign In

Use the demo accounts shown on the login screen. The mock eGov SSO flow returns a profile containing the role, barangay code, municipality code, and other location metadata.

### 2. Official Assessment Setup

Officials can:

- Create a draft assessment with a name, disaster type, and disaster date.
- Add questions mapped to RDANA categories such as shelter, food/water, medical, livelihood, evacuation, and utilities.
- Edit or remove questions.
- Copy a question set from another assessment.
- Review AI-generated assessment drafts.
- Publish, close, or archive assessments.

### 3. Alert-to-Draft Pipeline

The dashboard includes a development alert simulator for PAGASA, NDRRMC, and PHIVOLCS-style CAP/SMS alerts.

The simulated Layer 1 pipeline is:

```text
CAP/SMS payload
  -> CAP parsing
  -> event normalization
  -> PSGC location extraction
  -> severity threshold evaluation
  -> RDANA question drafting
  -> official review
  -> publish
```

The drafting service uses eGov AI/Gemini when configured and deterministic RDANA templates as an offline fallback.

### 4. Publish and Notify

Publishing an assessment updates its status to `active` and dispatches the current question set through the configured channels:

- **eGovPH eSMS:** Sends a concise emergency alert, evacuation instruction, barangay desk contact, and emergency hotlines. Survey questions are intentionally omitted from SMS so the message remains usable on constrained devices.
- **Telegram:** Sends the assessment title, verified display area, evacuation/offline-aid instruction, dynamic question list, YES/NO buttons, and a submit button.
- **eGovPH resident flow:** Residents see the active assessment in the resident console.

Location display uses verified dataset names instead of raw PSGC codes. Unknown barangay names are not fabricated or displayed as numeric codes. If only a city or region is verified, the notification displays only that verified level.

### 5. Telegram Check-In Behavior

The local Telegram bot runs through long polling in `scratch/telegram-bot.mjs`.

Each Telegram answer draft is bound to the exact alert message being answered. This prevents a previous campaign from being mixed with a newer campaign when the same user receives multiple alerts. Confirmation uses:

- The questions from the clicked alert message.
- The campaign title from the clicked alert message.
- The area from the clicked alert message.

The completed draft is cleared after confirmation.

### 6. Resident Reporting

Residents can:

- See the active barangay assessment.
- Answer its dynamic question set.
- Submit a household check-in.
- Receive a submission confirmation.
- View Filipino translations for supported campaign and question text.
- Open the eReport submission flow for an individual emergency concern.
- Use the eGov AI assistant for disaster guidance and translation support.

### 7. Official Operations Dashboard

The official dashboard provides:

- Total check-ins and unresolved cases.
- Need-category aggregation.
- Sortable and filterable response queue.
- Individual case detail and answer inspection.
- Case status updates: unresolved, visited, resolved.
- Manual resident entry for offline field collection.
- CSV export with anonymized resident identity, needs, status, submitter, and timestamp.

### 8. LGU and Developer Views

The LGU dashboard provides city/municipality-scoped incident summaries, child-barangay activity, response metrics, priority supplies, and developer access requests.

The developer console demonstrates:

- Barangay-scoped API access.
- API key and endpoint documentation.
- eReport dataset browsing.
- eGov AI and integration status panels.
- Developer application review from the official/LGU consoles.

## Integrated eGovPH Services

### eGov SSO

The authentication layer supports mock demo identities and the eGovPH SSO integration path. The resulting profile supplies role and geographic scope information used by the application.

### eGov AI

The eGov AI service powers the citizen assistant, disaster guidance, and translation flows. Local fallback responses are used when the live service is unavailable.

### eReport API

The eReport service supports the documented integration endpoints:

```text
POST /api/integration/token
GET  /api/integration/datasets/regions
GET  /api/integration/datasets/provinces?region_code={code}
GET  /api/integration/datasets/municipalities?province_code={code}
GET  /api/integration/datasets/barangays?municipality_code={code}
POST /api/integration/submit_complaint
POST /api/integration/verify/request
POST /api/integration/verify/confirm
GET  /api/integration/reports
```

The location hierarchy is:

```text
region -> province -> municipality/city -> barangay
```

The eReport API is intended to provide the complete live dataset. The repository also contains a limited eReport-shaped PSA fallback dataset for offline/demo use. If a live dataset request fails, the service falls back to the bundled data.

The eReport token sequence is:

```text
access_code
  -> POST /api/integration/token
  -> integration_token
  -> dataset and complaint requests
```

Report viewing uses a separate `integration_report_view_token` obtained after email OTP verification.

### eGovPH eSMS

The publish dispatcher calls the eMessage Push SMS endpoint and normalizes Philippine mobile numbers to E.164 format. Configure recipients with `VITE_EMESSAGE_SMS_RECIPIENTS` as a comma-separated list.

### Telegram

The browser dispatcher sends dynamic assessment cards to configured Telegram chat IDs. The local bot handles button callbacks, text replies, confirmation summaries, emergency hotlines, and eGov AI fallback responses.

## Environment Configuration

Copy `.env.example` to `.env` and configure only the integrations required for the demo.

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# eGov SSO demo/live settings
VITE_EGOV_SSO_USE_MOCK=true

# eReport
VITE_EREPORT_BASE_URL=https://stg-ereport-ws.oueg.info
VITE_EREPORT_ACCESS_TOKEN=
VITE_EGOV_INTEGRATION_ACCESS_CODE=

# eGovPH eSMS
VITE_EMESSAGE_INTEGRATION_BASE_URL=https://ws-message.e.gov.ph
VITE_EMESSAGE_ACCESS_TOKEN=
VITE_EMESSAGE_SMS_RECIPIENTS=

# Telegram
VITE_TELEGRAM_BOT_TOKEN=
VITE_TELEGRAM_CHAT_IDS=
```

In the current code, `VITE_EREPORT_ACCESS_TOKEN` is the legacy variable name used as the eReport access code. `VITE_EGOV_INTEGRATION_ACCESS_CODE` is used as its fallback. Do not commit real credentials.

## Local Development

Install dependencies and run the web application:

```bash
npm install
npm run dev
```

Run the Telegram bot separately:

```powershell
$env:TELEGRAM_BOT_TOKEN="your-bot-token"
node scratch/telegram-bot.mjs
```

The Vite development proxy maps `/api/ereport` to the configured eReport integration server so dataset requests can be tested without duplicating the `/api/integration` path.

## Verification Commands

```bash
npm run build
npm run test:unit
npm run lint
```

The repository also contains focused tests for alert payload formatting, PSA location resolution, and Telegram message-bound state handling.

## Repository Structure

```text
src/features/official/OfficialConsole.tsx    Official assessment and operations console
src/features/resident/ResidentConsole.tsx     Resident check-in experience
src/features/lgu/LguDashboard.tsx             LGU command-center view
src/features/alerts/                          Alert parsing and AI draft pipeline
src/lib/alert-dispatcher.ts                   eSMS and Telegram publish dispatch
src/lib/emessage-sms-service.ts               eGovPH eSMS client and formatting
src/lib/ereport-service.ts                    eReport API and dataset service
src/lib/psa-fallback-data.ts                  Bundled location fallback dataset
scratch/telegram-bot.mjs                      Local Telegram long-polling bot
supabase/migrations/                          Database schema and demo seeds
docs/eReport-API-Documentation.md              eReport integration reference
```

## Demo Scope and Limitations

- This is a hackathon/demo build, not a production deployment.
- The browser dispatcher currently consumes `VITE_*` integration values; production deployments should move provider credentials behind a server-side or Supabase Edge Function boundary.
- SMS recipients and Telegram chat IDs must be configured for real recipients. The demo may use configured sample targets.
- The Telegram bot is a local long-polling process and must be restarted after bot code changes.
- The bundled location data is a fallback subset. The live eReport API should be used when nationwide location coverage is required.
- Supabase persistence and external API availability depend on environment configuration and service permissions.
