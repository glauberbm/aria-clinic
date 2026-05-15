# EPIC-003: Patients Module

**Phase:** Foundation (MVP) | **Timeline:** Week 1-2 | **Owner:** @pm

## Business Objective
Enable complete patient management including registration, medical history (anamnese), treatments, and contact tracking. Central database for all clinic patient data.

## Acceptance Criteria
- [ ] Patient registration form with full details
- [ ] Patient profile/ficha view (personal, contact, medical history)
- [ ] Anamnese (medical intake form) with customizable fields
- [ ] Patient list with search and filtering
- [ ] Patient avatar and identification
- [ ] Contact information (phone, email, WhatsApp)
- [ ] Treatment history tracking
- [ ] Data export capability (CSV)

## User Stories (from @sm)
1. PATIENT-001: Patient Registration Form
2. PATIENT-002: Patient Profile/Ficha Page
3. PATIENT-003: Anamnese Form Creation
4. PATIENT-004: Patient List with Search & Filter
5. PATIENT-005: Patient Contact Management
6. PATIENT-006: Treatment History Timeline

## Technical Requirements
- **Database Schema:**
  ```
  patients table: id, name, email, phone, whatsapp, cpf, date_of_birth, etc.
  patient_anamnese table: id, patient_id, form_data (JSON), created_at, updated_at
  patient_treatments table: id, patient_id, treatment_name, date, status
  patient_contact_logs table: id, patient_id, contact_type, message, date
  ```
- **Form Framework:** React Hook Form + Zod for validation
- **Search:** Supabase full-text search
- **UI Components:** Forms, input fields, text areas, date pickers

## Dependencies
- EPIC-001 (requires authentication)
- EPIC-002 (dashboard references patient data)

## Related Epics
- EPIC-004 (Schedule uses patients)
- EPIC-005 (Budgets use patients)

## Notes
- Patient data is core to all operations
- RLS policies must restrict doctors/receptionists to clinic patients
- Whatsapp integration needed for automated messaging
- Support both portrait and landscape profile views
