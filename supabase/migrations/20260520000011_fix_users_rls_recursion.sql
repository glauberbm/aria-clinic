-- Fix RLS policy recursion on users table
-- Problem: "users_view_clinic_users" policy references the same table causing infinite recursion
-- Solution: Drop problematic policies and use simpler ones

-- Drop the recursive policy
DROP POLICY IF EXISTS "users_view_clinic_users" ON public.users;

-- Drop the admin policies that reference non-existent tables
DROP POLICY IF EXISTS "admin_update_any_profile" ON public.users;

-- Keep only safe policies:
-- - users_view_own_profile (already exists, safe)
-- - users_update_own_profile (already exists, safe)

-- Add a simple policy to allow authenticated users to view all user profiles (for provider selection)
CREATE POLICY "authenticated_view_profiles" ON public.users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Add a simple policy to allow reading users by email (used by seeding/setup)
CREATE POLICY "service_view_all_users" ON public.users
  FOR SELECT
  USING (auth.role() = 'service_role');
