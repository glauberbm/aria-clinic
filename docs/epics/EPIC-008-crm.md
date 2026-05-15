# EPIC-008: CRM Integration & Lead Management

**Phase:** Advanced (Week 5) | **Owner:** @pm

## Business Objective
Customer relationship management with lead tracking, opportunity pipeline, follow-up automation, and customer lifetime value analytics.

## Acceptance Criteria
- [ ] Lead creation and tracking
- [ ] Opportunity pipeline management
- [ ] Sales process automation (follow-ups, reminders)
- [ ] Lead scoring and prioritization
- [ ] Contact history and communication log
- [ ] Customer lifetime value (CLV) calculation
- [ ] Automated email/WhatsApp sequences
- [ ] Lead source tracking
- [ ] Conversion funnel analytics

## User Stories (from @sm)
1. CRM-001: Lead Creation & Management
2. CRM-002: Opportunity Pipeline View
3. CRM-003: Automated Follow-ups
4. CRM-004: Lead Scoring Engine
5. CRM-005: Communication History
6. CRM-006: CLV Analytics
7. CRM-007: Lead Source Tracking

## Technical Requirements
- **Database Schema:**
  ```
  leads table: id, name, email, phone, source, status, created_at
  opportunities table: id, lead_id, value, probability, expected_close_date, status
  opportunity_activities table: id, opportunity_id, activity_type, notes, date
  lead_sources table: id, name (referral, web, social, etc.)
  lead_scoring_rules table: id, rule_type, weight
  ```
- **Automation:** n8n workflows for follow-ups
- **WhatsApp Integration:** Automated lead nurture sequences
- **Analytics:** CLV model, conversion rates
- **UI:** Kanban board for opportunity pipeline

## Dependencies
- EPIC-001 (requires authentication)
- EPIC-003 (Patients module - leads convert to patients)
- EPIC-007 (Financial module - opportunity value linked to revenue)

## Related Epics
- EPIC-009 (WhatsApp AI uses CRM data)
- EPIC-002 (Dashboard shows lead metrics)

## Notes
- Lead-to-patient conversion tracking critical
- Support multiple lead sources
- Automated scoring based on engagement
- Integration with WhatsApp Business API
- Future: Integration with external CRM systems
