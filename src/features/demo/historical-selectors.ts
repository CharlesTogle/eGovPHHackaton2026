export function getCampaignEReportDefaults(campaignId: string) {
  return {
    subject: `Disaster report for campaign ${campaignId}`,
    message: "Requesting assistance based on the active HANDA assessment.",
    reportType: "disaster",
    regionCode: "010000000",
    provinceCode: "0105500000",
    municipalityCode: "0105503000",
    barangayCode: "0105503021",
  }
}
