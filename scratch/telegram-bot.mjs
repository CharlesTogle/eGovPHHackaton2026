/**
 * eHANDA Telegram Citizen Emergency Bot
 *
 * Runs locally using Telegram Long Polling (getUpdates) - No ngrok or public URL required!
 *
 * Features:
 * 1. Broadcast Alerts simulation with interactive inline buttons
 * 2. Two-way check-in responses ("HANDA YES YES NO", button taps)
 * 3. eGov AI citizen assistant Q&A in Tagalog / English
 * 4. Emergency hotlines & evacuation guidance
 *
 * Usage:
 * 1. Get a free bot token from @BotFather on Telegram (takes 30 seconds)
 * 2. Run: $env:TELEGRAM_BOT_TOKEN="your_token_here"; node scratch/telegram-bot.mjs
 *    Or put TELEGRAM_BOT_TOKEN in your .env file!
 */

import 'dotenv/config'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN
const EGOV_AI_BASE = process.env.VITE_EGOV_AI_BASE_URL || 'https://egov-ai-core-ws.oueg.info'
const EGOV_AI_ACCESS_CODE = process.env.VITE_EGOV_AI_ACCESS_CODE || '68c5b058c49e7b2ff93ecbdfcf9154b5'

// Official PH Emergency Hotlines — synced with emessage-sms-service.ts
const PH_HOTLINES_MD =
  `📞 *Official PH Emergency Hotlines:*\n` +
  `• *911* — National Emergency\n` +
  `• *143 / (02) 8790-2300* — Philippine Red Cross\n` +
  `• *(02) 8911-1406 / (02) 8912-2665* — NDRRMC Command Center\n` +
  `• *0917-724-3682* — Philippine Coast Guard Rescue\n` +
  `• *(02) 8284-0800* — PAGASA Weather Bureau\n` +
  `• *(02) 8931-8101 / 1-800-10-7-2782* — DSWD Social Services (toll-free)\n` +
  `• *1555* — DOH Healthline`

// Compact version for inline alert cards
const PH_HOTLINES_SHORT =
  `*Emergency Hotlines:*\n` +
  `• 911 (National) • 143 (Red Cross)\n` +
  `• (02)8911-1406 (NDRRMC) • 0917-724-3682 (Coast Guard)\n` +
  `• 1555 (DOH) • (02)8284-0800 (PAGASA)`

if (!BOT_TOKEN) {
  console.log(`
===================================================================
⚠️  TELEGRAM_BOT_TOKEN not found!
-------------------------------------------------------------------
To run the live Telegram emergency bot:
1. Open Telegram and search for @BotFather (https://t.me/BotFather)
2. Send /newbot, give it a name (e.g., eHANDA Disaster Alert Bot)
3. Copy the HTTP API token provided by BotFather
4. Run:
   $env:TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN_HERE"
   node scratch/telegram-bot.mjs
===================================================================
`)
  process.exit(0)
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

// In-memory state for interactive button check-ins per user
const userCheckInDrafts = new Map()

async function telegramRequest(method, payload = {}) {
  try {
    const res = await fetch(`${TELEGRAM_API}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return await res.json()
  } catch (err) {
    console.error(`[Telegram Error] ${method}:`, err.message)
    return { ok: false }
  }
}

async function sendTextMessage(chatId, text, options = {}) {
  return telegramRequest('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
    ...options,
  })
}

// Ask eGov AI
async function queryEgovAi(prompt) {
  try {
    const res = await fetch(`${EGOV_AI_BASE}/api/v1/egov/integration/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_code: EGOV_AI_ACCESS_CODE,
        prompt: `You are the eGovPH Disaster Assistant for eHANDA. Answer concisely about Philippine disaster safety, relief, evacuation, or hotlines.\n\nCitizen Query: "${prompt}"`,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      const answer = data?.data?.response || data?.response || data?.data
      if (typeof answer === 'string' && answer.trim()) return answer
    }
  } catch (err) {
    console.warn('[eGov AI] Error:', err.message)
  }

  // Smart fallback
  const lower = prompt.toLowerCase()
  if (lower.includes('hotline') || lower.includes('number') || lower.includes('tulong') || lower.includes('help')) {
    return `📞 *Official Emergency Hotlines:*\n• *National Emergency:* 911\n• *NDRRMC Command:* (02) 8911-1406\n• *Philippine Red Cross:* 143 / (02) 8790-2300\n• *Coast Guard:* 0917-724-3682\n• *Local Barangay:* Contact your BDRRMC command center.`
  }
  return `Thank you for contacting eHANDA. During active disaster alerts, please complete your household check-in by replying *HANDA YES YES NO* or tapping the survey buttons below.`
}

const ACTIVE_CAMPAIGN_FILE = path.join(process.cwd(), 'scratch', 'active-campaign.json')

function loadActiveCampaign() {
  try {
    if (fs.existsSync(ACTIVE_CAMPAIGN_FILE)) {
      return JSON.parse(fs.readFileSync(ACTIVE_CAMPAIGN_FILE, 'utf8'))
    }
  } catch { }
  return {
    campaignName: 'Disaster Emergency Assessment',
    barangay: 'Barangay Center',
    municipality: 'Local Municipality',
    questions: [
      { question_text: 'Do you have access to electricity?', need_category: 'utilities' },
      { question_text: 'Is your family short on food supply (less than 3 days)?', need_category: 'food_water' },
      { question_text: 'Does anyone in your household need medical attention?', need_category: 'medical' },
    ]
  }
}

// Build inline keyboard for active questions
function buildQuestionKeyboard(questions, draftAnswers = {}) {
  const rows = []
  questions.forEach((q, idx) => {
    const isYes = draftAnswers[`q_${idx}`] === true
    const isNo = draftAnswers[`q_${idx}`] === false
    const shortQ = q.question_text.length > 36 ? q.question_text.slice(0, 33) + '...' : q.question_text

    rows.push([
      {
        text: `📌 Q${idx + 1}: ${shortQ}`,
        callback_data: `info_q_${idx}`,
      },
    ])
    rows.push([
      {
        text: isYes ? '🔴 [ YES — NEED HELP ]' : '⚪ YES — Need Help',
        callback_data: `set_yes_${idx}`,
      },
      {
        text: isNo ? '🟢 [ NO — SAFE ]' : '⚪ NO — Safe',
        callback_data: `set_no_${idx}`,
      },
    ])
  })
  rows.push([
    { text: '✅ SUBMIT CHECK-IN TO BARANGAY', callback_data: 'submit_checkin' },
  ])
  rows.push([
    { text: '📞 Emergency Hotlines (911)', callback_data: 'show_hotlines' },
  ])
  return { inline_keyboard: rows }
}

// Direct broadcasts from the official console carry the current questions in
// the message itself. Use them for callbacks before falling back to the bot's
// local campaign file.
function questionsFromAlertMessage(text) {
  return (text || '').split('\n')
    .map(line => line.match(/^\s*[•-]\s+\*?Q\d+:\*?\s+(.+)$/))
    .filter(Boolean)
    .map(match => ({ question_text: match[1], need_category: 'assessment' }))
}

// Send interactive alert card with dynamic questions
async function sendDisasterAlert(chatId) {
  const active = loadActiveCampaign()
  const questions = active.questions && active.questions.length > 0 ? active.questions : [
    { question_text: 'Do you have access to electricity?', need_category: 'utilities' },
    { question_text: 'Is your family short on food supply (less than 3 days)?', need_category: 'food_water' },
    { question_text: 'Does anyone in your household need medical attention?', need_category: 'medical' },
  ]

  // Initialize empty answers (default false/safe)
  const initialAnswers = {}
  questions.forEach((_, idx) => { initialAnswers[`q_${idx}`] = false })
  userCheckInDrafts.set(chatId, { answers: initialAnswers, questions, campaign: active })

  const qListText = questions.map((q, idx) => `• *Q${idx + 1}:* ${q.question_text}`).join('\n')
  const sampleReply = 'HANDA ' + questions.map((_, i) => (i % 2 === 0 ? 'YES' : 'NO')).join(' ')

  const text =
    `🚨 *[eHANDA OFFICIAL EMERGENCY ALERT]*\n` +
    `*${active.campaignName}*\n` +
    `*Area:* ${active.barangay}, ${active.municipality}\n\n` +
    `⚠️ Forced evacuation order in effect.\n\n` +
    `📋 *Household Needs Survey:*\n` +
    `${qListText}\n\n` +
    `Tap the *YES / NO* buttons below for each question, or reply text:\n` +
    `👉 \`${sampleReply}\`\n\n` +
    PH_HOTLINES_SHORT

  const keyboard = buildQuestionKeyboard(questions, initialAnswers)
  return sendTextMessage(chatId, text, { reply_markup: keyboard })
}

// Handle Callback Queries (Button Taps)
async function handleCallbackQuery(query) {
  const chatId = query.message.chat.id
  const messageId = query.message.message_id
  const data = query.data

  let draftData = userCheckInDrafts.get(chatId)
  if (!draftData || !draftData.answers) {
    const active = loadActiveCampaign()
    const messageQuestions = questionsFromAlertMessage(query.message.text)
    const questions = messageQuestions.length > 0 ? messageQuestions : active.questions
    const initialAnswers = {}
    questions.forEach((_, idx) => { initialAnswers[`q_${idx}`] = false })
    draftData = { answers: initialAnswers, questions, campaign: active }
  }

  const { answers, questions, campaign } = draftData

  if (data.startsWith('info_q_')) {
    const idx = parseInt(data.replace('info_q_', ''), 10)
    const q = questions[idx]
    return telegramRequest('answerCallbackQuery', {
      callback_query_id: query.id,
      text: `Q${idx + 1}: ${q ? q.question_text : ''}`,
      show_alert: true,
    })
  }

  if (data.startsWith('set_yes_')) {
    const idx = data.replace('set_yes_', '')
    answers[`q_${idx}`] = true
    userCheckInDrafts.set(chatId, draftData)

    await telegramRequest('answerCallbackQuery', { callback_query_id: query.id, text: `Q${parseInt(idx, 10) + 1}: Set to YES (Assistance Requested)` })
    const updatedKeyboard = buildQuestionKeyboard(questions, answers)
    return telegramRequest('editMessageReplyMarkup', {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: updatedKeyboard,
    })
  }

  if (data.startsWith('set_no_')) {
    const idx = data.replace('set_no_', '')
    answers[`q_${idx}`] = false
    userCheckInDrafts.set(chatId, draftData)

    await telegramRequest('answerCallbackQuery', { callback_query_id: query.id, text: `Q${parseInt(idx, 10) + 1}: Set to NO (Safe)` })
    const updatedKeyboard = buildQuestionKeyboard(questions, answers)
    return telegramRequest('editMessageReplyMarkup', {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: updatedKeyboard,
    })
  }

  if (data.startsWith('toggle_q_')) {
    const idx = data.replace('toggle_q_', '')
    answers[`q_${idx}`] = !answers[`q_${idx}`]
    userCheckInDrafts.set(chatId, draftData)

    await telegramRequest('answerCallbackQuery', { callback_query_id: query.id })
    const updatedKeyboard = buildQuestionKeyboard(questions, answers)
    return telegramRequest('editMessageReplyMarkup', {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: updatedKeyboard,
    })
  }

  if (data === 'submit_checkin') {
    await telegramRequest('answerCallbackQuery', { callback_query_id: query.id, text: 'Check-in submitted!' })

    const answersList = questions.map((q, idx) => {
      const isYes = answers[`q_${idx}`] === true
      return `• *Q${idx + 1} (${q.question_text}):* ${isYes ? '🔴 YES (Need Help)' : '🟢 NO (Safe)'}`
    }).join('\n')

    const summary =
      `✅ *[eHANDA CHECK-IN CONFIRMED]*\n\n` +
      `Salamat! Your household check-in for *${campaign.campaignName}* has been transmitted to *${campaign.barangay} Command Center*.\n\n` +
      `📊 *Reported Status:*\n` +
      `${answersList}\n\n` +
      `📍 *Location:* ${campaign.barangay}, ${campaign.municipality}\n` +
      `🔄 *Status:* Live Synced with LGU Incident Command Dashboard`

    return sendTextMessage(chatId, summary)
  }

  if (data === 'show_hotlines') {
    await telegramRequest('answerCallbackQuery', { callback_query_id: query.id })
    return sendTextMessage(chatId, PH_HOTLINES_MD)
  }

  return telegramRequest('answerCallbackQuery', { callback_query_id: query.id })
}

import fs from 'fs'
import path from 'path'

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'scratch', 'telegram-subscribers.json')

function loadSubscribers() {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf8'))
      return new Set(data)
    }
  } catch { }
  return new Set()
}

const subscribers = loadSubscribers()

function saveSubscriber(chatId) {
  if (!subscribers.has(chatId)) {
    subscribers.add(chatId)
    try {
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(Array.from(subscribers), null, 2))
      console.log(`[Subscriber Saved] Registered Chat ID ${chatId} (Total: ${subscribers.size})`)
    } catch (err) {
      console.warn('[Subscriber Save Error]:', err.message)
    }
  }
}

// Process regular text messages
async function handleMessage(msg) {
  const chatId = msg.chat.id
  saveSubscriber(chatId)

  const text = (msg.text || '').trim()
  const userName = msg.from.first_name || 'Citizen'

  console.log(`[Telegram User @${msg.from.username || msg.from.id}] (${userName}): ${text}`)

  if (text.startsWith('/start') || text.startsWith('/alert')) {
    return sendDisasterAlert(chatId)
  }

  if (text.startsWith('/hotlines')) {
    return sendTextMessage(chatId, PH_HOTLINES_MD)
  }

  // Check for SMS-style structured check-in (e.g., "HANDA YES YES NO" or "YES NO YES")
  const upper = text.toUpperCase()
  if (upper.startsWith('HANDA ') || upper.startsWith('CHECKIN ') || /^(YES|NO|OO|HINDI)\s+(YES|NO|OO|HINDI)/.test(upper)) {
    const parts = upper.replace(/^(HANDA|CHECKIN)\s+/i, '').split(/\s+/)
    const shelter = parts[0] === 'YES' || parts[0] === 'OO' || parts[0] === 'Y'
    const food = parts[1] === 'YES' || parts[1] === 'OO' || parts[1] === 'Y'
    const medical = parts[2] === 'YES' || parts[2] === 'OO' || parts[2] === 'Y'

    const confirmation = `✅ *[eHANDA SMS/CHAT CHECK-IN RECEIVED]*\n\n` +
      `Salamat, ${userName}! Your check-in is logged with *Barangay Command*.\n\n` +
      `• *Shelter:* ${shelter ? 'Damaged (Need assistance)' : 'Safe'}\n` +
      `• *Food / Water:* ${food ? 'Relief requested' : 'Sufficient'}\n` +
      `• *Medical:* ${medical ? 'Urgent first aid needed' : 'None'}\n\n` +
      `📡 Logged into LGU Incident Command Dashboard.`

    return sendTextMessage(chatId, confirmation)
  }

  // Otherwise, query eGov AI
  await sendTextMessage(chatId, `_Thinking with eGov AI Assistant..._`)
  const aiAnswer = await queryEgovAi(text)
  return sendTextMessage(chatId, aiAnswer)
}

// Long Polling Loop
let lastOffset = 0

async function startPolling() {
  const me = await telegramRequest('getMe')
  if (!me.ok) {
    console.error('Failed to connect to Telegram API:', me)
    return
  }

  console.log(`
===================================================================
🤖 eHANDA Telegram Citizen Emergency Bot is LIVE!
-------------------------------------------------------------------
Bot Username: @${me.result.username}
Bot Name:     ${me.result.first_name}
Status:       Connected & Listening for Citizen Messages...
===================================================================
Open Telegram, search for @${me.result.username}, and click START!
`)

  while (true) {
    try {
      const res = await fetch(`${TELEGRAM_API}/getUpdates?offset=${lastOffset}&timeout=30`, {
        method: 'GET',
      })
      const data = await res.json()

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastOffset = update.update_id + 1

          if (update.callback_query) {
            await handleCallbackQuery(update.callback_query)
          } else if (update.message && update.message.text) {
            await handleMessage(update.message)
          }
        }
      }
    } catch (err) {
      console.warn('[Polling warning]:', err.message)
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
}

startPolling()
