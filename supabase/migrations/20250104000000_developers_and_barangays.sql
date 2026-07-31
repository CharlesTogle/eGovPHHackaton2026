create table if not exists barangays (
  code text primary key,
  name text not null
);

insert into barangays (code, name) values
  ('0105503021', 'Poblacion, Alaminos, Pangasinan'),
  ('0803747001', 'Barangay 1 (Poblacion), Tacloban City, Leyte'),
  ('1004305001', 'Carmen, Cagayan de Oro City, Misamis Oriental'),
  ('070120000101', 'Poblacion I, Tagbilaran City, Bohol')
on conflict (code) do nothing;

create table if not exists developers (
  id uuid primary key default gen_random_uuid(),
  uniqid text not null unique,
  name text not null,
  email text not null,
  organization text not null,
  barangay_code text not null,
  created_at timestamptz not null default now()
);

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  developer_id uuid not null references developers(id) on delete cascade,
  barangay_code text not null,
  created_at timestamptz not null default now()
);

insert into developers (id, uniqid, name, email, organization, barangay_code) values
  ('e0000000-0000-0000-0000-000000000001', 'DEV_CITYAPP_001', 'Dev User', 'dev@cityapp.ph', 'CityApp Solutions', '0803747001'),
  ('e0000000-0000-0000-0000-000000000002', 'DEV_CDO_001', 'CDO Dev', 'dev@cdo.ph', 'CDO Relief Watch', '1004305001')
on conflict (id) do nothing;

insert into api_keys (id, key, developer_id, barangay_code) values
  ('f0000000-0000-0000-0000-000000000001', 'hnd_sk_demo_tacloban_yolanda', 'e0000000-0000-0000-0000-000000000001', '0803747001'),
  ('f0000000-0000-0000-0000-000000000002', 'hnd_sk_demo_cdo_sendong', 'e0000000-0000-0000-0000-000000000002', '1004305001')
on conflict (id) do nothing;

insert into officials (uniqid, barangay_code, role) values
  ('OFC_TACLOBAN_001', '0803747001', 'official'),
  ('OFC_CDO_001', '1004305001', 'official'),
  ('OFC_BOHOL_001', '070120000101', 'official')
on conflict (uniqid) do nothing;

create index if not exists idx_developers_uniqid on developers (uniqid);
create index if not exists idx_api_keys_developer on api_keys (developer_id);
create index if not exists idx_api_keys_key on api_keys (key);
