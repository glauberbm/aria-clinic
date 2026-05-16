# Supabase Staging Setup — Manual Instructions

**Date Created:** 2026-05-20
**Status:** Ready for Implementation
**Estimated Time:** 45-60 minutes
**Prerequisites:** Supabase account, GitHub repo access, admin rights

---

## Overview

This document provides step-by-step instructions to set up a complete staging environment for Aria Clinic using Supabase. The staging environment mirrors production but with test data.

### What You'll Get
- ✅ Isolated staging Supabase project
- ✅ Complete schema (10 migrations)
- ✅ Test data (10 patients, 5 medical records, 13 appointments)
- ✅ RBAC configured (5 test users)
- ✅ CI/CD pipeline ready
- ✅ Environment variables stored securely in GitHub

### What This Does NOT Include
- ❌ Vercel deployment (manual, see step 8)
- ❌ Slack notifications (optional, step 9)
- ❌ Custom domain setup (use Vercel's default)

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Supabase account (https://app.supabase.com)
- [ ] GitHub repo access with permission to manage secrets
- [ ] Access to production Supabase project (for reference, optional)
- [ ] PostgreSQL CLI installed (optional, for local testing)
- [ ] 45-60 minutes of uninterrupted time

---

## Step 1: Create Staging Supabase Project

### 1.1 Log In to Supabase

1. Go to https://app.supabase.com
2. Click "Sign In" and enter your credentials
3. Select your organization from the dropdown

### 1.2 Create New Project

1. Click **"New project"** or **"+"** button
2. Fill in the form:

   | Field | Value | Notes |
   |-------|-------|-------|
   | Project Name | `aria-clinic-staging` | Must be unique |
   | Database Password | [GENERATE STRONG PASSWORD] | Save in password manager |
   | Region | Same as production (e.g., `sa-east-1 São Paulo`) | For consistency |
   | Database Plan | Free or Pro | Depends on your plan |

3. **CRITICAL:** Save the database password in your password manager
   - You'll need this in Step 4

4. Click **"Create new project"**

5. **Wait 10-15 minutes** for the project to initialize
   - You'll see a progress spinner
   - Status: "Setting up your project..."
   - Complete when you see the project dashboard

### 1.3 Verify Project Creation

Once the dashboard loads:
- ✅ You should see "Project Settings" option in left sidebar
- ✅ Database should be "Available" (green status)
- ✅ No errors in the console

---

## Step 2: Capture Staging Credentials

### 2.1 Get API Keys

1. In Supabase dashboard, click **"Project Settings"** (bottom-left, gear icon)
2. Click **"API"** tab
3. You'll see two keys under "Project API keys":

   ```
   anon key:          eyJhbGc...
   service_role key:  eyJhbGc...
   ```

4. **Copy these values to a temporary file:**

   ```
   STAGING_PROJECT_REF=xxxxxxxxxxxxx
   STAGING_PROJECT_URL=https://xxxxxxxxxxxxx.supabase.co
   STAGING_ANON_KEY=eyJhbGc...
   STAGING_SERVICE_ROLE_KEY=eyJhbGc...
   STAGING_DB_PASSWORD=[password from step 1.2]
   ```

### 2.2 Get Project Reference

1. Still in "Project Settings", click the **"General"** tab
2. Copy the "Reference ID" (format: `xxxxxxxxxxxxx`)
3. Add to your temporary file:

   ```
   STAGING_PROJECT_REF=xxxxxxxxxxxxx
   ```

### 2.3 Verify Credentials

- [ ] Project URL is formatted: `https://[ref].supabase.co`
- [ ] Anon Key starts with `eyJhbGc`
- [ ] Service Role Key is different from Anon Key
- [ ] All keys copied to temporary file

---

## Step 3: Deploy Database Schema

You have two options: CLI (recommended) or SQL Editor.

### Option A: Using Supabase CLI (Recommended)

#### 3.A.1 Install Supabase CLI

```bash
npm install -g supabase
```

#### 3.A.2 Link to Staging Project

```bash
supabase link --project-ref [STAGING_PROJECT_REF]
```

When prompted, enter the database password from Step 1.2

#### 3.A.3 Deploy Migrations

```bash
supabase db push --project-ref [STAGING_PROJECT_REF]
```

Expected output:
```
Pushing migrations...
✓ 20260515000000_create_clinics_table.sql
✓ 20260515000001_create_rbac_schema.sql
✓ 20260515000002_create_users_table_and_profile.sql
✓ 20260515000003_create_patient_schema.sql
✓ 20260515000004_create_audit_log_table.sql
✓ 20260515000005_create_patient_extended_schema.sql
✓ 20260515000006_fix_critical_rls_blockers.sql
✓ 20260516000001_create_patient_profiles.sql
✓ 20260520000001_create_patients_table.sql
✓ 20260520000002_create_appointments_table.sql
```

#### 3.A.4 Verify Migrations Applied

```bash
supabase migration list --project-ref [STAGING_PROJECT_REF]
```

All 10 migrations should show as "Applied"

### Option B: Using SQL Editor (Manual)

#### 3.B.1 Open SQL Editor

1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**

#### 3.B.2 Copy-Paste Migrations

1. Open file: `supabase/migrations/20260515000000_create_clinics_table.sql`
2. Copy ALL content
3. Paste into SQL Editor
4. Click **"Run"** (Ctrl+Enter)
5. Verify: "Query successful" message

#### 3.B.3 Repeat for All 10 Files

Repeat steps 3.B.2-3.B.3 for each migration file IN ORDER:

```
20260515000000_create_clinics_table.sql
20260515000001_create_rbac_schema.sql
20260515000002_create_users_table_and_profile.sql
20260515000003_create_patient_schema.sql
20260515000004_create_audit_log_table.sql
20260515000005_create_patient_extended_schema.sql
20260515000006_fix_critical_rls_blockers.sql
20260516000001_create_patient_profiles.sql
20260520000001_create_patients_table.sql
20260520000002_create_appointments_table.sql
```

**Important:** Run them in order. Each migration depends on previous ones.

---

## Step 4: Create Test Users (auth.users)

### 4.1 Access Authentication Settings

1. In Supabase dashboard, click **"Authentication"** (left sidebar)
2. Click **"Users"** tab
3. Click **"Add user"** button

### 4.2 Create Test Users

Create 5 test users by repeating this process:

#### User 1: Admin

1. Click **"Add user"**
2. Email: `admin@aria-staging.test`
3. Password: `Test@12345` (temporary)
4. Confirm password: `Test@12345`
5. Click **"Save user"**
6. **Copy the User ID** (UUID in the user row)
7. Paste into your temp file: `ADMIN_USER_ID=xxxxx`

#### User 2: Doctor 1

Repeat with:
- Email: `doctor1@aria-staging.test`
- Password: `Test@12345`
- Save User ID as `DOCTOR1_USER_ID=xxxxx`

#### User 3: Doctor 2

Repeat with:
- Email: `doctor2@aria-staging.test`
- Password: `Test@12345`
- Save User ID as `DOCTOR2_USER_ID=xxxxx`

#### User 4: Receptionist

Repeat with:
- Email: `receptionist@aria-staging.test`
- Password: `Test@12345`
- Save User ID as `RECEPTIONIST_USER_ID=xxxxx`

#### User 5: Patient

Repeat with:
- Email: `patient1@aria-staging.test`
- Password: `Test@12345`
- Save User ID as `PATIENT_USER_ID=xxxxx`

**Verification:**
- [ ] All 5 users created in Authentication panel
- [ ] All User IDs copied to temp file

---

## Step 5: Load Seed Data

### 5.1 Update Seed File with Real UUIDs

1. Open file: `supabase/seed-staging.sql`
2. Find section "3. SEED USER_ROLES" (around line 49)
3. Replace UUID placeholders with real User IDs:

   ```sql
   -- OLD (placeholder)
   SELECT '11111111-1111-1111-1111-111111111111'::UUID,

   -- NEW (from step 4.2)
   SELECT '[ADMIN_USER_ID]'::UUID,
   ```

4. Do this for all 5 user_roles inserts

5. **Save the file**

### 5.2 Load Seed Data via SQL Editor

1. In Supabase dashboard, click **"SQL Editor"**
2. Click **"New Query"**
3. Open and copy entire `supabase/seed-staging.sql`
4. Paste into SQL Editor
5. Click **"Run"** (Ctrl+Enter)

Expected output:
```
Query successful
Rows affected: 48
```

### 5.3 Verify Seed Data Loaded

Run these verification queries in SQL Editor:

```sql
-- Should return 1
SELECT COUNT(*) as clinic_count FROM public.clinics;

-- Should return 4
SELECT COUNT(*) as role_count FROM public.roles;

-- Should return 5
SELECT COUNT(*) as user_count FROM public.users;

-- Should return 5
SELECT COUNT(*) as user_role_count FROM public.user_roles;

-- Should return 10
SELECT COUNT(*) as patient_count FROM public.patients;

-- Should return 13
SELECT COUNT(*) as appointment_count FROM public.appointments;
```

**All queries should return expected counts**

---

## Step 6: Configure GitHub Secrets

### 6.1 Access Repository Settings

1. Go to your GitHub repo: https://github.com/[owner]/aria-clinic
2. Click **"Settings"** (top menu)
3. Click **"Secrets and variables"** → **"Actions"** (left sidebar)

### 6.2 Create Repository Secrets

Create 3 new secrets by clicking **"New repository secret"**:

#### Secret 1: SUPABASE_STAGING_URL

- Name: `SUPABASE_STAGING_URL`
- Value: `https://[STAGING_PROJECT_REF].supabase.co`
- Example: `https://abcdefghijklmno.supabase.co`
- Click **"Add secret"**

#### Secret 2: SUPABASE_STAGING_ANON_KEY

- Name: `SUPABASE_STAGING_ANON_KEY`
- Value: [Anon Key from Step 2.1]
- Starts with `eyJhbGc`
- Click **"Add secret"**

#### Secret 3: SUPABASE_STAGING_PROJECT_REF

- Name: `SUPABASE_STAGING_PROJECT_REF`
- Value: [Project Reference from Step 2.2]
- Example: `abcdefghijklmno`
- Click **"Add secret"**

### 6.3 Additional Secrets (if using full CI/CD)

If you want to use the GitHub Actions workflow for automated deployments:

#### Secret 4: SUPABASE_ACCESS_TOKEN

1. In Supabase, go to **"Account"** (top-right menu)
2. Click **"Access Tokens"**
3. Click **"Generate new token"**
4. Name: `GitHub CI/CD`
5. Copy the token
6. Add to GitHub Secrets:
   - Name: `SUPABASE_ACCESS_TOKEN`
   - Value: [Copied token]
   - Click **"Add secret"**

#### Secret 5: SUPABASE_STAGING_DB_PASSWORD

- Name: `SUPABASE_STAGING_DB_PASSWORD`
- Value: [Database password from Step 1.2]
- Click **"Add secret"**

### 6.4 Verify Secrets Created

1. In GitHub "Secrets and variables" page
2. You should see all 3-5 secrets listed
3. All should show **"Last updated: just now"**

---

## Step 7: Test Connection

### 7.1 Create Test Connection Script

Create file: `test-staging-connection.js`

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Staging Connection...');
console.log('URL:', supabaseUrl);

const client = createClient(supabaseUrl, supabaseKey);

// Test 1: Query users table
client
  .from('users')
  .select('count()', { count: 'exact' })
  .then((response) => {
    if (response.error) {
      console.error('❌ Users query failed:', response.error);
    } else {
      console.log('✅ Users table accessible:', response.count, 'records');
    }
  });

// Test 2: Query patients table
client
  .from('patients')
  .select('count()', { count: 'exact' })
  .then((response) => {
    if (response.error) {
      console.error('❌ Patients query failed:', response.error);
    } else {
      console.log('✅ Patients table accessible:', response.count, 'records');
    }
  });

// Test 3: Query appointments table
client
  .from('appointments')
  .select('count()', { count: 'exact' })
  .then((response) => {
    if (response.error) {
      console.error('❌ Appointments query failed:', response.error);
    } else {
      console.log('✅ Appointments table accessible:', response.count, 'records');
    }

    console.log('\n✅ All tests passed! Staging environment is ready.');
  });
```

### 7.2 Run Test

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://[STAGING_PROJECT_REF].supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=[STAGING_ANON_KEY]

node test-staging-connection.js
```

Expected output:
```
Testing Supabase Staging Connection...
✅ Users table accessible: 5 records
✅ Patients table accessible: 10 records
✅ Appointments table accessible: 13 records
✅ All tests passed! Staging environment is ready.
```

---

## Step 8: Deploy to Vercel (Optional)

The GitHub Actions workflow handles this automatically on `git push`. If you want manual control:

### 8.1 Connect GitHub to Vercel

1. Go to https://vercel.com
2. Click **"New Project"**
3. Select your GitHub repo: `aria-clinic`
4. Click **"Import"**

### 8.2 Configure Environment Variables

In Vercel project settings:

1. Click **"Settings"** → **"Environment Variables"**
2. Add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[STAGING_PROJECT_REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[STAGING_ANON_KEY]
   ```
3. Set scope to: **"Staging"** (for staging deploys only)

### 8.3 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~5 minutes)
3. You'll get a staging URL like: `https://aria-clinic-staging.vercel.app`

---

## Step 9: Setup Monitoring (Optional)

### 9.1 Slack Notifications

If you want CI/CD to notify Slack:

1. In Slack workspace, create a webhook:
   - https://api.slack.com/messaging/webhooks
2. In GitHub Secrets, add:
   - Name: `SLACK_WEBHOOK_URL`
   - Value: [Slack webhook URL]

---

## Verification Checklist

Before marking this complete, verify:

### Database
- [ ] Staging project created in Supabase dashboard
- [ ] All 10 migrations applied (`supabase migration list` shows all)
- [ ] Seed data loaded (10 patients, 13 appointments, etc.)
- [ ] RLS policies active (verify in Supabase dashboard)

### Authentication
- [ ] 5 test users created in Supabase Auth
- [ ] All user UUIDs added to seed data
- [ ] Users assigned to correct roles

### GitHub
- [ ] 3-5 secrets created in repo settings
- [ ] Secrets visible in GitHub (Settings → Secrets)
- [ ] `.github/workflows/deploy-staging.yml` committed

### Connection
- [ ] Test script runs successfully
- [ ] All tables accessible
- [ ] No authentication errors

### Deployment (if using Vercel)
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Staging URL generated
- [ ] App accessible at staging URL

---

## Troubleshooting

### Issue: "Project creation stuck"

**Solution:**
1. Wait 15-20 minutes
2. Refresh browser
3. Check Supabase status: https://status.supabase.com
4. Contact Supabase support if persists

### Issue: "Migration fails with permission error"

**Solution:**
1. Verify you used correct database password in Step 3.A.2
2. Check that user has admin permissions in Supabase organization
3. Try Option B (SQL Editor) instead of CLI

### Issue: "Test users not appearing in seed data"

**Solution:**
1. Verify User IDs were copied correctly from Step 4.2
2. Check for typos in `supabase/seed-staging.sql`
3. Ensure `ON CONFLICT DO NOTHING` doesn't skip inserts (check with SELECT query)

### Issue: "GitHub Actions workflow failing"

**Solution:**
1. Check workflow logs: GitHub → Actions → Deploy to Staging
2. Verify all secrets created in Step 6
3. Ensure `SUPABASE_ACCESS_TOKEN` is valid (not expired)
4. Check that migrations are applied before running workflow

### Issue: "Vercel deployment stuck"

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify environment variables are set correctly
3. Try manual deployment from Vercel UI
4. Contact Vercel support if build logs show obscure errors

---

## Success Indicators

You'll know everything is working when:

1. ✅ Supabase project dashboard loads without errors
2. ✅ All 10 migrations show as "Applied"
3. ✅ Database queries return correct record counts
4. ✅ GitHub Secrets visible in repo settings
5. ✅ Test connection script shows "All tests passed"
6. ✅ Can log in with test users via app
7. ✅ Patients, appointments visible in staging app

---

## Next Steps

After staging setup is complete:

1. **Test the App**
   - Log in with test users: `admin@aria-staging.test` / `Test@12345`
   - Create a test appointment
   - Update patient information
   - Verify RLS policies work (can't see other clinic's data)

2. **Set Up Monitoring**
   - Configure Slack notifications (optional, Step 9)
   - Set up monitoring dashboards
   - Create runbooks for common issues

3. **Document Access**
   - Share staging URLs with team
   - Document test user credentials (securely)
   - Create data refresh procedures

4. **Automated Testing**
   - Add more comprehensive tests to CI/CD
   - Set up performance monitoring
   - Configure alerting for deployment failures

---

## Support & Questions

For issues or questions:

1. **Check Supabase docs:** https://supabase.com/docs
2. **Check GitHub Actions docs:** https://docs.github.com/actions
3. **File GitHub Issue** in aria-clinic repo
4. **Contact Devops team** for infrastructure questions

---

## Cleanup (If Starting Over)

If you need to delete and recreate the staging environment:

1. **Delete Supabase project:**
   - Go to Supabase dashboard → Project Settings → General
   - Scroll to "Danger Zone"
   - Click "Delete project"
   - Confirm deletion

2. **Delete Vercel project:**
   - Go to Vercel dashboard → Project Settings → General
   - Scroll to "Danger Zone"
   - Click "Delete"

3. **Clear GitHub Secrets:**
   - Go to GitHub → Settings → Secrets
   - Delete all SUPABASE_STAGING_* secrets

4. **Start over from Step 1**

---

**Document Version:** 1.0
**Last Updated:** 2026-05-20
**Status:** Ready for Use
