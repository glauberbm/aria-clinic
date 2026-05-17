-- Migration: Create appointments table for scheduling and reminders
-- Wave 2: Patient Communications (STORY-003-005)
-- Created: 2026-05-20
-- Purpose: Appointment scheduling, reminder tracking, and communication history

-- ============================================================================
-- 1. Create appointments table
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

-- ============================================================================
-- 2. Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_24h ON public.appointments(reminder_sent_24h) WHERE reminder_sent_24h = FALSE;

-- ============================================================================
-- 3. Enable RLS on appointments
-- ============================================================================
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. RLS Policies
-- ============================================================================
-- Patients view their own appointments
CREATE POLICY "Patients view own appointments" ON public.appointments
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Staff view clinic appointments
CREATE POLICY "Staff view clinic appointments" ON public.appointments
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name IN ('admin', 'doctor', 'receptionist')
      )
    )
  );

-- Staff manage clinic appointments
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

-- ============================================================================
-- 5. Create trigger for updated_at
-- ============================================================================
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. Create audit trigger (LGPD)
-- ============================================================================
CREATE TRIGGER audit_appointments AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION log_patient_audit();
