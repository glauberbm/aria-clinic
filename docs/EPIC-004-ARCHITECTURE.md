# EPIC-004 Architecture — Scheduler & Appointment Management

**Epic:** EPIC-004 (Scheduler Phase 2)
**Stories:** 7 (CALE-001 through CALE-007)
**Total SP:** 112 (7 stories × 16 SP avg)
**Estimated Duration:** 21 hours development + 10h QA + 5h buffer = 36h total
**Target:** 2-week sprint (Phase 2)

---

## Executive Summary

EPIC-004 implements a **frontend-first appointment scheduler** for clinic receptionists and managers. All features are client-side with mock data for MVP; backend integration deferred to Phase 3.

**Key principles:**
- ✅ Frontend-only (no backend calls Phase 2)
- ✅ Mock data simulates API responses
- ✅ Simple algorithms (FIFO, no ML)
- ✅ Timezone-aware (browser Intl API)
- ✅ Responsive (mobile-first)

---

## Story Dependency Graph

```
CALE-001 (Calendar View)
├── CALE-002 (Create/Edit Appointment)
│   └── CALE-004 (Status Management)
│       ├── CALE-005 (Reminders)
│       └── CALE-006 (Waitlist)
├── CALE-003 (Doctor Assignment)
│   └── CALE-002 (needs doctor dropdown)
└── CALE-007 (History & Analytics — last, uses all data)
```

**Sequence for development:**
1. **CALE-001** (calendar foundation)
2. **CALE-003** (doctors — needed by CALE-002)
3. **CALE-002** (appointment form)
4. **CALE-004** (status mgmt)
5. **CALE-005** (reminders)
6. **CALE-006** (waitlist)
7. **CALE-007** (history)

---

## Architecture Decisions

### 1. Calendar Sync Strategy

**MVP (Phase 2): Client-side only**
- No sync with external calendars
- Browser localStorage for session persistence (not storage)
- Mock API: 20-30 sample appointments distributed across 30 days
- Client-side event emitter for cross-component updates

**Phase 3+: Backend sync**
- REST API: GET /api/scheduler/appointments, POST /api/scheduler/appointments/{id}
- Real-time sync: WebSockets for multi-client updates
- External sync: Google Calendar / iCal export

**Implementation:**
```typescript
// Mock data store (Phase 2)
interface Appointment {
  id: UUID;
  patientId: UUID;
  patientName: string;
  doctorId: UUID;
  doctorName: string;
  date: Date;
  timeStart: HH:MM;
  duration: 15 | 30 | 60; // minutes
  type: "consultation" | "followup" | "procedure";
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "noshow";
  notes: string;
}

// Zustand store (recommended over Context for this complexity)
import create from 'zustand';
const useSchedulerStore = create((set) => ({
  appointments: [...], // 20-30 mock
  addAppointment: (apt) => set((s) => ({ appointments: [...s.appointments, apt] })),
  updateAppointment: (id, updates) => set((s) => ({
    appointments: s.appointments.map((a) => a.id === id ? {...a, ...updates} : a)
  })),
}));
```

**Risk:** Zustand state lost on page refresh (acceptable for MVP)

---

### 2. Doctor Assignment Algorithm

**MVP (Phase 2): Simple FIFO + conflict check**

**Algorithm:**
```typescript
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
  return !(end1 <= s2 || end2 <= s1); // Overlaps?
}
```

**Phase 3+: Load-balanced assignment**
- Prefer doctors with fewer appointments that day
- Respect doctor specialty preferences (consultation → specific doctors)
- Machine learning: Predict no-show risk, suggest timing

**Implementation:**
- Mock data: 5 doctors with working hours (9am-5pm, Mon-Fri)
- Drag-drop UI: Allow manual override (Radix Dropdown + react-dnd)
- Validation: Prevent drag if time conflict detected

---

### 3. Waitlist Priority Handling

**MVP (Phase 2): FIFO (First In, First Out)**

```typescript
interface WaitlistEntry {
  id: UUID;
  patientId: UUID;
  patientName: string;
  requestedDate: Date;
  requestedTime: HH:MM;
  status: "pending" | "offered" | "accepted" | "declined";
  addedAt: Timestamp; // Sort by this
}

// Get next available patient
const nextInWaitlist = (waitlist: WaitlistEntry[]) =>
  waitlist
    .filter(w => w.status === "pending")
    .sort((a, b) => a.addedAt - b.addedAt)[0];
```

**Flow on cancellation:**
1. Appointment cancelled → status = "cancelled"
2. System detects available slot
3. Offer UI shows first patient in waitlist
4. Patient (via WhatsApp mock) accepts/declines
5. Accepted → new appointment created, old waitlist entry marked "accepted"

**Phase 3+: Priority levels**
- VIP (higher priority), Regular, Other
- Support custom priority rules (doctor preference, geography)

---

### 4. Timezone Handling

**MVP (Phase 2): Browser Intl API**

```typescript
// Display appointments in user's local timezone
const displayTime = new Intl.DateTimeFormat('pt-BR', {
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  hour: '2-digit',
  minute: '2-digit',
  weekday: 'short',
  month: '2-digit',
  day: '2-digit',
}).format(new Date(appointmentDate));
```

**Assumption:** All doctors in same timezone (clinic location). If not, escalate.

**Phase 3+: Multi-timezone support**
- Store appointments in UTC (ISO 8601)
- Database: TIMESTAMP WITH TIME ZONE
- Per-doctor timezone preference
- Calendar sync respects timezones

**Risk:** **CRITICAL** — What if doctors are in different timezones? Answer required before Phase 3.

---

### 5. Concurrency Handling (Double-booking)

**MVP (Phase 2): Client-side validation only**

**Risk:** If 2 receptionists book same slot simultaneously:
- Both see slot as "free"
- Both click submit
- One succeeds, one gets validation error

**Mitigation:**
- Show "Booking..." state during submission
- Disable button (prevent double-click)
- On error: "Slot taken, pick another time"
- Refresh appointment list after every mutation

**Phase 3+: Backend-enforced constraint**
- Database UNIQUE constraint: (doctor_id, date, time_start)
- Transaction-level locks during appointment creation

---

### 6. WhatsApp Integration

**MVP (Phase 2): Simulated**

```typescript
// Mock send
async function sendWhatsAppReminder(patientPhone: string, message: string) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ status: 'sent', messageId: 'mock-123' }), 500);
  });
}

// Template with placeholders
const reminderTemplate = "Oi {{PATIENT}}, sua consulta é em {{DATE}} às {{TIME}} com Dr. {{DOCTOR}}. Confirmar presença?";

const filledTemplate = reminderTemplate
  .replace('{{PATIENT}}', appointment.patientName)
  .replace('{{DATE}}', formatDate(appointment.date))
  .replace('{{TIME}}', appointment.timeStart)
  .replace('{{DOCTOR}}', appointment.doctorName);
```

**Phase 3+: Real integration**
- Twilio WhatsApp API (`npm install twilio`)
- Button-triggered manual sends
- Scheduled cron: Auto-send 24h and 1h before appointment
- Delivery log: Track sent, delivered, read, failed

**Risk:** WhatsApp API complexity (authentication, rates). Budget 10-15h Phase 3.

---

### 7. Escalation Paths

**All slots full:**
1. Appointment creation fails (time conflict)
2. Suggest waitlist: "All doctors busy. Join waitlist?"
3. Patient accepts → added to waitlist
4. Manager manually offers alternatives (different date/time)

**Phase 3+: Smart suggestions**
```typescript
function suggestAlternativeTimes(
  patientPref: { date, doctorId },
  appointments: Appointment[]
): Array<{ date, time, doctor }> {
  // Find next 3 available slots:
  // - Same doctor, ±3 days
  // - Different doctor (same specialty), ±2 days
  // - Any doctor, ±5 days
}
```

---

## State Management Design

**Recommendation: Zustand** (not Context — simpler for this data volume)

```typescript
// store/scheduler.ts
import create from 'zustand';

interface SchedulerStore {
  // Data
  appointments: Appointment[];
  doctors: Doctor[];
  waitlist: WaitlistEntry[];

  // UI
  selectedMonth: { year, month };
  selectedDoctor: UUID | null;

  // Mutations
  addAppointment: (apt: Appointment) => void;
  updateAppointment: (id: UUID, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: UUID, reason: string) => void;
  addToWaitlist: (entry: WaitlistEntry) => void;

  // Selectors
  getAppointmentsForDate: (date: Date) => Appointment[];
  getAvailableSlots: (doctorId: UUID, date: Date) => TimeSlot[];
  getWaitlistForDoctor: (doctorId: UUID) => WaitlistEntry[];
}

export const useScheduler = create<SchedulerStore>((set, get) => ({
  appointments: MOCK_APPOINTMENTS,
  doctors: MOCK_DOCTORS,
  waitlist: [],
  selectedMonth: new Date(),
  selectedDoctor: null,

  addAppointment: (apt) => set((state) => ({
    appointments: [...state.appointments, apt],
  })),
  // ... other mutations
}));
```

**Why Zustand over Context?**
- Finer-grained subscriptions (doesn't re-render entire tree)
- Built-in immer middleware (easy state mutations)
- DevTools integration (time-travel debugging)
- Simpler API than Redux, Recoil

---

## Component Structure

```
app/scheduler/
├── page.tsx (dashboard/home)
├── layout.tsx (sidebar + main)
├── calendar/
│   ├── page.tsx
│   └── [date]/
│       └── page.tsx (day view)
├── appointment/
│   ├── new/page.tsx
│   ├── [id]/edit/page.tsx
│   └── [id]/page.tsx (details)
├── doctors/
│   ├── page.tsx
│   └── [id]/page.tsx (doctor schedule)
├── reminders/
│   ├── page.tsx (settings)
│   └── templates/
├── waitlist/
│   └── page.tsx
└── history/
    └── page.tsx

components/scheduler/
├── CalendarView.tsx
├── AppointmentForm.tsx
├── AppointmentCard.tsx
├── AppointmentActions.tsx
├── DoctorCard.tsx
├── DoctorSchedule.tsx
├── WaitlistForm.tsx
├── WaitlistOfferModal.tsx
├── ReminderSettings.tsx
├── ReminderTemplate.tsx
├── HistoryTable.tsx
├── HistoryAnalytics.tsx
└── TimeSlotPicker.tsx
```

---

## Tech Stack Finalized

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 15 + React 19 | SSR not needed yet; CSR fine for MVP |
| **Styling** | TailwindCSS 3.4 | Consistent with existing codebase |
| **Forms** | React Hook Form + Zod | Industry standard, excellent DX |
| **Date/Time** | date-fns + react-day-picker | Lightweight, no moment.js bloat |
| **Charts** | Recharts | React-native, lightweight (Phase 3 analytics) |
| **State** | Zustand | Minimal, performant, DevTools integration |
| **Drag-drop** | react-dnd or native HTML5 | TBD; native if simple, react-dnd if complex |
| **UI Components** | Radix UI + shadcn/ui | Already in codebase |
| **Testing** | Vitest + React Testing Library | Fast, modern, focuses on behavior |

---

## Risk Matrix & Mitigation

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Timezone handling (multi-zone doctors)** | HIGH | Clarify with user before CALE-001 starts |
| **Double-booking (concurrent users)** | MEDIUM | Client-side validation + clear UX ("Booking...") |
| **Scalability (100+ apt/day)** | LOW | Not an issue for MVP; optimize Phase 3 if needed |
| **WhatsApp mock → real API (Phase 3)** | MEDIUM | Budget 10-15h; Plan early |
| **State management complexity** | LOW | Zustand handles well; no Redux-level complexity |
| **Responsive design (mobile calendar)** | LOW | TailwindCSS responsive utilities handle it |
| **Accessibility (WCAG)** | MEDIUM | Use Radix UI (built-in a11y); test with @qa |

---

## Development Recommendations

### YOLO Mode (Fast-track)
1. **CALE-001 & CALE-003 in parallel** (calendar + doctors) — separate components, same data
2. **CALE-002** (form reuses doctor + date from 001/003)
3. **CALE-004** (status — add state field, button components)
4. **CALE-005 & CALE-006 in parallel** (reminders + waitlist — orthogonal)
5. **CALE-007** (analytics — last, uses all data)

### Per-Story Approach
- **Don't build full API mocks** — 3-5 sample records sufficient
- **Skip animations** for MVP (add Phase 3)
- **Don't optimize early** — ship first, profile later
- **Test happy path first** — edge cases Phase 3

### Code Reuse Opportunities
- **AppointmentForm** used in: CALE-002 (create), CALE-002 (edit), CALE-006 (waitlist accept)
- **StatusBadge** component used in: CALE-004, CALE-007
- **TimeSlotPicker** used in: CALE-002 (form), CALE-006 (offer)

---

## Blockers & Dependencies Check

| Story | Blocker? | Depends On | Mitigation |
|-------|----------|-----------|-----------|
| CALE-001 | NO | — | Start immediately |
| CALE-002 | **YES** | CALE-003 (doctor list) | Run CALE-003 first |
| CALE-003 | NO | CALE-001 data model | Run after/parallel to CALE-001 |
| CALE-004 | NO | CALE-002 (appointment exists) | Sequential; clear dependency |
| CALE-005 | NO | CALE-004 (status needed) | Sequential; trivial |
| CALE-006 | NO | CALE-004 (cancellation) | Sequential; critical workflow |
| CALE-007 | NO | All prior (data source) | Build last |

**Clear path:** 1 → 3 → 2 → 4 → {5, 6} → 7

---

## Success Metrics (MVP)

- ✅ 7/7 stories completed
- ✅ ≥70% test coverage per story
- ✅ No E2E failures in QA gate
- ✅ Responsive on 3 screen sizes
- ✅ Accessible (Radix UI + manual a11y review)
- ✅ <500ms P95 latency (client-side, no backend)

---

## Next Phase (Phase 3) Backlog

1. **Backend integration:** REST API endpoints for appointments
2. **Real-time sync:** WebSockets for multi-user updates
3. **WhatsApp real integration:** Twilio API
4. **Timezone multi-support:** Per-doctor timezone, UTC storage
5. **Smart scheduling:** Predictive availability, load balancing
6. **Analytics export:** PDF reports (jspdf)
7. **Scheduled reminders:** Cron jobs for auto-send 24h/1h before

---

**Approved by:** @architect
**Date:** 2026-05-15
**Status:** Ready for development sprint planning
