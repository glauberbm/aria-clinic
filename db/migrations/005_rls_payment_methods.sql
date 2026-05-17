-- 005_rls_payment_methods.sql: RLS triggers for payment methods cascade delete
CREATE OR REPLACE FUNCTION cascade_delete_payment_methods()
RETURNS TRIGGER AS $$
BEGIN
  -- Soft-delete all payment methods when patient is deleted
  UPDATE payment_methods
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE patient_id = OLD.id AND deleted_at IS NULL;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger on patient soft-delete
CREATE TRIGGER payment_methods_cascade_delete
AFTER UPDATE ON patients
FOR EACH ROW
WHEN (OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION cascade_delete_payment_methods();
