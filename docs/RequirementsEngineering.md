**HANDA**

**Household Assessment and Needs Determination Application**

*Requirements Engineering*

# **3. Requirements Engineering**

Requirements were engineered directly from the three user roles the system serves — barangay official (setup and dashboard), resident (check-in), and the system itself (matching and aggregation) — and grouped into functional and non-functional requirements.

## **3.1 Functional Requirements**


| ID | Requirement | Description | Priority |
| --- | --- | --- | --- |
| FR-1 | eGovPH Authentication Integration | The module shall authenticate users using existing eGovPH credentials. The module shall retrieve citizen profile information from eGovPH. The module shall use eGovPH role information to identify barangay officials. If eGovPH authentication services are unavailable, the module shall support a fallback path (e.g., a cached official session or a temporary offline-authentication mode) so barangay officials can continue operating an active Incident Assessment. | Must |
| FR-2 | Incident Assessment  creation | Officials can create a disaster check-in Incident Assessment with disaster name, type, and date. The module shall prevent duplicate Incident Assessments for the same event by validating new assessments against existing ones with overlapping date, location, and disaster type. | Must |
| FR-3 | Custom question definition | Officials can define custom follow-up questions per Incident Assessment (e.g., home damage, medical need). Question sets shall be limited to a maximum of 10 questions per Incident Assessment, with each question marked as mandatory or optional. | Must |
| FR-4 | Question set reuse | Officials can reuse a question set from a previous Incident Assessment instead of redefining it. Reusable question sets shall be organized into templates categorized by incident type (e.g., fire, flood, earthquake), so a reused set stays relevant to the new incident rather than carrying over mismatched questions. | Should |
| FR-5 | Incident Assessment activation / closure | Officials can publish an Incident Assessment to open it for check-ins, and later close or archive it. | Must |
| FR-6 | Resident disaster prompt | The resident sees a simple “Are you affected by [Disaster]?” yes/no prompt. | Must |
| FR-7 | Resident check-in questions | On “Yes,” residents answer the barangay-defined question set for that Incident Assessment. | Must |
| FR-8 | Household auto-matching | A resident's check-in is automatically matched to an existing household record where possible. Matching shall follow a defined priority order: Household ID, then Resident ID, then Registered Address, before falling back to manual selection. | Must |
| FR-9 | Manual household selection | If auto-match fails, resident/officials can manually select the correct household from the profiling list. During manual selection, residents shall see only partial household identifiers (e.g., a household code or masked address) rather than full household details, to protect other residents' privacy. | Must |
| FR-10 | Check-in confirmation | Residents receive confirmation that their report was received. | Must |
| FR-11 | Decline option | Residents can indicate “No, not affected” and dismiss the prompt without submitting. | Should |
| FR-12 | Affected-household count | Dashboard shows the total count of distinct affected families, not raw report count. Households temporarily relocated to an evacuation center shall be flagged with a migration indicator rather than counted as a separate household, to avoid double-counting. | Must |
| FR-13 | Need-type breakdown | Dashboard breaks down affected families by need type (e.g., medical, home damage, food/water). | Must |
| FR-14 | Affected-household list & location | Dashboard lists affected families with address/location for response planning. | Must |
| FR-15 | Filtering | Officials can filter the affected list by need type or resolution status. | Should |
| FR-16 | Status update | Officials can mark a household's case as “Pending Verification,” “Under Assessment,” “Visited,” “Duplicate Submission,” or “Resolved.” | Must |
| FR-17 | Non-respondent visibility | Officials can see which profiled households have not checked in at all; these are labeled “Unknown Status,” not assumed unaffected, since they may still require urgent assistance. | Must |
| FR-18 | Export | Officials can export the affected-households list (e.g., CSV) for LGU/local-org hand-off. Exported formats shall align with existing Philippine DRRM reporting templates where applicable, so exports are usable without reformatting by the receiving LGU/local organization. | Should |
| FR-19 | Duplicate-report collapsing | Multiple reports from members of the same family are counted and displayed as one family entry. Where merged reports from the same household conflict (e.g., differing reported severity), the system shall flag the household for official verification rather than auto-resolving the conflict. | Must |
| FR-20 | End-to-end demoability | The full flow (Incident Assessment creation → check-in → dashboard update) is doable without a live disaster or push notifications. | Must |
| FR-21 | Report editing / reopening | A resident may request an edit to a mistakenly submitted report, or an official may reopen a submitted report, at any point before the Incident Assessment is closed. | Should |
| FR-22 | Concurrent Incident Assessments | The system shall support multiple simultaneously active Incident Assessments without conflict (e.g., a resident affected by both a flood and a related fire). | Should |
| FR-23 | Activation notification | eGovPH shall notify residents within the affected barangay when a new Incident Assessment is activated, consistent with the Notification service shown in the Context Diagram. | Should |


## **3.2 Non-Functional Requirements**


| ID | Category | Requirement |
| --- | --- | --- |
| NFR-1 | Usability | The resident-facing check-in flow must be completable in under a minute, in plain language, on a basic smartphone browser. |
| NFR-2 | Performance | Dashboard aggregation (counts, breakdowns, unresolved list) must reflect new check-ins within several seconds under normal connectivity conditions, rather than assuming guaranteed real-time delivery during a disaster. |
| NFR-3 | Data integrity | Household matching and deduplication must not double-count a family or lose a submitted report. |
| NFR-4 | Testability | Core logic modules (HouseholdMatcher, DashboardAggregator) must be unit-testable independent of the UI layer. |
| NFR-5 | Portability of data layer | The persistence layer must be swappable between Supabase and local mock/seed data with minimal code change. |
| NFR-6 | Security / access control | Incident Assessment creation and configuration must be restricted to authenticated officials; resident identity need only resolve to a household record. The module shall support role-based access control, distinguishing permissions for Barangay Captain, Barangay Secretary, and DRRM officer roles within Incident Assessment management. |
| NFR-7 | Scope discipline | The system must not attempt to manage donations, logistics, or relief d distribution, preserving a narrow, reliable feature set within the hackathon timeframe. |
| NFR-8 | Auditability | The system shall maintain an activity log of official actions (create, edit, status change) on Incident Assessments and household reports, to support accountability. |
| NFR-9 | Scalability | Modules shall be designed so that expansion beyond a single barangay (e.g., additional barangays or LGU-wide use) requires configuration rather than architectural change. |
| NFR-10 | Demo resilience | Demonstrations and testing shall be supported via mock authentication and profile services, decoupled from live eGovPH availability. |

