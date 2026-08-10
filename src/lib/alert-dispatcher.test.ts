import { describe, expect, it } from 'vitest'
import {
  buildSmsAlertMessage,
  buildTelegramAlertMessage,
  buildTelegramKeyboard,
  resolveNotificationLocation,
} from './alert-dispatcher'

const payload = {
  campaignName: 'Flood Response Assessment',
  disaster: 'Flood',
  signalLevel: 'Assessment published 2026-06-08',
  barangay: 'Poblacion',
  municipality: 'Alaminos City',
  questions: [
    { question_text: 'Is your home flooded?', need_category: 'shelter' },
    { question_text: 'Do you need drinking water?', need_category: 'food_water' },
  ],
}

describe('alert publish payloads', () => {
  it('resolves known PSGC codes to the matching barangay and city', () => {
    expect(resolveNotificationLocation('0105503021', '0105503000')).toEqual('Poblacion, City Of Alaminos')
  })

  it('does not display an unknown barangay name when only the city is known', () => {
    expect(resolveNotificationLocation('unknown-barangay', '0105503000')).toEqual('City Of Alaminos')
  })

  it('includes the published assessment questions in the SMS message', () => {
    const message = buildSmsAlertMessage(payload)

    expect(message).toContain('Area: Poblacion, City Of Alaminos')
    expect(message).toContain('Flood Response Assessment — Assessment published Jun 8, 2026')
    expect(message).toContain('Evacuation order active.')
    expect(message).toContain('*Barangay Desk: 0917-724-3682 / (02) 8911-1406')
    expect(message).not.toContain('Q1: Is your home flooded?')
    expect(message).not.toContain('HANDA YES NO')
  })

  it('includes the published assessment questions in the Telegram message', () => {
    const message = buildTelegramAlertMessage(payload)

    expect(message).toContain('Area:* Poblacion, City Of Alaminos')
    expect(message).toContain('Q1: Is your home flooded?')
    expect(message).toContain('Q2: Do you need drinking water?')
    expect(message).toContain('HANDA YES NO')
    expect(message).toContain('Evacuation order active.')
    expect(message).toContain('internet/wifi constraints')
  })

  it('creates Telegram controls for every published question', () => {
    const keyboard = buildTelegramKeyboard(payload.questions)
    const callbackData = keyboard.inline_keyboard.flat().map(button => button.callback_data)

    expect(callbackData).toContain('set_yes_0')
    expect(callbackData).toContain('set_no_0')
    expect(callbackData).toContain('set_yes_1')
    expect(callbackData).toContain('set_no_1')
    expect(callbackData).toContain('submit_checkin')
  })
})
