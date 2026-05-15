# User Profile Management — Setup Guide

This guide explains how to set up User Profile Management (USER-004) in ArIA Clinic.

## Overview

USER-004 implements:
- User profile view page (`/profile`)
- Profile edit page (`/profile/edit`)
- Avatar upload with validation
- Profile data persistence
- RLS policies for data isolation

## Prerequisites

- Supabase project with auth configured
- NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in `.env.local`

## Database Setup

### 1. Apply Migration

The migration `20260515000002_create_users_table_and_profile.sql` creates:
- `public.users` table with full schema
- RLS policies for profile isolation
- Indexes for performance
- Auto-update trigger for `updated_at`
- Auth sync trigger for new users

To apply:

```bash
supabase db push
```

Or manually in Supabase Dashboard:
1. Go to SQL Editor
2. Paste the migration SQL
3. Run

### 2. Create Storage Bucket

Create a public storage bucket for avatars:

```bash
# Via Supabase CLI
supabase storage create-bucket avatars --public
```

Or via Dashboard:
1. Go to Storage → Buckets
2. Create new bucket: `avatars`
3. Set to Public
4. Add policy: Users can upload to `avatars/{user_id}/*`

## API Endpoints

### GET /api/profile

Get current user's profile.

**Requirements:**
- Authentication token (Bearer token or httpOnly cookie)

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "avatar_url": "https://...",
  "clinic_id": "uuid",
  "active": true,
  "created_at": "2026-05-15T00:00:00Z",
  "updated_at": "2026-05-15T00:00:00Z"
}
```

### PATCH /api/profile

Update user's profile.

**Requirements:**
- Authentication token

**Body:**
```json
{
  "name": "New Name",
  "avatar_url": "https://..." // optional, can be empty string to clear
}
```

**Restrictions:**
- `name`: 2-255 characters
- `avatar_url`: Valid URL or empty
- Cannot modify: email, clinic_id, active, timestamps

### POST /api/profile/avatar

Upload new avatar.

**Requirements:**
- Authentication token
- Multipart form data with `file` field

**File Restrictions:**
- Size: Max 5MB
- Type: image/jpeg or image/png only

**Response:**
```json
{
  "message": "Avatar uploaded successfully",
  "url": "https://...",
  "path": "avatars/{user_id}/..."
}
```

### DELETE /api/profile/avatar

Delete user's avatar.

**Requirements:**
- Authentication token

**Response:**
```json
{
  "message": "Avatar deleted successfully"
}
```

## Frontend Components

### Profile View Page

**Path:** `/profile`

Features:
- Display user information (name, email, avatar, clinic, role)
- Show account creation and last update dates
- Read-only display of non-editable fields
- Link to edit profile

### Profile Edit Page

**Path:** `/profile/edit`

Features:
- Edit name
- Upload/change avatar with preview
- Delete avatar
- Read-only display of email and clinic
- Validation with real-time error feedback
- Success/error messages
- Auto-redirect after successful save

## Security Features

### Authentication

- All endpoints require valid auth token
- Tokens can be provided via:
  - `Authorization: Bearer {token}` header
  - `auth-token` httpOnly cookie

### Row-Level Security (RLS)

Supabase RLS policies enforce:
- Users can only view their own profile
- Users can only update their own profile
- Only admins can view other users (same clinic)
- Profile data is clinic-isolated

### File Upload Security

- File size limit: 5MB
- MIME type validation: JPEG/PNG only
- Filename sanitized (UUID + timestamp)
- Files stored in user-specific folder
- Server-side validation (not relying on client)

### Input Validation

- Name: 2-255 characters
- Avatar URL: Valid URL format
- File upload: MIME type + size check
- Parameterized queries (prevents SQL injection)

## Testing

### Unit Tests

Profile validation schema tests (13 tests):

```bash
npm test -- validations/profile.test.ts
```

Coverage: 100% of schema validation

### Running All Tests

```bash
npm test
```

Expected results:
- ≥ 78 tests passing
- Coverage: > 80%

## Troubleshooting

### "Profile not found" error

**Cause:** User record not created in public.users

**Solution:**
1. Check if migration was applied
2. Check if auth.users has the user ID
3. Manually insert user record:

```sql
INSERT INTO public.users (id, email, name)
SELECT id, email, raw_user_meta_data->>'name'
FROM auth.users
WHERE id = 'user-uuid';
```

### Avatar upload fails with 401

**Cause:** Auth token missing or invalid

**Solution:**
1. Ensure auth token is in request headers
2. Check token isn't expired
3. Try using cookie-based auth (httpOnly cookie set during login)

### Avatar upload succeeds but URL is inaccessible

**Cause:** Storage bucket permissions

**Solution:**
1. Ensure `avatars` bucket is public
2. Check bucket policies allow public read access
3. Verify CDN is enabled

### Profile updates not persisting

**Cause:** RLS policy blocking update

**Solution:**
1. Verify RLS policies allow user to update own profile
2. Check user record exists in public.users
3. Verify auth.uid() returns correct user ID

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Related Stories

- USER-001: Authentication setup
- USER-002: Login implementation
- USER-003: RBAC schema
- USER-005: Admin dashboard (uses profiles)

## File Locations

- **Migrations:** `supabase/migrations/20260515000002_create_users_table_and_profile.sql`
- **API Routes:** `app/api/profile/route.ts`, `app/api/profile/avatar/route.ts`
- **Frontend Pages:** `app/(dashboard)/profile/page.tsx`, `app/(dashboard)/profile/edit/page.tsx`
- **Validations:** `lib/validations/profile.ts`
- **Tests:** `__tests__/validations/profile.test.ts`

## Next Steps

After USER-004 is complete:
1. USER-005: Admin dashboard (view/manage user profiles)
2. Role management UI
3. Avatar CDN optimization
4. Audit logging for profile changes
