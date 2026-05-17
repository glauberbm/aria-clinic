-- 004_payment_methods.sql: Payment methods table with RLS
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  last4 TEXT NOT NULL,
  exp_month INTEGER NOT NULL,
  exp_year INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_patient_id ON payment_methods(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_clinic_id ON payment_methods(clinic_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_deleted_at ON payment_methods(deleted_at);

-- RLS (Row Level Security)
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Patients can only view their own payment methods
CREATE POLICY "Patients view own payment methods" ON payment_methods
  FOR SELECT USING (
    patient_id = auth.uid() AND deleted_at IS NULL
  );

-- Clinic staff cannot view patient payment methods
CREATE POLICY "Clinic staff blocked from viewing patient methods" ON payment_methods
  FOR SELECT USING (FALSE);

-- Soft delete on patient deletion (via trigger or cascade)
CREATE POLICY "Allow patient to delete own methods" ON payment_methods
  FOR DELETE USING (patient_id = auth.uid());
