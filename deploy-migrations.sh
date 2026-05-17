#!/bin/bash
set -e

PROJECT_PATH="C:\Users\glaub\OneDrive\AI\aria-clinic"
PROJECT_ID="byzxpksxdywnsfjvazaf"

echo "=========================================="
echo "Supabase RLS Security Migrations Deployer"
echo "=========================================="
echo ""

# Check if token is provided
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ ERROR: SUPABASE_ACCESS_TOKEN not set!"
  echo ""
  echo "Steps to get your access token:"
  echo "1. Go to https://supabase.com/dashboard"
  echo "2. Click your profile icon (top right)"
  echo "3. Go to Settings → Access Tokens"
  echo "4. Click 'Generate New Token'"
  echo "5. Copy the token and run:"
  echo "   export SUPABASE_ACCESS_TOKEN='your-token-here'"
  echo ""
  exit 1
fi

cd "$PROJECT_PATH"

echo "✅ SUPABASE_ACCESS_TOKEN found"
echo ""

# Check if CLI is installed
if ! npx supabase --version >/dev/null 2>&1; then
  echo "❌ Supabase CLI not found. Installing..."
  npm install --save-dev supabase
fi

echo "📊 Supabase CLI version:"
npx supabase --version
echo ""

# Link project
echo "🔗 Linking Supabase project..."
npx supabase link --project-ref "$PROJECT_ID" || echo "ℹ️  Project may already be linked"
echo ""

# List current migrations
echo "📋 Current migrations:"
npx supabase migration list
echo ""

# Deploy migrations
echo "🚀 Deploying migrations..."
npx supabase db push || {
  echo "❌ Migration deployment failed!"
  exit 1
}
echo ""

# Verify
echo "✅ Verifying deployment..."
npx supabase migration list
echo ""

echo "=========================================="
echo "✅ RLS Security Migrations Successfully Deployed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify RLS policies in Supabase dashboard"
echo "2. Test patient self-access functionality"
echo "3. Verify privilege escalation is prevented"
echo "4. Update deployment status in issue tracking"
