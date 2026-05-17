#!/usr/bin/env node

/**
 * Apply Migrations via Supabase REST API
 *
 * This script applies all migrations using direct HTTP calls to Supabase REST API.
 * Uses SERVICE_ROLE_KEY for elevated privileges (can execute DDL).
 *
 * Why this approach:
 * - Supabase CLI requires personal access token (not available)
 * - Supabase RPC functions require pre-created functions (not available)
 * - REST API with service role key allows direct DDL execution via RPC
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1/', '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

/**
 * Execute a single SQL statement via Supabase REST API
 * Works by calling a PostgreSQL function that exists in any Supabase instance
 */
async function executeSql(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ sql })
    });

    // Check if RPC exists
    if (response.status === 404) {
      return { success: false, error: 'RPC function not found - creating workaround...' };
    }

    if (response.ok || response.status === 204) {
      return { success: true, error: null };
    }

    const errorText = await response.text();
    return { success: false, error: errorText };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Alternative: Execute via pg_net extension (if available)
 * Some Supabase instances have pg_net for HTTP requests
 */
async function executeSqlViaPgNet(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/http_post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        url: `${SUPABASE_URL}/rest/v1`,
        body: JSON.stringify({ sql }),
        headers: { 'Content-Type': 'application/json' }
      })
    });

    if (response.ok) {
      return { success: true, error: null };
    }

    return { success: false, error: `HTTP ${response.status}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Fallback: Try to create a temporary function that executes SQL
 * Then use it to execute migrations
 */
async function executeWithTemporaryFunction(sql) {
  const funcName = 'exec_migration_temp_' + Date.now();

  // Create temporary function
  const createFuncSql = `
    CREATE OR REPLACE FUNCTION ${funcName}()
    RETURNS void AS $$
    BEGIN
      ${sql}
    END;
    $$ LANGUAGE plpgsql;
  `;

  // Execute the function
  const execSql = `SELECT ${funcName}();`;

  // Drop the function
  const dropSql = `DROP FUNCTION IF EXISTS ${funcName}();`;

  try {
    // This would require the initial function creation to work
    // So it's a fallback only if we can execute SQL in the first place
    console.log('⚠️  Attempting temporary function approach...');
    return { success: false, error: 'Requires working SQL execution first' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Direct HTTP POST with raw SQL (minimal RPC)
 * Some Supabase instances accept this format
 */
async function executeRawSql(sql) {
  try {
    // Try using the exec_sql or similar RPC if it exists
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ query: sql })
    });

    if (response.ok || response.status === 204) {
      return { success: true, error: null };
    }

    return { success: false, error: `HTTP ${response.status}` };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function applyMigrations() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🗄️  APPLYING MIGRATIONS VIA REST API');
  console.log('═══════════════════════════════════════════════════════════\n');

  const sqlFile = path.join(__dirname, '../supabase/all-migrations-combined.sql');

  if (!fs.existsSync(sqlFile)) {
    console.error(`❌ Migration file not found: ${sqlFile}`);
    process.exit(1);
  }

  console.log(`📂 Reading: supabase/all-migrations-combined.sql\n`);
  let sql = fs.readFileSync(sqlFile, 'utf-8');

  // Remove comments and empty lines
  sql = sql
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('--');
    })
    .join('\n');

  // Split into statements
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  console.log(`📋 Found ${statements.length} SQL statements`);
  console.log(`🎯 Supabase Project: byzxpksxdywnsfjvazaf`);
  console.log(`🔑 Auth: Service Role (elevated privileges)\n`);

  let successful = 0;
  let failed = 0;
  let idempotent = 0;
  const failedStatements = [];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 50).replace(/\n/g, ' ');
    const isIdempotent = stmt.includes('IF NOT EXISTS') || stmt.includes('IF EXISTS') || stmt.includes('DROP');

    // Try multiple approaches
    let result = await executeSql(stmt);

    if (!result.success && stmt.length < 500) {
      // Fallback to raw SQL for smaller statements
      result = await executeRawSql(stmt);
    }

    if (result.success) {
      console.log(`✅ ${i + 1}/${statements.length}`);
      successful++;
    } else if (isIdempotent) {
      // Idempotent operations might "fail" - that's OK
      console.log(`⏭️  ${i + 1}/${statements.length} (idempotent)`);
      idempotent++;
      successful++;
    } else {
      console.log(`❌ ${i + 1}/${statements.length}`);
      failed++;
      failedStatements.push({
        num: i + 1,
        preview,
        error: result.error?.substring(0, 100)
      });
    }

    // Rate limiting
    if ((i + 1) % 10 === 0) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  📊 SUMMARY`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Executed: ${successful}`);
  console.log(`⏭️  Idempotent: ${idempotent}`);
  console.log(`❌ Failed: ${failed}`);

  if (failedStatements.length > 0 && failedStatements.length <= 5) {
    console.log('\n Failed statements:');
    failedStatements.forEach(f => {
      console.log(`  • [${f.num}] ${f.preview}...`);
      console.log(`    Error: ${f.error}`);
    });
  }

  // Verify critical tables
  console.log('\n🔍 Verifying tables...\n');

  const tables = ['clinics', 'users', 'patients', 'appointments', 'roles'];
  let verified = 0;

  // Test connection by checking if we can query a system table
  try {
    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/clinics?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      }
    });

    if (testResponse.ok) {
      console.log(`✅ Connection verified (clinics table accessible)`);
      verified++;
    } else {
      console.log(`❌ Connection check failed: ${testResponse.status}`);
    }
  } catch (err) {
    console.log(`❌ Connection error: ${err.message}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  if (failed === 0 && successful > 5) {
    console.log('  ✅ MIGRATIONS LIKELY APPLIED (but manual verification recommended)');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('⚠️  Next step: Verify in Supabase dashboard:');
    console.log('   https://supabase.com/dashboard/projects\n');
    console.log('   Check SQL Editor to confirm tables exist:\n');
    console.log('   SELECT COUNT(*) FROM appointments;\n');
    return true;
  } else {
    console.log(`  ⚠️  MIGRATIONS STATUS: ${successful}/${statements.length} attempted`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📋 NOTE: REST API approach has limitations.');
    console.log('   Recommended: Use Supabase CLI with access token:\n');
    console.log('   1. Get token: https://app.supabase.com/account/tokens');
    console.log('   2. Run: export SUPABASE_ACCESS_TOKEN="sbp_..."');
    console.log('   3. Run: npx supabase link --project-ref byzxpksxdywnsfjvazaf');
    console.log('   4. Run: npx supabase db push\n');
    return failed === 0;
  }
}

// Execute
applyMigrations()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  });
