-- ============================================================================
-- ArIA Clinic - Complete Database Schema
-- Combined from 10 migration files
-- Apply in Supabase SQL Editor or via `supabase db push`
-- ============================================================================

-- MIGRATION 1: Create clinics table (must be first for FK dependencies)
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinics_select_own" ON public.clinics
  FOR SELECT
  USING (
    id IN (
      SELECT clinic_id FROM public.users WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- MIGRATION 2: Create roles and RBAC schema
-- ============================================================================
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL,
  assigned_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, role_id, clinic_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_clinic_id ON public.user_roles(clinic_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);

INSERT INTO public.roles (name, description, permissions) VALUES
  ('admin', 'Full system access', '["read", "write", "delete", "manage_users", "manage_roles"]'),
  ('doctor', 'Medical professional - full clinical access', '["read", "write", "manage_patients", "manage_appointments"]'),
  ('receptionist', 'Receptionist - scheduling & patient intake', '["read", "write", "manage_appointments", "manage_patient_intake"]'),
  ('patient', 'Patient - self-service portal', '["read_own_data", "update_own_data"]');

CREATE POLICY "admin_view_all_roles" ON public.roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "users_view_clinic_roles" ON public.roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "users_view_own_roles" ON public.user_roles
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "admin_manage_user_roles" ON public.user_roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.clinic_id = user_roles.clinic_id
    )
  );

CREATE POLICY "admin_update_user_roles" ON public.user_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.clinic_id = user_roles.clinic_id
    )
  );

CREATE POLICY "admin_delete_user_roles" ON public.user_roles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.clinic_id = user_roles.clinic_id
    )
  );

GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- ============================================================================
-- MIGRATION 3: Create users table with auth sync
-- ============================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  clinic_id UUID,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_clinic_id ON public.users(clinic_id);
CREATE INDEX idx_users_active ON public.users(active);

CREATE POLICY "users_view_own_profile" ON public.users
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users_view_clinic_users" ON public.users
  FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

CREATE POLICY "users_update_own_profile" ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "admin_update_any_profile" ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.clinic_id = users.clinic_id
    )
  );

GRANT SELECT ON public.users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.users TO authenticated;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- MIGRATION 4: Create patient schema
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL,

  -- Basic Info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('M', 'F', 'O', 'N')),

  -- Address
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,

  -- Contact Preferences
  preferred_contact_method TEXT DEFAULT 'whatsapp',
  whatsapp_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,

  -- Status & Metadata
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  archived_at TIMESTAMP WITH TIME ZONE,

  -- LGPD Compliance
  consent_terms BOOLEAN DEFAULT false,
  consent_marketing BOOLEAN DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.patient_medical_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  condition TEXT NOT NULL,
  description TEXT,
  diagnosed_date DATE,
  status TEXT DEFAULT 'ongoing',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patient_treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  treatment_type TEXT NOT NULL,
  professional_id UUID,

  start_date DATE,
  end_date DATE,
  description TEXT,

  status TEXT DEFAULT 'in_progress' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patient_medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('medication', 'allergy', 'intolerance')),
  dosage TEXT,
  frequency TEXT,

  start_date DATE,
  end_date DATE,

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patient_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms', 'phone', 'in_person')),
  subject TEXT,
  message TEXT,

  sent_by UUID,
  sent_at TIMESTAMP WITH TIME ZONE,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'read')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patient_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  action TEXT NOT NULL,
  table_name TEXT,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,

  performed_by UUID,
  ip_address TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_patients_clinic_id ON public.patients(clinic_id);
CREATE INDEX idx_patients_status ON public.patients(status);
CREATE INDEX idx_patients_email ON public.patients(email);
CREATE INDEX idx_patients_phone ON public.patients(phone);
CREATE INDEX idx_medical_history_patient_id ON public.patient_medical_history(patient_id);
CREATE INDEX idx_treatments_patient_id ON public.patient_treatments(patient_id);
CREATE INDEX idx_medications_patient_id ON public.patient_medications(patient_id);
CREATE INDEX idx_communications_patient_id ON public.patient_communications(patient_id);
CREATE INDEX idx_audit_logs_patient_id ON public.patient_audit_logs(patient_id);
CREATE INDEX idx_audit_logs_created_at ON public.patient_audit_logs(created_at);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients_view_own" ON public.patients
  FOR SELECT USING (
    auth.uid()::TEXT = id::TEXT OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "staff_view_clinic_patients" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.user_id = auth.uid() AND s.clinic_id = patients.clinic_id
    )
  );

CREATE POLICY "medical_history_view" ON public.patient_medical_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_medical_history.patient_id AND
        (auth.uid()::TEXT = p.id::TEXT OR
         EXISTS (SELECT 1 FROM public.staff s WHERE s.user_id = auth.uid()))
    )
  );

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER medical_history_updated_at BEFORE UPDATE ON public.patient_medical_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER treatments_updated_at BEFORE UPDATE ON public.patient_treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER medications_updated_at BEFORE UPDATE ON public.patient_medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION 5: Create audit_log table for tracking role changes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK (action IN ('role_assigned', 'role_removed')),
  target_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  target_role_id UUID REFERENCES public.roles(id) ON DELETE RESTRICT,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_audit_log_clinic_id ON public.audit_log(clinic_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id ON public.audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_target_user_id ON public.audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_clinic_created_at ON public.audit_log(clinic_id, created_at);

DROP POLICY IF EXISTS "admins_view_clinic_audit_log" ON public.audit_log;
CREATE POLICY "admins_view_clinic_audit_log" ON public.audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
        AND ur.clinic_id = audit_log.clinic_id
    )
  );

DROP POLICY IF EXISTS "admins_insert_audit_log" ON public.audit_log;
CREATE POLICY "admins_insert_audit_log" ON public.audit_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
        AND ur.clinic_id = audit_log.clinic_id
    )
  );

GRANT SELECT ON public.audit_log TO authenticated;
GRANT INSERT ON public.audit_log TO authenticated;

DROP TRIGGER IF EXISTS update_audit_log_updated_at ON public.audit_log;
CREATE TRIGGER update_audit_log_updated_at
BEFORE UPDATE ON public.audit_log
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- MIGRATION 6: Patient Extended Schema (Medical History, Treatments, Communications)
-- ============================================================================
-- Tables already created above in MIGRATION 4, but add additional extended columns/tables

CREATE TABLE IF NOT EXISTS public.patient_contact_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL UNIQUE REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,

  -- Channel preferences
  email_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,

  -- Communication timing
  prefer_morning BOOLEAN DEFAULT FALSE,
  prefer_afternoon BOOLEAN DEFAULT TRUE,
  prefer_evening BOOLEAN DEFAULT FALSE,

  -- Consent tracking
  marketing_consent BOOLEAN DEFAULT FALSE,
  newsletter_consent BOOLEAN DEFAULT FALSE,
  appointment_reminder_consent BOOLEAN DEFAULT TRUE,

  -- Opt-out tracking
  unsubscribe_date DATE,
  unsubscribe_reason TEXT,

  -- Audit
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  last_updated_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_patient_contact_preferences_patient_id ON public.patient_contact_preferences(patient_id);
CREATE INDEX idx_patient_contact_preferences_clinic_id ON public.patient_contact_preferences(clinic_id);

ALTER TABLE public.patient_contact_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own preferences" ON public.patient_contact_preferences
  FOR ALL USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff view preferences" ON public.patient_contact_preferences
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name IN ('admin', 'receptionist')
      )
    )
  );

-- ============================================================================
-- MIGRATION 7: Fix Critical RLS Blockers
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.patients
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

DROP POLICY IF EXISTS "patient_see_own_data" ON public.patients;
CREATE POLICY "patient_see_own_data" ON public.patients
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_update_user_roles" ON public.user_roles;
CREATE POLICY "admin_update_user_roles" ON public.user_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.clinic_id = user_roles.clinic_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.clinic_id = user_roles.clinic_id
    )
  );

-- ============================================================================
-- MIGRATION 8: Patient Profiles, Insurance & Medical History
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL UNIQUE REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Health Information
  blood_type VARCHAR(3),
  height_cm NUMERIC,
  weight_kg NUMERIC,

  -- Profile Picture
  avatar_url TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.insurance_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Insurance Details
  provider_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  group_number TEXT,
  coverage_start DATE,
  coverage_end DATE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Medical History Type
  history_type TEXT NOT NULL CHECK (history_type IN ('condition', 'allergy', 'medication')),
  description TEXT NOT NULL,

  -- Additional Context
  severity TEXT CHECK (severity IN ('baixa', 'media', 'alta', NULL)),
  date_recorded TIMESTAMP DEFAULT now(),
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_patient_profiles_patient_id ON public.patient_profiles(patient_id);
CREATE INDEX idx_insurance_info_patient_id ON public.insurance_info(patient_id);
CREATE INDEX idx_insurance_info_is_active ON public.insurance_info(is_active);
CREATE INDEX idx_medical_history_patient_id ON public.medical_history(patient_id);
CREATE INDEX idx_medical_history_type ON public.medical_history(history_type);
CREATE INDEX idx_medical_history_is_active ON public.medical_history(is_active);

ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_view_own_profile" ON public.patient_profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT ur.user_id
      FROM public.user_roles ur
      WHERE ur.clinic_id = (
        SELECT clinic_id FROM public.patients WHERE id = patient_profiles.patient_id
      )
      AND ur.role_id IN (SELECT id FROM public.roles WHERE name = 'patient')
    )
    AND patient_id IN (
      SELECT id FROM public.patients
      WHERE id = patient_profiles.patient_id
      AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "patient_update_own_profile" ON public.patient_profiles
  FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "staff_view_clinic_patient_profiles" ON public.patient_profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT ur.user_id
      FROM public.user_roles ur
      WHERE ur.clinic_id = (
        SELECT clinic_id FROM public.patients WHERE id = patient_profiles.patient_id
      )
      AND ur.role_id IN (SELECT id FROM public.roles WHERE name IN ('admin', 'doctor', 'receptionist'))
    )
  );

CREATE POLICY "patient_view_own_insurance" ON public.insurance_info
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "patient_update_own_insurance" ON public.insurance_info
  FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "patient_insert_own_insurance" ON public.insurance_info
  FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "staff_view_clinic_insurance" ON public.insurance_info
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT ur.user_id
      FROM public.user_roles ur
      WHERE ur.clinic_id = (
        SELECT clinic_id FROM public.patients WHERE id = insurance_info.patient_id
      )
      AND ur.role_id IN (SELECT id FROM public.roles WHERE name IN ('admin', 'doctor', 'receptionist'))
    )
  );

CREATE POLICY "patient_view_own_medical_history" ON public.medical_history
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "patient_update_own_medical_history" ON public.medical_history
  FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "patient_insert_own_medical_history" ON public.medical_history
  FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "staff_view_clinic_medical_history" ON public.medical_history
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT ur.user_id
      FROM public.user_roles ur
      WHERE ur.clinic_id = (
        SELECT clinic_id FROM public.patients WHERE id = medical_history.patient_id
      )
      AND ur.role_id IN (SELECT id FROM public.roles WHERE name IN ('admin', 'doctor', 'receptionist'))
    )
  );

-- ============================================================================
-- MIGRATION 9: Create/Update patients table for self-registration
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,

  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  birth_date DATE,

  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT now(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES public.users(id),

  UNIQUE(user_id, clinic_id)
);

ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients view own records" ON public.patients;
CREATE POLICY "Patients view own records" ON public.patients
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients update own records" ON public.patients;
CREATE POLICY "Patients update own records" ON public.patients
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff view clinic patients" ON public.patients;
CREATE POLICY "Staff view clinic patients" ON public.patients
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name IN ('admin', 'doctor', 'receptionist')
      )
    )
  );

DROP POLICY IF EXISTS "Admin view pending registrations" ON public.pending_registrations;
CREATE POLICY "Admin view pending registrations" ON public.pending_registrations
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name = 'admin'
      )
    )
  );

DROP POLICY IF EXISTS "Admin update pending registrations" ON public.pending_registrations;
CREATE POLICY "Admin update pending registrations" ON public.pending_registrations
  FOR UPDATE USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name = 'admin'
      )
    )
  );

CREATE INDEX IF NOT EXISTS idx_pending_registrations_clinic_id ON public.pending_registrations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON public.pending_registrations(status);

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- MIGRATION 10: Create appointments table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,

  -- Appointment details
  title TEXT NOT NULL,
  description TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT DEFAULT 30,

  -- Provider information
  provider_id UUID REFERENCES public.users(id),
  provider_name TEXT,

  -- Status tracking
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),

  -- Reminder tracking
  reminder_sent_24h BOOLEAN DEFAULT FALSE,
  reminder_sent_1h BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMP,

  -- Location/Type
  appointment_type TEXT CHECK (appointment_type IN ('consultation', 'follow_up', 'procedure', 'check_up', 'emergency')),
  location TEXT,

  -- Notes
  clinical_notes TEXT,
  cancellation_reason TEXT,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_24h ON public.appointments(reminder_sent_24h) WHERE reminder_sent_24h = FALSE;

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients view own appointments" ON public.appointments
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff view clinic appointments" ON public.appointments
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name IN ('admin', 'doctor', 'receptionist')
      )
    )
  );

CREATE POLICY "Staff manage clinic appointments" ON public.appointments
  FOR ALL USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name IN ('admin', 'doctor', 'receptionist')
      )
    )
  )
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name IN ('admin', 'doctor', 'receptionist')
      )
    )
  );

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- FINAL: Audit triggers for LGPD compliance
-- ============================================================================
CREATE OR REPLACE FUNCTION log_patient_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.patient_audit_logs (
      patient_id, clinic_id, action, table_name, record_id,
      performed_by, old_values, new_values, created_at
    ) VALUES (
      OLD.patient_id, OLD.clinic_id, 'delete', TG_TABLE_NAME, OLD.id,
      auth.uid(), row_to_json(OLD), NULL, now()
    );
    RETURN OLD;
  ELSE
    INSERT INTO public.patient_audit_logs (
      patient_id, clinic_id, action, table_name, record_id,
      performed_by, old_values, new_values, created_at
    ) VALUES (
      CASE WHEN TG_OP = 'UPDATE' THEN NEW.patient_id ELSE NEW.patient_id END,
      NEW.clinic_id, TG_OP, TG_TABLE_NAME, NEW.id,
      auth.uid(),
      CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
      row_to_json(NEW), now()
    );
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATABASE READY FOR SEEDING
-- ============================================================================
-- All tables created and RLS policies configured
-- Next steps:
-- 1. Seed clinics: node scripts/seed-clinic.js
-- 2. Seed auth users: node scripts/seed-auth-users.js
-- 3. Seed patient data: node scripts/seed-complete.js
