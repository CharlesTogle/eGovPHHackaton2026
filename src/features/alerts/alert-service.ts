/**
 * Alert Service — Layer 1 Orchestrator
 *
 * Orchestrates the full Layer 1 pipeline:
 *   CAP Webhook → Parse → PSGC Map → Threshold Check → AI Draft → Save
 *
 * This is the main entry point for alert ingestion, called either from:
 * - A Supabase Edge Function (production)
 * - The AlertSimulator component (demo/development)
 */

import type { Alert, DraftAssessment, ThresholdResult } from './types'
import { parseCAPPayload, normalizeEventType, extractPSGCCodes } from './cap-parser'
import { evaluateThreshold } from './threshold-engine'
import { generateDraftAssessment } from './langchain-drafting'

export interface AlertIngestionResult {
  alert: Alert
  threshold: ThresholdResult
  draft: DraftAssessment | null
}

/**
 * Process an inbound alert — the full Layer 1 pipeline.
 *
 * 1. Parse CAP envelope
 * 2. Extract PSGC codes + normalize event type
 * 3. Evaluate severity threshold
 * 4. If threshold met → run AI auto-drafting with RDANA grounding
 * 5. Return the alert record + threshold result + optional draft
 *
 * INVARIANT: Zero push notifications are sent during this step.
 */
export async function processInboundAlert(
  rawPayload: Record<string, unknown>,
): Promise<AlertIngestionResult> {
  // Step 1: Parse CAP payload
  const capAlert = parseCAPPayload(rawPayload)

  // Step 2: Extract location and event metadata
  const eventType = normalizeEventType(capAlert.info.event)
  const psgcCodes = extractPSGCCodes(capAlert.info.area)

  // Step 3: Evaluate threshold
  const threshold = evaluateThreshold(capAlert, eventType)

  // Build alert record
  const alert: Alert = {
    id: crypto.randomUUID(),
    source: capAlert.sender,
    cap_identifier: capAlert.identifier,
    event_type: eventType,
    severity: capAlert.info.severity,
    urgency: capAlert.info.urgency,
    headline: capAlert.info.headline,
    description: capAlert.info.description ?? null,
    effective_at: capAlert.info.effective,
    expires_at: capAlert.info.expires ?? null,
    psgc_codes: psgcCodes,
    raw_payload: capAlert,
    threshold_met: threshold.met,
    campaign_id: null, // Set after draft campaign creation
    created_at: new Date().toISOString(),
  }

  // Step 4: Generate AI draft if threshold is met
  let draft: DraftAssessment | null = null
  if (threshold.auto_draft) {
    const disasterDate = capAlert.info.effective.split('T')[0]
    draft = await generateDraftAssessment(
      eventType,
      capAlert.info.severity,
      capAlert.info.headline,
      disasterDate,
    )
  }

  console.log('[Layer 1] Alert processed:', {
    source: alert.source,
    event: alert.event_type,
    severity: alert.severity,
    threshold_met: threshold.met,
    auto_draft: threshold.auto_draft,
    score: threshold.severity_score,
    psgc_codes: psgcCodes,
    questions_generated: draft?.questions.length ?? 0,
  })

  return { alert, threshold, draft }
}

/**
 * Get preset CAP alert scenarios for the demo simulator.
 */
export function getPresetScenarios(): { id: string; name: string; description: string; payload: Record<string, unknown> }[] {
  return [
    {
      id: 'typhoon-yolanda',
      name: 'Super Typhoon Yolanda (Cat 5)',
      description: 'NDRRMC Red Alert — Signal #5, 315 km/h winds & 6m storm surge',
      payload: {
        identifier: 'NDRRMC-2013-STY-YOLANDA',
        sender: 'NDRRMC / PAGASA',
        sent: new Date().toISOString(),
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        info: {
          event: 'Super Typhoon YOLANDA (Haiyan)',
          urgency: 'Immediate',
          severity: 'Extreme',
          certainty: 'Observed',
          headline: 'NDRRMC Red Alert: Super Typhoon YOLANDA Signal #5 — Catastrophic Impact',
          description: 'Category 5 Super Typhoon YOLANDA with maximum sustained winds of 315 km/h and 5-7 meter storm surges. Massive structural destruction, total lifeline blackout, and widespread evacuation required.',
          effective: new Date().toISOString(),
          expires: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          area: [
            { areaDesc: 'Visayas & Region VIII' },
            { areaDesc: 'Pangasinan', geocode: [{ valueName: 'PSGC', value: '0105500000' }] },
            { areaDesc: 'POBLACION, City of Alaminos', geocode: [{ valueName: 'PSGC', value: '0105503021' }] },
          ],
        },
      },
    },
    {
      id: 'flood-ondoy',
      name: 'Typhoon Ondoy Flood Event',
      description: 'PAGASA Red Rainfall Warning — 455mm record rainfall & 15ft flash flood',
      payload: {
        identifier: 'PAGASA-2009-ONDOY-FLOOD',
        sender: 'PAGASA',
        sent: new Date().toISOString(),
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        info: {
          event: 'Tropical Storm ONDOY — Flash Flood Disaster',
          urgency: 'Immediate',
          severity: 'Extreme',
          certainty: 'Observed',
          headline: 'PAGASA Red Alert: Record 455mm Rainfall & Extreme Flash Flooding',
          description: 'Tropical Storm ONDOY brought over 455 mm of rainfall in 24 hours. Widespread 10-15ft flash floods submerging residential communities. Emergency roof evacuations and immediate food/water relief required.',
          effective: new Date().toISOString(),
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          area: [
            { areaDesc: 'Metro Manila & Central Luzon' },
            { areaDesc: 'Pangasinan', geocode: [{ valueName: 'PSGC', value: '0105500000' }] },
            { areaDesc: 'POBLACION, City of Alaminos', geocode: [{ valueName: 'PSGC', value: '0105503021' }] },
          ],
        },
      },
    },
    {
      id: 'earthquake-m72',
      name: 'Magnitude 7.2 Major Earthquake',
      description: 'PHIVOLCS Bulletin — M7.2 Shallow Earthquake, Intensity VIII (Destructive)',
      payload: {
        identifier: 'PHIVOLCS-2023-EQ-M72',
        sender: 'PHIVOLCS',
        sent: new Date().toISOString(),
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        info: {
          event: 'Major Earthquake Bulletin M7.2',
          urgency: 'Immediate',
          severity: 'Extreme',
          certainty: 'Observed',
          headline: 'PHIVOLCS Emergency Bulletin: M7.2 Major Earthquake — Intensity VIII Destructive',
          description: 'Shallow Magnitude 7.2 earthquake recorded at 10km depth. Severe structural collapses, landslide blocks on major highways, and damage to bridge lifelines. Immediate 72hr RDANA Form-1 assessment deployed.',
          effective: new Date().toISOString(),
          area: [
            { areaDesc: 'POBLACION, City of Alaminos, Pangasinan', geocode: [{ valueName: 'PSGC', value: '0105503021' }] },
          ],
        },
      },
    },
    {
      id: 'typhoon-carina',
      name: 'Typhoon Carina & Southwest Monsoon',
      description: 'NDRRMC Red Alert — Severe Monsoon Flooding & Landslide Warning',
      payload: {
        identifier: 'PAGASA-2024-CARINA-HABAGAT',
        sender: 'PAGASA / NDRRMC',
        sent: new Date().toISOString(),
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        info: {
          event: 'Typhoon CARINA & Southwest Monsoon',
          urgency: 'Immediate',
          severity: 'Severe',
          certainty: 'Likely',
          headline: 'NDRRMC Red Alert: Typhoon CARINA & Enhanced Southwest Monsoon Flooding',
          description: 'Continuous torrential rains from Typhoon CARINA and Habagat causing widespread waist-deep flooding, landslides, and displaced families in evacuation centers. Rapid relief food packs and medical kits urgently needed.',
          effective: new Date().toISOString(),
          expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          area: [
            { areaDesc: 'Region I & Central Luzon' },
            { areaDesc: 'POBLACION, City of Alaminos', geocode: [{ valueName: 'PSGC', value: '0105503021' }] },
          ],
        },
      },
    },
  ]
}
