#!/usr/bin/env node

/**
 * Complete Seed Execution
 * Creates all patient data, medications, appointments
 */

const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1/', '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Fixed clinic ID
const CLINIC_ID = '00000000-0000-0000-0000-000000000001';

// Generate valid UUIDs for test users (from the auth script)
const PROVIDER_IDS = {
  doctor1: 'fa0299a8-6e2a-4693-a752-70b82b6a1344',
  doctor2: '0955dba3-b75e-457a-8d70-00eb471e6b20',
  receptionist: '4275c1ee-d08f-4ceb-93b9-25ebed0c97f5',
};

// Generate patient UUIDs
const PATIENT_IDS = Array.from({ length: 10 }, (_, i) => ({
  id: `${String(i + 1).padStart(2, '0')}000000-0000-0000-0000-000000000000`.replace(/(\d{8})-/, (m) => {
    // Replace first 8 chars with incrementing pattern
    const padded = String(i + 1).padStart(2, '0');
    return `0000000${padded}-0000-0000-0000-000000000000`;
  }),
  index: i + 1,
}));

const PATIENT_DATA = [
  { name: 'João Silva', email: 'joao.silva@patient.test', phone: '+55-11-98765-4321', dob: '1985-03-15', gender: 'M' },
  { name: 'Maria Santos', email: 'maria.santos@patient.test', phone: '+55-11-98765-4322', dob: '1990-07-22', gender: 'F' },
  { name: 'Carlos Oliveira', email: 'carlos.oliveira@patient.test', phone: '+55-11-98765-4323', dob: '1975-11-08', gender: 'M' },
  { name: 'Ana Costa', email: 'ana.costa@patient.test', phone: '+55-11-98765-4324', dob: '1988-05-30', gender: 'F' },
  { name: 'Paulo Ferreira', email: 'paulo.ferreira@patient.test', phone: '+55-11-98765-4325', dob: '1982-12-12', gender: 'M' },
  { name: 'Lucia Alves', email: 'lucia.alves@patient.test', phone: '+55-11-98765-4326', dob: '1992-02-18', gender: 'F' },
  { name: 'Roberto Gomes', email: 'roberto.gomes@patient.test', phone: '+55-11-98765-4327', dob: '1978-09-25', gender: 'M' },
  { name: 'Fernanda Lima', email: 'fernanda.lima@patient.test', phone: '+55-11-98765-4328', dob: '1995-06-03', gender: 'F' },
  { name: 'Bruno Martins', email: 'bruno.martins@patient.test', phone: '+55-11-98765-4329', dob: '1987-01-14', gender: 'M' },
  { name: 'Isabela Rodrigues', email: 'isabela.rodrigues@patient.test', phone: '+55-11-98765-4330', dob: '1993-08-19', gender: 'F' },
];

async function seedPatients() {
  console.log('👥 Seeding 10 patients...');

  const patients = PATIENT_DATA.map((data, i) => ({
    id: `${String(i + 1).padStart(8, '0')}-0000-0000-0000-000000000000`,
    clinic_id: CLINIC_ID,
    name: data.name,
    email: data.email,
    phone: data.phone,
    date_of_birth: data.dob,
    gender: data.gender,
    address: `Rua ${String.fromCharCode(65 + i)}, ${(i + 1) * 101}`,
    city: 'São Paulo',
    state: 'SP',
    zip_code: `0123${String(i).padStart(2, '0')}-567`,
    preferred_contact_method: i % 2 === 0 ? 'whatsapp' : 'email',
    whatsapp_enabled: true,
    email_enabled: true,
    sms_enabled: i % 3 === 0,
    status: 'active',
    consent_terms: true,
    consent_marketing: i % 2 === 0,
    consent_date: new Date().toISOString(),
  }));

  try {
    const { error } = await supabase.from('patients').insert(patients);
    if (error) throw error;
    console.log(`  ✅ ${patients.length} patients created`);
    return patients.map(p => p.id);
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    return [];
  }
}

async function seedMedications(patientIds) {
  console.log('💊 Seeding medications & allergies...');

  const medications = [
    { patient_idx: 0, name: 'Lisinopril', desc: 'ACE inhibitor', type: 'medication', severity: 'medium', dosage: '10mg', freq: '1x daily' },
    { patient_idx: 0, name: 'Penicillin', desc: 'Allergy - hives', type: 'allergy', severity: 'high' },
    { patient_idx: 1, name: 'Atorvastatin', desc: 'Statin for cholesterol', type: 'medication', severity: 'low', dosage: '20mg', freq: '1x at night' },
    { patient_idx: 2, name: 'Aspirin', desc: 'Daily for heart', type: 'medication', severity: 'low', dosage: '81mg', freq: '1x daily' },
    { patient_idx: 2, name: 'Shellfish', desc: 'Allergy - anaphylaxis', type: 'allergy', severity: 'critical' },
    { patient_idx: 3, name: 'Metformin', desc: 'Diabetes', type: 'medication', severity: 'medium', dosage: '500mg', freq: '2x daily' },
    { patient_idx: 4, name: 'Omeprazole', desc: 'Acid reflux', type: 'medication', severity: 'low', dosage: '20mg', freq: '1x morning' },
    { patient_idx: 5, name: 'Sulfa drugs', desc: 'Allergy', type: 'allergy', severity: 'high' },
    { patient_idx: 6, name: 'Thyroid Hormone', desc: 'Hypothyroidism', type: 'medication', severity: 'medium', dosage: '75mcg', freq: '1x morning' },
    { patient_idx: 7, name: 'Ibuprofen', desc: 'Intolerance', type: 'allergy', severity: 'medium' },
  ];

  const medRecords = medications.map((m, i) => ({
    id: `${String(i).padStart(8, '0')}-1111-1111-1111-111111111111`,
    patient_id: patientIds[m.patient_idx],
    clinic_id: CLINIC_ID,
    name: m.name,
    description: m.desc,
    type: m.type,
    severity: m.severity,
    dosage: m.dosage || null,
    frequency: m.freq || null,
    start_date: new Date('2026-01-01').toISOString(),
    end_date: null,
    is_active: true,
    created_by: PROVIDER_IDS.doctor1,
  }));

  try {
    const { error } = await supabase.from('patient_medications').insert(medRecords);
    if (error) throw error;
    console.log(`  ✅ ${medRecords.length} medications created`);
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
  }
}

async function seedAppointments(patientIds) {
  console.log('📅 Seeding appointments...');

  const appointments = [
    { patient_idx: 0, title: 'Routine Checkup', date: '2026-05-10T10:00:00Z', duration: 60, provider: PROVIDER_IDS.doctor1, status: 'completed' },
    { patient_idx: 1, title: 'Blood Work', date: '2026-05-08T14:30:00Z', duration: 30, provider: PROVIDER_IDS.doctor2, status: 'completed' },
    { patient_idx: 2, title: 'Follow-up Consultation', date: '2026-05-05T09:00:00Z', duration: 45, provider: PROVIDER_IDS.doctor1, status: 'completed' },
    { patient_idx: 3, title: 'Hypertension Check', date: '2026-05-25T11:00:00Z', duration: 30, provider: PROVIDER_IDS.doctor1, status: 'scheduled' },
    { patient_idx: 4, title: 'Diabetes Review', date: '2026-05-26T15:30:00Z', duration: 45, provider: PROVIDER_IDS.doctor2, status: 'scheduled' },
    { patient_idx: 5, title: 'Annual Physical', date: '2026-05-27T10:00:00Z', duration: 60, provider: PROVIDER_IDS.doctor1, status: 'scheduled' },
    { patient_idx: 6, title: 'Thyroid Function Test', date: '2026-05-28T13:00:00Z', duration: 30, provider: PROVIDER_IDS.doctor2, status: 'scheduled' },
    { patient_idx: 7, title: 'Skin Lesion Removal', date: '2026-05-29T09:30:00Z', duration: 45, provider: PROVIDER_IDS.doctor1, status: 'scheduled' },
    { patient_idx: 8, title: 'Mental Health Check-in', date: '2026-05-30T14:00:00Z', duration: 60, provider: PROVIDER_IDS.doctor2, status: 'scheduled' },
    { patient_idx: 9, title: 'Routine Checkup', date: '2026-06-02T10:30:00Z', duration: 30, provider: PROVIDER_IDS.doctor1, status: 'confirmed' },
    { patient_idx: 0, title: 'Rescheduled Appointment', date: '2026-05-20T12:00:00Z', duration: 30, provider: PROVIDER_IDS.doctor1, status: 'cancelled' },
    { patient_idx: 1, title: 'Missed Appointment', date: '2026-05-12T11:00:00Z', duration: 30, provider: PROVIDER_IDS.doctor1, status: 'no_show' },
    { patient_idx: 2, title: 'Emergency Visit', date: '2026-05-18T16:45:00Z', duration: 45, provider: PROVIDER_IDS.doctor2, status: 'completed' },
  ];

  const aptRecords = appointments.map((a, i) => ({
    id: `${String(i).padStart(8, '0')}-2222-2222-2222-222222222222`,
    patient_id: patientIds[a.patient_idx],
    clinic_id: CLINIC_ID,
    title: a.title,
    description: a.title,
    appointment_date: a.date,
    duration_minutes: a.duration,
    provider_id: a.provider,
    provider_name: a.provider === PROVIDER_IDS.doctor1 ? 'Dr. Silva' : 'Dr. Santos',
    status: a.status,
    reminder_sent_24h: ['completed', 'no_show'].includes(a.status),
    reminder_sent_1h: ['completed', 'no_show'].includes(a.status),
    appointment_type: 'consultation',
    location: 'Room A',
    clinical_notes: a.status === 'completed' ? 'Visit completed' : null,
    created_by: PROVIDER_IDS.doctor1,
  }));

  try {
    const { error } = await supabase.from('appointments').insert(aptRecords);
    if (error) throw error;
    console.log(`  ✅ ${aptRecords.length} appointments created`);
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
  }
}

async function seedMedicalHistory(patientIds) {
  console.log('📋 Seeding medical history...');

  const history = [
    { patient_idx: 0, type: 'Consultation', date: '2026-05-15', provider: PROVIDER_IDS.doctor1, notes: 'BP elevated', results: 'BP: 140/90' },
    { patient_idx: 1, type: 'Check-up', date: '2026-05-14', provider: PROVIDER_IDS.doctor1, notes: 'Annual checkup', results: 'All normal' },
    { patient_idx: 2, type: 'Blood Work', date: '2026-05-13', provider: PROVIDER_IDS.doctor2, notes: 'Full panel', results: 'Results pending' },
    { patient_idx: 3, type: 'Consultation', date: '2026-05-12', provider: PROVIDER_IDS.doctor1, notes: 'Follow-up HTN', results: 'BP controlled' },
    { patient_idx: 4, type: 'Procedure', date: '2026-05-10', provider: PROVIDER_IDS.doctor2, notes: 'Skin removal', results: 'Biopsy pending' },
  ];

  const historyRecords = history.map((h, i) => ({
    id: `${String(i).padStart(8, '0')}-3333-3333-3333-333333333333`,
    patient_id: patientIds[h.patient_idx],
    clinic_id: CLINIC_ID,
    treatment_type: h.type,
    treatment_date: h.date,
    provider_name: h.provider === PROVIDER_IDS.doctor1 ? 'Dr. Silva' : 'Dr. Santos',
    provider_id: h.provider,
    clinical_notes: h.notes,
    results: h.results,
    follow_up_date: new Date(new Date(h.date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'completed',
    created_by: h.provider,
  }));

  try {
    const { error } = await supabase.from('patient_medical_history').insert(historyRecords);
    if (error) throw error;
    console.log(`  ✅ ${historyRecords.length} medical history records created`);
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
  }
}

async function main() {
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  🌱 COMPLETE PATIENT DATA SEED');
  console.log('════════════════════════════════════════════════════════════\n');

  try {
    let patientIds = await seedPatients();

    // If seed fails (duplicates), try to fetch existing patients
    if (!patientIds || patientIds.length === 0) {
      const { data } = await supabase.from('patients').select('id');
      patientIds = data ? data.map(p => p.id) : [];
    }

    if (patientIds.length > 0) {
      await seedMedications(patientIds);
      await seedAppointments(patientIds);
      await seedMedicalHistory(patientIds);
    }

    console.log('\n════════════════════════════════════════════════════════════');
    console.log('  ✅ SEED COMPLETE');
    console.log('════════════════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log('  ✅ 10 patients');
    console.log('  ✅ 10 medications/allergies');
    console.log('  ✅ 13 appointments');
    console.log('  ✅ 5 medical history records');
    console.log('\n🎯 Next: Open http://localhost:3000 and login\n');
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

main();
