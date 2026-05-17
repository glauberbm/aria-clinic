# Supabase RLS Security Fixes - Deployment Instructions

## Current Status
✅ Supabase CLI installed (v2.98.2)
✅ Migrations created and ready:
   - supabase/migrations/20260517000001_fix_patient_self_access_rls.sql
   - supabase/migrations/20260517000002_fix_privilege_escalation_rls.sql

## Blockers
❌ SUPABASE_ACCESS_TOKEN required for remote database operations

## How to Get Supabase Access Token

### Step 1: Get Personal Access Token
1. Go to https://supabase.com/dashboard
2. Sign in with your account credentials
3. Click on your profile icon (top right)
4. Go to "Account" or "Settings"
5. Navigate to "Access Tokens"
6. Click "Generate New Token"
7. Give it a name (e.g., "aria-clinic-deployment")
8. Copy the token

### Step 2: Authenticate Supabase CLI
```bash
export SUPABASE_ACCESS_TOKEN="your-token-here"
# OR run: npx supabase login
```

### Step 3: Link Project (if not already linked)
```bash
cd /c/Users/glaub/OneDrive/AI/aria-clinic
npx supabase link --project-ref byzxpksxdywnsfjvazaf
```

### Step 4: Deploy Migrations
```bash
cd /c/Users/glaub/OneDrive/AI/aria-clinic
npx supabase db push
```

### Step 5: Verify Deployment
```bash
npx supabase migration list
```

## Alternative: Direct SQL Execution
If you have database credentials, you can apply migrations directly using psql:
```bash
psql -h byzxpksxdywnsfjvazaf.supabase.co -U postgres -d postgres \
  -f supabase/migrations/20260517000001_fix_patient_self_access_rls.sql \
  -f supabase/migrations/20260517000002_fix_privilege_escalation_rls.sql
```

## Timeline
- Migrations are CRITICAL security fixes (RLS policy corrections)
- Priority: IMMEDIATE after authentication is available
