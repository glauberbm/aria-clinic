# EPIC-002 Parallel Execution — High-Value Work Opportunities

## Current Status
- **Active Executions:** 4 agents in parallel
  - @sm: Story & sprint structure (DONE)
  - @dev: USER-006 Patient Registration (IN PROGRESS)
  - @architect: Design validation (IN PROGRESS)
  - @qa: Testing strategy for 4 stories (IN PROGRESS)

- **Modified Files (Active):**
  - docs/stories/2.1-user-006.story.md
  - docs/stories/2.2-user-007.story.md
  - docs/stories/2.3-user-008.story.md
  - docs/stories/2.4-user-009.story.md

- **In Development (Active):**
  - app/api/auth/patient-register/
  - app/api/patient/
  - lib/validations/patient.ts
  - supabase/migrations/20260516000001_create_patient_profiles.sql

---

## 5 High-Value Parallel Work Opportunities

### OPTION 1: Security Audit Fixes (CRITICAL PATH)
**Status:** Ready, non-blocking, BLOCKING for @dev's QA gate
**Effort:** 2-3 hours
**Value:** CRITICAL

**What:** Apply 2 pre-identified security fixes to production-blocking RLS policies
- Fix #1: Patient self-access RLS broken (add user_id column)
- Fix #2: Privilege escalation via role UPDATE (missing WITH CHECK clause)

**Why Now:**
- Documented in `/docs/SECURITY-AUDIT-BLOCKERS.md` with exact SQL
- USER-006's QA gate REQUIRES security audit approval
- These are the ONLY 2 critical blockers
- High-visibility work that unblocks @dev's gate
- Non-blocking: doesn't modify files @dev is editing

**Deliverables:**
- [ ] Create feature branch: `feature/security-fixes-epic-002`
- [ ] Apply RLS patient self-access fix (add user_id column option)
- [ ] Apply privilege escalation fix (WITH CHECK clause)
- [ ] Document test cases that prove fixes work
- [ ] Commit: `fix: resolve CRITICAL RLS & privilege escalation [USER-006]`
- [ ] Resubmit audit for final approval

**Risk:** None — follows documented audit, no code invented

---

### OPTION 2: Test Infrastructure & Fixtures (SUPPORTING)
**Status:** Ready, infrastructure role, high-velocity prep
**Effort:** 4-5 hours
**Value:** HIGH (accelerates all 4 stories)

**What:** Build comprehensive test infrastructure for USER-006/007/008/009
- Create `tests/` directory structure
- Write Jest setup for RLS + Supabase client mocking
- Build test fixtures (mock patients, insurance data, medical history)
- Create RLS test utilities (authenticate as different roles)
- Write integration test templates for @dev to extend

**Why Now:**
- @qa's strategy requires ≥80% coverage across 4 stories
- No file conflicts: this is NEW infrastructure
- Saves @dev 2-3 hours per story (pre-made fixtures + templates)
- Unblocks parallel testing in Week 2 (USER-007/008)

**Deliverables:**
- [ ] `tests/` directory with Jest config overrides
- [ ] `tests/fixtures/patient-data.ts` (patients, insurance, history)
- [ ] `tests/utils/auth.ts` (RLS test helpers)
- [ ] `tests/utils/supabase-mock.ts` (Supabase client mock)
- [ ] `tests/integration/template.test.ts` (example test suite)
- [ ] `jest.setup.ts` update for Supabase mocks
- [ ] Commit: `chore: add test infrastructure & fixtures [EPIC-002]`

**Risk:** Low — infrastructure, not business logic

---

### OPTION 3: Database Migration Pre-Validation (RISK MITIGATION)
**Status:** Ready, validation-only, prevents future rollbacks
**Effort:** 2-3 hours
**Value:** MEDIUM (high confidence for Week 2 deploys)

**What:** Validate all 4 migration files BEFORE @dev merges
- Test migrations run clean on fresh Supabase instance
- Validate RLS policies don't have syntax errors
- Test rollback migrations execute
- Document any assumptions (e.g., data seeding required)

**Why Now:**
- Prevents mid-sprint "migration failed" disasters
- Non-blocking: purely validation, no writes
- Week 2 parallel stories (USER-007/008) depend on these
- Migration files are stable (not being modified)

**Deliverables:**
- [ ] Create test script: `scripts/validate-migrations.sh`
- [ ] Document migration assumptions
- [ ] Create rollback test checklist
- [ ] Write migration validation report
- [ ] Commit: `test: add migration validation suite [EPIC-002]`

**Risk:** None — read-only validation

---

### OPTION 4: Documentation & Onboarding (KNOWLEDGE TRANSFER)
**Status:** Ready, low-effort, high-leverage
**Effort:** 3-4 hours
**Value:** MEDIUM (accelerates future development, reduces context switches)

**What:** Document architecture decisions and workflows for EPIC-002
- Create `/docs/architecture/EPIC-002-DATA-FLOW.md` (patient flow diagram)
- Create `/docs/architecture/EPIC-002-RLS-MODEL.md` (security model)
- Create `/docs/DEV-GUIDE-EPIC-002.md` (quick reference for @dev)
- Create `/docs/TEST-QUICK-REF.md` (test patterns, mocking setup)
- Update main `README.md` with EPIC-002 status and progress

**Why Now:**
- Docs on roadmap are empty or sparse
- Reduces context load for @dev doing parallel stories
- Unblocks @sm for next sprint planning
- No file conflicts: NEW content

**Deliverables:**
- [ ] `docs/architecture/EPIC-002-DATA-FLOW.md` (entity relationships, APIs)
- [ ] `docs/architecture/EPIC-002-RLS-MODEL.md` (RLS policies, privacy enforcement)
- [ ] `docs/DEV-GUIDE-EPIC-002.md` (feature checklist, endpoints, flows)
- [ ] `docs/TEST-QUICK-REF.md` (mock patterns, fixture usage)
- [ ] Update `README.md` with project status
- [ ] Commit: `docs: add EPIC-002 architecture & dev guides`

**Risk:** None — documentation

---

### OPTION 5: GitHub Workflows & CI/CD Setup (INFRASTRUCTURE)
**Status:** Ready, strategic investment, prevents manual work
**Effort:** 2-3 hours
**Value:** MEDIUM (compounding over sprint)

**What:** Create GitHub Actions workflows for CI/CD automation
- Create `.github/workflows/test.yml` (Jest + coverage reporting)
- Create `.github/workflows/lint.yml` (ESLint + TypeScript)
- Create `.github/workflows/security.yml` (RLS audit checks)
- Create `.github/workflows/migration.yml` (validate migrations on PR)
- Update PR template with QA gate checklist

**Why Now:**
- Currently NO CI/CD automation (manual testing)
- @devops hasn't set up GitHub workflows yet
- Non-blocking: doesn't interfere with @dev's work
- Saves hours of manual validation starting next week

**Deliverables:**
- [ ] `.github/workflows/test.yml` (Jest on PR)
- [ ] `.github/workflows/lint.yml` (ESLint + typecheck)
- [ ] `.github/workflows/security.yml` (RLS migration check)
- [ ] `.github/workflows/migration.yml` (validate Supabase migrations)
- [ ] `.github/pull_request_template.md` (QA gate checklist)
- [ ] Update `docs/CI-CD.md`
- [ ] Commit: `ci: add GitHub Actions workflows [EPIC-002]`

**Risk:** Medium (needs @devops review before merge, but can be prepared in advance)

---

## Recommended Priority Order

### Tier 1 (DO FIRST)
1. **Security Audit Fixes** — Unblocks @dev's QA gate, documented, critical path
2. **Test Infrastructure** — Accelerates all 4 stories, enables parallel development

### Tier 2 (HIGH ROI)
3. **Database Migration Pre-Validation** — Risk mitigation, prevents disasters
4. **Documentation** — Reduces context load, supports team velocity

### Tier 3 (IF TIME)
5. **GitHub Workflows** — Infrastructure, needs @devops approval

---

## Implementation Strategy

### Terminal Session Setup
```bash
# Terminal 1: Current dev work (leave running)
@dev work on USER-006

# Terminal 2: Security fixes
Apply documented RLS/privilege escalation fixes (2-3 hours)

# Terminal 3: Test infrastructure
Build fixtures, setup mocks (2-3 hours)

# Terminal 4: Documentation
Write guides, architecture docs (2-3 hours)
```

### Non-Blocking Guarantees
- ✅ Security fixes: Different migration files, no app code modifications
- ✅ Test infrastructure: NEW directory, doesn't modify @dev files
- ✅ Migration validation: Read-only scripts, no writes
- ✅ Documentation: NEW markdown files only
- ✅ GitHub Workflows: NEW YAML files in .github/

### Git Safety
- All work on feature branches (`feature/security-fixes`, `feature/test-infra`, etc.)
- Commit frequently with clear messages
- No merges until @devops reviews
- No rebase conflicts: new files only

---

## Success Metrics

| Work Stream | Done When | Owner |
|-------------|-----------|-------|
| Security Fixes | @architect approves audit + tests pass | Any agent |
| Test Infrastructure | Test templates working + @dev uses for USER-006 | Any agent |
| Migration Validation | Script runs clean, rollback tested | Any agent |
| Documentation | Guides complete, no outdated references | Any agent |
| GitHub Workflows | All workflows passing, PR template updated | @devops or @security |

---

## Files Ready for Work

### Stable (Not Being Modified)
- `supabase/migrations/` — All migration files
- `docs/` — Most documentation (except active stories)
- `.github/` — Does not exist yet

### In Development (AVOID)
- `app/api/auth/patient-register/`
- `app/api/patient/`
- `lib/validations/patient.ts`
- `docs/stories/2.*.story.md`

### New Directories (SAFE)
- `tests/` — No conflicts, fresh directory
- `scripts/` — New validation scripts
- `.github/` — New CI/CD infrastructure

---

## Conclusion

**Highest ROI:** Start with Security Audit Fixes (critical blocker) + Test Infrastructure (accelerates all 4 stories) in parallel terminals. Both are non-blocking and pre-documented. If bandwidth allows, add Documentation to reduce @dev's context load during Week 2 parallel stories (USER-007/008).

**Time Estimate:** 10-12 hours total for all 5 options (can be spread across multiple sessions).
