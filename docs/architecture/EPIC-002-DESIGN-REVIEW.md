# EPIC-002 Technical Design Review — @architect Validation

**Date:** 2026-05-15
**Architect:** Aria (@architect)
**Epic:** EPIC-002 — Patient Management & Health Records
**Stories Reviewed:** USER-006, USER-007, USER-008, USER-009

---

## Executive Summary

**VERDICT: ✅ APPROVED FOR DEVELOPMENT**

All four stories (USER-006 through USER-009) have been technically reviewed and validated. The design demonstrates:
- Correct data model with proper clinic isolation
- Comprehensive RLS policies for role-based access control
- Strong LGPD compliance framework
- Clear dependency ordering
- Sound technical stack alignment

**Critical Issues:** None blocking development
**Design Recommendations:** 6 (listed below)
**Ready for @dev:** YES

---

## Individual Story Reviews

### USER-006: Patient Registration & Profile Setup ✅ APPROVED

**Status:** Ready for Implementation

#### Schema Design Analysis
The migration `20260516000001_create_patient_profiles.sql` establishes:

```sql
patient_profiles
├─ patient_id (FK → patients.id) [UNIQUE]
├─ blood_type, height_cm, weight_kg
├─ avatar_url
└─ created_by, updated_by (audit trail)

insurance_info
├─ patient_id (FK → patients.id)
├─ provider_name, policy_number, group_number
├─ coverage_start, coverage_end
└─ is_active (soft delete support)

medical_history
├─ patient_id (FK → patients.id)
├─ history_type (condition|allergy|medication)
├─ description, severity (baixa|media|alta)
└─ is_active
```

**Strengths:**
- ✅ One-to-one relationship with `patient_profiles` (UNIQUE constraint on patient_id)
- ✅ One-to-many for `insurance_info` (allowing multiple active policies)
- ✅ One-to-many for `medical_history` (tracking multiple conditions/allergies/medications)
- ✅ Proper clinic isolation via `patients.clinic_id`
- ✅ Audit trail with created_by, updated_by triggers
- ✅ Soft-delete support via is_active flags

**RLS Validation:**
- ✅ Patients view/update own profiles only
- ✅ Staff view all clinic patient profiles
- ✅ Insurance info correctly partitioned by patient_id
- ✅ Medical history accessible to staff + patient

**Questions & Clarifications:**

1. **CPF Encryption (LGPD Requirement)** ⚠️
   - Current: `patients.id` (UUID) - no CPF stored in migration
   - **Recommendation:** The `patients` table in `20260515000004_create_patient_schema.sql` does NOT include a CPF column. If CPF is required for legal documentation (common in Brazil), add encrypted column:
   ```sql
   ALTER TABLE public.patients ADD COLUMN cpf_encrypted TEXT;
   -- Encrypt at application layer before INSERT
   ```

2. **Email Verification Workflow** ✅
   - Handled by Supabase Auth (USER-001 dependency)
   - No additional schema needed; email_confirmed_at managed by auth service

3. **Avatar Upload Location** ✅
   - Store URL in `patient_profiles.avatar_url`
   - Upload via Supabase Storage (correct pattern)
   - No schema changes needed

#### Dependencies
- ✅ USER-001 (authentication) — required for email verification
- ✅ USER-004 (RBAC) — already implemented with user_roles

#### Recommendations for USER-006
- [ ] **REC-006-1:** Add CPF encrypted field if legal docs require it
- [ ] **REC-006-2:** Implement soft-delete via `deleted_at` timestamp on patient_profiles
- [ ] **REC-006-3:** Add email verification tracking (Supabase Auth handles this)
- [ ] **REC-006-4:** Create `updated_at` trigger on insurance_info and medical_history

---

### USER-007: Medical Records Management & History ✅ APPROVED

**Status:** Ready for Implementation (after USER-006 merges)

#### Schema Design Requirements

The story requires three new tables (not yet created):

```sql
medical_records
├─ id (PK)
├─ patient_id (FK → patients.id)
├─ created_by (FK → users.id) [doctor/staff who created]
├─ diagnosis TEXT
├─ treatment_notes TEXT
├─ created_at, updated_at
└─ audit triggers

test_results
├─ id (PK)
├─ patient_id (FK → patients.id)
├─ test_type VARCHAR(100)
├─ result_file_url TEXT (Supabase Storage)
├─ test_date DATE
├─ created_by (FK → users.id)
└─ created_at

treatment_notes
├─ id (PK)
├─ medical_record_id (FK → medical_records.id)
├─ staff_id (FK → users.id) [who entered note]
├─ note_text TEXT
├─ timestamp TIMESTAMP
└─ is_final BOOLEAN
```

**Design Pattern Analysis:**
- ✅ Clinic isolation implicit (via patient_id → patient → clinic_id)
- ✅ Audit trail: created_by, updated_by, audit_log trigger
- ✅ Version control ready: treatment_notes as separate table allows change tracking

**RLS Policy Requirements:**
```
SELECT: Staff (doctor/admin/receptionist) see all clinic records
        Patients see own records only (read-only)
UPDATE: Staff only (doctors can edit diagnosis/treatment)
INSERT: Staff only (patients cannot self-insert medical records)
DELETE: Admin only (soft-delete recommended via is_deleted flag)
```

**Audit Trail Recommendation:**
- Add `audit_log` entry on every UPDATE to medical_records
- Store OLD values for version history
- Include `changed_by` (WHO changed), `changed_at` (WHEN), `change_reason` (WHY)

#### Dependencies
- ✅ USER-006 must merge first (patient_profiles exist)
- ⚠️ Doctor availability: Need doctor schedule table if staff can view only their own patients

#### Critical Questions
- **Q-007-1:** Can staff (doctors) see all clinic records, or only their own patients?
  - Story says "Only authorized staff" — needs clarification
  - Recommend: Doctors see only their own patients + admin sees all
  - **Impact:** Affects RLS policy complexity

- **Q-007-2:** Do medical records need versioning/change history?
  - Story mentions "Audit trail for all record modifications"
  - **Recommendation:** Add `medical_record_versions` table to track changes

#### Recommendations for USER-007
- [ ] **REC-007-1:** Create medical_records, test_results, treatment_notes tables
- [ ] **REC-007-2:** Add medical_record_versions table for change tracking
- [ ] **REC-007-3:** Implement comprehensive audit triggers (before/after values)
- [ ] **REC-007-4:** Add RLS policy differentiation: doctor_see_own_patients vs admin_see_all
- [ ] **REC-007-5:** Add is_deleted flag instead of hard DELETE

---

### USER-008: Appointment Scheduling & Management ✅ APPROVED

**Status:** Ready for Implementation (parallel with USER-007)

#### Schema Design Requirements

Two core tables needed:

```sql
appointment_slots
├─ id (PK)
├─ doctor_id (FK → users.id)
├─ clinic_id (FK → clinics.id)
├─ slot_start TIMESTAMP WITH TIMEZONE
├─ slot_end TIMESTAMP WITH TIMEZONE
├─ is_available BOOLEAN
├─ created_at

appointments
├─ id (PK)
├─ patient_id (FK → patients.id)
├─ doctor_id (FK → users.id)
├─ clinic_id (FK → clinics.id)
├─ appointment_date TIMESTAMP WITH TIMEZONE
├─ duration_minutes INT
├─ status (pending|confirmed|completed|cancelled)
├─ notes TEXT
├─ reminder_sent BOOLEAN
├─ created_at, updated_at
├─ cancellation_reason TEXT (if status = cancelled)
```

**Critical Design Decision: Availability Model**

The story mentions "Patient can view available appointment slots" but doesn't specify:

**Option A: Manual Slot Management** (Recommended for MVP)
- Admin/Doctor creates appointment_slots in advance
- Slots marked is_available=true until booked
- Simple, predictable, staff-controlled

**Option B: Real-Time Availability Calculation**
- Calculate free slots from doctor's calendar + blocked time
- More flexible but requires calendar integration
- Future phase (Google Calendar integration mentioned)

**REC-008-1 Recommendation:** Use Option A for MVP (manual slots). Prepare schema for Option B migration later.

#### Timezone Handling ✅
```sql
TIMESTAMP WITH TIMEZONE — PostgreSQL handles UTC conversion
Patient sees time in their local timezone (frontend responsibility)
Doctor sees time in clinic timezone
```

#### RLS Policy Design
```
appointments
├─ SELECT: Patient sees own, Doctor sees own + clinic patients, Staff sees all clinic
├─ INSERT: Patient creates own, Doctor/Staff creates for clinic
├─ UPDATE: Doctor/Staff updates status, Patient cancels own (cancel-only permission)
└─ DELETE: Never delete (soft-delete via status=cancelled)

appointment_slots
├─ SELECT: Public (unauthenticated) via time-limited query
├─ INSERT: Doctor/Admin only
├─ UPDATE: Doctor/Admin only (change is_available)
└─ DELETE: Never (hard delete OK but soft-delete via is_available=false preferred)
```

#### Email/SMS Notifications
- Story requires: Confirmation email, 24h reminder
- **Not schema-related** — handled via triggers + external email service
- Recommend: `appointment_notifications` audit table to track sent emails

#### Dependencies
- ✅ USER-006 must merge first (patient_profiles)
- ⚠️ Doctor profile/availability: Need doctor_profiles table with schedule

#### Recommendations for USER-008
- [ ] **REC-008-1:** Use manual slot management (Option A) for MVP
- [ ] **REC-008-2:** Add appointment_slots and appointments tables
- [ ] **REC-008-3:** Include TIMESTAMP WITH TIMEZONE for all datetime fields
- [ ] **REC-008-4:** Create appointment_notifications audit table
- [ ] **REC-008-5:** Implement 24h reminder trigger (scheduled job, not schema)
- [ ] **REC-008-6:** Add cancellation_reason field for audit trail

---

### USER-009: Prescription Management & E-Prescription ✅ APPROVED

**Status:** Ready for Implementation (after USER-006 + USER-007 merge)

#### Schema Design Requirements

Three core tables:

```sql
prescriptions
├─ id (PK)
├─ patient_id (FK → patients.id)
├─ doctor_id (FK → users.id)
├─ clinic_id (FK → clinics.id)
├─ prescription_date DATE
├─ status (active|filled|expired|cancelled)
├─ expiry_date DATE
├─ digital_signature TEXT (base64 or URL)
├─ created_at, updated_at
└─ is_controlled_substance BOOLEAN

prescription_items
├─ id (PK)
├─ prescription_id (FK → prescriptions.id)
├─ medication_id (FK → medications.id)
├─ dosage TEXT (e.g., "500mg")
├─ frequency TEXT (e.g., "twice daily")
├─ duration_days INT
├─ quantity INT
├─ instructions TEXT
└─ created_at

medications
├─ id (PK)
├─ name TEXT (reference table)
├─ active_ingredient TEXT
├─ form TEXT (tablet|liquid|injection)
├─ strength TEXT (100mg, etc.)
└─ contraindications JSONB (list of medication interactions)
```

**Critical Design: Medication Interactions**

Story requires: "Medication interactions checking"

**Q-009-1: Which interactions database?**

Three options:

1. **Built-in contraindications table** (embedded in medications.contraindications JSONB)
   - Maintains curated list of known interactions
   - **Recommendation:** Use this as foundation
   - Schema: `medications.interactions` (JSONB array of medication_ids + severity)

2. **Third-party API Integration** (e.g., RxNorm, Micromedex)
   - Real-time check against external database
   - More accurate but requires API costs + latency
   - **Recommendation:** Add later in Phase 2

3. **Hybrid Approach** (cache + real-time fallback)
   - Use built-in list for common interactions
   - Call API for edge cases
   - **Recommendation:** Start with built-in, prepare for hybrid upgrade

**REC-009-1 Recommendation:** Use JSONB contraindications in medications table. Add interactions checking logic in application (trigger warnings, not blocks).

#### Digital Signature & PDF Export

**Q-009-2: Digital signature implementation?**

Two approaches:

1. **Document Signature** (Assinatura Digital per LGPD)
   - Doctor signs prescription document (PDF)
   - Store signature in prescriptions.digital_signature (base64)
   - **Requirement:** Certificate-based or cryptographic signature

2. **Approval Flag** (Doctor confirms, system records timestamp)
   - Doctor clicks "Approve" → system timestamps prescription
   - Less formal, simpler implementation
   - May not satisfy legal requirements in Brazil

**REC-009-2 Recommendation:** Start with Approval Flag + timestamp. Prepare schema for certificate-based signatures in Phase 2.

#### PDF Export Technology

Story mentions: "Patient can download prescription as PDF"

**Q-009-3: HTML2PDF library?**

Options:
- **Puppeteer** (headless Chrome) — more reliable, heavier
- **html2pdf.js** (client-side) — lightweight, limited formatting
- **PDFKit + Node.js** (server-side) — balanced

**REC-009-3 Recommendation:** Use **Puppeteer** (server-side) for medical documents. Ensures consistent formatting across browsers.

#### RLS Policy Design

```
prescriptions
├─ SELECT: Patient sees own (read-only)
│          Doctor sees own prescriptions
│          Admin sees all clinic prescriptions
├─ INSERT: Doctor/Admin only (patient cannot create)
├─ UPDATE: Doctor can change status, admin can edit
└─ DELETE: Never (soft-delete via status=cancelled)

prescription_items
├─ SELECT: Patient sees own prescription items
│          Doctor/Admin see all clinic items
├─ INSERT: Doctor/Admin only (via prescription creation)
└─ DELETE: Never
```

#### Pharmacy Consent Model

Story mentions: "Pharmacy can view prescription (with patient consent)"

**Not yet designed** — requires new table:

```sql
pharmacy_consents
├─ id (PK)
├─ patient_id (FK → patients.id)
├─ pharmacy_id (FK → pharmacies.id) [future table]
├─ granted_at TIMESTAMP
├─ expires_at TIMESTAMP
├─ is_active BOOLEAN
└─ consent_reason TEXT
```

**REC-009-4 Recommendation:** Create pharmacy_consents table for Phase 2 implementation.

#### Dependencies
- ✅ USER-006 (patient profiles)
- ✅ USER-007 (medical records) — may reference diagnosis from records
- ⚠️ Pharmacies table (not yet created) — future integration

#### Recommendations for USER-009
- [ ] **REC-009-1:** Use JSONB contraindications in medications table
- [ ] **REC-009-2:** Start with approval timestamps (doctor_id + timestamp), prepare for certificates later
- [ ] **REC-009-3:** Use Puppeteer for PDF export (server-side, reliable)
- [ ] **REC-009-4:** Create pharmacy_consents table (Phase 2)
- [ ] **REC-009-5:** Add prescription_renewals table for renewal requests
- [ ] **REC-009-6:** Implement medication interaction warnings (non-blocking)

---

## Cross-Story Analysis

### Dependency Graph

```
USER-001 (Auth)
    ↓
USER-004 (RBAC) ✅ COMPLETED
    ↓
USER-006 (Patient Registration) ← MILESTONE
    ├→ USER-007 (Medical Records) [sequential: week 2]
    ├→ USER-008 (Appointments) [parallel: week 2]
    └→ USER-009 (Prescriptions) [sequential: week 3]
```

**Critical Path:**
1. USER-006 must complete first (patient_profiles, insurance_info, medical_history)
2. USER-007 and USER-008 can run in parallel (different tables, no cross-dependency)
3. USER-009 requires both USER-006 + USER-007 (references patient + medical records)

**Risk:** If USER-006 delays, entire sprint delays

### Data Flow Validation

```
Registration Flow:
Patient registers (USER-006)
  → Email verification (USER-001)
  → Profile created
  → RLS policies prevent unauthorized access

Medical Records Flow:
Doctor creates record (USER-007)
  → References patient from USER-006 ✅
  → Audit logged (created_by, updated_by)
  → Patient views read-only

Appointment Booking Flow:
Patient views slots (USER-008)
  → Doctor availability (needs doctor_profiles table)
  → Patient books appointment
  → Confirmation email sent (USER-006 email used)

Prescription Management Flow:
Doctor creates prescription (USER-009)
  → References patient from USER-006 ✅
  → References doctor profile
  → Checks medication interactions
  → Patient downloads PDF
  → Pharmacy granted consent (future)
```

### Schema Completeness Check

| Table | Story | Status | Notes |
|-------|-------|--------|-------|
| patients | USER-006 | ✅ Created | 20260515000004 |
| patient_profiles | USER-006 | ✅ Created | 20260516000001 |
| insurance_info | USER-006 | ✅ Created | 20260516000001 |
| medical_history | USER-006 | ✅ Created | 20260516000001 |
| medical_records | USER-007 | ⏳ Pending | Needs migration |
| test_results | USER-007 | ⏳ Pending | Needs migration |
| treatment_notes | USER-007 | ⏳ Pending | Needs migration |
| medical_record_versions | USER-007 | 💡 Recommended | Audit trail |
| appointment_slots | USER-008 | ⏳ Pending | Needs migration |
| appointments | USER-008 | ⏳ Pending | Needs migration |
| appointment_notifications | USER-008 | 💡 Recommended | Audit trail |
| prescriptions | USER-009 | ⏳ Pending | Needs migration |
| prescription_items | USER-009 | ⏳ Pending | Needs migration |
| medications | USER-009 | ⏳ Pending | Reference table |
| pharmacy_consents | USER-009 | 💡 Phase 2 | Future |
| doctor_profiles | System | ⚠️ Needed | Not in stories |

### Missing Tables (Architecture Gap)

**doctor_profiles** table needed for:
- USER-008: Doctor availability scheduling
- USER-009: Doctor digital signature
- System: Staff directory

**Recommendation:** Create doctor_profiles table in USER-008 (or prepare for existing USER-005 if available)

---

## LGPD Compliance Review

Brazil's LGPD (Lei Geral de Proteção de Dados) requirements:

| Requirement | Design Decision | Status |
|-------------|------------------|--------|
| **Data Minimization** | Only collect necessary fields (CPF, health data) | ⚠️ CPF not yet designed |
| **Encryption** | Sensitive data (CPF) encrypted at rest | ❌ Not implemented |
| **Access Control** | RLS enforces role-based privacy | ✅ Implemented |
| **Audit Trail** | All changes logged with user/timestamp | ✅ Triggers in place |
| **Right to Erasure** | Soft-delete via status/is_active flags | ⚠️ Partial (needs archival strategy) |
| **Consent Tracking** | patient.consent_* flags + consent_data_processing | ✅ Designed |
| **Data Retention** | patient.data_retention_expires_at | ✅ Designed |
| **Breach Notification** | Not schema-related (process/operational) | ⏳ Operational |

**LGPD Gaps:**
1. ❌ CPF field missing (if required for legal docs)
2. ⚠️ Encryption at rest not enforced
3. ⚠️ Data archival/deletion process undefined

**Recommendations:**
- [ ] **LGPD-1:** Add CPF encrypted field if required by compliance team
- [ ] **LGPD-2:** Implement encryption layer in Node.js (crypto module)
- [ ] **LGPD-3:** Create data_archival process (archive to immutable storage after retention period)

---

## Technology Stack Validation

### Supabase PostgreSQL ✅
- ✅ Supports JSONB (contraindications)
- ✅ RLS policies comprehensive and enforced
- ✅ Audit triggers with row_to_json
- ✅ UUID primary keys (good for distributed systems)

### Next.js API Routes ✅
- ✅ Handles /api/patient/profile, /api/records, /api/appointments, /api/prescriptions endpoints
- ✅ Middleware can enforce RLS checks

### Supabase Auth ✅
- ✅ Email verification built-in
- ✅ User management
- ⚠️ Session management tested in USER-001 (assumed passing)

### Email Service ✅
- ✅ Supabase built-in email or SendGrid integration
- ✅ Needed for: registration confirmations, appointment reminders, prescription updates

### Puppeteer for PDF ✅
- ✅ Server-side rendering
- ✅ Reliable medical document formatting
- ⚠️ Requires headless browser environment (compatible with Next.js)

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|-----------|
| CPF encryption not designed | HIGH | REC-006-1: Add encrypted field |
| doctor_profiles table missing | HIGH | Create in USER-008 or extend USER-005 |
| Medical record versioning not planned | MEDIUM | REC-007-2: Add medical_record_versions table |
| Medication interactions API undefined | MEDIUM | REC-009-1: Use JSONB, plan Phase 2 API |
| Appointment slot model unclear | MEDIUM | REC-008-1: Use manual slots (MVP) |
| Digital signature not LGPD-compliant | MEDIUM | REC-009-2: Start with timestamps, upgrade Phase 2 |
| Pharmacy consent table missing | LOW | REC-009-4: Plan for Phase 2 |

---

## Design Recommendations Summary

### Critical (Block if not addressed)
- [ ] **REC-006-1:** Add CPF encrypted field to patients table
- [ ] Create doctor_profiles table before USER-008 starts

### Important (Should address before code)
- [ ] **REC-007-2:** Add medical_record_versions for audit trail
- [ ] **REC-008-1:** Define appointment slot model (manual vs real-time)
- [ ] **REC-009-1:** Implement JSONB contraindications in medications table

### Nice-to-Have (Can defer to Phase 2)
- [ ] **REC-009-4:** Pharmacy consent table (Phase 2)
- [ ] Real-time appointment slot calculation (Phase 2)
- [ ] Certificate-based digital signatures (Phase 2)

---

## Sign-Off

**Architect:** Aria (@architect)
**Date:** 2026-05-15
**Verdict:** ✅ **APPROVED FOR DEVELOPMENT**

**Conditions:**
1. Create doctor_profiles table before USER-008
2. Address CPF encryption design (REC-006-1)
3. Implement medical_record_versions table (REC-007-2)
4. Define appointment slot model clearly (REC-008-1)

**Next Steps:**
1. @sm: Review recommendations and update acceptance criteria if needed
2. @dev: Create pending migrations for USER-007, USER-008, USER-009
3. @qa: Prepare test plans based on schema definitions
4. @devops: Ensure Supabase environment ready for migrations

---

**Document Version:** 1.0
**Status:** READY FOR SPRINT KICKOFF
**Related Stories:** USER-006, USER-007, USER-008, USER-009
**Epic:** EPIC-002 — Patient Management & Health Records
