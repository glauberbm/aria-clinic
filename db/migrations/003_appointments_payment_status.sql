-- 003_appointments_payment_status.sql: Add payment status to appointments
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id);

CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);
CREATE INDEX IF NOT EXISTS idx_appointments_payment_id ON appointments(payment_id);
