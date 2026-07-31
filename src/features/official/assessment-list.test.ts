import { describe, expect, it } from 'vitest'
import type { Campaign } from '@/shared'
import { groupCampaignsForDisplay } from './assessment-list'

function makeCampaign(id: string, status: Campaign['status'], disasterDate: string): Campaign {
  return {
    id,
    name: id,
    disaster_type: 'Typhoon',
    disaster_date: disasterDate,
    status,
    created_by: 'seed',
    barangay_code: '0803747001',
    alert_id: null,
    ai_generated: false,
    created_at: '2026-07-31T00:00:00.000Z',
    updated_at: '2026-07-31T00:00:00.000Z',
  }
}

describe('groupCampaignsForDisplay', () => {
  it('orders campaigns by status priority and newest date within each group', () => {
    const groups = groupCampaignsForDisplay([
      makeCampaign('closed-older', 'closed', '2025-01-01'),
      makeCampaign('draft-newer', 'draft', '2025-02-01'),
      makeCampaign('draft-older', 'draft', '2025-01-01'),
      makeCampaign('active-one', 'active', '2025-01-15'),
      makeCampaign('archived-one', 'archived', '2025-01-10'),
    ])

    expect(groups.map(group => group.label)).toEqual(['Drafts', 'Active Deployments', 'Closed Records', 'Archived Records'])
    expect(groups[0].campaigns.map(campaign => campaign.id)).toEqual(['draft-newer', 'draft-older'])
    expect(groups[1].campaigns.map(campaign => campaign.id)).toEqual(['active-one'])
  })
})
