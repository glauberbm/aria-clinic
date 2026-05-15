-- Create clinics table - must be first to support foreign keys
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on clinics table
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their clinic
CREATE POLICY "clinics_select_own" ON public.clinics
  FOR SELECT
  USING (
    id IN (
      SELECT clinic_id FROM public.users WHERE id = auth.uid()
    )
  );
