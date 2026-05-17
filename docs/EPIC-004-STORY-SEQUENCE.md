# EPIC-004 Story Sequence & Developer Roadmap

**Prepared:** 2026-05-15
**Phase:** 3 (Architect Input for @dev)
**Mode:** YOLO (Fast-Track)
**Target:** PHASE 2 Sprint (21h dev + 10h QA)

---

## Story Execution Sequence

### Sequence: 1 → 3 → 2 → 4 → {5, 6 parallel} → 7

**Rationale:** CALE-003 (doctors) unblocks CALE-002 (form). CALE-004 (status) gates both CALE-005 & CALE-006. CALE-007 last (requires all data).

---

## Story-by-Story Roadmap

### 1️⃣ CALE-001: Calendar View (16 SP)

**Status:** 🟢 YOLO
**Why YOLO:** Foundation story; isolated from other features; pure UI + state setup
**Est. Time:** 3h development
**Dev Approach:** Rapid prototype

#### Deliverables
- `/app/scheduler/page.tsx` — Dashboard home
- `/app/scheduler/layout.tsx` — Sidebar + main layout
- `/app/scheduler/calendar/page.tsx` — Month view (react-day-picker)
- `/app/scheduler/calendar/[date]/page.tsx` — Day view (appointments list)
- `components/scheduler/CalendarView.tsx` — Calendar component (month grid)
- `components/scheduler/AppointmentCard.tsx` — Appointment display card

#### Key Implementation Details
```typescript
// lib/store/scheduler.ts — Zustand store initialization
- appointments: MOCK_APPOINTMENTS (20-30 sample records)
- doctors: MOCK_DOCTORS (5 doctors)
- selectedMonth: default to today
- getAppointmentsForDate(date) selector
```

#### Mock Data Structure
```typescript
// 20-30 appointments spread across 30 days
// Sample: { id, patientId, patientName, doctorId, doctorName, date, timeStart, duration, type, status, notes }
// 5 doctors: { id, name, specialty, workingHours: [9am-5pm, Mon-Fri] }
```

#### Quality Checkpoints
- [ ] Calendar renders month + day views
- [ ] Appointments display correctly on dates
- [ ] Responsive on mobile (calendar scrollable)
- [ ] No API calls made
- ✅ Tests: Calendar selector, date filtering (70%+ coverage)

#### Blockers
❌ **NONE** — Self-contained

---

### 2️⃣ CALE-003: Doctor Assignment (12 SP)

**Status:** 🟢 YOLO
**Why YOLO:** Simple FIFO + conflict detection; pure algorithm; no backend
**Est. Time:** 2h development
**Dev Approach:** Start parallel to CALE-001 (or immediately after)

#### Deliverables
- `/app/scheduler/doctors/page.tsx` — Doctor list + schedule
- `/app/scheduler/doctors/[id]/page.tsx` — Doctor detail view
- `components/scheduler/DoctorCard.tsx` — Doctor info card
- `components/scheduler/DoctorSchedule.tsx` — Doctor's appointment grid
- `lib/store/scheduler.ts` — Extend with doctor selectors

#### Key Implementation Details
```typescript
// Doctor conflict detection
function canAssignDoctor(doctorId: UUID, timeSlot: {date, start, duration}): boolean {
  const conflicts = appointments.filter(apt =>
    apt.doctorId === doctorId &&
    apt.status !== 'cancelled' &&
    apt.date === timeSlot.date &&
    isTimeConflict(apt.timeStart, apt.duration, timeSlot.start, timeSlot.duration)
  );
  return conflicts.length === 0;
}

function isTimeConflict(s1, d1, s2, d2): boolean {
  const end1 = addMinutes(s1, d1);
  const end2 = addMinutes(s2, d2);
  return !(end1 <= s2 || end2 <= s1);
}
```

#### Quality Checkpoints
- [ ] Doctor list displays all 5 doctors
- [ ] Conflict detection catches overlapping appointments
- [ ] Available time slots calculated correctly
- [ ] Responsive doctor schedule grid
- ✅ Tests: canAssignDoctor(), isTimeConflict(), available slots (70%+ coverage)

#### Blockers
❌ **NONE** — Self-contained
⚠️ **Assumption:** All doctors same timezone (confirm with user if not)

---

### 3️⃣ CALE-002: Create/Edit Appointment (20 SP)

**Status:** 🟢 YOLO
**Why YOLO:** Depends on CALE-003 (doctor dropdown); form-driven; standard form patterns
**Est. Time:** 4h development
**Dev Approach:** Build after CALE-003 complete

#### Deliverables
- `/app/scheduler/appointment/new/page.tsx` — Create form
- `/app/scheduler/appointment/[id]/edit/page.tsx` — Edit form
- `components/scheduler/AppointmentForm.tsx` — Form component (reusable)
- `components/scheduler/TimeSlotPicker.tsx` — Time picker (duration + start time)
- Store: `addAppointment()`, `updateAppointment()` mutations

#### Key Implementation Details
```typescript
// AppointmentFormSchema (Zod)
- patientName: string (1-100 chars)
- doctorId: UUID (from MOCK_DOCTORS)
- date: Date
- timeStart: HH:MM
- duration: 15 | 30 | 60
- type: "consultation" | "followup" | "procedure"
- notes: string (0-500 chars)

// On submit:
1. Validate form
2. Check canAssignDoctor(doctorId, {date, timeStart, duration})
3. If conflict → show "All doctors busy. Add to waitlist?"
4. If OK → addAppointment(), navigate to detail view
```

#### Reusable Component
- `AppointmentForm.tsx` used in: create, edit, CALE-006 (waitlist accept)

#### Quality Checkpoints
- [ ] Form validates all fields (Zod)
- [ ] Doctor dropdown populated from store
- [ ] Time slot picker prevents conflicts
- [ ] "Booking..." state on submit, button disabled
- [ ] Redirects to detail view on success
- [ ] Error handling: "Slot taken, pick another time"
- ✅ Tests: Form validation, conflict detection UI, success/error flows (70%+)

#### Blockers
🔴 **DEPENDS ON:** CALE-003 (doctor list must exist)

---

### 4️⃣ CALE-004: Appointment Status Management (16 SP)

**Status:** 🟡 CAREFUL
**Why CAREFUL:** Multiple status transitions; logic complexity; gates downstream features
**Est. Time:** 3h development
**Dev Approach:** Thorough; write tests first (status graph)

#### Deliverables
- `/app/scheduler/appointment/[id]/page.tsx` — Detail view with status controls
- `components/scheduler/AppointmentActions.tsx` — Status buttons (Confirm, Complete, Cancel, etc.)
- `components/scheduler/StatusBadge.tsx` — Status display badge (reusable)
- Store: `updateAppointment()` status field, `cancelAppointment(id, reason)` mutation

#### Key Implementation Details
```typescript
// Status graph (valid transitions)
scheduled → confirmed → completed
scheduled → noshow
scheduled/confirmed → cancelled

// On cancel:
1. Set status = "cancelled", reason logged
2. Check if waitlist has pending entries
3. If yes: trigger CALE-006 offer modal

// Components
- StatusBadge: Color-coded (scheduled=blue, confirmed=green, completed=gray, cancelled=red, noshow=orange)
- AppointmentActions: Buttons visible per current status
```

#### Reusable Component
- `StatusBadge.tsx` used in: detail view, history table (CALE-007), card displays

#### Quality Checkpoints
- [ ] Status transitions follow graph (invalid transitions blocked)
- [ ] Status changes update store correctly
- [ ] Cancel reason captured
- [ ] Badge colors match design system
- ✅ Tests: Status graph validation, transition logic, cancel flow (70%+)

#### Blockers
🔴 **DEPENDS ON:** CALE-002 (appointment must exist)
⚠️ **GATES:** CALE-005, CALE-006 (status field required)

---

### 5️⃣ CALE-005: Appointment Reminders (12 SP)

**Status:** 🟢 YOLO
**Why YOLO:** Stateless feature; mock WhatsApp; simple template logic
**Est. Time:** 2h development
**Dev Approach:** Rapid; form + template rendering

#### Deliverables
- `/app/scheduler/reminders/page.tsx` — Settings page
- `/app/scheduler/reminders/templates/` — Template editor (phase 2 scope TBD)
- `components/scheduler/ReminderSettings.tsx` — Settings form
- `components/scheduler/ReminderTemplate.tsx` — Template preview
- Store: `sendReminder(appointmentId)` mutation (mock)

#### Key Implementation Details
```typescript
// Mock WhatsApp send
async function sendWhatsAppReminder(patientPhone: string, message: string) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ status: 'sent', messageId: 'mock-123' }), 500);
  });
}

// Template with placeholders
const reminderTemplate = "Oi {{PATIENT}}, sua consulta é em {{DATE}} às {{TIME}} com Dr. {{DOCTOR}}. Confirmar presença?";

// On send:
1. Fill template with appointment data
2. Call sendWhatsAppReminder()
3. Show toast: "Reminder sent"
```

#### Quality Checkpoints
- [ ] Settings page loads without errors
- [ ] Template preview fills placeholders correctly
- [ ] Mock send completes in 500ms
- [ ] Toast confirmation appears
- ✅ Tests: Template placeholder filling, mock send (70%+)

#### Blockers
❌ **NONE** — Standalone feature (references appointments but doesn't modify)

---

### 6️⃣ CALE-006: Waitlist Management (16 SP)

**Status:** 🟡 CAREFUL
**Why CAREFUL:** Multi-step workflow (cancel → offer → accept/decline); UX complexity; reuses AppointmentForm
**Est. Time:** 3h development
**Dev Approach:** Thorough; test happy path + decline flow

#### Deliverables
- `/app/scheduler/waitlist/page.tsx` — Waitlist list + pending offers
- `components/scheduler/WaitlistForm.tsx` — Add to waitlist form
- `components/scheduler/WaitlistOfferModal.tsx` — Offer UI (when slot opens)
- Store: `addToWaitlist()`, `offerWaitlistSlot()`, `acceptWaitlistOffer()` mutations

#### Key Implementation Details
```typescript
// Waitlist flow on cancellation
1. User cancels appointment (CALE-004)
2. System checks: nextInWaitlist (FIFO by addedAt)
3. If found: Show WaitlistOfferModal
4. Patient can accept (creates new appointment) or decline (moves to next)
5. Update waitlist entry status: "pending" → "offered" → "accepted" or "declined"

// nextInWaitlist selector
const nextInWaitlist = (waitlist: WaitlistEntry[]) =>
  waitlist
    .filter(w => w.status === "pending")
    .sort((a, b) => a.addedAt - b.addedAt)[0];

// On offer accept:
1. Call AppointmentForm (reuse from CALE-002)
2. Pre-fill doctor (if offered same), date, time from offer
3. Create new appointment
4. Update waitlist: status = "accepted"
```

#### Reusable Components
- `AppointmentForm.tsx` — Used to create appointment from offer
- Trigger: On appointment cancel (CALE-004)

#### Quality Checkpoints
- [ ] Add to waitlist form captures patient intent
- [ ] FIFO ordering enforced
- [ ] Offer modal shows on cancellation
- [ ] Accept flow creates appointment correctly
- [ ] Decline flow moves to next patient
- [ ] Responsive modal UI
- ✅ Tests: FIFO ordering, offer flow, accept/decline (70%+)

#### Blockers
🔴 **DEPENDS ON:** CALE-004 (cancellation triggers offer)
⚠️ **Complexity:** Multi-step workflow; test both happy path + decline scenarios

---

### 7️⃣ CALE-007: Appointment History & Analytics (16 SP)

**Status:** 🟡 CAREFUL
**Why CAREFUL:** Aggregation + filtering logic; analytics calculations; data correctness critical
**Est. Time:** 3h development
**Dev Approach:** Thorough; validate all calculations with unit tests

#### Deliverables
- `/app/scheduler/history/page.tsx` — History page with filters
- `components/scheduler/HistoryTable.tsx` — Sortable, filterable table
- `components/scheduler/HistoryAnalytics.tsx` — Analytics cards + charts (Recharts)
- Store: No mutations; pure selectors

#### Key Implementation Details
```typescript
// Filters
- DateRange: from/to date picker
- Doctor: dropdown (single or multi-select)
- Patient: search box (debounced)
- Status: multi-select checkboxes (completed, cancelled, noshow, etc.)
- Sort: Clicking headers (date, doctor, patient, status, duration)

// Analytics calculations
- No-show rate: count(status==='noshow') / total * 100
- Completion rate: count(status==='completed') / total * 100
- Avg duration: sum(duration) / count
- Busiest doctor: max(count by doctorId)
- Busiest day: max(count by day_of_week)

// Export (Phase 2 MVP)
- CSV download with: id, patient, doctor, date, status, duration
- PDF (Phase 2 enhancement: jspdf)
```

#### Quality Checkpoints
- [ ] Filters work independently + combined
- [ ] Sort by all columns works correctly
- [ ] Analytics calculations match hand-verified totals
- [ ] Search debounced (300ms)
- [ ] Table responsive (horizontal scroll on mobile)
- [ ] CSV export downloads without errors
- ✅ Tests: Filter logic, analytics calculations, sort, export (70%+)

#### Blockers
🔴 **DEPENDS ON:** All prior stories (CALE-001 → CALE-006)
⚠️ **Data Validation:** Manually verify 3-5 calculations before QA gate

---

## Development Approach by Category

### 🟢 YOLO Stories (Fast-Track)
**CALE-001, CALE-003, CALE-005** — Rapid prototyping, minimal iteration

**Approach:**
1. Read AC briefly; implement core feature
2. Run tests (should mostly pass first try)
3. CodeRabbit quick pass
4. Move to next story immediately

**Suggested Timeline:**
- CALE-001: 3h → CALE-003: 2h → CALE-005: 2h = **7h total**

### 🟡 CAREFUL Stories (Standard)
**CALE-002, CALE-004, CALE-006, CALE-007** — Test-first, validate logic

**Approach:**
1. Read AC thoroughly; identify test cases
2. Write happy path tests first
3. Implement feature to pass tests
4. Write edge case tests; iterate
5. CodeRabbit feedback loop (max 2 iterations)
6. QA gate validation

**Suggested Timeline:**
- CALE-002: 4h (form validation + conflicts)
- CALE-004: 3h (status transitions)
- CALE-006: 3h (multi-step workflow)
- CALE-007: 3h (analytics validation)
= **13h total**

**Total Dev Time: 7h + 13h = 20h** ✅ (within 21h budget)

---

## Code Reuse Opportunities

| Component | Used In | Notes |
|-----------|---------|-------|
| `AppointmentForm.tsx` | CALE-002 (create), CALE-002 (edit), CALE-006 (accept offer) | Reuse with pre-filled props |
| `StatusBadge.tsx` | CALE-004 (detail), CALE-007 (history table), Cards | Color-coded status display |
| `TimeSlotPicker.tsx` | CALE-002 (form), CALE-006 (offer accept) | Duration + time picker widget |
| `AppointmentCard.tsx` | CALE-001 (calendar day view), CALE-007 (history) | Compact appointment display |

**Reuse Strategy:** Prop-driven components (doctor, date, time as props). Handle form state in parent page component, not the form itself (Presentational Component Pattern).

---

## Potential Blockers & Mitigation

| Blocker | Risk | Mitigation |
|---------|------|-----------|
| **Timezone handling** | HIGH | ⚠️ User clarification needed: Are all doctors in same timezone? If not, escalate before CALE-001 starts. For now, assume same timezone (Brazil, São Paulo). |
| **Double-booking under concurrency** | MEDIUM | Phase 3 backend constraint. For Phase 2: Disable button during "Booking..." state. Show clear error "Slot taken" on conflict. Acceptable for MVP. |
| **Waitlist offer modal flow** | MEDIUM | Test both accept + decline scenarios. Use integration tests (Cypress or Playwright) to verify multi-step UX. |
| **Analytics calculation errors** | MEDIUM | Hand-verify 3-5 calculations before QA gate. Unit test all aggregation functions thoroughly. |
| **Performance: 100+ appointments** | LOW | Not an issue for MVP. Optimize Phase 3 if needed. Use React.memo() on list item components if sluggish. |

---

## @dev Handoff Checklist

Before starting CALE-001:

- [ ] Read docs/EPIC-004-ARCHITECTURE.md (understand design decisions)
- [ ] Review lib/store/scheduler.ts template (Zustand structure)
- [ ] Verify MOCK_APPOINTMENTS & MOCK_DOCTORS data in place
- [ ] Understand story dependency graph (1 → 3 → 2 → 4 → {5, 6} → 7)
- [ ] Timezone assumption confirmed or escalated ⚠️
- [ ] TailwindCSS + react-day-picker + Zod + Recharts available in package.json ✅

---

## Success Criteria

**Per Story:**
- AC all checked ✅
- ≥70% test coverage
- CodeRabbit PASS
- @qa QA Gate PASS

**Epic Total:**
- 7/7 stories completed
- No critical bugs (QA gate PASS)
- <500ms P95 latency (client-side, no backend)
- Responsive on mobile/tablet/desktop

---

## Checkpoint Timeline

| Date | Milestone | Owner |
|------|-----------|-------|
| 2026-05-16 | CALE-001, CALE-003, CALE-005 YOLO complete | @dev |
| 2026-05-17 | CALE-002, CALE-004 CAREFUL complete | @dev |
| 2026-05-18 | CALE-006, CALE-007 CAREFUL complete | @dev |
| 2026-05-19 | All stories QA gate PASS | @qa |

---

**Approved by:** @architect
**Date:** 2026-05-15
**Status:** Ready for @dev handoff

