# Security Audit — EPIC-004 Phase 2 (Scheduler & Appointments)

**Status:** ⚠️ CONDITIONAL APPROVAL
**Audit Date:** 2026-05-16
**Scope:** Frontend implementation + integration points
**Target Deployment:** 2026-05-24 (staging)

---

## Executive Summary

EPIC-004 is **frontend-only with mock data**, so direct security risks are **LOW**. However, **critical gaps exist at integration points** (API authentication, CORS, rate limiting, data encryption) that must be addressed before production deployment.

**Verdict:** ✅ **MVP-safe** | ⚠️ **Production-blocked** until integration fixes applied.

---

## 1. RLS (Row-Level Security) Review

### EPIC-004 Exposure
- **Frontend-only scheduler**: No direct database access
- **Mock data**: 25 hardcoded appointments in Zustand store
- **No RLS impact yet**: Scheduler doesn't call `/api/scheduler/*` endpoints

### Staging Integration Risk (Phase 3)
When real appointments table is queried:
- ✅ **Current RLS in codebase**: `migrations/20260520000001_fix_rls.sql` has CORRECT policies
  - `user_id = auth.uid()` for patient records
  - `clinic_id + role` check for staff
- ⚠️ **New scheduler table** (if created): Must inherit same RLS pattern

### Required Actions
- [ ] **Add to data-engineer checklist**: When `appointments` table is created, RLS policy must be:
  ```sql
  CREATE POLICY "Patients view own appointments"
  ON appointments FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

  CREATE POLICY "Staff view clinic appointments"
  ON appointments FOR SELECT
  USING (clinic_id IN (SELECT id FROM clinics WHERE id = auth.user_id()::uuid));
  ```
- [ ] **Audit existing tables** (phase 3): Verify `appointments`, `appointment_reminders`, `waitlist` have RLS enabled

---

## 2. API Security Analysis

### CORS Configuration
**Status:** ❌ **NOT CONFIGURED**

**Current State:**
- `next.config.ts`: Empty (no CORS headers)
- `middleware.ts`: Auth-only, no CORS handling
- Existing API routes: No CORS headers

**Risk Level:** 🔴 **MEDIUM** (non-blocking for same-origin requests)

**Required Actions:**
- [ ] **Create global CORS utility** (`lib/cors.ts`):
  ```typescript
  export function setCORSHeaders(response: NextResponse, origin: string): NextResponse {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL, // e.g., https://app.ariacle.com
      'http://localhost:3000', // Dev
    ];

    if (allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400');
    }
    return response;
  }
  ```
- [ ] **Apply to all `/api/*` routes** (priority: auth, patient, scheduler)
- [ ] **Update next.config.ts** (if static CORS needed)
- [ ] **Test staging deployment** (cross-origin calls from different domain)

**Timeline:** P1 (blocking staging push) — 2-3h implementation

---

### Rate Limiting

**Status:** ❌ **NOT IMPLEMENTED**

**Critical Endpoints (at risk):**
- `POST /api/patient/whatsapp/send-reminder` — Currently 0 protection
  - **Attack scenario:** Flood patient with reminders, exhaust WhatsApp API quota
  - **Fix required:** Max 1 reminder per appointment per minute; 10 requests/hour per IP

- `POST /api/auth/register`, `POST /api/auth/login` — Already have basic in-memory check
  - ✅ Current code: `failedAttempts.get(email)?.count`
  - ⚠️ Issue: In-memory only, resets on server restart

**Required Actions:**
- [ ] **Upgrade in-memory rate limit to Redis** (staging has Redis available):
  ```typescript
  // lib/rate-limit.ts
  import { Redis } from '@upstash/redis';

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  export async function checkRateLimit(key: string, limit: number, windowSecs: number) {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSecs);
    }
    return count <= limit;
  }
  ```
- [ ] **Apply to WhatsApp endpoint:**
  ```typescript
  const allowed = await checkRateLimit(`reminder:${patientId}`, 1, 60);
  if (!allowed) return NextResponse.json({error: 'Too many requests'}, {status: 429});
  ```
- [ ] **Add to `/api/auth/*` endpoints** (upgrade existing)

**Timeline:** P1 (blocking staging) — 2-4h implementation + Redis setup

---

### Input Validation & Sanitization

**Status:** 🟡 **PARTIAL**

**Good:**
- ✅ `appointmentFormSchema` (Zod): Patient name (1-100 chars), date (future only), time (HH:MM regex), duration enum
- ✅ Patient name length validation (100 char max)
- ✅ Notes field sanitized (500 char max)

**Gaps:**
- ❌ **Phone number validation**: `patientPhone` stored as `+55XXXXXXXXXXX` but no regex validation
  - Risk: Injection via phone field if passed to SMS/WhatsApp
  - Fix: Add Zod regex: `.regex(/^\+55\d{10,11}$/, "Invalid BR phone")`

- ❌ **Template injection** in `lib/utils/reminder.ts` (`fillTemplate`):
  ```typescript
  // Current (vulnerable to partial XSS if patient name contains {{):
  result = result.replace(/\{\{PATIENT\}\}/g, appointment.patientName);

  // Should escape or use safer method:
  const escaped = appointment.patientName.replace(/{{|}}/g, '');
  result = result.replace(/\{\{PATIENT\}\}/g, escaped);
  ```

- ❌ **Doctor ID validation**: UUID check exists in schema, but no verification doctor exists
  - When added to real DB: Must check `doctorId IN (SELECT id FROM doctors WHERE clinic_id = auth.clinic_id())`

**Required Actions:**
- [ ] **Update `appointment.ts` validation**:
  ```typescript
  patientPhone: z
    .string()
    .regex(/^\+55\d{10,11}$/, "Invalid Brazilian phone number")
  ```
- [ ] **Update `reminder.ts` template escaping**:
  ```typescript
  // Escape template placeholders to prevent injection
  const escapeTemplate = (text: string) => text.replace(/[{}]/g, '');
  result = result.replace(/\{\{PATIENT\}\}/g, escapeTemplate(appointment.patientName));
  ```
- [ ] **Add backend validator** (Phase 3): Doctor exists + belongs to clinic

**Timeline:** P1 (blocking staging) — 1-2h implementation

---

## 3. Data Encryption & PII Protection

### Current State

**In Mock Data (EPIC-004):**
- Patient names: Plaintext (acceptable for MVP)
- Phone numbers: Plaintext in Zustand store (acceptable for client-side)
- Notes: Plaintext (acceptable)

**In Production APIs (existing):**
- CPF: ❌ **Stored in plaintext** in `patients` table
  - Fix: Already documented in SECURITY-AUDIT-MVP.md, P2 after Phase 1
  - Status: Use Supabase `pgcrypto` extension (ALREADY AVAILABLE)

**Risk Assessment:**
- 🟡 **Phase 2 (MVP):** Mock data = no real PII, safe
- 🔴 **Phase 3 (Production):** Real appointments will include patient phone + CPF + medical notes
  - Must encrypt at rest using Supabase `pgsodium` (PostgreSQL encryption)

### Required Actions (for Phase 3)
- [ ] **Encrypt patient phone at rest:**
  ```sql
  ALTER TABLE appointments
  ADD COLUMN patient_phone_encrypted bytea;

  UPDATE appointments
  SET patient_phone_encrypted = pgp_sym_encrypt(patient_phone, 'clinic-secret-key')
  WHERE patient_phone IS NOT NULL;
  ```
- [ ] **Create encryption keys** (AWS Secrets Manager or Supabase Vault)
- [ ] **Audit migration:** Ensure old plaintext phone is deleted post-encryption
- [ ] **Add decrypt-on-read** in backend queries
  ```sql
  SELECT
    id,
    pgp_sym_decrypt(patient_phone_encrypted, 'clinic-secret-key') as patient_phone
  FROM appointments;
  ```

**Timeline:** P2 (Phase 3, pre-production) — 4-6h implementation

---

## 4. WhatsApp Integration Security

### Current Implementation

**Phase 2 (Mock - EPIC-004):**
- ✅ `lib/utils/reminder.ts`: 500ms delay promise (safe mock)
- ✅ No actual API calls or credentials exposed

**Phase 3 (Real API):**
- 🔴 **Twilio integration** required — multiple attack surfaces

### Phase 3 Security Checklist

**Authentication & Secrets:**
- [ ] Store Twilio API key in **Supabase Vault** (NOT `.env`)
- [ ] Rotate keys every 90 days
- [ ] Use environment-specific keys (dev, staging, prod)
- [ ] No secrets in logs

**Request Validation:**
- [ ] **Webhook signature verification** (Twilio signs all webhooks with X-Twilio-Signature):
  ```typescript
  import twilio from 'twilio';
  const validateTwilioRequest = (request: NextRequest, url: string) => {
    const signature = request.headers.get('X-Twilio-Signature') || '';
    const isValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN!,
      signature,
      url,
      req.body // Raw body required
    );
    if (!isValid) throw new Error('Invalid Twilio signature');
  };
  ```

**Rate Limiting:**
- [ ] Max 1 reminder send per patient per 5 minutes (prevent spam)
- [ ] Max 100 reminders/minute per clinic (catch bulk attacks)

**Data Sanitization:**
- [ ] **Phone number**: Validate international format
- [ ] **Message body**: Escape special chars, max 160 chars for SMS
- [ ] **Patient name**: Remove @ symbols (WhatsApp format)

**Logging & Monitoring:**
- [ ] **Never log full phone numbers** (log last 4 digits only: `****1234`)
- [ ] **Never log message content** (log only: `message_id`, `status`, `timestamp`)
- [ ] **Alert on failures**: 3+ consecutive failed sends = page oncall

### Risk: SMS Injection

**Attack:** If patient name contains template placeholders:
```
Patient Name: "Paciente {{PROCEDURE}}"
Result: "Oi Paciente procedimento, sua consulta é..."
```

**Current Protection:** ❌ None
**Fix (P1):** Apply escaping from section 2

---

## 5. Frontend Security Hardening (EPIC-004)

### XSS Prevention

**Status:** 🟢 **GOOD** (React auto-escapes)

- ✅ All user input rendered via React JSX (auto-escaped)
- ✅ No `dangerouslySetInnerHTML` usage
- ✅ Zod validation prevents injection at form boundary

**One Gap:**
- ❌ CSV export (`lib/utils/export.ts`): Need verify CSV doesn't allow formula injection

**Check Required:**
```typescript
// Ensure numbers starting with =, +, @ are quoted:
const escapeCSV = (value: any) => {
  const str = String(value);
  if (/^[=+@-]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return `"${str.replace(/"/g, '""')}"`;
};
```

---

### CSRF Prevention

**Status:** ✅ **PROTECTED** (Next.js cookies + SameSite)

- ✅ Middleware validates auth token from cookies
- ✅ Cookies are HttpOnly + SameSite=Strict by default
- ✅ No state-changing operations without token

**Verify in staging:**
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  # Should fail without auth cookie
```

---

### Sensitive Data Logging

**Status:** 🟡 **PARTIAL**

**Current Issues:**
- Line 149 in `send-reminder/route.ts`: `error.message` may leak sensitive data
  - **Fix:**
    ```typescript
    console.error('Error sending reminder:', { appointmentId, error: error.message });
    // Return safe message to client:
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    ```

---

## 6. Compliance & Audit Logging

### HIPAA/LGPD Requirements

**Brazil (LGPD):**
- ✅ **Personal data processing consent**: Collect via checkbox in appointment form
- ⚠️ **Data retention**: Need policy (currently no auto-delete for cancelled appointments)
- ✅ **Audit logging**: Already implemented in `patient_audit_logs` table (Phase 1)

**Required Actions (P2):**
- [ ] Add LGPD consent checkbox to appointment form
- [ ] Document data retention policy (recommend: 2 years for completed, 6 months for cancelled)
- [ ] Implement data deletion workflow (PII purge on schedule)

---

## 7. Security Testing Checklist

### Automated Testing
- [ ] **SAST**: Run CodeQL on all `/api/*` routes
- [ ] **Dependency audit**: `npm audit` on Twilio, Supabase, Zod packages
- [ ] **OWASP Top 10**: Manual review (A01-Injection, A03-Auth, A05-CORS)

### Manual Penetration Testing (Staging)
- [ ] **SQL Injection**: Try `doctorId = "' OR '1'='1"`
- [ ] **XSS**: Patient name = `<img src=x onerror=alert(1)>`
- [ ] **CSRF**: Cross-site form submission (should fail)
- [ ] **Rate limiting**: Spam `/api/whatsapp/send-reminder` (should 429)
- [ ] **Broken auth**: Access `/scheduler` without token (should redirect to login)

---

## Implementation Priority

| Priority | Item | Phase | Effort | Blocker |
|----------|------|-------|--------|---------|
| 🔴 P1 | CORS headers | Phase 2 (Staging) | 2-3h | YES |
| 🔴 P1 | Rate limiting (Redis) | Phase 2 (Staging) | 2-4h | YES |
| 🔴 P1 | Phone validation + template escaping | Phase 2 (Staging) | 1-2h | YES |
| 🟡 P2 | Data encryption (CPF, phone) | Phase 3 (Prod) | 4-6h | NO |
| 🟡 P2 | Twilio security hardening | Phase 3 (Prod) | 3-5h | NO |
| 🟡 P2 | LGPD compliance (consent + retention) | Phase 3 (Prod) | 2-3h | NO |

---

## Staging Readiness (2026-05-24)

**Blocking Issues (MUST FIX):**
- ❌ CORS headers
- ❌ Rate limiting
- ❌ Phone validation
- ❌ Template escaping

**Estimated fix time:** 6-8 hours
**Can start staging push after:** 2026-05-17 (with all P1 items fixed)

---

## Sign-Off

**Security Assessment:** ⚠️ **Conditional Approval**
- ✅ MVP (mock data) is safe
- ⚠️ Staging requires P1 fixes
- 🔴 Production blocked until Phase 3 security hardening complete

**Next Steps:**
1. @devops: Review CORS + rate limiting implementation
2. @dev: Apply 4 security fixes (P1)
3. @qa: Retest EPIC-004 post-security fixes
4. @architect: Plan Phase 3 integration security

**Document Valid Until:** 2026-05-24 (deployment date)

---

**Prepared by:** @architect
**Date:** 2026-05-16 22:45 UTC
**Review Cadence:** Update before each deployment
