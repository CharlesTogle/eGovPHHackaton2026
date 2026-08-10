# Handa: Disaster Aid & Assessment Platform

## Overview
Handa is a centralized disaster assessment and aid service built for the eGovPH Hackathon 2026. Rather than just being a standalone application, Handa acts as a complete ecosystem allowing local government units (LGUs), citizens, and external developers to coordinate disaster aid, rapidly collect needs analysis, and deliver targeted relief.

## Process Flow & Navigation Guide for Judges

To experience the full flow of the eHanda platform, please follow this guide which walks through the various roles, features, and user journeys.

### 1. Login Screen & Access
To gain access to the system, please use the **Demo Accounts** available on the login screen. These demo accounts simulate test users authenticated via the **eGov SSO** accounts provided by the eGov PH API.

---

### 2. Role-Based Capabilities

The system is broken down into distinct perspectives to handle disaster aid end-to-end.

#### A. Barangay Level (Command Center)
This role acts as the primary data gatherer and localized command center. While capable of city/regional-wide pings, our scope focuses heavily on the barangay level for precision.

**User Flow for Barangay Assessment:**
1. **Initiate Campaign (Manual or Automated):** The Barangay Command Center creates a new disaster assessment campaign. This can be done in two ways:
   - **Manual Logging:** The LGU manually creates the assessment.
   - **Automated AI Drafting (Simulation):** We integrated a simulation test that ingests **PAGASA, NDRRMC, or PHIVOLCS** SMS alerts/reports. Using **LangChain**, the AI automatically drafts a campaign and formulates the appropriate questions based on the ingested disaster report.
2. **Formulate Questions:** Assessment questions adhere to RDANA (Rapid Damage Assessment and Needs Analysis) as well as international/LGU standards.
3. **Dispatch & Publish:** The campaign is published and pushed out to citizens through the **eGov App** or any dedicated barangay/city app.
4. **Data Collection (Online & Offline):** 
   - **App Users:** Citizens submit reports directly through their app.
   - **Manual Entry / Offline Support:** For walk-ins or disconnected areas, local officials can use the dashboard's manual entry feature. If the citizen's app is used in an area with no internet, it utilizes SQLite and a cache-based system to queue reports offline, syncing them to the database once connectivity is restored.

#### B. Citizen/Resident Access (eGov App / Any App)
This represents the citizen's interface, allowing them to report their status, request help, and access vital information.

- **eGov AI Chat Query:** A built-in AI assistant capable of translation (local dialects, documented specifically in Filipino). Citizens can use eGov AI to ask for disaster guides, evacuation preparedness, or post-earthquake steps.
- **eReport Integration:** A critical feature for submitting individual emergency reports. This is a must-use for immediate, person-to-person concerns (e.g., immediate medical rescue, trapped individuals, red tape).
- **eHanda Assessment Check-ins:** Citizens respond to the active barangay assessment guide. By providing their status (safe, injured, needs food/water), government units and NGOs can see aggregated data in the Command Center and provide targeted help.

#### C. LGU Command Center (Parent Dashboard)
A layer above the Barangay, this centralized dashboard presents a city-wide view.
- Provides macro-level visibility across all child barangays.
- Aggregates live data to show the hardest-hit areas, overall affected populations, and real-time incident tracking.
- Helps city decision-makers and mayors allocate regional resources effectively according to aggregated citizen needs.

#### D. Developer Role (The Handa Service Ecosystem)
What makes Handa truly unique is that it is **not just a standalone app—it is a backend service/platform.**
- **API Integration:** Any developer, IT team, or LGU can integrate their existing systems with Handa.
- **Access to Real Data:** Using provided API keys and developer documentation, external applications can securely hook into Handa to reflect real-time assessment data, **eReport** statuses, and **PSA Datasets**.
- **Community Expansion:** This openness allows for student thesis projects, capstone projects, and future community applications to build on top of Handa's infrastructure, continuously expanding the disaster aid ecosystem.

---

## Integrated eGov PH APIs & Datasets
This project heavily leverages the eGov PH ecosystem. The following APIs and Datasets are integrated within eHanda:
- **eGov SSO API:** Used for secure authentication (simulated through Demo Accounts for the hackathon).
- **eGov AI API:** Used to power the Citizen Chat feature for disaster preparedness guides and local dialect translation.
- **eReport API & Datasets:** Used to log and reflect real-time citizen incident concerns (medical, rescue, red tape) directly into the LGU dashboards. **Why rely on eReport?** Instead of building a redundant, isolated reporting structure from scratch that citizens must download and learn during high-stress situations, eHanda integrates directly with the existing eGov national infrastructure. This ensures citizens can use the app they already know, while providing LGUs with a unified, official data stream.
- **eGov PSA Datasets:** Provides the foundational demographics and regional data used for mapping LGUs and barangays, and displaying population fallbacks when generating analytics.

---

## Tech Stack
- **Frontend:** React + TypeScript + Vite, Tailwind CSS, Radix UI
- **State/Data:** React Hooks, LocalStorage / Demo Data, PSA Fallback Datasets
- **AI Integration:** LangChain / Google Gemini for automated RDANA questionnaire drafting from PAGASA/NDRRMC reports, alongside the eGov AI API.

*Note: For the purpose of this hackathon, specific external database integrations are simulated using robust mock data and UI states to demonstrate the full process flow.*
