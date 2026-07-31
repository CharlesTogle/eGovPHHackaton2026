### Task 1: Restore the Historical Selector Layer on `master`

**Files:**
- Create: `src/features/demo/historical-incidents.ts`
- Create: `src/features/demo/historical-selectors.ts`
- Test: `src/features/demo/historical-selectors.test.ts`
- Reference: `.worktrees/edge-functions-sync/src/features/demo/historical-incidents.ts`
- Reference: `.worktrees/edge-functions-sync/src/features/demo/historical-selectors.ts`
- Reference: `.worktrees/edge-functions-sync/src/features/demo/historical-selectors.test.ts`

**Interfaces:**
- Consumes: `Campaign` and `Dashboard` types from `@/shared`
- Produces: `getHistoricalIncidentMeta(campaignId: string): HistoricalIncidentMeta | null`
- Produces: `buildLguIncidentRows(input: { campaigns: Campaign[]; getDashboard: (campaignId: string) => Dashboard }): LguIncidentRow[]`
- Produces: `summarizeNeededSupplies(rows: LguIncidentRow[]): NeededSupplySummary[]`
- Produces: `getCampaignEReportDefaults(campaignId: string): CampaignEReportDefaults | null`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { buildLguIncidentRows, getCampaignEReportDefaults, getHistoricalIncidentMeta, summarizeNeededSupplies } from './historical-selectors'
import { PSA_BARANGAYS, PSA_MUNICIPALITIES, PSA_PROVINCES } from '@/lib/psa-fallback-data'
import { HISTORICAL_INCIDENTS } from './historical-incidents'

describe('historical demo selectors', () => {
  it('returns metadata for the Tacloban historical campaign', () => {
    const meta = getHistoricalIncidentMeta('a1000000-0000-0000-0000-000000000001')
    expect(meta?.historicalEventName).toBe('Typhoon Yolanda / Haiyan')
    expect(meta?.municipalityCode).toBe('0803747000')
  })

  it('returns campaign-aware eReport defaults', () => {
    const defaults = getCampaignEReportDefaults('a1000000-0000-0000-0000-000000000002')
    expect(defaults?.municipalityCode).toBe('1004305000')
    expect(defaults?.subject).toContain('Sendong')
  })

  it('ships exactly the three curated historical demo incidents', () => {
    expect(HISTORICAL_INCIDENTS.map(item => item.historicalEventName)).toEqual([
      'Typhoon Yolanda / Haiyan',
      'Tropical Storm Sendong / Washi',
      '2013 Bohol Earthquake',
    ])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/features/demo/historical-selectors.test.ts`
Expected: FAIL with module resolution or missing file errors for `./historical-selectors` and `./historical-incidents`

- [ ] **Step 3: Write the minimal implementation by copying the worktree modules**

```ts
// src/features/demo/historical-incidents.ts
export type HistoricalIncidentMeta = {
  campaignId: string
  historicalEventName: string
  regionCode: string
  provinceCode: string
  municipalityCode: string
  barangayCodes: string[]
  barangayLabel: string
  historicalAffectedPeople: number
  historicalAffectedFamilies: number
  displacedPeople: number
  displacedFamilies: number
  evacuationCenters: number
  partiallyDamagedHouses: number
  totallyDamagedHouses: number
  neededSupplies: Array<{ label: string; quantity: string }>
  ereportReportType: 'red_tape' | 'accident' | 'fire'
  ereportSubject: string
  ereportMessage: string
}

export const HISTORICAL_INCIDENTS: HistoricalIncidentMeta[] = [
  {
    campaignId: 'a1000000-0000-0000-0000-000000000001',
    historicalEventName: 'Typhoon Yolanda / Haiyan',
    regionCode: '080000000',
    provinceCode: '080370000',
    municipalityCode: '0803747000',
    barangayCodes: ['0803747001', '0803747010'],
    barangayLabel: 'Tacloban City, Leyte',
    historicalAffectedPeople: 612,
    historicalAffectedFamilies: 128,
    displacedPeople: 284,
    displacedFamilies: 61,
    evacuationCenters: 4,
    partiallyDamagedHouses: 95,
    totallyDamagedHouses: 37,
    neededSupplies: [
      { label: 'Family food packs', quantity: '384 packs' },
      { label: 'Potable water', quantity: '9,180 L/day' },
      { label: 'Shelter repair kits', quantity: '132 kits' },
    ],
    ereportReportType: 'red_tape',
    ereportSubject: 'Typhoon Yolanda assistance request - Tacloban City',
    ereportMessage: 'Reporting household impacts and priority relief needs after Typhoon Yolanda in Tacloban City, Leyte.',
  },
]
```

```ts
// src/features/demo/historical-selectors.ts
import type { Campaign, Dashboard } from '@/shared'
import { HISTORICAL_INCIDENTS, type HistoricalIncidentMeta } from './historical-incidents'

export type LguIncidentRow = {
  id: string
  disaster: string
  happenedOn: string
  locationLabel: string
  status: Campaign['status']
  historicalAffectedPeople: number
  assessmentCheckIns: number
  unresolved: number
  visited: number
  resolved: number
  neededSupplies: HistoricalIncidentMeta['neededSupplies']
  ereportReportType: HistoricalIncidentMeta['ereportReportType']
}

export function getHistoricalIncidentMeta(campaignId: string): HistoricalIncidentMeta | null {
  return HISTORICAL_INCIDENTS.find(item => item.campaignId === campaignId) ?? null
}

export function getCampaignEReportDefaults(campaignId: string) {
  const meta = getHistoricalIncidentMeta(campaignId)
  if (!meta) return null

  return {
    regionCode: meta.regionCode,
    provinceCode: meta.provinceCode,
    municipalityCode: meta.municipalityCode,
    barangayCode: meta.barangayCodes[0],
    reportType: meta.ereportReportType,
    subject: meta.ereportSubject,
    message: meta.ereportMessage,
  }
}
```

Implementation note: copy the complete file contents from the worktree versions, not just the abbreviated snippet above.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm run test:unit -- src/features/demo/historical-selectors.test.ts`
Expected: PASS for the copied selector tests

- [ ] **Step 5: Commit**

```bash
git add src/features/demo/historical-incidents.ts src/features/demo/historical-selectors.ts src/features/demo/historical-selectors.test.ts
git commit -m "feat: sync historical demo selectors"
```

