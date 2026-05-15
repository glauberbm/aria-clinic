# Patient Database Schema — aria-clinic v1.0

**Date:** 2026-05-15
**Status:** Implemented
**Compliance:** LGPD (Lei Geral de Proteção de Dados)

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CORE ENTITIES                        │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │    PATIENTS      │
                    ├──────────────────┤
                    │ id (PK)          │
                    │ user_id (FK)     │◄──────── auth.users
                    │ clinic_id (FK)   │◄──────── clinics
                    │ full_name        │
                    │ email (UQ/clinic)│
                    │ phone_number     │
                    │ birth_date       │
                    │ email_verified   │
                    │ created_at       │
                    │ updated_at       │
                    └──────────────────┘
                            │
                ┌───────────┼───────────┬────────────────┐
                │           │           │                │
                ▼           ▼           ▼                ▼
    ┌─────────────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐
    │ MEDICAL_HISTORY │ │MEDICATIONS│ │COMMS   │ │CONTACT_PREFS │
    ├─────────────────┤ ├──────────┤ ├────────┤ ├──────────────┤
    │ id (PK)         │ │ id (PK)  │ │ id (PK)│ │ id (PK)      │
    │ patient_id (FK) │ │patient_id│ │patient │ │ patient_id   │
    │ clinic_id (FK)  │ │clinic_id │ │ clinic │ │ clinic_id    │
    │ treatment_type  │ │ name     │ │ channel│ │ email_enabled│
    │ treatment_date  │ │ type     │ │ type   │ │ whatsapp_en  │
    │ provider_id     │ │ severity │ │ status │ │ sms_enabled  │
    │ clinical_notes  │ │ dosage   │ │ body   │ │ preferences  │
    │ results         │ │ frequency│ │ sent_at│ │ consent      │
    │ follow_up_date  │ │ is_active│ │ status │ │ created_at   │
    │ status          │ │ created_ │ │ error  │ │ updated_at   │
    │ created_at      │ │ by       │ │ msg    │ └──────────────┘
    │ updated_at      │ │ created_ │ │ retry_ │
    │ created_by      │ │ at       │ │ count  │
    │ updated_at      │ │ updated_ │ │ created│
    │ created_by      │ │ at       │ │ by     │
    │ created_by      │ │ created_ │ │ created│
    └─────────────────┘ │ by       │ │ at     │
                        └──────────┘ └────────┘

                    ┌──────────────────┐
                    │  AUDIT_LOGS      │
                    ├──────────────────┤
                    │ id (PK)          │
                    │ patient_id (FK)  │
                    │ clinic_id (FK)   │
                    │ action           │
                    │ table_name       │
                    │ record_id        │
                    │ performed_by     │
                    │ old_values       │
                    │ new_values       │
                    │ ip_address       │
                    │ user_agent       │
                    │ created_at       │
                    └──────────────────┘
```

---

## Table Specifications

### 1. `patients` (Core Patient Record)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK | Unique patient identifier |
| user_id | UUID | FK→auth.users, UNIQUE | Linked to Supabase Auth |
| clinic_id | UUID | FK→clinics | Multi-clinic support |
| full_name | TEXT | NOT NULL | Patient full name |
| email | TEXT | NOT NULL, UQ(clinic_id) | Email per clinic |
| phone_number | TEXT | | Contact number |
| birth_date | DATE | | Age calculation |
| email_verified | BOOLEAN | DEFAULT FALSE | Email confirmation status |
| verification_token | TEXT | UNIQUE | For email verification link |
| verification_token_expires_at | TIMESTAMP | | Token expiry |
| created_at | TIMESTAMP | DEFAULT NOW() | Registration date |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_patients_user_id` — Fast auth.users lookup
- `idx_patients_clinic_id` — Clinic isolation
- `idx_patients_email_verified` — Find unverified

**RLS Policies:**
- Patients view own record: `auth.uid() = user_id`
- Staff view clinic patients: clinic_id membership

---

### 2. `patient_medical_history` (Treatment Records)

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Unique record |
| patient_id | UUID | Which patient |
| clinic_id | UUID | Which clinic |
| treatment_type | TEXT | e.g., "Laser Removal", "Peeling" |
| treatment_date | DATE | When performed |
| provider_name | TEXT | Who performed |
| provider_id | UUID | Staff member reference |
| clinical_notes | TEXT | Doctor's observations |
| results | TEXT | Outcome/progress |
| follow_up_date | DATE | Next appointment |
| status | TEXT | scheduled \| completed \| cancelled |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |
| created_by | UUID | Who created record |

**LGPD:** All changes logged to `patient_audit_logs` via trigger.

---

### 3. `patient_medications` (Medications & Allergies)

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Unique record |
| patient_id | UUID | Patient reference |
| clinic_id | UUID | Clinic reference |
| name | TEXT | Drug/allergy name |
| description | TEXT | Additional info |
| type | TEXT | medication \| allergy |
| severity | TEXT | low \| medium \| high \| critical |
| dosage | TEXT | e.g., "500mg" |
| frequency | TEXT | e.g., "2x daily" |
| start_date | DATE | Start taking |
| end_date | DATE | Stop taking (or NULL) |
| is_active | BOOLEAN | Current status |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| created_by | UUID | |

**Note:** Critical severity allergies trigger warnings in appointments.

---

### 4. `patient_communications` (Messages & Notifications)

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Message ID |
| patient_id | UUID | Recipient |
| clinic_id | UUID | Sender clinic |
| channel | TEXT | email \| whatsapp \| sms \| system |
| message_type | TEXT | appointment_reminder, follow_up, etc. |
| subject | TEXT | Email subject |
| body | TEXT | Message content |
| metadata | JSONB | WhatsApp msg_id, delivery tracking |
| status | TEXT | pending \| sent \| delivered \| read \| failed |
| sent_at | TIMESTAMP | Send time |
| delivered_at | TIMESTAMP | Delivery confirmation |
| read_at | TIMESTAMP | When patient read |
| error_message | TEXT | Failure reason |
| retry_count | INT | Auto-retry attempts |
| created_at | TIMESTAMP | |
| created_by | UUID | |

**LGPD:** All messages logged for audit trail.

---

### 5. `patient_contact_preferences` (Opt-In/Opt-Out)

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Preference set |
| patient_id | UUID | UNIQUE per patient |
| clinic_id | UUID | Clinic |
| email_enabled | BOOLEAN | Can email |
| whatsapp_enabled | BOOLEAN | Can message |
| sms_enabled | BOOLEAN | Can SMS |
| prefer_morning | BOOLEAN | Time preference |
| prefer_afternoon | BOOLEAN | |
| prefer_evening | BOOLEAN | |
| marketing_consent | BOOLEAN | Marketing emails |
| newsletter_consent | BOOLEAN | Newsletter |
| appointment_reminder_consent | BOOLEAN | Mandatory for scheduling |
| unsubscribe_date | DATE | When opted out |
| unsubscribe_reason | TEXT | Why opted out |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| last_updated_by | UUID | |

---

### 6. `patient_audit_logs` (LGPD Compliance)

| Column | Type | Purpose |
|--------|------|---------|
| id | UUID | Log entry |
| patient_id | UUID | Which patient (can be NULL if deleted) |
| clinic_id | UUID | Clinic context |
| action | TEXT | create \| read \| update \| delete \| export \| archive |
| table_name | TEXT | Where action occurred |
| record_id | UUID | Which record |
| performed_by | UUID | Who did it |
| old_values | JSONB | Previous state (for updates/deletes) |
| new_values | JSONB | New state |
| ip_address | INET | Request IP |
| user_agent | TEXT | Browser/client info |
| created_at | TIMESTAMP | When logged |

**Purpose:**
- LGPD mandates access logging
- Tracks all data access and changes
- Enables "right to be forgotten" verification
- Investigates unauthorized access

---

## Row-Level Security (RLS) Policies

### Patient Data Access

| Policy | Effect | Use Case |
|--------|--------|----------|
| `Patients view own` | SELECT where auth.uid() = user_id | Patients see their records |
| `Patients update own` | UPDATE where auth.uid() = user_id | Patients edit profile |
| `Staff view clinic patients` | SELECT where clinic_id in user's clinics | Doctors/receptionists |
| `Admin full access` | ALL operations | Clinic administrators |

### Audit Logs

- **Admin only:** Only administrators can view audit logs
- **Clinic-scoped:** Only their own clinic's logs

---

## Audit Trigger (LGPD Logging)

Automatically logs to `patient_audit_logs` on:
- ✅ INSERT — New medical record
- ✅ UPDATE — Changes to medication, preferences, etc.
- ✅ DELETE — Record deletion (soft-delete not used here)

```sql
BEFORE INSERT OR UPDATE OR DELETE ON patient_medical_history
  → log_patient_audit()
```

---

## LGPD Compliance Features

✅ **Data Encryption:** Supabase handles TLS in transit, RLS controls access

✅ **Access Logging:** Every read/write/delete to `patient_audit_logs`

✅ **Right to Be Forgotten:**
- Set status to archived
- Keep audit trail for compliance
- Can anonymize personal data

✅ **Consent Tracking:** `patient_contact_preferences.xxxxx_consent` fields

✅ **Data Minimization:** Only fields required for clinic operations

---

## Migration Order

1. ✅ `20260515000001_create_rbac_schema.sql` — Roles & authentication
2. ✅ `20260515000002_create_users_table_and_profile.sql` — Users
3. ✅ `20260515000003_create_audit_log_table.sql` — Audit foundation
4. ✅ `20260520000001_create_patients_table.sql` — Core patient + RLS
5. ✅ `20260515000004_create_patient_extended_schema.sql` — Extended tables

**Apply:** `supabase db push`

---

## Performance Indexes

All critical paths indexed:

- `idx_patients_user_id` — Auth lookup
- `idx_patient_medical_history_patient_id` — Patient timeline
- `idx_patient_medical_history_clinic_id` — Clinic queries
- `idx_patient_medical_history_date` — Date range searches
- `idx_patient_medications_patient_id` — Active meds check
- `idx_patient_communications_patient_id` — Message history
- `idx_patient_communications_status` — Delivery tracking
- `idx_patient_audit_logs_patient_id` — LGPD audit trail
- `idx_patient_audit_logs_created_at` — Time-based queries

---

## Sample Queries

### Get Patient Medical History
```sql
SELECT * FROM patient_medical_history
WHERE patient_id = $1
ORDER BY treatment_date DESC;
```

### Check Active Medications
```sql
SELECT * FROM patient_medications
WHERE patient_id = $1 AND is_active = TRUE
AND type = 'medication'
ORDER BY severity DESC;
```

### List Critical Allergies
```sql
SELECT * FROM patient_medications
WHERE patient_id = $1 AND type = 'allergy' AND severity = 'critical';
```

### Get Pending Messages
```sql
SELECT * FROM patient_communications
WHERE patient_id = $1 AND status = 'pending'
ORDER BY created_at ASC;
```

### LGPD: Audit Trail for Patient
```sql
SELECT action, old_values, new_values, performed_by, created_at
FROM patient_audit_logs
WHERE patient_id = $1
ORDER BY created_at DESC
LIMIT 100;
```

---

## Future Enhancements

- [ ] Encryption at rest (PgCrypto for sensitive fields)
- [ ] Soft-delete with archival
- [ ] Data retention policies (auto-anonymize after N years)
- [ ] Materialized views for reporting
- [ ] Prescription management
- [ ] Lab results integration
