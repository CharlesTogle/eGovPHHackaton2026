alter table check_ins
  add constraint check_ins_campaign_household_unique
  unique (campaign_id, household_id);
