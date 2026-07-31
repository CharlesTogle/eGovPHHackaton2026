### Task 2: Sync `master` Consumers to the Shared Historical Demo Flow

**Files:**
- Modify: `src/features/resident/ResidentConsole.tsx`
- Modify: `src/features/lgu/LguDashboard.tsx`
- Modify: `src/features/official/OfficialConsole.tsx`
- Reference: `.worktrees/edge-functions-sync/src/features/resident/ResidentConsole.tsx`
- Reference: `.worktrees/edge-functions-sync/src/features/lgu/LguDashboard.tsx`
- Reference: `.worktrees/edge-functions-sync/src/features/official/OfficialConsole.tsx`

**Interfaces:**
- Consumes: `getCampaignEReportDefaults(campaignId: string): CampaignEReportDefaults | null`
- Consumes: `buildLguIncidentRows(input: { campaigns: Campaign[]; getDashboard: (campaignId: string) => Dashboard }): LguIncidentRow[]`
- Consumes: `summarizeNeededSupplies(rows: LguIncidentRow[]): NeededSupplySummary[]`
- Consumes: `getHistoricalIncidentMeta(campaignId: string): HistoricalIncidentMeta | null`
- Produces: buildable consumer imports with no missing historical demo modules

- [ ] **Step 1: Write or preserve the failing integration surface**

```ts
// ResidentConsole already contains the failing import surface on master.
import { getCampaignEReportDefaults } from '@/features/demo/historical-selectors'

// LguDashboard should consume the selector layer instead of the local INCIDENTS array.
import { buildLguIncidentRows, summarizeNeededSupplies } from '@/features/demo/historical-selectors'

// OfficialConsole should be able to derive metadata for the selected campaign.
import { getHistoricalIncidentMeta } from '@/features/demo/historical-selectors'
```

- [ ] **Step 2: Run the type check to capture the current consumer failures**

Run: `npm run build`
Expected: FAIL before the consumer sync if `master` still contains mismatched imports, unresolved symbols, or stale mock-only logic

- [ ] **Step 3: Copy the worktree consumer changes with minimal `master`-specific adjustment**

```ts
// src/features/lgu/LguDashboard.tsx
import { useHandaStore } from '@/shared'
import { buildLguIncidentRows, summarizeNeededSupplies } from '@/features/demo/historical-selectors'

const incidentRows = useMemo(
  () => buildLguIncidentRows({ campaigns: data.campaigns, getDashboard }),
  [data.campaigns, getDashboard],
)
const neededSupplies = useMemo(() => summarizeNeededSupplies(incidentRows), [incidentRows])
```

```ts
// src/features/official/OfficialConsole.tsx
import { getHistoricalIncidentMeta } from '@/features/demo/historical-selectors'

const selectedCampaignMeta = selectedCampaign ? getHistoricalIncidentMeta(selectedCampaign.id) : null
```

```ts
// src/features/resident/ResidentConsole.tsx
const eReportDefaults = activeCampaign ? getCampaignEReportDefaults(activeCampaign.id) : null
```

Implementation note: copy the relevant worktree UI blocks too, not only the imports, when the worktree relies on the derived incident rows or metadata in rendered output.

- [ ] **Step 4: Run the full type check again**

Run: `npm run build`
Expected: PASS for TypeScript and Vite build, with the original import-resolution error removed

- [ ] **Step 5: Commit**

```bash
git add src/features/resident/ResidentConsole.tsx src/features/lgu/LguDashboard.tsx src/features/official/OfficialConsole.tsx
git commit -m "feat: sync historical demo consumers"
```

