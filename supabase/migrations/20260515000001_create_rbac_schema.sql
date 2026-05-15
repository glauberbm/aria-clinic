-- Create roles table
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Create user_roles junction table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL,
  assigned_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, role_id, clinic_id)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_clinic_id ON public.user_roles(clinic_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);

-- Pre-populate roles
INSERT INTO public.roles (name, description, permissions) VALUES
  ('admin', 'Full system access', '["read", "write", "delete", "manage_users", "manage_roles"]'),
  ('doctor', 'Medical professional - full clinical access', '["read", "write", "manage_patients", "manage_appointments"]'),
  ('receptionist', 'Receptionist - scheduling & patient intake', '["read", "write", "manage_appointments", "manage_patient_intake"]'),
  ('patient', 'Patient - self-service portal', '["read_own_data", "update_own_data"]');

-- RLS Policy: Admins can view all roles
CREATE POLICY "admin_view_all_roles" ON public.roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- RLS Policy: Users can view roles for their clinic
CREATE POLICY "users_view_clinic_roles" ON public.roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can only view their own role assignments
CREATE POLICY "users_view_own_roles" ON public.user_roles
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- RLS Policy: Only admins can insert/update role assignments
CREATE POLICY "admin_manage_user_roles" ON public.user_roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.clinic_id = user_roles.clinic_id
    )
  );

-- RLS Policy: Only admins can update role assignments
CREATE POLICY "admin_update_user_roles" ON public.user_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.clinic_id = user_roles.clinic_id
    )
  );

-- RLS Policy: Only admins can delete role assignments
CREATE POLICY "admin_delete_user_roles" ON public.user_roles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.clinic_id = user_roles.clinic_id
    )
  );

-- Grant appropriate permissions
GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
