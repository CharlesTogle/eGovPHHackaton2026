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

  it('builds an LGU row that keeps historical totals separate from live check-ins', () => {
    const rows = buildLguIncidentRows({
      campaigns: [
        {
          id: 'a1000000-0000-0000-0000-000000000001',
          name: 'Typhoon Yolanda Rapid Assessment',
          disaster_type: 'Typhoon',
          disaster_date: '2013-11-08',
          status: 'active',
          created_by: 'OFC_TACLOBAN_001',
          barangay_code: '0803747001',
          alert_id: null,
          ai_generated: false,
          created_at: '2026-07-31T00:00:00.000Z',
          updated_at: '2026-07-31T00:00:00.000Z',
        },
      ],
      getDashboard: () => ({ affectedCount: 3, unresolvedCount: 1, needBreakdown: { Shelter: 2 }, rows: [] }),
    })

    expect(rows).toHaveLength(1)
    expect(rows[0].historicalAffectedPeople).toBeGreaterThan(rows[0].assessmentCheckIns)
    expect(rows[0].assessmentCheckIns).toBe(3)
    expect(rows[0].ereportReportType).toBe('red_tape')
  })

  it('returns campaign-aware eReport defaults', () => {
    const defaults = getCampaignEReportDefaults('a1000000-0000-0000-0000-000000000002')
    expect(defaults?.municipalityCode).toBe('1004305000')
    expect(defaults?.subject).toContain('Sendong')
  })

  it('has fallback geography for every historical campaign default', () => {
    expect(PSA_PROVINCES['080000000']?.some(item => item.id === '080370000')).toBe(true)
    expect(PSA_MUNICIPALITIES['080370000']?.some(item => item.id === '0803747000')).toBe(true)
    expect(PSA_BARANGAYS['0803747000']?.some(item => item.id === '0803747001')).toBe(true)

    expect(PSA_PROVINCES['100000000']?.some(item => item.id === '100430000')).toBe(true)
    expect(PSA_MUNICIPALITIES['100430000']?.some(item => item.id === '1004305000')).toBe(true)
    expect(PSA_BARANGAYS['1004305000']?.some(item => item.id === '1004305001')).toBe(true)

    expect(PSA_PROVINCES['070000000']?.some(item => item.id === '070120000')).toBe(true)
    expect(PSA_MUNICIPALITIES['070120000']?.some(item => item.id === '0701200001')).toBe(true)
    expect(PSA_BARANGAYS['0701200001']?.some(item => item.id === '070120000101')).toBe(true)
  })

  it('computes rollups that match the same campaign rows used by the LGU dashboard', () => {
    const rows = buildLguIncidentRows({
      campaigns: [
        {
          id: 'a1000000-0000-0000-0000-000000000001',
          name: 'Typhoon Yolanda Rapid Assessment',
          disaster_type: 'Typhoon',
          disaster_date: '2013-11-08',
          status: 'active',
          created_by: 'seed',
          barangay_code: '0803747001',
          alert_id: null,
          ai_generated: false,
          created_at: '2026-07-31T00:00:00.000Z',
          updated_at: '2026-07-31T00:00:00.000Z',
        },
      ],
      getDashboard: () => ({
        affectedCount: 4,
        unresolvedCount: 2,
        needBreakdown: {},
        rows: [
          { checkIn: { id: '1', campaign_id: 'a1000000-0000-0000-0000-000000000001', name: 'A', submitted_by: 'A', status: 'unresolved', created_at: '', updated_at: '' }, answers: [] },
          { checkIn: { id: '2', campaign_id: 'a1000000-0000-0000-0000-000000000001', name: 'B', submitted_by: 'B', status: 'visited', created_at: '', updated_at: '' }, answers: [] },
          { checkIn: { id: '3', campaign_id: 'a1000000-0000-0000-0000-000000000001', name: 'C', submitted_by: 'C', status: 'resolved', created_at: '', updated_at: '' }, answers: [] },
          { checkIn: { id: '4', campaign_id: 'a1000000-0000-0000-0000-000000000001', name: 'D', submitted_by: 'D', status: 'resolved', created_at: '', updated_at: '' }, answers: [] },
        ],
      }),
    })

    expect(rows[0].assessmentCheckIns).toBe(4)
    expect(rows[0].unresolved).toBe(2)
    expect(rows[0].visited).toBe(1)
    expect(rows[0].resolved).toBe(2)
  })

  it('returns the selected campaign geography before any active-campaign fallback', () => {
    const defaults = getCampaignEReportDefaults('a1000000-0000-0000-0000-000000000003')
    expect(defaults?.municipalityCode).toBe('0701200001')
    expect(defaults?.barangayCode).toBe('070120000101')
  })

  it('ships exactly the three curated historical demo incidents', () => {
    expect(HISTORICAL_INCIDENTS.map(item => item.historicalEventName)).toEqual([
      'Typhoon Yolanda / Haiyan',
      'Tropical Storm Sendong / Washi',
      '2013 Bohol Earthquake',
    ])
  })

  it('summarizes needed supplies for the LGU display block', () => {
    const rows = buildLguIncidentRows({
      campaigns: [
        {
          id: 'a1000000-0000-0000-0000-000000000001',
          name: 'Typhoon Yolanda Rapid Assessment',
          disaster_type: 'Typhoon',
          disaster_date: '2013-11-08',
          status: 'active',
          created_by: 'seed',
          barangay_code: '0803747001',
          alert_id: null,
          ai_generated: false,
          created_at: '2026-07-31T00:00:00.000Z',
          updated_at: '2026-07-31T00:00:00.000Z',
        },
        {
          id: 'a1000000-0000-0000-0000-000000000002',
          name: 'Sendong Flood Household Assessment',
          disaster_type: 'Flood',
          disaster_date: '2011-12-17',
          status: 'closed',
          created_by: 'seed',
          barangay_code: '1004305001',
          alert_id: null,
          ai_generated: false,
          created_at: '2026-07-31T00:00:00.000Z',
          updated_at: '2026-07-31T00:00:00.000Z',
        },
      ],
      getDashboard: () => ({ affectedCount: 4, unresolvedCount: 2, needBreakdown: {}, rows: [] }),
    })

    const supplies = summarizeNeededSupplies(rows)
    expect(supplies[0].label).toBe('Family food packs')
    expect(supplies[0].quantity).toBe('384 packs')
    expect(supplies[0].incidentCount).toBe(1)
    expect(supplies.length).toBeGreaterThanOrEqual(5)
  })
})
