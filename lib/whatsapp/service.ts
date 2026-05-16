/**
 * WhatsApp Integration Service
 * Handles sending messages, tracking delivery, and managing opt-in/opt-out preferences
 *
 * Currently supports mock implementation. Ready for Twilio integration.
 */

import { createClient } from '@supabase/supabase-js';
import { MessageTemplateType, substituteTemplate, validateTemplateVariables } from './templates';

export interface WhatsAppMessagePayload {
  patientId: string;
  clinicId: string;
  phoneNumber: string;
  templateType: MessageTemplateType;
  variables: Record<string, string | number>;
  userId?: string;
  messageType?: 'appointment_reminder' | 'follow_up' | 'treatment_update' | 'notification' | 'general';
}

export interface WhatsAppMessageResult {
  success: boolean;
  messageId?: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
  retryCount: number;
}

/**
 * WhatsApp Service - Main service class
 */
export class WhatsAppService {
  private supabase: ReturnType<typeof createClient>;
  private maxRetries = 3;
  private retryDelayMs = 5000;
  private supabaseAny: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.supabaseAny = this.supabase as any;
  }

  /**
   * Check if patient has WhatsApp enabled and opted in
   */
  async isWhatsAppEnabled(patientId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('patient_contact_preferences')
        .select('whatsapp_enabled')
        .eq('patient_id', patientId)
        .single() as { data: { whatsapp_enabled: boolean } | null; error: any };

      if (error || !data) {
        console.warn(`Could not fetch contact preferences for patient ${patientId}`);
        return false;
      }

      return data.whatsapp_enabled === true;
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      return false;
    }
  }

  /**
   * Check appointment reminder consent
   */
  async hasAppointmentReminderConsent(patientId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('patient_contact_preferences')
        .select('appointment_reminder_consent')
        .eq('patient_id', patientId)
        .single() as { data: { appointment_reminder_consent: boolean } | null; error: any };

      if (error || !data) {
        return true; // Default to true if no preference set
      }

      return data.appointment_reminder_consent === true;
    } catch (error) {
      console.error('Error checking appointment reminder consent:', error);
      return true; // Default to true on error
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppMessageResult> {
    // Validate template variables
    const validation = validateTemplateVariables(payload.templateType, payload.variables);
    if (!validation.valid) {
      return {
        success: false,
        status: 'failed',
        error: `Missing template variables: ${validation.missing.join(', ')}`,
        retryCount: 0,
      };
    }

    // Check opt-in status
    const isEnabled = await this.isWhatsAppEnabled(payload.patientId);
    if (!isEnabled) {
      return {
        success: false,
        status: 'failed',
        error: 'Patient has WhatsApp disabled',
        retryCount: 0,
      };
    }

    // For appointment reminders, check specific consent
    if (
      payload.templateType === 'appointment_reminder_24h' ||
      payload.templateType === 'appointment_reminder_1h'
    ) {
      const hasConsent = await this.hasAppointmentReminderConsent(payload.patientId);
      if (!hasConsent) {
        return {
          success: false,
          status: 'failed',
          error: 'Patient has not consented to appointment reminders',
          retryCount: 0,
        };
      }
    }

    // Substitute variables in template
    const messageBody = substituteTemplate(payload.templateType, payload.variables);

    // Try to send with retries
    let lastError: string | undefined;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.sendToProvider(payload.phoneNumber, messageBody);

        if (result.success) {
          // Log successful message
          await this.logMessage(
            payload.patientId,
            payload.clinicId,
            payload.messageType || 'general',
            messageBody,
            'sent',
            result.messageId,
            payload.userId,
            { templateType: payload.templateType }
          );

          return {
            success: true,
            messageId: result.messageId,
            status: 'sent',
            retryCount: attempt - 1,
          };
        }

        lastError = result.error;

        // Wait before retry
        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs));
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);

        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs));
        }
      }
    }

    // Log failed message
    await this.logMessage(
      payload.patientId,
      payload.clinicId,
      payload.messageType || 'general',
      messageBody,
      'failed',
      undefined,
      payload.userId,
      { templateType: payload.templateType, error: lastError }
    );

    return {
      success: false,
      status: 'failed',
      error: lastError || 'Failed to send message',
      retryCount: this.maxRetries,
    };
  }

  /**
   * Send message to provider (mock implementation)
   * In production, this would call Twilio API or similar
   */
  private async sendToProvider(
    phoneNumber: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Mock implementation: always succeeds, generates message ID
      // In production: call Twilio, Vonage, or other provider
      const messageId = `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(`[WhatsApp Mock] Sending to ${phoneNumber}: ${message.substring(0, 50)}...`);

      // Simulate some async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Log message to database for history and tracking
   */
  private async logMessage(
    patientId: string,
    clinicId: string,
    messageType: 'appointment_reminder' | 'follow_up' | 'treatment_update' | 'notification' | 'general',
    body: string,
    status: 'pending' | 'sent' | 'delivered' | 'failed',
    messageId?: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      const record: Record<string, any> = {
        patient_id: patientId,
        clinic_id: clinicId,
        channel: 'whatsapp',
        message_type: messageType,
        body,
        status,
        sent_at: new Date().toISOString(),
        metadata: {
          message_id: messageId,
          ...metadata,
        },
        created_by: userId,
      };
      await this.supabaseAny.from('patient_communications').insert([record]);
    } catch (error) {
      console.error('Error logging message:', error);
      // Don't throw - logging failure shouldn't block message sending
    }
  }

  /**
   * Update message delivery status
   */
  async updateDeliveryStatus(
    messageId: string,
    status: 'delivered' | 'read' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        status,
      };

      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      } else if (status === 'read') {
        updateData.read_at = new Date().toISOString();
      } else if (status === 'failed' && errorMessage) {
        updateData.error_message = errorMessage;
      }

      await this.supabaseAny
        .from('patient_communications')
        .update(updateData)
        .eq('metadata->message_id', messageId);
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  }

  /**
   * Get conversation history for a patient
   */
  async getConversationHistory(patientId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('patient_communications')
        .select('*')
        .eq('patient_id', patientId)
        .eq('channel', 'whatsapp')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching conversation history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  /**
   * Update patient opt-in/opt-out preferences
   */
  async updateContactPreferences(
    patientId: string,
    whatsappEnabled: boolean,
    appointmentReminderConsent: boolean
  ): Promise<boolean> {
    try {
      const { error } = await this.supabaseAny
        .from('patient_contact_preferences')
        .update({
          whatsapp_enabled: whatsappEnabled,
          appointment_reminder_consent: appointmentReminderConsent,
          updated_at: new Date().toISOString(),
        })
        .eq('patient_id', patientId);

      if (error) {
        console.error('Error updating contact preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating contact preferences:', error);
      return false;
    }
  }
}

/**
 * Factory function to create WhatsApp service
 */
export function createWhatsAppService(): WhatsAppService {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials for WhatsApp service');
  }

  return new WhatsAppService(supabaseUrl, supabaseKey);
}
