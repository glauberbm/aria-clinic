#!/usr/bin/env node

/**
 * Setup Supabase CLI Access Token
 * Generates and configures Supabase CLI for local development
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1/', '');
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract project reference from URL
const projectRef = SUPABASE_URL.split('https://')[1].split('.supabase.co')[0];
const projectId = projectRef;

async function setupCliConfig() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('  🔑 SUPABASE CLI SETUP');
  console.log('════════════════════════════════════════════════════════════\n');

  console.log(`📋 Project Reference: ${projectRef}`);
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}\n`);

  // Create .supabase directory if it doesn't exist
  const supabaseDir = path.join(__dirname, '../supabase');
  if (!fs.existsSync(supabaseDir)) {
    fs.mkdirSync(supabaseDir, { recursive: true });
  }

  // Create config.toml for Supabase CLI
  const configPath = path.join(supabaseDir, 'config.toml');
  const configContent = `# Supabase CLI Configuration
project_id = "${projectId}"

[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
max_rows = 1000

[db]
port = 54322
major_version = 15
schemas = ["public", "extensions"]

[studio]
enabled = true
port = 54323

[inbucket]
enabled = true
port = 54324

[auth]
enabled = true
port = 54325
`;

  fs.writeFileSync(configPath, configContent);
  console.log(`✅ Created: ${configPath}`);

  // Try to create/update .supabaserc file in home directory for CLI access
  const homeDir = os.homedir();
  const rcPath = path.join(homeDir, '.supabaserc');

  console.log(`\n⚠️  MANUAL STEP REQUIRED:`);
  console.log(`────────────────────────────────────────────────────────────`);
  console.log(`\nTo use Supabase CLI for migrations, you need an Access Token:\n`);
  console.log(`1. Go to: https://app.supabase.com/account/tokens`);
  console.log(`2. Create a new Personal Access Token`);
  console.log(`3. Copy the token`);
  console.log(`4. Run the following command:\n`);
  console.log(`   export SUPABASE_ACCESS_TOKEN='your-token-here'`);
  console.log(`\n5. Then run:\n`);
  console.log(`   npx supabase link --project-ref ${projectRef}`);
  console.log(`   npx supabase db push\n`);
  console.log(`────────────────────────────────────────────────────────────\n`);

  // Alternative: Try environment variable approach
  console.log(`💡 ALTERNATIVE - Use environment variable directly:\n`);
  console.log(`   1. Get your token from https://app.supabase.com/account/tokens`);
  console.log(`   2. Add to .env.local:\n`);
  console.log(`      SUPABASE_ACCESS_TOKEN=your-token-here\n`);
  console.log(`   3. Then: npx supabase link --project-ref ${projectRef}\n`);
}

setupCliConfig().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
