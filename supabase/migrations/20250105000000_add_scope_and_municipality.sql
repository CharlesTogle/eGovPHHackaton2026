-- Add municipality_code to barangays so LGU-scope queries can filter by municipality
alter table barangays add column municipality_code text;

update barangays set municipality_code = '0105503000' where code = '0105503021';
update barangays set municipality_code = '042111000' where code in ('042111011', '042111001', '042111006', '042111013');

-- Add scope to api_keys: 'barangay' (single brgy) or 'lgu' (all brgys in municipality)
alter table api_keys add column scope text not null default 'barangay';

-- Seed: cityapp stays barangay-scoped, kawit dev gets LGU-scoped
update api_keys set scope = 'barangay' where key = 'hnd_sk_demo_alaminos_poblacion';
update api_keys set scope = 'lgu' where key = 'hnd_sk_demo_kawit_toclong';

-- Add a second demo key for kawit at barangay scope to show both options
insert into api_keys (id, key, developer_id, barangay_code, scope) values
  ('f0000000-0000-0000-0000-000000000003', 'hnd_sk_demo_kawit_brgy', 'e0000000-0000-0000-0000-000000000002', '042111011', 'barangay')
on conflict (id) do nothing;
