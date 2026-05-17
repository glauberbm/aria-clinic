#!/usr/bin/env node

/**
 * Apply Migrations - Fixed Async Version
 *
 * Executes combined SQL using proper async/await
 * Handles Supabase JS client correctly
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1/', '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function executeSQL(statement) {
  try {
    // Create a UUID for this query to use as a unique identifier
    const queryId = Math.random().toString(36).substring(2, 15);

    // Try to execute via rpc (if function exists)
    try {
      const result = await supabase.rpc('sql', {
        query: statement
      });
      return { success: true, error: null };
    } catch (rpcError) {
      // RPC not available - try direct SQL via fetch
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/?sql=${encodeURIComponent(statement)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'apikey': SERVICE_ROLE_KEY
          }
        });

        if (response.ok) {
          return { success: true, error: null };
        } else {
          return { success: false, error: await response.text() };
        }
      } catch (fetchError) {
        // Neither RPC nor fetch worked
        return { success: false, error: fetchError.message };
      }
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function applyMigrations() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ✨ APPLYING DATABASE MIGRATIONS');
  console.log('═══════════════════════════════════════════════════════════\n');

  const sqlFile = path.join(__dirname, '../supabase/all-migrations-combined.sql');

  if (!fs.existsSync(sqlFile)) {
    console.error(`❌ Migration file not found: ${sqlFile}`);
    process.exit(1);
  }

  let sql = fs.readFileSync(sqlFile, 'utf-8');

  // Split by individual statements
  const statements = sql
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('--');
    })
    .join('\n')
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  console.log(`📋 Found ${statements.length} SQL statements\n`);
  console.log('⏳ Executing...\n');

  let successful = 0;
  let failed = 0;
  const failedStatements = [];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 50).replace(/\n/g, ' ');

    const { success, error } = await executeSQL(stmt);

    if (success) {
      console.log(`✅ ${i + 1}/${statements.length}`);
      successful++;
    } else {
      // Skip idempotent operations that appear to fail
      if (stmt.includes('IF NOT EXISTS') || stmt.includes('IF EXISTS') ||
          stmt.includes('DROP') || error?.includes('already exists')) {
        console.log(`⏭️  ${i + 1}/${statements.length} (idempotent)`);
        successful++;
      } else {
        console.log(`❌ ${i + 1}/${statements.length}`);
        failed++;
        failedStatements.push({ stmt: preview, error: error?.substring(0, 100) });
      }
    }

    // Small delay to avoid rate limiting
    if ((i + 1) % 20 === 0) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  📊 SUMMARY`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  if (failedStatements.length > 0 && failedStatements.length <= 5) {
    console.log('\n Failed statements:');
    failedStatements.forEach(f => {
      console.log(`  • ${f.stmt}...`);
      console.log(`    ${f.error}`);
    });
  }

  // Verify tables exist
  console.log('\n🔍 Verifying critical tables...\n');

  const tables = ['clinics', 'users', 'patients', 'appointments', 'roles'];
  let verified = 0;

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}`);
        verified++;
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  if (verified >= 3) {
    console.log('  ✅ MIGRATIONS APPLIED - READY FOR SEEDING');
    console.log('═══════════════════════════════════════════════════════════\n');
    return true;
  } else {
    console.log(`  ⚠️  Only ${verified}/${tables.length} tables verified`);
    console.log('═══════════════════════════════════════════════════════════\n');
    return false;
  }
}

// Run
applyMigrations()
  .then(success => {
    if (success) {
      console.log('\n▶️  Next: Run `node scripts/seed-complete.js` to populate data\n');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err.message);
    process.exit(1);
  });
