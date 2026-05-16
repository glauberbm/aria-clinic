#!/usr/bin/env node

/**
 * Seed Clinics
 * Creates clinic records required for patient data relationships
 */

const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1/', '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const CLINIC_ID = '00000000-0000-0000-0000-000000000001';

async function seedClinics() {
  console.log('🏥 Seeding clinic data...\n');

  const clinics = [{
    id: CLINIC_ID,
    name: 'SV Clinic Aria',
  }];

  try {
    const { error } = await supabase.from('clinics').insert(clinics);
    if (error) {
      if (error.message.includes('duplicate')) {
        console.log('  ⚠️  Clinic already exists');
      } else {
        throw error;
      }
    } else {
      console.log(`  ✅ Clinic created: ${clinics[0].name}`);
    }
    return true;
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    return false;
  }
}

async function main() {
  try {
    await seedClinics();
    console.log('\n✅ Clinic seed complete');
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

main();
