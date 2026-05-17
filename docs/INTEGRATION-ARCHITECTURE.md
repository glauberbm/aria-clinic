# Integration Architecture — EPIC-004 Phase 3 (Backend Integration Planning)

**Document Type:** Architecture Planning (Design, no implementation)
**Phase:** Phase 3 (Post-MVP)
**Target Deployment:** 2026-06-15 (staging) → 2026-07-01 (production)
**Status:** 🔵 PLANNING — Security audit complete, integration path clear
**Security Ref:** See `docs/SECURITY-PHASE-2.md` for compliance requirements

---

## Executive Summary

This document maps the current **frontend-only mock architecture** (EPIC-004 Phase 2) to the **real backend integration architecture** (Phase 3). No implementation occurs in this document—only planning, configuration, and design decisions.

**Key transition points:**
- **Zustand mock store** → **Supabase PostgreSQL** (RLS + Row Level Security)
- **WhatsApp mock endpoint** → **Twilio API** (real SMS/WhatsApp send)
- **Client-side validation** → **API middleware** (CORS, rate limiting, auth)
- **Development environment** → **Staging → Production** deployment topology

**Deployment readiness target:** 2026-05-24 (staging phase 2 security fixes) → 2026-06-15 (backend ready) → 2026-07-01 (production cutover)

---

## Part 1: System Architecture — Phase 2 → Phase 3

### Current Architecture (Phase 2 MVP)

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER (Client-side only)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │  UI Components   │         │  Zustand Store   │        │
│  │  (React)         │◄────────│  (Mock Data)     │        │
│  │                  │         │                  │        │
│  │ • Calendar       │         │ • Appointments   │        │
│  │ • Appointment    │         │ • Doctors        │        │
│  │   Form           │         │ • Waitlist       │        │
│  │ • Reminders      │         │ • ReminderHist   │        │
│  │ • Waitlist       │         │                  │        │
│  │ • History        │         └──────────────────┘        │
│  │                  │                                      │
│  └──────────────────┘                                      │
│           │                                                │
│           │ (No network calls)                            │
│           │                                                │
│  ┌────────▼────────────────────────┐                     │
│  │   Mock Reminder Service         │                     │
│  │   (setTimeout 500ms)             │                     │
│  │   → returns { status: 'sent' }  │                     │
│  └─────────────────────────────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

No Backend | No Database | No Third-party APIs
```

**Key Characteristics:**
- ✅ 100% client-side state management
- ✅ No authentication required
- ✅ No network latency
- ✅ Perfect for testing UI/UX
- ❌ No data persistence (lost on refresh)
- ❌ No multi-user sync
- ❌ No real notifications

---

### Target Architecture (Phase 3 Production)

```
┌─────────────────────────────────────────────────────────┐
│                  NEXT.JS FRONTEND (App Router)           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  UI Components   │         │  React Query /   │     │
│  │  (React)         │◄────────│  Zustand + API   │     │
│  │                  │         │  Integration     │     │
│  │ • Calendar       │         │                  │     │
│  │ • Appointment    │         │ (Real-time sync) │     │
│  │   Form           │         └──────────────────┘     │
│  │ • Reminders      │                 │                │
│  │ • Waitlist       │                 │ HTTP/HTTPS     │
│  │ • History        │                 ▼                │
│  │ • Analytics      │         ┌──────────────────┐     │
│  │                  │         │   Next.js API    │     │
│  └──────────────────┘         │   Routes         │     │
│           │                   │                  │     │
│           │ Auth Token        │ • /api/auth/*    │     │
│           │ (JWT in cookie)   │ • /api/patient/* │     │
│           │                   │ • /api/scheduler │     │
│           │                   │ • /api/whatsapp  │     │
│           │                   │                  │     │
│           │                   └────────┬─────────┘     │
│           │                           │                │
│           │                           │ Middleware:   │
│           │                           │ • Auth check   │
│           │                           │ • CORS         │
│           │                           │ • Rate limit   │
│           │                           │ • Validation   │
│           │                           ▼                │
└───────────┼─────────────────────────────────────────────┘
            │
            │
            ├─────────────────────────────────────────────┐
            │                                             │
            ▼                                             │
    ┌──────────────────────┐                            │
    │   Supabase Backend   │                            │
    │   (PostgreSQL + RLS) │                            │
    │                      │                            │
    │ • appointments       │                            │
    │ • appointment_       │                            │
    │   reminders          │                            │
    │ • patients           │                            │
    │ • doctors            │                            │
    │ • clinics            │                            │
    │ • waitlist           │                            │
    │ • audit_logs         │                            │
    │                      │                            │
    │ RLS Policies:        │                            │
    │ • Patient access     │                            │
    │ • Staff access       │                            │
    │ • Clinic isolation   │                            │
    │                      │                            │
    └──────────────────────┘                            │
                                                        │
    ┌──────────────────────┐                           │
    │   Twilio API         │◄──────────────────────────┤
    │   (WhatsApp + SMS)   │
    │                      │
    │ • Message send       │
    │ • Webhook callbacks  │
    │ • Delivery tracking  │
    │ • Cost tracking      │
    │                      │
    └──────────────────────┘                           │
                                                       │
    ┌──────────────────────┐                           │
    │   Email Service      │◄──────────────────────────┤
    │   (SMTP / SendGrid)  │
    │                      │
    │ • OTP delivery       │
    │ • Appointment notif  │
    │ • Invoice delivery   │
    │ • Reminder emails    │
    │                      │
    └──────────────────────┘                           │
                                                       │
    ┌──────────────────────┐                           │
    │   Redis Cache        │◄──────────────────────────┤
    │   (Rate limiting)    │
    │                      │
    │ • Rate limit tokens  │
    │ • Session cache      │
    │ • Feature flags      │
    │                      │
    └──────────────────────┘

Production: Multi-region | Encrypted at rest | Scalable | Auditable
```

**Key Additions:**
- ✅ Persistent database (Supabase PostgreSQL)
- ✅ Multi-user synchronization (WebSockets Phase 3.2)
- ✅ Real authentication (Supabase Auth + JWT)
- ✅ Third-party integrations (Twilio, Email)
- ✅ Scalable infrastructure (API layer)
- ✅ Compliance features (RLS, audit logs, encryption)
- ✅ Error handling & retry logic

---

## Part 2: API Endpoint Mapping

### Current Endpoints (Phase 2 Mock)

These API routes exist but **are not called by the frontend** (frontend uses Zustand):

| Endpoint | Method | Purpose | Status (Phase 2) |
|----------|--------|---------|-----------------|
| `/api/patient/whatsapp/send-reminder` | POST | Send WhatsApp reminder | ❌ Not used (frontend mock) |
| `/api/patient/whatsapp/send-pending-reminders` | POST | Bulk send reminders | ❌ Not used |
| `/api/auth/login` | POST | Patient login | ✅ Used (auth entry point) |
| `/api/auth/logout` | POST | Patient logout | ✅ Used |
| `/api/patient/profile` | GET/POST | Patient data | ✅ Used (Phase 1 feature) |

---

### New Endpoints (Phase 3 — Scheduler Integration)

**Reminder:** These are PLANNED, not yet implemented.

#### A. Appointment Management

```
GET    /api/scheduler/appointments
├─ Query: ?month=2026-06&doctorId=UUID&status=scheduled
├─ Auth: Patient (own only) | Staff (clinic)
├─ Response: { appointments: Appointment[] }
└─ Rate limit: 100 req/min per IP

POST   /api/scheduler/appointments
├─ Body: { patientId, doctorId, date, timeStart, duration, notes }
├─ Auth: Staff only (manage_appointments role)
├─ Validation: Zod schema (see SECURITY-PHASE-2.md)
├─ DB Constraint: UNIQUE (doctor_id, date, time_start)
└─ Rate limit: 50 req/min per IP

GET    /api/scheduler/appointments/{appointmentId}
├─ Auth: Patient (own only) | Staff
└─ Rate limit: 200 req/min per IP

PUT    /api/scheduler/appointments/{appointmentId}
├─ Body: { status, notes, ... }
├─ Auth: Staff only
├─ Validation: Can only update pending fields (not date/doctor)
└─ Rate limit: 50 req/min per IP

DELETE /api/scheduler/appointments/{appointmentId}
├─ Query: ?reason=patient_requested
├─ Auth: Staff | Patient (own only if <24h before)
├─ Effect: Sets status='cancelled', triggers waitlist offer
└─ Rate limit: 20 req/min per IP
```

#### B. Reminder Management

```
POST   /api/scheduler/reminders/send
├─ Body: { appointmentId, reminderType: '24h' | '1h' }
├─ Auth: Staff only
├─ Service: Calls Twilio API
├─ Rate limit: 10 reminders/min per clinic (prevent flood)
└─ Response: { success, messageId, status }

GET    /api/scheduler/reminders/history
├─ Query: ?appointmentId=UUID&limit=50
├─ Auth: Staff
├─ Response: { reminders: ReminderHistory[] }
└─ Rate limit: 100 req/min per IP

POST   /api/scheduler/reminders/webhook
├─ Auth: Twilio signature validation (X-Twilio-Signature header)
├─ Body: Twilio callback (delivery status, read receipt, etc.)
├─ Effect: Updates reminder_history table
└─ Rate limit: None (Twilio is trusted)

PUT    /api/scheduler/reminders/settings
├─ Body: { enabled, timings: { dayBefore, hourBefore } }
├─ Auth: Staff
├─ Scope: Clinic-wide settings
└─ Rate limit: 5 req/min per IP
```

#### C. Waitlist Management

```
GET    /api/scheduler/waitlist
├─ Query: ?status=pending&doctorId=UUID
├─ Auth: Staff
└─ Response: { waitlist: WaitlistEntry[] }

POST   /api/scheduler/waitlist/add
├─ Body: { patientId, patientName, doctorId?, requestedDate?, notes }
├─ Auth: Staff | Unauthenticated (patient self-register)
├─ Validation: Phone validation (regex: /^\+55\d{10,11}$/)
└─ Rate limit: 20 req/min per IP

PUT    /api/scheduler/waitlist/{entryId}/offer
├─ Body: { offeredDate, offeredTime, doctorId }
├─ Effect: Sends WhatsApp to patient with offered slot
└─ Rate limit: 10 req/min per IP

PUT    /api/scheduler/waitlist/{entryId}/respond
├─ Body: { response: 'accepted' | 'declined' }
├─ Auth: Patient (own) | Unauthenticated (SMS callback)
├─ Effect: If accepted → creates appointment
└─ Rate limit: 5 req/min per IP

DELETE /api/scheduler/waitlist/{entryId}
├─ Auth: Staff | Patient (own only)
└─ Rate limit: 10 req/min per IP
```

#### D. Doctor Schedule

```
GET    /api/scheduler/doctors
├─ Query: ?clinic=UUID
├─ Auth: Any authenticated user
└─ Response: { doctors: Doctor[] }

GET    /api/scheduler/doctors/{doctorId}/availability
├─ Query: ?date=2026-06-15&duration=30
├─ Auth: Any authenticated user
└─ Response: { availableSlots: TimeSlot[] }

GET    /api/scheduler/doctors/{doctorId}/schedule
├─ Query: ?month=2026-06
├─ Auth: Staff | Doctor (own)
└─ Response: { appointments: Appointment[] }
```

#### E. Analytics & Export

```
GET    /api/scheduler/analytics
├─ Query: ?period=month&metric=appointments_per_doctor
├─ Auth: Staff (clinic_id in RLS)
└─ Response: { data: AnalyticsData[] }

GET    /api/scheduler/export
├─ Query: ?format=csv&month=2026-06
├─ Auth: Staff
├─ Service: Generate CSV with formula injection prevention
└─ Response: CSV file download
```

---

### Authorization & Rate Limiting Strategy

| Endpoint | Public | Patient | Staff | Admin | Rate Limit |
|----------|--------|---------|-------|-------|-----------|
| GET /appointments | ❌ | ✅ (own) | ✅ (clinic) | ✅ | 100/min |
| POST /appointments | ❌ | ❌ | ✅ | ✅ | 50/min |
| POST /reminders/send | ❌ | ❌ | ✅ | ✅ | 1/min/patient |
| POST /reminders/webhook | ✅ (Twilio signed) | ❌ | ❌ | ❌ | None |
| POST /waitlist/add | ✅ (unauthenticated) | ✅ | ✅ | ✅ | 20/min |
| PUT /waitlist/respond | ✅ (SMS callback) | ✅ | ❌ | ❌ | 5/min |

**Rate limit backend:** Redis (Upstash)
**Cache TTL:** 5 minutes per endpoint
**Burst allowance:** +20% over limit for 10 seconds

---

## Part 3: Database Schema — Phase 3

### Appointments Table

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),

  -- Appointment details
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes IN (15, 30, 60)),
  appointment_type VARCHAR(50) NOT NULL
    CHECK (appointment_type IN ('consultation', 'followup', 'procedure')),
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'noshow')),

  -- Metadata
  title TEXT NOT NULL,
  notes TEXT,
  location VARCHAR(255),

  -- Reminders
  reminder_sent_24h BOOLEAN DEFAULT false,
  reminder_sent_1h BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_reason TEXT,

  CONSTRAINT unique_doctor_slot UNIQUE (doctor_id, appointment_date, duration_minutes)
);

-- Indexes for performance
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_at ON appointments(created_at DESC);

-- RLS Policies
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own appointments"
  ON appointments FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Staff view clinic appointments"
  ON appointments FOR SELECT
  USING (clinic_id IN (SELECT id FROM clinics WHERE id = auth.user_id()::uuid));

CREATE POLICY "Staff create appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    clinic_id IN (SELECT id FROM clinics WHERE id = auth.user_id()::uuid)
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.clinic_id = clinic_id
      AND u.role IN ('staff', 'admin', 'manager')
    )
  );

CREATE POLICY "Staff update own clinic appointments"
  ON appointments FOR UPDATE
  USING (clinic_id IN (SELECT id FROM clinics WHERE id = auth.user_id()::uuid))
  WITH CHECK (clinic_id IN (SELECT id FROM clinics WHERE id = auth.user_id()::uuid));
```

### Reminder History Table

```sql
CREATE TABLE appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),

  -- Reminder details
  reminder_type VARCHAR(50) NOT NULL
    CHECK (reminder_type IN ('24h', '1h', 'manual')),
  channel VARCHAR(50) NOT NULL DEFAULT 'whatsapp'
    CHECK (channel IN ('whatsapp', 'sms', 'email')),

  -- Twilio integration
  message_id VARCHAR(255) UNIQUE,
  phone_number_encrypted BYTEA NOT NULL, -- Encrypted with pgp_sym_encrypt
  message_body TEXT,

  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,

  -- Metrics
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE (appointment_id, reminder_type) -- Prevent duplicate reminders
);

CREATE INDEX idx_appointment_reminders_appointment_id
  ON appointment_reminders(appointment_id);
CREATE INDEX idx_appointment_reminders_patient_id
  ON appointment_reminders(patient_id);
CREATE INDEX idx_appointment_reminders_status
  ON appointment_reminders(status);
CREATE INDEX idx_appointment_reminders_sent_at
  ON appointment_reminders(sent_at DESC);

-- RLS
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own reminders"
  ON appointment_reminders FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Staff view clinic reminders"
  ON appointment_reminders FOR SELECT
  USING (clinic_id IN (SELECT id FROM clinics WHERE id = auth.user_id()::uuid));
```

### Waitlist Table

```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID REFERENCES patients(id),

  -- Patient info (for unauthenticated signups)
  patient_name VARCHAR(255) NOT NULL,
  patient_phone_encrypted BYTEA NOT NULL,
  patient_email VARCHAR(255),

  -- Preferences
  preferred_doctor_id UUID REFERENCES doctors(id),
  preferred_date DATE,
  preferred_time TIME,
  notes TEXT,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'offered', 'accepted', 'declined', 'fulfilled')),

  -- Offered slot (when staff offers appointment)
  offered_appointment_id UUID REFERENCES appointments(id),
  offered_at TIMESTAMP WITH TIME ZONE,
  response_deadline TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  response_status VARCHAR(50) CHECK (response_status IN ('accepted', 'declined')),

  -- Result
  created_appointment_id UUID REFERENCES appointments(id),

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  CONSTRAINT not_both_patient_types CHECK (
    (patient_id IS NOT NULL AND patient_phone_encrypted IS NULL)
    OR (patient_id IS NULL AND patient_phone_encrypted IS NOT NULL)
  )
);

CREATE INDEX idx_waitlist_clinic_id ON waitlist(clinic_id);
CREATE INDEX idx_waitlist_patient_id ON waitlist(patient_id);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);

-- RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own waitlist entries"
  ON waitlist FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Staff view clinic waitlist"
  ON waitlist FOR SELECT
  USING (clinic_id IN (SELECT id FROM clinics WHERE id = auth.user_id()::uuid));

CREATE POLICY "Anyone can add to waitlist (unauthenticated)"
  ON waitlist FOR INSERT
  WITH CHECK (clinic_id IS NOT NULL);
```

---

## Part 4: Third-Party Service Integration

### A. Twilio WhatsApp Integration

**Current State (Phase 2):** Mock function returning `{ status: 'sent', messageId: 'mock-123' }` after 500ms delay.

**Phase 3 Implementation Plan:**

#### Account Setup

1. **Create Twilio Account**
   - Go to twilio.com
   - Sign up for WhatsApp Sandbox or production number
   - Get Account SID + Auth Token
   - Request WhatsApp Sender ID (takes 2-5 days for production)

2. **Environment Variables**
   ```env
   # Supabase Vault (NOT .env file)
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_NUMBER=+1234567890
   TWILIO_WEBHOOK_SECRET=your_webhook_signing_key
   ```

3. **Node Module**
   ```bash
   npm install twilio
   ```

#### Service Integration (Pseudo-code)

```typescript
// lib/services/twilio.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

interface SendReminderInput {
  patientPhone: string; // Format: +55XXXXXXXXXXX
  message: string;
  appointmentId: string;
  messageType: 'reminder' | 'offer' | 'confirmation';
}

export async function sendWhatsAppReminder(input: SendReminderInput) {
  try {
    // 1. Rate limiting check (Redis)
    const allowed = await checkRateLimit(
      `reminder:${input.patientPhone}`,
      1, // 1 reminder per patient
      60  // within 60 seconds
    );
    if (!allowed) throw new Error('Too many reminders sent recently');

    // 2. Send message via Twilio
    const message = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${input.patientPhone}`,
      body: input.message,
      // Optional: use template for production
      // contentSid: 'HX...' // Pre-approved Twilio template
    });

    // 3. Log to database
    await supabase.from('appointment_reminders').insert({
      appointment_id: input.appointmentId,
      message_id: message.sid,
      status: 'sent',
      sent_at: new Date(),
    });

    return { success: true, messageId: message.sid };
  } catch (error) {
    // 4. Log error
    await supabase.from('appointment_reminders').insert({
      appointment_id: input.appointmentId,
      status: 'failed',
      error_message: error.message,
      failed_at: new Date(),
    });
    return { success: false, error: error.message };
  }
}
```

#### Webhook for Delivery Tracking

```typescript
// app/api/webhooks/twilio/route.ts
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('X-Twilio-Signature') || '';
  const body = await request.text();

  // 1. Validate Twilio signature
  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    process.env.TWILIO_WEBHOOK_URL!,
    body
  );

  if (!isValid) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  // 2. Parse webhook
  const data = new URLSearchParams(body);
  const messageId = data.get('MessageSid');
  const status = data.get('MessageStatus'); // 'sent', 'delivered', 'read', 'failed'
  const errorCode = data.get('ErrorCode');

  // 3. Update database
  await supabase
    .from('appointment_reminders')
    .update({
      status,
      delivered_at: status === 'delivered' ? new Date() : null,
      error_message: errorCode ? `Twilio error ${errorCode}` : null,
    })
    .eq('message_id', messageId);

  return NextResponse.json({ success: true });
}
```

#### Cost & Limits

| Metric | Limit | Cost | Notes |
|--------|-------|------|-------|
| WhatsApp messages | 1000/day for sandbox | ~$0.0075/msg prod | $0.20 per conversation start |
| SMS fallback | Unlimited | ~$0.0075/msg | Use only if WhatsApp fails |
| Webhook retries | 5 (exponential backoff) | Included | Twilio retries automatically |
| Rate limiting | 60 msgs/min per account | Included | API-level limit |

**Recommendation:** Use sandbox for staging, production number for prod.

---

### B. Email Service Integration (SMTP / SendGrid)

**Use Case:** OTP delivery, appointment confirmations, reminders, invoices.

#### Setup

1. **Choose Provider**
   - **Option A: SendGrid** (recommended)
     - Free tier: 100 emails/day
     - Production: ~$10/month for 40K emails
     - API-based (no SMTP config needed)

   - **Option B: AWS SES**
     - Free tier: 62K emails/month to verified addresses
     - ~$0.10 per 1K emails
     - SMTP-based

2. **Environment Variables**
   ```env
   # For SendGrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@ariaclinic.com

   # For AWS SES
   AWS_SES_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SES_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   AWS_SES_REGION=us-east-1
   AWS_SES_FROM_EMAIL=noreply@ariaclinic.com
   ```

3. **Node Module**
   ```bash
   # For SendGrid
   npm install @sendgrid/mail

   # For AWS SES
   npm install @aws-sdk/client-ses
   ```

#### Service Integration (SendGrid)

```typescript
// lib/services/email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface SendEmailInput {
  to: string;
  subject: string;
  template: 'appointment_reminder' | 'appointment_confirmation' | 'otp';
  data: Record<string, any>;
}

export async function sendEmail(input: SendEmailInput) {
  const templates: Record<string, string> = {
    appointment_reminder: 'd-abc123def456', // Twilio template ID
    appointment_confirmation: 'd-xyz789uvw012',
    otp: 'd-otp123456789',
  };

  try {
    await sgMail.send({
      to: input.to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      templateId: templates[input.template],
      dynamicTemplateData: input.data,
      // Optional: track clicks/opens
      trackingSettings: {
        clickTracking: { enabled: true },
        openTracking: { enabled: true },
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error: error.message };
  }
}
```

#### Email Templates (Pre-approved for compliance)

| Template | Use Case | Variables | Priority |
|----------|----------|-----------|----------|
| `appointment_reminder` | 24h/1h before appointment | patientName, doctorName, appointmentDate, appointmentTime | High |
| `appointment_confirmation` | Immediately after booking | patientName, appointmentId, confirmationLink | High |
| `waitlist_offer` | When slot becomes available | patientName, offeredDate, offeredTime, responseUrl | Medium |
| `otp` | Patient login OTP | otp, expiresIn | High |
| `invoice` | After appointment completed | patientName, amount, billNumber | Low (Phase 3.2) |

---

### C. Redis Cache (Upstash)

**Use Cases:**
1. Rate limiting (per-IP, per-patient, per-endpoint)
2. Session cache (optional, for performance)
3. Feature flags
4. Temporary state (reminder scheduling)

#### Setup

```bash
# Install client
npm install @upstash/redis

# Or use environment variable
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

#### Rate Limiting Utility

```typescript
// lib/rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  return count <= limit;
}

// Usage in API routes
const allowed = await checkRateLimit(`reminder:${patientPhone}`, 1, 60);
if (!allowed) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  );
}
```

---

## Part 5: Deployment Architecture

### Development Environment

```
┌──────────────────────┐
│  Developer Machine   │
├──────────────────────┤
│                      │
│  Next.js (local)     │
│  :3000               │
│         │            │
│         ▼            │
│  Supabase (local)    │
│  or staging           │
│                      │
│  .env.local:         │
│  • NEXT_PUBLIC_      │
│    SUPABASE_URL=     │
│    localhost          │
│  • TWILIO_SANDBOX    │
│  • SendGrid API key  │
│                      │
└──────────────────────┘

No external auth | Mock WhatsApp | Local DB
```

### Staging Environment

```
┌──────────────────────────────────────────┐
│         AWS / Vercel Staging             │
├──────────────────────────────────────────┤
│                                          │
│  Vercel Edge:                           │
│  aria-staging.vercel.app                │
│         │                                │
│         ├─► Next.js API Routes          │
│         │   (Middleware: Auth, CORS)    │
│         │                                │
│         └─► Supabase (staging project) │
│             PostgreSQL (RLS enabled)    │
│             Auth (email/password)       │
│                                         │
│  .env.staging:                          │
│  • NEXT_PUBLIC_SUPABASE_URL=            │
│    https://xxxxx-staging.supabase.co   │
│  • TWILIO_SANDBOX (shared testing)     │
│  • SendGrid staging account            │
│  • Upstash Redis instance              │
│                                         │
│  Monitoring:                            │
│  • Sentry error tracking               │
│  • Vercel analytics                    │
│  • Supabase dashboard                  │
│                                         │
└──────────────────────────────────────────┘

Real database | Sandbox APIs | Rate limiting enabled
```

### Production Environment

```
┌──────────────────────────────────────────┐
│          AWS / Vercel Production         │
├──────────────────────────────────────────┤
│                                          │
│  Vercel Edge (auto-scaling):            │
│  aria.ariaclinic.com                    │
│         │                                │
│         ├─► Next.js API Routes          │
│         │   (Middleware: Auth, CORS,    │
│         │    Rate limit, Validation)    │
│         │                                │
│         ├─► Supabase (production)       │
│         │   PostgreSQL (RLS, backup)   │
│         │   Auth (email/password + SSO)│
│         │   Encrypted at rest (PII)    │
│         │                               │
│         ├─► Twilio (production)         │
│         │   Real WhatsApp number       │
│         │   SMS fallback               │
│         │                               │
│         ├─► SendGrid production         │
│         │   Email (OTP, confirmations) │
│         │                               │
│         └─► Upstash Redis               │
│             Rate limiting               │
│             Session cache               │
│                                         │
│  .env.production:                       │
│  • NEXT_PUBLIC_SUPABASE_URL=            │
│    https://xxxxx-prod.supabase.co      │
│  • TWILIO_ACCOUNT_SID / AUTH_TOKEN     │
│  • SendGrid API key                    │
│  • Upstash Redis                       │
│  • Sentry DSN                          │
│  • DataDog monitoring (optional)        │
│                                         │
│  Security:                              │
│  • WAF (AWS WAF or Vercel)             │
│  • DDoS protection (Cloudflare)         │
│  • Encryption in transit (HTTPS)        │
│  • Encryption at rest (pgcrypto)        │
│  • Audit logs (all API calls)          │
│  • Backups (automated daily)           │
│  • Disaster recovery (multi-region)     │
│                                         │
└──────────────────────────────────────────┘

Production-grade | Encrypted | Redundant | Compliant
```

---

## Part 6: Environment Configuration

### .env File Structure

```env
# ===== SUPABASE =====
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... # Public key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Secret key (server-only)

# ===== TWILIO =====
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155552671 # Sandbox: +1234567890
TWILIO_WEBHOOK_SECRET=your_webhook_secret
TWILIO_WEBHOOK_URL=https://aria.ariaclinic.com/api/webhooks/twilio

# ===== EMAIL SERVICE =====
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@ariaclinic.com
# OR AWS SES
AWS_SES_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@ariaclinic.com
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxx

# ===== REDIS CACHE =====
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# ===== APP CONFIG =====
NEXT_PUBLIC_APP_URL=https://aria.ariaclinic.com
NODE_ENV=production

# ===== MONITORING =====
SENTRY_DSN=https://xxxxx@sentry.io/12345
SENTRY_ENVIRONMENT=production

# ===== FEATURE FLAGS =====
NEXT_PUBLIC_FEATURE_SCHEDULER=true
NEXT_PUBLIC_FEATURE_REMINDERS=true
NEXT_PUBLIC_FEATURE_WAITLIST=true
NEXT_PUBLIC_FEATURE_ANALYTICS=false # Phase 3.2
```

### Environment-Specific Secrets

| Secret | Development | Staging | Production |
|--------|-------------|---------|------------|
| Supabase URL | localhost | staging.supabase.co | prod.supabase.co |
| Twilio SID | Sandbox | Sandbox | Production |
| SendGrid API | Dev account | Dev account | Prod account |
| Redis instance | Optional | Required | Required |
| Sentry DSN | None | staging | production |
| Encryption key (PII) | Plain | KMS staging | KMS prod |

**Storage:** Use Supabase Vault (not .env) for production secrets.

---

## Part 7: Integration Readiness Checklist

### Phase 2 → Phase 3 Transition Checklist

#### A. Backend Infrastructure (Week 1 of Phase 3)

- [ ] Create Supabase production project (separate from staging)
- [ ] Run migrations (appointments, reminders, waitlist tables)
- [ ] Enable RLS on all tables
- [ ] Test RLS policies (patient isolation, staff access)
- [ ] Create backup strategy (daily snapshots)
- [ ] Set up monitoring (Supabase dashboard, Sentry)
- [ ] Configure CORS headers utility
- [ ] Implement rate limiting with Redis
- [ ] Create middleware for request validation

#### B. Third-Party Services Setup (Week 1)

- [ ] Create Twilio production account
- [ ] Request WhatsApp sender ID (takes 2-5 days)
- [ ] Set up webhook endpoint for Twilio callbacks
- [ ] Create SendGrid account and email templates
- [ ] Test Twilio sandbox (send test messages)
- [ ] Test SendGrid template delivery
- [ ] Set up Upstash Redis instance
- [ ] Document rate limiting strategy

#### C. API Implementation (Week 2)

- [ ] Implement `/api/scheduler/appointments` (GET, POST, PUT, DELETE)
- [ ] Implement `/api/scheduler/reminders/*`
- [ ] Implement `/api/scheduler/waitlist/*`
- [ ] Implement Twilio webhook handler
- [ ] Implement SendGrid integration
- [ ] Add rate limiting to all endpoints
- [ ] Add input validation (Zod schemas)
- [ ] Add error handling and logging
- [ ] Test with Postman / cURL

#### D. Frontend Integration (Week 2-3)

- [ ] Replace Zustand mock with React Query / SWR
- [ ] Wire up GET endpoints (fetch appointments)
- [ ] Wire up POST endpoints (create/update)
- [ ] Add loading states
- [ ] Add error handling and user feedback
- [ ] Update reminder service to call real API
- [ ] Test optimistic updates
- [ ] Test error scenarios

#### E. Security Hardening (Week 1-2)

- [ ] Apply all P1 security fixes (see SECURITY-PHASE-2.md)
  - [ ] CORS headers
  - [ ] Rate limiting
  - [ ] Phone validation
  - [ ] Template escaping
- [ ] Enable audit logging
- [ ] Test SQL injection scenarios
- [ ] Test XSS scenarios
- [ ] Test CSRF protection
- [ ] Run CodeQL static analysis
- [ ] Penetration testing (staging)

#### F. Testing & QA (Week 3)

- [ ] Unit tests for API endpoints
- [ ] Integration tests (DB + API)
- [ ] E2E tests (UI → API → DB)
- [ ] Load testing (100+ concurrent users)
- [ ] Security testing (manual penetration)
- [ ] Real-world SMS/WhatsApp test (verify delivery)
- [ ] Multi-user sync test (WebSockets Phase 3.2)
- [ ] Failover testing (service degradation)

#### G. Deployment & Monitoring (Week 3)

- [ ] Set up GitHub Actions / CD pipeline
- [ ] Deploy to staging
- [ ] Verify staging deployment
- [ ] Run smoke tests
- [ ] Set up alerts (error rates, latency)
- [ ] Document runbook (incident response)
- [ ] Create deployment checklist
- [ ] Plan blue-green deployment strategy

#### H. Compliance & Documentation (Ongoing)

- [ ] HIPAA data handling documentation
- [ ] LGPD consent form
- [ ] Privacy policy update
- [ ] Data retention policy
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Deployment guide
- [ ] Disaster recovery procedure
- [ ] Cost tracking (Twilio, SendGrid, Upstash)

---

## Part 8: Go-Live Timeline

### Phase 3 — Backend Integration (6 weeks)

```
Week 1 (May 17 - May 23)
├─ Supabase staging setup + RLS
├─ Twilio + SendGrid accounts
├─ Redis instance + rate limiting utility
└─ CORS + validation middleware

Week 2 (May 24 - May 30)
├─ API endpoints (appointments, reminders, waitlist)
├─ Twilio webhook handler
├─ Security hardening (P1 fixes)
└─ Unit & integration tests

Week 3 (May 31 - Jun 06)
├─ Frontend integration (React Query)
├─ E2E testing
├─ Load testing (100 users)
└─ Security penetration test

Week 4 (Jun 07 - Jun 13)
├─ Staging deployment
├─ Smoke tests
├─ Documentation
└─ Incident response drills

Week 5 (Jun 14 - Jun 20)
├─ Blue-green setup (production)
├─ Final security audit
├─ Compliance check (HIPAA/LGPD)
└─ Go-live prep

Week 6 (Jun 21 - Jun 27)
├─ Canary deployment (10% traffic)
├─ Monitor error rates / latency
├─ Scale to 100% traffic
└─ Post-deployment monitoring
```

### Critical Dates

| Date | Milestone | Blocker? |
|------|-----------|----------|
| 2026-05-24 | Staging deployment (EPIC-004 P1 security fixes) | YES |
| 2026-05-31 | Phase 3 backend development starts | NO |
| 2026-06-15 | Phase 3 backend complete, staging ready | YES (for prod) |
| 2026-06-20 | Security audit complete, compliance signed | YES (for prod) |
| 2026-06-27 | Production go-live | Soft launch |
| 2026-07-01 | Full production with monitoring | Hard cutover |

---

## Part 9: Cost Projections

### Monthly Recurring Costs (Production)

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| **Supabase** | Pay-as-you-go | $25-100 | 1M requests = $25/month |
| **Twilio** | WhatsApp + SMS | $0.0075/msg | 10K reminders/month = $75 |
| **SendGrid** | Transactional | $10/month | 40K emails/month included |
| **Upstash Redis** | Free or $7/month | $0-7 | 10M ops/month = free tier |
| **Vercel** | Pro | $20/month | Auto-scaling, analytics |
| **Sentry** | Team | $29/month | 1M events/month |
| **AWS WAF** | Per-rule | ~$5/month | DDoS protection |
| **Backups** | Supabase auto | Included | — |
| **CDN** | Vercel edge | Included | — |
| **Monitoring** | Vercel + Supabase | Included | — |
| | | | |
| **TOTAL** | | **$170-245/month** | ~$2K/year |

### One-Time Costs (Phase 3)

| Item | Cost | Notes |
|------|------|-------|
| Twilio WhatsApp number setup | $200-500 | One-time approval fee |
| SendGrid IP warm-up | $0 | Free, takes 2 weeks |
| Supabase prod project setup | $0 | Free |
| Security audit (external) | $5K-10K | Optional, recommended |
| Load testing tools | $0 | Open source (k6, JMeter) |

---

## Part 10: Risk Mitigation & Contingencies

### Known Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Twilio approval delay** | Medium | High (blocks reminders) | Request 2 weeks early, start with sandbox |
| **RLS policy bugs** | Low | Critical (data leak) | Thorough testing, code review, audit |
| **API rate limit abuse** | Low | Medium (DoS) | Redis rate limiting, IP blocking, alerts |
| **Encryption key loss** | Very Low | Critical (data loss) | Vault backup, HSM (Phase 3.2), access logs |
| **Database migration failure** | Very Low | Critical (downtime) | Backup first, test on staging, rollback plan |
| **Webhook timeout loops** | Low | Medium (spam) | Idempotency keys, dead-letter queue |
| **Third-party API outage** | Medium | Medium (degraded service) | Fallback channels, queue system, retry logic |

### Fallback Strategies

**If Twilio WhatsApp fails:**
- Fallback to SMS (same Twilio, cheaper)
- Fallback to email (SendGrid)
- Manual follow-up via staff

**If Supabase database down:**
- Read-only cache (Redis)
- Queued writes (Bull queue)
- Display cached appointment data
- Return 503 Service Unavailable (don't allow new bookings)

**If SendGrid email fails:**
- Fallback to AWS SES
- Log to database, retry with exponential backoff
- Alert staff to follow up manually

---

## Part 11: Conclusion & Sign-Off

### Summary

This document maps the **frontend-only Phase 2** architecture to a **production-grade Phase 3 backend** system with:

✅ **Persistent database** (Supabase PostgreSQL with RLS)
✅ **Real-time notifications** (Twilio WhatsApp + SMS)
✅ **Email service** (SendGrid for OTP/confirmations)
✅ **Scalable API** (Next.js routes + middleware)
✅ **Security hardening** (CORS, rate limiting, input validation, encryption)
✅ **Compliance** (HIPAA/LGPD, audit logging, data retention)
✅ **Monitoring** (Sentry, Vercel analytics, Supabase dashboard)

### Next Steps (Before Phase 3 Implementation)

1. **Architect approval:** ✅ Document complete (this document)
2. **Security review:** ✅ Reference SECURITY-PHASE-2.md (4 P1 blockers for staging)
3. **DevOps planning:** @devops to review deployment architecture, create CI/CD pipeline
4. **Cost approval:** Budget $170-245/month for production + $5K for initial Twilio setup
5. **Compliance sign-off:** Legal to review HIPAA/LGPD requirements, approve RLS policies

### Target Deployment

- **Staging:** 2026-05-24 (with Phase 2 security fixes)
- **Production:** 2026-07-01 (with Phase 3 backend complete)

---

**Document Status:** ✅ Ready for implementation
**Created by:** @architect
**Date:** 2026-05-16 23:30 UTC
**Review Schedule:** Update before each deployment phase

---

## Appendix A: API Response Examples

### Example: Create Appointment

**Request:**
```bash
POST /api/scheduler/appointments HTTP/1.1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "patientId": "550e8400-e29b-41d4-a716-446655440000",
  "doctorId": "650e8400-e29b-41d4-a716-446655440001",
  "appointmentDate": "2026-06-15T14:30:00Z",
  "durationMinutes": 30,
  "appointmentType": "consultation",
  "title": "Regular checkup",
  "notes": "Patient requested morning slot"
}
```

**Response (200 OK):**
```json
{
  "id": "750e8400-e29b-41d4-a716-446655440002",
  "status": "scheduled",
  "createdAt": "2026-05-16T23:30:00Z",
  "message": "Appointment created successfully"
}
```

**Response (429 Too Many Requests):**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

### Example: Send Reminder via Webhook

**Webhook Callback from Twilio:**
```json
{
  "MessageSid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "MessageStatus": "delivered",
  "To": "+551234567890",
  "AccountSid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

---

## Appendix B: References

- **Security Audit:** `docs/SECURITY-PHASE-2.md`
- **EPIC-004 Architecture:** `docs/EPIC-004-ARCHITECTURE.md`
- **Database Schema:** `docs/SCHEMA.md`
- **Supabase Setup:** `docs/SUPABASE-SETUP.md`
- **Twilio Docs:** https://www.twilio.com/docs/whatsapp
- **Supabase RLS:** https://supabase.com/docs/auth/row-level-security
- **Next.js API Routes:** https://nextjs.org/docs/api-routes/introduction
