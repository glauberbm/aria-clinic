#!/usr/bin/env node

/**
 * Execute Seed SQL via Supabase PostgreSQL
 * Runs seed-staging.sql against the remote Supabase database
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

async function main() {
  console.log('🌱 Loading seed-staging.sql...');

  const seedPath = path.join(__dirname, '../supabase/seed-staging.sql');
  const seedSQL = fs.readFileSync(seedPath, 'utf-8');

  // Extract only data INSERT statements (skip comments and DDL)
  const lines = seedSQL.split('\n');
  const queries = [];
  let currentQuery = '';

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.trim().startsWith('--') || !line.trim()) {
      continue;
    }

    currentQuery += line + '\n';

    // End of statement (semicolon)
    if (line.includes(';')) {
      const query = currentQuery.trim();
      if (query && query.startsWith('INSERT INTO')) {
        queries.push(query);
      }
      currentQuery = '';
    }
  }

  console.log(`📋 Found ${queries.length} INSERT queries to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  // Execute each INSERT statement
  for (const query of queries) {
    const table = query.match(/INSERT INTO (\w+)/)?.[1] || 'unknown';
    process.stdout.write(`  • Inserting into ${table}... `);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: query });

      if (error) {
        // Try direct approach
        const matches = query.match(/INSERT INTO (\w+)/);
        if (matches) {
          const tableName = matches[1];
          // For now, just log - direct INSERT requires ORM parsing
          console.log('⚠️  (may need manual execution in SQL Editor)');
        }
      } else {
        console.log('✅');
        successCount++;
      }
    } catch (err) {
      console.log(`⚠️  (${err.message})`);
      errorCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount} success, ${errorCount} needs manual execution`);
  console.log('\n📌 To complete seed execution:');
  console.log('  1. Go to https://app.supabase.com');
  console.log('  2. Select project "aria-clinic"');
  console.log('  3. SQL Editor → New Query');
  console.log('  4. Copy contents of supabase/seed-staging.sql');
  console.log('  5. Execute');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
