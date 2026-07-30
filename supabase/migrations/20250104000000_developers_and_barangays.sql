create table barangays (
  code text primary key,
  name text not null
);

insert into barangays (code, name) values
  ('0105503021', 'Poblacion, Alaminos, Pangasinan'),
  ('042111011', 'Toclong, Kawit, Cavite'),
  ('042111001', 'Binakayan-Kanluran, Kawit, Cavite'),
  ('042111006', 'Poblacion, Kawit, Cavite'),
  ('042111013', 'Batong Dalig, Kawit, Cavite');

create table developers (
  id uuid primary key default gen_random_uuid(),
  uniqid text not null unique,
  name text not null,
  email text not null,
  organization text not null,
  barangay_code text not null,
  created_at timestamptz not null default now()
);

create table api_keys (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  developer_id uuid not null references developers(id) on delete cascade,
  barangay_code text not null,
  created_at timestamptz not null default now()
);

insert into developers (id, uniqid, name, email, organization, barangay_code) values
  ('e0000000-0000-0000-0000-000000000001', 'DEV_CITYAPP_001', 'Dev User', 'dev@cityapp.ph', 'CityApp Solutions', '0105503021'),
  ('e0000000-0000-0000-0000-000000000002', 'DEV_KAWIT_001', 'Kawit Dev', 'dev@kawit.ph', 'Kawit LGU Tech', '042111011');

insert into api_keys (id, key, developer_id, barangay_code) values
  ('f0000000-0000-0000-0000-000000000001', 'hnd_sk_demo_alaminos_poblacion', 'e0000000-0000-0000-0000-000000000001', '0105503021'),
  ('f0000000-0000-0000-0000-000000000002', 'hnd_sk_demo_kawit_toclong', 'e0000000-0000-0000-0000-000000000002', '042111011');

insert into officials (uniqid, barangay_code, role) values
  ('OFC_TOCLONG_001', '042111011', 'official'),
  ('OFC_BINAKAYAN_001', '042111001', 'official')
on conflict (uniqid) do nothing;

insert into campaigns (id, name, disaster_type, disaster_date, status, created_by, barangay_code) values
  ('a0000000-0000-0000-0000-000000000002', 'Typhoon Paeng Response', 'Typhoon', '2025-01-20', 'active', 'OFC_TOCLONG_001', '042111011'),
  ('a0000000-0000-0000-0000-000000000003', 'Flooding Incident', 'Flood', '2025-01-10', 'draft', 'OFC_BINAKAYAN_001', '042111001'),
  ('a0000000-0000-0000-0000-000000000004', 'Fire Incident Brgy Poblacion', 'Fire', '2025-01-18', 'closed', 'OFC_BINAKAYAN_001', '042111006')
on conflict (id) do nothing;

insert into campaign_questions (id, campaign_id, question_text, need_category, display_order) values
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Is your home damaged?', 'Shelter', 0),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'Do you need food or water?', 'Food or water', 1),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'Do you need medical attention?', 'Medical', 2),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 'Is your house flooded?', 'Shelter', 0),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000003', 'Do you need drinking water?', 'Food or water', 1)
on conflict (id) do nothing;

insert into check_ins (id, campaign_id, name, submitted_by, status) values
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Ana Reyes', 'Ana Reyes', 'unresolved'),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Ben Torres', 'Ben Torres', 'visited'),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'Carla Mendoza', 'Carla Mendoza', 'resolved')
on conflict (id) do nothing;

insert into check_in_answers (id, check_in_id, question_id, answer) values
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'yes'),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', 'yes'),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000006', 'no'),
  ('d0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'no'),
  ('d0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005', 'yes'),
  ('d0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'no')
on conflict (id) do nothing;

create index idx_developers_uniqid on developers (uniqid);
create index idx_api_keys_developer on api_keys (developer_id);
create index idx_api_keys_key on api_keys (key);
