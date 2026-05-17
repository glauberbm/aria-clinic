# MVP Execution Plan — 4 Autonomous Terminals
**Timeline:** 2026-05-16 02:00 → 2026-05-19 23:59 (72 hours)
**Executor:** PM (@Morgan) orchestrating 4 parallel agents
**Mode:** YOLO (maximum speed, minimum manual interventionMode)
**Status:** READY FOR AUTONOMOUS EXECUTION

---

## Executive Summary

**MVP Goal:** User authentication + Patient management + Appointment booking (working end-to-end)

**Current State:**
- ✅ Auth system: 5 test users created
- ✅ Database schema: Partially applied (clinics, users, patients tables exist)
- ❌ BLOCKER: Appointments table missing (migration not applied)
- ⚠️ Seeding: Clinic & patients done, medications/medical history blocked by FK constraints

**Critical Path:**
1. **PHASE 1 (3h):** Resolve database schema gap — apply remaining migrations
2. **PHASE 2 (2h):** Complete data seeding — medications, appointments, medical history
3. **PHASE 3 (4h):** Integration testing — login → view patients → book appointment
4. **PHASE 4 (2h):** Bug fixes + deployment prep

---

## 🔴 BLOCKING ISSUE: Migrations Not Applied

**Problem:** 10 migration files exist locally but `appointments` table missing from remote database.

**Why it happened:**
- User doesn't have `SUPABASE_ACCESS_TOKEN` (requires manual dashboard access)
- `supabase db push` cannot execute autonomously
- Supabase doesn't support arbitrary SQL execution via REST API

**Solutions (in priority order):**

### Option A: Manual SQL Paste (5 minutes)
1. User goes to: https://byzxpksxdywnsfjvazaf.supabase.co/sql
2. Login with Supabase account
3. Paste contents of `supabase/all-migrations-combined.sql`
4. Click "Run"
5. Done ✅

**Why this is best:** 100% reliable, works from any device, no special setup

---

### Option B: Auto-Generated Setup Script (30 minutes)
```bash
# 1. Get personal access token (manual once)
# Go to: https://app.supabase.com/account/tokens
# Create token, copy to clipboard

# 2. Export it
export SUPABASE_ACCESS_TOKEN='sbp_...' # paste your token

# 3. Link and push (automated)
npx supabase link --project-ref byzxpksxdywnsfjvazaf
npx supabase db push
```

Once token is set, agents can automate the rest.

---

### Option C: Wait for User to Execute Migration
If neither A nor B is available, agents SKIP migration and focus on:
- UI development
- Integration test setup
- Deployment scaffolding
- Documentation

---

## Terminal 1: @dev — Implement Features

**Responsibility:** Code implementation, bug fixes, integration

**Prerequisites:**
- Migrations applied (Option A or B above)
- `seed-complete.js` executed successfully

**Workflow:**

```
▶ START: Check database state
  └─ SELECT COUNT(*) FROM appointments ← must return 0 rows
  └─ If missing: HALT → escalate to @pm

✅ CHECKPOINT 1: Verify schema (5 min)
  • clinics table ✅
  • patients table ✅
  • appointments table ✅
  • medications table ✅
  • medical_history table ✅

▶ TASK 1: Implement patient list view (30 min)
  • GET /api/patients → fetch from Supabase
  • Filter by clinic_id + RLS auth
  • Sort by last_visited
  • Status: Ready

✅ CHECKPOINT 2: Test patient list endpoint (10 min)
  • curl -H "Authorization: Bearer {jwt}" GET /api/patients
  • Verify RLS enforcement (only own clinic patients visible)
  • Verify field filtering (no emails, PHI, etc.)

▶ TASK 2: Implement appointment booking (45 min)
  • POST /api/appointments
  • Validation: patient exists, no conflicts, 24h notice
  • RLS: Patient can only book own appointments
  • Doctor can only book for own clinic
  • Status: Ready

✅ CHECKPOINT 3: Test appointment booking (15 min)
  • Create appointment via API
  • Verify conflict prevention
  • Verify RLS boundaries
  • Verify audit logging

▶ TASK 3: Bug fix — audit log FK constraint (20 min)
  • Issue: medications/medical_history seeding fails
  • Root: audit log checking role but user_roles not in clinic context
  • Fix: Update audit trigger to handle non-staff inserts
  • Status: Ready

✅ CHECKPOINT 4: Re-run seeding (10 min)
  • node scripts/seed-complete.js
  • Verify 13 appointments seeded
  • Verify 10 medications seeded
  • Verify 5 medical history records seeded

▶ TASK 4: Code review + cleanup (20 min)
  • Remove console.logs from production code
  • Verify error boundaries
  • Type checking: npm run typecheck
  • Lint: npm run lint
  • Status: Ready

✅ FINAL CHECKPOINT: Ready for QA
  • All tests pass
  • Linting passes
  • Type checking passes
```

**Parallel with @qa:** While implementing, @qa runs integration tests

---

## Terminal 2: @qa — Testing & Validation

**Responsibility:** Integration tests, end-to-end flows, quality gates

**Prerequisites:** Same as @dev

**Workflow:**

```
▶ START: Setup test environment (10 min)
  • Clear test database (or use separate test schema)
  • Seed test data (10 patients, 3 doctors, 5 receptionists)
  • Create test users with JWT tokens

✅ CHECKPOINT 1: Auth flow validation (20 min)
  • POST /auth/login with test email
  • Verify JWT token returned
  • Verify token includes user_id, clinic_id, role
  • Test token expiry (24h)
  • Test refresh token flow

▶ TASK 1: Patient list integration test (20 min)
  • Scenario: Doctor logs in → sees only own clinic patients
  • Expected: 10 patients returned (clinic-filtered)
  • Verify response schema: id, name, email_verified, last_appointment, etc.
  • RLS boundary: Cannot see other clinic patients (403 Forbidden)
  • Status: Ready

▶ TASK 2: Appointment booking end-to-end (30 min)
  • Scenario 1: Patient books appointment with available doctor
    • Doctor has free slot
    • 24h advance notice met
    • Expected: appointment created, reminder scheduled
  • Scenario 2: Conflict detection
    • Doctor already booked at that time
    • Expected: 409 Conflict
  • Scenario 3: Unauthorized attempt
    • Patient tries to book for another patient
    • Expected: 403 Forbidden (RLS blocks)
  • Status: Ready

✅ CHECKPOINT 2: Complete end-to-end flow (20 min)
  • 1. Login as patient
  • 2. View available doctors (GET /api/doctors?clinic_id=X&available=true)
  • 3. View available times (GET /api/doctors/{id}/availability)
  • 4. Book appointment (POST /api/appointments)
  • 5. View confirmation (GET /api/appointments/{id})
  • Expected: All endpoints work, response times < 300ms

▶ TASK 3: Data integrity tests (20 min)
  • FK constraint: Cannot delete clinic with active patients (should fail)
  • Audit logging: Every appointment creates audit_log entry
  • RLS enforcement: Non-admins cannot access other clinics
  • Status: Ready

✅ CHECKPOINT 3: Performance baseline (10 min)
  • GET /api/patients: response time?
  • GET /api/appointments: response time?
  • POST /api/appointments: response time?
  • Set baseline for future optimization

▶ TASK 4: Error scenario testing (15 min)
  • Missing auth header → 401 Unauthorized
  • Invalid JWT → 401 Unauthorized
  • Expired JWT → 401 Unauthorized
  • Invalid clinic_id → 404 Not Found
  • Invalid patient_id → 404 Not Found
  • Status: Ready

✅ FINAL CHECKPOINT: QA Gate
  • All integration tests pass
  • No critical bugs
  • RLS enforcement verified
  • Performance acceptable
```

**Gate Decision:** GO/WAIVE (document any waivers)

---

## Terminal 3: @architect — Technical Validation

**Responsibility:** Architecture review, security, scalability checks

**Prerequisites:** @dev code complete

**Workflow:**

```
▶ START: Code review (30 min)
  • Security: No hardcoded credentials ✅
  • Auth: JWT validation on every endpoint ✅
  • RLS: Every query includes clinic context ✅
  • Error handling: No 500 errors without logging ✅
  • Database: Proper indexes on FK columns ✅

✅ CHECKPOINT 1: Architecture compliance (15 min)
  • API routes follow REST conventions
  • Request/response schemas consistent
  • Database relationships properly normalized
  • Status: Ready

▶ TASK 1: Security audit (25 min)
  • RLS policies: Cannot bypass via direct table access
  • Input validation: All user inputs sanitized
  • SQL injection: Parameterized queries everywhere
  • XSS: Response headers set (X-Content-Type-Options, etc.)
  • CORS: Properly configured
  • Status: Ready

▶ TASK 2: Database optimization (20 min)
  • Check indexes exist on:
    • FK columns (user_id, clinic_id, patient_id)
    • Query filter columns (created_at, status)
  • Check query plans (EXPLAIN ANALYZE)
  • Verify: appointments(doctor_id, start_time) indexed
  • Verify: patients(clinic_id, created_at) indexed
  • Status: Ready

✅ CHECKPOINT 2: Performance review (15 min)
  • Large dataset simulation: 1000+ patients → query time acceptable?
  • Concurrent requests: 10 parallel requests → no race conditions?
  • Memory usage: Normal operating range?
  • Status: Ready

▶ TASK 3: Scalability assessment (15 min)
  • Current: 5 users, ~50 records
  • Projected (6 months): 500 users, 50k records
  • Bottlenecks identified?
  • Caching strategy needed?
  • Replication needed?
  • Status: Documented for Phase 2

▶ TASK 4: Deployment readiness (15 min)
  • Environment configuration: dev/staging/prod isolated?
  • Secrets management: No credentials in code?
  • Monitoring: Error logs captured?
  • Backup strategy: Database backups automated?
  • Status: Ready

✅ FINAL CHECKPOINT: Architecture Gate
  • Code quality: ✅
  • Security posture: ✅
  • Scalability plan: ✅
  • Deployment ready: ✅
```

**Gate Decision:** APPROVED (or document improvements for Phase 2)

---

## Terminal 4: @devops — Deployment & Infrastructure

**Responsibility:** CI/CD, deployment, monitoring setup

**Prerequisites:** All other terminals complete

**Workflow:**

```
▶ START: CI/CD setup (20 min)
  • Verify GitHub Actions workflows
  • Run test suite: npm test
  • Run linting: npm run lint
  • Build verification: npm run build
  • Status: Ready

✅ CHECKPOINT 1: Code quality gates (10 min)
  • All tests passing ✅
  • Linting passing ✅
  • Type checking passing ✅
  • No critical vulnerabilities (npm audit)

▶ TASK 1: Staging deployment (30 min)
  • Build Docker image (if applicable)
  • Deploy to staging environment
  • Run smoke tests against staging
  • Verify: Login → View patients → Book appointment (all work)
  • Status: Ready

▶ TASK 2: Production deployment (20 min)
  • Tag release: v0.1.0-mvp
  • Create GitHub release
  • Deploy to production
  • Verify same smoke tests
  • Status: Done

✅ CHECKPOINT 2: Post-deployment validation (10 min)
  • Production health check passing?
  • Database backups running?
  • Error logs flowing to monitoring?
  • Performance metrics baseline captured?

▶ TASK 3: Documentation (15 min)
  • README: Updated with MVP feature list
  • DEPLOYMENT.md: Instructions for future releases
  • API.md: Endpoint documentation
  • ENV: Sample .env for staging/prod
  • Status: Ready

▶ TASK 4: Monitoring & alerts (15 min)
  • Error tracking: Sentry (or similar) configured
  • Performance monitoring: API latency tracked
  • Database monitoring: Connections, query times
  • Uptime monitoring: Ping endpoint health
  • Status: Ready

✅ FINAL CHECKPOINT: Production Ready
  • All systems operational ✅
  • Monitoring active ✅
  • Backups verified ✅
  • Team trained ✅
```

**Decision:** SHIP TO PRODUCTION ✅

---

## 📋 Checkpoints & Success Criteria

### Phase 1: Database (BLOCKER)
| Checkpoint | Success Criteria | Owner |
|-----------|-----------------|-------|
| Migrations applied | All 10 migrations execute without error | @pm (manual option A/B) |
| Tables verified | clinics, users, patients, appointments, medications all exist | @qa |
| Schema correct | FK constraints, RLS policies, indexes in place | @architect |

### Phase 2: Data (3h)
| Checkpoint | Success Criteria | Owner |
|-----------|-----------------|-------|
| Seeding complete | 10 patients + 13 appointments + 10 medications created | @dev |
| RLS working | Patient can only see own records | @qa |
| Triggers firing | audit_log entries created on patient updates | @qa |

### Phase 3: Integration (4h)
| Checkpoint | Success Criteria | Owner |
|-----------|-----------------|-------|
| End-to-end flow | Login → View patients → Book appointment works | @qa |
| API response times | All endpoints < 300ms average | @qa |
| RLS enforcement | Unauthorized access blocked with 403 Forbidden | @architect |
| Error handling | All error scenarios documented + handled | @dev |

### Phase 4: Deployment (2h)
| Checkpoint | Success Criteria | Owner |
|-----------|-----------------|-------|
| Tests pass | npm test returns exit code 0 | @devops |
| Build succeeds | npm run build completes without error | @devops |
| Staging works | All MVP features work in staging | @devops |
| Production live | All MVP features work in production | @devops |

---

## ⚡ Quick Terminal Activation

### Terminal 1 (@dev):
```bash
# Copy into terminal 1:
node scripts/seed-complete.js && npm run dev
# Then follow PHASE 1-3 workflow above
```

### Terminal 2 (@qa):
```bash
# Copy into terminal 2:
npm test -- --watch
# And follow integration testing workflow
```

### Terminal 3 (@architect):
```bash
# Copy into terminal 3:
# Code review mode
# Check: src/api/*, src/components/*, supabase/sql/*
# Verify: RLS, performance, security
```

### Terminal 4 (@devops):
```bash
# Copy into terminal 4:
npm run build && npm run lint && npm run typecheck
# Then follow deployment workflow
```

---

## 🛑 If Migrations Blocked

If Option A (manual paste) or B (token) not available, agents execute **degraded MVP**:

**What still works:**
- ✅ Patient management (view/edit existing patients)
- ✅ User authentication (login/logout)
- ✅ RLS enforcement (data isolation)

**What's blocked:**
- ❌ Appointment booking (table missing)
- ❌ Medication management (seeding fails)

**Contingency:** Focus on **Phase 1 features** while user sleeps:
1. Patient view/search/filter
2. User profile management
3. Auth flow hardening
4. UI polish

Then apply migrations when user wakes up, and continue with Phase 2.

---

## 📞 Escalation Path

| Issue | Action |
|-------|--------|
| Database error | @dev escalates to @pm → check migration status |
| Test failure | @qa escalates to @dev → provide failing test output |
| Code quality issue | @architect escalates to @dev → document fix required |
| Deployment error | @devops escalates to @architect → verify config |

---

## ✅ MVP Success = All 4 Terminals Report "COMPLETE"

**What "complete" means:**
- ✅ User can login with email/password
- ✅ User sees list of patients (filtered by clinic + RLS)
- ✅ User can book appointment with available doctor
- ✅ Confirmation email sent (or logged)
- ✅ All tests passing
- ✅ Code reviewed + approved
- ✅ Deployed to production

---

**Status:** 🚀 READY FOR AUTONOMOUS EXECUTION
**Start Time:** 2026-05-16 02:00 UTC
**Target Completion:** 2026-05-19 23:59 UTC
**Owner:** Morgan (@pm) orchestrating 4 agents
**Mode:** YOLO (max speed)
