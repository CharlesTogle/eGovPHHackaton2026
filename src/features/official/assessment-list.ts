import type { Campaign } from '@/shared'

const CAMPAIGN_STATUS_PRIORITY: Record<Campaign['status'], number> = {
  draft: 0,
  active: 1,
  closed: 2,
  archived: 3,
}

const CAMPAIGN_GROUP_LABELS: Record<Campaign['status'], string> = {
  draft: 'Drafts',
  active: 'Active Deployments',
  closed: 'Closed Records',
  archived: 'Archived Records',
}

export function groupCampaignsForDisplay(campaigns: Campaign[]) {
  const ordered = campaigns
    .slice()
    .sort((a, b) => {
      const statusDiff = CAMPAIGN_STATUS_PRIORITY[a.status] - CAMPAIGN_STATUS_PRIORITY[b.status]
      if (statusDiff !== 0) return statusDiff

      const dateDiff = new Date(b.disaster_date).getTime() - new Date(a.disaster_date).getTime()
      if (dateDiff !== 0) return dateDiff

      return b.updated_at.localeCompare(a.updated_at)
    })

  return (['draft', 'active', 'closed', 'archived'] as const)
    .map((status) => ({
      status,
      label: CAMPAIGN_GROUP_LABELS[status],
      campaigns: ordered.filter((campaign) => campaign.status === status),
    }))
    .filter((group) => group.campaigns.length > 0)
}
