# Phase 2 Requirements Workshop

**Date:** May 20-22, 2026 (3 sessions)
**Duration:** 4 hours total (distributed across 3 days)
**Facilitators:** Morgan (@pm), Aria (@architect), River (@sm)
**Participants:** Clinic leadership, medical directors, IT lead, operations manager

---

## Workshop Objectives

By end of this workshop, clinic will have:
1. Finalized all feature requirements for Phase 2
2. Confirmed user experience flows (scheduler, payments, WhatsApp)
3. Identified data migration scope (if legacy data exists)
4. Scheduled UAT testing period with specific test scenarios
5. Established go-live communication plan

**Deliverable:** Requirements document (PHASE-2-REQUIREMENTS.md) to drive development

---

## Pre-Workshop Preparation (May 19)

**Clinic must prepare:**
- [ ] List of 5 UAT staff assigned (names & roles)
- [ ] Legacy data export (if applicable)
- [ ] Current appointment booking process (documented or flow chart)
- [ ] Current payment process (documented)
- [ ] List of top 5 operational pain points today

**We provide:**
- Presentation slides
- Sample requirement templates
- Whiteboard/flip chart
- Notepads for note-taking

---

## Session 1: Feature Requirements Deep-Dive (May 20, 2 hours)

**Time:** 9:00 AM - 11:00 AM
**Location:** Clinic conference room (or Zoom if virtual)
**Facilitator:** Morgan (@pm)
**Participants:** CEO, Operations Manager, Medical Director

### Agenda

#### Part A: Scheduler Requirements (45 min)

**Current State (baseline):**
- How do you currently schedule appointments? (Phone? Paper? Spreadsheet?)
- How many doctors? _______
- How many appointment slots per doctor per day? _______
- Typical appointment duration? (30 min, 45 min, 60 min)

**Q&A: Doctor Availability**

1. **How should doctors manage availability?**
   - Option A: Admin sets schedule for all doctors (centralized)
   - Option B: Each doctor manages their own calendar (decentralized)
   - **Clinic preference:** [ ] A [ ] B

2. **Recurring appointments?** (same time every week)
   - [ ] YES — Doctor has recurring slots (e.g., every Mon 2-4 PM)
   - [ ] NO — Each appointment scheduled individually

3. **Vacation/time-off handling?**
   - Doctor marks unavailable for specific dates?
   - How far in advance? (1 week? 1 month?)

**Q&A: Patient Booking**

4. **Who can book appointments?**
   - Option A: Patients book themselves online (24/7 self-service)
   - Option B: Receptionist books on behalf of patient (call/in-person)
   - Option C: Both (hybrid)
   - **Clinic preference:** [ ] A [ ] B [ ] C

5. **Booking constraints?**
   - Can patients book same-day? (emergency slots)
   - How far in advance can patients book? (max 3 months ahead)
   - Can patients pick specific doctor, or any available?

6. **Cancellation policy?**
   - How many hours before appointment can patient cancel? (24h? 2h?)
   - What happens if they cancel late? (charge fee? auto-reschedule)
   - Doctor-initiated cancellations?

**Q&A: Waitlist & Auto-Notify**

7. **Waitlist feature?**
   - If appointment is full, can patient join waitlist?
   - Auto-notify patient when slot becomes available? (via WhatsApp/email)
   - **Clinic preference:** [ ] YES [ ] NO

8. **No-Show handling?**
   - Auto-charge patient for no-show? Or manual review?
   - How much ($20? 50%)?
   - Block patient from future booking if X no-shows?

**Q&A: Integrations**

9. **Calendar integrations?**
   - Sync to Google Calendar? Outlook?
   - Push appointments to doctor's personal calendar?

10. **Appointment reminders?**
    - 24-hour reminder (handled by EPIC-006 WhatsApp)
    - 1-hour reminder (handled by EPIC-006)
    - Any other timing?

**Deliverable:** "Scheduler Requirements" section of PHASE-2-REQUIREMENTS.md

---

#### Part B: Payments Requirements (45 min)

**Facilitator:** Morgan (@pm) with Dara (@data-engineer)

**Current State:**
- How do patients pay today? (Cash? Credit card? Bank transfer?)
- What percentage pay upfront vs. invoice after visit?
- Do you have a payment processor today? (Stripe? PagSeguro? PayPal?)

**Q&A: Pricing Model**

1. **How do you charge for services?**
   - Per appointment (flat fee or based on doctor)
   - Doctor A: R$ 250 per visit
   - Doctor B: R$ 350 per visit
   - **Clinic preference:** Fixed per doctor [ ] YES [ ] NO
   - **List prices:**
     - Standard consultation: R$ _______
     - Extended consultation: R$ _______
     - Procedure/surgery: R$ _______

2. **Discounts or promotions?**
   - First-time patient discount?
   - Bulk package (5 visits = 10% off)?
   - **Clinic preference:** [ ] YES [ ] NO

3. **Insurance integration?**
   - Do patients have insurance coverage?
   - Should system check insurance coverage before booking?
   - Bill insurance directly, or patient pays & submits?

**Q&A: Tax & Invoicing**

4. **Tax compliance (Brazil):**
   - Need NF-e (Nota Fiscal Eletrônica) invoices?
   - Need invoices at all, or just receipts?
   - **Clinic preference:** [ ] YES, need NF-e [ ] YES, invoices only [ ] NO

5. **Invoicing timing?**
   - Invoice at time of payment (payment receipt)?
   - Invoice after appointment completed?
   - Invoice after 30 days (batch billing)?

**Q&A: Payment Methods**

6. **Which payment methods to accept?**
   - [ ] Credit card (Visa, Mastercard, Amex)
   - [ ] Debit card
   - [ ] PIX (Banco Central's instant transfer)
   - [ ] Boleto (bank transfer slip)
   - [ ] Cash (manual entry only)
   - [ ] Health insurance (billing insurance directly)

7. **Refund policy?**
   - Full refund for cancellation within 24h?
   - Partial refund?
   - No refund (non-refundable)?

**Q&A: Reconciliation**

8. **Payment verification?**
   - Auto-confirm when payment received (API)?
   - Manual confirmation by admin?
   - How long to release appointment if payment fails?

9. **Reporting needs?**
   - Daily revenue summary?
   - Revenue by doctor per month?
   - Failed payments report (to follow up)?

**Deliverable:** "Payments Requirements" section of PHASE-2-REQUIREMENTS.md

---

### Session 2: Communications & Analytics (May 21, 1.5 hours)

**Time:** 10:00 AM - 11:30 AM
**Location:** Clinic conference room (or Zoom)
**Facilitator:** Morgan (@pm) + Uma (@ux-design-expert)

#### Part C: Communications (WhatsApp) Requirements (45 min)

**Current State:**
- Do you currently send appointment reminders? (How?)
- Response rate to reminders? (Do patients show up after reminder?)
- Any patient communication issues? (people forget appointments?)

**Q&A: Messaging Channel**

1. **Primary communication channel for reminders?**
   - [ ] WhatsApp only (preferred, but need patient opt-in)
   - [ ] SMS only (less trendy, but 100% reliable)
   - [ ] Both (WhatsApp primary, SMS fallback)
   - **Clinic preference:** ____________

2. **Message language?**
   - [ ] Portuguese (Brazil)
   - [ ] English
   - [ ] Mixed (patient's preference)
   - **Clinic preference:** ____________

3. **Message personalization?**
   - Generic: "Appointment tomorrow at 2 PM"
   - Personalized: "Hi João, your appointment with Dr. Silva is tomorrow at 2 PM"
   - **Clinic preference:** [ ] Generic [ ] Personalized

**Q&A: Reminder Timing**

4. **Reminder schedule?**
   - [ ] 24 hours before appointment
   - [ ] 1 hour before appointment
   - [ ] Both (24h + 1h)
   - [ ] Custom timing? (specify): ____________
   - **Clinic preference:** ____________

5. **What if patient confirms/cancels via WhatsApp?**
   - Patient replies "Confirmado" → auto-update system?
   - Patient replies "Cancelar" → auto-cancel & trigger reschedule offer?
   - **Clinic preference:** [ ] YES (interactive) [ ] NO (one-way messages only)

**Q&A: Compliance & Approval**

6. **Message template approval?**
   - Before go-live, message templates must be reviewed by clinic for brand/compliance
   - Templates need approval from: [ ] CEO [ ] Medical Director [ ] Operations Manager
   - **Clinic preference:** Who should approve messages? ____________

7. **Patient opt-in/opt-out?**
   - Patients must consent to WhatsApp reminders?
   - System tracks consent?
   - Auto-switch to SMS if patient opts out of WhatsApp?
   - **Clinic preference:** [ ] YES, require consent [ ] NO, assume consent

8. **WhatsApp Business Account setup?**
   - We create clinic's WhatsApp Business account?
   - Or clinic creates and grants us API access?
   - Who owns the account (clinic or Aria)?
   - **Clinic preference:** ____________

**Deliverable:** "Communications Requirements" section of PHASE-2-REQUIREMENTS.md

---

#### Part D: Analytics Requirements (30 min)

**Facilitator:** Morgan (@pm)

**Current State:**
- What metrics do you track today? (appointments, revenue, no-shows?)
- How do you generate reports? (spreadsheets? manual count?)
- Who needs reports? (CEO? Medical Director? Finance?)

**Q&A: Key Metrics**

1. **What are your top 5 most important metrics?**
   - [ ] Total appointments per month
   - [ ] Appointment completion rate (% show-up rate)
   - [ ] No-show rate
   - [ ] Revenue by doctor
   - [ ] Revenue by specialty
   - [ ] Patient retention (repeat visits)
   - [ ] Average wait time
   - [ ] Patient satisfaction (NPS)
   - [ ] Cancellation rate
   - Other: ____________

2. **Who needs reports?**
   - CEO (monthly summary)
   - Medical Director (doctor performance)
   - Finance (revenue, payments)
   - Operations (efficiency, no-shows)
   - **Clinic preference:** Who gets what report? ____________

**Q&A: Report Format & Frequency**

3. **Report frequency?**
   - [ ] Daily (executive summary)
   - [ ] Weekly (trends)
   - [ ] Monthly (comprehensive)
   - [ ] Quarterly (year-end review)
   - **Clinic preference:** ____________

4. **Report format?**
   - PDF (static, email-friendly)
   - CSV (Excel-compatible, data analysis)
   - Dashboard (interactive web view)
   - **Clinic preference:** [ ] PDF [ ] CSV [ ] Dashboard [ ] All three

5. **Specific questions analytics should answer?**
   - "Which doctor is most booked?"
   - "What's our no-show rate this month?"
   - "Revenue trend vs. last quarter?"
   - "Patient acquisition rate (new vs. returning)?"
   - Clinic's top question: ____________

**Q&A: Data Retention & Privacy**

6. **How long to keep historical data?**
   - [ ] 1 year
   - [ ] 2 years
   - [ ] 5 years
   - [ ] Indefinite

7. **Privacy for doctors?**
   - Doctors can see their own metrics only?
   - Doctors can see other doctors' metrics for comparison?
   - **Clinic preference:** [ ] Own only [ ] Can compare [ ] CEO sees all, doctors see own

**Deliverable:** "Analytics Requirements" section of PHASE-2-REQUIREMENTS.md

---

### Session 3: UAT Planning & Go-Live Readiness (May 22, 1.5 hours)

**Time:** 9:00 AM - 10:30 AM
**Location:** Clinic conference room (or Zoom)
**Facilitator:** River (@sm) + Quinn (@qa)

#### Part E: UAT Test Scenarios (45 min)

**Overview:**
UAT (User Acceptance Testing) is June 24-30. Clinic staff test the system with real scenarios before go-live.

**UAT Scope & Test Plan:**

1. **Scheduler Testing (receptionist + doctors)**
   - [ ] Doctor can set availability for next month
   - [ ] Patient can view available slots and book appointment online
   - [ ] Appointment appears on doctor's calendar
   - [ ] Patient receives booking confirmation (email + WhatsApp)
   - [ ] Receptionist can manually create appointment for patient
   - [ ] Doctor can mark appointment as "completed" or "cancelled"
   - [ ] Patient can cancel appointment 24+ hours in advance
   - [ ] Patient receives cancellation confirmation
   - [ ] Doctor receives notification of cancellation
   - [ ] Waitlist notification triggers when slot becomes available
   - [ ] No-show: Patient doesn't arrive, system marks as "no_show"
   - [ ] System blocks no-show patient from booking if threshold reached

2. **Payments Testing (receptionist + finance)**
   - [ ] Receptionist can set consultation price for doctor
   - [ ] System calculates total cost at booking
   - [ ] Patient can pay via credit card
   - [ ] System displays payment confirmation
   - [ ] Invoice is generated automatically
   - [ ] Clinic receives payment notification
   - [ ] Patient can download receipt/invoice
   - [ ] Payment appears in daily revenue report
   - [ ] Receptionist can manually create payment (cash)
   - [ ] Refund process: Receptionist initiates refund, patient receives notification
   - [ ] Finance can reconcile payments vs. bank statement

3. **Communications Testing (operations)**
   - [ ] WhatsApp reminder sends 24h before appointment
   - [ ] Patient receives message on correct phone number
   - [ ] Reminder includes appointment time & doctor name
   - [ ] Patient can reply to confirm or cancel
   - [ ] System updates based on patient reply
   - [ ] 1-hour reminder sends (if configured)
   - [ ] SMS fallback works if WhatsApp fails
   - [ ] Clinic can customize message template
   - [ ] Patient opt-out works (blocks future messages)

4. **Analytics Testing (CEO + Medical Director)**
   - [ ] Monthly report can be generated with 1-click
   - [ ] Report includes total appointments, no-show rate, revenue
   - [ ] Report can be exported as PDF
   - [ ] Doctor can view their own performance metrics
   - [ ] Doctor performance comparison available (anonymized if needed)
   - [ ] Revenue report breaks down by doctor
   - [ ] Trends show vs. previous month

**Q&A: Test Scenario Prioritization**

1. **Which test scenarios are CRITICAL (must pass before go-live)?**
   - Mark top 10 scenarios that block go-live if they fail
   - **Clinic preference:** (Clinic to circle/rank 10 most critical)

2. **Which scenarios are IMPORTANT but not blocking?**
   - Mark 10-15 scenarios that are nice-to-have
   - Can accept known issues for these

3. **Which scenarios can we skip/defer to Phase 3?**
   - Advanced features that aren't critical to launch
   - E.g., "multi-clinic reporting", "inventory management", etc.

**Deliverable:** "UAT Test Plan" (50+ test scenarios with priority levels)

---

#### Part F: Go-Live Communication & Support Plan (30 min)

**Facilitator:** River (@sm)

**Q&A: Clinic Go-Live Team**

1. **Who is responsible for what on go-live day (July 14)?**
   - **Primary Contact (on-call):** ____________ (phone: _________)
   - **Secondary Contact:** ____________ (phone: _________)
   - **Data Steward (database backups):** ____________
   - **Communications Lead (tell staff about changes):** ____________

2. **Clinic communication to staff (before go-live):**
   - When should clinic tell doctors/receptionists about the new system?
   - [ ] June 1 (announce early, reduce surprises)
   - [ ] July 1 (short notice, focus on training)
   - [ ] July 10 (day of training)

3. **Staff training schedule (July 10-12):**
   - In-person or virtual?
   - Where? (which room/clinic?)
   - Who attends? (list names)

4. **Launch communication to patients:**
   - When to tell patients about new booking system?
   - Will clinic send emails about how to book online?
   - Should we create help video for patients?

**Q&A: Support Model**

5. **Support hotline after go-live:**
   - Who answers "system not working" calls on July 15?
   - Should clinic staff escalate to us, or try to fix themselves?
   - Response time expectations? (1 hour? 4 hours?)

6. **If critical issue found during soft launch (July 14-21):**
   - What counts as "critical"? (define together)
   - Do we rollback to old system, or fix and re-deploy?
   - Who decides on rollback? (you or us?)

**Q&A: Success Metrics**

7. **How will we measure success after go-live?**
   - System uptime: 99.5% (max 3.5 hours downtime per month)
   - Patient satisfaction: 4.0+ stars (if we add ratings)
   - No-show reduction: 30-50% decrease
   - Receptionist time saved: 25% reduction in manual bookings
   - **Clinic to confirm:** Which metrics matter most to you? ____________

**Deliverable:** "Go-Live Communication Plan" + "Support Escalation Matrix"

---

## Post-Workshop (May 22 EOD)

**We will send:**
1. PHASE-2-REQUIREMENTS.md (compiled from all Q&A)
2. UAT Test Plan (50+ scenarios)
3. Go-Live Communication Plan
4. Weekly sync meeting schedule (May 27 — July 14)

**Clinic will send:**
1. Signed off requirements (confirm no changes)
2. 5 UAT staff names & contact info
3. Legacy data export (if applicable)

**Next step:** Development sprint begins May 27 (or whenever requirements signed off)

---

## Pre-Workshop Checklist (Clinic Prepares May 19)

- [ ] Book conference room or Zoom link
- [ ] Appoint point-of-contact for Morgan (@pm)
- [ ] Confirm attendance: CEO, Ops Manager, Medical Director, IT Lead
- [ ] Prepare: Current appointment process (how you book now)
- [ ] Prepare: Current payment process
- [ ] Prepare: List of top 5 operational pain points
- [ ] Prepare: Doctor fees/pricing (if not documented)
- [ ] Prepare: Legacy data export (if applicable)
- [ ] Prepare: Questions for Morgan & Aria

---

## Important Notes

**This workshop is co-designed with clinic, not imposed.**
- Every decision (scheduler rules, payment terms, messaging) comes from clinic
- We're documenting your requirements, not proposing ours
- If clinic has different needs than outlined, we adapt

**No go-live until UAT is complete.**
- If test plan identifies major issues, we fix them
- If issues are too large, we may delay go-live to July 28 (contingency date)
- Clinic and team must agree before proceeding past June 30

**Requirements freeze on May 22.**
- After workshop ends, we lock requirements
- Any changes after May 22 may delay schedule (add 2-4 weeks)
- If clinic needs new features mid-development, we prioritize for Phase 3

---

## Contact Before Workshop

If clinic has questions before May 20:
- Morgan (@pm): morgan@aria-clinic.dev | 11 9999-0000
- Aria (@architect): aria@aria-clinic.dev | 11 9999-0001

---

**Workshop Status:** Ready for Scheduling
**Generated:** May 17, 2026
**Scheduled:** May 20-22, 2026 (confirmed by clinic)

*This workshop is mandatory for Phase 2 go-live. Clinic commitment ensures quality outcome.*
