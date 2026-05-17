# QA Quick Reference — EPIC-002 Testing

**Quick lookup for QA team during sprint execution**

---

## Story Quick Links

| Story | Title | Files | Timeline | Status |
|-------|-------|-------|----------|--------|
| **USER-006** | Patient Registration | [2.1-user-006.story.md](stories/2.1-user-006.story.md) | May 16-21 | ⏳ Dev |
| **USER-007** | Medical Records | [2.2-user-007.story.md](stories/2.2-user-007.story.md) | May 23-29 | ⏳ Dev |
| **USER-008** | Appointments | [2.3-user-008.story.md](stories/2.3-user-008.story.md) | May 23-29 | ⏳ Dev |
| **USER-009** | Prescriptions | [2.4-user-009.story.md](stories/2.4-user-009.story.md) | May 30 - June 5 | ⏳ Dev |

---

## Test Execution Quick Commands

### Run All Tests
```bash
npm test
```

### Run Story-Specific Tests
```bash
# USER-006 tests
npm test -- patient-registration.test.ts

# USER-007 tests
npm test -- medical-records.test.ts

# USER-008 tests
npm test -- appointments.test.ts

# USER-009 tests
npm test -- prescriptions.test.ts
```

### Watch Mode (Live Re-run)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage

# View in browser
open coverage/lcov-report/index.html
```

### Code Quality Checks
```bash
npm run lint        # Linting (ESLint)
npm run typecheck   # Type checking (TypeScript)
npm run format      # Code formatting (Prettier)
```

---

## QA Checklist Per Story (7 Items)

### USER-006 Checklist

**Status:** ⏳ Pending (QA starts May 20)

```
1. [ ] Acceptance Criteria (9/9) — All marked complete
2. [ ] Test Coverage (≥80%) — Unit + integration tests PASS
3. [ ] CodeRabbit (0 blockers) — Approved ≤2 iterations
4. [ ] Security Tests (RLS) — Privacy enforcement verified
5. [ ] Database (migrations) — Tested locally, rollback OK
6. [ ] Performance (<1s) — All endpoints responsive
7. [ ] @architect Sign-Off — Architecture approved
```

### USER-007 Checklist

**Status:** ⏳ Pending (QA starts May 27)

```
1. [ ] Acceptance Criteria (9/9) — All complete
2. [ ] Test Coverage (≥80%) — Unit + integration PASS
3. [ ] CodeRabbit (0 blockers) — Approved
4. [ ] RLS Enforcement — Patient privacy verified
5. [ ] Audit Trail (immutable) — Operations logged
6. [ ] Performance (<500ms) — Record search fast
7. [ ] @architect Sign-Off — Approved
```

### USER-008 Checklist

**Status:** ⏳ Pending (QA starts May 27)

```
1. [ ] Acceptance Criteria (10/10) — All complete
2. [ ] Test Coverage (≥80%) — Unit + integration PASS
3. [ ] CodeRabbit (0 blockers) — Approved
4. [ ] Email Notifications — Confirmations + reminders sent
5. [ ] Timezone Support — Conversion validated
6. [ ] Double-Booking Prevention — Enforced
7. [ ] @architect Sign-Off — Approved
```

### USER-009 Checklist

**Status:** ⏳ Pending (QA starts June 3)

```
1. [ ] Acceptance Criteria (10/10) — All complete
2. [ ] Test Coverage (≥80%) — Unit + integration PASS
3. [ ] CodeRabbit (0 blockers) — Approved
4. [ ] Medication API Integration — Interaction checks working
5. [ ] Digital Signatures (verified) — Tamper detection OK
6. [ ] PDF Export (compliant) — All fields present, readable
7. [ ] @architect Sign-Off — Approved
```

---

## Test Suites at a Glance

### USER-006: Patient Registration

**Test Files:**
- `__tests__/api/patient-registration.test.ts` — Unit tests
- `__tests__/integration/patient-registration-flow.test.ts` — Integration
- `__tests__/security/patient-privacy.test.ts` — RLS tests

**Key Test Areas:**
- Email/CPF/phone validation
- Email verification flow
- Avatar upload (file type, size)
- Profile CRUD operations
- Role assignment (patient role)
- RLS enforcement (patient sees own only)

**Expected Coverage:** 85%+

---

### USER-007: Medical Records

**Test Files:**
- `__tests__/api/medical-records.test.ts` — Unit tests
- `__tests__/integration/medical-records-flow.test.ts` — Integration
- `__tests__/security/medical-records-security.test.ts` — Security

**Key Test Areas:**
- Record creation validation
- Audit trail logging
- Staff access (all records)
- Patient access (own only)
- Receptionist restrictions (no diagnosis)
- Search/filter functionality

**Expected Coverage:** 80%+

---

### USER-008: Appointments

**Test Files:**
- `__tests__/api/appointments.test.ts` — Unit tests
- `__tests__/integration/appointments-flow.test.ts` — Integration
- `__tests__/security/appointments-security.test.ts` — Security

**Key Test Areas:**
- Availability calculation
- Double-booking prevention
- Timezone conversion
- Booking validation
- Status transitions (pending → confirmed → completed)
- Email notifications (confirmations + 24h reminders)
- Reschedule workflow
- Calendar integration (iCal)

**Expected Coverage:** 80%+

---

### USER-009: Prescriptions

**Test Files:**
- `__tests__/api/prescriptions.test.ts` — Unit tests
- `__tests__/integration/prescriptions-flow.test.ts` — Integration
- `__tests__/security/prescriptions-security.test.ts` — Security

**Key Test Areas:**
- Prescription validation (medication, dosage, frequency)
- Status transitions (draft → active → filled → expired)
- Digital signature generation/verification
- PDF export (format, watermark, QR code)
- Medication interaction checking (3rd-party API)
- Renewal requests
- Pharmacy access control
- Audit trail for all actions

**Expected Coverage:** 80%+

---

## Common Test Failures & Fixes

### Failure: "Cannot find module '@supabase/supabase-js'"
**Fix:**
```bash
npm install
npm test
```

### Failure: "Jest timeout exceeded (5000ms)"
**Fix:**
```typescript
// Add to test:
jest.setTimeout(10000);

// Or increase globally in jest.config.js:
testTimeout: 10000
```

### Failure: "RLS policy missing"
**Check:**
```bash
# Verify migration was applied
supabase migration list

# Run migration manually if needed
supabase db push
```

### Failure: "Email service not mocked"
**Fix:**
```typescript
// Mock Supabase email in test setup
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));
```

### Failure: "Timezone mismatch"
**Fix:**
```typescript
// Always use UTC in tests, convert in assertions
const appointmentUTC = new Date('2026-05-25T14:00:00Z');
const userTZ = 'America/Sao_Paulo';
// Assert after conversion
```

---

## Performance Benchmarks

| Operation | Target | Test Method |
|-----------|--------|-------------|
| Patient registration | <1s | Timer in test |
| Profile load | <200ms | Supertest response time |
| Appointment booking | <500ms | API endpoint test |
| Medical record search | <500ms | Database query test |
| Prescription PDF export | <2s | File generation test |
| Email notification | <10s | Queue check |

**Measure:**
```typescript
const start = Date.now();
const result = await functionUnderTest();
const duration = Date.now() - start;
expect(duration).toBeLessThan(1000); // <1s
```

---

## Security Test Checklist

### RLS Enforcement

```typescript
// Test template
describe('RLS: medical_records', () => {
  it('patient should see own records only', async () => {
    // Create 2 patients, 2 records
    // Query as patient1
    // Assert: Only patient1's record visible
  });

  it('patient should not modify other records', async () => {
    // Create record for patient2
    // Try to update as patient1
    // Assert: Rejected (403)
  });
});
```

### Authorization Checks

```typescript
describe('Authorization', () => {
  it('unauthenticated user blocked', async () => {
    const response = await request(app)
      .get('/api/patient/profile')
      .expect(401);
  });

  it('expired token rejected', async () => {
    // Set token expiration to past
    const response = await request(app)
      .get('/api/patient/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });
});
```

---

## QA Gate Verdict Decision Tree

```
START
  ↓
All AC complete? NO → FAIL (return to dev)
  ↓ YES
Coverage ≥80%? NO → FAIL
  ↓ YES
Integration tests PASS? NO → FAIL
  ↓ YES
Security tests PASS? NO → FAIL (RLS critical)
  ↓ YES
CodeRabbit approved? NO → CONCERNS (or FAIL if critical)
  ↓ YES
@architect sign-off? NO → CONCERNS (or FAIL if arch issue)
  ↓ YES
Any known issues? YES → CONCERNS (document issue)
  ↓ NO
VERDICT: ✅ PASS → Merge!
```

---

## Escalation Path

**If QA Gate = FAIL:**

1. Document issue with clear evidence (test output, error)
2. Assign back to @dev with "Blocker" label
3. @dev fixes in same feature branch
4. QA re-tests (same test suite)
5. Re-submit for QA gate (max 2 iterations)

**If still failing after 2 iterations:**
- Escalate to @architect
- Discuss technical debt vs. scope reduction
- Document decision in PR

---

## Sign-Off Procedure

Once all checks pass:

1. **@qa (Quinn)** — Posts QA gate template in PR with ✅ PASS
2. **@dev (Dex)** — Confirms development complete
3. **@architect (Aria)** — Reviews and signs off
4. **@devops (Gage)** — Merges PR to main (exclusive authority)
5. **Next story** — Begins development

---

## Weekly QA Status Report

**Template (send Fridays 5 PM BRT):**

```
═══════════════════════════════════════════
EPIC-002 QA STATUS — Week X
═══════════════════════════════════════════

COMPLETED STORIES
✅ USER-006 — QA PASS (May 21, 2026)

IN PROGRESS
⏳ USER-007 — Dev 80% (QA starts May 27)
⏳ USER-008 — Dev 60% (QA starts May 27)

BLOCKERS
- None

NEXT WEEK
- USER-007 + USER-008 QA gates (May 27-29)
- USER-009 development (May 30+)

═══════════════════════════════════════════
```

---

## Useful Links

- **EPIC Documentation:** [EPIC-002-dashboard.md](epics/EPIC-002-dashboard.md)
- **Sprint Plan:** [EPIC-002-SPRINT-PLAN.md](EPIC-002-SPRINT-PLAN.md)
- **Full QA Strategy:** [QA-STRATEGY-EPIC-002.md](QA-STRATEGY-EPIC-002.md)
- **Test Template:** [__tests__/templates/qa-gate-template.md](__tests__/templates/qa-gate-template.md)
- **Story Files:** [docs/stories/](stories/)

---

**Last Updated:** May 15, 2026
**QA Lead:** @qa (Quinn)
**Next Review:** May 21, 2026 (post-USER-006 gate)
