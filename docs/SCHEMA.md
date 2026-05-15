# ArIA Clinic — Database Schema (Phase 1)

**Phase:** Foundation (MVP) | **Database:** Supabase (PostgreSQL) | **Created:** 2026-05-14

---

## Overview

Phase 1 database schema supports:
- **EPIC-001:** Authentication & User Management
- **EPIC-002:** Dashboard (read-only to public tables)
- **EPIC-003:** Patients Module
- **EPIC-004:** Scheduling Module

Phase 2 & 3 tables added incrementally.

---

## Tables

### 1. Authentication & Users

#### `users` (Managed by Supabase Auth)
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role_id UUID REFERENCES roles(id),
  clinic_id UUID NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### `roles`
```sql
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT now()
);

-- Pre-populated roles:
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access'),
  ('doctor', 'Medical professional - full clinical access'),
  ('receptionist', 'Receptionist - scheduling & patient intake'),
  ('patient', 'Patient - self-service portal');
```

---

### 2. Patient Management

#### `patients`
```sql
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  date_of_birth DATE,
  cpf TEXT UNIQUE,
  rg TEXT,
  gender TEXT,
  marital_status TEXT,
  profession TEXT,
  address_street TEXT,
  address_number TEXT,
  address_complement TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zipcode TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  status TEXT DEFAULT 'active', -- active, inactive, archived
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(clinic_id, cpf)
);

CREATE INDEX idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_whatsapp ON patients(whatsapp);
CREATE INDEX idx_patients_status ON patients(status);
```

#### `patient_anamnese`
```sql
CREATE TABLE public.patient_anamnese (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL, -- Flexible JSON structure
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_patient_anamnese_patient_id ON patient_anamnese(patient_id);
```

#### `patient_contact_logs`
```sql
CREATE TABLE public.patient_contact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  contact_type TEXT, -- sms, whatsapp, email, call, in-person
  message TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_patient_contact_logs_patient_id ON patient_contact_logs(patient_id);
CREATE INDEX idx_patient_contact_logs_type ON patient_contact_logs(contact_type);
```

---

### 3. Scheduling

#### `doctors`
```sql
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialization TEXT,
  crm TEXT UNIQUE,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_doctors_clinic_id ON doctors(clinic_id);
```

#### `appointment_statuses`
```sql
CREATE TABLE public.appointment_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color_hex TEXT -- For UI display: #16a34a, #dc2626, etc.
);

-- Pre-populated statuses:
INSERT INTO appointment_statuses (name, description, color_hex) VALUES
  ('agendada', 'Scheduled', '#3b82f6'),
  ('confirmada', 'Confirmed', '#10b981'),
  ('atendida', 'Completed', '#6366f1'),
  ('cancelada', 'Cancelled', '#ef4444'),
  ('remarcada', 'Rescheduled', '#f59e0b'),
  ('paciente_chegou', 'Patient arrived', '#8b5cf6'),
  ('nao_compareceu', 'No-show', '#6b7280');
```

#### `appointments`
```sql
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  treatment_name TEXT,
  status_id UUID REFERENCES appointment_statuses(id),
  notes TEXT,
  reminder_sent_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status_id);
CREATE UNIQUE INDEX idx_appointments_no_double_booking
  ON appointments(doctor_id, appointment_date, appointment_time)
  WHERE status_id != (SELECT id FROM appointment_statuses WHERE name = 'cancelada');
```

---

### 4. Clinic Configuration

#### `clinics`
```sql
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address_street TEXT,
  address_number TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zipcode TEXT,
  cnpj TEXT UNIQUE,
  owner_id UUID REFERENCES users(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_clinics_owner_id ON clinics(owner_id);
```

---

## Row-Level Security (RLS)

All tables use RLS to restrict access by clinic and role:

```sql
-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_anamnese ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Example policy: Doctors can only see their own clinic's patients
CREATE POLICY "doctors_can_view_clinic_patients" ON patients
  FOR SELECT
  USING (
    clinic_id = (
      SELECT clinic_id FROM users WHERE id = auth.uid()
    )
  );

-- Example policy: Patients can only see own records (when patient portal added)
CREATE POLICY "patients_can_view_own_data" ON patients
  FOR SELECT
  USING (
    id = auth.uid() OR
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
  );
```

---

## Migrations

### Migration 1: Initial Schema (EPIC-001, EPIC-002, EPIC-003, EPIC-004)

**File:** `migrations/001_phase1_foundation.sql`

Run via Supabase CLI:
```bash
supabase migration new phase1_foundation
# Edit the generated migration file
supabase db push
```

---

## Diagram

```
┌─────────────────┐
│     users       │ (Supabase Auth)
│  (auth.users)   │
└────────┬────────┘
         │ references
         ↓
    ┌────────────┐      ┌──────────┐
    │   roles    │◄─────┤ clinic   │
    └────────────┘      └──────────┘
         ▲                    │
         │                    │ has many
         │ references         ↓
         │              ┌──────────┐
    ┌────────────┐      │ patients │
    │  doctors   │      └──────┬───┘
    └────────────┘             │
         │                     ├──→ patient_anamnese
         │                     ├──→ patient_contact_logs
         │                     └──→ appointments
         │                              │
         └──────────────────────────────┘
                 (scheduled by)

    ┌─────────────────────┐
    │ appointment_statuses│ (reference table)
    └─────────────────────┘
```

---

## Next Steps

**Phase 2 Additions (Week 3):**
- `treatments` table
- `treatment_categories` table
- `budgets` table
- `budget_items` table

**Phase 3 Additions (Week 5):**
- `crm_leads` table
- `crm_opportunities` table
- `whatsapp_conversations` table
- `whatsapp_messages` table

---

**Schema Version:** 1.0 | **Status:** ✅ Ready for migration | **Last Updated:** 2026-05-14
