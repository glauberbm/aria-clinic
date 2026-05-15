# Supabase Setup Guide — ArIA Clinic

## Overview

This document walks through setting up Supabase for the ArIA Clinic project. Tasks are organized sequentially following USER-001 story requirements.

---

## Phase 1: Project Setup (Manual)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click **"New project"**
4. Enter:
   - **Name:** aria-clinic
   - **Database password:** (save securely)
   - **Region:** Select closest to your location
5. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Get API Credentials

1. In Supabase dashboard, go **Project Settings → API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon public** (copy entire key)
3. Paste into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<Project URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
   ```

### Step 3: Enable Email/Password Auth Provider

1. Go **Authentication → Providers**
2. Click **Email**
3. Enable:
   - ✅ Enable Email Provider
   - ✅ Confirm email (optional for MVP)
4. Keep defaults for password requirements
5. Save

---

## Phase 2: Database Schema (SQL)

### Create `public.users` Table

Go to **SQL Editor** and run:

```sql
-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_users_clinic_id ON public.users(clinic_id);
CREATE INDEX idx_users_email ON public.users(email);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own record
CREATE POLICY "Users can read own record"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Only admins can insert/update
CREATE POLICY "Authenticated users can insert"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

---

## Phase 3: Database Trigger (Auto-sync auth → public)

Go to **SQL Editor** and run:

```sql
-- Create function to handle new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, clinic_id, active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'clinic_id')::UUID, '00000000-0000-0000-0000-000000000000')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Phase 4: Test Connection

Run in terminal:
```bash
npm run dev
# Visit http://localhost:3000
# Check for console errors (should have 0 Supabase errors)
```

---

## Phase 5: Verify Auth Setup

In browser DevTools Console:
```javascript
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  'https://xxx.supabase.co',
  'xxx-anon-key'
);
const { data, error } = await supabase.auth.getSession();
console.log(data, error);
```

Should return `session: null` (not logged in yet).

---

## Next Steps

After setup complete:
1. **Task T4:** Build registration form component
2. **Task T5:** Implement registration API route
3. **Task T7:** Write tests
