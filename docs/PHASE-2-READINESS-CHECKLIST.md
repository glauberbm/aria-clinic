# Phase 2 Readiness Checklist — Pre-Kickoff Validation

**Document Purpose:** Verify all prerequisites for Phase 2 kickoff on May 20, 2026
**Owner:** @sm (Scrum Master)
**Status:** ACTIVE (in progress)
**Last Updated:** May 16, 2026

---

## 🎯 Critical Path to May 20 Kickoff

```
May 17-18: Clinic Decision Meeting (@pm)
    ↓
May 19: Clinic Approval (MUST HAVE)
    ↓
May 19: Audit Questionnaire Due (data migration scope)
    ↓
May 20: Phase 2 Kickoff (Requirements Workshop + Dev Start)
```

---

## ✅ COMPLETED (May 16)

### Code & Infrastructure
- [x] Phase 1 MVP complete and tested (344/344 tests passing)
- [x] All Phase 1 code committed (commit efded0e+)
- [x] GitHub Actions CI/CD pipeline created
- [x] Staging environment blueprint complete (8 files, 1,200+ lines)
- [x] Staging database schema documented (SUPABASE-SCHEMA.md)
- [x] Staging seed data expanded (25+ patients, 50+ appointments, test payment/WhatsApp data)
- [x] Staging deployment procedure documented (6-stage pipeline)

### Planning & Documentation
- [x] Phase 2 roadmap complete (6-week timeline, 25-30 stories, 3 EPICs)
- [x] EPIC-004 stories ready (7 stories, 22 hours estimated)
- [x] EPIC-005 outline drafted (30 story templates, 4 themes)
- [x] EPIC-006 UAT & rollout plan drafted
- [x] Success criteria documented (4 production gates)
- [x] MVP metrics baseline established (75% coverage, 92.8% tests passing)

### Clinic Engagement Materials
- [x] CLINIC-EXECUTIVE-BRIEF-SLIDES.md (7 slides, financial ROI case)
- [x] CLINIC-DECISION-FORM.md (5 decision sections, 4-signature authorization)
- [x] LEGACY-DATA-AUDIT-QUESTIONNAIRE.md (11-section assessment form)
- [x] PHASE-2-REQUIREMENTS-WORKSHOP.md (3-session workshop plan, 50+ test scenarios)
- [x] EXECUTIVE-BRIEF.md (2,000-word business case for clinic leadership)
- [x] PM-CLINIC-ENGAGEMENT-BRIEFING.md (detailed talking points + contingencies)

### Team Readiness
- [x] Stories created and reviewed (all ready for development)
- [x] Acceptance criteria detailed in story files
- [x] Technical dependencies identified (no blocking external dependencies)
- [x] Team roles confirmed (@dev, @qa, @architect, @sm, @devops)

---

## 🟡 IN PROGRESS (May 17-19)

### Task: Clinic Decision Meeting & Approval

**Owner:** @pm (Morgan)
**Timeline:** May 17-18 (meeting) → May 19 (decision form due)
**Deliverables:**

- [ ] **Clinic Leadership Meeting Scheduled** (May 17-18)
  - [ ] Venue booked
  - [ ] Attendees confirmed: CEO, Ops Manager, IT Lead, Finance Manager
  - [ ] Presentation materials printed/digital (CLINIC-EXECUTIVE-BRIEF-SLIDES.md)
  - [ ] Decision Form ready for signing (CLINIC-DECISION-FORM.md)
  - [ ] PM briefing guide reviewed by @pm (PM-CLINIC-ENGAGEMENT-BRIEFING.md)

- [ ] **Clinic Decision Form Signed**
  - [ ] Section 1: Budget Approval ($65,950) — Approved / Negotiate / No
  - [ ] Section 2: Timeline (July 14 go-live) — Approved / Alternate date
  - [ ] Section 3: UAT Commitment (3-5 staff, June 24-30) — Yes / Conditional
  - [ ] Section 4: Legacy Data Migration — Self-assessed scope (A/B/C/D/E)
  - [ ] Section 5: Feature Priority — Ranked (Scheduler, Payments, WhatsApp, Analytics)
  - [ ] **4 Authorized Signatures:** CEO, Ops Manager, IT Lead, Finance Manager

- [ ] **Decision Result: YES / NO / NEGOTIATE**
  - [ ] If YES: Proceed to May 19 handoff
  - [ ] If NEGOTIATE: Counter-proposal within 24h (May 18-19)
  - [ ] If NO: Document feedback, propose June 15 follow-up

---

## 📋 CONDITIONAL (May 19-20, After Clinic Approval)

**Trigger:** Clinic approval decision (YES or NEGOTIATE agreement by May 19)
**Owner:** @sm (Project Coordination)

### Task: Clinic Audit Questionnaire & Data Scope Assessment

**Due:** May 19, 2026
**Deliverable:** Completed LEGACY-DATA-AUDIT-QUESTIONNAIRE.md

- [ ] Clinic IT Lead submits questionnaire answers
  - [ ] Current system type (database/spreadsheet/SaaS/paper)
  - [ ] Patient data volume (expected row count)
  - [ ] Appointment data volume (expected row count)
  - [ ] Data fields needed (from current system)
  - [ ] Data quality assessment (duplicates, consistency, validation gaps)
  - [ ] Data location & export capability
  - [ ] GDPR/LGPD compliance status

- [ ] @sm analyzes response → determine migration effort
  - [ ] Scenario A: Greenfield (0 hours, $0)
  - [ ] Scenario B: Small & Clean (4-8 hours, $0)
  - [ ] Scenario C: Medium (20-40 hours, $2,000)
  - [ ] Scenario D: Large (40-80 hours, $4,000-6,000)
  - [ ] Scenario E: Problematic (80+ hours, $6,000+, may defer)

- [ ] @sm documents migration plan
  - [ ] Effort estimate confirmed
  - [ ] Timeline (before/after go-live)
  - [ ] Clinic data cutover procedure
  - [ ] Rollback plan if data import fails

---

## 🚀 REQUIRED (May 20, Kickoff Day)

**Trigger:** Clinic approval (YES) from May 19
**Owner:** @sm (Scrum Master lead)

### Task 1: Requirements Workshop (3 Sessions)

**Schedule:** May 20 (2h) + May 21 (1.5h) + May 22 (1.5h)
**Attendees:**

From Clinic:
- [ ] Operations Manager (Scheduler, WhatsApp confirmation)
- [ ] Finance Manager (Payments, invoicing, reconciliation)
- [ ] IT Lead (integration, API keys, compliance)
- [ ] Optional: Doctor(s) (scheduler availability, workflow)

From Team:
- [ ] @sm (facilitator, notes)
- [ ] @architect (technical feasibility discussion)
- [ ] @dev (implementation constraints)
- [ ] @designer (UI/UX confirmation)

**Session 1: Feature Requirements Deep-Dive (2h, May 20)**

Scheduler (45 min):
- [ ] Doctor availability rules (working hours, days off, lunch breaks)
- [ ] Patient booking constraints (advance booking window, max duration)
- [ ] Appointment types (consultation, follow-up, emergency, cancellation fees)
- [ ] Conflicts & overboking rules (allow double-booking for emergencies? yes/no)
- [ ] Slot granularity (15-min, 30-min, 1-hour slots?)
- [ ] Cancellation notification (clinic decision: immediately vs. 24h buffer?)

Payments (45 min):
- [ ] Payment methods accepted (credit card, PIX, boleto, cash)
- [ ] Pricing model: Per-appointment vs. subscription (decision)
- [ ] Tax requirements (NF-e generation, billing address, CNPJ)
- [ ] Invoice frequency (immediately, end-of-day, weekly summary?)
- [ ] Refund policy (full refund if cancelled >24h? clinic decides)
- [ ] Reconciliation SLA (daily, weekly, monthly?)

WhatsApp (20 min):
- [ ] Reminder timing: 24h before + 1h before? (or custom)
- [ ] Language: Portuguese BR / Spanish / English?
- [ ] Template review (clinic approves exact message text)
- [ ] Opt-in/opt-out: Patient can disable reminders? (yes/no clinic decision)
- [ ] Clinic number for replies (WhatsApp from clinic or from Aria support?)

Analytics (10 min):
- [ ] Key metrics wanted (no-show rate, revenue per doctor, avg appointment duration, etc.)
- [ ] Report frequency (weekly, monthly dashboard access)
- [ ] Export formats (PDF, CSV, email digest)
- [ ] Access control (all staff or only managers?)

**Session 2: UAT Planning (1.5h, May 21)**

- [ ] Review 50+ test scenarios document
- [ ] Clinic confirms test environment access (staging URL)
- [ ] Clinic commits UAT staff (3-5 people, June 24-30)
- [ ] Testing roles assigned:
  - [ ] Receptionist: Appointment booking, cancellation, WhatsApp flow
  - [ ] Doctor: Availability, schedule view, patient information
  - [ ] Finance: Payment processing, invoice generation, reconciliation
  - [ ] Manager: Analytics dashboard, reporting, system health
- [ ] UAT sign-off criteria confirmed (what defines "pass"?)
- [ ] Bug severity definitions (Critical / Important / Minor)
- [ ] Fix timeline SLA (critical bugs: 24h, important: 3 days, minor: defer)

**Session 3: Staff Training & Go-Live Prep (1.5h, May 22)**

- [ ] Training materials reviewed (videos, guides, user manuals)
- [ ] Training dates confirmed: July 10-12 (48h before go-live)
- [ ] Who needs training:
  - [ ] All receptionists (scheduler, WhatsApp, payments)
  - [ ] All doctors (availability, patient messaging)
  - [ ] All finance staff (invoicing, payment reconciliation)
  - [ ] Manager (analytics, reports, system health)
- [ ] Training format: In-person (preferred) or videos?
- [ ] Data cutover procedure reviewed:
  - [ ] Timing (July 13 evening vs. July 14 morning?)
  - [ ] Downtime window (clinic closed or accepting phone-only bookings?)
  - [ ] Rollback plan (if data import fails, clinic reverts to old system)
  - [ ] Staff communication (how do staff find out go-live happened?)
- [ ] Post-launch support confirmed:
  - [ ] 24/7 support first week (our team on-call)
  - [ ] Help desk setup (who clinic contacts for issues?)
  - [ ] SLA for bug fixes (critical: 4h, important: 8h, minor: 24h)

**Deliverable:** REQUIREMENTS-WORKSHOP-NOTES.md (clinic + team jointly sign)

### Task 2: Development Kickoff

**Owner:** @dev (Dex)
**Start:** May 20 (after morning workshop session)

- [ ] EPIC-004 development begins
  - [ ] CALE-001 (Calendar View) starts May 20
  - [ ] Story details refined based on requirements workshop
  - [ ] Development environment verified (staging Supabase credentials working)

- [ ] Daily standups resume (09:00 UTC daily)
  - [ ] @dev: Progress on current story, blockers
  - [ ] @qa: QA gates on completed stories
  - [ ] @sm: Timeline tracking, risk management
  - [ ] @architect: Technical decisions, design reviews

- [ ] Story tracking active
  - [ ] JIRA/GitHub issues linked to stories
  - [ ] Daily updates to story File List sections
  - [ ] Acceptance criteria checked as tasks complete

### Task 3: Staging Deployment Preparation

**Owner:** @devops (Gage)
**Timeline:** May 20-24

- [ ] Verify GitHub Secrets configured (7 secrets for staging)
  - [ ] SUPABASE_PROJECT_URL (staging)
  - [ ] SUPABASE_ANON_KEY (staging)
  - [ ] SUPABASE_ADMIN_KEY (staging)
  - [ ] VERCEL_TOKEN
  - [ ] VERCEL_ORG_ID
  - [ ] VERCEL_STAGING_PROJECT_ID
  - [ ] VERCEL_SCOPE

- [ ] Supabase staging environment ready
  - [ ] CLI authentication configured (`supabase login`)
  - [ ] Staging project linked (`supabase link`)
  - [ ] Database migrations ready to push (`supabase db push`)
  - [ ] Seed data ready to load (seed-staging.sql)
  - [ ] RLS policies verified

- [ ] GitHub Actions CI/CD pipeline ready
  - [ ] Workflow file: `.github/workflows/deploy-staging.yml`
  - [ ] Triggers: Push to main/develop, manual dispatch
  - [ ] All 6 stages tested (checkout, build, db, deploy, smoke tests, notify)
  - [ ] Slack notification configured (optional, if clinic wants updates)

- [ ] May 24 staging deployment scheduled
  - [ ] Team available for monitoring (8am-6pm UTC)
  - [ ] Rollback procedure documented
  - [ ] Health checks verified (API health endpoint working)

### Task 4: QA Phase Preparation

**Owner:** @qa (Quinn)
**Timeline:** May 20-23

- [ ] EPIC-003 Wave 1 QA Gate scheduled (May 20, 8 hours)
  - [ ] Test environment: Main branch + recent merged code
  - [ ] QA checklist ready (7 quality checks)
  - [ ] Verdict: PASS / CONCERNS / FAIL / WAIVED
  - [ ] Result determines Wave 2 unblock timing

- [ ] @qa review of EPIC-004 stories
  - [ ] Acceptance criteria understood
  - [ ] Test scenarios drafted for each story
  - [ ] API test endpoints identified
  - [ ] UI test flow documented

- [ ] Staging QA readiness
  - [ ] Staging environment test credentials ready
  - [ ] Smoke tests documented (health check, auth flow, dashboard load)
  - [ ] Performance test baseline established (load times)

---

## ⚠️ BLOCKERS & FALLBACK PROCEDURES

### If Clinic Says NO (May 19)

- [ ] Do NOT start Phase 2 development
- [ ] Document clinic feedback
- [ ] Schedule follow-up meeting June 15
- [ ] Keep Phase 2 team on standby (may resume June 1)
- [ ] Delay @devops staging setup (wait for approval)

### If Clinic Says NEGOTIATE (May 19)

- [ ] @pm & @architect prepare 2-3 counter-proposals within 24h
  - Option A: Defer non-critical feature (saves cost)
  - Option B: Extend timeline (defer go-live to July 28)
  - Option C: Reduce scope (core features only, defer analytics)
- [ ] Schedule follow-up call May 19 afternoon (evening if needed)
- [ ] Target: Agreement by May 19 EOD, proceed May 20
- [ ] If agreement not reached by May 19: Defer kickoff to May 27

### If Audit Questionnaire Shows "Problematic" Scope (May 19)

- [ ] @sm discusses with clinic: greenfield launch (new patients) vs. migrate legacy
- [ ] Options:
  - Option A: Greenfield launch July 14, migrate legacy data September Phase 2.5
  - Option B: Delay go-live to September 1 (allow migration prep time)
- [ ] Decision by May 20, impacts UAT scope and data prep timeline

### If Requirements Workshop Reveals Missing Requirements (May 20-22)

- [ ] @sm documents in REQUIREMENTS-WORKSHOP-NOTES.md
- [ ] @architect assesses impact: story scope change vs. timeline extension
- [ ] If scope is major: Propose deferring non-critical feature to Phase 2.5
- [ ] Clinic must approve scope change to proceed with that story

---

## 📊 Success Criteria for May 20 Kickoff

Kickoff is **GO** if:

- [x] Phase 1 code complete and committed ✅
- [ ] Clinic approval received (YES on decision form)
- [ ] Clinic audit questionnaire submitted
- [ ] Requirements workshop scheduled & confirmed
- [ ] All 7 EPIC-004 stories detailed (ready for @dev)
- [ ] Staging environment blueprint ready for @devops to execute
- [ ] Daily standup scheduled (09:00 UTC daily)
- [ ] Team contacts confirmed and available
- [ ] GitHub Actions CI/CD pipeline tested
- [ ] RLS policies verified in schema

---

## 📞 Escalation Contacts

| Role | Contact | Availability | Authority |
|------|---------|--------------|-----------|
| Clinic Approval (Decision) | @pm (Morgan) | May 17-19 | Clinic CEO |
| Timeline/Scope Issues | @sm (River) | Daily | @pm approval |
| Technical Feasibility | @architect (Aria) | Daily | @dev implementation |
| Deployment Readiness | @devops (Gage) | May 20-24 | May 24 go-live |
| QA Gate Verdict | @qa (Quinn) | May 20 | PASS/FAIL decision |

---

## 📝 Sign-Off (When Applicable)

| Condition | When | Who | Status |
|-----------|------|-----|--------|
| Phase 1 complete | May 16 | @dev + @qa | ✅ DONE |
| Clinic approval | May 19 | Clinic + @pm | 🟡 PENDING |
| Requirements locked | May 22 | Clinic + @sm | 📋 PENDING |
| Staging ready | May 24 | @devops | 📋 PENDING |
| May 20 kickoff GO | May 19 EOD | @sm | 🟡 PENDING |

---

**Document Owner:** @sm (Scrum Master)
**Last Updated:** May 16, 2026
**Next Update:** May 17 (post-clinic meeting)
**Critical Review:** May 19 (before kickoff approval)
