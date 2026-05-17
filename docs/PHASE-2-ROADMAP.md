# Phase 2 Roadmap — Aria Clinic
## Timeline, Epics, Milestones & Strategy

**Document Version:** 1.0
**Created:** 2026-05-16
**Status:** Planning Phase
**Executive Approval:** PENDING

---

## Executive Summary

**Phase 2** extends Aria Clinic MVP beyond core patient management into **scheduler automation**, **third-party integrations**, and **clinical operations analytics**. The phase spans **6 weeks** (2026-05-20 → 2026-06-30) with 3 major epics, ~25-30 stories, and delivery milestones aligned with staged clinic rollout.

| Dimension | Value |
|-----------|-------|
| **Duration** | 6 weeks (42 days) |
| **Start Date** | 2026-05-20 |
| **Target Completion** | 2026-06-30 |
| **Epics** | 3 (EPIC-004, EPIC-005, EPIC-006) |
| **Estimated Stories** | 25-30 |
| **Development Team** | @dev (1 FTE) |
| **QA Team** | @qa (1 FTE) |
| **Deployment** | Weekly increments + UAT gate |

---

## PHASE 2 EPIC STRUCTURE

### EPIC-004: Scheduler & Appointment Management ✅ FOUNDATION COMPLETE
**Status:** 30% of Phase 2 effort (foundation stories DONE)
**Timeline:** 2026-05-16 → 2026-05-27 (Waves 1-3 implementation)

**Completed Stories (Wave 1-3):**
- CALE-001: Calendar view foundation ✅
- CALE-002: Appointment creation flow ✅
- CALE-003: Doctor schedule management ✅
- CALE-004: Waitlist management ✅
- CALE-005: SMS/WhatsApp appointment reminders ✅
- CALE-006: Appointment status tracking ✅
- CALE-007: Reschedule/cancellation workflow ✅

**Remaining Stories (Wave 4-5):**
- CALE-008: Appointment conflict detection (HOLD — depends on EPIC-005 integrations)
- CALE-009: Doctor availability analytics (Phase 2.2)
- CALE-010: Advanced scheduling rules (Phase 2.3)

**Acceptance Criteria:**
- All appointments can be created, updated, cancelled via UI
- Reminders sent 24h before appointment (WhatsApp or SMS)
- Doctors can manage their schedules independently
- Patients see real-time availability
- 0 critical bugs pre-UAT

**Effort:** 70 story points / ~140 hours

---

### EPIC-005: Integration & Automation Layer (NEW)
**Status:** 45% of Phase 2 effort
**Timeline:** 2026-05-27 → 2026-06-20
**Dependencies:** EPIC-004 foundation complete; EPIC-005 gateway gate (see Gate 5)

**Story Themes:**

#### Theme 5.1: Payment & Billing Integration (12 stories, ~50 points)
- **INTG-001:** Stripe payment provider integration (card processing)
- **INTG-002:** Payment method storage & tokenization (PCI compliance)
- **INTG-003:** Invoice generation & email delivery
- **INTG-004:** Refund workflow (appointment cancellations)
- **INTG-005:** Payment receipt tracking in patient history
- **INTG-006:** Clinic revenue reporting dashboard
- **INTG-007:** Tax document generation (Brazil: NF-e stub)
- **INTG-008:** Subscription management for recurring services
- **INTG-009:** Payment failure retry logic
- **INTG-010:** PCI DSS audit log
- **INTG-011:** Currency conversion (if multi-region)
- **INTG-012:** Payment analytics & metrics

**Acceptance Criteria:**
- Patients can pay via web UI or WhatsApp link
- Payment status reflected in appointment record
- No card data stored in Aria DB (PCI compliance)
- Refunds processed automatically on cancellation
- Revenue reports accurate to cent

#### Theme 5.2: WhatsApp Business API Integration (8 stories, ~35 points)
- **WHAP-001:** WhatsApp Business API v20.0 setup (move from basic)
- **WHAP-002:** Rich messaging templates (WhatsApp Template Manager)
- **WHAP-003:** Interactive buttons (appointment options)
- **WHAP-004:** Media sharing (lab results, images)
- **WHAP-005:** WhatsApp group management (team coordination)
- **WHAP-006:** Conversation status tracking (read receipts)
- **WHAP-007:** Webhook reliability & retry logic
- **WHAP-008:** Cost tracking & billing integration

**Acceptance Criteria:**
- Templates approved by WhatsApp (Brazil regulatory)
- Message delivery rate > 98%
- Two-way conversations logged
- Compliance with WhatsApp ToS

#### Theme 5.3: Report Generation & Analytics (5 stories, ~20 points)
- **ANAT-001:** Patient visit history report (daily/weekly/monthly)
- **ANAT-002:** Doctor productivity analytics (appointments per day, revenue per doctor)
- **ANAT-003:** Revenue trend reports
- **ANAT-004:** Cancellation/no-show rate analysis
- **ANAT-005:** PDF export functionality

**Acceptance Criteria:**
- All reports exportable as PDF
- Date range filters working
- Clinic manager access only
- 0 data loss between exports

#### Theme 5.4: Automated Workflow Orchestration (5 stories, ~25 points)
- **AUTO-001:** Appointment → Invoice trigger
- **AUTO-002:** No-show → Penalty logic
- **AUTO-003:** Payment failure → SMS alert (clinic staff)
- **AUTO-004:** Batch WhatsApp reminders (daily scheduler)
- **AUTO-005:** Data cleanup job (archive old records)

**Acceptance Criteria:**
- All workflows tested with mock data
- Logs available for debugging
- Error handling prevents data loss
- Retry logic prevents duplicate triggers

**Effort:** 130 story points / ~260 hours

---

### EPIC-006: UAT, Clinic Rollout & Post-Launch (NEW)
**Status:** 25% of Phase 2 effort
**Timeline:** 2026-06-20 → 2026-06-30
**Dependencies:** EPIC-004 & EPIC-005 done; integration tested

**Story Themes:**

#### Theme 6.1: UAT Preparation (3 stories, ~15 points)
- **UAT-001:** Test environment setup (staging → UAT instance)
- **UAT-002:** Test data generation (100+ mock patients, doctors, appointments)
- **UAT-003:** UAT test case documentation (50+ scenarios)

**Acceptance Criteria:**
- Clinic has isolated UAT environment
- Test data realistic (names, times, payments)
- Test cases cover happy path + edge cases
- Clinic team trained on UAT process

#### Theme 6.2: Clinic Rollout (4 stories, ~20 points)
- **ROLL-001:** Staff training (clinic, support)
- **ROLL-002:** Data migration from legacy system (if applicable)
- **ROLL-003:** Go-live checklist & incident response plan
- **ROLL-004:** Post-launch monitoring & support handoff

**Acceptance Criteria:**
- Staff can perform core tasks (schedule, invoice, view reports)
- Legacy data migrated & verified
- SLAs defined (response time, bug fix priority)
- Clinic contact & escalation documented

#### Theme 6.3: Post-Launch Monitoring (3 stories, ~15 points)
- **MONI-001:** Error tracking setup (Sentry, Datadog)
- **MONI-002:** Performance monitoring dashboard
- **MONI-003:** Daily standup (first 2 weeks post-launch)

**Acceptance Criteria:**
- Errors logged & visible to @dev
- Performance metrics tracked (API latency, page load time)
- Daily standup notes captured
- Critical incident response < 1 hour

**Effort:** 50 story points / ~100 hours

---

## DETAILED TIMELINE & MILESTONES

### Week 1 (2026-05-20 → 2026-05-26)
| Milestone | Owner | Status |
|-----------|-------|--------|
| **Stage 1: Staging Deployment** | @devops | IN PROGRESS |
| - Supabase staging live | @devops | 2026-05-24 |
| - Vercel staging deployed | @devops | 2026-05-24 |
| - Health checks passing | @devops | 2026-05-24 |
| **Stage 2: EPIC-004 Stability** | @dev | IN PROGRESS |
| - All Wave 1-3 stories merged | @dev | 2026-05-22 |
| - Scheduler feature complete & tested | @dev | 2026-05-25 |
| - 0 critical bugs | @qa | 2026-05-26 |
| **GATE 1: Staging Preflight** | @devops | 2026-05-24 |
| - Requirement: All items ✅ | | |
| - Go/No-Go: CONDITIONAL GO | | |

### Week 2 (2026-05-27 → 2026-06-02)
| Milestone | Owner | Status |
|-----------|-------|--------|
| **Stage 3: EPIC-005 Theme 5.1 (Payments)** | @dev | PLANNED |
| - Stripe integration stories done | @dev | 2026-06-02 |
| - 80%+ test coverage | @qa | 2026-06-02 |
| **GATE 2: Payment Integration Ready** | @qa | 2026-06-02 |
| - Requirement: PCI audit ✅ | | |
| - Requirement: Refund flow tested ✅ | | |

### Week 3 (2026-06-03 → 2026-06-09)
| Milestone | Owner | Status |
|-----------|-------|--------|
| **Stage 4: EPIC-005 Theme 5.2 (WhatsApp API)** | @dev | PLANNED |
| - WhatsApp Business API stories done | @dev | 2026-06-09 |
| - Template compliance verified | @dev | 2026-06-08 |
| **GATE 3: WhatsApp Integration Ready** | @qa | 2026-06-09 |
| - Requirement: Message delivery > 98% ✅ | | |
| - Requirement: Two-way chat logging ✅ | | |

### Week 4 (2026-06-10 → 2026-06-16)
| Milestone | Owner | Status |
|-----------|-------|--------|
| **Stage 5: EPIC-005 Themes 5.3 & 5.4 (Reports & Automation)** | @dev | PLANNED |
| - Reports generated & exportable | @dev | 2026-06-15 |
| - Workflows orchestrated & tested | @dev | 2026-06-16 |
| **GATE 4: Integration Complete** | @qa | 2026-06-16 |
| - Requirement: End-to-end flow tested ✅ | | |
| - Requirement: Appointment → Invoice flow works ✅ | | |

### Week 5 (2026-06-17 → 2026-06-23)
| Milestone | Owner | Status |
|-----------|-------|--------|
| **Stage 6: EPIC-005 Stabilization & Bug Fixes** | @dev | PLANNED |
| - All reported bugs fixed | @dev | 2026-06-21 |
| - Performance benchmarks met | @dev | 2026-06-22 |
| **GATE 5: EPIC-005 Production Ready** | @qa | 2026-06-23 |
| - Requirement: 0 critical bugs ✅ | | |
| - Requirement: > 90% test coverage ✅ | | |

### Week 6 (2026-06-24 → 2026-06-30)
| Milestone | Owner | Status |
|-----------|-------|--------|
| **Stage 7: EPIC-006 UAT & Rollout** | @sm | PLANNED |
| - UAT environment live | @devops | 2026-06-24 |
| - Clinic staff trained | @sm | 2026-06-26 |
| - Data migrated (if applicable) | @dev | 2026-06-27 |
| - Go-live sign-off | @pm | 2026-06-30 |

---

## DEPENDENCY MAP

```
EPIC-004 (Scheduler)
    ↓
    └─→ CALE-001 through CALE-007 (DONE)
         ↓
         └─→ EPIC-005 (Integration) can begin
              ├─→ INTG-001 through INTG-012 (Payments)
              ├─→ WHAP-001 through WHAP-008 (WhatsApp API)
              ├─→ ANAT-001 through ANAT-005 (Reports)
              └─→ AUTO-001 through AUTO-005 (Automation)
                   ↓
                   └─→ EPIC-006 (UAT & Rollout) begins
```

**Critical Path:**
- EPIC-004 foundation (DONE) → EPIC-005 payments (2026-06-02) → EPIC-005 integrations (2026-06-16) → EPIC-006 UAT (2026-06-23)
- **Total duration: 42 days (6 weeks)**
- **No work parallelization possible** (integrations depend on scheduler)

---

## RESOURCE ALLOCATION

| Role | Allocation | Capacity |
|------|-----------|----------|
| **@dev (Dex)** | 1.0 FTE (8h/day) | 240 hours (6 weeks) |
| **@qa (Quinn)** | 0.8 FTE (6.4h/day) | 192 hours (6 weeks) |
| **@architect (Aria)** | 0.3 FTE (design reviews) | 72 hours (6 weeks) |
| **@data-engineer (Dara)** | 0.2 FTE (report queries) | 48 hours (6 weeks) |
| **@sm (River)** | 0.4 FTE (UAT coordination) | 96 hours (6 weeks) |
| **@pm (Morgan)** | 0.5 FTE (spec & prioritization) | 120 hours (6 weeks) |

**Utilization:** 768 total planned hours

---

## RISK REGISTER

| Risk | Severity | Probability | Mitigation | Owner |
|------|----------|-------------|-----------|-------|
| **Stripe integration delays** | HIGH | MEDIUM | Pre-integration spike (2h) to validate Supabase webhook support | @dev |
| **WhatsApp API approval slow** | HIGH | LOW | Start Template Manager submission by 2026-06-05 (2-week buffer) | @dev |
| **Scope creep on reports** | MEDIUM | HIGH | Lock EPIC-005 scope by 2026-05-23; require change control for additions | @pm |
| **Payment PCI audit failure** | HIGH | LOW | Security review by @architect before GATE 2; third-party audit (if needed) by 2026-06-05 | @architect |
| **Clinic UAT finds critical bugs** | MEDIUM | MEDIUM | 1-week buffer (2026-06-23 → 2026-06-30) for bug fixes; escalation to @devops if blocking | @qa |
| **Data migration complexity** | MEDIUM | MEDIUM | Legacy system audit by 2026-05-20; script validation in UAT by 2026-06-27 | @dev |
| **Team member unavailability** | MEDIUM | LOW | Cross-training @qa on critical paths; @dev backup contact documented | @sm |

---

## SUCCESS METRICS & KPIs

### Phase 2 Completion Criteria
- [ ] All EPIC-005 stories deployed to staging by 2026-06-23
- [ ] 0 critical bugs in production code
- [ ] Test coverage > 90%
- [ ] API latency < 500ms (p95)
- [ ] Page load time < 3s (p95)
- [ ] Error rate < 1% (all HTTP 5xx)

### Clinic UAT Success Criteria
- [ ] Clinic staff can complete appointment end-to-end without assistance
- [ ] Payment flow works (Stripe integration, receipts generated)
- [ ] Reports generate within 5s
- [ ] WhatsApp reminders sent 24h before appointment (> 95% success rate)
- [ ] Clinic staff sign-off: "Ready for production"

### Post-Launch Metrics (First 2 Weeks)
- [ ] Uptime: > 99.5%
- [ ] Critical bug response: < 1 hour
- [ ] Clinic daily active users: > 50% of target
- [ ] Error budget consumed: < 50%
- [ ] Staff satisfaction: > 4/5

---

## BUDGET & RESOURCE FORECAST

### Phase 2 Estimated Cost Breakdown

| Item | Estimated Cost | Notes |
|------|----------------|-------|
| **Development** | $25,000 | 240 hours @ $104/hour (senior) |
| **QA & Testing** | $12,000 | 192 hours @ $62/hour (mid-level) |
| **Architecture & Design Review** | $7,500 | 72 hours @ $104/hour |
| **Project Management** | $12,000 | 120 hours @ $100/hour |
| **Infrastructure (Supabase, Vercel)** | $2,000 | Staging + production (6 weeks) |
| **Third-Party APIs** | $1,500 | Stripe processing, WhatsApp API, SMS |
| **Contingency (10%)** | $5,950 | Buffer for scope creep, delays |
| **TOTAL** | ~$65,950 | 6-week delivery |

**Payment Terms:** T+30 (invoice at end of each week)

---

## GO-LIVE TIMELINE (BEYOND PHASE 2)

| Date | Milestone |
|------|-----------|
| 2026-06-30 | Phase 2 feature complete (staging) |
| 2026-07-07 | Clinic UAT complete & sign-off |
| 2026-07-14 | Production deployment + clinic go-live |
| 2026-07-21 | Post-launch monitoring (2 weeks) |
| 2026-07-28 | SLA handoff to clinic operations |

---

## EXECUTIVE SUMMARY FOR LEADERSHIP

### Scope
Phase 2 adds **payment processing**, **advanced WhatsApp integration**, **analytics dashboards**, and **clinic rollout support** to the MVP. This positions Aria Clinic for production deployment by end of Q2 2026.

### Timeline
6 weeks (2026-05-20 → 2026-06-30), with weekly incremental delivery and staged integration testing.

### Investment
~$66K for development, QA, and infrastructure. ROI: Clinic can go live and monetize services (appointments, payments) immediately.

### Risks
Integration complexity (Stripe, WhatsApp API) and UAT timeline. Mitigation: early integration spikes, extended UAT buffer.

### Next Steps
1. Approve Phase 2 roadmap (this document)
2. Secure Stripe & WhatsApp API credentials
3. Begin clinic UAT planning (EPIC-006)
4. Allocate team resources for May 20 start

---

**Roadmap Status:** APPROVED / PENDING EXECUTIVE SIGN-OFF
**Last Updated:** 2026-05-16
**Next Review:** 2026-05-20 (phase kickoff)
