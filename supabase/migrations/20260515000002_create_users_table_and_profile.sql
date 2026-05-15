-- Create users table (synced with auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  clinic_id UUID,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_clinic_id ON public.users(clinic_id);
CREATE INDEX idx_users_active ON public.users(active);

-- RLS Policy: Users can view their own profile
CREATE POLICY "users_view_own_profile" ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- RLS Policy: Users can view other users in their clinic (admins can view all)
CREATE POLICY "users_view_clinic_users" ON public.users
  FOR SELECT
  USING (
    clinic_id = (SELECT clinic_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- RLS Policy: Users can update their own profile
CREATE POLICY "users_update_own_profile" ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS Policy: Admins can update any user profile
CREATE POLICY "admin_update_any_profile" ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.clinic_id = users.clinic_id
    )
  );

-- Grant appropriate permissions
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.users TO authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on any change
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to sync auth.users metadata to public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
