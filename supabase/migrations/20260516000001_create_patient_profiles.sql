-- Patient Profiles, Insurance & Medical History (USER-006)
-- Extends patient management with health profile, insurance, and medical history

-- Patient Profiles (Extended Health Information)
CREATE TABLE public.patient_profiles (
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

-- Insurance Information
CREATE TABLE public.insurance_info (
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

-- Medical History (Conditions, Allergies, Medications)
CREATE TABLE public.medical_history (
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

-- Indexes for common queries
CREATE INDEX idx_patient_profiles_patient_id ON public.patient_profiles(patient_id);
CREATE INDEX idx_insurance_info_patient_id ON public.insurance_info(patient_id);
CREATE INDEX idx_insurance_info_is_active ON public.insurance_info(is_active);
CREATE INDEX idx_medical_history_patient_id ON public.medical_history(patient_id);
CREATE INDEX idx_medical_history_type ON public.medical_history(history_type);
CREATE INDEX idx_medical_history_is_active ON public.medical_history(is_active);

-- Enable RLS on new tables
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_profiles
-- Patients can view their own profile
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

-- Patients can update their own profile
CREATE POLICY "patient_update_own_profile" ON public.patient_profiles
  FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Staff can view patient profiles in their clinic
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

-- RLS Policies for insurance_info
-- Patients can view their own insurance info
CREATE POLICY "patient_view_own_insurance" ON public.insurance_info
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Patients can update their own insurance info
CREATE POLICY "patient_update_own_insurance" ON public.insurance_info
  FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Patients can insert insurance info for themselves
CREATE POLICY "patient_insert_own_insurance" ON public.insurance_info
  FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Staff can view insurance info for their clinic patients
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

-- RLS Policies for medical_history
-- Patients can view their own medical history
CREATE POLICY "patient_view_own_medical_history" ON public.medical_history
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Patients can update their own medical history
CREATE POLICY "patient_update_own_medical_history" ON public.medical_history
  FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Patients can insert medical history for themselves
CREATE POLICY "patient_insert_own_medical_history" ON public.medical_history
  FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Staff can view medical history for their clinic patients
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

-- Audit Logging Triggers
CREATE OR REPLACE FUNCTION public.audit_patient_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    created_at
  ) VALUES (
    auth.uid(),
    TG_OP,
    'patient_profiles',
    COALESCE(NEW.id, OLD.id),
    row_to_json(OLD),
    row_to_json(NEW),
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_patient_profile_insert_update
  AFTER INSERT OR UPDATE ON public.patient_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_patient_profile_changes();

CREATE TRIGGER audit_patient_profile_delete
  AFTER DELETE ON public.patient_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_patient_profile_changes();

-- Timestamp triggers
CREATE OR REPLACE FUNCTION public.update_patient_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_patient_profile_timestamp
  BEFORE UPDATE ON public.patient_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_patient_profile_timestamp();

-- Insurance info timestamp trigger
CREATE OR REPLACE FUNCTION public.update_insurance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_insurance_timestamp
  BEFORE UPDATE ON public.insurance_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_insurance_timestamp();

-- Medical history timestamp trigger
CREATE OR REPLACE FUNCTION public.update_medical_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_medical_history_timestamp
  BEFORE UPDATE ON public.medical_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_medical_history_timestamp();
