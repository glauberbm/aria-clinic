# Legacy Data Audit Questionnaire — Aria Clinic

**Document Type:** Data Assessment Form
**Sent to:** Clinic IT Lead + Operations Manager
**Deadline:** May 19, 2026, 5:00 PM
**Purpose:** Determine effort required for ROLL-002 (legacy data migration story) in Phase 2

---

## Overview

If your clinic has existing patient, appointment, or billing data in a legacy system, we need to audit that data to:

1. **Scope migration effort** (how many hours, what complexity)
2. **Assess data quality** (is it clean, or does it need cleanup?)
3. **Plan cutover strategy** (how to transition from old → new system on July 14)
4. **Estimate additional costs** (if migration is complex, may add $2,000-5,000)

**If you have NO legacy data:** Skip to the end and confirm "greenfield start".

---

## Section 1: Current Systems

### Question 1.1: Do you currently have a patient/appointment management system?

**Select ONE:**

- [ ] **NO** — We're starting fresh (greenfield)
  - Skip to Section 9 (Conclusion)
  - No migration needed

- [ ] **YES** — We're using [system name]: ____________________________________
  - Continue to Section 2
  - Examples: Clínica Max, ClinicManager, ProClinic, Agendamed, custom database, etc.

- [ ] **PARTIAL** — We're using spreadsheet/paper for tracking
  - Continue to Section 2
  - Will need manual data entry or digitization

**If YES, answer additional questions:**

1. **How long has the system been in use?**
   - [ ] <1 year (newer, likely cleaner data)
   - [ ] 1-3 years
   - [ ] 3-5 years
   - [ ] >5 years (likely lots of technical debt & inconsistencies)

2. **Who built/manages the system?**
   - [ ] Commercial software (SaaS, packaged solution)
   - [ ] Custom built (by in-house IT or contractor)
   - [ ] Spreadsheet (Excel/Google Sheets)

3. **Is the system still actively maintained?**
   - [ ] YES — Vendor/developer actively updates it
   - [ ] NO — No support, but still functional
   - [ ] ABANDONED — No longer accessible or maintained

---

## Section 2: Patient Data Volume

### Question 2.1: How many patients are in your current system?

**Approximate count:**

- Total number of patient records: ____________
- **Active patients** (seen in last 12 months): ____________
- **Inactive patients** (no visits in last 12 months): ____________

**Note:** We typically migrate ONLY active patients in Phase 2. Inactive records can be archived separately.

### Question 2.2: What patient data fields do you capture?

**Check all that apply:**

**Essential (MUST have):**
- [ ] Patient name
- [ ] Email address
- [ ] Phone number
- [ ] Date of birth
- [ ] Gender

**Important (for medical context):**
- [ ] Medical history (past diagnoses, treatments)
- [ ] Medications currently taking
- [ ] Allergies (drug allergies, food allergies)
- [ ] Insurance information (policy #, provider)
- [ ] Preferred contact method (WhatsApp, email, phone)

**Optional (nice-to-have):**
- [ ] Address (street, city, state, ZIP)
- [ ] Occupation
- [ ] Emergency contact name/phone
- [ ] Photo/avatar
- [ ] Previous surgeries
- [ ] Vaccination records
- [ ] Lab test results/history

**Missing data to ask clinic:**
Which of the above does your current system NOT capture? ____________________________________

---

## Section 3: Appointment Data Volume

### Question 3.1: How many appointments are in your current system?

- Total appointments (all time): ____________
- Appointments in last **12 months**: ____________
- Appointments in last **3 months** (most relevant): ____________

**Example:** If you have 5,000 appointments total but only 200 in last 3 months, we'd recommend migrating last 12 months only.

### Question 3.2: What appointment data do you track?

**Check all that apply:**

**Essential:**
- [ ] Appointment date & time
- [ ] Patient name/ID
- [ ] Doctor name/ID
- [ ] Appointment status (scheduled, completed, cancelled, no-show)

**Important:**
- [ ] Appointment type (consultation, procedure, follow-up, etc.)
- [ ] Duration (how long the appointment was)
- [ ] Clinical notes (what the doctor documented)
- [ ] Procedure/diagnosis code

**Optional:**
- [ ] Location (which clinic room)
- [ ] Payment received (yes/no)
- [ ] Amount charged
- [ ] Reminders sent (24h, 1h before)
- [ ] Cancellation reason

**Missing data:**
Which key fields does your current system NOT capture? ____________________________________

---

## Section 4: Billing & Payment Data Volume

### Question 4.1: Do you track payment/billing data in your current system?

- [ ] **NO** — Payments are manual/outside system (cash, separate invoice software)
  - Skip to Section 5

- [ ] **YES** — We track payment data in current system
  - Continue to Question 4.2

### Question 4.2: If YES to billing, what data do you have?

**Check all that apply:**

- [ ] Invoice records (for each appointment)
- [ ] Payment amount
- [ ] Payment method (cash, card, check, transfer)
- [ ] Payment status (paid, pending, failed)
- [ ] Payment date
- [ ] Patient balance (amount owed)
- [ ] Tax documents (NF-e, receipts)

**Approximate volume:**
- Total invoices/payments in system: ____________
- Invoices in last 12 months: ____________
- Unpaid/outstanding balances: ____________

---

## Section 5: Data Location & Format

### Question 5.1: Where is the data currently stored?

**Select ONE:**

- [ ] **Database**
  - What type? (PostgreSQL, MySQL, SQL Server, MongoDB, other): _____________
  - Hosted where? (on-premises, cloud provider): _____________
  - Can we access it directly? [ ] YES [ ] NO

- [ ] **Spreadsheet** (Excel, Google Sheets, LibreOffice)
  - How many sheets? ____________
  - File size? ____________ MB

- [ ] **Cloud service** (SaaS, web-based)
  - Which service? (Clínica Max, ClinicManager, etc.): _____________
  - Can we export data? [ ] YES [ ] NO

- [ ] **Paper records**
  - Stored in filing cabinet?
  - Would need manual digitization (significant effort & cost)

### Question 5.2: Can you export the data as CSV or SQL?

**Critical for migration:**

- [ ] **YES** — We can export CSV files (preferred)
  - Can clinic do this themselves? [ ] YES [ ] NO
  - Export deadline (when can you provide?): __________

- [ ] **YES** — We can export SQL dump (preferred for databases)
  - Can clinic do this themselves? [ ] YES [ ] NO
  - Export deadline: __________

- [ ] **NO** — Data is locked in proprietary format
  - Can vendor provide export? [ ] YES [ ] NO [ ] UNKNOWN
  - This will require manual data entry or API-based migration (more expensive)

- [ ] **MAYBE** — Need to check with IT/vendor
  - Will clinic investigate? [ ] YES
  - Investigation deadline: __________

### Question 5.3: Can we access the system directly via API or database?

- [ ] **YES** — System has API we can use to extract data
  - API documentation available? [ ] YES [ ] NO
  - API requires authentication? [ ] YES [ ] NO

- [ ] **YES** — System is a database we can query directly
  - Can clinic grant us database access? [ ] YES [ ] NO [ ] UNCERTAIN

- [ ] **NO** — System is a black box, export-only
  - Then we'll use CSV export method

---

## Section 6: Data Quality Assessment

### Question 6.1: How would you rate the quality of your current data?

**Be honest! Data quality significantly impacts migration effort.**

**Patient Data Quality:**

- **Phone numbers:**
  - [ ] All formatted consistently (with country code, area code)
  - [ ] PARTIAL — Most are formatted, some are messy
  - [ ] INCONSISTENT — Mix of formats (5 digits, 10 digits, no area code, etc.)

- **Email addresses:**
  - [ ] All valid & verified
  - [ ] PARTIAL — Some invalid/bounced emails
  - [ ] INCONSISTENT — Blank or incorrect emails

- **Names:**
  - [ ] Standardized (First Name Last Name)
  - [ ] INCONSISTENT — Mix of "João Silva", "silva, joao", "joao_silva", etc.

- **Date of birth:**
  - [ ] All complete & correct
  - [ ] PARTIAL — Some missing
  - [ ] INCONSISTENT — Mix of formats (01/01/1990, 1990-01-01, unknown)

**Appointment Data Quality:**

- **Appointment dates/times:**
  - [ ] All complete & accurate
  - [ ] PARTIAL — Some missing time
  - [ ] INCONSISTENT — Some dates in past, some in future, unclear timezone

- **Doctor names:**
  - [ ] Standardized (matches actual staff list)
  - [ ] INCONSISTENT — Mix of "Dr. João Silva", "joao", "Silva, J.", typos

- **Patient references:**
  - [ ] All appointments link to valid patient records
  - [ ] PARTIAL — Some orphaned appointments (no linked patient)
  - [ ] INCONSISTENT — Some appointments reference deleted/invalid patients

**Billing Data Quality (if applicable):**

- **Invoice amounts:**
  - [ ] All complete & correct
  - [ ] PARTIAL — Some missing amounts
  - [ ] INCONSISTENT — Decimal separators, currencies mixed

### Question 6.2: Are there duplicate patient records?

- [ ] **NO** — System prevents duplicates (unique constraint on email/phone)
- [ ] **YES, MINOR** — 5-10 duplicate records (maybe 1-2 people with multiple entries)
- [ ] **YES, MODERATE** — 10-50 duplicates (patients entered multiple times with variations)
- [ ] **YES, SIGNIFICANT** — 50+ duplicates (major data cleanup needed)
- [ ] **UNKNOWN** — Haven't checked, but suspect there may be some

**If YES, duplicates:**
- Are they identifiable by email/phone? [ ] YES [ ] NO
- Should we merge them or keep separate? ___________

### Question 6.3: Data consistency check:

- [ ] **Patient count vs. appointment count:** Do the numbers make sense? (e.g., 1000 patients, 2000 appointments = 2 avg appointments per patient)
- [ ] **Gaps:** Are there time periods with no appointments? (Could indicate data loss or system downtime)
- [ ] **Outliers:** Are there unusually old appointments (20+ years) that should be archived?

---

## Section 7: Data Consent & Privacy Compliance

### Question 7.1: Privacy & GDPR/LGPD compliance:

**Critical for legal migration:**

- [ ] **YES** — Legacy data has been GDPR/LGPD audited
  - Documentation available? [ ] YES [ ] NO

- [ ] **PARTIAL** — Some patients have consent, others don't
  - Estimate percentage with valid consent: _____%

- [ ] **NO/UNKNOWN** — Haven't verified privacy compliance
  - Willing to conduct audit before migration? [ ] YES [ ] NO

### Question 7.2: Right to be forgotten requests:

- [ ] **NO** — No patients have requested deletion
- [ ] **YES** — Some patients have requested deletion
  - Approximately how many? ___________
  - Are they still in the system? [ ] YES [ ] NO

**Note:** Under LGPD, patients can request their data be deleted. We should exclude those records from migration.

### Question 7.3: Patient consent for new system:

- [ ] **YES** — Patients have signed consent to migrate data to new platform
  - Documentation available? [ ] YES [ ] NO

- [ ] **NO** — Haven't asked patients yet
  - Willing to get consent before migration? [ ] YES [ ] NO
  - Estimated timeline to get consent: _____________

---

## Section 8: Migration Timeline & Constraints

### Question 8.1: When must legacy data be migrated?

- [ ] **Before go-live (July 14)** — Patients should see historical appointments
- [ ] **After go-live** — Okay to migrate data in the weeks after launch
- [ ] **Specific date required:** __________________

**Constraint:** If migration must happen BEFORE July 14, we need to start this in Week 1 (May 20-31). If after go-live, we have more flexibility.

### Question 8.2: Can the old system run in parallel during Phase 2?

- [ ] **YES** — We can keep using old system through July 14
  - Then switch to new system on July 14

- [ ] **NO** — Old system will be taken offline soon
  - When? __________
  - We need to migrate before that date

- [ ] **UNKNOWN** — Depends on vendor support contract

**This affects our migration strategy. Parallel running is less risky (can validate new system before switching).**

### Question 8.3: What if migration takes longer than expected?

- [ ] **Can delay go-live to July 28** (2-week buffer)
- [ ] **Must go-live July 14 NO MATTER WHAT** (limits migration scope, may exclude old data)
- [ ] **Willing to go-live with partial data** (migrate recent 3 months only, do old data later)

---

## Section 9: Migration Effort Estimation

**Based on your answers above, here's our preliminary estimate:**

### Scenario A: Greenfield (NO legacy data)
- **Migration effort:** 0 hours
- **Cost:** Included in Phase 2 ($0 additional)
- **Timeline:** N/A
- **Clinic decision:** [ ] This is us

### Scenario B: Small, clean dataset
- **Characteristics:** <1,000 records, CSV export, clean data, no duplicates
- **Migration effort:** 8-16 hours (1-2 days)
- **Cost:** Included in Phase 2 ($0 additional)
- **Timeline:** Can complete during Week 1 (May 20-31)
- **Clinic decision:** [ ] This is us

### Scenario C: Medium dataset, some cleanup
- **Characteristics:** 1,000-10,000 records, CSV export, needs de-duplication & validation
- **Migration effort:** 20-40 hours (2.5-5 days)
- **Cost:** $2,000 additional (overtime for data cleanup)
- **Timeline:** Can complete during Week 1-2 (May 20-June 2)
- **Clinic decision:** [ ] This is us

### Scenario D: Large or complex dataset
- **Characteristics:** 10,000+ records, multiple tables, custom transformations, API-based migration
- **Migration effort:** 40-80 hours (5-10 days)
- **Cost:** $4,000-6,000 additional
- **Timeline:** Requires full Week 1 (May 20-31), may extend to Week 2
- **Clinic decision:** [ ] This is us

### Scenario E: Problematic legacy system
- **Characteristics:** Locked format, no export, poor data quality, significant cleanup required
- **Migration effort:** 80+ hours (10+ days)
- **Cost:** $6,000+ (may need specialized contractor)
- **Timeline:** May push go-live back to July 28
- **Clinic decision:** [ ] This is us

---

## Section 10: Data Migration Story (ROLL-002)

**If you have legacy data, this will become a story in Phase 2:**

### Story: ROLL-002 (Rollover/Legacy Data Migration)

**Title:** "Migrate legacy patient & appointment data to Aria Clinic"

**Acceptance Criteria:**
1. All patient records from last 12 months migrated successfully
2. All appointment history (last 12 months) migrated with correct dates/times
3. Data validation: Spot-check 50 records to verify accuracy
4. Patient data quality: No critical data loss (names, emails, phones intact)
5. Duplicates removed or merged
6. Patient privacy/LGPD compliance verified
7. Rollback plan tested (can revert to old system if migration fails)

**Story Points:** 8-40 depending on Scenario (A-E above)

**Timeline:** Week 1-2 (May 20 — June 2, before UAT)

**Owner:** Dara (@data-engineer)

---

## Section 11: Final Assessment

### Please provide:

**1. Current system name & description:**
```
_________________________________________________________________
```

**2. Data volume summary:**
- Patients: ________ (active: ________)
- Appointments: ________ (last 12 months: ________)
- Invoices/payments: ________ (if applicable)

**3. Expected migration scenario (A-E):**
```
[ ] A (Greenfield)
[ ] B (Small & clean)
[ ] C (Medium, some cleanup)
[ ] D (Large & complex)
[ ] E (Problematic)
```

**4. Estimated additional cost you're willing to accept:**
- [ ] $0 (only if scenario A or B)
- [ ] Up to $2,000 (scenarios B-C)
- [ ] Up to $5,000 (scenarios C-D)
- [ ] >$5,000 (scenario D-E, or we defer migration)

**5. Is there anything else about your legacy data we should know?**
```
_________________________________________________________________
_________________________________________________________________
```

---

## Submission Instructions

**Send completed form by:** May 19, 2026, 5:00 PM

**Send to:**
- Dara (@data-engineer): dara@aria-clinic.dev
- Morgan (@pm): morgan@aria-clinic.dev

**Contact Dara with questions:**
- Phone: 11 9999-0002
- Email: dara@aria-clinic.dev

---

## Next Steps

**After we receive this form:**

1. Dara reviews and provides detailed migration estimate
2. Clinic confirms acceptable cost/timeline
3. ROLL-002 story created with clear acceptance criteria
4. Migration starts Week 1 (May 20-31)
5. Validation complete by June 2 (before UAT)
6. Data migrated to production by July 13 (day before go-live)

**If migration is complex**, we may recommend:
- Delaying go-live to July 28 for more time
- Doing a partial migration (recent data only, old data archived separately)
- Deferring to Phase 3 (after July 14 launch)

---

## Privacy Statement

**Data shared in this form is confidential.** We will only use it to:
- Assess migration effort
- Plan Phase 2 timeline
- Prepare technical design

**We will NOT:**
- Share data with third parties
- Use data for marketing/analytics
- Retain data after migration is complete

---

**Form Status:** Ready to Send to Clinic
**Generated:** May 17, 2026
**Deadline:** May 19, 2026, 5:00 PM

*This questionnaire is part of Phase 2 planning. Clinic completion is critical for accurate timeline & budget planning.*
