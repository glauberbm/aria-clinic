# EPIC-003: Next Actions & Priorities

**Date:** 2026-05-15
**Owner:** @pm (Morgan)
**Status:** Wave 1 Complete, Wave 2 Ready for QA, Wave 3 Pending

---

## Priority 1 (IMMEDIATE - Next 2 Days)

### @qa (Quinn) — Execute Wave 1 QA Gate

**Timeline:** Start 2026-05-20, Complete by 2026-05-21

**Task:** Execute full 7-point QA gate on Wave 1 stories (STORY-003-001, 002, 003)

**Checklist:**

- [ ] **STORY-003-001: Database Schema**
  - [ ] Test RLS policies for different roles (patient, staff, admin)
  - [ ] Verify patients only see own records
  - [ ] Verify staff see only assigned patients
  - [ ] Verify admins see all with audit trail
  - [ ] Check audit logging functionality (every access recorded)
  - [ ] Verify encryption at rest (Supabase default)
  - [ ] Verify data retention policies
  - [ ] Run CodeRabbit: `wsl bash -c 'coderabbit --prompt-only --base main'`
  - [ ] **Gate Decision:** PASS / CONCERNS / FAIL

- [ ] **STORY-003-002: Patient List**
  - [ ] Load /pacientes page
  - [ ] Verify load time < 500ms
  - [ ] Test search (by name, by email)
  - [ ] Test filter (by status: active/inactive/archived)
  - [ ] Test sort (by name, registration date, last appointment)
  - [ ] Test pagination (10/25/50 items per page)
  - [ ] Test on mobile (responsive design)
  - [ ] Run CodeRabbit
  - [ ] **Gate Decision:** PASS / CONCERNS / FAIL

- [ ] **STORY-003-003: Patient Detail**
  - [ ] Load /pacientes/[id] page
  - [ ] Verify all sections display (profile, history, medications, communications, audit)
  - [ ] Verify audit log only visible to admins
  - [ ] Test print-friendly layout
  - [ ] Test on mobile (responsive design)
  - [ ] Run CodeRabbit
  - [ ] **Gate Decision:** PASS / CONCERNS / FAIL

**Success Criteria:**
- All 3 stories PASS or CONCERNS (max 1 day fixes)
- CodeRabbit: 0 CRITICAL issues per story
- All AC met for each story

**Failure Handling:**
- If CONCERNS: Report specific issues to @pm, assign fixes to @dev
- If FAIL: Escalate to @architect for architecture review

**Output Required:**
- QA Gate verdict document (PASS/CONCERNS/FAIL)
- Defect list (if any)
- CodeRabbit report for each story

---

### @architect (Aria) — Security Audit of RLS Policies

**Timeline:** Start 2026-05-15, Complete by 2026-05-20 (parallel with QA)

**Task:** Security review of Row-Level Security implementation in STORY-003-001

**Checklist:**

- [ ] Review RLS policy definitions (from database schema)
  - [ ] Patient can only read own records
  - [ ] Patient cannot update other patients' data
  - [ ] Staff can only read assigned patients
  - [ ] Admin can read all with audit trail
  - [ ] Verify no privilege escalation paths

- [ ] Verify encryption at rest
  - [ ] Sensitive fields encrypted (if needed)
  - [ ] Supabase default encryption verified
  - [ ] Key management reviewed

- [ ] Check audit logging completeness
  - [ ] All data access logged
  - [ ] Admin audit trail captured
  - [ ] Timestamp accuracy
  - [ ] Data retention policies configured

- [ ] LGPD Compliance Verification
  - [ ] Data classification (PII, health, sensitive)
  - [ ] Consent mechanisms in place
  - [ ] Right to be forgotten (soft delete) implementation
  - [ ] Data portability capability

- [ ] OWASP Top 10 Assessment
  - [ ] A01 (Broken Access Control) - RLS policies prevent unauthorized access
  - [ ] A07 (Authentication Failures) - Role-based enforcement verified

**Output Required:**
- Security audit report
- Risk assessment (HIGH/MEDIUM/LOW)
- Sign-off for production use (or required fixes)

**If Issues Found:**
- Create defect list for @dev
- Provide mitigation strategies
- Escalate HIGH risk to @pm

---

## Priority 2 (AFTER Wave 1 QA Gate PASSES)

### @qa (Quinn) — Execute Wave 2 QA Gate

**Timeline:** Start after Wave 1 passes, Complete by 2026-05-24

**Task:** Execute full 7-point QA gate on STORY-003-004 (Patient Create/Edit Forms)

**Checklist:**

- [ ] Create Patient Form
  - [ ] Navigate to /pacientes/novo
  - [ ] Fill in all required fields (name, email, phone, DOB, address, etc.)
  - [ ] Test form validation
    - [ ] Required field validation
    - [ ] Email format validation
    - [ ] Phone format validation
    - [ ] DOB validation (valid date)
  - [ ] Submit form successfully
  - [ ] Verify patient created in Supabase
  - [ ] Verify success notification displayed

- [ ] Edit Patient Form
  - [ ] Navigate to /pacientes/[id]/editar
  - [ ] Verify form loads existing patient data
  - [ ] Modify at least 3 fields
  - [ ] Test auto-save functionality (should save while typing or after delay)
  - [ ] Submit form
  - [ ] Verify changes persisted in Supabase
  - [ ] Verify success notification displayed

- [ ] Form Validation Edge Cases
  - [ ] Submit with empty required field (should show error)
  - [ ] Submit with invalid email (should show error)
  - [ ] Submit with invalid phone format (should show error)
  - [ ] Submit with future DOB (should show error if applicable)

- [ ] Auto-Save Functionality
  - [ ] Type in form field
  - [ ] Wait 3-5 seconds (or check for auto-save indicator)
  - [ ] Refresh page
  - [ ] Verify draft still exists / partially filled

- [ ] Responsive Design
  - [ ] Test on mobile (portrait/landscape)
  - [ ] Test on tablet
  - [ ] Test on desktop
  - [ ] All fields visible and functional on mobile

- [ ] File Upload (if enabled in scope)
  - [ ] [ ] Attempt to upload patient document
  - [ ] [ ] Verify file stored in Supabase Storage
  - [ ] [ ] Verify file linked to patient record

- [ ] Run CodeRabbit: `wsl bash -c 'coderabbit --prompt-only --base main'`
  - [ ] 0 CRITICAL issues
  - [ ] All findings addressed or documented

**Success Criteria:**
- All AC met for STORY-003-004
- Form validation 100% working
- Supabase integration verified
- Auto-save functional
- CodeRabbit: 0 CRITICAL issues

**Output Required:**
- QA Gate verdict (PASS/CONCERNS/FAIL)
- Defect list (if any)
- CodeRabbit report

---

## Priority 3 (AFTER Wave 2 QA Gate PASSES)

### @sm (River) — Create STORY-003-005

**Timeline:** Start after Wave 2 QA passes, Complete by 2026-05-25

**Task:** Create STORY-003-005 (WhatsApp Notification Integration) story file

**Story Template:**
```markdown
# STORY-003-005: WhatsApp Notification Integration

**Epic:** EPIC-003-patients
**Status:** Draft (for @po validation)
**Priority:** Medium
**Owner:** @dev

---

## Title
Integrate ArIA Agent WhatsApp notifications for patient communications

## Description
Connect patient communication system to ArIA Agent WhatsApp integration for automated appointment reminders, treatment updates, and patient engagement. Enable clinic to send appointment reminders 24 hours before scheduled appointments and treatment updates to patients.

## Acceptance Criteria
- [ ] WhatsApp message templates configured
- [ ] Appointment reminders sent 24h before
- [ ] Patient opt-in/opt-out preferences respected
- [ ] Message delivery tracking working
- [ ] Conversation history stored in system
- [ ] Error handling and retries implemented
- [ ] Integration with ArIA Agent WhatsApp API functional

## Tasks
- [ ] Research ArIA Agent WhatsApp API documentation
- [ ] Design message template system
- [ ] Implement appointment reminder trigger (24h before)
- [ ] Implement patient opt-in/opt-out preferences
- [ ] Implement message delivery tracking
- [ ] Implement error handling and retries
- [ ] Implement conversation history storage
- [ ] Write tests for integration
- [ ] Document WhatsApp integration setup

## Technical Notes

### Integration Points
- Patient contact_preferences table (opt-in/opt-out)
- Appointment scheduling data (reminder triggers)
- Patient communications table (conversation history)
- ArIA Agent WhatsApp API

### Message Templates
- Appointment Reminder: "Hello [patient], you have an appointment on [date] at [time] with [clinic]. Reply CONFIRM to confirm."
- Treatment Update: "Hello [patient], your treatment [name] has been scheduled for [date]. [additional info]"
- Opt-out: Patient can reply STOP to opt out

---
```

**What @sm Must Do:**
1. [ ] Create the story file at `docs/stories/STORY-003-005.md`
2. [ ] Set all acceptance criteria (copy from Wave 3 section in EPIC-003-EXECUTION.yaml)
3. [ ] Create task list with implementation steps
4. [ ] Assign to @dev (Dex)
5. [ ] Note dependencies on STORY-003-001 and STORY-003-004

**Next:** Hand to @po (Pax) for validation (10-point checklist)

---

## Priority 4 (OPTIONAL - Enhancement Items)

### @dev (Dex) — Post-Wave 1 Enhancements (If time permits)

These are nice-to-have items that can be deferred to future waves:

**Optional for STORY-003-004 (Wave 2):**
- [ ] File upload for patient documents
  - Implementation: Supabase Storage bucket for patient files
  - Link to patient record via patient_files table
  - Show uploaded files in patient detail page

- [ ] Delete confirmation dialog
  - Implementation: Show modal before hard delete
  - Alternative: Use soft delete (archive patient instead)
  - Requires admin approval for permanent deletion

- [ ] Audit trail visualization
  - Implementation: Dedicated audit log viewer in patient detail
  - Show who accessed patient record, when, and what changed
  - Filter by date range, user, action type

**Optional for STORY-003-005 (Wave 3):**
- [ ] Message template customization UI
  - Allow clinic staff to customize message templates
  - Preview message before sending
  - Support variables ([patient], [date], etc.)

- [ ] Bulk messaging
  - Send same message to multiple patients
  - Scheduled delivery support
  - Delivery report

---

## Communication Plan

### Daily Standup (while executing)

**Time:** 09:00 UTC
**Duration:** 15 minutes
**Attendees:** @pm, @dev, @qa, @architect

**Agenda:**
1. Wave status (blockers, progress)
2. QA gate results (if in progress)
3. Next day priorities
4. Escalations needed

### Escalation Triggers

If any of these occur, escalate to @pm immediately:

- [ ] QA gate returns FAIL (architecture/security issue)
- [ ] CodeRabbit finds CRITICAL issues (0 tolerated)
- [ ] RLS policy vulnerability detected
- [ ] Performance SLA breached (> 500ms search)
- [ ] Team member blocked/stuck

### Decision Points

**Wave 1 QA Gate Complete:**
- PASS → Proceed to Wave 2 QA gate (next day)
- CONCERNS → Assign fixes, 1 day re-test cycle
- FAIL → Escalate to @architect, may require story revision

**Wave 2 QA Gate Complete:**
- PASS → @sm creates STORY-003-005 (Wave 3 begins)
- CONCERNS → Assign fixes, 1 day re-test cycle
- FAIL → Escalate to @architect

**Wave 3 Story Created:**
- @po validates story (10-point checklist)
- @dev begins implementation (parallel with Wave 2 fixes if needed)

---

## Success Definition

### Wave 1 Success
- [x] 3 stories implemented (database, list, detail)
- [ ] All AC met for all 3 stories
- [ ] QA gate PASS (or CONCERNS with quick fixes)
- [ ] CodeRabbit 0 CRITICAL issues
- [ ] Architecture security audit sign-off

### Wave 2 Success
- [x] 1 story implemented (create/edit forms)
- [ ] All AC met for story
- [ ] QA gate PASS (or CONCERNS with quick fixes)
- [ ] CodeRabbit 0 CRITICAL issues
- [ ] Supabase integration verified

### Wave 3 Success
- [ ] Story created and validated
- [ ] Implementation complete
- [ ] QA gate PASS
- [ ] CodeRabbit 0 CRITICAL issues
- [ ] EPIC-003 marked COMPLETE

---

## Key Contacts

**Product Manager:** @pm (Morgan) - Overall orchestration
**QA Lead:** @qa (Quinn) - QA gate execution
**Architect:** @architect (Aria) - Security review
**Lead Developer:** @dev (Dex) - Implementation
**Scrum Master:** @sm (River) - Story creation

---

**Last Updated:** 2026-05-15 16:45 UTC
**Next Review:** 2026-05-20 (Wave 1 QA gate begins)
