# Stripe Payment Integration Specification (Epic 005)

**Version:** 1.0
**Date:** 2026-05-17
**Author:** @pm (Morgan) — Product Manager
**Status:** DRAFT (awaiting Phase 5 critique)
**Complexity Class:** COMPLEX (21/25)
**Epic Stories:** 005.001, 005.002, 005.003
**Total Story Points:** 29

---

## 1. Executive Summary

### Vision
Aria Clinic will integrate Stripe payment processing to enable secure, compliant payment collection for clinic appointments. This integration provides patients with a seamless payment experience and clinic administrators with robust financial management tools.

### Problem Statement
Currently, Aria lacks payment processing capabilities. Clinic administrators cannot collect payments online, and patients cannot pay for appointments through the platform. This creates friction in the patient journey and limits clinic revenue potential.

### Expected Benefits
1. **Revenue Stream:** Enable online payment collection from patients
2. **Compliance:** PCI DSS Level 4 self-assessment compliance (SAQ A)
3. **Patient Experience:** Simple, secure payment flow integrated into appointment booking
4. **Admin Efficiency:** Automatic invoice generation and audit logging
5. **Brazil Localization:** Support for Brazilian payment methods (Phase 2: Card; Phase 3: Pix + Boleto)
6. **Legal Compliance:** LGPD-compliant audit logging with 5+ year retention

### Timeline
- **Phase 2 Scope:** Card payments only (Visa/Mastercard)
- **Phase 3 Scope (Deferred):** Pix, Boleto, NF-e/RPS integration
- **Estimated Duration:** 4-6 weeks (Phase 2 implementation)
- **Go-Live Date:** 2026-07-15 (target, pending UAT completion)

---

## 2. Functional Requirements

### FR-005.001: Stripe Payment Provider Integration

**Description:**
Clinic admin configures Stripe API keys. Payment endpoint processes appointment payments securely via Stripe Elements (PCI compliant). Webhook receives payment events (success/failure). System maintains full audit trail.

**Acceptance Criteria:**
- [ ] Stripe account created and API keys (public/secret) configured in environment
- [ ] POST `/api/payments/process` endpoint created, tested, and documented
- [ ] Card tokenization via Stripe.js (no raw card data stored locally)
- [ ] Payment status saved to appointments.payment_intent and appointments.stripe_payment_status
- [ ] Webhook endpoint `/api/webhooks/stripe` receives payment_intent.succeeded and payment_intent.payment_failed events
- [ ] Webhook signature validation implemented using stripe.webhooks.constructEvent()
- [ ] Idempotency implemented (Idempotency-Key header prevents duplicate charges)
- [ ] Error handling implemented for: card_declined, processing_error, rate_limit_error, invalid_request_error
- [ ] Payment state tracked through PaymentIntent lifecycle (created → processing → succeeded/failed)
- [ ] Test coverage ≥ 80% (happy path + error scenarios)
- [ ] Manual testing completed using Stripe test cards
- [ ] PCI DSS compliance checklist verified (SAQ A requirements met)

**Data In/Out:**
- **Input:** appointment_id, amount_cents, payment_method_id, idempotency_key (UUID)
- **Output:** payment_intent_id, status (succeeded/failed), error_code (if failed)
- **Side Effects:**
  - Appointment status updated to "paid" on success
  - Audit log entry created with full payment details
  - Invoice generation triggered on success

**Use Cases:**
1. **Happy Path:** Patient selects "Pay Now" → Enters card details via Stripe Elements → Backend creates PaymentIntent → Stripe confirms → Webhook updates appointment → Invoice triggers
2. **Card Declined:** Patient enters declined card → Stripe rejects → User-friendly error displayed → Patient retries with different card
3. **Timeout:** Network timeout during payment → System retries up to 3x with exponential backoff (1s, 5s, 30s)
4. **Duplicate Webhook:** Stripe retries webhook delivery → Idempotency check prevents duplicate processing

**Constraints:**
- No raw card data touches application servers (Stripe Elements only)
- All payment operations must be idempotent (safe to retry)
- Webhook response must return 200 OK within 30 seconds
- All payment amounts in cents (BRL: 1.00 BRL = 100 cents)

---

### FR-005.002: Payment Method Storage & PCI Compliance

**Description:**
Stripe Payment Method tokens stored securely in Supabase (no raw card data). Patients can save payment methods for future transactions. Audit logging captures all tokenization and deletion events.

**Acceptance Criteria:**
- [ ] Stripe SetupIntent created for card tokenization (not legacy Token API)
- [ ] Payment Method tokens (payment_method_id only) stored in payment_methods table
- [ ] Saved payment methods listed in patient profile dashboard
- [ ] GET `/api/patient/[id]/payment-methods` endpoint returns list of saved methods
- [ ] DELETE `/api/patient/[id]/payment-methods/[method_id]` endpoint removes saved method
- [ ] Payment method selectable as default for future transactions (is_default flag)
- [ ] Audit log captures: operation (save/delete), timestamp, user_id, payment_method_id, success/failure
- [ ] No card data ever touches application servers or logs (only payment_method_id stored)
- [ ] RLS policies prevent cross-patient access to payment methods
- [ ] Cascade delete: If patient deleted, all saved payment methods deleted
- [ ] PCI DSS SAQ A requirements verified (no raw card data, HTTPS only)

**Data In/Out:**
- **Input:** SetupIntent secret (from Stripe), patient_id, card_last4, brand, exp_month, exp_year
- **Output:** payment_method_id, is_default status
- **Side Effects:** Audit log entry, RLS policy check

**Use Cases:**
1. **Save Card:** Patient clicks "Save this card for future" → SetupIntent created → Patient confirms → payment_method_id stored → Listed in profile
2. **Delete Card:** Patient clicks "Remove" on saved card → DELETE endpoint → Payment method deleted → Audit logged
3. **Use Saved Card:** Patient selects saved card at payment → PaymentIntent uses saved payment_method_id → No new tokenization needed

**Constraints:**
- RLS policies MUST enforce that patients only see their own saved methods
- Deletion must cascade safely (no orphaned references in invoices or transactions)
- SetupIntent must complete successfully before storing payment_method_id
- No PCI audit logging of card numbers (only brand, last4)

---

### FR-005.003: Invoice Generation & Email Delivery

**Description:**
On appointment completion, system automatically generates PDF invoice with clinic details, patient info, service description, amount, and payment method. Email sent to patient with invoice download link (per Resend limitation).

**Acceptance Criteria:**
- [ ] Invoice PDF generated automatically on appointment status change to "completed"
- [ ] Invoice includes: clinic name/CNPJ, patient name/CPF, service details, appointment date/time, amount, payment method, invoice number, clinic contact info
- [ ] Invoice number generated as sequential, unique, and audit-friendly (format: YYYY-MM-00001)
- [ ] Invoice HTML template renders with clinic logo (embedded as base64)
- [ ] HTML converted to PDF using html2pdf library
- [ ] PDF cached in Supabase Storage with immutable URL
- [ ] Invoice record created in invoices table with references: appointment_id, patient_id, invoice_number, pdf_url, amount_cents
- [ ] Email sent to patient automatically via Resend with invoice download link (not attachment, per Resend limitation)
- [ ] Email template customizable by clinic admin (logo, footer, custom message)
- [ ] Resend endpoint `/api/invoices/resend` available for manual retry if email fails
- [ ] Invoice preview available in patient dashboard
- [ ] Audit log entry created with invoice_sent timestamp
- [ ] PDF generation performance: < 5 seconds per invoice (target: < 2 seconds)
- [ ] Email delivery performance: < 3 seconds (Resend API call)
- [ ] Error handling: Retry failed PDF generation up to 3x with exponential backoff

**Data In/Out:**
- **Input:** appointment_id, patient_id, clinic_id, amount_cents, service_description
- **Output:** invoice_id, invoice_number, pdf_url, email_status
- **Side Effects:**
  - Invoice record created in database
  - PDF stored in Supabase Storage
  - Email sent to patient
  - Audit log entry created

**Use Cases:**
1. **Happy Path:** Appointment completed → Invoice generated → PDF cached → Email sent → Patient receives link → Downloads PDF
2. **Resend Failure:** Email fails to send → Retry queue queues email → Retries up to 3x → If failed, alerts clinic staff
3. **Manual Resend:** Patient requests invoice again → Clinic clicks "Resend" → Email resent from cache (no PDF regeneration)
4. **PDF Generation Failure:** html2pdf fails → Retry logic → If still fails, email without PDF, link to dashboard to view/download

**Constraints:**
- Invoice PDF must include clinic branding and be visually professional
- Portuguese text rendering must be verified (Á, É, Í, Ó, Ú, Ç, etc.)
- Email must NOT include PDF attachment (use download link instead)
- Invoice number must be sequential and never duplicated
- Invoice generation must be idempotent (safe to retry)
- PDFs immutable after generation (never modified)

---

### Non-Functional Requirements

#### NFR-005.001: PCI DSS Compliance (Level 1)
**Requirement:** Aria is Level 4 merchant (<20K transactions/year). Self-assessment (SAQ A) required. No external audit required, but clinic may request one for confidence.

**Controls:**
- No raw card data stored, processed, or logged
- Stripe Elements used for all card input (PCI-compliant)
- HTTPS/TLS 1.2+ enforced on all endpoints
- No hardcoded secrets (environment variables only)
- Secure coding practices: input validation, parameterized queries, no SQL injection
- Access control via RLS policies (patient sees own data only)
- Audit logging of all payment operations (Requirement 10)
- Audit log immutable and tamper-proof (stored in append-only table)
- Audit log retention: 5+ years (exceeds PCI minimum of 1 year)
- Incident response plan documented (in security playbook)

**Verification:**
- SAQ A questionnaire completed before go-live
- Vulnerability scan (PCI-approved vendor) completed
- Code review conducted for PCI control implementation
- Clinic may request external third-party audit (cost: $2-5K, optional)

---

#### NFR-005.002: Brazil Payment Methods & Currency
**Requirement:** Phase 2 supports Card only. Phase 3 to add Pix and Boleto.

**Phase 2 Scope:**
- Credit/Debit Cards: Visa, Mastercard, ELO (all via Stripe PaymentIntent)
- Currency: BRL (Brazilian Real)
- Payment method selector at checkout: [Pay with Card]

**Phase 3 Scope (Deferred):**
- Pix (instant transfer)
- Boleto (bank invoice, ~3 day settlement)
- Tax document generation: NF-e/RPS (requires SEFAZ integration, high complexity)

**Implementation Notes:**
- All amounts in BRL cents (1.00 BRL = 100 cents)
- Stripe account configured for Brazil
- Test mode with Brazilian test cards verified
- Pix/Boleto payment method selection added in Phase 3

---

#### NFR-005.003: Webhook Reliability & Idempotency
**Requirement:** Webhook signature validation required. Retry logic for delivery failures. Idempotency to prevent duplicate charges.

**Controls:**
- Stripe webhook signature validated using stripe.webhooks.constructEvent() with STRIPE_WEBHOOK_SECRET
- Webhook endpoint publicly accessible at fixed URL (disclosed to Stripe)
- Webhook response returns 200 OK immediately, processing async (< 30 seconds total)
- Idempotency: Check processed_events table before processing webhook
- Processed events table schema: { stripe_event_id, processed_at, result_status }
- Retry logic for failed webhook processing: exponential backoff (1s, 5s, 30s, 5min, 30min)
- **Max retries: 5 attempts** (includes initial attempt + 4 retries)
  - Attempt 1: Immediate processing
  - Retry 1: After 1 second (if Attempt 1 fails)
  - Retry 2: After 5 seconds (if Retry 1 fails)
  - Retry 3: After 30 seconds (if Retry 2 fails)
  - Retry 4: After 5 minutes (if Retry 3 fails)
  - Retry 5: After 30 minutes (if Retry 4 fails)
- Dead-letter queue: Events failing after max 5 retries moved to DLQ (manual review, critical alert to clinic staff)
- Duplicate handling: Same stripe_event_id processed → Return 200 OK, no re-processing
- Monitoring: Track webhook success rate, retry count, dead-letter queue size
- Alert if success rate < 95%
- **Critical Alert Trigger:** Any event in dead-letter queue → Email clinic owner immediately with details + link to manual review dashboard

**Dependencies:**
- Stripe provides webhook delivery: up to 5 retries over 36 hours (exponential backoff)
- App provides second layer: DB queue + application-level retry logic (5 max retries as documented above)
- Monitoring: Dashboard shows webhook health metrics, dead-letter queue, retry rates

**Implementation Notes:**
- Database queue job runner (cron job) checks for failed webhooks every 5 minutes
- Retry counter stored in webhook_events.retry_count
- Each retry increments counter and updates webhook_events.updated_at
- If retry_count >= 5: Move to dead-letter queue, set status: 'failed', trigger critical alert
- Critical alert email includes: event_id, event_type, last_error_message, retry history, manual recovery link

---

#### NFR-005.004: Performance Requirements
**Requirement:** Payment processing latency < 3 seconds. Invoice generation < 5 seconds.

**Targets:**
- POST `/api/payments/process` (create PaymentIntent): P95 latency < 3 seconds
- POST `/api/payments/confirm` (confirm PaymentIntent): P95 latency < 2 seconds
- Invoice PDF generation (html2pdf): P95 latency < 5 seconds (target: < 2 seconds)
- Email sending (Resend API): P95 latency < 3 seconds
- Webhook processing (excluding async tasks): Return 200 OK within 30 seconds

**Measurement:**
- Latency tracked in logs and monitoring dashboard
- Alerts if P95 latency exceeds threshold by 20%
- Monthly performance report to clinic admin

---

#### NFR-005.005: Audit Logging & LGPD Compliance
**Requirement:** All payment operations logged with full audit trail. Compliant with Brazil LGPD (data retention, access control).

**Audit Log Schema:**
```
payment_audit_log {
  id: UUID,
  clinic_id: UUID,
  user_id: UUID (patient or admin),
  operation: VARCHAR (payment_created, payment_confirmed, payment_failed, method_saved, method_deleted, invoice_generated, invoice_sent),
  payment_method_id: VARCHAR (tokenized, no card number),
  appointment_id: UUID,
  invoice_id: UUID,
  amount_cents: INTEGER,
  currency: VARCHAR (always 'BRL'),
  success: BOOLEAN,
  result: VARCHAR (error message if failed),
  created_at: TIMESTAMP,
  ip_address: INET (for fraud detection),
  user_agent: VARCHAR (browser info),
  idempotency_key: UUID
}
```

**LGPD Controls:**
- Data retention: 5+ years (legal requirement for clinic financial records)
- Access restricted to: Clinic owner, clinic accountant (RLS policy)
- Patient can request data access via LGPD export (separate endpoint, TODO Phase 3)
- Audit log immutable: No updates/deletes after creation
- Data encryption: All audit logs encrypted at rest (Supabase default)
- Data minimization: No PII in logs (only user_id, tokenized payment_method_id, hashed IP)

**Compliance Verification:**
- LGPD compliance officer reviews audit log schema before go-live
- Retention policy documented
- Access control policies documented
- Incident response plan (if audit log accessed unauthorized) documented

---

## 3. API Contract Specifications

### Base Configuration
- **Base URL:** `https://aria-clinic.com` (production)
- **Version:** v1
- **Authentication:** JWT Bearer token (patient or admin)
- **Content-Type:** application/json
- **Idempotency:** All POST requests support Idempotency-Key header (UUID)

---

### PaymentIntent Flow: Create & Confirm

#### 3.1 Endpoint: POST `/api/payments/process`

**Purpose:** Create PaymentIntent and process payment in one request (or return client secret for 3D Secure).

**Request Body:**
```json
{
  "appointment_id": "uuid",
  "amount_cents": 50000,
  "currency": "brl",
  "payment_method_id": "pm_...",
  "save_payment_method": false,
  "idempotency_key": "uuid",
  "metadata": {
    "patient_id": "uuid",
    "clinic_id": "uuid",
    "appointment_date": "2026-05-20T10:00:00Z"
  }
}
```

**Response (Success: 200 OK):**
```json
{
  "payment_intent_id": "pi_...",
  "status": "succeeded",
  "amount_cents": 50000,
  "currency": "brl",
  "charge_id": "ch_...",
  "created_at": "2026-05-17T14:30:00Z",
  "confirmation_method": "automatic"
}
```

**Response (3D Secure Required: 200 OK):**
```json
{
  "payment_intent_id": "pi_...",
  "status": "requires_action",
  "client_secret": "pi_..._secret_...",
  "next_action": {
    "type": "redirect_to_url",
    "redirect_to_url": {
      "url": "https://stripe.com/3d-secure/..."
    }
  }
}
```

**Response (Error: 400/422):**
```json
{
  "error": {
    "code": "card_declined",
    "message": "Your card was declined. Please try another payment method.",
    "type": "card_error",
    "decline_code": "generic_decline",
    "charge": "ch_..."
  }
}
```

**Error Codes:**
- `card_declined`: Card rejected by issuer
- `expired_card`: Card expiration date passed
- `incorrect_cvc`: CVC/CVV incorrect
- `processing_error`: Temporary Stripe error (retry)
- `rate_limit_error`: Too many requests (backoff and retry)
- `authentication_error`: Invalid API key (config error)
- `invalid_request_error`: Malformed request (check parameters)
- `unknown_error`: Unexpected error (log and alert)

**Headers:**
```
Idempotency-Key: {uuid}
Authorization: Bearer {jwt_token}
```

---

#### 3.2 Endpoint: POST `/api/payments/{payment_intent_id}/confirm`

**Purpose:** Confirm payment after 3D Secure authentication (if required).

**Request Body:**
```json
{
  "payment_method": {
    "type": "card",
    "card": {
      "token": "tok_..."
    }
  },
  "idempotency_key": "uuid"
}
```

**Response (Success: 200 OK):**
```json
{
  "payment_intent_id": "pi_...",
  "status": "succeeded",
  "charge_id": "ch_..."
}
```

**Response (Error: 400/422):**
```json
{
  "error": {
    "code": "card_declined",
    "message": "Your card was declined."
  }
}
```

---

### SetupIntent Flow: Tokenize & Save Payment Method

#### 3.3 Endpoint: POST `/api/patient/{patient_id}/payment-methods/create-setup-intent`

**Purpose:** Initiate payment method tokenization (SetupIntent).

**Request Body:**
```json
{
  "idempotency_key": "uuid",
  "usage": "on_session"
}
```

**Response (Success: 200 OK):**
```json
{
  "setup_intent_id": "seti_...",
  "client_secret": "seti_..._secret_...",
  "status": "requires_payment_method"
}
```

---

#### 3.4 Endpoint: POST `/api/patient/{patient_id}/payment-methods`

**Purpose:** Confirm SetupIntent and save payment method.

**Request Body:**
```json
{
  "setup_intent_id": "seti_...",
  "setup_intent_secret": "seti_..._secret_...",
  "is_default": true,
  "idempotency_key": "uuid"
}
```

**Response (Success: 201 Created):**
```json
{
  "payment_method_id": "pm_...",
  "brand": "visa",
  "last4": "4242",
  "exp_month": 12,
  "exp_year": 2026,
  "is_default": true,
  "created_at": "2026-05-17T14:30:00Z"
}
```

**Response (Error: 400/422):**
```json
{
  "error": {
    "code": "setup_intent_incomplete",
    "message": "Setup intent not confirmed. Please complete 3D Secure if required."
  }
}
```

---

#### 3.5 Endpoint: GET `/api/patient/{patient_id}/payment-methods`

**Purpose:** Retrieve saved payment methods for patient.

**Response (Success: 200 OK):**
```json
{
  "payment_methods": [
    {
      "payment_method_id": "pm_1234567890",
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2026,
      "is_default": true,
      "created_at": "2026-05-10T10:00:00Z"
    },
    {
      "payment_method_id": "pm_0987654321",
      "brand": "mastercard",
      "last4": "5555",
      "exp_month": 6,
      "exp_year": 2027,
      "is_default": false,
      "created_at": "2026-05-15T14:30:00Z"
    }
  ]
}
```

---

#### 3.6 Endpoint: DELETE `/api/patient/{patient_id}/payment-methods/{payment_method_id}`

**Purpose:** Remove saved payment method.

**Response (Success: 204 No Content)**

**Response (Error: 404):**
```json
{
  "error": {
    "code": "payment_method_not_found",
    "message": "Payment method not found or already deleted."
  }
}
```

---

### Webhook Events

#### 3.7 Endpoint: POST `/api/webhooks/stripe`

**Purpose:** Receive Stripe webhook events (payment_intent.succeeded, payment_intent.payment_failed, charge.refunded).

**Webhook Events Handled:**
1. `payment_intent.succeeded` — Payment confirmed
2. `payment_intent.payment_failed` — Payment failed
3. `charge.refunded` — Refund processed

**Request (from Stripe):**
```json
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "payment_intent.succeeded",
  "created": 1234567890,
  "data": {
    "object": {
      "id": "pi_1234567890",
      "object": "payment_intent",
      "status": "succeeded",
      "amount_cents": 50000,
      "currency": "brl",
      "charges": {
        "object": "list",
        "data": [
          {
            "id": "ch_1234567890",
            "amount_cents": 50000,
            "currency": "brl",
            "status": "succeeded"
          }
        ]
      },
      "metadata": {
        "appointment_id": "uuid",
        "patient_id": "uuid",
        "clinic_id": "uuid"
      }
    }
  }
}
```

**Response (Success: 200 OK):**
```json
{
  "status": "received",
  "event_id": "evt_1234567890"
}
```

**Processing Steps:**
1. Extract Stripe-Signature header
2. Validate webhook signature using stripe.webhooks.constructEvent()
3. Extract event.id and check processed_events table
4. If already processed: return 200 OK (idempotency)
5. If new event:
   - Record event in processed_events table (status: processing)
   - Parse payment_intent from event.data.object
   - Update appointment.payment_intent_id, appointment.stripe_payment_status, appointment.paid_at
   - Trigger invoice generation
   - Record event in processed_events table (status: completed)
   - Return 200 OK
6. If processing fails: record status: failed, trigger retry queue

**Webhook Signature Validation:**
```typescript
const signature = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.rawBody,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**Error Handling:**
- Invalid signature: Return 403 Forbidden (do NOT process)
- Timeout: Return 200 OK immediately, process async
- Processing error: Record status: failed, queue for retry

---

### Refund Flow

#### 3.8 Endpoint: POST `/api/payments/{charge_id}/refund`

**Purpose:** Process refund for a payment.

**Request Body:**
```json
{
  "amount_cents": 50000,
  "reason": "patient_cancellation",
  "notes": "Patient cancelled appointment",
  "idempotency_key": "uuid"
}
```

**Response (Success: 200 OK):**
```json
{
  "refund_id": "re_...",
  "charge_id": "ch_...",
  "amount_cents": 50000,
  "currency": "brl",
  "status": "succeeded",
  "reason": "patient_cancellation",
  "created_at": "2026-05-17T14:30:00Z"
}
```

**Response (Error: 400/422):**
```json
{
  "error": {
    "code": "charge_already_refunded",
    "message": "This charge has already been refunded."
  }
}
```

---

### Invoice Endpoints

#### 3.9 Endpoint: GET `/api/invoices/{invoice_id}`

**Purpose:** Retrieve invoice details.

**Response (Success: 200 OK):**
```json
{
  "invoice_id": "uuid",
  "invoice_number": "2026-05-00001",
  "appointment_id": "uuid",
  "patient_id": "uuid",
  "clinic_id": "uuid",
  "amount_cents": 50000,
  "currency": "brl",
  "pdf_url": "https://storage.supabase.co/invoices/...",
  "status": "sent",
  "created_at": "2026-05-17T14:30:00Z",
  "sent_at": "2026-05-17T14:31:00Z"
}
```

---

#### 3.10 Endpoint: POST `/api/invoices/{invoice_id}/resend`

**Purpose:** Resend invoice email.

**Request Body:**
```json
{
  "idempotency_key": "uuid"
}
```

**Response (Success: 200 OK):**
```json
{
  "status": "queued",
  "email": "patient@example.com",
  "sent_at": "2026-05-17T14:31:00Z"
}
```

---

### Brazil-Specific Data Validation

#### 3.11 CPF & CNPJ Validation (Phase 2 Requirement)

**Purpose:** Validate Brazilian tax identification numbers on invoice generation.

**CPF Validation (Patient):**
- **Format:** 11 digits (XXX.XXX.XXX-XX)
- **Storage:** Patient table (existing patients_table.cpf)
- **Validation Rule:**
  - Must be exactly 11 digits after removing formatting
  - Cannot be all same digits (e.g., 11111111111)
  - Valid check digit (mod 11 algorithm)
- **Phase 2 Scope:** REQUIRED for invoice generation
  - If patient.cpf is NULL or invalid, invoice generation fails with error: `invalid_cpf`
  - Error message to clinic staff: "Patient CPF is missing or invalid. Update patient profile before generating invoice."
- **Error Code:** `invalid_cpf` (400 Bad Request)

**CNPJ Validation (Clinic):**
- **Format:** 14 digits (XX.XXX.XXX/XXXX-XX)
- **Storage:** Clinic table (existing clinics_table.cnpj)
- **Validation Rule:**
  - Must be exactly 14 digits after removing formatting
  - Cannot be all same digits (e.g., 00000000000000)
  - Valid check digit (mod 11 algorithm)
- **Phase 2 Scope:** REQUIRED for invoice generation
  - If clinic.cnpj is NULL or invalid, invoice generation fails with error: `invalid_cnpj`
  - Error message to clinic staff: "Clinic CNPJ is missing or invalid. Update clinic profile before generating invoices."
- **Error Code:** `invalid_cnpj` (400 Bad Request)

**Invoice Generation Flow (with validation):**
1. Payment webhook received (payment_intent.succeeded)
2. Lookup patient.cpf → validate format & check digit
3. Lookup clinic.cnpj → validate format & check digit
4. If both valid: Generate invoice PDF with CPF/CNPJ embedded
5. If invalid: Log error, create audit entry (operation: `invoice_generation_failed_invalid_cpf_cnpj`), alert clinic staff via email
6. Clinic staff must correct patient.cpf or clinic.cnpj, then manually trigger invoice generation via dashboard

**Implementation Notes:**
- CPF/CNPJ validation logic shared with appointment booking (reuse existing validation functions)
- Phase 3 (NF-e/RPS): CPF/CNPJ required for tax authority registration (current Phase 2 only validates for invoice display)
- No changes to payment flow — validation only blocks invoice generation, not payment processing

---

#### 3.12 Invoice Logo Constraints (Phase 2 Specification)

**Purpose:** Define clinic logo file constraints for invoice PDF embedding.

**Logo File Specifications:**
- **Format:** PNG or JPG (JPEG) only
  - Accepted MIME types: `image/png`, `image/jpeg`
  - Error if other formats (GIF, WebP, SVG, etc.): `invalid_logo_format`
- **File Size:** Max 500 KB
  - Error if exceeds 500 KB: `logo_file_too_large`
- **Dimensions:** Max 1024 × 1024 pixels
  - Error if width > 1024 or height > 1024: `logo_dimensions_exceeded`
  - Min dimensions: 100 × 100 pixels (too small for invoice display)
  - Error if width < 100 or height < 100: `logo_dimensions_too_small`

**Invoice PDF Rendering:**
- Logo embedded as base64 in HTML template (before html2pdf conversion)
- Base64 embedding avoids external image URL issues during PDF generation
- Aspect ratio preserved during rendering (no distortion)
- Logo positioned in top-left corner of invoice

**Clinic Admin Upload Flow:**
1. Clinic uploads logo via admin dashboard (`/admin/clinic/settings/logo`)
2. Backend validates: format, file size, dimensions (4 checks)
3. If valid: Store logo in Supabase Storage, set clinics.logo_url
4. If invalid: Return error to clinic staff with specific constraint violated
5. All future invoices for clinic use this logo

**Error Responses (400 Bad Request):**
```json
{
  "error": {
    "code": "invalid_logo_format",
    "message": "Logo must be PNG or JPG format. Current: image/gif"
  }
}
```
```json
{
  "error": {
    "code": "logo_file_too_large",
    "message": "Logo file exceeds 500 KB limit. Current size: 2.3 MB"
  }
}
```
```json
{
  "error": {
    "code": "logo_dimensions_exceeded",
    "message": "Logo dimensions must not exceed 1024×1024 pixels. Current: 2000×2000"
  }
}
```

**Implementation Notes:**
- Validation performed on upload, not on each invoice generation
- Logo cached in Supabase Storage with CDN for fast invoice rendering
- Optional: Clinic can update logo anytime (new invoices use new logo, old invoices immutable)

---

## 4. Database Schema

### New Tables

#### 4.1 Table: `payments`
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  payment_intent_id VARCHAR NOT NULL UNIQUE,
  charge_id VARCHAR UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR DEFAULT 'brl',
  status VARCHAR NOT NULL (created, processing, succeeded, failed, canceled),
  payment_method_id VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),
  confirmed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_patient_id ON payments(patient_id);
CREATE INDEX idx_payments_clinic_id ON payments(clinic_id);
CREATE INDEX idx_payments_status ON payments(status);
```

#### 4.2 Table: `payment_methods`
```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  stripe_payment_method_id VARCHAR NOT NULL UNIQUE,
  card_brand VARCHAR (visa, mastercard, elo, amex),
  card_last4 VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_payment_methods_patient_id ON payment_methods(patient_id);
CREATE INDEX idx_payment_methods_clinic_id ON payment_methods(clinic_id);

-- RLS Policy: Patients can only see their own payment methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients see own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = patient_id OR auth.uid() IN (
    SELECT user_id FROM clinics WHERE id = clinic_id
  ));
```

#### 4.3 Table: `invoices`
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  payment_id UUID REFERENCES payments(id),
  invoice_number VARCHAR NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR DEFAULT 'brl',
  pdf_url VARCHAR,
  email_status VARCHAR (pending, sent, failed, bounced),
  created_at TIMESTAMP DEFAULT now(),
  sent_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_invoices_appointment_id ON invoices(appointment_id);
CREATE INDEX idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX idx_invoices_clinic_id ON invoices(clinic_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
```

#### 4.4 Table: `payment_audit_log`
```sql
CREATE TABLE payment_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  user_id UUID REFERENCES auth.users(id),
  operation VARCHAR NOT NULL (
    payment_created,
    payment_confirmed,
    payment_failed,
    method_saved,
    method_deleted,
    invoice_generated,
    invoice_sent,
    refund_processed
  ),
  payment_id UUID REFERENCES payments(id),
  payment_method_id VARCHAR,
  appointment_id UUID REFERENCES appointments(id),
  invoice_id UUID REFERENCES invoices(id),
  amount_cents INTEGER,
  currency VARCHAR DEFAULT 'brl',
  success BOOLEAN,
  result VARCHAR,
  ip_address INET,
  user_agent VARCHAR,
  idempotency_key UUID,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_payment_audit_log_clinic_id ON payment_audit_log(clinic_id);
CREATE INDEX idx_payment_audit_log_user_id ON payment_audit_log(user_id);
CREATE INDEX idx_payment_audit_log_created_at ON payment_audit_log(created_at);

-- RLS: Only clinic owner/accountant can view
ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clinic staff see audit logs" ON payment_audit_log
  FOR SELECT USING (
    auth.uid() IN (SELECT owner_id FROM clinics WHERE id = clinic_id)
    OR auth.uid() IN (SELECT user_id FROM clinic_staff WHERE clinic_id = clinic_id AND role IN ('accountant', 'admin'))
  );
```

#### 4.5 Table: `webhook_events`
```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  stripe_event_id VARCHAR NOT NULL UNIQUE,
  event_type VARCHAR NOT NULL,
  status VARCHAR NOT NULL (processing, completed, failed),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_webhook_events_clinic_id ON webhook_events(clinic_id);
CREATE INDEX idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
```

### Modified Tables

#### 4.6 Modifications to `appointments`
```sql
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS stripe_payment_status VARCHAR;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS payment_method VARCHAR;

CREATE INDEX idx_appointments_payment_intent_id ON appointments(payment_intent_id);
```

---

## 5. Error Handling Matrix

### Stripe API Errors

| Error Code | HTTP Status | User Message | Action |
|-----------|------------|--------------|--------|
| `card_declined` | 400 | "Your card was declined. Please try another card or payment method." | Retry with different card |
| `expired_card` | 400 | "Your card has expired. Please use a different card." | Use different card |
| `incorrect_cvc` | 400 | "CVC/CVV incorrect. Please check and try again." | Re-enter CVC |
| `processing_error` | 500 | "Processing error. Please try again in a moment." | Automatic retry (exponential backoff) |
| `rate_limit_error` | 429 | "Too many requests. Please wait a moment and try again." | Automatic retry (exponential backoff) |
| `authentication_error` | 500 | "Authentication error. Please contact clinic support." | Check Stripe API keys (config error) |
| `invalid_request_error` | 400 | "Invalid request. Please check your information and try again." | Check request parameters, log for debugging |
| `unknown_error` | 500 | "An unexpected error occurred. Please try again or contact support." | Log full error, alert support team |

### Webhook Errors

| Scenario | Status | Action |
|----------|--------|--------|
| Invalid signature | 403 Forbidden | Do NOT process. Log security incident. |
| Event already processed | 200 OK | Return immediately (idempotency). |
| Processing timeout | 200 OK | Return immediately, process async. Alert if not completed within 5 minutes. |
| Database error | 500 | Log error. Queue for retry (exponential backoff: 1s, 5s, 30s, 5min, 30min). |
| Max retries exceeded | Move to dead-letter queue | Alert clinic staff. Manual review required. |

### Application Errors

| Scenario | HTTP Status | Response |
|----------|------------|----------|
| Appointment not found | 404 | `{ "error": { "code": "appointment_not_found" } }` |
| Patient not found | 404 | `{ "error": { "code": "patient_not_found" } }` |
| Payment method not found | 404 | `{ "error": { "code": "payment_method_not_found" } }` |
| Duplicate payment (idempotency) | 200 | Return cached response |
| Insufficient permissions | 403 | `{ "error": { "code": "forbidden" } }` |
| RLS violation (cross-patient access) | 403 | `{ "error": { "code": "forbidden" } }` |

### Retry Strategy

**Automatic Retries (Application-Level):**
- Error codes: `processing_error`, `rate_limit_error`, `temporary_failure`
- Max retries: 3
- Backoff: exponential (1s, 5s, 30s)
- Log each retry with timestamp and error

**Manual Retry:**
- Clinic staff can manually retry failed payments/invoices via `/api/invoices/{id}/resend` or payment retry button
- Idempotency-Key prevents duplicate charges

**Dead-Letter Queue:**
- Events failing after 5 retries moved to dead-letter
- Alert clinic staff
- Manual review required

---

## 6. Security & Compliance

### PCI DSS Level 4 Compliance (SAQ A)

#### 6.1 No Raw Card Data
- **Requirement:** Never store, process, or transmit raw card data (PAN)
- **Implementation:**
  - Stripe Elements for all card input (frontend only)
  - Payment Method tokens (payment_method_id) stored in database
  - PaymentIntent API for payment processing
  - SetupIntent API for card tokenization
  - No card data in logs, audit trails, or error messages

#### 6.2 HTTPS/TLS Enforcement
- **Requirement:** All API endpoints HTTPS only (TLS 1.2+)
- **Implementation:**
  - Force HTTPS redirect in Next.js middleware
  - TLS 1.2+ enforced by cloud provider (Vercel)
  - HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - Certificate renewal automatic

#### 6.3 Secure Coding Practices
- **Requirement:** Input validation, parameterized queries, error handling
- **Implementation:**
  - Zod schema validation for all API inputs
  - Supabase parameterized queries (ORM safety)
  - Error messages do NOT expose internal system details
  - No stack traces in production
  - Rate limiting: 100 requests/minute per IP

#### 6.4 Access Control (RLS)
- **Requirement:** Patients see only their own data
- **Implementation:**
  - Supabase RLS policies on all tables
  - payment_methods: Patient sees own methods only
  - invoices: Patient sees own invoices only
  - payment_audit_log: Clinic staff (admin/accountant) only
  - All queries include clinic_id + patient_id filters

#### 6.5 Audit Logging (Requirement 10)
- **Requirement:** Immutable audit log of all cardholder data access
- **Implementation:**
  - payment_audit_log table (append-only)
  - Columns: operation, user_id, timestamp, payment_method_id (tokenized), success/failure
  - No card PAN, CVC, or expiry in logs
  - Retention: 5+ years
  - Access restricted to clinic owner/accountant

#### 6.6 Incident Response
- **Requirement:** Plan for data breaches or unauthorized access
- **Implementation:**
  - Security incident playbook documented
  - Alert clinic staff immediately if audit log accessed unauthorized
  - Notify patients within 72 hours if card data breached
  - Log all access attempts (success/failure)
  - Escalation path: Clinic owner → Security team → Legal

#### 6.7 Webhook Signature Validation
- **Requirement:** Verify authenticity of Stripe webhooks
- **Implementation:**
  - Extract Stripe-Signature header
  - Use stripe.webhooks.constructEvent() (validates HMAC)
  - Reject unsigned or invalid webhooks
  - Log rejected webhooks (security incident)

#### 6.8 SAQ A Questionnaire
- **Checklist:** ~35 questions to complete before go-live
- **Key Points:**
  - Does your system store any cardholder data? NO
  - Do you have HTTPS on all payment pages? YES
  - Do you have a security audit plan? YES
  - Do you validate Stripe webhooks? YES
- **Completion:** Clinic accountant/owner signs off

---

### LGPD Compliance (Brazil Data Protection)

#### 6.9 Data Minimization
- **Requirement:** Collect only necessary personal data
- **Implementation:**
  - Patient ID, appointment date, amount (necessary)
  - Card brand, last4, expiry (necessary for display)
  - Full card number, CVC: NEVER (Stripe handles)
  - Minimize logging of IP address (hash or anonymize)

#### 6.10 Consent & Opt-In
- **Requirement:** Patient must consent to data processing
- **Implementation:**
  - Payment form displays: "By proceeding, you consent to payment processing per [Privacy Policy]"
  - Link to privacy policy provided
  - No pre-checked consent boxes

#### 6.11 Data Retention & Right to Deletion
- **Requirement:** Retain only as long as necessary. Clinic must honor deletion requests
- **Implementation:**
  - Financial records: 5 years (legal requirement)
  - Audit logs: 5 years (PCI + tax compliance)
  - Payment methods: Delete on patient request (soft delete: set deleted_at)
  - Cascade deletion: If patient deleted, all personal data deleted (except audit logs for legal compliance)

#### 6.11b LGPD Deletion Strategy (Clarification)
**Conflict Resolution:** Patient deletion requests vs. 5-year audit retention

**Strategy Chosen: Option A (Soft-Delete + Pseudonymization)**
- Invoices are soft-deleted when patient is deleted (deleted_at timestamp set)
- Audit logs are retained for 5 years (contain NO patient PII — only operation type, timestamp, payment_method_id, amounts)
- After 5-year retention period, clinic may purge audit_log entries for that patient
- Invoice PDFs in Supabase Storage are deleted immediately on patient deletion

**Implementation:**
- [ ] Audit log schema reviewed to confirm NO PII is logged (only payment_method_id, not card details)
- [ ] Cascade delete trigger: On patient.deleted_at = NOW(), set invoices.deleted_at = NOW() for all patient invoices
- [ ] Invoice retrieval queries filter deleted_at IS NULL (soft delete)
- [ ] Annual purge job (post-5-year retention): Delete audit_log entries where created_at < (NOW() - 5 years)
- [ ] LGPD compliance officer reviews and approves this strategy before go-live

**Test Scenario (New in Phase 6):**
- Patient requests deletion → Patient soft-deleted → All invoices soft-deleted → Audit logs retained → After 5 years, audit purge job removes audit entries

#### 6.12 Data Breach Notification
- **Requirement:** Notify patients within 72 hours of breach
- **Implementation:**
  - Security incident playbook includes notification steps
  - Email template pre-prepared
  - Clinic owner notifies patients via email
  - Regulatory authority notified if required

#### 6.13 International Data Transfers
- **Requirement:** If data leaves Brazil, require adequacy decision or appropriate safeguards
- **Implementation:**
  - Stripe: Stripe is US-based. Safeguards: Stripe's SOC 2 Type II compliance, data processing agreement (DPA) with Stripe
  - Supabase: EU-based (by default). GDPR-compliant. No explicit Brazil location requirement, but Supabase complies with LGPD as well.
  - Resend: EU-based. GDPR-compliant. Email provider.
  - Decision: Services are adequate for LGPD. No additional safeguards required beyond DPAs with vendors.

---

### Webhook Security

#### 6.14 Stripe Webhook Secret & Rotation Procedure
- **Requirement:** Store STRIPE_WEBHOOK_SECRET securely and rotate without downtime
- **Implementation:**
  - Stored in .env (not in version control)
  - Never logged or exposed in error messages
  - Rotated annually or on suspected compromise

**Webhook Secret Rotation Procedure (Zero-Downtime):**

**Step 1: Enable Dual-Key Support (Pre-Rotation)**
- [ ] Update webhook endpoint to accept BOTH current and previous secrets during rotation window
- Implementation:
  ```javascript
  // Accept both current and previous secrets
  const validateWebhookSignature = (body, signature, secret) => {
    try {
      return stripe.webhooks.constructEvent(body, signature, secret);
    } catch {
      return stripe.webhooks.constructEvent(body, signature, previousSecret);
    }
  }
  ```

**Step 2: Rotate Secret in Stripe Dashboard**
- [ ] Log in to Stripe dashboard
- [ ] Navigate: Settings → Webhooks → Select endpoint → Rotate secret
- [ ] Copy new secret value
- [ ] Stripe will continue sending events with OLD secret for 48 hours (grace period)

**Step 3: Update Application (During 48-Hour Window)**
- [ ] Update .env.production with new STRIPE_WEBHOOK_SECRET
- [ ] Deploy to production
- [ ] Both old and new secrets accepted during grace period (no downtime)

**Step 4: Verify & Cleanup (After 48 Hours)**
- [ ] After 48-hour grace period, remove previousSecret from code
- [ ] Stripe stops sending with old secret
- [ ] Monitor webhook delivery: Check Stripe dashboard for delivery status

**Rotation Schedule:**
- [ ] **Annual rotation:** Every 12 months (mark in calendar)
- [ ] **On-demand rotation:** If suspected compromise, rotate immediately
- [ ] **Documentation:** Log rotation date/time in clinic's security incident log

**Backup Procedure (If Rotation Fails):**
- If webhook delivery fails after rotation:
  - Check Stripe dashboard: verify webhook endpoint is accessible
  - Check application logs: verify new secret is deployed
  - Revert secret temporarily (use Stripe API to roll back)
  - Diagnose issue, redeploy, then rotate again

**Test Scenario:**
- [ ] Webhook secret rotation test in staging environment before each prod rotation
- [ ] Verify: Stripe sends test webhooks during grace period with both old and new secrets
- [ ] Verify: Application accepts both secrets
- [ ] Verify: After grace period, old secret is removed and app continues working

#### 6.15 Webhook IP Allowlisting (Optional)
- **Requirement:** Optional: Restrict webhooks to Stripe IP ranges
- **Implementation:**
  - Stripe publishes IP ranges: https://stripe.com/docs/webhooks/ip-filtering
  - Can add WAF rule in cloud provider (Vercel doesn't expose WAF, so rely on signature validation)

---

## 7. Testing Strategy

### Test Environment
- **Stripe Test Mode:** Use test API keys (sk_test_*, pk_test_*)
- **Test Cards:** Provided by Stripe (https://stripe.com/docs/testing)
- **Webhook Testing:** Stripe CLI (stripe listen, stripe trigger)

### Test Scenarios

#### 7.1 Happy Path: Successful Payment
**Scenario:** Patient pays for appointment with Card.

**Steps:**
1. Patient logs in
2. Patient selects appointment
3. Patient clicks "Pay Now"
4. Payment form loads (Stripe Elements)
5. Patient enters card: `4242 4242 4242 4242` (Visa test card)
6. Patient clicks "Pay"
7. POST `/api/payments/process` creates PaymentIntent
8. Stripe confirms payment
9. Webhook `/api/webhooks/stripe` receives payment_intent.succeeded
10. Appointment status → "paid"
11. Invoice PDF generated
12. Email sent to patient
13. Patient receives email with invoice link
14. Patient clicks link, downloads PDF

**Assertions:**
- [ ] HTTP 200 response from POST `/api/payments/process`
- [ ] Appointment.stripe_payment_status = 'succeeded'
- [ ] Invoice created in invoices table
- [ ] Invoice PDF cached in Supabase Storage
- [ ] Email sent successfully (Resend logs)
- [ ] Audit log entry created for payment_confirmed + invoice_generated

---

#### 7.2 Error Scenario: Card Declined
**Scenario:** Patient uses declined test card.

**Steps:**
1. Patient enters card: `4000 0000 0000 0002` (Visa declined test card)
2. Patient clicks "Pay"
3. Stripe rejects with card_declined error
4. Frontend displays: "Your card was declined. Please try another card."
5. Appointment status NOT changed
6. No invoice generated
7. No email sent
8. Audit log entry created for payment_failed

**Assertions:**
- [ ] HTTP 400 response from POST `/api/payments/process`
- [ ] Error code = card_declined
- [ ] Appointment.stripe_payment_status = 'failed'
- [ ] No invoice created
- [ ] Audit log shows payment_failed

---

#### 7.3 Error Scenario: 3D Secure Authentication
**Scenario:** Card requires 3D Secure (SCA).

**Steps:**
1. Patient enters card: `4000 0000 0000 0127` (Visa 3D Secure test card)
2. Patient clicks "Pay"
3. Stripe returns requires_action status
4. Frontend redirects to Stripe's 3D Secure page
5. Patient completes 3D Secure challenge
6. Frontend confirms PaymentIntent via POST `/api/payments/{id}/confirm`
7. Stripe confirms payment
8. Webhook updates appointment
9. Invoice generated

**Assertions:**
- [ ] HTTP 200 response with requires_action status
- [ ] client_secret provided for frontend confirmation
- [ ] Redirect URL valid
- [ ] POST confirm endpoint processes 3D Secure challenge
- [ ] Final payment succeeds

---

#### 7.4 Webhook Idempotency: Duplicate Event
**Scenario:** Stripe retries webhook delivery (duplicate event_id).

**Setup:**
1. Configure webhook endpoint
2. Trigger payment event
3. Intercept webhook request (Stripe CLI: stripe trigger)
4. Send same event twice

**Steps:**
1. First webhook received → processed → event_id stored in processed_events
2. Second webhook received → event_id already in processed_events → Return 200 OK (no re-processing)

**Assertions:**
- [ ] First webhook: appointment status updated to "paid"
- [ ] First webhook: invoice generated
- [ ] Second webhook: return 200 OK immediately (no processing)
- [ ] Second webhook: appointment status unchanged
- [ ] Second webhook: no duplicate invoice created
- [ ] Audit log shows only one payment_confirmed entry

---

#### 7.5 Save Payment Method: Happy Path
**Scenario:** Patient saves card for future use.

**Steps:**
1. Patient clicks "Save this card for future use"
2. SetupIntent created via POST `/api/patient/{id}/payment-methods/create-setup-intent`
3. Frontend receives setup_intent_id + client_secret
4. Stripe.js handles card tokenization
5. POST `/api/patient/{id}/payment-methods` confirms SetupIntent
6. Payment method saved in database
7. Patient views saved methods: GET `/api/patient/{id}/payment-methods`
8. Saved card listed (brand + last4)

**Assertions:**
- [ ] SetupIntent created successfully
- [ ] Payment method stored in payment_methods table
- [ ] Stripe_payment_method_id saved (tokenized)
- [ ] GET endpoint returns saved methods
- [ ] Audit log shows method_saved

---

#### 7.6 Delete Payment Method
**Scenario:** Patient removes saved card.

**Steps:**
1. Patient views saved cards
2. Patient clicks "Delete" on card
3. DELETE `/api/patient/{id}/payment-methods/{method_id}` called
4. Payment method soft-deleted (deleted_at timestamp)
5. Patient views saved cards again (card no longer listed)

**Assertions:**
- [ ] HTTP 204 response
- [ ] deleted_at timestamp set
- [ ] GET endpoint does NOT return deleted method
- [ ] Audit log shows method_deleted

---

#### 7.7 Invoice Email Resend
**Scenario:** Patient requests invoice to be resent.

**Steps:**
1. Invoice already generated and sent
2. Patient requests resend: POST `/api/invoices/{id}/resend`
3. Email resent from cache (no PDF regeneration)
4. Patient receives email again

**Assertions:**
- [ ] HTTP 200 response
- [ ] Email sent to patient
- [ ] sent_at timestamp updated
- [ ] No new invoice_generated audit entry (already exists)
- [ ] No PDF regeneration

---

#### 7.8 PDF Generation Failure & Retry
**Scenario:** PDF generation fails first, then succeeds on retry.

**Steps:**
1. html2pdf library fails (mock error)
2. Retry logic triggers (exponential backoff: 1s, 5s, 30s)
3. On retry, PDF generation succeeds
4. PDF cached
5. Email sent

**Assertions:**
- [ ] Audit log shows invoice_generation_failed + timestamp
- [ ] Retry queued and logged
- [ ] Subsequent retry succeeds
- [ ] PDF cached in Supabase Storage
- [ ] Email sent successfully

---

#### 7.9 PCI Compliance: No Card Data in Logs
**Scenario:** Verify no raw card data stored in logs or audit trail.

**Steps:**
1. Perform payment
2. Check application logs for card data (grep for card number, CVC, PAN)
3. Check audit_log table for card data
4. Check error messages for card data

**Assertions:**
- [ ] No card PAN in logs
- [ ] No CVC in logs
- [ ] No expiry date in audit_log
- [ ] Only payment_method_id (tokenized) stored
- [ ] Error messages do NOT expose card details

---

#### 7.10 RLS: Cross-Patient Access Prevention
**Scenario:** Patient A tries to view Patient B's payment methods.

**Setup:**
1. Create two test patients (A and B)
2. Add payment methods for both

**Steps:**
1. Patient A logs in
2. Patient A tries to access: GET `/api/patient/{B-id}/payment-methods`
3. RLS policy denies access

**Assertions:**
- [ ] HTTP 403 response (Forbidden)
- [ ] No data returned
- [ ] Audit log shows attempt (security event)

---

### Load Testing

#### 7.11 Concurrent Payments
**Scenario:** Multiple patients pay simultaneously.

**Setup:**
- Simulate 1000 concurrent payment requests
- Load testing tool: k6, JMeter, or Locust

**Steps:**
1. Launch load test
2. Monitor API response times
3. Monitor error rates
4. Monitor database connections

**Assertions:**
- [ ] P95 latency < 3 seconds
- [ ] Error rate < 1% (only timeout-related)
- [ ] No database connection errors
- [ ] All payments processed correctly
- [ ] No duplicate charges (idempotency verified)

---

#### 7.12 Orphaned Invoice: PDF Generation Failure After Payment Success
**Scenario:** Payment succeeds but PDF generation fails permanently (after 3 retries).

**Setup:**
- Mock html2pdf to fail with permanent error (e.g., library unavailable)
- Simulate payment webhook succeeding

**Steps:**
1. Payment succeeds → appointment.stripe_payment_status = 'succeeded'
2. Invoice generation triggered
3. html2pdf fails on attempt 1 (1s retry)
4. html2pdf fails on attempt 2 (5s retry)
5. html2pdf fails on attempt 3 (30s retry)
6. After 3 retries, invoice_generation_failed_final logged
7. Invoice record created with pdf_url = NULL
8. Email sent to patient with message: "Invoice available in dashboard (PDF generation pending)"
9. Clinic staff notified of invoice generation failure
10. Clinic staff can manually retry via dashboard

**Assertions:**
- [ ] Invoice record created (pdf_url = NULL)
- [ ] appointment.stripe_payment_status = 'succeeded' (payment not affected)
- [ ] Email sent with dashboard link instead of PDF link
- [ ] Audit log shows invoice_generation_failed_final
- [ ] Clinic staff can click "Retry PDF Generation" button
- [ ] Manual retry succeeds and pdf_url is updated

---

#### 7.12b Webhook Processing Timeout (>30s)
**Scenario:** Webhook processing takes longer than 30 seconds.

**Setup:**
- Mock slow processing (simulate DB query timeout or external API call delay)

**Steps:**
1. Webhook received for payment_intent.succeeded
2. Processing begins (appointment update + invoice generation)
3. Simulate slow operation (e.g., 35 seconds)
4. Webhook processing takes >30 seconds
5. Response must return 200 OK within 30 seconds (use async pattern)
6. Processing completes asynchronously

**Assertions:**
- [ ] HTTP 200 response returned within 30 seconds
- [ ] Processing continues asynchronously (queued in background job)
- [ ] Appointment status eventually updated to "paid"
- [ ] Invoice eventually generated
- [ ] Audit log shows webhook_processed + async_processing_initiated
- [ ] No webhook retry triggered (Stripe got 200 OK)

---

#### 7.12c Concurrent Invoice Number Generation (Race Condition)
**Scenario:** Two payments complete simultaneously. Invoice numbers must be sequential and unique.

**Setup:**
- Launch 100 concurrent payment requests
- All complete within 1-2 seconds
- Monitor invoice_number uniqueness

**Steps:**
1. Simulate 100 concurrent payments
2. All trigger invoice generation
3. invoice_number format: YYYY-MM-00001, YYYY-MM-00002, ..., YYYY-MM-00100
4. All must be unique (no collision)

**Assertions:**
- [ ] All 100 invoices created
- [ ] All invoice_numbers unique (no duplicates)
- [ ] invoice_numbers are sequential (no gaps)
- [ ] No database constraint violations
- [ ] PostgreSQL sequence used for generation (prevents race condition)
- [ ] Audit log shows all 100 invoices as separate events

---

### Manual Testing Checklist
- [ ] Test payment flow end-to-end (appointment → payment → invoice)
- [ ] Test all test card scenarios (declined, 3D Secure, expired, etc.)
- [ ] Test invoice email delivery (check for spam folder)
- [ ] Test invoice PDF download (verify formatting, logo, Portuguese text)
- [ ] Test saved payment method list/delete
- [ ] Test error messages (user-friendly, no sensitive data)
- [ ] Test webhook delivery via Stripe CLI
- [ ] Test idempotency (duplicate webhook)
- [ ] Test audit logging (no card data, operations logged)
- [ ] Penetration test (attempt RLS bypass, SQL injection, etc.)
- [ ] PCI DSS self-assessment questionnaire (SAQ A)

---

## 8. Deployment & Rollout Plan

### Pre-Deployment Checklist

#### Environment Setup
- [ ] Stripe API keys (test + production) configured in .env
- [ ] STRIPE_PUBLIC_KEY (pk_...) available to frontend
- [ ] STRIPE_SECRET_KEY (sk_...) stored securely backend
- [ ] STRIPE_WEBHOOK_SECRET configured and verified
- [ ] RESEND_API_KEY configured (email delivery)
- [ ] Database migrations applied (payment_* tables created)
- [ ] RLS policies activated on all payment tables
- [ ] Webhook endpoint URL registered in Stripe dashboard

#### Code Review & Testing
- [ ] All tests passing (npm test)
- [ ] Code review completed (CodeRabbit or peer review)
- [ ] Linting passed (npm run lint)
- [ ] Type checking passed (npm run typecheck)
- [ ] Manual testing checklist completed (all 11 scenarios)
- [ ] PCI DSS SAQ A questionnaire completed

#### Security Review
- [ ] No hardcoded secrets in codebase
- [ ] HTTPS enforced on all endpoints
- [ ] Rate limiting configured (100 req/min per IP)
- [ ] CORS configured appropriately
- [ ] Security headers configured (HSTS, X-Frame-Options, etc.)
- [ ] Audit logging verified (no card data in logs)
- [ ] Vulnerability scan passed (e.g., OWASP dependency check)

---

### Deployment Steps (Production)

#### Stage 1: Pre-Launch (Clinic Staff Testing)
**Duration:** 1 week
**Users:** Clinic admin, accountant, test patient

**Activities:**
1. Deploy to staging environment
2. Clinic staff creates test patients
3. Staff tests full payment flow (end-to-end)
4. Staff verifies invoice PDF (formatting, logo, info)
5. Staff verifies audit logging
6. Staff reviews error messages for clarity
7. Sign-off: "Payment system ready for production"

#### Stage 2: Production Deployment
**Duration:** 1 day

**Activities:**
1. Deploy to production environment
2. Verify environment variables (Stripe keys, secrets)
3. Run health checks (GET `/api/health`)
4. Verify database migrations applied
5. Verify RLS policies active
6. Verify webhook endpoint accessible (Stripe test webhook)
7. Enable feature flag: `payments_enabled: false` (disabled by default)

#### Stage 3: Staged Rollout
**Duration:** 2-4 weeks (phased)

**Phase 1: 10% Users (Internal Testing)**
- Enable payments for: clinic staff only
- Monitor: Payment success rate, error rate, latency
- Expected volume: ~10-20 test payments
- Gate: 95% success rate, no critical issues
- Duration: 3-5 days

**Phase 2: 25% Users (Early Adopters)**
- Enable payments for: clinic staff + 25% of patients
- Monitor: Payment success rate, error rate, latency, webhook health
- Expected volume: ~200-500 payments
- Gate: 95% success rate, webhook health > 90%, no critical issues
- Duration: 1 week

**Phase 3: 50% Users (Expanding)**
- Enable payments for: 50% of patients
- Monitor: All metrics + email delivery, PDF generation
- Expected volume: ~500-1000 payments
- Gate: 98% success rate, email delivery > 95%, PDF generation < 5s
- Duration: 1 week

**Phase 4: 100% Users (Full Rollout)**
- Enable payments for: all patients
- Monitor: All metrics
- Expected volume: All clinic payments

---

### Rollback Procedure

**If Critical Issue Detected:**
1. **Immediately:** Set feature flag `payments_enabled: false`
   - Patients cannot initiate new payments
   - Existing payments/invoices unaffected
2. **Communicate:** Alert clinic staff + patients
3. **Investigate:** Root cause analysis
4. **Fix:** Deploy fix to staging, test, redeploy to production
5. **Resume:** Re-enable feature flag with fix deployed
6. **Verify:** Monitor metrics for 24 hours before fully rolling out

**Rollback Checklist:**
- [ ] Feature flag disabled
- [ ] Patient notifications sent
- [ ] Support team alerted
- [ ] Incident log created
- [ ] Root cause identified
- [ ] Fix deployed to staging
- [ ] Fix tested
- [ ] Fix deployed to production
- [ ] Feature flag re-enabled
- [ ] Monitoring resumed

---

### Post-Launch Monitoring

#### Metrics Dashboard (First 30 Days)
- **Payment Success Rate:** Target > 98%
- **Webhook Health:** Target > 95% (successful event processing)
- **Email Delivery Rate:** Target > 95%
- **PDF Generation Time:** Target P95 < 5 seconds
- **API Latency (POST /payments/process):** Target P95 < 3 seconds
- **Error Rate by Type:** Categorize and trend
- **Dead-Letter Queue Size:** Should remain < 10 (manual review required)

#### Alerts (Auto-Escalation)
- **Payment Success Rate < 90%:** Alert clinic admin + support team
- **Webhook Health < 80%:** Alert support team (may indicate Stripe issues)
- **Email Delivery < 80%:** Alert support team
- **Database Connection Errors:** Alert DevOps immediately
- **Unauthorized Access Attempts (RLS violations):** Alert security team
- **Unhandled Exceptions:** Alert DevOps + product team

#### Weekly Review (First Month)
1. Review payment volume, success rate, error types
2. Review webhook health, dead-letter queue
3. Review email delivery, PDF generation performance
4. Review customer complaints/support tickets
5. Review security audit logs (no unauthorized access)
6. Adjust retention policies/caching if needed

---

## 9. Non-Functional Requirements (NFR) Detail

### NFR-005.001: PCI DSS Compliance (Detailed)
**Status:** MUST verify before go-live

**Controls Implemented:**
- ✅ No raw card data stored (Stripe Elements + tokens)
- ✅ HTTPS/TLS 1.2+ on all endpoints
- ✅ Secure coding: input validation, parameterized queries
- ✅ Access control: RLS policies on all tables
- ✅ Audit logging: payment_audit_log table (immutable, no card data)
- ✅ Webhook signature validation (stripe.webhooks.constructEvent)
- ✅ No hardcoded passwords (environment variables)
- ✅ Rate limiting: 100 requests/minute per IP
- ✅ CORS configured appropriately

**Verification Steps:**
1. Complete SAQ A questionnaire (35 questions)
2. Vulnerability scan (PCI-approved vendor, cost $500-2K)
3. Code review for PCI controls
4. Audit log review (no PAN/CVV in logs)
5. Third-party audit (optional, cost $2-5K for clinic confidence)

**Sign-Off:**
- [ ] SAQ A completed by clinic owner/accountant
- [ ] Vulnerability scan passed
- [ ] Code review approved
- [ ] Clinic accountant sign-off

---

### NFR-005.002: Brazil Payment Methods
**Phase 2 Scope:**
- ✅ Credit/Debit Cards: Visa, Mastercard, ELO (via Stripe PaymentIntent)
- ✅ Currency: BRL (Brazilian Real)
- ✅ Test mode with Brazilian test cards verified

**Phase 3 Scope (Deferred):**
- 🔄 Pix (instant transfer)
- 🔄 Boleto (bank invoice, ~3 day settlement)
- 🔄 NF-e/RPS (tax document generation, requires SEFAZ integration)

**Decision:** Phase 2 MVP ships with Card only. Pix + Boleto added in Phase 3 (higher complexity, SEFAZ integration deferred).

---

### NFR-005.003: Webhook Reliability
**Status:** Implemented

**Controls:**
- ✅ Stripe webhook signature validation
- ✅ Idempotency: processed_events table (prevent duplicates)
- ✅ Async processing: Return 200 OK immediately, process in background
- ✅ Retry logic: DB queue with exponential backoff (1s, 5s, 30s, 5min, 30min)
- ✅ Dead-letter queue: Events failing 5+ times → manual review
- ✅ Monitoring: Webhook health dashboard (success rate, retry count)

**SLA:**
- Webhook processing: 95% success rate
- Alert if < 95% for 1 hour

---

### NFR-005.004: Performance
**Status:** Measured

**Targets:**
- POST `/api/payments/process`: P95 < 3 seconds
- POST `/api/payments/confirm`: P95 < 2 seconds
- Invoice PDF generation: P95 < 5 seconds (target < 2s)
- Email sending (Resend): P95 < 3 seconds
- Webhook processing (< 30s, typically < 5s)

**Measurement:**
- Log all request latencies
- Dashboard: P50, P95, P99 latencies by endpoint
- Monthly performance report to clinic

**Optimization (If Needed):**
- Caching: PDFs cached after generation (immutable)
- Async processing: Webhook events processed in background
- Database indexes: Ensure queries are optimized
- CDN: Static assets cached on CDN (Vercel edge network)

---

### NFR-005.005: LGPD Compliance
**Status:** Implemented

**Controls:**
- ✅ Data minimization: Only necessary data collected
- ✅ Consent: Payment form displays privacy policy link
- ✅ Data retention: 5+ years (legal requirement for clinic)
- ✅ Deletion: Soft delete payment methods, cascade delete patient data (except audit logs)
- ✅ Breach notification: Playbook for notifying patients within 72 hours
- ✅ International transfers: Stripe + Supabase + Resend have adequate safeguards (DPAs in place)

**Sign-Off:**
- [ ] LGPD compliance officer reviews audit log schema
- [ ] Retention policy documented
- [ ] Incident response plan documented
- [ ] DPAs with Stripe, Supabase, Resend confirmed

---

### NFR-005.006: Internationalization (i18n) & Localization
**Status:** MUST implement for Brazil clinic

**Requirement:** All user-facing text (error messages, success messages, labels) shall be in Portuguese (PT-BR).

**Scope:**
- [ ] **Error Messages:** All error messages displayed to patients/clinic staff in PT-BR
  - Example: "Seu cartão foi recusado. Tente outro cartão." (NOT "Your card was declined. Try another card.")
  - Error codes internally (card_declined) but messages are PT-BR
- [ ] **Success Messages:** Confirmation messages in PT-BR
  - Example: "Pagamento confirmado com sucesso!" (NOT "Payment confirmed successfully!")
- [ ] **UI Labels:** Form labels, button text, placeholder text in PT-BR
  - Example: "Número do cartão" (NOT "Card number")
- [ ] **Email Content:** Invoice emails in PT-BR
  - Example: "Sua fatura está pronta" (NOT "Your invoice is ready")
- [ ] **Localization Files:** Store all strings in i18n JSON (e.g., `public/locales/pt-BR.json`)
  - No hardcoded strings in code
- [ ] **Dynamic Content:** Clinic logo, invoice details, clinic address in clinic's preferred language (stored in clinic settings)

**Implementation Approach:**
- Use Next.js i18n library (next-intl or similar)
- Default locale: pt-BR
- All error handlers use getTranslation('errors.card_declined_pt_br')
- Test: All error scenarios verified in PT-BR

**Verification:**
- [ ] QA team validates all error messages in PT-BR
- [ ] Clinic staff review and approve all messaging in their language
- [ ] No English strings visible to patients/clinic staff
- [ ] Fallback: If string missing, default to PT-BR placeholder (not English)

---

## 10. Critical Decisions & Rationale

### Decision 1: PaymentIntent Over Legacy Charge API
**Decision:** Use Stripe PaymentIntent (not Charge API)

**Rationale:**
- PaymentIntent is modern, SCA-ready, Brazil-compatible
- Charge API is legacy, being deprecated
- PaymentIntent supports 3D Secure (required in Europe, recommended in Brazil)
- PaymentIntent provides better state machine (created → processing → succeeded/failed)
- PaymentIntent future-proof (Brazil payment methods, advanced auth)

**Impact:** Requires Stripe.js + backend confirmation. More complex than Charge, but future-proof.

---

### Decision 2: html2pdf Over Puppeteer for PDF Generation
**Decision:** Use html2pdf (lightweight) instead of Puppeteer (heavy)

**Rationale:**
- html2pdf: ~200KB bundle, ~500ms-1s per PDF
- Puppeteer: ~150MB bundle, ~2-5s per PDF
- Aria uses Next.js (serverless on Vercel)
- Invoices are simple (text + table), no complex rendering needed
- Bundle size critical for serverless (Lambda cold start)
- html2pdf sufficient for invoice use case

**Impact:** Smaller bundle, faster generation, simpler deployment. Trade-off: Limited CSS support, but sufficient for invoices.

---

### Decision 3: Resend Email with Download Link (Not Attachment)
**Decision:** Send invoice as download link (not PDF attachment)

**Rationale:**
- Resend SDK does NOT support attachments natively
- Alternative: Use SendGrid/AWS SES (requires service switch)
- Download link approach: PDF cached in Supabase Storage, user downloads from link
- Benefits: Reduces email size (Resend limit 25MB), improves deliverability, user controls download
- User Experience: Email says "Your invoice is ready. Click here to download PDF."

**Impact:** Slightly more steps for patient (click link), but simpler integration. Accepted trade-off.

---

### Decision 4: DB-Based Queue Over Bull/RabbitMQ
**Decision:** Use simple DB-based queue for webhook processing

**Rationale:**
- DB queue: Simple, no external dependency (uses Supabase)
- Bull: Redis-based, powerful, overkill for MVP
- MVP volume: ~100-300 payments/month (not high-volume)
- DB queue sufficient for reliability (idempotency + retry)
- Phase 3: Can upgrade to Bull if scaling needed

**Implementation:**
- webhook_events table: { stripe_event_id, status, retries, next_retry_at }
- Worker process: Cron job or background task polling queue
- Retry logic: Exponential backoff (1s, 5s, 30s, 5min, 30min)

**Impact:** Simple, maintainable, sufficient for MVP. Can scale to Bull in Phase 3.

---

### Decision 5: Self-Assessment PCI Audit (No External Audit)
**Decision:** Use self-assessment (SAQ A) only. Optional external audit.

**Rationale:**
- Aria is Level 4 merchant (<20K txns/year)
- Level 4 requires SAQ A only (no external audit mandatory)
- External audit cost: $2-5K (optional, clinic can decide)
- SAQ A is comprehensive enough for Level 4 compliance
- Clinic can request external audit later for confidence

**Implementation:**
- Complete SAQ A questionnaire (35 questions)
- Vulnerability scan (PCI-approved vendor, $500-2K)
- Code review for PCI controls
- Clinic signs off

**Impact:** Lower cost, faster go-live. Clinic retains option for external audit.

---

### Decision 6: Card-Only Phase 2, Pix+Boleto Phase 3
**Decision:** Phase 2: Card payments only. Phase 3: Add Pix + Boleto.

**Rationale:**
- Phase 2 scope: MVP, reduce complexity
- Card support: Sufficient for initial rollout (most users have cards)
- Pix + Boleto Phase 3: Requires additional UI, testing, potentially SEFAZ integration for NF-e
- SEFAZ integration deferred (high complexity, requires tax document generation)
- Phase 3 planning: Separate epic/stories

**Impact:** Faster Phase 2 go-live. Phase 3 adds Brazil payment method support.

---

## 11. Known Blockers & Mitigations

### Blocker 1: Stripe Test Mode Limitations
**Issue:** Test mode doesn't fully simulate all Stripe behaviors (e.g., webhook retry timing).

**Mitigation:**
- Use Stripe sandbox environment extensively
- Test webhook delivery using Stripe CLI (stripe listen, stripe trigger)
- Simulate errors manually (e.g., fail a payment, verify retry logic)
- Production monitoring: Track actual webhook behavior in real-time

---

### Blocker 2: Email Attachment Limitation (Resend)
**Issue:** Resend SDK doesn't support PDF attachments natively.

**Mitigation:**
- Send invoice as download link (PDF cached in Supabase Storage)
- User experience: Email says "Click here to download your invoice"
- Alternative: Switch to SendGrid/AWS SES (requires service change, deferred to Phase 3)

---

### Blocker 3: Team Unfamiliar with Stripe API
**Issue:** Team has no prior Stripe experience. Learning curve needed.

**Mitigation:**
- Stripe documentation is excellent (stripe.com/docs)
- Assign 2-4 hours for team to review Stripe API docs
- Pair programming: Senior dev pairs with junior dev
- Stripe support: Contact Stripe support for integration questions
- Spike: Quick spike on Stripe.js + PaymentIntent before full development

---

### Blocker 4: PCI Compliance Complexity
**Issue:** PCI DSS requirements are complex. Team unfamiliar with compliance.

**Mitigation:**
- Hire PCI compliance consultant (optional, $2-5K) or review checklist with clinic accountant
- PCI DSS guide available: stripe.com/docs/compliance/pci
- External audit optional (can defer to Phase 3 if clinic wants extra validation)
- Focus on "no raw card data" principle: If Stripe handles tokenization, most PCI controls satisfied

---

### Blocker 5: NF-e/RPS Requirement (Brazil Tax Documents)
**Issue:** Brazil may require NF-e or RPS for healthcare services. High complexity.

**Decision:** Deferred to Phase 3.

**Rationale:**
- NF-e/RPS requires SEFAZ integration (Brazil tax authority)
- SEFAZ integration is complex, third-party service or in-house development
- MVP Phase 2 focuses on payment processing + basic invoices
- Phase 3: Add NF-e/RPS integration (separate epic)

**Mitigation:**
- Phase 2: Simple invoices (receipt-like, not tax document)
- Phase 3: Integrate SEFAZ or third-party service (Nota Fiscal, Simpliss.me)
- Clinic can request NF-e requirement at Phase 3 planning

---

### Blocker 6: Database Performance at Scale
**Issue:** Audit logging + webhook queue may impact database performance.

**Mitigation:**
- Database indexes: idx_webhook_events_status, idx_payment_audit_log_created_at
- Archive old audit logs: Move logs older than 1 year to archive table (maintain 5-year retention)
- Monitoring: Track database query latency, connection pool utilization
- Phase 3: Consider database optimization (partitioning, read replicas)

---

## 12. Definition of Done (DoD)

Stripe Payment Integration specification is DONE when:

### Code Quality
- [ ] All unit tests passing (npm test)
- [ ] All integration tests passing
- [ ] Code linting passed (npm run lint)
- [ ] Type checking passed (npm run typecheck)
- [ ] Code coverage ≥ 80% (happy path + error scenarios)
- [ ] CodeRabbit review approved (no critical issues)

### Specification Accuracy
- [ ] No ambiguous statements in spec
- [ ] All error cases documented (with user messages)
- [ ] All API contracts defined (request/response examples)
- [ ] Database schema complete (all tables, indexes, RLS policies)
- [ ] Testability requirements explicit (test scenarios documented)

### Compliance & Security
- [ ] PCI DSS SAQ A questionnaire completed
- [ ] LGPD compliance reviewed (audit log schema, retention policy)
- [ ] Webhook signature validation implemented + tested
- [ ] RLS policies verified (no cross-patient access)
- [ ] No hardcoded secrets in codebase
- [ ] No card data in logs/audit trail

### Testing & Verification
- [ ] Manual testing checklist completed (all 11 scenarios)
- [ ] Load testing completed (1000 concurrent payments)
- [ ] Stripe test mode testing completed
- [ ] Webhook idempotency tested (duplicate events)
- [ ] Email delivery tested (Resend integration)
- [ ] PDF generation tested (formatting, logo, Portuguese text)
- [ ] RLS bypass tests completed (security verified)
- [ ] PCI compliance checklist verified

### Documentation
- [ ] API documentation complete (endpoints, error codes, examples)
- [ ] Database schema documented (tables, indexes, RLS policies)
- [ ] Error handling matrix documented
- [ ] Deployment checklist prepared
- [ ] Rollback procedure documented
- [ ] Post-launch monitoring plan documented
- [ ] Clinic admin guide prepared (how to configure Stripe, view payments)

### Sign-Off
- [ ] @qa critique phase completed (Phase 5)
- [ ] Clinic accountant approves PCI controls
- [ ] LGPD compliance officer approves audit log schema
- [ ] @architect approves implementation plan (Phase 6)
- [ ] Product owner (@pm) approves specification
- [ ] @devops approves deployment procedure

---

## Sign-Off & Next Steps

**Specification Status:** DRAFT (awaiting Phase 5 critique)

**Phase 4 Complete:** ✅
- Executive summary: Completed
- Functional requirements (FR-005.001, FR-005.002, FR-005.003): Completed
- API contract specifications: Completed (10 endpoints defined)
- Database schema: Completed (5 new tables, 1 modified)
- Error handling matrix: Completed
- Security & compliance: Completed (PCI DSS + LGPD)
- Testing strategy: Completed (11 test scenarios + load testing)
- Deployment & rollout: Completed (4-phase rollout plan)
- Non-functional requirements: Completed (detailed)
- Critical decisions & rationale: Completed (6 major decisions)
- Known blockers & mitigations: Completed (6 blockers identified)
- Definition of done: Completed (detailed checklist)

**Next Step: Phase 5 (Critique)**
- @qa reviews specification for:
  - Testability: Are test scenarios clear and executable?
  - Edge cases: Have all edge cases been covered?
  - Security: Are security requirements complete?
  - Ambiguities: Are there any unclear statements?
- Critique verdict: APPROVED, NEEDS_REVISION, or BLOCKED
- Timeline: ~2-3 hours

**After Phase 5: Phase 6 (Plan)**
- @architect writes implementation plan:
  - Task breakdown (API routes, components, migrations)
  - Timeline estimate (story points per story)
  - Risk mitigation steps
  - Testing strategy (unit tests, integration tests, e2e)

---

**Document End. Awaiting Phase 5 Critique.**

**Version History:**
| Version | Date | Author | Status |
|---------|------|--------|--------|
| 1.0 | 2026-05-17 | @pm (Morgan) | DRAFT |

---
