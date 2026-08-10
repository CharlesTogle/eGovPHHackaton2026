import type { Campaign, Dashboard } from '@/shared'
import { HISTORICAL_INCIDENTS, type HistoricalIncidentMeta } from './historical-incidents'

export type LguIncidentRow = {
  id: string
  disaster: string
  happenedOn: string
  cityName: string
  municipalityCode: string
  barangayCode: string
  locationLabel: string
  status: Campaign['status']
  historicalAffectedPeople: number
  historicalAffectedFamilies: number
  displacedPeople: number
  displacedFamilies: number
  evacuationCenters: number
  partiallyDamagedHouses: number
  totallyDamagedHouses: number
  assessmentCheckIns: number
  unresolved: number
  visited: number
  resolved: number
  neededSupplies: HistoricalIncidentMeta['neededSupplies']
  ereportReportType: HistoricalIncidentMeta['ereportReportType']
}

export type CampaignEReportDefaults = {
  regionCode: string
  provinceCode: string
  municipalityCode: string
  barangayCode: string
  reportType: 'red_tape' | 'accident' | 'fire'
  subject: string
  message: string
}

export type NeededSupplySummary = {
  label: string
  quantity: string
  incidentCount: number
}

export function getHistoricalIncidentMeta(campaignId: string): HistoricalIncidentMeta | null {
  return HISTORICAL_INCIDENTS.find(item => item.campaignId === campaignId) ?? null
}

export function buildLguIncidentRows(input: {
  campaigns: Campaign[]
  getDashboard: (campaignId: string) => Dashboard
}): LguIncidentRow[] {
  return input.campaigns
    .map(campaign => {
      const meta = getHistoricalIncidentMeta(campaign.id)
      if (!meta) return null

      const dashboard = input.getDashboard(campaign.id)
      const visited = dashboard.rows.filter(row => row.checkIn.status === 'visited').length
      const resolved = dashboard.rows.filter(row => row.checkIn.status === 'resolved').length

      return {
        id: campaign.id,
        disaster: meta.historicalEventName,
        happenedOn: campaign.disaster_date,
        cityName: meta.cityName,
        municipalityCode: meta.municipalityCode,
        barangayCode: meta.barangayCodes[0] ?? campaign.barangay_code,
        locationLabel: meta.barangayLabel,
        status: campaign.status,
        historicalAffectedPeople: meta.historicalAffectedPeople,
        historicalAffectedFamilies: meta.historicalAffectedFamilies,
        displacedPeople: meta.displacedPeople,
        displacedFamilies: meta.displacedFamilies,
        evacuationCenters: meta.evacuationCenters,
        partiallyDamagedHouses: meta.partiallyDamagedHouses,
        totallyDamagedHouses: meta.totallyDamagedHouses,
        assessmentCheckIns: dashboard.affectedCount,
        unresolved: dashboard.unresolvedCount,
        visited,
        resolved,
        neededSupplies: meta.neededSupplies,
        ereportReportType: meta.ereportReportType,
      }
    })
    .filter((row): row is LguIncidentRow => row !== null)
    .sort((a, b) => new Date(b.happenedOn).getTime() - new Date(a.happenedOn).getTime())
}

export function summarizeNeededSupplies(rows: LguIncidentRow[]): NeededSupplySummary[] {
  const counts = new Map<string, NeededSupplySummary>()

  for (const row of rows) {
    for (const supply of row.neededSupplies) {
      const existing = counts.get(supply.label)
      if (existing) {
        existing.incidentCount += 1
      } else {
        counts.set(supply.label, {
          label: supply.label,
          quantity: supply.quantity,
          incidentCount: 1,
        })
      }
    }
  }

  return [...counts.values()].sort((a, b) => {
    if (b.incidentCount !== a.incidentCount) return b.incidentCount - a.incidentCount
    return a.label.localeCompare(b.label)
  })
}

export function getCampaignEReportDefaults(campaignId: string): CampaignEReportDefaults | null {
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
