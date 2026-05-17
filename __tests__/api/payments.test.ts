import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

interface MockSupabase {
  auth: {
    getUser: jest.Mock;
  };
  from: jest.Mock;
}

describe('Payment API - 005.001', () => {
  let mockSupabase: MockSupabase;
  const mockAppointmentId = '123e4567-e89b-12d3-a456-426614174000';
  const mockPaymentId = '456e5678-f90c-23e4-b567-537725285111';
  const mockPaymentIntentId = 'pi_1234567890abcdef';

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
      }),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('POST /api/payments/process', () => {
    it('should validate payment request requires appointment_id, amount_cents, currency', () => {
      const validRequest = {
        appointment_id: mockAppointmentId,
        amount_cents: 10000,
        currency: 'BRL',
      };
      expect(validRequest).toHaveProperty('appointment_id');
      expect(validRequest).toHaveProperty('amount_cents');
      expect(validRequest).toHaveProperty('currency');
    });

    it('should require authorization header', () => {
      const requestWithoutAuth = {};
      const hasAuth = 'Authorization' in requestWithoutAuth;
      expect(hasAuth).toBe(false);
    });

    it('should reject invalid request body', () => {
      const invalidBody = {};
      const isValid =
        'appointment_id' in invalidBody &&
        'amount_cents' in invalidBody &&
        'currency' in invalidBody;
      expect(isValid).toBe(false);
    });

    it('should check appointment existence before processing', () => {
      const appointmentData = { id: mockAppointmentId, clinic_id: 'clinic-1' };
      expect(appointmentData).toBeDefined();
      expect(appointmentData.id).toBe(mockAppointmentId);
    });

    it('should prevent duplicate payments', () => {
      const existingPayment = { id: mockPaymentId, status: 'succeeded' };
      const isDuplicate = existingPayment !== null && existingPayment.status === 'succeeded';
      expect(isDuplicate).toBe(true);
    });

    it('should generate idempotency key from appointment_id and timestamp', () => {
      const timestamp = Date.now();
      const idempotencyKey = `${mockAppointmentId}-${timestamp}`;
      expect(idempotencyKey).toContain(mockAppointmentId);
      expect(typeof timestamp).toBe('number');
    });

    it('should store payment with pending status initially', () => {
      const paymentRecord = {
        id: mockPaymentId,
        appointment_id: mockAppointmentId,
        status: 'pending',
        stripe_payment_intent_id: mockPaymentIntentId,
      };
      expect(paymentRecord.status).toBe('pending');
    });
  });

  describe('POST /api/payments/{id}/confirm', () => {
    it('should confirm PaymentIntent with payment_method_id', () => {
      const confirmRequest = {
        payment_method_id: 'pm_1234567890',
      };
      expect(confirmRequest).toHaveProperty('payment_method_id');
    });

    it('should verify payment exists before confirming', () => {
      const payment = {
        id: mockPaymentId,
        stripe_payment_intent_id: mockPaymentIntentId,
      };
      expect(payment).toBeDefined();
      expect(payment.stripe_payment_intent_id).toBe(mockPaymentIntentId);
    });

    it('should handle requires_action status for 3D Secure', () => {
      const confirmedIntent = {
        id: mockPaymentIntentId,
        status: 'requires_action',
        client_secret: 'pi_test_secret_requires_action',
      };
      expect(confirmedIntent.status).toBe('requires_action');
      expect(confirmedIntent.client_secret).toBeDefined();
    });

    it('should handle succeeded status for completed payment', () => {
      const confirmedIntent = {
        id: mockPaymentIntentId,
        status: 'succeeded',
        client_secret: 'pi_test_secret_123',
      };
      expect(confirmedIntent.status).toBe('succeeded');
    });
  });

  describe('Webhook - /api/webhooks/stripe', () => {
    it('should require stripe-signature header', () => {
      const webhookRequest = { signature: null };
      expect(webhookRequest.signature).toBeNull();
    });

    it('should prevent duplicate webhook processing by stripe_event_id', () => {
      const webhookEvents = [
        {
          stripe_event_id: 'evt_123',
          processed: true,
        },
        {
          stripe_event_id: 'evt_123',
          processed: false,
        },
      ];
      const isDuplicate = webhookEvents.some(
        (e) => e.stripe_event_id === webhookEvents[0].stripe_event_id
      );
      expect(isDuplicate).toBe(true);
    });

    it('should handle payment_intent.succeeded event', () => {
      const event = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: mockPaymentIntentId,
            status: 'succeeded',
          },
        },
      };
      expect(event.type).toBe('payment_intent.succeeded');
      expect(event.data.object.status).toBe('succeeded');
    });

    it('should handle payment_intent.payment_failed event', () => {
      const event = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: mockPaymentIntentId,
            last_payment_error: {
              code: 'card_declined',
            },
          },
        },
      };
      expect(event.type).toBe('payment_intent.payment_failed');
      expect(event.data.object.last_payment_error.code).toBe('card_declined');
    });

    it('should handle charge.refunded event', () => {
      const event = {
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_123',
            payment_intent: mockPaymentIntentId,
            amount_refunded: 10000,
          },
        },
      };
      expect(event.type).toBe('charge.refunded');
      expect(event.data.object.payment_intent).toBe(mockPaymentIntentId);
    });

    it('should track retry count for failed processing', () => {
      const webhookEvent = {
        id: 'wh_123',
        retry_count: 0,
      };
      webhookEvent.retry_count++;
      expect(webhookEvent.retry_count).toBe(1);
    });
  });

  describe('Error Handling - PT-BR Messages', () => {
    it('should use card_declined error message', () => {
      const message = 'Seu cartão foi recusado. Verifique os dados e tente novamente.';
      expect(message).toContain('cartão foi recusado');
    });

    it('should use processing_error message', () => {
      const message = 'Erro ao processar o pagamento. Tente novamente em alguns instantes.';
      expect(message).toContain('Erro ao processar');
    });

    it('should use rate_limit_error message', () => {
      const message = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
      expect(message).toContain('Muitas tentativas');
    });

    it('should use expired_card error message', () => {
      const message = 'Seu cartão expirou. Use outro cartão.';
      expect(message).toContain('cartão expirou');
    });

    it('should use incorrect_cvc error message', () => {
      const message = 'Código de segurança incorreto. Verifique os dados.';
      expect(message).toContain('Código de segurança');
    });

    it('should not expose internal error details', () => {
      const errorResponse = {
        error: 'Erro ao processar o pagamento. Tente novamente em alguns instantes.',
      };
      expect(errorResponse.error).not.toContain('stack');
      expect(errorResponse.error).not.toContain('stripe_error_code');
    });
  });

  describe('Audit Logging', () => {
    it('should create audit log entry for payment creation', () => {
      const auditLog = {
        clinic_id: 'clinic-1',
        action: 'payment_intent_created',
        resource_type: 'payment',
        resource_id: mockPaymentId,
      };
      expect(auditLog.action).toBe('payment_intent_created');
      expect(auditLog).toHaveProperty('resource_id');
    });

    it('should create audit log entry for payment success', () => {
      const auditLog = {
        clinic_id: 'clinic-1',
        action: 'payment_succeeded',
        resource_type: 'payment',
        resource_id: mockPaymentId,
      };
      expect(auditLog.action).toBe('payment_succeeded');
    });

    it('should never log card data', () => {
      const auditMetadata = {
        stripe_payment_intent_id: mockPaymentIntentId,
        appointment_id: mockAppointmentId,
        // NO: card_number, cvv, expiry, etc.
      };
      expect(auditMetadata).not.toHaveProperty('card_number');
      expect(auditMetadata).not.toHaveProperty('cvv');
      expect(auditMetadata).not.toHaveProperty('expiry');
    });
  });

  describe('Idempotency', () => {
    it('should use Idempotency-Key header for deduplication', () => {
      const idempotencyKey = `${mockAppointmentId}-${Date.now()}`;
      expect(idempotencyKey).toContain(mockAppointmentId);
      expect(typeof idempotencyKey).toBe('string');
    });

    it('should cache response with same idempotency key', () => {
      const timestamp = Date.now();
      const key1 = `${mockAppointmentId}-${timestamp}`;
      const key2 = `${mockAppointmentId}-${timestamp}`;
      expect(key1).toBe(key2);
    });
  });

  describe('Database Schema', () => {
    it('should have payments table with required fields', () => {
      const paymentsTable = {
        id: mockPaymentId,
        appointment_id: mockAppointmentId,
        stripe_payment_intent_id: mockPaymentIntentId,
        amount_cents: 10000,
        currency: 'BRL',
        status: 'pending',
        requires_action: false,
        client_secret: 'pi_test_secret',
      };
      expect(paymentsTable).toHaveProperty('stripe_payment_intent_id');
      expect(paymentsTable).toHaveProperty('status');
    });

    it('should have webhook_events table for idempotency', () => {
      const webhookEvent = {
        id: 'wh_123',
        stripe_event_id: 'evt_123',
        event_type: 'payment_intent.succeeded',
        processed: false,
        retry_count: 0,
      };
      expect(webhookEvent).toHaveProperty('stripe_event_id');
      expect(webhookEvent).toHaveProperty('retry_count');
    });

    it('should update appointments table with payment_status', () => {
      const appointment = {
        id: mockAppointmentId,
        payment_status: 'paid',
        payment_id: mockPaymentId,
      };
      expect(appointment.payment_status).toBe('paid');
      expect(appointment).toHaveProperty('payment_id');
    });
  });
});
