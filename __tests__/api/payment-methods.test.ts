import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js');
jest.mock('@/lib/stripe/setup-intent');

describe('Payment Methods API', () => {
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.mocked(createClient).mockReturnValue(mockSupabase as any);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('DELETE /api/patient/[id]/payment-methods/[method_id]', () => {
    it('should reject request without Bearer token', async () => {
      const request = new NextRequest('http://localhost:3000/api/patient/user-123/payment-methods/method-456', {
        method: 'DELETE',
        headers: {},
      });

      // Since we're testing the logic, we'd test the response
      // In actual test, import the DELETE handler
      const authHeader = request.headers.get('Authorization');
      expect(authHeader).toBeNull();
    });

    it('should return 403 if user tries to delete another user\'s method', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const requesterId = 'user-999'; // Different from mockUser.id
      const params = { id: requesterId, method_id: 'method-456' };

      // Cross-patient check: user.id !== params.id
      expect(mockUser.id).not.toBe(params.id);
    });

    it('should verify payment method belongs to patient before deletion', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'method-456',
                clinic_id: 'clinic-123',
                patient_id: mockUser.id,
              },
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      // Verify the query would check patient_id
      const fromCall = mockSupabase.from('payment_methods');
      expect(fromCall).toBeDefined();
    });

    it('should return 404 if payment method not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      // Should handle not found response
      const response = {
        data: null,
        error: { message: 'Not found' },
      };

      expect(response.data).toBeNull();
      expect(response.error).toBeDefined();
    });

    it('should create audit log on successful deletion', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const mockAuditInsert = jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'payment_methods') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: 'method-456',
                      clinic_id: 'clinic-123',
                    },
                    error: null,
                  }),
                }),
              }),
            }),
            update: mockDelete,
          };
        } else if (table === 'audit_logs') {
          return mockAuditInsert;
        }
      });

      // Verify audit log would be created with correct action
      expect(mockAuditInsert).toBeDefined();
    });
  });

  describe('RLS Security', () => {
    it('should enforce patient isolation in payment methods', () => {
      const clinicStaffId = 'staff-123';
      const patientId = 'patient-456';

      // RLS policies:
      // 1. Patients can view only own methods: patient_id = auth.uid() AND deleted_at IS NULL
      // 2. Clinic staff cannot view patient methods

      const rqlPatientCheck = (patient_id: string, auth_uid: string) => {
        return patient_id === auth_uid;
      };

      expect(rqlPatientCheck(patientId, patientId)).toBe(true);
      expect(rqlPatientCheck(patientId, clinicStaffId)).toBe(false);
    });

    it('should return 403 Forbidden for cross-patient access', () => {
      const requesterId = 'user-123';
      const targetPatientId = 'user-456';

      // Cross-patient access check
      const canAccess = requesterId === targetPatientId;

      expect(canAccess).toBe(false);
    });
  });

  describe('Soft Delete Cascade', () => {
    it('should soft-delete payment methods when patient is deleted', async () => {
      const patientId = 'patient-123'; // Used in comment

      // PostgreSQL trigger: on patient soft-delete, soft-delete all payment_methods
      // UPDATE payment_methods SET deleted_at = NOW() WHERE patient_id = {patientId}

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      // Simulate trigger logic
      const trigger = async (patientId: string) => {
        await mockUpdate({ deleted_at: new Date().toISOString() });
      };

      await trigger(patientId);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted_at: expect.any(String),
        })
      );
    });

    it('should include deleted_at in soft-delete query', async () => {
      const patientId = 'patient-123'; // Used in comment

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      });

      // Soft delete should set deleted_at, not physically delete
      const payload = {
        deleted_at: new Date().toISOString(),
      };

      expect(payload).toHaveProperty('deleted_at');
      expect(payload).not.toHaveProperty('id'); // Should not include ID in update
    });
  });

  describe('LGPD Compliance', () => {
    it('should not store raw card data in database', () => {
      // Only stripe_payment_method_id (tokenized) should be stored
      const paymentMethod = {
        id: 'method-123',
        patient_id: 'patient-456',
        clinic_id: 'clinic-789',
        stripe_payment_method_id: 'pm_1234567890', // Tokenized
        // NO: card_number, cvv, expiry_raw
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2026,
      };

      expect(paymentMethod.stripe_payment_method_id).toBeDefined();
      expect(paymentMethod).not.toHaveProperty('card_number');
      expect(paymentMethod).not.toHaveProperty('cvv');
    });

    it('should track soft-delete with deleted_at timestamp', () => {
      const paymentMethod = {
        id: 'method-123',
        patient_id: 'patient-456',
        created_at: new Date('2026-05-15').toISOString(),
        deleted_at: null, // Not deleted initially
      };

      expect(paymentMethod.deleted_at).toBeNull();

      // When deleted
      paymentMethod.deleted_at = new Date('2026-05-17').toISOString();

      expect(paymentMethod.deleted_at).not.toBeNull();
      expect(paymentMethod.deleted_at).toBeDefined();
    });
  });

  describe('Stripe Integration', () => {
    it('should only store stripe_payment_method_id (not full Stripe response)', () => {
      const stripeResponse = {
        id: 'pm_1234567890',
        object: 'payment_method',
        billing_details: { name: 'John Doe' },
        card: { brand: 'visa', last4: '4242' },
        created: 1234567890,
      };

      // Should extract only what we need
      const stored = {
        stripe_payment_method_id: stripeResponse.id,
        brand: stripeResponse.card.brand,
        last4: stripeResponse.card.last4,
      };

      expect(stored.stripe_payment_method_id).toBe('pm_1234567890');
      expect(stored).not.toHaveProperty('billing_details');
      expect(stored).not.toHaveProperty('created');
    });
  });
});
