# Phase 2 Stories — Complete List

**Status:** Ready for @dev execution in yolo mode
**Created:** 2026-05-16
**Total Stories:** 37

---

## EPIC-004 Stories (7 — CREATED)

All located in `docs/stories/004.00X.story.md`

✅ 004.001 — CALE-001: Calendar View (CREATED)
✅ 004.002 — CALE-002: Appointment Creation Flow (CREATED)
✅ 004.003 — CALE-003: Doctor Schedule Management (CREATED)
✅ 004.004 — CALE-004: Waitlist Management (CREATED)
✅ 004.005 — CALE-005: SMS/WhatsApp Reminders (CREATED)
✅ 004.006 — CALE-006: Appointment Status Tracking (CREATED)
✅ 004.007 — CALE-007: Reschedule/Cancellation (CREATED)

---

## EPIC-005 Stories (30 — IN PROGRESS)

### Theme 5.1: Payment Integration (12 stories)

✅ 005.001 — INTG-001: Stripe Payment Integration (CREATED)
✅ 005.002 — INTG-002: Payment Method Storage & PCI (CREATED)
✅ 005.003 — INTG-003: Invoice Generation & Email (CREATED)
⏳ 005.004 — INTG-004: Refund Workflow
⏳ 005.005 — INTG-005: Payment Receipt Tracking
⏳ 005.006 — INTG-006: Clinic Revenue Dashboard
⏳ 005.007 — INTG-007: Tax Document Generation (NF-e)
⏳ 005.008 — INTG-008: Subscription Management
⏳ 005.009 — INTG-009: Payment Failure Retry Logic
⏳ 005.010 — INTG-010: PCI DSS Audit Log
⏳ 005.011 — INTG-011: Multi-Currency Support
⏳ 005.012 — INTG-012: Payment Analytics & Metrics

### Theme 5.2: WhatsApp Business API (8 stories)

⏳ 005.013 — WHAP-001: WhatsApp Business API Setup
⏳ 005.014 — WHAP-002: Rich Message Templates
⏳ 005.015 — WHAP-003: Interactive Buttons
⏳ 005.016 — WHAP-004: Media Sharing (Lab Results)
⏳ 005.017 — WHAP-005: Group Management
⏳ 005.018 — WHAP-006: Conversation Tracking
⏳ 005.019 — WHAP-007: Webhook Reliability
⏳ 005.020 — WHAP-008: Cost Tracking & Billing

### Theme 5.3: Reporting & Analytics (5 stories)

⏳ 005.021 — ANAT-001: Patient Visit History Report
⏳ 005.022 — ANAT-002: Doctor Productivity Analytics
⏳ 005.023 — ANAT-003: Revenue Trend Reports
⏳ 005.024 — ANAT-004: Cancellation/No-show Analysis
⏳ 005.025 — ANAT-005: PDF Export Functionality

### Theme 5.4: Automated Workflows (5 stories)

⏳ 005.026 — AUTO-001: Appointment → Invoice Trigger
⏳ 005.027 — AUTO-002: No-show Penalty Logic
⏳ 005.028 — AUTO-003: Payment Failure Alert
⏳ 005.029 — AUTO-004: Batch WhatsApp Reminders
⏳ 005.030 — AUTO-005: Data Cleanup Jobs

---

## EPIC-006 Stories (10 — TEMPLATES PROVIDED)

### Theme 6.1: UAT Preparation (3 stories)

⏳ 006.001 — UAT-001: Test Environment Setup
⏳ 006.002 — UAT-002: Test Data Generation
⏳ 006.003 — UAT-003: Test Case Documentation

### Theme 6.2: Clinic Rollout (4 stories)

⏳ 006.004 — ROLL-001: Staff Training
⏳ 006.005 — ROLL-002: Data Migration
⏳ 006.006 — ROLL-003: Go-live Checklist
⏳ 006.007 — ROLL-004: Post-launch Monitoring Setup

### Theme 6.3: Post-Launch Monitoring (3 stories)

⏳ 006.008 — MONI-001: Error Tracking Setup (Sentry)
⏳ 006.009 — MONI-002: Performance Dashboard
⏳ 006.010 — MONI-003: Daily Standup Protocol

---

## Next Steps

**Immediate (Next 2h):**
1. ✅ Created EPIC-004 stories (007 total)
2. ✅ Created EPIC-005 first batch (003 stories)
3. 🔄 Remaining: 005.004 to 005.030 + EPIC-006 (027 stories)

**Approach for Remaining Stories:**
- @dev uses story template in `.aiox-core/development/templates/story-tmpl.yaml`
- Follow Phase 2 Roadmap acceptance criteria + technical requirements
- Stories 005.004 onwards follow same pattern as 005.001-005.003
- @dev should create stories directly while implementing (yolo mode)

**Alternative:** If @dev wants to create all stories first, provide Story IDs + titles only, then implement sequentially.

---

## Story Template for 005.004 - 005.030

Each story should follow this structure:

```yaml
Title: [Theme] - [Feature Name]
Epic: EPIC-005
Acceptance Criteria:
  - [ ] [Feature A working]
  - [ ] [Feature B working]
  - [ ] [Testing coverage ≥80%]
  - [ ] [Error handling implemented]
Technical Requirements:
  - Backend: [What to implement]
  - Frontend: [UI components if any]
  - Database: [Schema changes if any]
Dependencies:
  - Previous Stories: [List]
  - Blocks: [List]
Estimation:
  - Story Points: [8-13]
  - Time Estimate: [hours]
  - Complexity: [Low/Medium/High]
Quality Gates:
  - Test Coverage: ≥80%
  - CodeRabbit: Passed
  - QA Gate: [Type]
```

---

## Execution Plan for @dev (Yolo Mode)

**Phase 1 (Today - 2h):**
1. Implement EPIC-004 (already drafted) — **20 points**
2. Implement EPIC-005.001-005.003 (Stripe + PCI) — **29 points**
3. Tests + CodeRabbit review

**Phase 2 (Next 2 days):**
1. Implement EPIC-005.004-005.012 (Payments complete) — **50 points**
2. Implement EPIC-005.013-005.020 (WhatsApp API) — **60 points**
3. Implement EPIC-005.021-005.030 (Reports + Automation) — **50 points**

**Phase 3 (Week 2):**
1. Implement EPIC-006 UAT + Rollout (10 stories) — **50 points**
2. Integration testing + stabilization

---

## Story Files Ready

| File | Status |
|------|--------|
| docs/stories/004.001-004.007 | ✅ READY |
| docs/stories/005.001 | ✅ CREATED |
| docs/stories/005.002 | ✅ CREATED |
| docs/stories/005.003 | ✅ CREATED |
| docs/stories/005.004-005.030 | ⏳ TO CREATE |
| docs/stories/006.001-006.010 | ⏳ TO CREATE |

---

## Calling @dev

Ready to activate `@dev` for yolo mode execution on:
1. EPIC-004 (already drafted, 7 stories)
2. EPIC-005.001-005.003 (just created)
3. Remaining stories will be created by @dev as part of implementation flow

**Command:** `@dev *develop 004.001 --yolo --parallel`
