-- Create audit_log table for tracking role changes
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK (action IN ('role_assigned', 'role_removed')),
  target_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  target_role_id UUID REFERENCES public.roles(id) ON DELETE RESTRICT,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on audit_log table
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_audit_log_clinic_id ON public.audit_log(clinic_id);
CREATE INDEX idx_audit_log_actor_id ON public.audit_log(actor_id);
CREATE INDEX idx_audit_log_target_user_id ON public.audit_log(target_user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at);
CREATE INDEX idx_audit_log_clinic_created_at ON public.audit_log(clinic_id, created_at);

-- RLS Policy: Only admins of the clinic can view their clinic's audit log
CREATE POLICY "admins_view_clinic_audit_log" ON public.audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
        AND ur.clinic_id = audit_log.clinic_id
    )
  );

-- RLS Policy: Only admins of the clinic can insert audit log entries
CREATE POLICY "admins_insert_audit_log" ON public.audit_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
        AND ur.clinic_id = audit_log.clinic_id
    )
  );

-- Grant appropriate permissions
GRANT SELECT ON public.audit_log TO authenticated;
GRANT INSERT ON public.audit_log TO authenticated;

-- Create trigger to auto-update updated_at on any change
CREATE TRIGGER update_audit_log_updated_at
BEFORE UPDATE ON public.audit_log
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
