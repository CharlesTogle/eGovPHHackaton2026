import type { SmsReport } from './types'

export async function parseSmsReport(smsText: string): Promise<SmsReport | null> {
  const apiKey = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GEMINI_API_KEY)
    || (typeof process !== 'undefined' && process?.env?.VITE_GEMINI_API_KEY)
    || (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_EGOV_AI_ACCESS_CODE)
    || (typeof process !== 'undefined' && process?.env?.VITE_EGOV_AI_ACCESS_CODE)
    || ''

  if (!apiKey) {
    console.warn('[SMS Parser] No API key found. Falling back to simple heuristic parsing.')
    return heuristicSmsParse(smsText)
  }

  try {
    const prompt = `You are an AI assistant for the Philippine eHanda disaster response system.

CONTEXT:
We received an incoming SMS report from a citizen during a disaster. 
We need to parse this SMS and extract structured information based on the Official 5-Section RDANA Structure.

OFFICIAL 5-SECTION RDANA STRUCTURE:
- SECTION I: General Disaster Profile & Geographic Location
- SECTION II: Human Impact & Displaced Population
- SECTION III: Lifelines, Infrastructure & Critical Facilities Status
- SECTION IV: Sectoral Damage & Urgent Humanitarian Needs Clusters
- SECTION V: Local Response Capacity & Recommended Augmentation Requests

SMS TEXT:
"${smsText}"

TASK:
Extract the following information from the SMS text:
1. location: The geographic location mentioned in the SMS (e.g. Barangay name, street, landmarks). If not specified, return "Unknown".
2. sender_name: The name of the sender if mentioned, else "Anonymous".
3. extracted_needs: A list of specific needs or damages mentioned (e.g. "Food", "Rescue", "Roof destroyed").
4. urgency: "High" (life-threatening), "Medium" (property damage, urgent needs), or "Low" (info only).
5. rdana_section: The most relevant RDANA section (e.g. "SECTION II", "SECTION III", "SECTION IV").

Return ONLY a JSON object with fields: location, sender_name, extracted_needs (array of strings), urgency, rdana_section.
Example:
{
  "location": "Purok 4, Barangay San Jose",
  "sender_name": "Juan",
  "extracted_needs": ["Rescue", "Food"],
  "urgency": "High",
  "rdana_section": "SECTION IV"
}`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!res.ok) {
      console.warn('[SMS Parser] API error, falling back to heuristic parsing', res.status)
      return heuristicSmsParse(smsText)
    }

    const json = await res.json() as any
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return heuristicSmsParse(smsText)

    const parsed = JSON.parse(text)
    
    return {
      id: 'sms-' + Math.random().toString(36).substring(2, 9),
      original_sms: smsText,
      location: parsed.location || 'Unknown',
      sender_name: parsed.sender_name || 'Anonymous',
      extracted_needs: Array.isArray(parsed.extracted_needs) ? parsed.extracted_needs : [],
      urgency: parsed.urgency || 'Medium',
      rdana_section: parsed.rdana_section || 'SECTION IV',
      status: 'pending_review',
      timestamp: new Date().toISOString()
    }
  } catch (err) {
    console.error('[SMS Parser] Error parsing SMS', err)
    return heuristicSmsParse(smsText)
  }
}

function heuristicSmsParse(smsText: string): SmsReport {
  const lower = smsText.toLowerCase()
  let urgency: 'High' | 'Medium' | 'Low' = 'Low'
  if (lower.includes('help') || lower.includes('rescue') || lower.includes('emergency') || lower.includes('trapped')) {
    urgency = 'High'
  } else if (lower.includes('need') || lower.includes('food') || lower.includes('water') || lower.includes('destroyed')) {
    urgency = 'Medium'
  }

  let rdana_section = 'SECTION IV'
  if (lower.includes('road') || lower.includes('bridge') || lower.includes('power') || lower.includes('signal')) {
    rdana_section = 'SECTION III'
  } else if (lower.includes('injured') || lower.includes('dead')) {
    rdana_section = 'SECTION II'
  }

  let location = 'Unknown'
  const locMatch = lower.match(/(?:at|in|sa)\s+([^,.]+)/i)
  if (locMatch && locMatch[1]) {
    location = locMatch[1].trim()
    location = location.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  return {
    id: 'sms-' + Math.random().toString(36).substring(2, 9),
    original_sms: smsText,
    location,
    sender_name: 'Anonymous',
    extracted_needs: ['Manual review required'],
    urgency,
    rdana_section,
    status: 'pending_review',
    timestamp: new Date().toISOString()
  }
}
