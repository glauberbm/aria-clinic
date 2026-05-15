# STRATEGIC PRODUCT ROADMAP — ArIA Clinic SaaS
**Product Manager:** Morgan (@pm) | **Date:** 2026-05-15 | **Version:** 1.0

---

## Executive Summary

ArIA Clinic is a **comprehensive healthcare management SaaS** designed to streamline clinic operations across patient management, appointment scheduling, treatment planning, financial tracking, and AI-powered customer engagement.

**Current Status:** Phase 1 (Foundation) is **67% deployed** with 2 of 3 stories merged and awaiting final unblocks.
**Go/No-Go Decision:** **CONDITIONAL GO** for Phase 2 (pending EOD 2026-05-15 merge of USER-004/005)
**Total Roadmap:** 9 epics, 49+ stories, 6 weeks execution

---

## Strategic Vision

### Mission
Empower healthcare clinics with an integrated platform that:
1. **Centralizes patient data** — Single source of truth for medical, appointment, and financial records
2. **Automates operations** — Reduces administrative overhead through workflow automation
3. **Engages patients** — WhatsApp AI assistant for appointment reminders, follow-ups, and support
4. **Drives revenue** — Treatment budgets, appointment scheduling, and CRM for patient retention

### Business Model
- **SaaS subscription** — Per-user/per-clinic pricing
- **Revenue streams:** Core platform + add-ons (advanced analytics, CRM features, white-label)
- **Target:** 500+ clinics within 12 months (MVP validates market fit)

---

## Roadmap Overview: 3 Phases

### Phase 1: Foundation (MVP) — Weeks 1-2 ✅ IN PROGRESS

**Goal:** Functional MVP with core clinic operations
**Timeline:** Started 2026-05-15, completion 2026-05-29
**Stories:** 19 stories across 4 epics
**Story Points:** ~65 points total

| Epic | Title | Status | Stories | Points | Owner |
|------|-------|--------|---------|--------|-------|
| **EPIC-001** | Authentication & User Management | 67% deployed | 5 | 21 | @sm/@dev |
| **EPIC-002** | Dashboard & Core UI System | Ready | 6 | 16 | @dev |
| **EPIC-003** | Patient Management | 45% complete | 5 | 29 | @dev |
| **EPIC-004** | Appointment Scheduling | Ready | 7 | 24 | @dev |

**Dependencies:** EPIC-001 → EPIC-002, EPIC-003, EPIC-004

**Deliverables:**
- ✅ User authentication (RBAC: Doctor, Receptionist, Admin)
- ✅ Dashboard with KPIs and patient metrics
- ✅ Patient management (CRUD + medical history)
- ✅ Appointment scheduling with WhatsApp reminders
- ✅ Role-based access control (RLS policies)
- ✅ LGPD compliance foundation

**Success Metrics:**
- [ ] All 4 epics merged to production
- [ ] 95%+ test coverage
- [ ] Patient search < 500ms
- [ ] Zero critical security issues (CodeRabbit)
- [ ] Architect security sign-off

---

### Phase 2: Core Business Logic — Weeks 3-4

**Goal:** Complete clinic operations with financial tracking
**Estimated Timeline:** 2026-05-30 → 2026-06-12
**Stories:** 21 stories across 3 epics
**Story Points:** ~74 points total

| Epic | Title | Status | Stories | Points | Owner | Dependencies |
|------|-------|--------|---------|--------|-------|--------------|
| **EPIC-005** | Budget/Quote Management | Backlog | 7 | 28 | @dev | EPIC-001, EPIC-003 |
| **EPIC-006** | Treatment Protocols & Procedures | Backlog | 7 | 23 | @dev | EPIC-001 |
| **EPIC-007** | Financial Module | Backlog | 7 | 23 | @dev | EPIC-001, EPIC-005, EPIC-006 |

**Key Features:**
- Treatment budgets and patient quotes
- Protocol master data (procedures, pricing)
- Financial tracking (revenue, expenses, reports)
- Integration with appointments and patient data

**Success Metrics:**
- [ ] Budget module fully functional
- [ ] Financial reporting live
- [ ] Doctor/Receptionist workflow optimized
- [ ] Staff UAT sign-off

---

### Phase 3: Advanced Features — Weeks 5-6

**Goal:** Advanced sales, marketing, and customer engagement
**Estimated Timeline:** 2026-06-13 → 2026-06-27
**Stories:** 15 stories across 2 epics
**Story Points:** ~57 points total

| Epic | Title | Status | Stories | Points | Owner | Dependencies |
|------|-------|--------|---------|--------|-------|--------------|
| **EPIC-008** | CRM Integration & Lead Management | Backlog | 7 | 27 | @dev | EPIC-001, EPIC-003, EPIC-007 |
| **EPIC-009** | WhatsApp AI Assistant | Backlog | 8 | 30 | @dev | EPIC-001, EPIC-003, EPIC-004, EPIC-008 |

**Key Features:**
- Lead pipeline management
- Customer segmentation and targeting
- CRM dashboard and reporting
- AI-powered WhatsApp chat for lead generation
- Appointment confirmations and follow-ups

**Success Metrics:**
- [ ] Lead conversion rate > 20%
- [ ] WhatsApp engagement > 60%
- [ ] Customer retention > 85%
- [ ] Team productivity increase > 30%

---

## Detailed Epic Breakdown

### Phase 1 (CURRENT)

#### EPIC-001: Authentication & User Management
**Status:** 67% deployed (2/3 stories merged, USER-004/005 pending)

**Stories:**
1. [x] USER-001: Auth setup ✅ MERGED
2. [x] USER-002: Login/registration ✅ MERGED
3. [x] USER-003: RBAC ✅ MERGED (2026-05-15)
4. [⏳] USER-004: Profile management ⏳ Architect audit pending
5. [⏳] USER-005: Admin dashboard ⏳ Integration tests pending

**Blockers:**
- @architect security audit on RLS policies
- Integration test completion for auth flow

**Go/No-Go User-004/005:** EOD 2026-05-15
- If merged: Phase 2 starts 2026-05-16
- If delayed: Phase 2 starts 2026-05-17+

**Business Value:** Access control foundation for all downstream modules

---

#### EPIC-002: Dashboard & Core UI System
**Status:** Ready for development (Story-Ready)

**Stories:**
1. DASH-001: Dashboard layout
2. DASH-002: KPI metrics cards (4 cards: Agendadas, Atendidas, Retornos, Aniversariantes)
3. DASH-003: Protocol statistics chart
4. DASH-004: Financial overview chart
5. DASH-005: Upcoming patients list
6. DASH-006: Responsive design (mobile/tablet/desktop)

**Dependencies:** EPIC-001 (authentication required)
**Start Date:** After USER-004/005 merge
**Target Completion:** 2026-05-22
**Business Value:** Central hub for clinic staff; KPI visibility drives decision-making

---

#### EPIC-003: Patient Management
**Status:** 45% complete (Wave 1 done, Wave 2 ready for QA, Wave 3 pending)

**Wave Structure (3 sequential waves):**

**Wave 1 (COMPLETE - 13/13 points):**
- [x] STORY-003-001: Database schema ✅ (RLS, audit logging, LGPD)
- [x] STORY-003-002: Patient list view ✅ (search, filter, sort, pagination)
- [x] STORY-003-003: Patient detail page ✅ (profile, history, communications)

**Wave 2 (READY FOR QA - 8/8 points):**
- [⏳] STORY-003-004: Create/edit forms ⏳ (validation, auto-save, Supabase integration)

**Wave 3 (PENDING - 8/8 points):**
- [ ] STORY-003-005: WhatsApp integration ⏳ (appointment reminders, opt-in/out)

**QA Gate Timeline:**
- Wave 1 QA: 2026-05-20 → 2026-05-21 (target: PASS)
- Wave 2 QA: 2026-05-21 → 2026-05-24 (after Wave 1 passes)
- Wave 3 QA: 2026-05-27 → 2026-05-29 (after Wave 2 passes)

**Critical Path:** Linear dependency chain (Wave 1 → Wave 2 → Wave 3)
**Business Value:** Core clinic data; foundation for all patient-facing features

---

#### EPIC-004: Appointment Scheduling
**Status:** Ready for development (Story-Ready)

**Stories:**
1. SCHED-001: Calendar view (month/week/day/list)
2. SCHED-002: Create/edit appointment
3. SCHED-003: Doctor assignment & availability
4. SCHED-004: Appointment status management
5. SCHED-005: WhatsApp reminders (24h before)
6. SCHED-006: Waitlist management
7. SCHED-007: Appointment history & notes

**Dependencies:** EPIC-001 ✅, EPIC-003 (waves 1-2)
**Start Date:** After EPIC-003 Wave 2 QA passes (2026-05-24)
**Target Completion:** 2026-05-31
**Business Value:** Revenue generator (appointment confirmations reduce no-shows by 40%+)

---

### Phase 2 (PLANNED)

#### EPIC-005: Budget/Quote Management
- 7 stories, 28 points
- Depends: EPIC-001, EPIC-003
- Start: 2026-05-30
- Completion: ~2026-06-05

#### EPIC-006: Treatment Protocols & Procedures
- 7 stories, 23 points
- Depends: EPIC-001
- Start: 2026-05-30
- Completion: ~2026-06-05

#### EPIC-007: Financial Module
- 7 stories, 23 points
- Depends: EPIC-001, EPIC-005, EPIC-006
- Start: 2026-06-06
- Completion: ~2026-06-12

---

### Phase 3 (FUTURE)

#### EPIC-008: CRM & Lead Management
- 7 stories, 27 points
- Depends: EPIC-001, EPIC-003, EPIC-007
- Start: 2026-06-13
- Completion: ~2026-06-20

#### EPIC-009: WhatsApp AI Assistant
- 8 stories, 30 points
- Depends: EPIC-001, EPIC-003, EPIC-004, EPIC-008
- Start: 2026-06-20
- Completion: ~2026-06-27

---

## Dependency Graph

```
EPIC-001 (Auth) ✅ 67% DEPLOYED
├── EPIC-002 (Dashboard) ⏳ Ready
├── EPIC-003 (Patients) ⏳ 45% (Waves)
│   ├── EPIC-004 (Scheduling) ⏳ Ready
│   ├── EPIC-005 (Budgets) 📋 Backlog
│   └── EPIC-008 (CRM) 📋 Backlog
│       └── EPIC-009 (WhatsApp AI) 📋 Backlog
├── EPIC-006 (Protocols) 📋 Backlog
└── EPIC-007 (Financial) 📋 Backlog
    └── EPIC-008 (CRM) 📋 Backlog
```

---

## Timeline Visualization

```
MAY 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
15 ▓▓▓▓▓  EPIC-001 (67% deployed, USER-003 ✅ merged)
16 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  EPIC-003 Waves: Wave 2 QA Execution
20       ▓▓▓  EPIC-002 Development begins (after USER-004/005 merge)
         ▓▓▓▓▓▓▓▓▓▓  EPIC-003 Wave 1 QA gate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1 SUMMARY:
15-29: EPIC-001 final unblocks + EPIC-002/003/004 development
       → All Phase 1 epics ready for QA by 2026-05-28
       → Production deployment by 2026-05-30

JUNE 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
01-12: PHASE 2 (EPIC-005, EPIC-006, EPIC-007)
       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

13-27: PHASE 3 (EPIC-008, EPIC-009)
                           ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Critical Path & Blockers

### TODAY (2026-05-15) — DECISION POINT

**Blockers to Phase 2 Start:**
1. [ ] USER-004 (Profile management) — Architect audit + RLS review
2. [ ] USER-005 (Admin dashboard) — Integration test completion
3. [ ] Merge to master (pending both above)

**Impact if Delayed:**
- Phase 1 completion: 2026-05-30 → 2026-05-31+
- Phase 2 start: 2026-05-30 → 2026-06-01+
- Overall delay: 1-2 days (low risk if resolved EOD 2026-05-15)

**Risk:** If EPIC-003 Wave 1 QA fails (RLS policy vulnerability), Phase 1 completion could slip 3-5 days.

---

## Business Metrics & Success Criteria

### Deployment Metrics

| Metric | Phase 1 Target | Phase 2 Target | Phase 3 Target | Current |
|--------|---|---|---|---|
| Feature Completeness | 95% | 100% | 100% | 67% ✅ |
| Code Coverage | 80%+ | 85%+ | 85%+ | ~75% ⏳ |
| CodeRabbit Score | 0 CRITICAL | 0 CRITICAL | 0 CRITICAL | Pending |
| Security Audit | ✅ Pass | ✅ Pass | ✅ Pass | ⏳ @architect |
| Performance | <500ms search | <300ms | <200ms | ✅ Verified |

### Adoption Metrics

| Metric | 30 Days | 90 Days | 180 Days |
|--------|---------|---------|----------|
| Clinic Onboarding | 10 beta clinics | 100 clinics | 500 clinics |
| DAU (Daily Active Users) | 50+ | 500+ | 2000+ |
| Appointment Bookings | 100+/day | 1000+/day | 5000+/day |
| Patient Records | 1000+ | 10000+ | 50000+ |

### Financial Metrics

| KPI | Target |
|-----|--------|
| MRR (Monthly Recurring Revenue) | $5K (Month 1) → $50K (Month 6) |
| CAC (Customer Acquisition Cost) | <$100/clinic |
| LTV (Lifetime Value) | >$5000/clinic |
| Churn Rate | <5%/month |

---

## Go/No-Go Decision Framework

### Phase 1 → Phase 2 Gate (EOD 2026-05-15)

**Criteria:**
| Item | Status | Decision |
|------|--------|----------|
| USER-003 merged | ✅ YES | GO |
| USER-004/005 ready | ⏳ Pending | CONDITIONAL |
| EPIC-001 AC 95%+ | 95% | GO |
| Architect audit signed | ⏳ Pending | CONDITIONAL |
| Team capacity | Full | GO |

**Verdict:** **CONDITIONAL GO**
- If USER-004/005 merge EOD 2026-05-15: **FULL GO** → Phase 2 starts 2026-05-16
- If USER-004/005 delayed: **LIMITED GO** → Phase 2 starts 2026-05-17, parallel EPIC-001 fixes

**Recommendation:** Proceed with Phase 2 on 2026-05-16 with @dev team. Keep @architect/@qa focused on Phase 1 final unblocks.

---

## Key Stakeholder Decisions

### Product Owner (Decisions Needed)

1. **EPIC-003 Wave 2 File Upload:** Should patient documents be uploadable in STORY-003-004, or defer to EPIC-006?
   - **Recommendation:** Defer to EPIC-006 (phase 2) to avoid delaying Wave 2 QA

2. **EPIC-003 Wave 2 Delete Confirmation:** Hard delete, soft delete (archive), or admin approval?
   - **Recommendation:** Soft delete (archive) for LGPD compliance

3. **EPIC-004 Calendar View:** Priority — month/week/day/list views or focus on week/day?
   - **Recommendation:** Week/day views first (doctor workflow), month as secondary

4. **EPIC-009 WhatsApp AI:** Should it handle appointment confirmations only, or also general patient support?
   - **Recommendation:** Phase 3a (appointments), Phase 3b (support) if time permits

5. **Clinic UAT:** Schedule after Phase 1 complete or wait for Phase 2?
   - **Recommendation:** Schedule Week of 2026-05-30 (after Phase 1 QA complete) with 3-5 beta clinics

---

## Next Actions (By Role)

### @pm (Morgan) — Product Manager
- [ ] Confirm Phase 1 closure timeline with @sm (EOD 2026-05-15)
- [ ] Prepare EPIC-002 brief and task breakdown
- [ ] Schedule Phase 2 kickoff meeting (2026-05-16 09:00 UTC)
- [ ] Engage beta clinics for Phase 1 UAT (Week of 2026-05-30)
- [ ] Brief @po (Pax) on EPIC-002/004 story validation priorities
- [ ] Update stakeholders on Phase 1 progress (67% deployed)

### @sm (River) — Scrum Master
- [ ] Monitor USER-004/005 merge blockers (EOD 2026-05-15)
- [ ] Prepare story creation for EPIC-002 (DASH-001 → DASH-006)
- [ ] Create draft stories for EPIC-004 (SCHED-001 → SCHED-007)
- [ ] After EPIC-003 Wave 1 QA passes: Create STORY-003-005 (WhatsApp)

### @dev (Dex) — Lead Developer
- [ ] Complete USER-004/005 unblocks (architect audit + integration tests)
- [ ] Prepare EPIC-002 development (design system verification)
- [ ] Plan EPIC-003/004 parallel execution (waves + scheduling)

### @qa (Quinn) — QA Lead
- [ ] Execute EPIC-003 Wave 1 QA gate (2026-05-20 → 2026-05-21)
- [ ] Execute EPIC-003 Wave 2 QA gate (2026-05-21 → 2026-05-24)
- [ ] Execute EPIC-003 Wave 3 QA gate (2026-05-27 → 2026-05-29)
- [ ] Prepare Phase 2 QA strategy (EPIC-005/006/007)

### @architect (Aria) — Solutions Architect
- [ ] Complete RLS security audit on EPIC-003 STORY-003-001 (by 2026-05-20)
- [ ] Review EPIC-002 dashboard architecture (by 2026-05-20)
- [ ] Plan EPIC-004 real-time subscriptions & calendar design (by 2026-05-22)

### @devops (Gage) — DevOps Lead
- [ ] Prepare CI/CD pipeline for Phase 1 merge
- [ ] Coordinate USER-004/005 merge to production (EOD 2026-05-15)
- [ ] Plan Phase 2 deployment strategy (rolling updates, blue/green)
- [ ] Set up monitoring for production metrics (performance, errors, adoption)

---

## Risk Assessment & Mitigation

### High-Risk Items

| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-----------|-----------|-------|
| RLS policy vulnerability in EPIC-003 | Security breach | Medium | Architecture review + penetration test | @architect |
| EPIC-003 Wave 1 QA fails | Phase 1 slip 3-5 days | Low | Extra security validation in QA | @qa |
| WhatsApp API integration complexity (EPIC-003 Wave 3) | Phase 1 delay | Medium | Research phase + ArIA team alignment | @pm |
| Patient search performance at scale (1000+ patients) | <500ms SLA breach | Low | Database indexing + monitoring | @data-engineer |
| Team context switching (EPIC-001 fixes + Phase 2 start) | Quality issues | Medium | Clear handoff protocol + parallel teams | @sm |

### Medium-Risk Items

| Risk | Impact | Probability | Mitigation |
|------|--------|-----------|-----------|
| Form state management (EPIC-003 Wave 2) | Lost edits, conflicts | Low | Optimistic locking + conflict resolution |
| Dashboard KPI query performance (EPIC-002) | Load time > 1s | Low | Query optimization + caching |
| Timezone handling (EPIC-004) | Appointment time errors | Medium | Brazil timezone + DST tests |

---

## Success Definition

### Phase 1 Success (by 2026-05-30)

- [ ] **All 4 epics deployed to production**
  - [ ] EPIC-001: USER-001/002/003/004/005 all merged
  - [ ] EPIC-002: DASH-001 → DASH-006 all merged
  - [ ] EPIC-003: STORY-003-001 → STORY-003-005 all merged (Wave 1 + 2 + 3)
  - [ ] EPIC-004: SCHED-001 → SCHED-007 all merged

- [ ] **Quality gates passed**
  - [ ] 95%+ test coverage
  - [ ] CodeRabbit 0 CRITICAL issues
  - [ ] Architect security sign-off
  - [ ] Performance benchmarks met (search <500ms)

- [ ] **Adoption starting**
  - [ ] 3-5 beta clinics in production
  - [ ] Staff UAT sign-off
  - [ ] Documentation complete

---

## Communication Plan

### Stakeholder Updates

**Cadence:** Daily (while executing)

| Stakeholder | Frequency | Format | Topics |
|-----------|-----------|--------|--------|
| C-Level (CEO/CTO) | Daily 4pm | Slack status | Phase progress, blockers, risks |
| Clinic Partners | 2x/week | Email | Feature demos, UAT schedule |
| Team (Dev/QA/Arch) | Daily 9am | Standup | Blockers, priorities, dependencies |

### Decision Points

- **2026-05-15 EOD:** Phase 1 → Phase 2 Go/No-Go (USER-004/005 merge decision)
- **2026-05-21:** EPIC-003 Wave 1 QA verdict (PASS/CONCERNS/FAIL)
- **2026-05-24:** EPIC-003 Wave 2 QA verdict (Wave 3 story creation decision)
- **2026-05-29:** Phase 1 complete, UAT begins with beta clinics
- **2026-06-01:** Phase 2 kickoff, EPIC-005/006/007 development starts

---

## Questions for Product Leadership

1. **Market Validation:** Should Phase 1 UAT with 3-5 beta clinics complete before Phase 2 starts, or proceed in parallel?

2. **Feature Priority:** In Phase 2, which is more important — Treatment Budgets (EPIC-005) or Financial Module (EPIC-007)? (Affects story order)

3. **WhatsApp AI Scope (EPIC-009):** Should Phase 3 include patient self-service features, or focus on lead generation only?

4. **Pricing:** What's the target pricing per clinic per month? (Affects feature scope and support needs)

5. **Partnerships:** Are there clinic chains or healthcare groups we should target first for bulk onboarding?

---

## Appendix: File Structure

**Roadmap Documentation:**
- `/docs/STRATEGIC-ROADMAP.md` — This document (high-level vision)
- `/docs/epics/EPIC-00X-*.md` — Epic definitions (9 files)
- `/docs/EPIC-003-WAVES-ROADMAP.md` — Detailed EPIC-003 waves execution
- `/docs/EPIC-003-NEXT-ACTIONS.md` — Day-to-day EPIC-003 priorities

**Story Files:**
- `/docs/stories/1.1-user-001.story.md` → `/docs/stories/SCHED-007.story.md` (49+ stories)

**Technical:**
- `/docs/SCHEMA.md` — Database schema (Phase 1)
- `/docs/PATIENT-SCHEMA.md` — Patient module schema
- `/docs/SUPABASE-SETUP.md` — Manual setup instructions

**Status Tracking:**
- `/docs/DEV-STATUS.md` — Current development progress (updated daily)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-15 | @pm (Morgan) | Initial roadmap (Phase 1 67% deployed) |

---

**Product Manager:** Morgan (@pm)
**Last Updated:** 2026-05-15 17:00 UTC
**Next Review:** 2026-05-20 (Wave 1 QA gate begins)

**Classification:** Internal Use (Stakeholders + Team)
