# EPIC-004: Scheduling/Agenda Module

**Phase:** Foundation (MVP) | **Timeline:** Week 1-2 | **Owner:** @pm

## Business Objective
Enable clinic scheduling with calendar view, doctor/time slot management, patient confirmation, and waitlist handling. Integrate with WhatsApp for reminders.

## Acceptance Criteria
- [ ] Calendar view (month, week, day, list)
- [ ] Schedule appointments for patients
- [ ] Doctor/professional assignment
- [ ] Time slot availability management
- [ ] Appointment status (agendada, confirmada, cancelada, etc.)
- [ ] Patient reminders (SMS/WhatsApp)
- [ ] Appointment notes and history
- [ ] Bulk operations (reschedule, cancel multiple)
- [ ] Conflict detection (double-booking prevention)

## User Stories (from @sm)
1. SCHED-001: Calendar View (Multiple Views)
2. SCHED-002: Create/Edit Appointment
3. SCHED-003: Doctor Assignment & Availability
4. SCHED-004: Appointment Status Management
5. SCHED-005: Confirmation Reminders (WhatsApp)
6. SCHED-006: Waitlist Management
7. SCHED-007: Appointment History & Notes

## Technical Requirements
- **Calendar Library:** React Big Calendar or similar
- **Database Schema:**
  ```
  appointments table: id, patient_id, doctor_id, date, time, duration, treatment, status, notes
  doctors table: id, name, specialization, available_hours
  appointment_status table: id, name (enum: agendada, confirmada, atendida, cancelada)
  ```
- **Real-time:** Supabase real-time subscriptions for live updates
- **Notifications:** WhatsApp API integration for reminders
- **Timezone:** Brazil timezone (Brasília/São Paulo)

## Dependencies
- EPIC-001 (requires authentication)
- EPIC-003 (requires patient data)

## Related Epics
- EPIC-002 (Dashboard shows upcoming appointments)
- EPIC-005 (Budgets linked to appointments)

## Notes
- Weekly/daily view critical for doctor experience
- Appointment duration varies by treatment type
- WhatsApp reminders 24h before appointment
- Support reschedule without cancellation
- Color-code by status and treatment type
