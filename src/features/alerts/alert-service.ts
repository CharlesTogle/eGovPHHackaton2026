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
      id: 'earthquake-maasim',
      name: 'Magnitude 7.8 Earthquake (Maasim)',
      description: 'PHIVOLCS Tsunami Alert — M7.8 Earthquake, Sarangani & South Cotabato',
      payload: {
        identifier: 'SMS-PUSH-1749363460000',
        sender: 'NDRRMC-PHIVOLCS-SMS',
        sent: '2026-06-08T07:37:40+08:00',
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        info: {
          event: 'Earthquake',
          urgency: 'Immediate',
          severity: 'Extreme',
          certainty: 'Observed',
          headline: 'Magnitude 7.8 Earthquake – Offshore Maasim, Sarangani Province',
          description: 'A magnitude 7.8 earthquake struck 32 km southwest of Maasim, Sarangani at 7:37 AM, depth 33 km. Tsunami waves possible along coastal areas of Sarangani, Davao Occidental, South Cotabato, Sultan Kudarat, Zamboanga del Sur, Zamboanga Sibugay, Basilan, Sulu, and Tawi-tawi. Move immediately to higher ground away from the coast. Expect strong aftershocks.',
          effective: '2026-06-08T07:37:40+08:00',
          area: [
            {
              areaDesc: 'Maasim, Sarangani Province',
              geocode: [{ valueName: 'PSGC', value: '1103806000' }],
            },
            {
              areaDesc: 'General Santos City, South Cotabato',
              geocode: [{ valueName: 'PSGC', value: '1105105000' }],
            },
          ],
        },
      },
    },
    {
      id: 'fire-binondo',
      name: '5th Alarm Fire (Binondo, Manila)',
      description: 'NDRRMC / BFP — Task Force Charlie fire, Del Pan Evacuation',
      payload: {
        identifier: 'SMS-PUSH-1748012580000',
        sender: 'NDRRMC-BFP-SMS',
        sent: '2026-05-23T15:03:00+08:00',
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        info: {
          event: 'Fire',
          urgency: 'Immediate',
          severity: 'Severe',
          certainty: 'Observed',
          headline: '5th Alarm Fire – Parola Compound, Gate 46, Delpan, Binondo, Manila',
          description: 'A fast-spreading fire raised to Task Force Charlie is affecting Parola Compound, San Nicolas, Binondo. Residents in the area must evacuate immediately to the Del Pan Evacuation Center. Avoid the vicinity to allow firefighting operations to proceed.',
          effective: '2026-05-23T15:03:00+08:00',
          area: [
            {
              areaDesc: 'San Nicolas, Binondo, City of Manila',
              geocode: [{ valueName: 'PSGC', value: '1339607000' }],
            },
          ],
        },
      },
    },
    {
      id: 'typhoon-maymay',
      name: 'TD Maymay Wind Signal',
      description: 'PAGASA TCWS — 50-100mm Heavy Rain & Landslide Warning',
      payload: {
        identifier: 'SMS-PUSH-1754460600000',
        sender: 'NDRRMC-PAGASA-SMS',
        sent: '2026-08-06T16:00:00+08:00',
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        info: {
          event: 'Typhoon',
          urgency: 'Expected',
          severity: 'Moderate',
          certainty: 'Likely',
          headline: 'Tropical Cyclone Wind Signal – Tropical Depression Maymay (Kujira)',
          description: 'Tropical Depression Maymay is moving over the Philippine Sea after crossing Northern Luzon. Moderate to heavy rain (50-100mm) expected over Ilocos Sur, La Union, Pangasinan, Benguet, Zambales, and Bataan. Residents in low-lying and mountainous areas are advised to watch for flooding and landslides.',
          effective: '2026-08-06T16:00:00+08:00',
          area: [
            {
              areaDesc: 'La Union Province',
              geocode: [{ valueName: 'PSGC', value: '0103300000' }],
            },
            {
              areaDesc: 'Pangasinan Province',
              geocode: [{ valueName: 'PSGC', value: '0155400000' }],
            },
          ],
        },
      },
    },
    {
      id: 'flood-habagat-dolphin',
      name: 'Habagat Flood Advisory (Typhoon Dolphin)',
      description: 'PAGASA Flood Advisory — Enhanced Monsoon Flooding across Luzon & Visayas',
      payload: {
        identifier: 'SMS-PUSH-1754802900000',
        sender: 'NDRRMC-PAGASA-SMS',
        sent: '2026-08-09T16:00:00+08:00',
        status: 'Actual',
        msgType: 'Alert',
        scope: 'Public',
        info: {
          event: 'Flood',
          urgency: 'Immediate',
          severity: 'Moderate',
          certainty: 'Observed',
          headline: 'Flood Advisory – Southwest Monsoon (Habagat) Enhanced by Typhoon Dolphin',
          description: 'The southwest monsoon, enhanced by the outer circulation of Typhoon Dolphin, is bringing rain over Luzon and Visayas. Flooding is possible in low-lying and flood-prone areas, especially along riverbanks. Residents in these areas are advised to monitor water levels and be ready to evacuate if necessary.',
          effective: '2026-08-09T16:00:00+08:00',
          area: [
            {
              areaDesc: 'Metro Manila (National Capital Region)',
              geocode: [{ valueName: 'PSGC', value: '1300000000' }],
            },
            {
              areaDesc: 'Western Visayas Region',
              geocode: [{ valueName: 'PSGC', value: '0600000000' }],
            },
          ],
        },
      },
    },
  ]
}
