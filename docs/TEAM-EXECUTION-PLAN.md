# TEAM EXECUTION PLAN — ArIA Clinic Development Roadmap
**Distribution:** Development Team | **Owner:** @pm (Morgan) | **Coordinator:** @sm (River)
**Date:** 2026-05-15 | **Execution Mode:** AIOX Story Development Cycle (SDC)

---

## Quick Reference: Who Does What & When

### Week 1 (This Week: 2026-05-15 → 2026-05-19)

| Epic | Story | Owner | Status | Deadline | Blocker? |
|------|-------|-------|--------|----------|----------|
| EPIC-001 | USER-004 (Profile) | @dev | ⏳ Unblock (architect) | 2026-05-15 EOD | YES ⚠️ |
| EPIC-001 | USER-005 (Admin Dashboard) | @dev | ⏳ Unblock (tests) | 2026-05-15 EOD | YES ⚠️ |
| EPIC-003 | STORY-003-001 (DB Schema) | @qa | 🔄 QA gate | 2026-05-20 → 2026-05-21 | — |
| EPIC-003 | STORY-003-002 (Patient List) | @qa | 🔄 QA gate | 2026-05-20 → 2026-05-21 | — |
| EPIC-003 | STORY-003-003 (Patient Detail) | @qa | 🔄 QA gate | 2026-05-20 → 2026-05-21 | — |

### Week 2 (2026-05-20 → 2026-05-26)

| Epic | Story | Owner | Status | Deadline | Notes |
|------|-------|-------|--------|----------|-------|
| EPIC-003 | Wave 1 QA Gate | @qa | 🔄 In Progress | 2026-05-21 EOD | CRITICAL PATH |
| EPIC-003 | Wave 2 QA Gate | @qa | 🔄 Queued | 2026-05-24 EOD | Starts after Wave 1 PASS |
| EPIC-002 | DASH-001 → DASH-006 | @dev | 📋 Ready | Start 2026-05-20 | Parallel with Wave 1/2 QA |
| EPIC-004 | SCHED-001 → SCHED-007 | @dev | 📋 Ready | Start after EPIC-003 Wave 2 PASS | Depends on patient data |

### Week 3-4 (2026-05-27 → 2026-05-30)

| Phase | Owner | Status | Target |
|-------|-------|--------|--------|
| EPIC-003 Wave 3 QA | @qa | 🔄 Queued | 2026-05-29 |
| Phase 1 Complete | All | ✅ TARGET | 2026-05-30 |
| Beta Clinic UAT | Customer Success | 📋 Start | Week 2026-05-30 |

---

## Epic Execution Details

### EPIC-001: Authentication & User Management — 67% Deployed

**Overall Status:** 2/5 stories merged, 3/5 pending unblocks

#### USER-003: Role Assignment & Access Control ✅ MERGED
- Status: ✅ Production
- Merge Date: 2026-05-15
- Notes: RBAC + RLS policies implemented
- Owner: @dev (Dex)

#### USER-004: Password Reset Flow ⏳ BLOCKED
- Status: ⏳ Pending @architect security audit
- What's Done: Implementation complete, tests passing (80% coverage)
- What's Blocked: Architect review of RLS policies in EPIC-003 (depends on same audit)
- Target Merge: 2026-05-15 EOD
- Owner: @dev (Dex) + @architect (Aria)

**Unblock Action:**
```
@architect runs security audit on:
  1. STORY-003-001 (EPIC-003) RLS policies
  2. USER-004 password reset flow
  3. USER-005 admin dashboard access
Timeline: By 2026-05-15 16:00 UTC
Decision: PASS → Merge USER-004/005 | FAIL → Create defect story
```

#### USER-005: User Profile Page ⏳ BLOCKED
- Status: ⏳ Pending integration tests completion
- What's Done: Frontend component 100%, Supabase integration 90%
- What's Blocked: Integration test coverage (need 3 more test scenarios)
- Target Merge: 2026-05-15 EOD
- Owner: @dev (Dex) + @qa (Quinn)

**Unblock Action:**
```
@dev adds 3 integration test scenarios:
  1. User profile update triggers audit log
  2. Role change refreshes user session
  3. Profile delete soft-deletes user record
Timeline: By 2026-05-15 15:00 UTC
Then @qa reviews + @devops merges by 16:00 UTC
```

**Go/No-Go Phase 2 Decision:**
```
IF (USER-004 merged AND USER-005 merged by EOD 2026-05-15):
  → FULL GO to Phase 2 (2026-05-16 start)

ELSE IF (one or both delayed 1-2 days):
  → LIMITED GO to Phase 2 (2026-05-17 start)
  → Phase 1 completion delayed to 2026-05-31
```

---

### EPIC-002: Dashboard & Core UI System — Ready

**Overall Status:** 6 stories, 16 points, ready for development after USER-004/005 merge

**Start Date:** 2026-05-20 (parallel with EPIC-003 Wave 1/2 QA)
**Target Completion:** 2026-05-26
**Owner:** @dev (Dex)
**Depends On:** EPIC-001 ✅ complete

#### Story Breakdown

| Story | Title | Points | Owner | Start | Target |
|-------|-------|--------|-------|-------|--------|
| DASH-001 | Dashboard layout | 3 | @dev | 2026-05-20 | 2026-05-21 |
| DASH-002 | KPI metrics cards (4) | 3 | @dev | 2026-05-20 | 2026-05-22 |
| DASH-003 | Protocol stats chart | 2 | @dev | 2026-05-22 | 2026-05-23 |
| DASH-004 | Financial overview chart | 2 | @dev | 2026-05-22 | 2026-05-23 |
| DASH-005 | Upcoming patients list | 4 | @dev | 2026-05-23 | 2026-05-25 |
| DASH-006 | Responsive design | 2 | @dev | 2026-05-24 | 2026-05-26 |

**Dev Notes:**
- UI components pre-built in shadcn/ui ✅
- CSS variables ready ✅
- Recharts pre-installed ✅
- Use Tailwind CSS 4 (no @apply)
- Mock data available at `docs/dashboard-mock.json` (create if needed)

**QA Checklist (by @qa after each story):**
- [ ] Load time < 1s
- [ ] All 4 KPI cards display
- [ ] Charts render correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] No console errors

---

### EPIC-003: Patient Management — 45% Complete (Waves)

**Overall Status:** 45% complete (Wave 1 ✅, Wave 2 ⏳, Wave 3 pending)
**Total Points:** 29 (13 done, 8 ready for QA, 8 pending)
**Mode:** Wave-based execution with sequential QA gates

#### WAVE 1: Foundation (13/13 points) ✅ COMPLETE

**Status:** Implementation done, ready for QA gate execution

| Story | Points | Dev Status | QA Status | Owner |
|-------|--------|----------|-----------|-------|
| STORY-003-001 (DB Schema) | 5 | ✅ Merged | 🔄 QA gate 2026-05-20 | @dev |
| STORY-003-002 (Patient List) | 4 | ✅ Ready | 🔄 QA gate 2026-05-20 | @dev |
| STORY-003-003 (Patient Detail) | 4 | ✅ Ready | 🔄 QA gate 2026-05-20 | @dev |

**Wave 1 QA Gate Timeline:**
```
2026-05-20 09:00 UTC:  @qa (Quinn) starts Wave 1 QA execution
                       ├─ STORY-003-001: RLS policies, encryption, audit logs
                       ├─ STORY-003-002: Load time, search, filter, pagination
                       └─ STORY-003-003: Profile display, responsive, admin audit log

2026-05-21 17:00 UTC:  @qa delivers verdict
                       ├─ PASS → Proceed to Wave 2 QA immediately
                       ├─ CONCERNS → Assign fixes (max 1 day), re-test
                       └─ FAIL → Escalate to @architect (security review)
```

**Critical QA Checklist:**
- [ ] RLS policies tested for privilege escalation
- [ ] Patient search performance < 500ms ✅
- [ ] Audit logging working for all access
- [ ] LGPD compliance verified (data encryption, retention, soft delete)
- [ ] CodeRabbit 0 CRITICAL issues
- [ ] All 7 QA gate criteria met

**Blocker:** @architect security audit must complete by 2026-05-20 EOD

---

#### WAVE 2: Core Features (8/8 points) ⏳ READY FOR QA

**Status:** Implementation complete, waiting for Wave 1 QA gate PASS

| Story | Points | Dev Status | QA Status | Owner |
|-------|--------|----------|-----------|-------|
| STORY-003-004 (Create/Edit Forms) | 8 | ✅ Ready | ⏳ Queued | @dev |

**What's Implemented:**
- [ ] /pacientes/novo (create form)
- [ ] /pacientes/[id]/editar (edit form)
- [ ] Zod validation (required fields, email, phone, DOB)
- [ ] Supabase integration (create, update)
- [ ] Auto-save draft functionality
- [ ] Success/error notifications
- [ ] TypeScript types

**Wave 2 QA Gate Timeline:**
```
After Wave 1 PASS (2026-05-21 ~18:00 UTC):

2026-05-21 18:00 UTC:  @qa starts Wave 2 QA execution
                       ├─ Create patient form
                       ├─ Edit patient form
                       ├─ Form validation edge cases
                       ├─ Auto-save functionality
                       ├─ Responsive design
                       └─ CodeRabbit review

2026-05-24 17:00 UTC:  @qa delivers verdict
                       ├─ PASS → @sm creates STORY-003-005 (Wave 3 story)
                       ├─ CONCERNS → Assign fixes, re-test (max 1 day)
                       └─ FAIL → Escalate
```

**Critical QA Checklist:**
- [ ] Create form successfully submits
- [ ] Edit form loads existing data
- [ ] Form validation prevents invalid data
- [ ] Supabase integration verified
- [ ] Auto-save working (check localStorage or Supabase timestamps)
- [ ] Success/error notifications display
- [ ] Mobile responsive
- [ ] CodeRabbit 0 CRITICAL issues

---

#### WAVE 3: Integration (8/8 points) ⏳ PENDING

**Status:** Pending STORY-003-005 creation by @sm (after Wave 2 QA PASS)

**Timeline:**
```
2026-05-24 EOD:        Wave 2 QA gate complete
                       IF PASS:
                         ├─ @sm creates STORY-003-005 (2026-05-25)
                         ├─ @po validates story (2026-05-25)
                         └─ @dev starts implementation (2026-05-26)

2026-05-27 → 2026-05-29: Wave 3 QA gate execution

2026-05-29 EOD:        Wave 3 complete → EPIC-003 COMPLETE
```

**Story Template (for @sm to use):**

```markdown
# STORY-003-005: WhatsApp Notification Integration

**Epic:** EPIC-003-patients
**Status:** Draft (for @po validation)
**Owner:** @dev (Dex)
**Points:** 8

## Description
Integrate ArIA Agent WhatsApp notifications for patient communications. Send appointment reminders 24 hours before scheduled appointments and treatment updates to patients.

## Acceptance Criteria
- [ ] WhatsApp message templates configured
- [ ] Appointment reminders sent 24h before
- [ ] Patient opt-in/opt-out preferences respected
- [ ] Message delivery tracking working
- [ ] Conversation history stored in system
- [ ] Error handling and retries implemented
- [ ] Integration with ArIA Agent WhatsApp API functional

## Technical Tasks
- [ ] Research ArIA Agent WhatsApp API documentation
- [ ] Design message template system
- [ ] Implement appointment reminder trigger (24h before)
- [ ] Implement patient opt-in/opt-out preferences
- [ ] Implement message delivery tracking
- [ ] Implement error handling and retries
- [ ] Implement conversation history storage
- [ ] Write tests for integration
- [ ] Document WhatsApp integration setup

## Dependencies
- STORY-003-001 ✅ (database schema)
- STORY-003-004 ✅ (patient management forms)

## Integration Points
- Patient contact_preferences table (opt-in/opt-out)
- Appointment scheduling data (reminder triggers)
- Patient communications table (conversation history)
- ArIA Agent WhatsApp API
```

---

### EPIC-004: Appointment Scheduling — Ready

**Overall Status:** 7 stories, 24 points, ready for development after EPIC-003 Wave 2 QA PASS

**Start Date:** 2026-05-24 (after Wave 2 QA passes)
**Target Completion:** 2026-05-31
**Owner:** @dev (Dex)
**Depends On:** EPIC-001 ✅, EPIC-003 (waves 1-2)

#### Story Breakdown

| Story | Title | Points | Owner | Start | Target |
|-------|-------|--------|-------|-------|--------|
| SCHED-001 | Calendar view | 4 | @dev | 2026-05-24 | 2026-05-25 |
| SCHED-002 | Create/edit appt | 3 | @dev | 2026-05-25 | 2026-05-26 |
| SCHED-003 | Doctor assignment | 3 | @dev | 2026-05-26 | 2026-05-27 |
| SCHED-004 | Status management | 2 | @dev | 2026-05-26 | 2026-05-27 |
| SCHED-005 | WhatsApp reminders | 4 | @dev | 2026-05-27 | 2026-05-28 |
| SCHED-006 | Waitlist mgmt | 3 | @dev | 2026-05-28 | 2026-05-29 |
| SCHED-007 | History & notes | 2 | @dev | 2026-05-29 | 2026-05-31 |

**Dev Notes:**
- Calendar library: React Big Calendar (pre-installed or npm install)
- Timezone: Brazil (America/Sao_Paulo)
- Real-time updates: Supabase subscriptions
- WhatsApp integration: Use ArIA Agent API (Wave 3 for EPIC-003 testing)

---

## Daily Standup Format (9:00 UTC, Mon-Fri)

**Participants:** @pm (Morgan), @sm (River), @dev (Dex), @qa (Quinn), @architect (Aria)

**Agenda (15 min):**
```
1. Previous day blockers (3 min)
   - USER-004/005 unblock status?
   - EPIC-003 Wave 1/2 QA progress?

2. Today's priorities (5 min)
   - @dev: What stories are you working on?
   - @qa: What testing is active?
   - @architect: Any reviews blocking?

3. Upcoming blockers (5 min)
   - Next 24h risks?
   - Dependencies on other teams?
   - External blockers (APIs, tools)?

4. Next day plan (2 min)
   - Quick preview of tomorrow's work
```

**If Blocked:**
```
ESCALATION PROTOCOL:
├─ Status: BLOCKED (cannot proceed)
├─ Root Cause: Clear description
├─ Impact: Which story/epic affected?
├─ Owner: Who will fix?
├─ ETA to unblock: When?
└─ Workaround: Any interim action?

Examples:
- USER-004: "Waiting on @architect audit, ETA 2026-05-15 16:00"
- EPIC-003: "Waiting on Wave 1 QA PASS verdict, ETA 2026-05-21"
```

---

## Code Quality Standards

### Before Committing Code

**Checklist:**
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run typecheck` passes (no TS errors)
- [ ] Unit tests pass: `npm test -- --coverage`
- [ ] Coverage > 80% for modified files
- [ ] Git diff reviewed for dead code/debug statements
- [ ] Story file updated (File List section)

### Before Submitting for QA

**Checklist:**
- [ ] CodeRabbit review: `coderabbit --prompt-only --base main`
- [ ] 0 CRITICAL issues (fix all CRITICAL before QA)
- [ ] <= 3 MEDIUM issues (document or fix)
- [ ] All story tasks marked [x] complete
- [ ] Story AC all met and verified
- [ ] Merge branch to staging for QA testing
- [ ] Create QA task list in story file

### CodeRabbit Integration

**How to Run:**
```bash
# Pre-commit review (uncommitted changes)
wsl bash -c 'coderabbit --prompt-only -t uncommitted'

# Pre-PR review (against main)
wsl bash -c 'coderabbit --prompt-only --base main'

# After review, fix CRITICAL issues and re-run
```

**Expected Results:**
- 0 CRITICAL issues before QA gate
- <= 3 MEDIUM (acceptable with documentation)
- LOW issues noted for future refactoring

---

## Story Development Cycle (per @sm's workflow)

### Phase 1: Creation (by @sm)
1. Read epic requirements
2. Break into 5-8 point stories (max)
3. Create story file: `docs/stories/STORY-00X-NNN.md`
4. Set acceptance criteria (copy from epic)
5. Create task checklist
6. Assign to @po for validation

### Phase 2: Validation (by @po - 10 min checklist)
1. AC clear and testable? ✅
2. Tech complexity appropriate? ✅
3. Dependencies listed? ✅
4. Business value clear? ✅
5. No "scope creep" risks? ✅
6. Ready for @dev? ✅

### Phase 3: Development (by @dev)
1. Read complete story (AC + tasks)
2. Update File List as work progresses
3. Mark checkboxes [x] when tasks complete
4. Push feature branch regularly
5. Request QA when ready
6. Update story with test results

### Phase 4: QA Gate (by @qa - 7 checks)
1. All AC met? ✅
2. No regressions? ✅
3. Performance SLA met? ✅
4. Mobile responsive? ✅
5. Accessibility OK? ✅
6. CodeRabbit 0 CRITICAL? ✅
7. Security review (if applicable)? ✅

### Phase 5: Merge (by @devops)
1. @qa gives PASS verdict
2. @devops merges feature branch
3. Runs CI/CD pipeline
4. Verifies production deployment
5. Story marked "Done"

---

## File Locations

**Story Files:**
```
docs/stories/
  ├─ 1.1-user-001.story.md (EPIC-001, ✅ done)
  ├─ 1.2-user-002.story.md (EPIC-001, ✅ done)
  ├─ 1.3-user-003.story.md (EPIC-001, ✅ done)
  ├─ 1.4-user-004.story.md (EPIC-001, ⏳ pending merge)
  ├─ 1.5-user-005.story.md (EPIC-001, ⏳ pending merge)
  ├─ 2.1-dash-001.story.md (EPIC-002, 📋 ready)
  ├─ 2.2-dash-002.story.md (EPIC-002, 📋 ready)
  ├─ 2.3-dash-003.story.md (EPIC-002, 📋 ready)
  ├─ 2.4-dash-004.story.md (EPIC-002, 📋 ready)
  ├─ 2.5-dash-005.story.md (EPIC-002, 📋 ready)
  ├─ 2.6-dash-006.story.md (EPIC-002, 📋 ready)
  ├─ 3.1-pat-001.story.md (EPIC-003, ✅ done)
  ├─ 3.2-pat-002.story.md (EPIC-003, 📋 ready)
  ├─ 3.3-pat-003.story.md (EPIC-003, 📋 ready)
  ├─ 3.4-pat-004.story.md (EPIC-003, ⏳ Wave 2 ready)
  ├─ 3.5-pat-005.story.md (EPIC-003, ⏳ Wave 3 pending)
  ├─ 4.1-sched-001.story.md (EPIC-004, 📋 ready)
  └─ ... (more scheduled)
```

**Documentation:**
```
docs/
  ├─ STRATEGIC-ROADMAP.md (this roadmap - high level)
  ├─ EXECUTIVE-BRIEF.md (C-level summary)
  ├─ TEAM-EXECUTION-PLAN.md (this file - daily execution)
  ├─ DEV-STATUS.md (current @dev status - updated daily)
  ├─ EPIC-003-WAVES-ROADMAP.md (detailed EPIC-003 waves)
  ├─ EPIC-003-NEXT-ACTIONS.md (daily EPIC-003 priorities)
  ├─ SCHEMA.md (database schema for Phase 1)
  ├─ SUPABASE-SETUP.md (manual Supabase setup)
  └─ epics/
      ├─ EPIC-001-authentication.md
      ├─ EPIC-002-dashboard.md
      ├─ EPIC-003-patients.md
      ├─ EPIC-004-scheduling.md
      └─ ... (more epics)
```

---

## What @pm (Morgan) Needs from Each Agent

### From @sm (River) — Scrum Master
- [ ] Daily standup notes (blockers + priorities)
- [ ] Story creation updates (which stories ready for @dev?)
- [ ] Timeline tracking (are we on schedule?)
- [ ] Risk escalations (dependencies, team capacity)

### From @dev (Dex) — Lead Developer
- [ ] Daily story progress (% complete + blockers)
- [ ] Code push notifications (feature branches + PRs)
- [ ] Test results (coverage, lint, typecheck)
- [ ] Technical blockers (infrastructure, dependencies, design)

### From @qa (Quinn) — QA Lead
- [ ] Daily QA gate status (Wave 1/2/3 progress)
- [ ] Defect list (blocking issues found)
- [ ] CodeRabbit results (CRITICAL issues)
- [ ] Test coverage tracking

### From @architect (Aria) — Solutions Architect
- [ ] Security audit results (RLS policies, encryption)
- [ ] Design review feedback (database, API, integration)
- [ ] Risk assessments (technical debt, scalability)
- [ ] Recommendations for Phase 2 architecture

### From @devops (Gage) — DevOps Lead
- [ ] Deployment status (which stories merged to prod?)
- [ ] Infrastructure status (uptime, performance metrics)
- [ ] CI/CD pipeline status (build times, test runs)
- [ ] Production issues (if any)

---

## Success Definition (By Milestone)

### By 2026-05-15 EOD (TODAY)
- [ ] USER-004 security audit signed off
- [ ] USER-005 integration tests complete
- [ ] Both merged to master
- [ ] Phase 2 Go/No-Go decision made

### By 2026-05-21 EOD (Wave 1 QA)
- [ ] EPIC-003 Wave 1 QA gate complete
- [ ] PASS or CONCERNS verdict issued
- [ ] Defect list created (if needed)

### By 2026-05-24 EOD (Wave 2 QA)
- [ ] EPIC-003 Wave 2 QA gate complete
- [ ] STORY-003-005 (Wave 3) story created by @sm
- [ ] Phase 2 kicks off (EPIC-005/006/007)

### By 2026-05-29 EOD (Wave 3 QA)
- [ ] EPIC-003 Wave 3 QA gate complete
- [ ] Phase 1 (all 4 epics) merged to production

### By 2026-05-30 EOD (UAT Starts)
- [ ] 3-5 beta clinics onboarded
- [ ] Staff UAT begins (clinic feedback)
- [ ] Production metrics baseline established

---

## Emergency Contacts

| Role | Name | Slack | Escalation |
|------|------|-------|-----------|
| **Product Manager** | Morgan (@pm) | @morgan | Budget, feature decisions, stakeholder updates |
| **Scrum Master** | River (@sm) | @river | Timeline, team capacity, dependencies |
| **Lead Developer** | Dex (@dev) | @dex | Code quality, technical blockers, architecture |
| **QA Lead** | Quinn (@qa) | @quinn | QA gate status, defect triage, testing strategy |
| **Architect** | Aria (@architect) | @aria | Security, database, integration design |
| **DevOps Lead** | Gage (@devops) | @gage | Deployment, infrastructure, CI/CD |

**During Crisis:**
1. Message @pm immediately
2. Post in #aria-clinic-urgent
3. @pm convenes crisis team within 15 min
4. @architect reviews if security-related
5. Daily updates until resolved

---

## Glossary

| Term | Definition | Example |
|------|-----------|---------|
| **Wave** | Sequential group of stories in EPIC-003 with QA gate | Wave 1 (DB + views), Wave 2 (forms), Wave 3 (WhatsApp) |
| **QA Gate** | 7-point quality checklist before story merge | All AC met, no regressions, CodeRabbit 0 CRITICAL |
| **Blocker** | Dependency preventing story start/completion | USER-004 blocked by architect audit |
| **LGPD** | Brazilian data protection law (like GDPR) | Patient data encryption, audit logging, soft delete |
| **RLS** | Row-Level Security (Supabase database policies) | Patients see own data, staff see assigned, admins see all |
| **AC** | Acceptance Criteria (story done when all checked) | [x] Form validation works, [x] Auto-save enabled |
| **SDC** | Story Development Cycle (AIOX workflow) | Create → Validate → Implement → QA → Merge |
| **Sprint** | 1-week development cycle (Monday-Friday) | Week of 2026-05-15 → 2026-05-19 |

---

## References

**Primary Documents:**
- `/docs/STRATEGIC-ROADMAP.md` — High-level product vision
- `/docs/epics/README.md` — Epic overview & dependencies
- `/docs/EPIC-003-WAVES-ROADMAP.md` — Detailed EPIC-003 waves
- `/docs/stories/*.story.md` — Individual story files

**Setup Guides:**
- `/docs/SUPABASE-SETUP.md` — Manual Supabase configuration
- `/docs/SCHEMA.md` — Database schema

**AIOX Framework:**
- `.claude/rules/story-lifecycle.md` — Story status workflow
- `.claude/rules/workflow-execution.md` — 4 primary workflows
- `.aiox-core/constitution.md` — Framework principles

---

**Prepared by:** Morgan (@pm), Product Manager
**Last Updated:** 2026-05-15 17:00 UTC
**Next Update:** Daily (daily standup)

**Distribution:** Development Team (INTERNAL)
**Classification:** Team Execution Plan
