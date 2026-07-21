-- Drop deprecated household FK and column from check_ins, add name

alter table check_ins drop constraint if exists check_ins_household_id_fkey;
drop index if exists idx_check_ins_household;
alter table check_ins drop column if exists household_id;
alter table check_ins add column if not exists name text;
update check_ins set name = coalesce(name, submitted_by) where name is null;
alter table check_ins alter column name set not null;

-- Drop deprecated tables

drop table if exists household_members;
drop table if exists households;
drop index if exists idx_households_barangay;
drop index if exists idx_household_members_household;
