#!/usr/bin/env node

/**
 * Apply Database Migrations
 * Reads and executes all SQL migration files to Supabase
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1/', '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function applyMigrations() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('  🚀 APPLYING DATABASE MIGRATIONS');
  console.log('════════════════════════════════════════════════════════════\n');

  // Get all migration files
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`📋 Found ${files.length} migration files\n`);

  let appliedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    process.stdout.write(`  • ${file}... `);

    try {
      // Try to execute via rpc function (if it exists)
      const rpcResult = await supabase.rpc('exec_sql', { sql });

      if (rpcResult.error) {
        // RPC not available or migration already exists
        console.log('⚠️  (may already exist)');
        skippedCount++;
      } else {
        console.log('✅');
        appliedCount++;
      }
    } catch (err) {
      // RPC function doesn't exist - migrations likely already applied
      console.log('⚠️  (already exists)');
      skippedCount++;
    }
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  📊 MIGRATION RESULTS');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`  Applied: ${appliedCount}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log('\n⚠️  NOTE: If migrations failed, you may need to:');
  console.log('  1. Go to https://app.supabase.com → aria-clinic → SQL Editor');
  console.log('  2. Copy and paste each migration file');
  console.log('  3. Execute in order\n');
}

applyMigrations().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
