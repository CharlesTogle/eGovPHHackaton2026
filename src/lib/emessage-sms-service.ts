export type DynamicQuestionItem = {
  question_text: string
  need_category?: string
}

export type SmsPushResult = {
  success: boolean
  status: number
  error?: string
}

export const SMS_HOTLINES_BLOCK =
  'EMG HOTLINES:\n' +
  '*911 (National)\n' +
  '*143 (Red Cross)\n' +
  '*(02)8911-1406 (NDRRMC)\n' +
  '*0917-724-3682 (Coast Guard)\n' +
  '*1555 (DOH Healthline)'

const EMESSAGE_BASE_URL = import.meta.env.VITE_EMESSAGE_INTEGRATION_BASE_URL || 'https://ws-message.e.gov.ph'
const EMESSAGE_TOKEN = import.meta.env.VITE_EMESSAGE_ACCESS_TOKEN || ''

export function normalizeToE164(input: string): string | null {
  const cleaned = input.replace(/[\s\-()]/g, '')
  if (/^\+63\d{10}$/.test(cleaned)) return cleaned
  if (/^63\d{10}$/.test(cleaned)) return `+${cleaned}`
  if (/^0\d{10}$/.test(cleaned)) return `+63${cleaned.slice(1)}`
  if (/^9\d{9}$/.test(cleaned)) return `+63${cleaned}`
  return null
}

export async function sendSms(number: string, message: string): Promise<SmsPushResult> {
  if (!EMESSAGE_TOKEN) {
    return { success: false, status: 0, error: 'eGov eSMS access token is not configured.' }
  }

  const normalized = normalizeToE164(number)
  if (!normalized) {
    return { success: false, status: 422, error: `Invalid Philippine mobile number: ${number}` }
  }

  try {
    const response = await fetch(`${EMESSAGE_BASE_URL}/messaging/v1/sms/push`, {
      method: 'POST',
      headers: {
        'X-EMESSAGE-Auth': EMESSAGE_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ number: normalized, message }),
    })

    if (response.status === 201) return { success: true, status: response.status }
    return {
      success: false,
      status: response.status,
      error: `eGov eSMS returned HTTP ${response.status}: ${await response.text()}`,
    }
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: `eGov eSMS request failed: ${error instanceof Error ? error.message : 'network error'}`,
    }
  }
}

export async function broadcastSms(
  recipients: string[],
  message: string,
): Promise<{ sent: number; failed: number; errors: string[] }> {
  let sent = 0
  let failed = 0
  const errors: string[] = []

  for (const recipient of recipients) {
    const result = await sendSms(recipient, message)
    if (result.success) sent++
    else {
      failed++
      if (result.error) errors.push(result.error)
    }
  }

  return { sent, failed, errors }
}
