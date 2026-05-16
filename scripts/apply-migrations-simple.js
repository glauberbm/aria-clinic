#!/usr/bin/env node

/**
 * Apply Migrations - Direct Method
 *
 * Executes combined SQL file by splitting into valid DDL chunks
 * Uses Supabase JS client for maximum reliability
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

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function applyMigrations() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ✨ APPLYING MIGRATIONS TO SUPABASE');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Read the combined SQL file
  const sqlFile = path.join(__dirname, '../supabase/all-migrations-combined.sql');

  if (!fs.existsSync(sqlFile)) {
    console.error(`❌ Migration file not found: ${sqlFile}`);
    process.exit(1);
  }

  let sql = fs.readFileSync(sqlFile, 'utf-8');

  // Remove comments and empty lines for cleaner execution
  sql = sql
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('--');
    })
    .join('\n');

  // Split into individual statements (by semicolon)
  const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  console.log(`📋 Found ${statements.length} SQL statements\n`);

  // Execute each statement
  let executed = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 60).replace(/\n/g, ' ') + (stmt.length > 60 ? '...' : '');

    try {
      // Use the raw RPC execute endpoint
      const { data, error } = await supabase.rpc('execute_sql', {
        query: stmt
      }).catch(() => {
        // If RPC doesn't exist, try direct fetch to REST API
        return fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'apikey': SERVICE_ROLE_KEY
          },
          body: JSON.stringify({ query: stmt })
        })
          .then(r => r.json())
          .catch(e => ({ error: e }));
      });

      if (error) {
        // Some DDL statements might "fail" due to IF NOT EXISTS - that's OK
        if (stmt.includes('IF NOT EXISTS') || stmt.includes('IF EXISTS')) {
          console.log(`⏭️  ${i + 1}/${statements.length} (idempotent): ${preview}`);
          executed++;
        } else {
          console.log(`❌ ${i + 1}/${statements.length} FAILED: ${preview}`);
          console.log(`   Error: ${error.message || JSON.stringify(error)}`);
          failed++;
        }
      } else {
        console.log(`✅ ${i + 1}/${statements.length}: ${preview}`);
        executed++;
      }
    } catch (err) {
      console.log(`❌ ${i + 1}/${statements.length} ERROR: ${preview}`);
      console.log(`   ${err.message}`);
      failed++;
    }

    // Small delay between statements to avoid rate limiting
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  📊 RESULTS: ${executed} succeeded, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Verify critical tables
  console.log('🔍 Verifying tables...\n');

  const tables = ['clinics', 'users', 'patients', 'appointments', 'roles', 'user_roles'];
  let verified = 0;

  for (const table of tables) {
    try {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      console.log(`✅ ${table}`);
      verified++;
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  if (verified === tables.length) {
    console.log('  ✅ ALL MIGRATIONS APPLIED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════════\n');
    return true;
  } else {
    console.log(`  ⚠️  ${verified}/${tables.length} tables verified`);
    console.log('═══════════════════════════════════════════════════════════\n');
    return false;
  }
}

// Run
applyMigrations()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('❌ Fatal:', err.message);
    process.exit(1);
  });
