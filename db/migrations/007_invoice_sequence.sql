-- 007_invoice_sequence.sql: Invoice number sequence
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1 INCREMENT 1;

-- Function to generate invoice number in YYYY-MM-00001 format
CREATE OR REPLACE FUNCTION generate_invoice_number(clinic_id UUID)
RETURNS TEXT AS $$
DECLARE
  current_month TEXT;
  seq_number INTEGER;
  invoice_num TEXT;
BEGIN
  -- Get current month in YYYY-MM format
  current_month := TO_CHAR(NOW(), 'YYYY-MM');

  -- Get next sequence number
  seq_number := nextval('invoice_number_seq');

  -- Format as YYYY-MM-00001
  invoice_num := current_month || '-' || LPAD(seq_number::TEXT, 5, '0');

  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Reset sequence monthly (optional - can be managed at application level)
-- CREATE OR REPLACE FUNCTION reset_invoice_sequence()
-- RETURNS void AS $$
-- BEGIN
--   ALTER SEQUENCE invoice_number_seq RESTART WITH 1;
-- END;
-- $$ LANGUAGE plpgsql;
