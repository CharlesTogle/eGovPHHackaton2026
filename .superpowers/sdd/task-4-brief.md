### Task 4: Database migrations (unique constraint + realtime publication)

**Files:**
- Create: `supabase/migrations/20250101000003_check_ins_unique.sql`
- Create: `supabase/migrations/20250101000004_realtime_publication.sql`

- [ ] **Step 1: Create unique constraint migration**

Create `supabase/migrations/20250101000003_check_ins_unique.sql`:
```sql
alter table check_ins
  add constraint check_ins_campaign_household_unique
  unique (campaign_id, household_id);
```

- [ ] **Step 2: Create realtime publication migration**

Create `supabase/migrations/20250101000004_realtime_publication.sql`:
```sql
alter publication supabase_realtime add table campaigns;
alter publication supabase_realtime add table check_ins;
alter publication supabase_realtime add table check_in_answers;
```

- [ ] **Step 3: Apply migrations to local Supabase**

Run:
```bash
npx supabase db push
```
Expected: Both migrations applied successfully.

**Note:** If `npx supabase db push` fails (e.g., Supabase not running locally, or connection issues), skip this step and just commit the migration files. The migrations will be applied when the Supabase project is connected.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add unique constraint on check_ins and realtime publication"
```
