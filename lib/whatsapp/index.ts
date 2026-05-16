/**
 * WhatsApp Integration Module
 * Public API for WhatsApp messaging, templates, and service
 */

export {
  type MessageTemplateType,
  type MessageTemplate,
  whatsappTemplates,
  getTemplate,
  substituteTemplate,
  validateTemplateVariables,
} from './templates';

export {
  type WhatsAppMessagePayload,
  type WhatsAppMessageResult,
  WhatsAppService,
  createWhatsAppService,
} from './service';
