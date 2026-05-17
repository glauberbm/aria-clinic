/**
 * WhatsApp Message Templates
 * Templates for appointment reminders, follow-ups, and notifications
 *
 * These templates are used with WhatsApp Business Account
 * Variables are substituted at runtime using template parameters
 */

export type MessageTemplateType =
  | 'appointment_reminder_24h'
  | 'appointment_reminder_1h'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'treatment_update'
  | 'follow_up_reminder'
  | 'medication_reminder'
  | 'general_notification';

export interface MessageTemplate {
  id: string;
  name: string;
  type: MessageTemplateType;
  language: string;
  body: string;
  variables: string[];
  category: 'APPOINTMENT_REMINDER' | 'APPOINTMENT_UPDATE' | 'TREATMENT' | 'MEDICATION' | 'NOTIFICATION';
}

/**
 * Pre-configured WhatsApp message templates
 * These match WhatsApp Business Account template structure
 */
export const whatsappTemplates: Record<MessageTemplateType, MessageTemplate> = {
  // Appointment Reminders
  appointment_reminder_24h: {
    id: 'appointment_reminder_24h',
    name: 'Appointment Reminder 24h',
    type: 'appointment_reminder_24h',
    language: 'pt_BR',
    body: 'Olá {{patientName}}, lembrando que você tem uma consulta amanhã às {{appointmentTime}} com Dr(a) {{providerName}}. Endereço: {{appointmentLocation}}. Confirme sua presença respondendo SIM ou CANCELAR se precisar remarcar.',
    variables: ['patientName', 'appointmentTime', 'providerName', 'appointmentLocation'],
    category: 'APPOINTMENT_REMINDER',
  },

  appointment_reminder_1h: {
    id: 'appointment_reminder_1h',
    name: 'Appointment Reminder 1h',
    type: 'appointment_reminder_1h',
    language: 'pt_BR',
    body: 'Sua consulta com Dr(a) {{providerName}} começa em 1 hora. Endereço: {{appointmentLocation}}. Estamos na espera!',
    variables: ['providerName', 'appointmentLocation'],
    category: 'APPOINTMENT_REMINDER',
  },

  // Appointment Status Updates
  appointment_confirmed: {
    id: 'appointment_confirmed',
    name: 'Appointment Confirmed',
    type: 'appointment_confirmed',
    language: 'pt_BR',
    body: 'Perfeito {{patientName}}! Sua consulta foi confirmada para {{appointmentDate}} às {{appointmentTime}} com Dr(a) {{providerName}}.',
    variables: ['patientName', 'appointmentDate', 'appointmentTime', 'providerName'],
    category: 'APPOINTMENT_UPDATE',
  },

  appointment_cancelled: {
    id: 'appointment_cancelled',
    name: 'Appointment Cancelled',
    type: 'appointment_cancelled',
    language: 'pt_BR',
    body: 'Sua consulta agendada para {{appointmentDate}} foi cancelada. Se deseja reagendar, acesse nosso portal ou responda este mensaje.',
    variables: ['appointmentDate'],
    category: 'APPOINTMENT_UPDATE',
  },

  // Treatment & Follow-up
  treatment_update: {
    id: 'treatment_update',
    name: 'Treatment Update',
    type: 'treatment_update',
    language: 'pt_BR',
    body: 'Olá {{patientName}}, sua consulta de {{treatmentType}} foi realizada com sucesso em {{treatmentDate}}. Os resultados estarão disponíveis em breve.',
    variables: ['patientName', 'treatmentType', 'treatmentDate'],
    category: 'TREATMENT',
  },

  follow_up_reminder: {
    id: 'follow_up_reminder',
    name: 'Follow-up Reminder',
    type: 'follow_up_reminder',
    language: 'pt_BR',
    body: 'Olá {{patientName}}, é hora do seu acompanhamento. Você tem uma consulta de follow-up agendada para {{followUpDate}}. Confirme sua presença!',
    variables: ['patientName', 'followUpDate'],
    category: 'TREATMENT',
  },

  // Medication Reminders
  medication_reminder: {
    id: 'medication_reminder',
    name: 'Medication Reminder',
    type: 'medication_reminder',
    language: 'pt_BR',
    body: 'Olá {{patientName}}, lembrete para tomar seu medicamento: {{medicationName}} {{dosage}} {{frequency}}. Não esqueça!',
    variables: ['patientName', 'medicationName', 'dosage', 'frequency'],
    category: 'MEDICATION',
  },

  // General Notifications
  general_notification: {
    id: 'general_notification',
    name: 'General Notification',
    type: 'general_notification',
    language: 'pt_BR',
    body: '{{message}}',
    variables: ['message'],
    category: 'NOTIFICATION',
  },
};

/**
 * Get template by type
 */
export function getTemplate(type: MessageTemplateType): MessageTemplate {
  const template = whatsappTemplates[type];
  if (!template) {
    throw new Error(`Template not found: ${type}`);
  }
  return template;
}

/**
 * Substitute template variables with actual values
 */
export function substituteTemplate(
  templateType: MessageTemplateType,
  variables: Record<string, string | number>
): string {
  const template = getTemplate(templateType);
  let body = template.body;

  // Replace each variable in the template
  template.variables.forEach((varName) => {
    const value = variables[varName];
    if (value === undefined) {
      console.warn(`Missing template variable: ${varName}`);
      return;
    }
    const regex = new RegExp(`{{${varName}}}`, 'g');
    body = body.replace(regex, String(value));
  });

  return body;
}

/**
 * Validate that all required variables are provided
 */
export function validateTemplateVariables(
  templateType: MessageTemplateType,
  variables: Record<string, string | number>
): { valid: boolean; missing: string[] } {
  const template = getTemplate(templateType);
  const missing = template.variables.filter((varName) => variables[varName] === undefined);

  return {
    valid: missing.length === 0,
    missing,
  };
}
