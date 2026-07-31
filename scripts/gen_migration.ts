import fs from 'fs'
import { DEMO_CHECK_INS, DEMO_ANSWERS } from '../src/features/demo/historical-demo-data.js'

function fixUuid(uuidStr: string): string {
  const parts = uuidStr.split('-')
  if (parts.length === 5 && parts[4].length !== 12) {
    parts[4] = parts[4].padStart(12, '0')
  }
  return parts.join('-')
}

let sql = '-- Migration: Seed 336 Resident Check-Ins and 1008 Answers into Supabase DB\n\n'

sql += 'insert into check_ins (id, campaign_id, name, submitted_by, status, created_at, updated_at)\nvalues\n'
sql += DEMO_CHECK_INS.map(c => `  ('${fixUuid(c.id)}', '${fixUuid(c.campaign_id)}', '${c.name.replace(/'/g, "''")}', '${c.submitted_by.replace(/'/g, "''")}', '${c.status}', '${c.created_at}', '${c.updated_at}')`).join(',\n')
sql += '\non conflict (id) do nothing;\n\n'

sql += 'insert into check_in_answers (id, check_in_id, question_id, answer)\nvalues\n'
sql += DEMO_ANSWERS.map(a => `  ('${fixUuid(a.id)}', '${fixUuid(a.check_in_id)}', '${fixUuid(a.question_id)}', '${a.answer}')`).join(',\n')
sql += '\non conflict (id) do nothing;\n'

fs.writeFileSync('supabase/migrations/20260801000001_seed_336_checkins.sql', sql)
console.log('Migration regenerated with valid 36-character UUIDs!')
