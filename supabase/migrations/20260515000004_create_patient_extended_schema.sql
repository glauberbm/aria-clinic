-- Migration: Patient Extended Schema (Medical History, Treatments, Communications)
-- Epic: EPIC-003-patients (STORY-003-001)
-- Created: 2026-05-15
-- Purpose: Complete patient management system with LGPD compliance and audit logging

-- ============================================================================
-- 1. Patient Medical History Table
-- ============================================================================
CREATE TABLE public.patient_medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,

  -- Treatment information
  treatment_type TEXT NOT NULL,
  treatment_date DATE NOT NULL,
  provider_name TEXT,
  provider_id UUID REFERENCES public.users(id),

  -- Clinical notes
  clinical_notes TEXT,
  results TEXT,
  follow_up_date DATE,

  -- Status tracking
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled')),

  -- Audit
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_patient_medical_history_patient_id ON public.patient_medical_history(patient_id);
CREATE INDEX idx_patient_medical_history_clinic_id ON public.patient_medical_history(clinic_id);
CREATE INDEX idx_patient_medical_history_date ON public.patient_medical_history(treatment_date);

-- ============================================================================
-- 2. Patient Medications & Allergies Table
-- ============================================================================
CREATE TABLE public.patient_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,

  -- Medication details
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('medication', 'allergy')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  -- Dosage information
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Audit
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_patient_medications_patient_id ON public.patient_medications(patient_id);
CREATE INDEX idx_patient_medications_clinic_id ON public.patient_medications(clinic_id);
CREATE INDEX idx_patient_medications_active ON public.patient_medications(is_active);

-- ============================================================================
-- 3. Patient Communications Table (Messages, Notifications, WhatsApp)
-- ============================================================================
CREATE TABLE public.patient_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,

  -- Message details
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms', 'system')),
  message_type TEXT CHECK (message_type IN ('appointment_reminder', 'follow_up', 'treatment_update', 'notification', 'general')),

  -- Content
  subject TEXT,
  body TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- Store whatsapp message IDs, etc.

  -- Status tracking
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,

  -- Delivery info
  error_message TEXT,
  retry_count INT DEFAULT 0,

  -- Audit
  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

CREATE INDEX idx_patient_communications_patient_id ON public.patient_communications(patient_id);
CREATE INDEX idx_patient_communications_clinic_id ON public.patient_communications(clinic_id);
CREATE INDEX idx_patient_communications_channel ON public.patient_communications(channel);
CREATE INDEX idx_patient_communications_sent_at ON public.patient_communications(sent_at);
CREATE INDEX idx_patient_communications_status ON public.patient_communications(status);

-- ============================================================================
-- 4. Patient Contact Preferences Table
-- ============================================================================
CREATE TABLE public.patient_contact_preferences (
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

-- ============================================================================
-- 5. Patient Audit Log Table (LGPD Compliance)
-- ============================================================================
CREATE TABLE public.patient_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE SET NULL,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,

  -- Action details
  action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'export', 'archive')),
  table_name TEXT,
  record_id UUID,

  -- User who performed action
  performed_by UUID REFERENCES public.users(id),

  -- Change tracking
  old_values JSONB,
  new_values JSONB,

  -- Request details
  ip_address INET,
  user_agent TEXT,

  -- Audit
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_patient_audit_logs_patient_id ON public.patient_audit_logs(patient_id);
CREATE INDEX idx_patient_audit_logs_clinic_id ON public.patient_audit_logs(clinic_id);
CREATE INDEX idx_patient_audit_logs_action ON public.patient_audit_logs(action);
CREATE INDEX idx_patient_audit_logs_created_at ON public.patient_audit_logs(created_at);

-- ============================================================================
-- 6. Enable RLS on all new tables
-- ============================================================================
ALTER TABLE public.patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_contact_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. RLS Policies: Medical History
-- ============================================================================
-- Patients view own medical history
CREATE POLICY "Patients view own medical history" ON public.patient_medical_history
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- Staff view their clinic's records
CREATE POLICY "Staff view clinic medical history" ON public.patient_medical_history
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name IN ('admin', 'doctor', 'receptionist')
      )
    )
  );

-- ============================================================================
-- 8. RLS Policies: Medications
-- ============================================================================
CREATE POLICY "Patients view own medications" ON public.patient_medications
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff view clinic medications" ON public.patient_medications
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name IN ('admin', 'doctor')
      )
    )
  );

-- ============================================================================
-- 9. RLS Policies: Communications
-- ============================================================================
CREATE POLICY "Patients view own communications" ON public.patient_communications
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff manage communications" ON public.patient_communications
  FOR INSERT WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name IN ('admin', 'doctor', 'receptionist')
      )
    )
  );

-- ============================================================================
-- 10. RLS Policies: Contact Preferences
-- ============================================================================
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
-- 11. RLS Policies: Audit Logs (Admin only)
-- ============================================================================
CREATE POLICY "Admin view audit logs" ON public.patient_audit_logs
  FOR SELECT USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_roles
      WHERE user_id = auth.uid() AND role_id IN (
        SELECT id FROM public.roles WHERE name = 'admin'
      )
    )
  );

-- ============================================================================
-- 12. Create triggers for updated_at
-- ============================================================================
CREATE TRIGGER update_patient_medical_history_updated_at BEFORE UPDATE ON public.patient_medical_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_medications_updated_at BEFORE UPDATE ON public.patient_medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_contact_preferences_updated_at BEFORE UPDATE ON public.patient_contact_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 13. Create audit logging trigger (LGPD)
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

-- Attach audit trigger to all patient tables
CREATE TRIGGER audit_patient_medical_history AFTER INSERT OR UPDATE OR DELETE ON public.patient_medical_history
  FOR EACH ROW EXECUTE FUNCTION log_patient_audit();

CREATE TRIGGER audit_patient_medications AFTER INSERT OR UPDATE OR DELETE ON public.patient_medications
  FOR EACH ROW EXECUTE FUNCTION log_patient_audit();

CREATE TRIGGER audit_patient_communications AFTER INSERT OR UPDATE OR DELETE ON public.patient_communications
  FOR EACH ROW EXECUTE FUNCTION log_patient_audit();
