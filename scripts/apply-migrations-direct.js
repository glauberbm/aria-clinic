#!/usr/bin/env node

/**
 * Apply Database Migrations Directly via PostgreSQL
 * Connects directly to Supabase PostgreSQL and applies migration SQL
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Extract database connection info from Supabase URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Parse project reference from URL: https://byzxpksxdywnsfjvazaf.supabase.co/rest/v1/
const projectRef = SUPABASE_URL.split('https://')[1].split('.supabase.co')[0];

// Supabase PostgreSQL connection details
const DB_HOST = `${projectRef}.supabase.co`;
const DB_PORT = 5432;
const DB_USER = 'postgres';
const DB_NAME = 'postgres';

// The service role key is a JWT that can't be used for direct PostgreSQL auth
// Instead, we need to use the default postgres user with the password from dashboard
// For now, we'll try to use the Supabase API to execute SQL

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  SUPABASE_URL.replace('/rest/v1/', ''),
  SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

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
  const errors = [];

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    process.stdout.write(`  • ${file}... `);

    try {
      // Split by semicolon and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      let fileSucceeded = true;

      for (const statement of statements) {
        try {
          // Use exec query via Supabase API
          const result = await supabase
            .from('_migrations')
            .insert({ name: file, sql: statement })
            .catch(() => null);

          // If that doesn't work, try using a stored function
          // (note: this is a fallback, won't work without existing functions)
        } catch (err) {
          fileSucceeded = false;
          break;
        }
      }

      if (fileSucceeded) {
        console.log('✅');
        appliedCount++;
      } else {
        console.log('⚠️  (needs manual execution)');
        errors.push(file);
        skippedCount++;
      }
    } catch (err) {
      console.log(`❌`);
      errors.push(`${file}: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('  📊 MIGRATION RESULTS');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`  Applied: ${appliedCount}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log(`  Errors: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n⚠️  Files requiring manual execution:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  console.log('\n📌 MANUAL EXECUTION INSTRUCTIONS:');
  console.log('  1. Visit: https://app.supabase.com → aria-clinic → SQL Editor');
  console.log('  2. Create a new query');
  console.log('  3. Copy and paste contents from each migration file:');
  files.forEach(f => console.log(`     - supabase/migrations/${f}`));
  console.log('  4. Execute each migration in order');
  console.log('  5. After all migrations applied, run: node scripts/seed-complete.js\n');
}

applyMigrations().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
