-- 006_invoices.sql: Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  payment_id UUID REFERENCES payments(id),
  invoice_number TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  pdf_url TEXT,
  email_status TEXT DEFAULT 'pending',
  email_sent_at TIMESTAMP,
  email_failed_count INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_clinic_id ON invoices(clinic_id);
CREATE INDEX IF NOT EXISTS idx_invoices_appointment_id ON invoices(appointment_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_id ON invoices(payment_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_number_unique ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_email_status ON invoices(email_status);

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic staff view own clinic invoices" ON invoices
  FOR SELECT USING (
    clinic_id IN (SELECT clinic_id FROM clinic_staff WHERE user_id = auth.uid())
  );

CREATE POLICY "Patients view own invoices" ON invoices
  FOR SELECT USING (patient_id = auth.uid());
