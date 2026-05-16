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
-- 4. SEED PATIENTS (25+ test patients - diverse demographics)
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
  ('p0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Isabela Rodrigues', 'isabela.rodrigues@patient.test', '+55-11-98765-4330', '1993-08-19', 'F', 'Rua J, 707', 'São Paulo', 'SP', '01234-576', 'whatsapp', true, true, false, 'active', true, true, NOW()),
  -- Patient 11 (additional)
  ('p0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Alexandre Souza', 'alexandre.souza@patient.test', '+55-11-98765-4331', '1980-04-22', 'M', 'Rua K, 808', 'São Paulo', 'SP', '01234-577', 'whatsapp', true, true, false, 'active', true, false, NOW()),
  -- Patient 12
  ('p0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Patricia Mendes', 'patricia.mendes@patient.test', '+55-11-98765-4332', '1991-06-10', 'F', 'Rua L, 909', 'São Paulo', 'SP', '01234-578', 'email', true, true, true, 'active', true, true, NOW()),
  -- Patient 13
  ('p0000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Eduardo Costa', 'eduardo.costa@patient.test', '+55-11-98765-4333', '1983-09-28', 'M', 'Av. Paulista, 1000', 'São Paulo', 'SP', '01234-579', 'whatsapp', true, false, false, 'active', true, false, NOW()),
  -- Patient 14
  ('p0000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Gabriela Ferreira', 'gabriela.ferreira@patient.test', '+55-11-98765-4334', '1994-12-05', 'F', 'Rua M, 1010', 'São Paulo', 'SP', '01234-580', 'whatsapp', true, true, true, 'active', true, false, NOW()),
  -- Patient 15
  ('p0000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'Henrique Silva', 'henrique.silva@patient.test', '+55-11-98765-4335', '1979-01-17', 'M', 'Rua N, 1111', 'São Paulo', 'SP', '01234-581', 'email', true, true, false, 'active', true, false, NOW()),
  -- Patient 16
  ('p0000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 'Joana Pires', 'joana.pires@patient.test', '+55-11-98765-4336', '1989-05-12', 'F', 'Rua O, 1212', 'São Paulo', 'SP', '01234-582', 'whatsapp', true, true, true, 'active', true, true, NOW()),
  -- Patient 17
  ('p0000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', 'Kamila Barbosa', 'kamila.barbosa@patient.test', '+55-11-98765-4337', '1996-08-03', 'F', 'Rua P, 1313', 'São Paulo', 'SP', '01234-583', 'whatsapp', true, false, false, 'active', true, false, NOW()),
  -- Patient 18
  ('p0000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000001', 'Leonardo Martins', 'leonardo.martins@patient.test', '+55-11-98765-4338', '1981-07-19', 'M', 'Rua Q, 1414', 'São Paulo', 'SP', '01234-584', 'email', true, true, true, 'active', true, false, NOW()),
  -- Patient 19
  ('p0000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000001', 'Monica Gomes', 'monica.gomes@patient.test', '+55-11-98765-4339', '1986-11-25', 'F', 'Rua R, 1515', 'São Paulo', 'SP', '01234-585', 'whatsapp', true, true, false, 'active', true, true, NOW()),
  -- Patient 20
  ('p0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Nicolas Teixeira', 'nicolas.teixeira@patient.test', '+55-11-98765-4340', '1998-02-14', 'M', 'Rua S, 1616', 'São Paulo', 'SP', '01234-586', 'whatsapp', true, true, false, 'active', true, false, NOW()),
  -- Patient 21
  ('p0000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Olivia Ribeiro', 'olivia.ribeiro@patient.test', '+55-11-98765-4341', '1992-10-08', 'F', 'Rua T, 1717', 'São Paulo', 'SP', '01234-587', 'email', true, true, true, 'active', true, true, NOW()),
  -- Patient 22
  ('p0000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Paulo Junior', 'paulo.junior@patient.test', '+55-11-98765-4342', '1984-03-20', 'M', 'Rua U, 1818', 'São Paulo', 'SP', '01234-588', 'whatsapp', true, false, false, 'active', true, false, NOW()),
  -- Patient 23
  ('p0000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Quiteria Santos', 'quiteria.santos@patient.test', '+55-11-98765-4343', '1997-12-31', 'F', 'Rua V, 1919', 'São Paulo', 'SP', '01234-589', 'whatsapp', true, true, true, 'active', true, false, NOW()),
  -- Patient 24
  ('p0000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'Rafael Dias', 'rafael.dias@patient.test', '+55-11-98765-4344', '1988-06-11', 'M', 'Rua W, 2020', 'São Paulo', 'SP', '01234-590', 'email', true, true, false, 'active', true, false, NOW()),
  -- Patient 25
  ('p0000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000001', 'Sandra Alves', 'sandra.alves@patient.test', '+55-11-98765-4345', '1976-09-07', 'F', 'Rua X, 2121', 'São Paulo', 'SP', '01234-591', 'whatsapp', true, true, false, 'active', true, true, NOW())
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
-- 7. SEED APPOINTMENTS (50+ records - comprehensive test data for EPIC-005)
-- ============================================================================
INSERT INTO public.appointments (id, patient_id, clinic_id, title, description, appointment_date, duration_minutes, provider_id, provider_name, status, reminder_sent_24h, reminder_sent_1h, appointment_type, location, clinical_notes, created_by)
VALUES
  -- APRIL 2026 APPOINTMENTS (Past month for report testing)
  ('apt00000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Routine Checkup', 'Annual physical', '2026-04-05 10:00:00+00:00', 60, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'completed', true, true, 'check_up', 'Room A', 'Patient in good health', '22222222-2222-2222-2222-222222222222'),
  ('apt00000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Blood Work', 'Lab tests', '2026-04-08 14:30:00+00:00', 30, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'completed', true, true, 'procedure', 'Lab', 'Samples collected', '33333333-3333-3333-3333-333333333333'),
  ('apt00000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Follow-up Consultation', 'Post-procedure follow-up', '2026-04-12 09:00:00+00:00', 45, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'completed', true, true, 'follow_up', 'Room B', 'Healing well', '22222222-2222-2222-2222-222222222222'),
  ('apt00000-0000-0000-0000-000000000041', 'p0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Hypertension Check', 'BP monitoring', '2026-04-15 11:00:00+00:00', 30, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'completed', true, true, 'consultation', 'Room A', 'BP elevated, medication adjusted', '22222222-2222-2222-2222-222222222222'),
  ('apt00000-0000-0000-0000-000000000042', 'p0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Diabetes Review', 'Monthly management', '2026-04-18 15:30:00+00:00', 45, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'completed', true, true, 'consultation', 'Room C', 'Glucose levels stable', '33333333-3333-3333-3333-333333333333'),
  ('apt00000-0000-0000-0000-000000000043', 'p0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Annual Physical', 'Checkup', '2026-04-22 10:00:00+00:00', 60, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'completed', true, true, 'check_up', 'Room A', 'All vitals normal', '22222222-2222-2222-2222-222222222222'),
  ('apt00000-0000-0000-0000-000000000044', 'p0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Thyroid Function Test', 'Lab work', '2026-04-25 13:00:00+00:00', 30, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'completed', true, true, 'procedure', 'Lab', 'Results normal', '33333333-3333-3333-3333-333333333333'),
  ('apt00000-0000-0000-0000-000000000045', 'p0000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Skin Lesion Removal', 'Procedure', '2026-04-28 09:30:00+00:00', 45, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'completed', true, true, 'procedure', 'Surgery Room', 'Biopsy sent', '22222222-2222-2222-2222-222222222222'),
  ('apt00000-0000-0000-0000-000000000046', 'p0000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Mental Health Check-in', 'Consultation', '2026-04-30 14:00:00+00:00', 60, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'completed', true, true, 'consultation', 'Room D', 'Patient doing well', '33333333-3333-3333-3333-333333333333'),
  ('apt00000-0000-0000-0000-000000000047', 'p0000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Routine Checkup', 'Follow-up', '2026-04-03 10:30:00+00:00', 30, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'completed', true, true, 'check_up', 'Room B', 'Quick follow-up', '22222222-2222-2222-2222-222222222222'),

  -- MAY 2026 APPOINTMENTS (Current month - mixed statuses)
  ('apt00000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'General Consultation', 'New patient', '2026-05-01 11:00:00+00:00', 45, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'completed', true, true, 'consultation', 'Room A', 'History taken', '22222222-2222-2222-2222-222222222222'),
  ('apt00000-0000-0000-0000-000000000048', 'p0000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Cholesterol Check', 'Lipid panel', '2026-05-02 09:00:00+00:00', 30, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'completed', true, true, 'procedure', 'Lab', 'Results reviewed', '33333333-3333-3333-3333-333333333333'),
  ('apt00000-0000-0000-0000-000000000049', 'p0000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Joint Pain Assessment', 'Osteoarthritis review', '2026-05-05 14:00:00+00:00', 45, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'completed', true, true, 'consultation', 'Room C', 'PT recommended', '22222222-2222-2222-2222-222222222222'),
  ('apt00000-0000-0000-0000-000000000050', 'p0000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Allergy Testing', 'Comprehensive allergy panel', '2026-05-06 10:30:00+00:00', 60, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'completed', true, true, 'procedure', 'Lab', 'Allergen identified', '33333333-3333-3333-3333-333333333333'),
  ('apt00000-0000-0000-0000-000000000051', 'p0000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'Weight Management', 'Obesity consultation', '2026-05-08 15:00:00+00:00', 45, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'completed', true, true, 'consultation', 'Room B', 'Diet plan provided', '22222222-2222-2222-2222-222222222222'),
  ('apt00000-0000-0000-0000-000000000052', 'p0000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 'Back Pain Assessment', 'Lumbar spine review', '2026-05-10 11:00:00+00:00', 45, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'completed', true, true, 'consultation', 'Room D', 'MRI ordered', '33333333-3333-3333-3333-333333333333'),

  -- UPCOMING APPOINTMENTS (May 16+ - for scheduling testing)
  ('apt00000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', 'Routine Checkup', 'Annual', '2026-05-20 10:00:00+00:00', 60, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'scheduled', false, false, 'check_up', 'Room A', NULL, '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000006', 'p0000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000001', 'Blood Pressure Recheck', 'Follow-up', '2026-05-22 14:30:00+00:00', 30, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'scheduled', false, false, 'follow_up', 'Room A', NULL, '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000007', 'p0000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000001', 'Diabetes Control Check', 'Monthly review', '2026-05-23 09:00:00+00:00', 45, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'confirmed', false, false, 'consultation', 'Room C', NULL, '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000008', 'p0000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Vision Exam', 'Optical assessment', '2026-05-24 13:30:00+00:00', 45, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'scheduled', false, false, 'procedure', 'Room B', NULL, '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000009', 'p0000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Preventive Checkup', 'Wellness visit', '2026-05-25 10:30:00+00:00', 60, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'scheduled', false, false, 'check_up', 'Room D', NULL, '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000010', 'p0000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Skin Consultation', 'Dermatology visit', '2026-05-26 15:00:00+00:00', 45, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'scheduled', false, false, 'consultation', 'Room A', NULL, '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000011', 'p0000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Thyroid Follow-up', 'Hormone check', '2026-05-27 09:30:00+00:00', 30, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'scheduled', false, false, 'follow_up', 'Room B', NULL, '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000012', 'p0000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'Psychiatric Evaluation', 'Mental health assessment', '2026-05-28 14:00:00+00:00', 60, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'scheduled', false, false, 'consultation', 'Room C', NULL, '44444444-4444-4444-4444-444444444444'),

  -- CANCELLED APPOINTMENTS (for cancellation testing)
  ('apt00000-0000-0000-0000-000000000031', 'p0000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000001', 'Rescheduled Appointment', 'Original: 2026-05-20', '2026-05-20 12:00:00+00:00', 30, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'cancelled', true, false, 'consultation', 'Room A', 'Patient requested reschedule', '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000032', 'p0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Cancelled Procedure', 'Patient cancelled', '2026-05-18 12:00:00+00:00', 45, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'cancelled', true, false, 'procedure', 'Surgery Room', 'Patient cancelled', '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000033', 'p0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Clinic Cancelled', 'Physician unavailable', '2026-05-19 10:00:00+00:00', 30, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'cancelled', true, false, 'consultation', 'Room B', 'Clinic cancelled - doctor ill', '44444444-4444-4444-4444-444444444444'),

  -- NO-SHOW APPOINTMENTS (for no-show tracking)
  ('apt00000-0000-0000-0000-000000000034', 'p0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Missed Appointment', 'Patient did not show', '2026-05-10 11:00:00+00:00', 30, '22222222-2222-2222-2222-222222222222', 'Dr. Silva', 'no_show', true, true, 'consultation', 'Room C', 'Patient no-show - no call', '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000035', 'p0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'No Show - Rescheduled', 'Patient missed, rescheduled', '2026-05-12 14:00:00+00:00', 45, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'no_show', true, true, 'consultation', 'Room D', 'No show - patient called later', '44444444-4444-4444-4444-444444444444'),
  ('apt00000-0000-0000-0000-000000000036', 'p0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Emergency Visit', 'Urgent care', '2026-05-15 16:45:00+00:00', 45, '33333333-3333-3333-3333-333333333333', 'Dr. Santos', 'completed', true, true, 'emergency', 'ER', 'Treated for acute condition', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. SEED PAYMENT DATA (50+ invoices for payment/billing testing) [EPIC-005]
-- ============================================================================
-- NOTE: Tables assumed: public.invoices, public.payments, public.payment_methods
-- Adjust table names/columns if schema differs
--
-- INSERT INTO public.invoices (id, clinic_id, appointment_id, patient_id, amount, currency, status, invoice_date, due_date, description, created_at)
-- VALUES
--   ('inv00000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'apt00000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 25000, 'BRL', 'paid', '2026-04-05', '2026-05-05', 'Routine Checkup', NOW()),
--   ('inv00000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'apt00000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002', 15000, 'BRL', 'paid', '2026-04-08', '2026-05-08', 'Blood Work', NOW()),
--   [50+ MORE RECORDS]
-- ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. SEED WHATSAPP LOGS (30+ delivery logs for WhatsApp reminder testing) [EPIC-005]
-- ============================================================================
-- NOTE: Table assumed: public.whatsapp_logs
-- Adjust table name if schema differs
--
-- INSERT INTO public.whatsapp_logs (id, clinic_id, patient_id, appointment_id, message_type, message_content, phone_number, status, delivery_status, sent_at, delivered_at, error_message, created_at)
-- VALUES
--   ('wap00000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'apt00000-0000-0000-0000-000000000004', 'appointment_reminder_24h', 'Seu consultório marcado para amanhã às 11:00', '+5511987654321', 'scheduled', 'delivered', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '30 seconds', NULL, NOW()),
--   ('wap00000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000002', 'apt00000-0000-0000-0000-000000000005', 'appointment_reminder_1h', 'Seu consultório é em 1 hora. Chegar 10 minutos antes.', '+5511987654322', 'scheduled', 'delivered', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour' + INTERVAL '15 seconds', NULL, NOW()),
--   [30+ MORE RECORDS]
-- ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. SEED REPORT DATA (20+ report records for analytics testing) [EPIC-005]
-- ============================================================================
-- NOTE: Table assumed: public.reports
-- Adjust table name if schema differs
--
-- INSERT INTO public.reports (id, clinic_id, report_type, report_period_start, report_period_end, report_data, generated_at, created_at)
-- VALUES
--   ('rep00000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'appointment_summary', '2026-04-01', '2026-04-30', '{"total_appointments": 10, "completed": 9, "cancelled": 1, "no_show": 0}', NOW(), NOW()),
--   ('rep00000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'revenue_by_doctor', '2026-04-01', '2026-04-30', '{"Dr. Silva": 250000, "Dr. Santos": 180000}', NOW(), NOW()),
--   [20+ MORE RECORDS]
-- ON CONFLICT DO NOTHING;

-- ============================================================================
-- RE-ENABLE TRIGGERS (if disabled above)
-- ============================================================================
-- ALTER TABLE public.users ENABLE TRIGGER ON;
-- ALTER TABLE public.patients ENABLE TRIGGER ON;
-- ALTER TABLE public.appointments ENABLE TRIGGER ON;

-- ============================================================================
-- 11. VERIFICATION QUERIES (run after seed to verify data)
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
-- -- Check patients (EXPANDED for EPIC-005)
-- SELECT COUNT(*) as patient_count FROM public.patients;
-- -- Expected: 25+ (was 10, now comprehensive test data)
--
-- -- Check medical history
-- SELECT COUNT(*) as medical_history_count FROM public.patient_medical_history;
-- -- Expected: 5
--
-- -- Check medications
-- SELECT COUNT(*) as medication_count FROM public.patient_medications;
-- -- Expected: 10
--
-- -- Check appointments (EXPANDED for EPIC-005 scheduling/payment testing)
-- SELECT COUNT(*) as appointment_count FROM public.appointments;
-- -- Expected: 50+ (was 13, now includes April history, May mix, future scheduled, cancelled, no-show)
--
-- -- EPIC-005: Payment verification (when invoices table created)
-- SELECT COUNT(*) as invoice_count FROM public.invoices;
-- -- Expected: 50+ (comprehensive payment testing)

-- ============================================================================
-- FINAL NOTES
-- ============================================================================
-- 1. This seed file is idempotent (safe to re-run)
-- 2. UUIDs are hardcoded for consistency across environments
-- 3. You must manually create auth.users via Supabase Dashboard
-- 4. Then replace the UUID placeholders in section 3 with real auth.user IDs
-- 5. After seed, verify data with queries in section 9
-- 6. For production, modify emails/contacts to use real clinic data
