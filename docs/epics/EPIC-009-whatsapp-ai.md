# EPIC-009: WhatsApp AI Assistant Integration

**Phase:** Advanced (Week 5-6) | **Owner:** @pm

## Business Objective
Intelligent AI assistant via WhatsApp for patient engagement, appointment reminders, treatment information, and lead qualification. Reduce manual support burden.

## Acceptance Criteria
- [ ] WhatsApp Business API integration
- [ ] AI-powered chatbot (Claude/GPT-based)
- [ ] Appointment reminders and confirmations
- [ ] Treatment information requests
- [ ] Lead qualification and qualification
- [ ] Patient feedback collection
- [ ] Automated response to common questions
- [ ] Escalation to human agent when needed
- [ ] Conversation history and analytics
- [ ] Multi-language support (Portuguese, English)

## User Stories (from @sm)
1. WA-001: WhatsApp Business API Setup
2. WA-002: AI Chatbot Integration (Claude)
3. WA-003: Appointment Reminders & Confirmations
4. WA-004: Treatment Information Queries
5. WA-005: Lead Qualification Flow
6. WA-006: Patient Feedback Collection
7. WA-007: Human Escalation Workflow
8. WA-008: Conversation Analytics

## Technical Requirements
- **WhatsApp Integration:** WhatsApp Business API via Twilio/Official API
- **AI Model:** Claude API for natural language understanding
- **Message Queue:** n8n or similar for workflow automation
- **Database Schema:**
  ```
  whatsapp_conversations table: id, patient_id/lead_id, message_count, status, created_at
  whatsapp_messages table: id, conversation_id, sender, content, timestamp, ai_response
  whatsapp_intents table: id, name (appointment_reminder, treatment_info, lead_qualification)
  ```
- **Webhooks:** Receive and process incoming messages
- **Rate Limiting:** Comply with WhatsApp API limits
- **Error Handling:** Message queue for retries

## Dependencies
- EPIC-001 (requires authentication)
- EPIC-003 (uses patient data)
- EPIC-004 (sends appointment reminders)
- EPIC-008 (uses CRM lead data)

## Related Epics
- EPIC-007 (tracks WhatsApp conversation costs)
- EPIC-002 (Dashboard shows WhatsApp metrics)

## Notes
- Privacy-compliant (LGPD - Brazilian data protection law)
- Support both automated and manual responses
- Conversation history for compliance
- Integration with patient consent tracking
- Support media sharing (photos, documents)
- Future: Prescription sharing via WhatsApp
