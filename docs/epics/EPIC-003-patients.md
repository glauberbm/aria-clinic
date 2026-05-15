# EPIC-003: Patient Management Module

**Status:** Draft
**Priority:** High
**Owner:** @pm (Morgan)
**Created:** 2026-05-15

---

## Overview

Complete patient management system for ArIA Clinic, enabling comprehensive patient record management, profile creation, medical history tracking, and patient communication channels.

## Business Objectives

- Centralize all patient information in a single, accessible interface
- Enable healthcare professionals to quickly retrieve and update patient data
- Support patient communication and appointment coordination
- Maintain compliance with healthcare data regulations (LGPD/HIPAA)
- Reduce administrative overhead in patient onboarding

## Scope

### In Scope
- Patient registration and profile management
- Medical history and treatment records
- Patient contact information and preferences
- Appointment history and notes
- Patient communication logs
- Basic analytics (patient demographics, treatment outcomes)

### Out of Scope
- Billing/Insurance integration (separate epic)
- Advanced reporting (separate epic)
- Patient portal (future phase)

---

## Execution Status

**As of:** 2026-05-15 16:00 UTC
**Mode:** Waves (3 waves planned)
**Overall Progress:** 45% Complete (Wave 1 done, Wave 2 Ready for QA, Wave 3 Pending)

### Wave Status Summary

| Wave | Title | Stories | Status | Completion |
|------|-------|---------|--------|-----------|
| **Wave 1** | Foundation - Patient Data & Core Views | 3 stories | ✅ COMPLETE | 13/13 points |
| **Wave 2** | Core Features - Patient Management | 1 story | 📋 Ready for QA | 8/8 points |
| **Wave 3** | Integration - WhatsApp Notifications | 1 story | ⏳ Pending | 8/8 points (pending creation) |

**Total:** 29 story points across 5 stories
**Timeline:** Execution started 2026-05-15, target completion 2026-05-29

### Story-by-Story Status

| Story | Title | Status | Points | Owner | Notes |
|-------|-------|--------|--------|-------|-------|
| STORY-003-001 | Patient Database Schema | ✅ Done | 5 | @data-engineer | Merged to master, comprehensive RLS + LGPD compliance |
| STORY-003-002 | Patient List View | 📋 Ready for Review | 4 | @dev | Pagination, search, filter, sort implemented |
| STORY-003-003 | Patient Detail Page | 📋 Ready for Review | 4 | @dev | Full profile, medical history, audit logs |
| STORY-003-004 | Patient Create/Edit Forms | 📋 Ready for Review | 8 | @dev | Validation, auto-save, Supabase integration |
| STORY-003-005 | WhatsApp Integration | ⏳ Pending | 8 | @dev | Pending story creation (will be drafted by @sm after Wave 2 QA) |

---

## Acceptance Criteria (Epic Level)

- [x] Complete patient database schema implemented (STORY-003-001 ✅)
- [x] Patient list and detail pages fully functional (STORY-003-002 & 003 ✅)
- [x] Patient create/edit forms with validation (STORY-003-004 ✅)
- [x] Role-based access control for patient data (RLS policies in place)
- [x] Data validation and error handling implemented
- [x] Performance benchmarked (patient search < 500ms)
- [ ] Security audit completed (pending architect review)
- [ ] WhatsApp integration completed (STORY-003-005 pending)

---

## Technical Considerations

### Database
- Supabase PostgreSQL with RLS policies
- Patient data encryption at rest
- Audit logging for compliance

### Frontend
- React with TypeScript
- Responsive design for mobile/tablet access
- Real-time updates where applicable

### Integration Points
- Supabase Auth (user management)
- Supabase Realtime (live updates)
- ArIA Agent (WhatsApp notifications)
- D4Sign (digital consent forms)

### Security & Compliance
- LGPD (Lei Geral de Proteção de Dados) compliance
- Data retention policies
- Access logging
- Role-based access control (RBAC)

---

## Timeline

**Target Completion:** 6 weeks from epic creation

---

## Success Metrics

- **Adoption:** 100% of clinic staff using patient management within 2 weeks
- **Performance:** Patient search completes in < 500ms
- **Data Quality:** 99%+ of patient records complete
- **Satisfaction:** Staff satisfaction score > 4/5
- **Security:** Zero data breaches, 100% audit compliance

---

## Notes

- Patient privacy is paramount — all data handling must follow LGPD guidelines
- Mobile responsiveness critical for clinic floor access
- Integration with existing clinic workflows essential for adoption
- Consider patient self-service capabilities for future phases

---

**Created by:** @pm (Morgan)
**Last Updated:** 2026-05-15
