create type campaign_status as enum ('draft', 'active', 'closed', 'archived');
create type check_in_status as enum ('unresolved', 'visited', 'resolved');

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  disaster_type text not null,
  disaster_date date not null,
  status campaign_status not null default 'draft',
  created_by text not null,
  barangay_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table campaign_questions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns (id) on delete cascade,
  question_text text not null,
  need_category text not null,
  display_order int not null default 0
);

create table households (
  id uuid primary key default gen_random_uuid(),
  barangay_code text not null,
  household_head_name text not null,
  address text not null,
  member_count int not null default 1
);

create table household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  first_name text not null,
  last_name text not null
);

create table check_ins (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns (id) on delete cascade,
  household_id uuid not null references households (id) on delete cascade,
  submitted_by text not null,
  status check_in_status not null default 'unresolved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table check_in_answers (
  id uuid primary key default gen_random_uuid(),
  check_in_id uuid not null references check_ins (id) on delete cascade,
  question_id uuid not null references campaign_questions (id) on delete cascade,
  answer text not null
);

create index idx_campaign_questions_campaign on campaign_questions (campaign_id);
create index idx_households_barangay on households (barangay_code);
create index idx_household_members_household on household_members (household_id);
create index idx_check_ins_campaign on check_ins (campaign_id);
create index idx_check_ins_household on check_ins (household_id);
create index idx_check_in_answers_check_in on check_in_answers (check_in_id);
