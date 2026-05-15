-- Migration: Create patients table and supporting infrastructure
-- Wave 1: Patient Registration & Profile Setup (USER-006)
-- Created: 2026-05-15
-- Purpose: Patient self-registration, email verification, RLS-based data isolation

-- 1. Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,

  -- Profile fields
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  birth_date DATE,

  -- Status tracking
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT UNIQUE,
  verification_token_expires_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  -- Indexes for common queries
  UNIQUE(email, clinic_id)
);

-- 2. Create pending_registrations table for admin workflow
CREATE TABLE public.pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,

  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  birth_date DATE,

  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  requested_at TIMESTAMP DEFAULT now(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES public.users(id),

  UNIQUE(user_id, clinic_id)
);

-- 3. Enable RLS on both tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Patients can view only their own records
CREATE POLICY "Patients view own records" ON public.patients
  FOR SELECT USING (auth.uid() = user_id);

-- 5. RLS Policy: Patients can update only their own records
CREATE POLICY "Patients update own records" ON public.patients
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. RLS Policy: Clinic staff see only their clinic's patients
CREATE POLICY "Staff view clinic patients" ON public.patients
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name IN ('admin', 'doctor', 'receptionist')
      )
    )
  );

-- 7. RLS Policy: Admin can view pending registrations
CREATE POLICY "Admin view pending registrations" ON public.pending_registrations
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name = 'admin'
      )
    )
  );

-- 8. RLS Policy: Admin can update pending registrations
CREATE POLICY "Admin update pending registrations" ON public.pending_registrations
  FOR UPDATE USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name = 'admin'
      )
    )
  );

-- 9. Create indexes for performance
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_patients_clinic_id ON public.patients(clinic_id);
CREATE INDEX idx_patients_email_verified ON public.patients(email_verified);
CREATE INDEX idx_pending_registrations_clinic_id ON public.pending_registrations(clinic_id);
CREATE INDEX idx_pending_registrations_status ON public.pending_registrations(status);

-- 10. Create trigger to update updated_at on patients
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
