#!/usr/bin/env node

/**
 * Debug Auth Users
 * Checks user status and verifies login
 */

const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1/', '');
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const anonClient = createClient(SUPABASE_URL, ANON_KEY);

async function main() {
  console.log('🔍 DEBUGGING AUTH USERS\n');

  // Step 1: List all auth users
  console.log('📋 Listing auth users...');
  try {
    const { data: users, error } = await adminClient.auth.admin.listUsers();
    if (error) throw error;

    const stagingUsers = users.users.filter(u => u.email?.includes('aria-staging'));
    console.log(`Found ${stagingUsers.length} staging users:\n`);

    for (const user of stagingUsers) {
      console.log(`User: ${user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Confirmed: ${user.email_confirmed_at ? 'YES' : 'NO'}`);
      console.log(`  Last sign-in: ${user.last_sign_in_at || 'Never'}`);
      console.log(`  Created: ${user.created_at}`);
      console.log('');
    }
  } catch (err) {
    console.error('❌ Error listing users:', err.message);
  }

  // Step 2: Test login with anon client (like the app does)
  console.log('🧪 Testing login with anon client...');
  try {
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: 'admin@aria-staging.test',
      password: 'Test@12345',
    });

    if (error) {
      console.error(`❌ Login failed: ${error.message}`);
      console.error(`   Error status: ${error.status}`);
    } else if (data.user) {
      console.log(`✅ Login successful!`);
      console.log(`   User: ${data.user.email}`);
      console.log(`   Session expires in: ${data.session.expires_in}s`);
    }
  } catch (err) {
    console.error('❌ Login test failed:', err.message);
  }

  // Step 3: Try to reset password and retry
  console.log('\n💾 Attempting password reset...');
  try {
    const { error } = await anonClient.auth.resetPasswordForEmail('admin@aria-staging.test');
    if (error) {
      console.log(`⚠️  Reset email sent (check: ${error.message})`);
    } else {
      console.log('✅ Password reset email sent');
    }
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
  }

  // Step 4: Try updating password via admin
  console.log('\n🔑 Updating user password via admin client...');
  try {
    // First get the user ID
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
    if (listError) throw listError;

    const adminUser = users.users.find(u => u.email === 'admin@aria-staging.test');
    if (!adminUser) {
      console.error('❌ Admin user not found');
    } else {
      const { data, error } = await adminClient.auth.admin.updateUserById(adminUser.id, {
        password: 'Test@12345',
      });

      if (error) {
        console.error(`❌ Password update failed: ${error.message}`);
      } else {
        console.log(`✅ Password updated for ${data.user.email}`);

        // Try login again
        console.log('\n🧪 Retesting login after password update...');
        const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
          email: 'admin@aria-staging.test',
          password: 'Test@12345',
        });

        if (loginError) {
          console.error(`❌ Login still failed: ${loginError.message}`);
        } else if (loginData.user) {
          console.log(`✅ LOGIN SUCCESSFUL AFTER PASSWORD RESET!`);
          console.log(`   User: ${loginData.user.email}`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Admin operation failed:', err.message);
  }
}

main().catch(console.error);
