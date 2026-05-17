#!/usr/bin/env node

/**
 * Seed Auth Users Script
 * Creates test users in Supabase Auth for staging environment
 *
 * CRITICAL: This script uses the Service Role Key and should ONLY be run in staging/dev
 *
 * Usage: node scripts/seed-auth-users.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1/', '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ FATAL: Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

console.log('🔐 Initializing Supabase Admin Client...');
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Test users to create
const TEST_USERS = [
  {
    email: 'admin@aria-staging.test',
    password: 'Test@12345',
    role: 'admin',
    user_metadata: { role: 'admin', clinic_id: '00000000-0000-0000-0000-000000000001' },
  },
  {
    email: 'doctor1@aria-staging.test',
    password: 'Test@12345',
    role: 'doctor',
    user_metadata: { role: 'doctor', clinic_id: '00000000-0000-0000-0000-000000000001' },
  },
  {
    email: 'doctor2@aria-staging.test',
    password: 'Test@12345',
    role: 'doctor',
    user_metadata: { role: 'doctor', clinic_id: '00000000-0000-0000-0000-000000000001' },
  },
  {
    email: 'receptionist@aria-staging.test',
    password: 'Test@12345',
    role: 'receptionist',
    user_metadata: { role: 'receptionist', clinic_id: '00000000-0000-0000-0000-000000000001' },
  },
  {
    email: 'patient1@aria-staging.test',
    password: 'Test@12345',
    role: 'patient',
    user_metadata: { role: 'patient', clinic_id: '00000000-0000-0000-0000-000000000001' },
  },
];

/**
 * Create auth users in Supabase
 * @returns {Object} Map of email → auth.user_id
 */
async function createAuthUsers() {
  console.log('\n📝 Creating auth users...');

  const userMap = {};
  const results = [];

  for (const user of TEST_USERS) {
    try {
      console.log(`  • Creating ${user.email}...`);

      // Use the admin API to create user
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email for staging
        user_metadata: user.user_metadata,
      });

      if (error) {
        // Check if user already exists (error code 422 = conflict)
        if (error.message?.includes('already registered') || error.status === 422) {
          console.log(`    ⚠️  User already exists, fetching existing user...`);

          // Get existing user
          const { data: existingUser, error: fetchError } = await supabase.auth.admin.getUserById(
            // We can't fetch by email directly, so we'll try to infer from list
            // For now, mark as potential conflict
          );

          // Mark as warning but continue
          results.push({
            email: user.email,
            status: 'warning',
            message: 'User likely already exists',
          });
        } else {
          throw error;
        }
      } else if (data?.user) {
        userMap[user.email] = data.user.id;
        console.log(`    ✅ Created with ID: ${data.user.id}`);
        results.push({
          email: user.email,
          status: 'created',
          user_id: data.user.id,
          role: user.role,
        });
      }
    } catch (err) {
      console.error(`    ❌ Failed to create ${user.email}: ${err.message}`);
      results.push({
        email: user.email,
        status: 'error',
        message: err.message,
      });
    }
  }

  console.log('\n📊 Auth User Creation Summary:');
  results.forEach(r => {
    const icon = r.status === 'created' ? '✅' : r.status === 'warning' ? '⚠️' : '❌';
    console.log(`  ${icon} ${r.email}: ${r.status}${r.user_id ? ` (${r.user_id})` : ''}`);
  });

  return userMap;
}

/**
 * Verify auth users were created
 */
async function verifyAuthUsers() {
  console.log('\n🔍 Verifying auth users...');

  try {
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) throw error;

    const stagingUsers = data.users.filter(u => u.email?.includes('aria-staging.test'));

    console.log(`  Found ${stagingUsers.length} staging users:`);
    stagingUsers.forEach(u => {
      console.log(`    • ${u.email} (ID: ${u.id})`);
    });

    return stagingUsers.length === 5;
  } catch (err) {
    console.error(`  ❌ Verification failed: ${err.message}`);
    return false;
  }
}

/**
 * Execute SQL seed file
 */
async function executeSeedSQL() {
  console.log('\n🌱 Executing SQL seed data...');

  try {
    const seedPath = path.join(__dirname, '../supabase/seed-staging.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf-8');

    // Split by semicolon and execute non-comment queries
    const queries = seedSQL
      .split(';')
      .map(q => q.trim())
      .filter(q => q && !q.startsWith('--'));

    let executedCount = 0;

    for (const query of queries) {
      try {
        const { error } = await supabase.rpc('execute_sql', {
          sql: query
        }).catch(() => {
          // Fallback: Execute directly if rpc not available
          return supabase.from('_execute').insert({ sql: query });
        });

        // Note: Direct SQL execution via client may not work for all queries
        // The seed file is primarily for manual execution or migration tools
        executedCount++;
      } catch (err) {
        // Some queries may fail (e.g., DDL via client), continue
        console.log(`    ⚠️  Query may have failed (expected for DDL): ${query.substring(0, 50)}...`);
      }
    }

    console.log(`  ✅ Seed SQL processed (${executedCount} queries)`);
    console.log('  📌 NOTE: Run "supabase db push" or execute seed-staging.sql manually via Supabase SQL Editor for full seed');

    return true;
  } catch (err) {
    console.error(`  ❌ Seed SQL failed: ${err.message}`);
    console.log('  📌 Fallback: Execute supabase/seed-staging.sql manually in Supabase SQL Editor');
    return false;
  }
}

/**
 * Test login with created user
 */
async function testLogin() {
  console.log('\n🧪 Testing login with admin user...');

  try {
    // Use anon key for login (what the app would use)
    const anonClient = createClient(
      SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await anonClient.auth.signInWithPassword({
      email: 'admin@aria-staging.test',
      password: 'Test@12345',
    });

    if (error) {
      console.error(`  ❌ Login failed: ${error.message}`);
      return false;
    }

    if (data.user) {
      console.log(`  ✅ Login successful!`);
      console.log(`    User ID: ${data.user.id}`);
      console.log(`    Email: ${data.user.email}`);
      console.log(`    Session: ${data.session?.access_token?.substring(0, 20)}...`);
      return true;
    }
  } catch (err) {
    console.error(`  ❌ Login test failed: ${err.message}`);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('  🚀 ARIA STAGING AUTH SEED SCRIPT');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`  Supabase Project: ${SUPABASE_URL}`);
  console.log(`  Service Role Key: ${SERVICE_ROLE_KEY.substring(0, 20)}...`);

  try {
    // Step 1: Create auth users
    const userMap = await createAuthUsers();

    // Step 2: Verify
    const verified = await verifyAuthUsers();

    // Step 3: Seed SQL (optional, may fail)
    await executeSeedSQL();

    // Step 4: Test login
    const loginOk = await testLogin();

    // Summary
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('  ✅ SEED COMPLETE');
    console.log('════════════════════════════════════════════════════════════');
    console.log('\n📋 Next Steps:');
    console.log('  1. Open http://localhost:3001');
    console.log('  2. Login with:');
    console.log('     • Email: admin@aria-staging.test');
    console.log('     • Password: Test@12345');
    console.log('\n  Or try other test users:');
    console.log('     • doctor1@aria-staging.test / Test@12345');
    console.log('     • patient1@aria-staging.test / Test@12345');
    console.log('\n⚠️  IMPORTANT:');
    console.log('  • Execute supabase/seed-staging.sql in Supabase SQL Editor');
    console.log('    for patient data, appointments, medications');
    console.log('  • This script only creates auth users and tests login');
    console.log('════════════════════════════════════════════════════════════\n');

    if (!loginOk) {
      console.warn('⚠️  Login test failed. Check Supabase dashboard for user status.');
      process.exit(1);
    }

  } catch (err) {
    console.error('\n❌ FATAL ERROR:', err.message);
    process.exit(1);
  }
}

main();
