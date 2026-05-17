# EPIC-005 Story Templates — Integration & Automation
## Research Phase Outline (Phase 2.2)

**Document Version:** 1.1
**Created:** 2026-05-16
**Last Updated:** 2026-05-17
**Status:** Phase 1 Implementation — Stories 005.001-005.003 Validated ✅
**Epic Lead:** @pm

---

## EPIC-005 Overview

EPIC-005 extends the Aria Clinic MVP with **third-party integrations** (Stripe, WhatsApp Business API) and **automated workflows** (reminders, invoicing, reporting). This epic contains ~30 stories across 4 themes, estimated 130-150 story points.

**Timeline:** 2026-05-27 → 2026-06-20 (4 weeks) — **Updated: 2026-05-17 Implementation started**
**Themes:** 4 (Payments, WhatsApp, Reports, Automation)
**Dependency:** EPIC-004 (scheduler) must be complete and stable

### Phase 1 Status (2026-05-17)
✅ **Stories 005.001-005.003 validated by @po**
- **005.001 (PaymentIntent):** 9/10 — GO ✅
- **005.002 (SetupIntent):** 9/10 — GO ✅
- **005.003 (Invoice Generation):** 8/10 — GO WITH CONCERNS ⚠️ (pre-requisites pending)
- **GitHub Issues:** #7, #8, #9
- **Next:** Assign to @dev for implementation

---

## THEME 5.1: PAYMENT PROCESSING & BILLING (12 Stories)

### Overview
Integrate Stripe for payment processing, invoice generation, refund handling, and clinic revenue reporting. Supports Brazil compliance (tax documents, local payment methods).

---

### INTG-001: Stripe Payment Provider Integration (Research + Planning)

**Estimated Effort:** 8 points
**Dependency:** None
**Risk Level:** MEDIUM

**AC Skeleton:**
```
GIVEN clinic admin configures Stripe API keys in settings
WHEN patient initiates payment for appointment
THEN payment form loads securely via Stripe Elements (PCI compliant)
AND payment succeeds/fails with appropriate message
```

**Research Questions:**
- [ ] Stripe API version & SDK compatibility with Next.js 16
- [ ] Webhook setup for payment events (payment_intent.succeeded, payment_intent.payment_failed)
- [ ] Webhook retry logic & durability
- [ ] Brazil-specific payment methods (Pix, boleto via Stripe)
- [ ] Currency handling (BRL vs USD)
- [ ] Rate limiting on payment attempts

**Technical Spikes:**
- [ ] Test Stripe API integration with Supabase webhooks
- [ ] Validate webhook delivery to staging environment
- [ ] Document Stripe error codes & client-side error handling

**Output:** Story INTG-001 with full AC, implementation plan, API endpoints

---

### INTG-002: Payment Method Storage & Tokenization (PCI Compliance)

**Estimated Effort:** 8 points
**Dependency:** INTG-001 (Stripe setup)
**Risk Level:** HIGH (PCI compliance critical)

**AC Skeleton:**
```
GIVEN patient saves payment method for future use
WHEN Stripe returns payment method token
THEN token stored in Supabase (no raw card data)
AND stored method available for future transactions
```

**Research Questions:**
- [ ] Stripe Payment Method API vs legacy Tokens (which to use?)
- [ ] Storing Stripe payment_method ID in Supabase
- [ ] PCI DSS audit requirements for Brazil
- [ ] Customer object management in Stripe
- [ ] Compliance with Supabase RLS (who can see payment methods?)
- [ ] Card masking in UI (last 4 digits only)

**Technical Spikes:**
- [ ] PCI DSS self-assessment checklist
- [ ] Test payment method deletion in Stripe
- [ ] Validate RLS policies prevent patient cross-access

**Output:** Story INTG-002 with PCI audit checklist, RLS schema

---

### INTG-003: Invoice Generation & Email Delivery

**Estimated Effort:** 5 points
**Dependency:** INTG-001 (payment recorded)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN payment succeeds for appointment
WHEN system triggers invoice workflow
THEN PDF invoice generated with:
  - Clinic name, CNPJ, address
  - Patient name, CPF, address
  - Appointment details (date, doctor, service)
  - Amount, payment method, date paid
AND email sent to patient with PDF attached
```

**Research Questions:**
- [ ] PDF generation library (pdfkit, jspdf, reportlab)
- [ ] Email service (Resend already integrated, verify setup)
- [ ] Invoice numbering system (sequential, audit-friendly)
- [ ] Tax document requirements (Brazil: NF-e or RPS?)
- [ ] Invoice storage (S3, Supabase storage, or Resend archive?)
- [ ] Email template design & localization (Portuguese)

**Technical Spikes:**
- [ ] Test PDF generation with clinic logo & branding
- [ ] Verify Resend email delivery for healthcare domain
- [ ] Test with @qa for rendering on mobile

**Output:** Story INTG-003 with invoice template, email template

---

### INTG-004: Refund Workflow (Cancellations & Exceptions)

**Estimated Effort:** 8 points
**Dependency:** INTG-001 (payment recorded), INTG-002 (payment method stored)
**Risk Level:** MEDIUM

**AC Skeleton:**
```
GIVEN patient cancels appointment >= 24h before
WHEN clinic staff clicks "Refund" button
THEN Stripe refund API called with original payment amount
AND refund status tracked (processing, succeeded, failed)
AND patient receives refund confirmation email
AND appointment status changed to "cancelled_refunded"
```

**Research Questions:**
- [ ] Stripe refund API & partial refund support
- [ ] Refund processing time in Brazil
- [ ] Refund reason tracking (cancellation, no-show, etc.)
- [ ] Cancellation fee logic (e.g., 10% retained if cancelled < 24h)
- [ ] Refund audit trail (who approved, when)
- [ ] Communication to patient (email, WhatsApp notification)

**Technical Spikes:**
- [ ] Test full refund flow with test Stripe account
- [ ] Test partial refunds (cancellation fee scenario)
- [ ] Verify refund status polling from Stripe

**Output:** Story INTG-004 with refund policy, API endpoints

---

### INTG-005: Payment Receipt Tracking in Patient History

**Estimated Effort:** 3 points
**Dependency:** INTG-003 (invoice generated)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN invoice generated for appointment
WHEN patient views appointment in patient profile
THEN "Payment Details" section shows:
  - Payment date, amount, method
  - Invoice download link (PDF)
  - Refund status (if applicable)
```

**Research Questions:**
- [ ] Schema: Store payment_receipt in patient_appointments table?
- [ ] Invoice retrieval: Generate on-demand or cache?
- [ ] Permission: Patient sees own only, clinic staff sees all
- [ ] Archive: Retention period for old receipts

**Output:** Story INTG-005 with schema design, UI mockup

---

### INTG-006: Clinic Revenue Reporting Dashboard

**Estimated Effort:** 5 points
**Dependency:** INTG-001 → INTG-005 (all payment data captured)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN clinic manager navigates to Revenue Reports
WHEN selecting date range (e.g., May 1-31)
THEN dashboard shows:
  - Total revenue (sum of payments)
  - Number of transactions
  - Payment method breakdown (Pix, card, etc.)
  - Doctor-wise revenue distribution
  - Refund amounts & reasons
  - Daily revenue trend chart
```

**Research Questions:**
- [ ] Reporting library (Recharts already integrated, use for charts)
- [ ] Aggregation queries (efficient for large datasets)
- [ ] Access control: Clinic owner & accountant only
- [ ] Export format (CSV, PDF)
- [ ] Tax document integration (for accountant)

**Output:** Story INTG-006 with dashboard mockup, SQL queries

---

### INTG-007: Tax Document Generation (Brazil NF-e / RPS)

**Estimated Effort:** 13 points (HIGH COMPLEXITY)
**Dependency:** INTG-003 (invoice structure), INTG-006 (revenue data)
**Risk Level:** HIGH (Brazil regulatory, third-party service required)

**AC Skeleton:**
```
GIVEN clinic is registered with Brazil tax authority (SEFAZ)
WHEN invoice is generated
THEN system submits RPS (Recibo Provisório de Serviço) or NF-e
AND proof of submission stored with invoice
AND patient receives official tax document
```

**Research Questions:**
- [ ] NF-e vs RPS: Which applies to clinic services?
- [ ] Third-party service: Use Nota Fiscal API (Simpliss.me, ClickSign)?
- [ ] Clinic registration requirements (CNPJ, tax regime)
- [ ] Fee structure ($ per invoice)
- [ ] Integration timeline (may require external service setup)
- [ ] Contingency: What if service is down?

**Technical Spikes:**
- [ ] Contact tax service provider for API documentation
- [ ] Estimate cost per invoice
- [ ] Determine if INTG-007 is **Phase 2 scope or Phase 3**

**Note:** This story may need to be **deferred to Phase 3** if regulatory complexity is too high. Include in Phase 2 only if clinic explicitly requires before go-live.

**Output:** Story INTG-007 OR deferral note in Phase 2 roadmap

---

### INTG-008: Subscription Management (Recurring Services)

**Estimated Effort:** 8 points
**Dependency:** INTG-001 (Stripe setup)
**Risk Level:** MEDIUM

**AC Skeleton:**
```
GIVEN patient has recurring appointment (e.g., weekly therapy)
WHEN clinic creates recurring appointment series
THEN subscription created in Stripe
AND automatic payment charged on schedule
AND appointment auto-created if payment succeeds
```

**Research Questions:**
- [ ] Stripe Billing API & subscription setup
- [ ] Recurring appointment schema (frequency, end date, exceptions)
- [ ] Pause/cancel subscription workflow
- [ ] Price adjustment (if service cost changes mid-subscription)

**Output:** Story INTG-008 with subscription schema

---

### INTG-009: Payment Failure Retry Logic

**Estimated Effort:** 5 points
**Dependency:** INTG-001 (payment processing)
**Risk Level:** MEDIUM

**AC Skeleton:**
```
GIVEN payment fails due to insufficient funds
WHEN scheduled retry runs (24h, 48h, 72h later)
THEN Stripe charge attempted again
AND clinic staff alerted if final retry fails
AND appointment marked at-risk if payment still pending
```

**Research Questions:**
- [ ] Stripe billing retry policy (automatic?)
- [ ] Custom retry logic in Aria (queue + cron job)
- [ ] Notification to patient (email/WhatsApp)
- [ ] Appointment hold/release logic

**Output:** Story INTG-009 with retry policy

---

### INTG-010: PCI DSS Compliance & Audit Logging

**Estimated Effort:** 5 points
**Dependency:** INTG-001 → INTG-009 (all payment flows)
**Risk Level:** HIGH

**AC Skeleton:**
```
GIVEN all payment operations performed
WHEN audit log entry created
THEN log captures:
  - Operation (charge, refund, token)
  - User/system who initiated
  - Timestamp
  - Success/failure
  - Amount, payment method (no raw card data)
WHEN external audit occurs
THEN all logs available for inspection
```

**Research Questions:**
- [ ] PCI DSS self-assessment questionnaire (SAQ)
- [ ] Audit logging requirements (retention period, access control)
- [ ] Third-party audit (annual, required by law?)
- [ ] Compliance tools (e.g., Stripe Radar for fraud)

**Output:** Story INTG-010 with audit schema, compliance checklist

---

### INTG-011: Currency Conversion & Multi-Region Support

**Estimated Effort:** 5 points
**Dependency:** INTG-001 (payment processing)
**Risk Level:** LOW (deferred if single-country only)

**AC Skeleton:**
```
GIVEN patient in different country (e.g., USD instead of BRL)
WHEN payment form loads
THEN currency converts to patient's local currency
AND Stripe handles conversion fees
```

**Research Questions:**
- [ ] Is multi-country support required for Phase 2?
- [ ] If Brazil-only, defer this story
- [ ] Currency selection logic (IP detection, user preference?)

**Output:** Story INTG-011 OR deferral note

---

### INTG-012: Payment Analytics & Metrics

**Estimated Effort:** 3 points
**Dependency:** INTG-001 → INTG-006 (all payment data)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN clinic dashboards tracking payment metrics
THEN available metrics:
  - Payment success rate (%)
  - Average transaction value
  - Refund rate
  - Failed payment rate
  - Payment method popularity
```

**Output:** Story INTG-012 with metric definitions, analytics schema

---

## THEME 5.2: WHATSAPP BUSINESS API INTEGRATION (8 Stories)

### Overview
Migrate from basic WhatsApp API to WhatsApp Business API (v20.0) with rich messaging, templates, and two-way conversation support. Supports Brazil-specific compliance.

---

### WHAP-001: WhatsApp Business API Setup (Move from Basic)

**Estimated Effort:** 8 points
**Dependency:** None
**Risk Level:** MEDIUM

**AC Skeleton:**
```
GIVEN clinic wants to use WhatsApp Business API
WHEN API credentials configured in settings
THEN messages sent via Business API (not basic API)
AND webhook events received from Business API
AND existing reminder messages still delivered
```

**Research Questions:**
- [ ] WhatsApp Business API v20.0 endpoint changes
- [ ] Phone number verification & approval in Business Manager
- [ ] Brazil regulatory requirements (clinic registration)
- [ ] Message limits & rate limiting
- [ ] Webhook security (signature verification)
- [ ] Migration path from basic API (no downtime)

**Technical Spikes:**
- [ ] Set up WhatsApp Business account in Meta Business Suite
- [ ] Verify phone number for clinic
- [ ] Test webhook delivery with ngrok/staging environment

**Output:** Story WHAP-001 with API setup guide, webhook schema

---

### WHAP-002: Rich Messaging Templates (WhatsApp Template Manager)

**Estimated Effort:** 8 points
**Dependency:** WHAP-001 (Business API setup)
**Risk Level:** MEDIUM (WhatsApp approval required)

**AC Skeleton:**
```
GIVEN clinic wants to send appointment reminders via rich template
WHEN template created in WhatsApp Template Manager
THEN template submitted for WhatsApp approval
AND approved templates available in dropdown
AND messages sent using template (includes variables)
EXAMPLE: "Hi {{patient_name}}, your appointment with {{doctor}} is on {{date}} at {{time}}. Confirm: [YES] [NO]"
```

**Research Questions:**
- [ ] WhatsApp Template Manager UI & submission process
- [ ] Approval timeline (typically 24h)
- [ ] Template categories (transactional, marketing, etc.)
- [ ] Variable syntax & placeholder support
- [ ] Localization (Portuguese templates for Brazil)
- [ ] Template versioning & updates

**Technical Spikes:**
- [ ] Create 5-10 template examples for clinic review
- [ ] Estimate approval time & have backup plan (fallback to simple text)
- [ ] Test template variable substitution

**Output:** Story WHAP-002 with template library, approval workflow

---

### WHAP-003: Interactive Buttons & Quick Replies

**Estimated Effort:** 8 points
**Dependency:** WHAP-001 (Business API)
**Risk Level:** MEDIUM

**AC Skeleton:**
```
GIVEN appointment reminder sent to patient
WHEN patient receives message with interactive buttons
THEN buttons display: "✅ Confirm" | "❌ Cancel" | "📞 Call"
AND tapping button sends callback to clinic system
AND appointment status updated based on response
```

**Research Questions:**
- [ ] WhatsApp Button API (up to 3 buttons per message)
- [ ] Button types (quick reply, call-to-action, etc.)
- [ ] Callback webhook format
- [ ] Button click tracking & timeout
- [ ] Localization (Portuguese button labels)

**Technical Spikes:**
- [ ] Test button UI on iOS/Android
- [ ] Test callback webhook reliability
- [ ] Handle timeout (if patient doesn't respond)

**Output:** Story WHAP-003 with button API integration, callback handler

---

### WHAP-004: Media Sharing (Lab Results, Images)

**Estimated Effort:** 5 points
**Dependency:** WHAP-001 (Business API)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN doctor uploads lab result image to patient record
WHEN clinic staff clicks "Share via WhatsApp"
THEN image uploaded to WhatsApp Media Manager
AND sent to patient as media message (not file attachment)
AND patient can view image directly in WhatsApp
```

**Research Questions:**
- [ ] WhatsApp Media API (image, video, document types)
- [ ] Media upload & caching
- [ ] Supported formats & size limits
- [ ] Media retention in WhatsApp (auto-delete?)
- [ ] Compliance (HIPAA/LGPD for health data)

**Technical Spikes:**
- [ ] Test media upload with various file types
- [ ] Verify media size optimization (bandwidth)
- [ ] Test mobile rendering

**Output:** Story WHAP-004 with media upload handler

---

### WHAP-005: WhatsApp Group Management (Team Coordination)

**Estimated Effort:** 5 points
**Dependency:** WHAP-001 (Business API)
**Risk Level:** MEDIUM (optional feature, may defer)

**AC Skeleton:**
```
GIVEN clinic staff wants to coordinate on appointments
WHEN clinic creates WhatsApp group for team
THEN group members receive appointment updates
AND staff can reply directly in group
```

**Research Questions:**
- [ ] WhatsApp Group API (create, manage members)
- [ ] Message routing (individual vs group)
- [ ] Privacy implications (staff conversations)

**Note:** May be lower priority. Consider deferring to Phase 3 if time-constrained.

**Output:** Story WHAP-005 with group management schema (OR deferral)

---

### WHAP-006: Conversation Status Tracking (Read Receipts)

**Estimated Effort:** 5 points
**Dependency:** WHAP-001 (Business API)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN message sent to patient via WhatsApp
WHEN patient reads message
THEN clinic system receives read receipt
AND dashboard updates message status: "Delivered" → "Read"
AND timestamp of read recorded
```

**Research Questions:**
- [ ] WhatsApp read receipt webhook format
- [ ] Privacy (patient can disable read receipts)
- [ ] Timestamp accuracy (timezone handling)

**Output:** Story WHAP-006 with receipt schema, dashboard update

---

### WHAP-007: Webhook Reliability & Retry Logic

**Estimated Effort:** 5 points
**Dependency:** WHAP-001 → WHAP-006 (all webhooks)
**Risk Level:** HIGH (critical for message delivery)

**AC Skeleton:**
```
GIVEN WhatsApp sends message_received webhook
WHEN Aria system receives webhook
THEN system stores event in queue
AND processes event with retry logic:
  - Immediate retry if database write fails
  - 3x retry with exponential backoff (1s, 5s, 30s)
  - Dead-letter queue for unprocessable events
  - Alert clinic staff if retry exhausted
```

**Research Questions:**
- [ ] Webhook delivery guarantees (at-least-once vs exactly-once)
- [ ] Webhook timeout (WhatsApp expects response within 30s)
- [ ] Duplicate message handling (idempotency)
- [ ] Queue implementation (Supabase queue, external worker?)

**Technical Spikes:**
- [ ] Set up event queue & worker process
- [ ] Test webhook under load (simulate 1000 messages/hour)
- [ ] Verify message deduplication

**Output:** Story WHAP-007 with queue schema, worker implementation

---

### WHAP-008: Cost Tracking & Billing Integration

**Estimated Effort:** 3 points
**Dependency:** WHAP-001 (Business API)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN WhatsApp Business API charges per message
WHEN message sent to patient
THEN cost tracked in clinic billing
AND monthly bill includes WhatsApp usage
```

**Research Questions:**
- [ ] WhatsApp pricing model ($/message, varies by country)
- [ ] Brazil-specific pricing
- [ ] Integration with clinic revenue dashboard

**Output:** Story WHAP-008 with cost tracking schema

---

## THEME 5.3: REPORT GENERATION & ANALYTICS (5 Stories)

### Overview
Clinic managers need dashboards to view visit history, doctor productivity, revenue trends, and cancellation rates. All reports exportable as PDF.

---

### ANAT-001: Patient Visit History Report

**Estimated Effort:** 5 points
**Dependency:** EPIC-004 (appointment data)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN clinic manager selects date range (e.g., May 1-31)
WHEN clicking "View Reports" → "Visit History"
THEN report shows:
  - List of all appointments (date, patient, doctor, service, status)
  - Filters: Patient name, doctor, status
  - Export to PDF with clinic branding
```

**Research Questions:**
- [ ] Reporting library (use Recharts for charts, iText or pdfkit for PDF)
- [ ] Database query optimization (large datasets)
- [ ] Access control (clinic owner & manager only)

**Output:** Story ANAT-001 with report template, SQL queries

---

### ANAT-002: Doctor Productivity Analytics

**Estimated Effort:** 5 points
**Dependency:** EPIC-004 (appointment data), INTG-006 (payment data)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN clinic manager wants to track doctor performance
WHEN viewing "Doctor Analytics" dashboard
THEN shows per doctor:
  - Appointments per day / week / month
  - Revenue per doctor
  - Average appointment duration
  - Patient satisfaction score (placeholder)
  - No-show rate
```

**Research Questions:**
- [ ] Aggregation queries (group by doctor, date)
- [ ] Time-series data (chart by week/month)
- [ ] Benchmark targets (alerts if productivity low?)

**Output:** Story ANAT-002 with dashboard mockup, SQL queries

---

### ANAT-003: Revenue Trend Reports

**Estimated Effort:** 5 points
**Dependency:** INTG-001 → INTG-006 (payment data)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN clinic manager wants to track revenue
WHEN viewing "Revenue Reports"
THEN shows:
  - Daily/weekly/monthly revenue (line chart)
  - Revenue by service type (bar chart)
  - Revenue by payment method (pie chart)
  - YoY comparison (if multiple years available)
```

**Output:** Story ANAT-003 with dashboard mockup, SQL queries

---

### ANAT-004: Cancellation & No-Show Analysis

**Estimated Effort:** 5 points
**Dependency:** EPIC-004 (appointment status)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN clinic manager wants to reduce no-shows
WHEN viewing "Cancellation Analysis"
THEN shows:
  - Total cancellations vs no-shows (this month)
  - Cancellation rate by doctor
  - Cancellation rate by time-of-day (appointments at 9am cancel more?)
  - Most common cancellation reasons
```

**Research Questions:**
- [ ] Cancellation reasons tracking (add field to appointment schema?)
- [ ] Trend identification (ML? or simple charts for now?)

**Output:** Story ANAT-004 with schema updates, dashboard mockup

---

### ANAT-005: PDF Export Functionality

**Estimated Effort:** 3 points
**Dependency:** ANAT-001 → ANAT-004 (all reports)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN report displayed on screen
WHEN clicking "Export as PDF"
THEN PDF downloaded with:
  - Report title, date range, clinic branding
  - Data tables & charts
  - Footer with generation timestamp
  - Clinic contact info
```

**Output:** Story ANAT-005 with PDF template, export handler

---

## THEME 5.4: AUTOMATED WORKFLOW ORCHESTRATION (5 Stories)

### Overview
Automate clinic operations: appointment → invoice triggers, no-show penalties, payment failure alerts, batch reminders, and data cleanup.

---

### AUTO-001: Appointment → Invoice Trigger

**Estimated Effort:** 5 points
**Dependency:** EPIC-004 (appointment completed), INTG-003 (invoice generation)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN appointment status changed to "completed"
WHEN system detects status change
THEN trigger invoice generation workflow:
  1. Create invoice record in database
  2. Generate PDF
  3. Send to patient via email
  4. Log event in audit trail
```

**Research Questions:**
- [ ] Trigger mechanism (webhook, cron job, event-driven?)
- [ ] Error handling (if invoice fails, retry?)
- [ ] Idempotency (prevent duplicate invoices)

**Output:** Story AUTO-001 with workflow diagram, trigger implementation

---

### AUTO-002: No-Show → Penalty Logic

**Estimated Effort:** 5 points
**Dependency:** EPIC-004 (appointment status)
**Risk Level:** MEDIUM (legal implications in Brazil)

**AC Skeleton:**
```
GIVEN appointment time passed and patient didn't show up
WHEN system detects no-show (30 min after appointment time)
THEN trigger penalty logic:
  1. Mark appointment as "no_show"
  2. If clinic policy = charge fee:
     - Charge patient 50% of appointment cost
     - Send refund instructions if applicable
  3. Notify clinic staff
  4. Update patient record (track no-show history)
```

**Research Questions:**
- [ ] Legal implications (can clinic charge for no-show in Brazil?)
- [ ] Configuration: Is penalty amount clinic-configurable?
- [ ] Exception handling (patient called to reschedule before time?)

**Output:** Story AUTO-002 with penalty policy, compliance review

---

### AUTO-003: Payment Failure → SMS Alert (Clinic Staff)

**Estimated Effort:** 3 points
**Dependency:** INTG-009 (payment failure detected)
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN payment retry fails after 3 attempts
WHEN all retries exhausted
THEN alert clinic staff:
  - Send SMS to clinic phone: "Payment failed for [Patient Name] - appointment [Date]. Action: [Retry] or [Cancel]"
  - Mark appointment as "at_risk" in dashboard
  - Clinic staff can manually retry or cancel
```

**Research Questions:**
- [ ] SMS provider (Twilio, AWS SNS?)
- [ ] Clinic contact list (who receives alerts?)

**Output:** Story AUTO-003 with SMS workflow, contact schema

---

### AUTO-004: Batch WhatsApp Reminders (Daily Scheduler)

**Estimated Effort:** 5 points
**Dependency:** WHAP-002 (templates), EPIC-004 (appointment data)
**Risk Level:** MEDIUM (reliability critical)

**AC Skeleton:**
```
GIVEN cron job runs daily at 9:00 AM (clinic timezone)
WHEN appointments scheduled for next 24 hours
THEN send reminder to each patient:
  1. Query appointments where appointment_time between NOW+24h and NOW+48h
  2. For each appointment:
     - Fetch patient WhatsApp number & language preference
     - Send template message with appointment details
     - Log sent status
  3. Report: X messages sent, Y failed (alert clinic if > 5% failure)
```

**Research Questions:**
- [ ] Timezone handling (clinic in São Paulo, patient in Rio?)
- [ ] Batch size & rate limiting (WhatsApp limits?)
- [ ] Retry for failed batches
- [ ] Database query optimization (large appointment volume)

**Technical Spikes:**
- [ ] Set up cron job (e.g., node-schedule, AWS Lambda)
- [ ] Test with 1000+ appointments
- [ ] Verify timezone logic

**Output:** Story AUTO-004 with cron job implementation, monitoring

---

### AUTO-005: Data Cleanup & Archive Job

**Estimated Effort:** 3 points
**Dependency:** None
**Risk Level:** LOW

**AC Skeleton:**
```
GIVEN data retention policy defined (e.g., archive appointments > 1 year old)
WHEN monthly cleanup job runs (first day of month)
THEN:
  1. Identify records to archive (created_at < NOW - 1 year)
  2. Move to archive table (or backup, or delete based on policy)
  3. Log cleanup results (X records archived)
  4. Alert if any errors
```

**Research Questions:**
- [ ] Retention policy (how long to keep appointment records?)
- [ ] Backup strategy (where to archive?)
- [ ] Legal requirements (Brazil LGPD - how long keep health data?)

**Output:** Story AUTO-005 with retention policy, cleanup script

---

## RESEARCH SUMMARY

**Total Stories in EPIC-005:** 30 stories
**Total Estimated Effort:** 130-150 story points
**Implementation Timeline:** 4 weeks (2026-05-27 → 2026-06-20)
**Critical Path Issues:**
- [ ] INTG-007 (tax documents) may need deferral due to regulatory complexity
- [ ] WHAP-001, WHAP-002 require WhatsApp approval (lead time 24-48h)
- [ ] AUTO-004 requires reliable cron infrastructure

---

## NEXT STEPS (PHASE 2 KICKOFF)

1. **Week of 2026-05-20:** @pm & @architect finalize acceptance criteria for top 8 stories (INTG-001 through INTG-003, WHAP-001 through WHAP-002, AUTO-001)
2. **Week of 2026-05-27:** @dev begins stories; @qa sets up test environment
3. **Week of 2026-06-03:** Integration testing; Stripe & WhatsApp API approvals confirmed
4. **Week of 2026-06-10:** Reporting stories implementation
5. **Week of 2026-06-17:** Automation & UAT prep

---

**Research Completion:** DONE
**Story Drafting:** READY (awaiting executive approval of PHASE-2-ROADMAP.md)
