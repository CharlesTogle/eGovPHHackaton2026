import { supabase } from './supabase'
import { broadcastSms, SMS_HOTLINES_BLOCK, type DynamicQuestionItem } from './emessage-sms-service'
import { lookupNotificationLocation } from './psa-fallback-data'

export type AlertDispatchPayload = {
  campaignName: string
  disaster: string
  signalLevel: string
  barangay: string
  municipality: string
  questions: DynamicQuestionItem[]
  smsRecipients?: string[]
  telegramChatIds?: number[]
}

export type TelegramButton = { text: string; callback_data: string }
export type TelegramKeyboard = { inline_keyboard: TelegramButton[][] }

export type ChannelResult = {
  channel: 'sms' | 'telegram'
  success: boolean
  sent: number
  failed: number
  errors?: string[]
}

export type DispatchResult = { results: ChannelResult[] }

/** Default chat IDs — also kept in TELEGRAM_CHAT_IDS Edge Function secret for override. */
const DEFAULT_TELEGRAM_CHAT_IDS = [8619550367]

export function resolveNotificationLocation(barangay: string, municipality: string): string {
  return lookupNotificationLocation(barangay, municipality)
}

function questionReplyPattern(questions: DynamicQuestionItem[]): string {
  return questions.map((_, index) => (index % 2 === 0 ? 'YES' : 'NO')).join(' ')
}

function formatSignalLevel(signalLevel: string): string {
  const dateMatch = signalLevel.match(/^Assessment published (\d{4})-(\d{2})-(\d{2})$/)
  if (!dateMatch) return signalLevel

  const [, year, month, day] = dateMatch
  return `Assessment published ${new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`
}

export function buildSmsAlertMessage(payload: Pick<AlertDispatchPayload, 'campaignName' | 'disaster' | 'signalLevel' | 'barangay' | 'municipality' | 'questions'>): string {
  const location = resolveNotificationLocation(payload.barangay, payload.municipality)

  return `[eHANDA OFFICIAL EMERGENCY ALERT]\n` +
    `${payload.campaignName} — ${formatSignalLevel(payload.signalLevel)}\n` +
    `Area: ${location}\n\n` +
    `Evacuation order active. If not able to answer via app/telegram due to internet/wifi constraints, send a text to the specified contact unit to have a deployed LGU unit come to your aid and do an offline registration for extensive relief recording:\n\n` +
    `*Barangay Desk: 0917-724-3682 / (02) 8911-1406\n\n` +
    SMS_HOTLINES_BLOCK
}

export function buildTelegramAlertMessage(payload: Pick<AlertDispatchPayload, 'campaignName' | 'disaster' | 'signalLevel' | 'barangay' | 'municipality' | 'questions'>): string {
  const location = resolveNotificationLocation(payload.barangay, payload.municipality)
  const questions = payload.questions.length > 0
    ? payload.questions.map((question, index) => `• Q${index + 1}: ${question.question_text}`).join('\n')
    : '• No assessment questions configured.'

  return `🚨 *[eHANDA OFFICIAL EMERGENCY ALERT]*\n` +
    `*${payload.campaignName} — ${formatSignalLevel(payload.signalLevel)}*\n` +
    `*Area:* ${location}\n\n` +
    `Evacuation order active. If you cannot answer via the app or Telegram because of internet/wifi constraints, send a text to the specified contact unit so a deployed LGU unit can reach your location, provide aid, and record your assessment offline for proper manual follow-up.\n\n` +
    `📋 *Household Needs Survey:*\n${questions}\n\n` +
    `Reply: \`HANDA ${questionReplyPattern(payload.questions)}\`\n` +
    `Or tap the YES / NO buttons below to submit your assessment.\n\n` +
    `📞 *Official Emergency Hotlines:*\n` +
    `• *911* (National) • *143* (Red Cross)\n` +
    `• *(02) 8911-1406* (NDRRMC) • *0917-724-3682* (Coast Guard)`
}

export function buildTelegramKeyboard(questions: DynamicQuestionItem[]): TelegramKeyboard {
  const rows: TelegramButton[][] = []

  questions.forEach((question, index) => {
    const shortText = question.question_text.length > 36
      ? `${question.question_text.slice(0, 33)}...`
      : question.question_text
    rows.push([{ text: `📌 Q${index + 1}: ${shortText}`, callback_data: `info_q_${index}` }])
    rows.push([
      { text: '⚪ YES — Need Help', callback_data: `set_yes_${index}` },
      { text: '🟢 NO — Safe', callback_data: `set_no_${index}` },
    ])
  })

  rows.push([{ text: '✅ SUBMIT CHECK-IN TO BARANGAY', callback_data: 'submit_checkin' }])
  rows.push([{ text: '📞 Emergency Hotlines (911)', callback_data: 'show_hotlines' }])
  return { inline_keyboard: rows }
}

function getSmsRecipients(explicitRecipients?: string[]): string[] {
  if (explicitRecipients?.length) return explicitRecipients
  const configured = import.meta.env.VITE_EMESSAGE_SMS_RECIPIENTS
  return configured ? configured.split(',').map((v: string) => v.trim()).filter(Boolean) : ['+639702045579']
}

function getTelegramChatIds(explicitChatIds?: number[]): number[] {
  if (explicitChatIds?.length) return explicitChatIds
  return DEFAULT_TELEGRAM_CHAT_IDS
}

/**
 * Send a Telegram message via Supabase Edge Function proxy.
 * TELEGRAM_BOT_TOKEN is read from Deno.env — never exposed to the browser.
 */
async function sendTelegram(chatId: number, message: string, replyMarkup: TelegramKeyboard): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase client not initialised.' }

  try {
    const { data, error } = await supabase.functions.invoke('egov', {
      body: {
        action: 'send-telegram',
        payload: { chat_id: chatId, text: message, parse_mode: 'Markdown', reply_markup: replyMarkup },
      },
    })

    if (error) return { success: false, error: error.message ?? 'Edge Function error' }
    const result = data as { success?: boolean; error?: string }
    return { success: result.success ?? false, error: result.error }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Telegram network error' }
  }
}

export async function dispatchAlert(payload: AlertDispatchPayload): Promise<DispatchResult> {
  const smsMessage = buildSmsAlertMessage(payload)
  const sms = await broadcastSms(getSmsRecipients(payload.smsRecipients), smsMessage)

  const telegramMessage = buildTelegramAlertMessage(payload)
  const keyboard = buildTelegramKeyboard(payload.questions)
  const telegramErrors: string[] = []
  let telegramSent = 0
  let telegramFailed = 0

  for (const chatId of getTelegramChatIds(payload.telegramChatIds)) {
    const result = await sendTelegram(chatId, telegramMessage, keyboard)
    if (result.success) telegramSent++
    else {
      telegramFailed++
      if (result.error) telegramErrors.push(result.error)
    }
  }

  // Keep a concise trace in the browser console for the official operator.
  console.info('[eHANDA] Published assessment notification results', {
    sms: { sent: sms.sent, failed: sms.failed },
    telegram: { sent: telegramSent, failed: telegramFailed },
  })

  return {
    results: [
      { channel: 'sms', success: sms.sent > 0, sent: sms.sent, failed: sms.failed, errors: sms.errors },
      { channel: 'telegram', success: telegramSent > 0, sent: telegramSent, failed: telegramFailed, errors: telegramErrors },
    ],
  }
}
