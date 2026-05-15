# EPIC-001: Authentication & User Management

**Phase:** Foundation (MVP) | **Timeline:** Week 1 | **Owner:** @pm

## Business Objective
Enable secure user authentication and role-based access control for ArIA Clinic. Support multi-user clinic operations with doctor, receptionist, and admin roles.

## Acceptance Criteria
- [ ] User registration with email/password (via Supabase Auth)
- [ ] Login/logout functionality with persistent sessions
- [ ] Role-based access control (Doctor, Receptionist, Admin)
- [ ] User profile management
- [ ] Password reset workflow
- [ ] Session management and security best practices

## User Stories (from @sm)
1. USER-001: User Registration & Email Verification
2. USER-002: Login with Email/Password
3. USER-003: Role Assignment & Access Control
4. USER-004: Password Reset Flow
5. USER-005: User Profile Page

## Technical Requirements
- **Backend:** Supabase Auth (PostgreSQL-based)
- **Frontend:** Next.js Auth integration with route protection
- **Security:** JWT tokens, secure cookies, HTTPS only
- **Database Schema:**
  ```
  users table: id, email, name, role, created_at, updated_at
  roles table: id, name, permissions
  user_roles table: user_id, role_id
  ```

## Dependencies
- None (Foundation epic)

## Related Epics
- EPIC-002 (Dashboard depends on auth)
- EPIC-003 (Patients depends on auth)

## Notes
- Use Supabase built-in auth for rapid deployment
- Row-Level Security (RLS) policies for data isolation
- Session timeout after 24 hours of inactivity
