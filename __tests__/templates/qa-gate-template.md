# QA Gate Checklist Template

**Use this template for each story's QA gate (copy, fill in, submit in PR)**

---

```
═══════════════════════════════════════════════════════════════════════════════
QA GATE VERDICT: USER-00X [STORY TITLE]
═══════════════════════════════════════════════════════════════════════════════

SPRINT CONTEXT
  Sprint: EPIC-002 Patient Management (May 16 - June 10, 2026)
  Story: USER-00X — [Title]
  Developer: @dev (Dex)
  QA Lead: @qa (Quinn)
  Architect: @architect (Aria)
  PR: #[number] | Branch: feature/2.X-user-00X

═══════════════════════════════════════════════════════════════════════════════
1. ACCEPTANCE CRITERIA VERIFICATION
═══════════════════════════════════════════════════════════════════════════════

Total AC: [X] | Completed: [X] | Pending: 0 ✅

  [ ] AC #1 — [Description] ✅
  [ ] AC #2 — [Description] ✅
  [ ] AC #3 — [Description] ✅
  [ ] AC #4 — [Description] ✅
  [ ] AC #5 — [Description] ✅
  [ ] AC #6 — [Description] ✅
  [ ] AC #7 — [Description] ✅
  [ ] AC #8 — [Description] ✅
  [ ] AC #9 — [Description] ✅

═══════════════════════════════════════════════════════════════════════════════
2. TEST COVERAGE & RESULTS
═══════════════════════════════════════════════════════════════════════════════

Unit Tests
  [ ] Coverage: ≥80% (actual: 82%)
  [ ] All tests passing: npm test -- user-00X.test.ts ✅
  [ ] No skipped tests (skip: 0)
  [ ] Edge cases tested

Integration Tests
  [ ] All workflows PASS
    [ ] Flow 1: [Description] ✅
    [ ] Flow 2: [Description] ✅
    [ ] Flow 3: [Description] ✅
  [ ] Database transactions correct
  [ ] Email notifications sent (if applicable)
  [ ] API responses correct (status codes, body structure)

Security Tests
  [ ] RLS policies enforced ✅
  [ ] Authorization checks working
  [ ] No privilege escalation
  [ ] Input validation (SQL injection, XSS)
  [ ] Data privacy verified (no sensitive data in logs)

Performance Tests
  [ ] API response time: <1s (actual: 450ms) ✅
  [ ] Query count acceptable (no N+1)
  [ ] Database indexes in place
  [ ] Memory usage normal

═══════════════════════════════════════════════════════════════════════════════
3. CODE QUALITY
═══════════════════════════════════════════════════════════════════════════════

Linting & Type Safety
  [ ] npm run lint — 0 errors ✅
  [ ] npm run typecheck — 0 errors ✅
  [ ] npm run format — Applied ✅
  [ ] No console.log() in production code
  [ ] No @ts-ignore used (or documented)

Code Review (CodeRabbit)
  [ ] Review iterations: 1 of 2 max ✅
  [ ] Critical issues: 0 ✅
  [ ] High severity: 0 ✅
  [ ] Medium issues: 0 (or documented)
  [ ] Reviewer approved: ✅

Best Practices
  [ ] Error handling implemented
  [ ] Try/catch blocks present
  [ ] Environment variables not hardcoded
  [ ] Secrets not in version control
  [ ] Comments/documentation present for complex logic

═══════════════════════════════════════════════════════════════════════════════
4. DATABASE CHANGES
═══════════════════════════════════════════════════════════════════════════════

Migrations
  [ ] Migration files created:
    - 20260515000004_create_patient_profiles.sql ✅
    - [List all migration files]
  [ ] Migrations tested locally: supabase migration list ✅
  [ ] No data loss on rollback (tested)
  [ ] Rollback procedure documented

RLS (Row Level Security)
  [ ] RLS policies created:
    - policy_patient_read_own_profile ✅
    - policy_staff_read_all_records ✅
    - [List all policies]
  [ ] Policies tested with test queries:
    ```sql
    -- Patient should see own record only
    SELECT * FROM medical_records
    WHERE patient_id = auth.uid();
    ```
  [ ] No unintended data leakage

Data Validation
  [ ] Table constraints correct (NOT NULL, UNIQUE, FK)
  [ ] Indexes created for frequently queried columns
  [ ] Default values sensible
  [ ] Enum types used where appropriate

═══════════════════════════════════════════════════════════════════════════════
5. DEPENDENCIES & BLOCKERS
═══════════════════════════════════════════════════════════════════════════════

Required Stories (Previous)
  [ ] USER-001 (Authentication) — Status: PASS ✅
  [ ] USER-004 (RBAC) — Status: PASS ✅
  [ ] [Other dependencies]

Build & Dependencies
  [ ] No new npm packages added without approval
  [ ] npm audit — 0 vulnerabilities ✅
  [ ] yarn.lock / package-lock.json updated
  [ ] Build successful: npm run build ✅

Git & Version Control
  [ ] No merge conflicts
  [ ] Commits follow conventional format (feat:, fix:, etc.) ✅
  [ ] Branch based on main (no stale commits)
  [ ] No direct commits to main
  [ ] All commits signed (if required)

═══════════════════════════════════════════════════════════════════════════════
6. DEPLOYMENT READINESS
═══════════════════════════════════════════════════════════════════════════════

Environment Configuration
  [ ] Environment variables documented (.env.example updated)
  [ ] No hardcoded config values
  [ ] .env secrets not in repo
  [ ] API keys rotated (if changed)

Feature Flags
  [ ] New features can be toggled off if needed
  [ ] Feature flag strategy documented
  [ ] Rollback procedure simple

Monitoring & Logging
  [ ] Error logging in place (Sentry/similar)
  [ ] User action logging for audit trail
  [ ] Performance metrics tracked
  [ ] No sensitive data in logs

═══════════════════════════════════════════════════════════════════════════════
7. ARCHITECT SIGN-OFF
═══════════════════════════════════════════════════════════════════════════════

@architect (Aria) Review
  [ ] Architecture reviewed and approved ✅
  [ ] Design patterns consistent with codebase
  [ ] Scalability considerations addressed
  [ ] Security design approved
  [ ] No technical debt introduced

Comments from @architect:
  "Clean implementation, follows existing patterns. RLS policies well-designed.
   Ready for production."

═══════════════════════════════════════════════════════════════════════════════
FINAL VERDICT
═══════════════════════════════════════════════════════════════════════════════

QA Gate Verdict:
  [ ] ✅ PASS — Ready to merge, no issues
  [ ] ⚠️  CONCERNS — Minor issues, can merge with monitoring
  [ ] ❌ FAIL — Critical issue(s), must fix before merge
  [ ] ⏸️  WAIVED — Exception approved by @architect

Details: All acceptance criteria met, ≥80% test coverage, RLS enforced,
         security audit passed. Ready for production deployment.

═══════════════════════════════════════════════════════════════════════════════
APPROVAL SIGNATURES
═══════════════════════════════════════════════════════════════════════════════

Developer (@dev / Dex)
  Status: ✅ Ready for merge
  Signed: May 20, 2026 | 3:00 PM BRT

QA Lead (@qa / Quinn)
  Status: ✅ PASS
  Signed: May 21, 2026 | 10:30 AM BRT

Architect (@architect / Aria)
  Status: ✅ Architecture approved
  Signed: May 21, 2026 | 11:00 AM BRT

═══════════════════════════════════════════════════════════════════════════════
NEXT STEPS
═══════════════════════════════════════════════════════════════════════════════

1. ✅ Merge feature/2.X-user-00X into main (via @devops push)
2. ⏳ Trigger production deployment
3. ⏳ Monitor Sentry/logs for issues (first 24h)
4. ⏳ Proceed with next story (USER-00Y) when dependent

═══════════════════════════════════════════════════════════════════════════════
```

---

## How to Use This Template

1. **Copy** this template into your PR description
2. **Fill in** placeholders with actual data:
   - Story ID, title, PR number
   - AC count, coverage percentage
   - Actual test results
3. **Mark checkboxes** as you verify each item
4. **Get signoffs** from @dev, @qa, @architect
5. **Submit** with PR for final approval

## Quick Reference

- **Coverage target:** ≥80% (Unit) + 100% (Integration)
- **Test execution:** `npm test -- user-00X.test.ts`
- **Coverage report:** `npm run test:coverage`
- **Max code review iterations:** 2
- **QA gate verdict options:** PASS, CONCERNS, FAIL, WAIVED

---
