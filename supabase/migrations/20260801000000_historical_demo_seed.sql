-- Migration: Historical Demo Data Seed & RLS Policies
-- Date: 2026-08-01

-- 1. Disable RLS on public demo tables so frontend client can read & write
alter table campaigns disable row level security;
alter table campaign_questions disable row level security;
alter table check_ins disable row level security;
alter table check_in_answers disable row level security;
alter table alerts disable row level security;

-- 2. Insert Historical Disaster Campaigns
insert into campaigns (id, name, disaster_type, disaster_date, status, created_by, barangay_code, ai_generated, created_at, updated_at)
values
  ('a1000000-0000-0000-0000-000000000001', 'Typhoon Yolanda Rapid Assessment', 'Typhoon', '2013-11-08', 'active', 'OFC_TACLOBAN_001', '0803747001', false, '2026-07-31T00:00:00.000Z', '2026-07-31T00:00:00.000Z'),
  ('a1000000-0000-0000-0000-000000000002', 'Sendong Flood Household Assessment', 'Flood', '2011-12-17', 'closed', 'OFC_CDO_001', '1004305001', false, '2026-07-31T00:00:00.000Z', '2026-07-31T00:00:00.000Z'),
  ('a1000000-0000-0000-0000-000000000003', 'Bohol Earthquake Structural Assessment', 'Earthquake', '2013-10-15', 'closed', 'OFC_BOHOL_001', '070120000101', false, '2026-07-31T00:00:00.000Z', '2026-07-31T00:00:00.000Z')
on conflict (id) do update set
  name = excluded.name,
  disaster_type = excluded.disaster_type,
  disaster_date = excluded.disaster_date,
  status = excluded.status,
  created_by = excluded.created_by,
  barangay_code = excluded.barangay_code;

-- 3. Insert RDANA Question Sets
insert into campaign_questions (id, campaign_id, question_text, need_category, display_order)
values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Is your home heavily damaged or unsafe to occupy?', 'Shelter', 0),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Does your household need food or clean drinking water?', 'Food or water', 1),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Does anyone in your household need medical attention?', 'Medical', 2),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Did floodwater enter your home or force evacuation?', 'Shelter', 0),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Does your household need hygiene kits or safe drinking water?', 'WASH', 1),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Do you need evacuation transport or rescue assistance?', 'Evacuation', 2),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 'Did the earthquake cause structural cracks or collapse in your home?', 'Shelter', 0),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'Does anyone in your household need urgent medical or first aid support?', 'Medical', 1),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000003', 'Do you need electricity, lighting, or generator support?', 'Utilities', 2)
on conflict (id) do update set
  question_text = excluded.question_text,
  need_category = excluded.need_category,
  display_order = excluded.display_order;
