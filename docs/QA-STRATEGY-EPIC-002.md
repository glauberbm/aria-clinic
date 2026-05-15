# QA Strategy — EPIC-002: Patient Management & Health Records

**Epic:** EPIC-002 — Patient Management & Health Records
**Sprint Duration:** May 16 - June 10, 2026
**QA Lead:** @qa (Quinn)
**Created:** May 15, 2026
**Status:** ACTIVE

---

## Executive Summary

EPIC-002 comprises 4 critical stories implementing patient management, medical records, appointment scheduling, and prescription management. QA strategy emphasizes comprehensive test coverage (≥80% unit + integration), security validation (RLS enforcement), and role-based access control verification.

| Metric | Target |
|--------|--------|
| **Unit Test Coverage** | ≥80% per story |
| **Integration Tests** | 100% of workflows |
| **Security Tests** | RLS + privacy enforcement |
| **QA Gate Verdicts** | 4/4 PASS |
| **Timeline** | May 20 → June 5 (QA gates) |

---

## Test Strategy Overview

### Testing Pyramid (per story)

```
┌─────────────────────────────────────┐
│   E2E Smoke Tests (5%)              │
├─────────────────────────────────────┤
│   Integration Tests (25%)            │
├─────────────────────────────────────┤
│   Unit Tests (70%)                  │
└─────────────────────────────────────┘
```

### Test Categories

| Category | Scope | Tools | Timeline |
|----------|-------|-------|----------|
| **Unit Tests** | Validation, business logic, edge cases | Jest | During development |
| **Integration Tests** | API flows, database interactions, RLS | Supertest, Supabase client | After feature branch |
| **Security Tests** | RLS enforcement, privacy, authorization | Custom RLS tests | QA gate (pre-merge) |
| **Smoke Tests** | End-to-end workflows across stories | Manual + automation | Week 4 integration |
| **Performance Tests** | Query optimization, response times | Artillery (optional) | Post-merge |

---

## Story-by-Story QA Plan

### USER-006: Patient Registration & Profile Setup

**Timeline:** Development May 16-20 → QA Gate May 20-21

#### Unit Tests (≥80% coverage)

**Test File:** `__tests__/api/patient-registration.test.ts`

**Test Suite 1: Registration Validation**
- Email format validation (valid, invalid, edge cases)
- CPF format validation (Brazilian CPF check digit)
- Phone number format (international support)
- Password strength enforcement (min 8 chars, uppercase, number, special char)
- Password confirmation matching
- Required field validation (name, email, DOB, CPF)

**Test Suite 2: Email Verification**
- Verification token generation (unique, secure)
- Token expiration (24h default)
- One-time use enforcement (re-use prevention)
- Email sent on registration
- Account locked until verified

**Test Suite 3: Avatar Upload Validation**
- File type validation (JPG, PNG, WebP)
- File size limits (max 5MB)
- Image dimensions (min 100x100, max 2000x2000)
- S3/Storage upload success
- Fallback to default avatar on failure

**Test Suite 4: Profile Data Handling**
- Insurance info storage (policy number, provider, coverage)
- Medical history input (conditions, allergies, medications)
- Timezone support (patient location)
- Profile update (partial updates, no overwrites)
- Profile retrieval (own profile only)

#### Integration Tests

**Test File:** `__tests__/integration/patient-registration-flow.test.ts`

**Flow 1: Complete Registration → Profile Access**
- [ ] User submits registration form
- [ ] Email verification email sent
- [ ] User clicks verification link
- [ ] Account activated
- [ ] User can log in
- [ ] Profile page accessible with pre-filled data
- [ ] Insurance info displayed correctly
- [ ] Medical history visible

**Flow 2: Role Assignment**
- [ ] Patient role automatically assigned on registration
- [ ] No admin/staff role access
- [ ] Role persisted in database
- [ ] Role used in RLS policies

**Flow 3: Admin Notification**
- [ ] Admin receives notification on new patient registration
- [ ] Notification includes patient name, email, DOB
- [ ] Notification sent within 5 seconds
- [ ] Notification can be marked as read

#### Security Tests

**Test File:** `__tests__/security/patient-privacy.test.ts`

**RLS Policy Tests:**
- [ ] Patient can view own profile only
- [ ] Patient cannot access other patient profiles
- [ ] Receptionist blocked from patient medical history
- [ ] Doctor can view assigned patient profiles only
- [ ] Admin can view all patient profiles (audit trail)

**Authorization Tests:**
- [ ] Unauthenticated users blocked from `/app/patient/profile`
- [ ] Token validation required for API endpoints
- [ ] Expired tokens return 401
- [ ] Invalid tokens return 401

**Data Privacy Tests:**
- [ ] CPF stored encrypted
- [ ] Medical history not logged in system logs
- [ ] Profile updates trigger audit log
- [ ] Deletion requests respected (GDPR)

#### QA Gate Checklist (7 items)

```
[ ] Acceptance Criteria
  [ ] All 9 AC marked complete
  [ ] No rejected AC

[ ] Test Coverage
  [ ] Unit tests: ≥80% coverage
  [ ] Integration tests: All flows PASS
  [ ] Security tests: RLS PASS

[ ] Code Quality
  [ ] CodeRabbit approval (≤2 iterations)
  [ ] 0 critical/high severity issues
  [ ] Linting: 100% passing
  [ ] TypeScript: 0 errors

[ ] Database
  [ ] Migrations tested locally
  [ ] RLS policies validated
  [ ] Rollback procedure documented

[ ] Dependencies
  [ ] USER-001 (auth) PASS ✓
  [ ] USER-004 (RBAC) PASS ✓

[ ] Deployment Readiness
  [ ] No environment-specific issues
  [ ] Email service verified
  [ ] Avatar storage configured

[ ] @architect Sign-Off
  [ ] Architecture reviewed
  [ ] Security design approved
```

**Verdict Options:**
- **PASS** - Ready to merge (0 blockers)
- **CONCERNS** - Mergeable with monitoring (1-2 minor issues)
- **FAIL** - Blocker(s) found, return to dev
- **WAIVED** - Exception approved by @architect

---

### USER-007: Medical Records Management

**Timeline:** Development May 23-27 → QA Gate May 27-29

#### Unit Tests (≥80% coverage)

**Test File:** `__tests__/api/medical-records.test.ts`

**Test Suite 1: Record Creation Validation**
- Required fields enforcement (diagnosis, treatment notes, date)
- Timestamp handling (server time zone normalization)
- Doctor ID validation (staff member exists)
- Patient ID validation (linked patient exists)
- File upload validation (test results)

**Test Suite 2: Medical Records Data**
- Diagnosis input format (structured text)
- Treatment notes WYSIWYG editor support
- Test result file type validation (PDF, JPG, PNG)
- File size limits (max 10MB per file)
- Multiple file attachments support

**Test Suite 3: Audit Trail**
- Create action logged (user, timestamp, data)
- Update action logged (change diff)
- Delete action logged (soft delete)
- Audit log immutability (append-only)

#### Integration Tests

**Test File:** `__tests__/integration/medical-records-flow.test.ts`

**Flow 1: Record Creation → Retrieval → Patient View**
- [ ] Doctor creates medical record
- [ ] Record linked to patient profile
- [ ] Doctor can retrieve own records
- [ ] Patient can view own records (read-only)
- [ ] Receptionist blocked from sensitive fields
- [ ] Audit log shows creation event

**Flow 2: Record Update & Audit Trail**
- [ ] Doctor updates treatment notes
- [ ] Update timestamp recorded
- [ ] Previous version preserved in audit log
- [ ] Patient notified of update (optional)
- [ ] Update history visible to staff

**Flow 3: Record Search & Filter**
- [ ] Records searchable by patient ID
- [ ] Records filterable by date range
- [ ] Records filterable by record type
- [ ] Search results paginated
- [ ] Search performance acceptable (<500ms)

#### Security Tests

**Test File:** `__tests__/security/medical-records-security.test.ts`

**RLS Policy Tests:**
- [ ] Staff can access all clinic records
- [ ] Patient can view own records only
- [ ] Receptionist blocked from diagnosis fields
- [ ] Unauthorized staff blocked from patient records

**Access Control Tests:**
- [ ] Doctor can edit own records only
- [ ] Patients cannot modify records
- [ ] Admin can audit all modifications
- [ ] Soft deletes preserved for recovery

**Data Protection Tests:**
- [ ] Test results encrypted in storage
- [ ] Sensitive data not logged to console
- [ ] Audit trail tamper-proof

#### QA Gate Checklist (7 items)

```
[ ] Acceptance Criteria (9 AC)
[ ] Test Coverage: ≥80% unit, 100% integration
[ ] CodeRabbit: 0 blockers
[ ] RLS Enforcement: VERIFIED
[ ] Audit Trail: All operations logged
[ ] Performance: <500ms response time
[ ] @architect Sign-Off: APPROVED
```

---

### USER-008: Appointment Scheduling & Management

**Timeline:** Development May 23-27 → QA Gate May 27-29

#### Unit Tests (≥80% coverage)

**Test File:** `__tests__/api/appointments.test.ts`

**Test Suite 1: Availability Calculation**
- Slot availability based on doctor schedule
- No double-booking enforcement
- Timezone conversion accuracy (multiple time zones)
- Business hours enforcement (e.g., 8 AM - 6 PM)
- Break time exclusions (lunch, admin)

**Test Suite 2: Booking Validation**
- Required fields (doctor, time, reason)
- Patient validation (exists, active)
- Doctor availability check
- Overbooking prevention
- Cancellation window validation (48h advance)

**Test Suite 3: Status Transitions**
- Valid transitions: pending → confirmed → completed → cancelled
- Invalid transitions blocked
- Status change validation
- Timestamp updates

**Test Suite 4: Timezone Support**
- User timezone stored correctly
- Appointment time converted to user TZ
- Reminder times calculated in user TZ
- API returns times in requested TZ

#### Integration Tests

**Test File:** `__tests__/integration/appointments-flow.test.ts`

**Flow 1: Book Appointment → Confirmation → Reminder**
- [ ] Patient views available slots
- [ ] Patient selects slot and books appointment
- [ ] Confirmation email sent within 10 seconds
- [ ] Clinic staff receives notification
- [ ] 24-hour reminder sent to patient
- [ ] Reminder email includes join details (Zoom/Jitsi)

**Flow 2: Reschedule Appointment**
- [ ] Old slot released and available again
- [ ] New slot marked as booked
- [ ] Patient receives reschedule confirmation
- [ ] Doctor notified of reschedule
- [ ] Appointment history preserved

**Flow 3: Appointment Cancellation**
- [ ] Slot returned to available pool
- [ ] Patient receives cancellation confirmation
- [ ] Doctor notified
- [ ] Cancellation reason recorded
- [ ] Cancellation window enforced (e.g., 48h before)

**Flow 4: Appointment Notes (Doctor)**
- [ ] Doctor adds notes after appointment
- [ ] Notes visible to patient
- [ ] Notes searchable by staff
- [ ] Notes immutable after 24h (audit trail)

#### Security Tests

**Test File:** `__tests__/security/appointments-security.test.ts`

**RLS Policy Tests:**
- [ ] Patient can view own appointments only
- [ ] Patient cannot book other patient appointments
- [ ] Doctor can view assigned patient appointments
- [ ] Receptionist can view clinic schedule only

**Email Notification Tests:**
- [ ] Confirmation email sent to patient email only
- [ ] Reminder email uses stored email address
- [ ] Email headers prevent spoofing
- [ ] Unsubscribe links functional

**Calendar Integration:**
- [ ] iCal export includes only own appointments
- [ ] Shared calendar respects RLS
- [ ] Calendar sync respects privacy settings

#### QA Gate Checklist (7 items)

```
[ ] Acceptance Criteria (10 AC)
[ ] Test Coverage: ≥80% unit, 100% integration
[ ] CodeRabbit: 0 blockers
[ ] Email Delivery: Confirmed via Supabase logs
[ ] Timezone Conversion: Validated across zones
[ ] Double-Booking Prevention: VERIFIED
[ ] @architect Sign-Off: APPROVED
```

---

### USER-009: Prescription Management & E-Prescription

**Timeline:** Development May 30 - June 3 → QA Gate June 3-5

#### Unit Tests (≥80% coverage)

**Test File:** `__tests__/api/prescriptions.test.ts`

**Test Suite 1: Prescription Validation**
- Medication selection (from medication table)
- Dosage format validation (mg, mcg, ml, etc.)
- Frequency format (e.g., "twice daily", "every 8 hours")
- Duration validation (start/end dates)
- Quantity calculation based on frequency/duration
- Instructions parsing (special directions)

**Test Suite 2: Status Transitions**
- Valid transitions: draft → active → filled → expired → archived
- Prescription expiration logic (auto-mark after end date)
- Renewal request handling (copies active prescription)
- Manual renewal creation

**Test Suite 3: Digital Signature**
- Signature generation (timestamp, doctor ID, prescription ID)
- Signature verification (tamper detection)
- Signature storage (immutable)
- Certificate validation (if X.509)

**Test Suite 4: PDF Export**
- PDF generation completeness (all fields present)
- Watermark presence ("For informational purposes")
- Font sizes readable (≥10pt)
- QR code generation (contains prescription ID + doctor ID)
- File size reasonable (<2MB)

#### Integration Tests

**Test File:** `__tests__/integration/prescriptions-flow.test.ts`

**Flow 1: Create Prescription → Patient View → Pharmacy Access**
- [ ] Doctor creates prescription
- [ ] Prescription status: draft (unsigned)
- [ ] Doctor reviews and signs
- [ ] Status changed to: active
- [ ] Patient receives notification
- [ ] Patient can view prescription
- [ ] Patient can download PDF
- [ ] Pharmacy can access (with patient consent)

**Flow 2: Medication Interaction Check**
- [ ] Prescription submitted to 3rd-party API (e.g., Pillintrx)
- [ ] Response contains interaction warnings
- [ ] Severe interactions block prescription (doctor must override)
- [ ] Warnings displayed to doctor
- [ ] Warnings included in patient PDF

**Flow 3: Renewal Request**
- [ ] Patient requests renewal (within 30 days of expiry)
- [ ] Doctor receives renewal notification
- [ ] Doctor approves/denies
- [ ] If approved: new prescription created (same meds, extended dates)
- [ ] Patient notified

**Flow 4: Prescription History**
- [ ] Patient views complete prescription history
- [ ] Filled prescriptions marked as complete
- [ ] Expired prescriptions marked as expired
- [ ] Archive older prescriptions (>1 year)
- [ ] Search by medication name

#### Security Tests

**Test File:** `__tests__/security/prescriptions-security.test.ts`

**RLS Policy Tests:**
- [ ] Patient can view own prescriptions only
- [ ] Doctor can create/edit own prescriptions
- [ ] Pharmacy can view only shared prescriptions
- [ ] Unauthorized staff blocked

**Digital Signature Tests:**
- [ ] Signature cannot be copied to other prescriptions
- [ ] Signature timestamp immutable
- [ ] Signature verification passes for unmodified prescriptions
- [ ] Signature fails if prescription modified post-signing

**Pharmacy Sharing Tests:**
- [ ] Patient can revoke pharmacy access
- [ ] Pharmacy access is time-limited (default 30 days)
- [ ] Pharmacy cannot share access with others
- [ ] Access logs maintained for audit

**PDF Security:**
- [ ] PDF cannot be printed without watermark
- [ ] PDF metadata sanitized (no personal info)
- [ ] QR code unique to prescription + patient combination
- [ ] Download tracked in audit log

#### QA Gate Checklist (7 items)

```
[ ] Acceptance Criteria (10 AC)
[ ] Test Coverage: ≥80% unit, 100% integration
[ ] CodeRabbit: 0 blockers
[ ] API Integration: Medication checks VERIFIED
[ ] Digital Signatures: Validation PASSED
[ ] PDF Export: Compliance VERIFIED
[ ] @architect Sign-Off: APPROVED
```

---

## Cross-Story Integration Testing (Week 4)

**Timeline:** June 6-10

### Smoke Test Suite

**Test File:** `__tests__/integration/epic-002-smoke.test.ts`

#### End-to-End Workflow

```
Patient Registration (USER-006)
  ↓
Schedule Appointment (USER-008)
  ↓
Create Medical Record (USER-007)
  ↓
Create Prescription (USER-009)
  ↓
Patient Views All Data (RLS Enforcement)
```

**Test Scenarios:**

1. **Happy Path (All Systems GO)**
   - New patient registers
   - Books appointment
   - Receives confirmation email
   - Doctor creates medical record (post-appointment)
   - Doctor creates prescription
   - Patient views all data

2. **Error Recovery (System Resilience)**
   - Email delivery fails → Retry mechanism
   - Medical record attachment fails → Graceful degradation
   - Prescription API timeout → Fallback (manual override)
   - Appointment slot race condition → Conflict handling

3. **Data Consistency (Database Integrity)**
   - Patient record count matches
   - Appointment count matches
   - RLS policies enforced across all tables
   - Audit trails consistent

4. **Performance (Acceptable Response Times)**
   - Profile load: <200ms
   - Appointment booking: <500ms
   - Prescription creation: <1s
   - Medical record search: <500ms

---

## QA Testing Tools & Configuration

### Unit Testing (Jest)

**Configuration File:** `jest.config.js` (already configured)

```javascript
// Key settings:
- testEnvironment: 'node' (suitable for API testing)
- moduleNameMapper: '@/' alias for imports
- setupFilesAfterEnv: 'jest.setup.js' for global mocks
```

**Test Patterns:**

```typescript
// Unit test template
describe('Feature', () => {
  beforeEach(() => {
    // Setup mocks
  });

  it('should validate input', () => {
    // Arrange
    const input = { /* test data */ };

    // Act
    const result = function(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

**Coverage Targets:**

```
Statements   : ≥80%
Branches     : ≥75%
Functions    : ≥80%
Lines        : ≥80%
```

### Integration Testing (Supertest)

**Test Pattern:**

```typescript
import request from 'supertest';
import { POST } from '@/app/api/route';

describe('API Endpoint', () => {
  it('should return 201 on success', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ /* payload */ })
      .expect(201);

    expect(response.body.message).toBe('Success');
  });
});
```

### Security Testing (Custom RLS Tests)

**Pattern:**

```typescript
// RLS test template
describe('RLS Policy: medical_records', () => {
  it('patient should see own records only', async () => {
    // Setup: Create 2 patients, 2 records
    const patient1 = await createPatient();
    const patient2 = await createPatient();
    const record1 = await createRecord(patient1.id);
    const record2 = await createRecord(patient2.id);

    // Query as patient1
    const results = await supabase
      .from('medical_records')
      .select('*')
      .setAuth(patient1.token);

    // Assert: Only record1 visible
    expect(results.data.length).toBe(1);
    expect(results.data[0].id).toBe(record1.id);
  });
});
```

### CodeRabbit Integration

**Trigger:** PR created with files in `app/` or `__tests__/` directories

**Review Focus:**
- Security issues (RLS, auth, input validation)
- Performance (N+1 queries, unnecessary renders)
- Best practices (error handling, type safety)
- Test coverage (unit test presence)

**Gates:**
- Max 2 review iterations
- Must resolve critical/high issues
- Must not reduce code coverage

---

## Test Execution & Reporting

### Local Test Run (Developer)

```bash
# All tests
npm test

# Single test file
npm test -- patient-registration.test.ts

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### CI/CD Test Run (GitHub Actions)

**Trigger:** On each commit to feature branch

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test -- --coverage
      - run: npm run lint
      - run: npm run typecheck
```

**Success Criteria:**
- All tests pass
- Coverage ≥80%
- No lint errors
- TypeScript: 0 errors

### QA Gate Test Summary

**Template:**

```
═══════════════════════════════════════
QA GATE SUMMARY — USER-00X
═══════════════════════════════════════

Story: User-00X Title
Sprint: Week X (Dates)
Developer: @dev (Dex)
QA Lead: @qa (Quinn)

Unit Tests:        ✅ PASS (85% coverage)
Integration Tests: ✅ PASS (100% flows)
Security Tests:    ✅ PASS (RLS verified)
CodeRabbit:        ✅ APPROVED (0 issues)
@architect:        ✅ SIGNED OFF

VERDICT: ✅ PASS (Ready to Merge)

═══════════════════════════════════════
Next: Merge feature branch → main
═══════════════════════════════════════
```

---

## Defect Management

### Bug Classification

| Severity | Definition | Action |
|----------|-----------|--------|
| **CRITICAL** | System crash, data loss, security breach | Block merge immediately |
| **HIGH** | Feature doesn't work, RLS fails, major data corruption | QA gate verdict: FAIL |
| **MEDIUM** | Minor feature issue, edge case failure | QA gate verdict: CONCERNS |
| **LOW** | Cosmetic, typos, minor UX issue | Document for sprint 2 |

### Defect Workflow

1. **Found During Testing** → Log in GitHub Issues (template: `Bug: {title}`)
2. **Assigned to @dev** → Fix in same feature branch
3. **Re-Test** → @qa re-runs affected test suite
4. **QA Gate Retry** → Must pass before merge

**Max Iterations:** 2 review cycles per story

---

## QA Timeline Summary

| Date | Activity | Owner | Status |
|------|----------|-------|--------|
| May 16-20 | USER-006 development + unit tests | @dev | ⏳ Pending |
| May 20-21 | USER-006 QA gate | @qa | ⏳ Pending |
| May 23-27 | USER-007 + USER-008 development | @dev | ⏳ Pending |
| May 27-29 | USER-007 + USER-008 QA gates | @qa | ⏳ Pending |
| May 30-06/03 | USER-009 development | @dev | ⏳ Pending |
| June 3-5 | USER-009 QA gate | @qa | ⏳ Pending |
| June 6-10 | Integration smoke tests + bug fixes | @qa | ⏳ Pending |

---

## QA Readiness Checklist (Pre-Development)

- [x] Test strategy document complete (this file)
- [x] Jest configuration verified
- [x] Supertest integration patterns defined
- [x] RLS test patterns documented
- [x] CodeRabbit integration confirmed
- [x] Team aligned on coverage targets (≥80%)
- [x] QA gate checklist defined (7 items)
- [x] Defect workflow established
- [x] Timeline aligned with sprint

---

## Success Criteria (Epic Level)

| Metric | Target | Status |
|--------|--------|--------|
| **Code Coverage** | ≥80% across all 4 stories | ⏳ Pending |
| **Test Execution** | <5 min per story | ⏳ Pending |
| **QA Gate Verdicts** | 4/4 PASS | ⏳ Pending |
| **Critical Bugs** | 0 (pre-merge) | ⏳ Pending |
| **Timeline** | On schedule (May 20 - June 5) | ⏳ Pending |
| **Security** | RLS 100% enforced | ⏳ Pending |
| **Performance** | All responses <1s | ⏳ Pending |

---

## Appendix A: QA Gate Checklist Template

```
═══════════════════════════════════════════════════════════════
QA GATE: USER-00X
═══════════════════════════════════════════════════════════════

ACCEPTANCE CRITERIA
[ ] Acceptance Criteria (X/X marked complete)
    [ ] AC #1: ...
    [ ] AC #2: ...

TEST COVERAGE
[ ] Unit Tests: ≥80% (actual: ___%)
[ ] Integration Tests: 100% workflows PASS
[ ] Security Tests: RLS enforcement VERIFIED
[ ] CodeRabbit: Approved with ≤2 iterations

CODE QUALITY
[ ] Linting: 100% passing (npm run lint)
[ ] TypeScript: 0 errors (npm run typecheck)
[ ] Format: Prettier applied (npm run format)
[ ] No console.log() calls (except logging framework)

DATABASE
[ ] Migrations tested locally
[ ] RLS policies validated with test queries
[ ] Rollback procedure documented
[ ] Data sample verified (correct types)

DEPENDENCIES
[ ] Previous stories merged and PASS ✓
[ ] No merge conflicts
[ ] Dependency tree clean (npm audit)

PERFORMANCE
[ ] Response time: <1s (API endpoints)
[ ] Query optimization: No N+1 issues
[ ] Load test: Acceptable under normal load

DEPLOYMENT
[ ] No environment-specific issues
[ ] Environment variables documented
[ ] Secrets not committed to repo
[ ] Migration instructions provided

SIGN-OFF
[ ] Developer (@dev): Ready for QA
[ ] QA (@qa): Verdict below
[ ] Architect (@architect): Architecture approved

═══════════════════════════════════════════════════════════════
VERDICT: [ ] PASS  [ ] CONCERNS  [ ] FAIL  [ ] WAIVED

Comments: _____________________________________________________

═══════════════════════════════════════════════════════════════
Next Action: Merge to main / Return to dev
═══════════════════════════════════════════════════════════════
```

---

## Appendix B: Test Data Seeds

### Patient Test Fixture

```typescript
const testPatient = {
  email: 'test-patient@example.com',
  cpf: '12345678901', // Valid CPF
  name: 'Test Patient',
  dateOfBirth: '1990-01-01',
  phone: '+5585988888888',
  password: 'SecurePass123!',
};
```

### Doctor Test Fixture

```typescript
const testDoctor = {
  email: 'doctor@clinic.com',
  name: 'Dr. Test',
  crm: '123456/SP', // Medical license
  specialties: ['Cardiology', 'General'],
  password: 'DoctorPass123!',
};
```

### Appointment Test Fixture

```typescript
const testAppointment = {
  patientId: 'patient-uuid',
  doctorId: 'doctor-uuid',
  scheduledAt: '2026-05-25T14:00:00Z',
  duration: 30, // minutes
  reason: 'Follow-up consultation',
  status: 'pending',
};
```

---

**QA Strategy Status:** READY FOR EXECUTION ✅
**Last Updated:** May 15, 2026
**Next Review:** After USER-006 completion (May 21, 2026)
