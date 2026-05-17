# QA Documentation for EPIC-002

**Complete QA Planning for Patient Management & Health Records**

---

## Documentation Files

### 1. QA Strategy Document (Main Reference)
📄 `QA-STRATEGY-EPIC-002.md`

**Comprehensive 400+ line guide covering:**
- Testing pyramid (unit, integration, security, smoke)
- Story-by-story test plans (USER-006 through USER-009)
- QA gate checklists (7-point verification per story)
- Test execution tools and configuration
- Defect management workflow
- Cross-story integration testing (Week 4)

**Use this when:**
- Planning test strategy for a story
- Understanding security/RLS test requirements
- Defining acceptance criteria for QA gate
- Reviewing test configuration

---

### 2. QA Quick Reference (Daily Operations)
📄 `QA-QUICK-REFERENCE.md`

**Fast lookup guide with:**
- Quick links to all stories
- Test execution commands (npm test, coverage, lint)
- Story-specific checklist (7 items per story)
- Common test failures and fixes
- Performance benchmarks
- Security test templates
- Escalation path

**Use this when:**
- Running tests during development
- Looking up quick commands
- Debugging test failures
- Making QA gate decisions

---

### 3. QA Gate Checklist Template (Per-Story)
📄 `__tests__/templates/qa-gate-template.md`

**Copy-paste template for PR submissions:**
- 7-section verification (AC, tests, code quality, DB, dependencies, deployment, sign-off)
- Checkbox format (ready for GitHub PR)
- Approval signatures (dev, QA, architect)
- Next steps (merge, deploy, monitor)

**Use this when:**
- Completing QA gate for a story
- Submitting PR with QA verdict
- Getting sign-offs from team

---

## QA Timeline

| Date | Story | Activity | QA Owner |
|------|-------|----------|----------|
| May 20-21 | USER-006 | QA Gate 1 | Quinn |
| May 27-29 | USER-007 + USER-008 | QA Gates 2 & 3 | Quinn |
| June 3-5 | USER-009 | QA Gate 4 | Quinn |
| June 6-10 | All | Integration + smoke tests | Quinn |

**Expected Outcome:** 4/4 stories = PASS

---

## Key QA Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Unit Test Coverage | ≥80% per story | Pending |
| Integration Tests | 100% workflows PASS | Pending |
| Security Tests (RLS) | 100% enforced | Pending |
| CodeRabbit Verdict | 0 blockers | Pending |
| QA Gate Verdicts | 4/4 PASS | Pending |
| Critical Bugs (pre-merge) | 0 | Pending |

---

## Quick Start for QA Team

### For @qa (Quinn) - Starting a QA Gate:

1. Read the story file (e.g., `docs/stories/2.1-user-006.story.md`)
2. Review the test plan → See `QA-STRATEGY-EPIC-002.md` → User-006 section
3. Run tests → Use commands from `QA-QUICK-REFERENCE.md`
4. Check coverage → Must be ≥80%
5. Fill QA gate checklist → Copy from `__tests__/templates/qa-gate-template.md`
6. Get sign-offs → Architect approval required
7. Post verdict → In PR with PASS/CONCERNS/FAIL

### For @dev (Dex) - Passing QA Gate:

1. Develop feature per story acceptance criteria
2. Run tests → `npm test -- user-00X.test.ts`
3. Check coverage → `npm run test:coverage` (need ≥80%)
4. Code quality → `npm run lint && npm run typecheck`
5. Submit PR with description
6. Wait for QA gate verdict from Quinn
7. Fix issues if FAIL (max 2 iterations)
8. Celebrate when PASS

### For @architect (Aria) - Code Review:

1. Review PR for architecture/design patterns
2. Validate RLS design (security-critical)
3. Check dependencies and complexity
4. Sign-off in QA gate checklist
5. Monitor first 24h post-merge

---

## Test Coverage by Story

### USER-006: Patient Registration
- **Unit Tests:** Registration validation, email verification, avatar upload
- **Integration Tests:** Complete registration flow, role assignment, admin notification
- **Security Tests:** RLS enforcement, authorization checks, data privacy
- **Target Coverage:** ≥80%

### USER-007: Medical Records
- **Unit Tests:** Record creation, audit trail, data handling
- **Integration Tests:** Record creation → retrieval, patient view, search
- **Security Tests:** Staff access, patient privacy, audit immutability
- **Target Coverage:** ≥80%

### USER-008: Appointments
- **Unit Tests:** Availability calculation, booking validation, timezone support
- **Integration Tests:** Book → confirmation → reminder, reschedule, cancellation
- **Security Tests:** RLS enforcement, email privacy, calendar sharing
- **Target Coverage:** ≥80%

### USER-009: Prescriptions
- **Unit Tests:** Validation, status transitions, digital signature, PDF export
- **Integration Tests:** Create → patient view → pharmacy access, renewal
- **Security Tests:** RLS enforcement, signature tamper detection, access revocation
- **Target Coverage:** ≥80%

---

## Security Test Focus Areas

All stories require **RLS (Row Level Security) enforcement** testing:

```sql
-- Example RLS test query
SELECT * FROM medical_records
WHERE patient_id = auth.uid();
-- Must return: Patient's records only (if patient)
-- Must return: All records (if staff)
-- Must return: Nothing (if unauthorized)
```

Key security concerns:
- Patient privacy (cannot see other patients' data)
- Staff role restrictions (receptionist cannot see sensitive fields)
- Authorization (must be logged in)
- Data encryption (sensitive fields encrypted at rest)
- Audit trails (immutable logs of all changes)

---

## Test File Structure

```
__tests__/
├── api/
│   ├── patient-registration.test.ts
│   ├── medical-records.test.ts
│   ├── appointments.test.ts
│   └── prescriptions.test.ts
├── integration/
│   ├── patient-registration-flow.test.ts
│   ├── medical-records-flow.test.ts
│   ├── appointments-flow.test.ts
│   ├── prescriptions-flow.test.ts
│   └── epic-002-smoke.test.ts
├── security/
│   ├── patient-privacy.test.ts
│   ├── medical-records-security.test.ts
│   ├── appointments-security.test.ts
│   └── prescriptions-security.test.ts
└── templates/
    └── qa-gate-template.md
```

---

## QA Gate Verdict Criteria

### PASS
- All AC completed
- Coverage ≥80%
- All tests passing
- CodeRabbit approved
- RLS verified
- Architect sign-off

→ **Ready to merge and deploy**

### CONCERNS
- Minor issues (1-2)
- Can merge with monitoring
- Plan follow-up work
- Document exceptions

→ **Mergeable, but watch carefully**

### FAIL
- Critical blockers
- Coverage <80%
- RLS not enforced
- Unresolved security issues

→ **Return to dev for fixes**

### WAIVED
- Exception approved by architect
- Business justification documented
- Risk accepted

→ **Merge with explicit approval**

---

## Tools & Configuration

| Tool | Purpose | Config |
|------|---------|--------|
| **Jest** | Unit testing | `jest.config.js` |
| **Supertest** | Integration testing | Built-in to tests |
| **Custom RLS tests** | Security validation | In `__tests__/security/` |
| **CodeRabbit** | Automated code review | GitHub app (auto-triggered) |
| **Supabase CLI** | Database migrations | `supabase/migrations/` |

---

## Support & Escalation

### Normal QA Questions
→ Ask @qa (Quinn) in PR comments

### Test Configuration Issues
→ Ask @dev (Dex) or @architect (Aria)

### Database/Migration Issues
→ Ask @data-engineer (Dara) or @architect (Aria)

### Production Incident
→ Escalate to @aiox-master or @devops (Gage)

---

## Related Documents

- EPIC-002 Dashboard Epic → Business requirements
- EPIC-002 Sprint Plan → Timeline and resource allocation
- Story: USER-006 Patient Registration
- Story: USER-007 Medical Records
- Story: USER-008 Appointments
- Story: USER-009 Prescriptions

---

## Training Resources

**For new QA team members:**

1. Read this README (5 min)
2. Review QA-QUICK-REFERENCE.md (10 min)
3. Review QA-STRATEGY-EPIC-002.md → USER-006 section (20 min)
4. Watch @qa run first QA gate (30 min)
5. Run your own test suite (`npm test`) (10 min)
6. Ready to start QA gates!

---

**QA Documentation Status:** COMPLETE
**Created:** May 15, 2026
**QA Lead:** @qa (Quinn)
**Last Updated:** May 15, 2026
