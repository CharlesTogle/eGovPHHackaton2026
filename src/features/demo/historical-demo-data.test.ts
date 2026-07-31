import { describe, expect, it } from 'vitest'
import { mergeHistoricalDemoData } from './historical-demo-data'

describe('historical demo data fallback', () => {
  it('preserves legacy non-historical campaigns and adds the curated historical set', () => {
    const merged = mergeHistoricalDemoData({
      campaigns: [
        {
          id: 'a0000000-0000-0000-0000-000000000001',
          name: 'Typhoon Odette Response',
          disaster_type: 'Typhoon',
          disaster_date: '2025-01-15',
          status: 'active',
          created_by: 'Admin',
          barangay_code: '0105503021',
          alert_id: null,
          ai_generated: false,
          created_at: '2026-07-31T00:00:00.000Z',
          updated_at: '2026-07-31T00:00:00.000Z',
        },
      ],
      questions: [],
      checkIns: [],
      answers: [],
      alerts: [{ id: 'alert-1' }],
    } as never)

    expect(merged.campaigns.map((campaign) => campaign.id)).toEqual([
      'a0000000-0000-0000-0000-000000000001',
      'a1000000-0000-0000-0000-000000000001',
      'a1000000-0000-0000-0000-000000000002',
      'a1000000-0000-0000-0000-000000000003',
    ])
    expect(merged.questions.length).toBeGreaterThan(0)
    expect(merged.checkIns.length).toBeGreaterThan(0)
    expect(merged.alerts).toHaveLength(1)
  })

  it('keeps live data untouched when historical campaigns already exist', () => {
    const merged = mergeHistoricalDemoData({
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
      questions: [],
      checkIns: [],
      answers: [],
      alerts: [],
    } as never)

    expect(merged.campaigns).toHaveLength(1)
    expect(merged.campaigns[0].id).toBe('a1000000-0000-0000-0000-000000000001')
  })

  it('ships a larger assessment dataset for demo viewing', () => {
    const merged = mergeHistoricalDemoData(null)
    const byCampaign = merged.checkIns.reduce<Record<string, number>>((acc, checkIn) => {
      acc[checkIn.campaign_id] = (acc[checkIn.campaign_id] ?? 0) + 1
      return acc
    }, {})

    expect(merged.checkIns.length).toBeGreaterThanOrEqual(300)
    expect(byCampaign['a1000000-0000-0000-0000-000000000001']).toBeGreaterThanOrEqual(120)
    expect(byCampaign['a1000000-0000-0000-0000-000000000002']).toBeGreaterThanOrEqual(90)
    expect(byCampaign['a1000000-0000-0000-0000-000000000003']).toBeGreaterThanOrEqual(80)
  })
})
