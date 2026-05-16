-- ============================================================================
-- STAGING ENVIRONMENT SEED DATA
-- ============================================================================
-- Purpose: Populate staging database with test data for development/QA
-- SECURITY: STAGING ONLY — Do NOT run in production
-- Date: 2026-05-20
-- ============================================================================

-- ============================================================================
-- 0. DISABLE TRIGGERS DURING SEED (optional, for performance)
-- ============================================================================
-- DISABLED BY DEFAULT: Uncomment if seed data import fails due to triggers
-- ALTER TABLE public.users DISABLE TRIGGER ON;
-- ALTER TABLE public.patients DISABLE TRIGGER ON;
-- ALTER TABLE public.appointments DISABLE TRIGGER ON;

-- ============================================================================
-- 1. SEED CLINICS (1 test clinic)
-- ============================================================================
INSERT INTO public.clinics (id, name, cnpj, address, city, state, postal_code, phone, email, website, active, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Aria Clinic - Staging',
  '12.345.678/0001-90',
  'Av. Test Street, 1000',
  'São Paulo',
  'SP',
  '01310-100',
  '+55-11-3000-0000',
  'contact@aria-staging.test',
  'https://staging.aria-clinic.test',
  true,
  NOW()
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. SETUP AUTH.USERS (Create via Supabase Dashboard, then assign roles)
-- ============================================================================
-- NOTE: Auth.users are created via Supabase Auth API, not SQL
-- For staging, create test users with these emails and remember passwords:
--
-- User 1 - Admin
--   Email: admin@aria-staging.test
--   Password: Test@12345
--   Role: admin
--
-- User 2 - Doctor
--   Email: doctor1@aria-staging.test
--   Password: Test@12345
--   Role: doctor
--
-- User 3 - Doctor
--   Email: doctor2@aria-staging.test
--   Password: Test@12345
--   Role: doctor
--
-- User 4 - Receptionist
--   Email: receptionist@aria-staging.test
--   Password: Test@12345
--   Role: receptionist
--
-- User 5 - Patient
--   Email: patient1@aria-staging.test
--   Password: Test@12345
--   Role: patient

-- After creating auth.users, the public.users table will be auto-populated
-- via the on_auth_user_created trigger. Verify with:
-- SELECT COUNT(*) FROM public.users;

-- ============================================================================
-- 3. SEED USER_ROLES (Assign roles after users are created)
-- ============================================================================
-- IMPORTANT: Replace UUIDs below with actual auth.users IDs from Supabase

-- Admin role assignment (replace UUID)
INSERT INTO public.user_roles (user_id, role_id, clinic_id, assigned_at)
SELECT
  '11111111-1111-1111-1111-111111111111'::UUID,  -- REPLACE with admin auth.user_id
  (SELECT id FROM public.roles WHERE name = 'admin' LIMIT 1),
  '00000000-0000-0000-0000-000000000001'::UUID,
  NOW()
ON CONFLICT (user_id, role_id, clinic_id) DO NOTHING;

-- Doctor 1 role assignment
INSERT INTO public.user_roles (user_id, role_id, clinic_id, assigned_at)
SELECT
  '22222222-2222-2222-2222-222222222222'::UUID,  -- REPLACE with doctor1 auth.user_id
  (SELECT id FROM public.roles WHERE name = 'doctor' LIMIT 1),
  '00000000-0000-0000-0000-000000000001'::UUID,
  NOW()
ON CONFLICT (user_id, role_id, clinic_id) DO NOTHING;

-- Doctor 2 role assignment
INSERT INTO public.user_roles (user_id, role_id, clinic_id, assigned_at)
SELECT
  '33333333-3333-3333-3333-333333333333'::UUID,  -- REPLACE with doctor2 auth.user_id
  (SELECT id FROM public.roles WHERE name = 'doctor' LIMIT 1),
  '00000000-0000-0000-0000-000000000001'::UUID,
  NOW()
ON CONFLICT (user_id, role_id, clinic_id) DO NOTHING;

-- Receptionist role assignment
INSERT INTO public.user_roles (user_id, role_id, clinic_id, assigned_at)
SELECT
  '44444444-4444-4444-4444-444444444444'::UUID,  -- REPLACE with receptionist auth.user_id
  (SELECT id FROM public.roles WHERE name = 'receptionist' LIMIT 1),
  '00000000-0000-0000-0000-000000000001'::UUID,
  NOW()
ON CONFLICT (user_id, role_id, clinic_id) DO NOTHING;

-- ============================================================================
-- 4. SEED PATIENTS (10 test patients)
-- ============================================================================
INSERT INTO public.patients (id, clinic_id, name, email, phone, date_of_birth, gender, address, city, state, zip_code, preferred_contact_method, whatsapp_enabled, email_enabled, sms_enabled, status, consent_terms, consent_marketing, consent_date)
VALUES
  -- Patient 1
  ('p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'João Silva', 'joao.silva@patient.test', '+55-11-98765-4321', '1985-03-15', 'M', 'Rua A, 123', 'São Paulo', 'SP', '01234-567', 'whatsapp', true, true, false, 'active', true, false, NOW()),
  -- Patient 2
  ('p0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Maria Santos', 'maria.santos@patient.test', '+55-11-98765-4322', '1990-07-22', 'F', 'Rua B, 456', 'São Paulo', 'SP', '01234-568', 'email', true, true, true, 'active', true, true, NOW()),
  -- Patient 3
  ('p0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Carlos Oliveira', 'carlos.oliveira@patient.test', '+55-11-98765-4323', '1975-11-08', 'M', 'Rua C, 789', 'São Paulo', 'SP', '01234-569', 'whatsapp', true, false, false, 'active', true, false, NOW()),
  -- Patient 4
  ('p0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Ana Costa', 'ana.costa@patient.test', '+55-11-98765-4324', '1988-05-30', 'F', 'Rua D, 101', 'São Paulo', 'SP', '01234-570', 'email', false, true, false, 'active', true, false, NOW()),
  -- Patient 5
  ('p0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Paulo Ferreira', 'paulo.ferreira@patient.test', '+55-11-98765-4325', '1982-12-12', 'M', 'Rua E, 202', 'São Paulo', 'SP', '01234-571', 'whatsapp', true, true, false, 'active', true, false, NOW()),
  -- Patient 6
  ('p0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Lucia Alves', 'lucia.alves@patient.test', '+55-11-98765-4326', '1992-02-18', 'F', 'Rua F, 303', 'São Paulo', 'SP', '01234-572', 'whatsapp', true, true, true, 'active', true, true, NOW()),
  -- Patient 7
  ('p0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Roberto Gomes', 'roberto.gomes@patient.test', '+55-11-98765-4327', '1978-09-25', 'M', 'Rua G, 404', 'São Paulo', 'SP', '01234-573', 'email', true, true, false, 'active', true, false, NOW()),
  -- Patient 8
  ('p0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Fernanda Lima', 'fernanda.lima@patient.test', '+55-11-98765-4328', '1995-06-03', 'F', 'Rua H, 505', 'São Paulo', 'SP', '01234-574', 'whatsapp', true, false, false, 'active', true, false, NOW()),
  -- Patient 9
  ('p0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Bruno Martins', 'bruno.martins@patient.test', '+55-11-98765-4329', '1987-01-14', 'M', 'Rua I, 606', 'São Paulo', 'SP', '01234-575', 'email', true, true, true, 'active', true, false, NOW()),
  -- Patient 10
  ('p0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Isabela Rodrigues', 'isabela.rodrigues@patient.test', '+55-11-98765-4330', '1993-08-19', 'F', 'Rua J, 707', 'São Paulo', 'SP', '01234-576', 'whatsapp', true, true, false, 'active', true, true, NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. SEED PATIENT MEDICAL HISTORY (5 records)
-- ============================================================================
INSERT INTO public.patient_medical_history (id, patient_id, clinic_id, treatment_type, treatment_date, provider_name, provider_id, clinical_notes, results, follow_up_date, status, created_by)
VALUES
  ('mh000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Consultation', '2026-05-15', 'Dr. Silva', '22222222-2222-2222-2222-222222222222', 'Blood pressure slightly elevated', 'BP: 140/90', '2026-06-15', 'completed', '22222222-2222-2222-2222-222222222222'),
  ('mh000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Check-up', '2026-05-14', 'Dr. Silva', '22222222-2222-2222-2222-222222222222', 'Routine annual checkup', 'All normal', '2027-05-14', 'completed', '22222222-2222-2222-2222-222222222222'),
  ('mh000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Blood Work', '2026-05-13', 'Dr. Santos', '33333333-3333-3333-3333-333333333333', 'Full panel ordered', 'Results pending', '2026-05-20', 'completed', '33333333-3333-3333-3333-333333333333'),
  ('mh000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Consultation', '2026-05-12', 'Dr. Silva', '22222222-2222-2222-2222-222222222222', 'Follow-up for hypertension', 'BP controlled', '2026-06-12', 'completed', '22222222-2222-2222-2222-222222222222'),
  ('mh000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Procedure', '2026-05-10', 'Dr. Santos', '33333333-3333-3333-3333-333333333333', 'Minor skin removal', 'Biopsy sent to lab', '2026-05-17', 'completed', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. SEED PATIENT MEDICATIONS (10 records)
-- ============================================================================
INSERT INTO public.patient_medications (id, patient_id, clinic_id, name, description, type, severity, dosage, frequency, start_date, end_date, is_active, created_by)
VALUES
  ('med00000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Lisinopril', 'ACE inhibitor for hypertension', 'medication', 'medium', '10mg', '1x daily', '2026-01-01', NULL, true, '22222222-2222-2222-2222-222222222222'),
  ('med00000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Penicillin', 'Allergy - documented reaction: hives', 'allergy', 'high', NULL, NULL, '2010-05-20', NULL, true, '22222222-2222-2222-2222-222222222222'),
  ('med00000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Atorvastatin', 'Statin for cholesterol', 'medication', 'low', '20mg', '1x at night', '2026-02-15', NULL, true, '22222222-2222-2222-2222-222222222222'),
  ('med00000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Aspirin', 'Daily for heart health', 'medication', 'low', '81mg', '1x daily', '2026-03-01', NULL, true, '33333333-3333-3333-3333-333333333333'),
  ('med00000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Shellfish', 'Allergy - anaphylaxis risk', 'allergy', 'critical', NULL, NULL, '2005-01-01', NULL, true, '33333333-3333-3333-3333-333333333333'),
  ('med00000-0000-0000-0000-000000000006', 'p0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Metformin', 'Diabetes management', 'medication', 'medium', '500mg', '2x daily with meals', '2026-01-10', NULL, true, '22222222-2222-2222-2222-222222222222'),
  ('med00000-0000-0000-0000-000000000007', 'p0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Omeprazole', 'Acid reflux management', 'medication', 'low', '20mg', '1x morning', '2026-04-01', NULL, true, '33333333-3333-3333-3333-333333333333'),
  ('med00000-0000-0000-0000-000000000008', 'p0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Sulfa drugs', 'Allergy - documented reaction', 'allergy', 'high', NULL, NULL, '2008-06-15', NULL, true, '22222222-2222-2222-2222-222222222222'),
  ('med00000-0000-0000-0000-000000000009', 'p0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Thyroid Hormone', 'Hypothyroidism treatment', 'medication', 'medium', '75mcg', '1x morning (empty stomach)', '2026-02-01', NULL, true, '33333333-3333-3333-3333-333333333333'),
  ('med00000-0000-0000-0000-000000000010', 'p0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Ibuprofen', 'Intolerance - gastric upset', 'allergy', 'medium', NULL, NULL, '2015-08-10', NULL, true, '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. SEED APPOINTMENTS (15 records - mixed past and future)
-- ============================================================================
INSERT INTO public.appointments (id, patient_id, clinic_id, title, description, appointment_date, duration_minutes, provider_id, provider_name, status, reminder_sent_24h, reminder_sent_1h, appointment_type, location, clinical_notes, created_by)
VALUES
  -- Past appointments (completed)
  ('apt00000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Routine Checkup', 'Annual physical', '2026-05-10 10:00:00+00:00', 60, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'completed', true, true, 'check_up', 'Room A', 'Patient in good health', '22222222-2222-2222-2222-222222222222'),
  ('apt00000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Blood Work', 'Lab tests', '2026-05-08 14:30:00+00:00', 30, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'completed', true, true, 'procedure', 'Lab', 'Samples collected', '33333333-3333-3333-3333-333333333333'),
  ('apt00000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Follow-up Consultation', 'Post-procedure follow-up', '2026-05-05 09:00:00+00:00', 45, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'completed', true, true, 'follow_up', 'Room B', 'Healing well', '22222222-2222-2222-2222-222222222222'),

  -- Upcoming appointments (next 2 weeks)
  ('apt00000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Hypertension Check', 'BP monitoring', '2026-05-25 11:00:00+00:00', 30, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'scheduled', false, false, 'consultation', 'Room A', NULL, '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Diabetes Review', 'Monthly diabetes management', '2026-05-26 15:30:00+00:00', 45, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'scheduled', false, false, 'consultation', 'Room C', NULL, '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000006', 'p0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Annual Physical', 'Checkup', '2026-05-27 10:00:00+00:00', 60, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'scheduled', false, false, 'check_up', 'Room A', NULL, '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000007', 'p0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Thyroid Function Test', 'Lab work', '2026-05-28 13:00:00+00:00', 30, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'scheduled', false, false, 'procedure', 'Lab', NULL, '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000008', 'p0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Skin Lesion Removal', 'Procedure', '2026-05-29 09:30:00+00:00', 45, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'scheduled', false, false, 'procedure', 'Surgery Room', NULL, '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000009', 'p0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Mental Health Check-in', 'Consultation', '2026-05-30 14:00:00+00:00', 60, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'scheduled', false, false, 'consultation', 'Room D', NULL, '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000010', 'p0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Routine Checkup', 'Follow-up', '2026-06-02 10:30:00+00:00', 30, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'confirmed', false, false, 'check_up', 'Room B', NULL, '44444444-4444-4444-4444-444444444444'),

  -- Cancelled/no-show examples
  ('apt00000-0000-0000-0000-000000000011', 'p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Rescheduled Appointment', 'Original: 2026-05-20', '2026-05-20 12:00:00+00:00', 30, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'cancelled', true, false, 'consultation', 'Room A', 'Patient rescheduled', '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000012', 'p0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Missed Appointment', 'Did not show up', '2026-05-12 11:00:00+00:00', 30, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'no_show', true, true, 'consultation', 'Room C', 'No show', '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000013', 'p0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Emergency Visit', 'Urgent care', '2026-05-18 16:45:00+00:00', 45, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'completed', true, true, 'emergency', 'ER', 'Treated for acute condition', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. RE-ENABLE TRIGGERS (if disabled above)
-- ============================================================================
-- ALTER TABLE public.users ENABLE TRIGGER ON;
-- ALTER TABLE public.patients ENABLE TRIGGER ON;
-- ALTER TABLE public.appointments ENABLE TRIGGER ON;

-- ============================================================================
-- 9. VERIFICATION QUERIES (run after seed to verify data)
-- ============================================================================
-- Run these queries to verify seed data was loaded correctly:
--
-- -- Check clinics
-- SELECT COUNT(*) as clinic_count FROM public.clinics;
-- -- Expected: 1
--
-- -- Check roles (pre-populated)
-- SELECT COUNT(*) as role_count FROM public.roles;
-- -- Expected: 4
--
-- -- Check users (after auth.users created)
-- SELECT COUNT(*) as user_count FROM public.users;
-- -- Expected: 5 (after manual creation via Supabase Auth)
--
-- -- Check user_roles (after assignments)
-- SELECT COUNT(*) as user_role_count FROM public.user_roles;
-- -- Expected: 5
--
-- -- Check patients
-- SELECT COUNT(*) as patient_count FROM public.patients;
-- -- Expected: 10
--
-- -- Check medical history
-- SELECT COUNT(*) as medical_history_count FROM public.patient_medical_history;
-- -- Expected: 5
--
-- -- Check medications
-- SELECT COUNT(*) as medication_count FROM public.patient_medications;
-- -- Expected: 10
--
-- -- Check appointments
-- SELECT COUNT(*) as appointment_count FROM public.appointments;
-- -- Expected: 13

-- ============================================================================
-- FINAL NOTES
-- ============================================================================
-- 1. This seed file is idempotent (safe to re-run)
-- 2. UUIDs are hardcoded for consistency across environments
-- 3. You must manually create auth.users via Supabase Dashboard
-- 4. Then replace the UUID placeholders in section 3 with real auth.user IDs
-- 5. After seed, verify data with queries in section 9
-- 6. For production, modify emails/contacts to use real clinic data
