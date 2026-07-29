**HANDA**

**Household Assessment and Needs Determination Application**

*Project Charter*

# **Objectives**

## **General Objective**

Develop an integrated disaster incident reporting and household assessment module within the eGovPH Super App that enables barangays to rapidly identify affected households following localized emergency incidents.

## **Specific Objectives**

Design a citizen incident reporting module.

Develop a barangay monitoring dashboard.

Integrate household profiling.

Digitize post-disaster assessment.

Improve the timeliness and visibility of household-level post-disaster assessment reports.

# **4. Scope and Limitations**

## **4.1 In Scope**

Barangay official account authentication and Incident Assessment  management (create, activate, close/archive).

Integration with the eGovPH Super App.

Utilization of existing citizen accounts managed by eGovPH.

Barangay-level incident reporting and household assessment.

Allows barangay officials to create localized incident assessments following events such as fire incidents, structural collapse, localized flooding, and similar emergencies.

Residents submit household status.

Displays affected households.

Exports reports.

Custom, per-Incident Assessment question definition and reuse of prior question sets.

Resident-facing check-in flow: disaster prompt, yes/no response, household match/selection, question answers, confirmation.

Matching of check-ins to an existing barangay household/family profiling list, with manual fallback selection.

A barangay dashboard for discovery: affected-household counts, need-type breakdown, filtering, status tracking, non-respondent visibility, and CSV export.

Deduplication so that multiple family members reporting in are counted once, per household.

Single-barangay scope, doable end-to-end without a live disaster.

Incident Assessments may be scoped to a single household, a street or cluster of households, or an entire barangay, as defined by the activating official; the system supports multiple Incident Assessments active at the same time (e.g., a resident affected by both a flood and a related fire).

## **4.2 Out of Scope / Limitations**

The module depends on the availability of eGovPH authentication and user profile services.

Relief distribution, logistics, or routing of goods and volunteers.

Donation handling, payment processing, or any monetary transactions.

Household matching relies on updated barangay profiling records.

Physical goods collection or inventory tracking.

Final relief allocation decisions remain under the authority of the LGU.

Live disaster detection, geofencing, or automatic push notifications tied to real sensor or feed data — disaster occurrence is treated as an already-confirmed external fact.

Real-time, during-disaster features; the system operates strictly in the post-disaster window.

Status tracking (Pending Verification, Under Assessment, Visited, Duplicate Submission, Resolved) monitors only the completion state of a household's assessment; it does not perform response coordination, dispatch, or logistics planning, which remain LGU responsibilities.

True offline submission by residents: offline functionality applies only to field responders manually re-encoding collected reports once connectivity is restored, not to residents submitting directly without connectivity.

Identity verification or KYC beyond matching against the barangay's existing profiling records.

AI-based resource allocation.

Predictive disaster analytics.

Automatic disaster detection.

Integration with DSWD logistics.

Integration with weather services.

National-level dashboard.

Multi-LGU coordination.

Multi-barangay or LGU-wide rollup dashboards — the current scope is single-barangay only.
