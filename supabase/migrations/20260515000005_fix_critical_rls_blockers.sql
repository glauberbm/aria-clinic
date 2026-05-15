-- CRITICAL SECURITY FIX: Patient Self-Access RLS & Role Escalation Prevention
-- Date: 2026-05-15
-- Fixes: BLOCKER #1 (patient_see_own_data broken) + BLOCKER #2 (privilege escalation)

-- ==============================================================================
-- BLOCKER #1: Add user_id to patients table (patient self-access RLS)
-- ==============================================================================

-- Add user_id FK to patients table to link patient records to auth.users
ALTER TABLE public.patients
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for performance (RLS will use this for filtering)
CREATE INDEX idx_patients_user_id ON public.patients(user_id);

-- Drop the broken patient_see_own_data policy
DROP POLICY IF EXISTS "patient_see_own_data" ON public.patients;

-- Create new patient_see_own_data policy using user_id FK
-- Patients can see only their own record (user_id matches auth.uid())
CREATE POLICY "patient_see_own_data" ON public.patients
  FOR SELECT
  USING (user_id = auth.uid());

-- ==============================================================================
-- BLOCKER #2: Add WITH CHECK to admin_update_user_roles policy
-- ==============================================================================

-- Drop the incomplete UPDATE policy
DROP POLICY IF EXISTS "admin_update_user_roles" ON public.user_roles;

-- Recreate with WITH CHECK to prevent privilege escalation
-- Only admins can update role assignments, AND the new row must also satisfy USING
-- This prevents any non-admin from modifying their own role
CREATE POLICY "admin_update_user_roles" ON public.user_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.clinic_id = user_roles.clinic_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin' AND ur.clinic_id = user_roles.clinic_id
    )
  );

-- ==============================================================================
-- COMMENT: Additional improvements (already handled by other concerns)
-- ==============================================================================
-- Note: HIGH/MEDIUM concerns (audit triggers, soft-delete enforcement, FK constraint)
-- are tracked separately as non-blocking issues. These 2 CRITICAL fixes unblock production.
