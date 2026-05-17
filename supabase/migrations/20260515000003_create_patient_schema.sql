-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patients table
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

-- Medical History
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

-- Treatments
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

-- Medications & Allergies
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

-- Communications Log
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

-- Audit Log
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

-- Create indexes for performance
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

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patients table
-- Patients can see their own records
CREATE POLICY "patients_view_own" ON public.patients
  FOR SELECT USING (
    auth.uid()::TEXT = id::TEXT OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'manager')
    )
  );

-- Staff can see patients from their clinic
CREATE POLICY "staff_view_clinic_patients" ON public.patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.user_id = auth.uid() AND s.clinic_id = patients.clinic_id
    )
  );

-- Similar policies for other tables
CREATE POLICY "medical_history_view" ON public.patient_medical_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_medical_history.patient_id AND
        (auth.uid()::TEXT = p.id::TEXT OR
         EXISTS (SELECT 1 FROM public.staff s WHERE s.user_id = auth.uid()))
    )
  );

-- Update trigger for updated_at
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
