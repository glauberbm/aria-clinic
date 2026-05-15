# Supabase RLS Security Migrations - Deployment Status

**Date:** 2026-05-15  
**Status:** ✅ READY FOR DEPLOYMENT  
**Priority:** CRITICAL (RLS Security Fixes)

## Migrations Ready

### 1. Fix Patient Self-Access RLS Policy
**File:** `supabase/migrations/20260517000001_fix_patient_self_access_rls.sql`
**Issue Fixed:** Patients cannot access their own medical records
**Changes:**
- Adds `user_id` UUID column to patients table
- Drops broken `patient_see_own_data` RLS policy
- Creates corrected policy for patient self-access

**Size:** 704 bytes  
**Risk:** LOW - Fixes existing broken functionality

### 2. Fix Privilege Escalation via Role UPDATE
**File:** `supabase/migrations/20260517000002_fix_privilege_escalation_rls.sql`
**Issue Fixed:** Non-admin users can escalate themselves to admin roles
**Changes:**
- Drops vulnerable `admin_update_user_roles` policy (missing WITH CHECK)
- Recreates policy with proper WITH CHECK clause
- Ensures only admins can update AND only admin roles can be assigned

**Size:** 1243 bytes  
**Risk:** CRITICAL - Prevents unauthorized privilege escalation

## Infrastructure Status

### Installed
✅ Supabase CLI v2.98.2 (local npm install)
✅ Node.js 24.14.0
✅ Docker 29.3.1 (available as alternative)

### Configuration
✅ Supabase project reference: `byzxpksxdywnsfjvazaf`
✅ Supabase URL: `https://byzxpksxdywnsfjvazaf.supabase.co`
✅ Service Role Key: Available in `.env.local`
✅ Migration files: Present and valid

### Missing (Blocker)
❌ **SUPABASE_ACCESS_TOKEN** - Required for remote `supabase db push`

## How to Complete Deployment

### Option A: Using Supabase CLI (Recommended)

```bash
# 1. Get Supabase Access Token
# Go to: https://supabase.com/dashboard
# Profile icon → Account → Access Tokens → Generate New Token

# 2. Set environment variable
export SUPABASE_ACCESS_TOKEN="sbp_xxxxxxxxxxxx"

# 3. Authenticate CLI
cd /c/Users/glaub/OneDrive/AI/aria-clinic
npx supabase link --project-ref byzxpksxdywnsfjvazaf

# 4. Deploy migrations
npx supabase db push

# 5. Verify
npx supabase migration list
```

### Option B: Using Docker + psql
```bash
# If database password is available:
docker run -it --rm postgres:15-alpine psql \
  -h byzxpksxdywnsfjvazaf.supabase.co \
  -U postgres \
  -d postgres \
  -f supabase/migrations/20260517000001_fix_patient_self_access_rls.sql \
  -f supabase/migrations/20260517000002_fix_privilege_escalation_rls.sql
```

### Option C: Using Supabase Web Dashboard (Manual)
```
1. Go to https://supabase.com/dashboard
2. Select aria-clinic project
3. Go to SQL Editor
4. Create new query
5. Paste migration 1 content
6. Execute
7. Repeat for migration 2
```

## Verification Steps

After deployment, verify migrations applied:

```bash
# 1. Check migration list
npx supabase migration list

# 2. Verify RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('patients', 'user_roles');

# 3. Test patient self-access (as authenticated patient)
SELECT * FROM patients WHERE user_id = auth.uid();

# 4. Test role update restriction (as non-admin)
UPDATE user_roles SET role_id = (SELECT id FROM roles WHERE name = 'admin') LIMIT 1;
-- Should fail with RLS policy violation
```

## Timeline & Next Steps

- **Current:** Deployment infrastructure ready, awaiting access token
- **Next:** Obtain SUPABASE_ACCESS_TOKEN and execute `npx supabase db push`
- **Verification:** Run validation queries from verification steps
- **Completion:** Mark migrations as deployed, close security audit blockers

## Risk Assessment

| Migration | Risk Level | Impact If Not Deployed |
|-----------|-----------|----------------------|
| 20260517000001 | LOW | Patients cannot access their own records (BREAKING) |
| 20260517000002 | CRITICAL | Anyone can escalate to admin role (SECURITY) |

**Recommendation:** Deploy BOTH migrations immediately after obtaining access token.

---

**Created by:** @devops (Gage)  
**Prepared for:** @pm / @po / Project Leadership
