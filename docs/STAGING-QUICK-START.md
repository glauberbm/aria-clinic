# Staging Environment — Quick Start

**TL;DR:** Follow these 7 steps to get staging environment running (45 min)

---

## Step 1: Create Supabase Project (15 min)

```bash
# Go to https://app.supabase.com
# Click "New project"
# Fill in:
#   Name: aria-clinic-staging
#   Password: [STRONG PASSWORD - save it!]
#   Region: sa-east-1 (São Paulo)
# Click "Create project"
# Wait 15 minutes for completion
```

---

## Step 2: Get Credentials (5 min)

Go to **Project Settings → API**

Copy these 3 things:
```
STAGING_PROJECT_URL=https://[PROJECT-REF].supabase.co
STAGING_ANON_KEY=eyJhbGc...
STAGING_PROJECT_REF=[PROJECT-REF]
```

Save to a temp file (will use in steps 3-6)

---

## Step 3: Deploy Schema (10 min)

**Option A: Using CLI (recommended)**
```bash
supabase link --project-ref [STAGING_PROJECT_REF]
# Enter database password when prompted

supabase db push --project-ref [STAGING_PROJECT_REF]
```

**Option B: Using SQL Editor (manual)**
1. Go to Supabase → SQL Editor
2. Copy-paste each migration file (10 total) in order
3. Click "Run" for each one

---

## Step 4: Create Test Users (10 min)

Go to **Authentication → Users**

Create 5 users (copy their IDs):

```
admin@aria-staging.test          → User ID: [copy this]
doctor1@aria-staging.test        → User ID: [copy this]
doctor2@aria-staging.test        → User ID: [copy this]
receptionist@aria-staging.test   → User ID: [copy this]
patient1@aria-staging.test       → User ID: [copy this]
```

All passwords: `Test@12345` (staging only)

---

## Step 5: Load Seed Data (5 min)

1. Edit `supabase/seed-staging.sql`
2. Find section "3. SEED USER_ROLES"
3. Replace UUID placeholders with User IDs from Step 4
4. Go to SQL Editor
5. Copy-paste entire file
6. Click "Run"

---

## Step 6: Configure GitHub Secrets (10 min)

Go to **GitHub → Settings → Secrets and variables → Actions**

Add 3 secrets:
```
SUPABASE_STAGING_URL = https://[STAGING_PROJECT_REF].supabase.co
SUPABASE_STAGING_ANON_KEY = [Your ANON_KEY]
SUPABASE_STAGING_PROJECT_REF = [PROJECT_REF]
```

---

## Step 7: Test Connection (5 min)

```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL=https://[STAGING_PROJECT_REF].supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=[STAGING_ANON_KEY]

# Run test script
node test-staging-connection.js

# Expected output:
# ✅ Users table accessible: 5 records
# ✅ Patients table accessible: 10 records
# ✅ Appointments table accessible: 13 records
```

---

## Verify Everything Works

Run these SQL queries in Supabase:

```sql
SELECT COUNT(*) FROM public.clinics;       -- Should be 1
SELECT COUNT(*) FROM public.roles;         -- Should be 4
SELECT COUNT(*) FROM public.users;         -- Should be 5
SELECT COUNT(*) FROM public.patients;      -- Should be 10
SELECT COUNT(*) FROM public.appointments;  -- Should be 13
```

All counts matching? ✅ **You're done!**

---

## Next: Automated Deployments (Optional)

If you want CI/CD to automatically deploy on git push:

1. Add to GitHub Secrets:
   - `SUPABASE_ACCESS_TOKEN` (from Supabase → Account → Access Tokens)
   - `VERCEL_TOKEN` (from Vercel dashboard)

2. Commit this file: `.github/workflows/deploy-staging.yml`

3. Push to GitHub: `git push origin main`

Done! Now every push to `main` automatically deploys to staging.

---

## Test Users for Manual Testing

```
Email: admin@aria-staging.test
Password: Test@12345
Role: Admin (full access)

Email: doctor1@aria-staging.test
Password: Test@12345
Role: Doctor (clinical access)

Email: patient1@aria-staging.test
Password: Test@12345
Role: Patient (read own data)
```

---

## Useful Commands

```bash
# Check migrations applied
supabase migration list --project-ref [STAGING_PROJECT_REF]

# View live logs
supabase functions serve

# Run tests
npm test

# Build project
npm run build
```

---

## Troubleshooting (Quick Fixes)

| Problem | Solution |
|---------|----------|
| "Migration fails" | Check password from Step 1 |
| "Users not appearing" | Verify UUIDs replaced in seed file |
| "Test script fails" | Check environment variables set correctly |
| "GitHub workflow fails" | Verify secrets created in Step 6 |

---

## Reference Documents

- **Full details:** `docs/SUPABASE-STAGING-SETUP.md` (complete guide with troubleshooting)
- **Schema info:** `docs/SUPABASE-SCHEMA.md` (table definitions, RLS policies)
- **Summary:** `docs/STAGING-BLUEPRINT-SUMMARY.md` (overview of all deliverables)

---

**Estimated Time:** 45-60 minutes
**Difficulty:** Easy to Medium
**Help:** Check reference documents above
