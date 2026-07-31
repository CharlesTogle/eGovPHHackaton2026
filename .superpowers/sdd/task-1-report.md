# Task 1 Report

**Status:** DONE_WITH_CONCERNS

**Scope completed:**
- Added `src/features/demo/historical-incidents.ts` from `.worktrees/edge-functions-sync`
- Added `src/features/demo/historical-selectors.ts` from `.worktrees/edge-functions-sync`
- Added `src/features/demo/historical-selectors.test.ts` from `.worktrees/edge-functions-sync`
- Preserved campaign ID alignment with existing `src/features/demo/historical-demo-data.ts`

**TDD evidence:**
1. Added the focused selector test file first.
2. Ran `npm run test:unit -- src/features/demo/historical-selectors.test.ts` and confirmed the expected red state: missing `./historical-selectors`.
3. Copied the historical selector implementation from the worktree source of truth.
4. Hit a compile blocker because `src/lib/psa-fallback-data.ts` was missing on `master` while both the copied selector test and worktree source depended on it.
5. Added `src/lib/psa-fallback-data.ts` from the same worktree so the focused selector test could compile and execute.
6. Re-ran the focused unit test and confirmed it passed.

**Files changed for the task:**
- `src/features/demo/historical-incidents.ts`
- `src/features/demo/historical-selectors.ts`
- `src/features/demo/historical-selectors.test.ts`
- `src/lib/psa-fallback-data.ts`

**Verification:**
- `npm run test:unit -- src/features/demo/historical-selectors.test.ts`
  - Result: PASS, 2 test files passed / 16 tests passed
  - Note: Vitest also executed the mirrored `.worktrees/edge-functions-sync/.../historical-selectors.test.ts` file because the CLI argument matched both locations.
- `npx tsc --noEmit`
  - Result: PASS

**Commit created:**
- `db311b4` — `feat: sync historical demo selectors`

**Concerns:**
1. The task brief named only the three `historical-*` files, but `src/lib/psa-fallback-data.ts` also had to be synced to make the copied selector test compile on `master`.
2. The focused Vitest command currently matches both the `master` test file and the mirrored worktree test file under `.worktrees/edge-functions-sync`, so the command reports two passing suites instead of one.
