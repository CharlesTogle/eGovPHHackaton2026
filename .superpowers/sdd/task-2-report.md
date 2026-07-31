# Task 2 Report: Sync `master` Consumers to the Shared Historical Demo Flow

- **Status:** DONE_WITH_CONCERNS
- **Scope:** Sync `master` consumer surfaces to the shared historical selector and metadata flow used by `.worktrees/edge-functions-sync`, without fixing unrelated pre-existing `master` failures.

## What Changed

- `src/features/lgu/LguDashboard.tsx`
  - Replaced the local hard-coded `INCIDENTS` dashboard source with shared selector-driven rows from `buildLguIncidentRows({ campaigns, getDashboard })`.
  - Added `summarizeNeededSupplies(incidentRows)` so the LGU dashboard now renders the same historical supply rollups as the worktree source of truth.
  - Updated dashboard cards and the incident table to use historical metadata fields (`locationLabel`, `historicalAffectedPeople`, `assessmentCheckIns`, `ereportReportType`, shared status values).
  - Added the shared supply summary block and loading copy from the worktree flow.

- `src/features/official/OfficialConsole.tsx`
  - Added shared selector import for `getHistoricalIncidentMeta`.
  - Derived `selectedCampaignMeta` from the selected campaign ID.
  - Updated the selected assessment header to render historical location and affected-population metadata when the selected campaign is part of the curated historical set.
  - Added the historical metadata KPI cards and the priority supply tracking block used by the worktree dashboard flow.

- `src/features/resident/ResidentConsole.tsx`
  - No code change required.
  - `master` already matched the worktree historical eReport selector usage: `getCampaignEReportDefaults(activeCampaign.id)`.

- `src/features/demo/historical-demo-data.test.ts`
  - Added the missing historical-flow unit test file that exists in the worktree source of truth.

## Historical Flow File Sync Check

- Present on `master` before task and still aligned with worktree:
  - `src/features/demo/historical-demo-data.ts`
  - `src/features/demo/historical-incidents.ts`
  - `src/features/demo/historical-selectors.ts`
  - `src/features/demo/historical-selectors.test.ts`
- Added from worktree during this task:
  - `src/features/demo/historical-demo-data.test.ts`

## Verification

### Red Step

- Ran `npm run build` before edits.
- Result: **FAIL**, but due to pre-existing unrelated `master` issues, not the historical selector consumer sync.

Pre-existing build failures observed before the sync:

- `src/features/official/OfficialConsole.tsx`
  - missing `formatAnonymizedIdentity` export from `@/shared`
  - missing `@/features/alerts`
  - `updateQuestion` missing from store shape
- `src/features/resident/ResidentConsole.tsx`
  - missing `@/components/DisasterReportForm`
- `src/shared/index.ts`
  - missing `@/features/alerts/types`
- `src/shared/supabase.ts`
  - missing `@/features/alerts/types`

### Focused Tests After Sync

- Ran `npm run test:unit -- src/features/demo/historical-selectors.test.ts src/features/demo/historical-demo-data.test.ts`
- Result: **PASS**
- Output summary:
  - 4 test files passed
  - 22 tests passed

Note: Vitest also picked up the equivalent worktree test files under `.worktrees/edge-functions-sync`, so the run included both `master` and worktree copies.

### Full Build After Sync

- Ran `npm run build` after edits.
- Result: **FAIL**
- Outcome relative to task scope:
  - No new historical selector consumer errors were introduced by this task.
  - The build remains blocked by the same unrelated pre-existing `master` issues listed above.

## Commit

- Created commit: `feat: sync historical demo consumers`

## Concerns

- The project-wide build could not be made green within this task because `master` still has unrelated missing-module and store-shape errors outside the historical consumer sync scope.
- `ResidentConsole` was already synced to `getCampaignEReportDefaults`, so there was no meaningful file diff to apply there.
