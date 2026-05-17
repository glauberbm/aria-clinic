# EPIC-002 Sprint Plan — Patient Management

**Epic:** EPIC-002 — Patient Management & Health Records
**Sprint Duration:** May 16 - June 10, 2026 (4 weeks)
**Total Story Points:** 32 SP
**Stories:** 4 (USER-006, USER-007, USER-008, USER-009)

---

## Sprint Overview

| Metric | Value |
|--------|-------|
| **Start Date** | May 16, 2026 |
| **Target Completion** | June 10, 2026 |
| **Duration** | 4 weeks (26 calendar days) |
| **Total SP** | 32 |
| **Dev Team** | @dev (Dex) |
| **QA Team** | @qa (Quinn) |
| **Architect** | @architect (Aria) |
| **Scrum Master** | @sm (River) |

---

## Week-by-Week Breakdown

### Week 1: USER-006 (Patient Registration) — May 16-20

**Story:** USER-006 — Patient Registration & Profile Setup
**Story Points:** 8 SP
**Status:** Ready for Development ✅

#### Development Phase (May 16-20)
- [ ] Create Supabase migration for patient_profiles table
- [ ] Create Supabase migration for insurance_info table
- [ ] Create Supabase migration for medical_history table
- [ ] Implement RLS policies for patient data privacy
- [ ] Build `/auth/patient-register` frontend component
- [ ] Build `/auth/verify-email` email verification flow
- [ ] Build `/app/patient/profile` profile management page
- [ ] Implement POST `/api/auth/patient-register` endpoint
- [ ] Implement POST `/api/auth/verify-email` endpoint
- [ ] Implement GET `/api/patient/profile` endpoint
- [ ] Implement PUT `/api/patient/profile` endpoint
- [ ] Implement POST `/api/patient/avatar` endpoint
- [ ] Write unit tests (≥80% coverage)
- [ ] Write integration tests (registration → profile access)
- [ ] Write security tests (RLS enforcement, privacy)

#### QA Gate (May 20-21)
- [ ] CodeRabbit review (max 2 iterations)
- [ ] 7-point QA Gate checklist
- [ ] Security audit passed
- [ ] All tests passing

#### Acceptance Criteria
- [x] All AC reviewed and aligned
- [x] File list confirmed
- [x] Dependencies: USER-001 ✅, USER-004 ✅ (complete)
- [x] No blockers

#### Success Criteria
- **Development:** All acceptance criteria implemented
- **Testing:** ≥80% coverage, all tests passing
- **Review:** CodeRabbit approval (0 blockers)
- **QA:** PASS verdict on 7-point gate
- **Merge:** Feature branch → main

---

### Week 2: USER-007 + USER-008 (Parallel) — May 23-27

#### Story 1: USER-007 — Medical Records Management
**Story Points:** 8 SP
**Status:** Ready for Development ✅
**Dependency:** USER-006 MUST merge first (May 20)

##### Development Phase (May 23-27)
- [ ] Create Supabase migration for medical_records table
- [ ] Create Supabase migration for test_results table
- [ ] Create Supabase migration for treatment_notes table
- [ ] Implement RLS policies (staff access, patient read-only)
- [ ] Build `/app/records/[patientId]` page for staff
- [ ] Implement POST `/api/records` endpoint
- [ ] Implement PUT `/api/records/{recordId}` endpoint
- [ ] Implement GET `/api/patient/{patientId}/records` endpoint
- [ ] Implement GET `/api/records/{recordId}` endpoint
- [ ] Add audit trail logging
- [ ] Write tests (unit + integration)

##### QA Gate (May 27-29)
- [ ] CodeRabbit review
- [ ] 7-point QA Gate
- [ ] Security audit: RLS enforcement verified

---

#### Story 2: USER-008 — Appointment Scheduling
**Story Points:** 8 SP
**Status:** Ready for Development ✅
**Dependency:** USER-006 MUST merge first (May 20)

##### Development Phase (May 23-27)
- [ ] Create Supabase migration for appointments table
- [ ] Create Supabase migration for appointment_slots table
- [ ] Implement RLS policies (patient access control)
- [ ] Build `/app/appointments` page for patients
- [ ] Build appointment calendar view
- [ ] Build appointment booking form
- [ ] Implement GET `/api/appointments/available` endpoint
- [ ] Implement POST `/api/appointments` endpoint
- [ ] Implement PUT `/api/appointments/{appointmentId}` endpoint
- [ ] Implement DELETE `/api/appointments/{appointmentId}` endpoint
- [ ] Add email notifications (confirmation + 24h reminder)
- [ ] Add timezone support
- [ ] Write tests (unit + integration)

##### QA Gate (May 27-29)
- [ ] CodeRabbit review
- [ ] 7-point QA Gate
- [ ] Email integration verified

---

### Week 3: USER-009 (Prescriptions) — May 30 - June 3

**Story:** USER-009 — Prescription Management & E-Prescription
**Story Points:** 8 SP
**Status:** Ready for Development ✅
**Dependency:** USER-006 + USER-007 MUST merge first

#### Development Phase (May 30 - June 3)
- [ ] Create Supabase migration for prescriptions table
- [ ] Create Supabase migration for medications table
- [ ] Create Supabase migration for prescription_history table
- [ ] Implement RLS policies (patient/doctor/pharmacy access)
- [ ] Build `/app/prescriptions` page for patients
- [ ] Build `/app/doctor/prescriptions` page for doctors
- [ ] Implement POST `/api/prescriptions` endpoint
- [ ] Implement GET `/api/patient/{patientId}/prescriptions` endpoint
- [ ] Implement PUT `/api/prescriptions/{prescriptionId}` endpoint
- [ ] Implement GET `/api/prescriptions/{prescriptionId}/pdf` endpoint
- [ ] Add medication interaction checking (3rd-party API)
- [ ] Add digital signature capability
- [ ] Add PDF export functionality
- [ ] Write tests (unit + integration)

#### QA Gate (June 3-5)
- [ ] CodeRabbit review
- [ ] 7-point QA Gate
- [ ] Security audit: Digital signatures verified
- [ ] API integration tests: Medication interactions

#### Success Criteria
- **Development:** All AC implemented
- **Testing:** ≥80% coverage, all tests passing
- **Review:** CodeRabbit approval
- **QA:** PASS verdict
- **Merge:** Feature branch → main

---

### Week 4+: Phase 2 Complete & Next Steps — June 6-10

**Objective:** Integration testing, bug fixes, readiness for EPIC-003 (Scheduling)

#### June 6-7: Integration & Stability
- [ ] Smoke tests across all 4 merged features
- [ ] End-to-end flow tests (registration → appointment → prescription)
- [ ] Database integrity checks
- [ ] Performance testing
- [ ] Bug fixes from merged stories

#### June 8-10: Phase 2 Completion & Documentation
- [ ] Final regression testing
- [ ] Database migration documentation
- [ ] API documentation complete
- [ ] Deployment validation
- [ ] Handoff to EPIC-003 team

**Phase 2 Verdict:** READY FOR PRODUCTION ✅

---

## Dependency Matrix

```
USER-006 (Patient Registration) [Week 1]
    ↓
    ├─→ USER-007 (Medical Records) [Week 2] ✓ Blocked until merge
    ├─→ USER-008 (Appointments) [Week 2] ✓ Blocked until merge
    │
    └─→ USER-009 (Prescriptions) [Week 3] ✓ Blocked until both merge
```

**Critical Path:** USER-006 → USER-007/008 (parallel) → USER-009

**Slack Time:** 4 days (June 6-10) for integration and bug fixes

---

## Resource Allocation

| Role | Allocation | Stories |
|------|-----------|---------|
| **@dev (Dex)** | 100% | All 4 stories (sequential) |
| **@qa (Quinn)** | 100% | All 4 stories (sequential QA gates) |
| **@architect (Aria)** | 20% | Code review, architecture decisions |
| **@sm (River)** | 10% | Sprint planning, standups, blockers |

---

## Risk Management

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Database migration complexity | High | Review with @data-engineer before dev |
| Email notification delays | Medium | Use Supabase built-in email service |
| Third-party API failures (medication interactions) | Medium | Add fallback/graceful degradation |
| RLS policy misconfiguration | High | Security audit required in QA gate |
| Parallel development conflicts (USER-007/008) | Low | Separate database tables (no conflicts) |

---

## Success Metrics

### Development Metrics
- **Code Coverage:** ≥80% for all stories
- **CodeRabbit:** 0 blockers on final review
- **Commit Quality:** Conventional commits, atomic changes
- **Lint/Type Checks:** 100% passing

### QA Metrics
- **QA Gate Verdicts:** All 4 stories = PASS
- **Bug Count:** ≤2 bugs per story
- **Test Execution Time:** <5 min per story
- **Regression Tests:** All passing

### Timeline Metrics
- **On-Time Delivery:** Week 1 completion on May 20
- **Parallel Execution:** USER-007/008 both complete by May 27
- **Sprint Buffer:** 4 days (June 6-10) with 0% utilization

---

## Sprint Standup Schedule

- **Daily Standups:** 10:00 AM BRT (Mon-Fri)
- **Weekly Reviews:** Friday 2:00 PM BRT
- **Retrospectives:** Every Friday 3:00 PM BRT

---

## Approval & Sign-Off

| Role | Status | Date |
|------|--------|------|
| **@sm (River)** — Scrum Master | ✅ Approved | May 15, 2026 |
| **@dev (Dex)** — Developer | ✅ Ready | May 15, 2026 |
| **@qa (Quinn)** — QA Lead | ✅ Ready | May 15, 2026 |
| **@architect (Aria)** — Tech Lead | ✅ Approved | May 15, 2026 |

---

**Sprint Plan Status:** READY FOR EXECUTION ✅

**Next Step:** @dev starts USER-006 development on May 16, 2026
