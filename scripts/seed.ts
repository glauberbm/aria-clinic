import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Doctors/Providers
    console.log('📝 Seeding doctors...');
    const { data: doctorsData, error: doctorsError } = await supabase
      .from('users')
      .insert([
        {
          id: 'doc-001',
          name: 'Dr. João Silva',
          email: 'joao@clinic.local',
          role: 'doctor',
          created_at: new Date().toISOString(),
        },
        {
          id: 'doc-002',
          name: 'Dra. Maria Santos',
          email: 'maria@clinic.local',
          role: 'doctor',
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (doctorsError && !doctorsError.message.includes('duplicate')) {
      console.warn('⚠️ Doctor insert warning:', doctorsError.message);
    } else {
      console.log('✅ Doctors seeded:', doctorsData?.length || '(already exist)');
    }

    // Patients
    console.log('📝 Seeding patients...');
    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .insert([
        {
          id: 'pat-001',
          name: 'João Cliente',
          email: 'joao.cliente@example.com',
          phone: '+5511999999999',
          date_of_birth: '1990-05-15',
          sex: 'M',
          status: 'active',
          created_at: new Date().toISOString(),
        },
        {
          id: 'pat-002',
          name: 'Maria Cliente',
          email: 'maria.cliente@example.com',
          phone: '+5511988888888',
          date_of_birth: '1995-03-20',
          sex: 'F',
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (patientsError && !patientsError.message.includes('duplicate')) {
      console.warn('⚠️ Patient insert warning:', patientsError.message);
    } else {
      console.log('✅ Patients seeded:', patientsData?.length || '(already exist)');
    }

    // Verify seed data
    console.log('\n📊 Verifying seed data...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, role');

    const { data: patients, error: patientsCheckError } = await supabase
      .from('patients')
      .select('id, name, status');

    if (!usersError && users) {
      console.log(`✅ Users in DB: ${users.length}`);
    }

    if (!patientsCheckError && patients) {
      console.log(`✅ Patients in DB: ${patients.length}`);
    }

    console.log('\n✅ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
