import {
  getUserRole,
  hasRole,
  hasPermission,
  getUserRoles,
  assignRole,
  removeRole,
} from '@/lib/auth/permissions';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('Permission Functions', () => {
  let mockCreateClient: jest.MockedFunction<typeof createSupabaseClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient = jest.mocked(createSupabaseClient);
  });

  describe('getUserRole', () => {
    it('should return user role for clinic', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: { roles: [{ name: 'doctor' }] },
        error: null,
      });

      const mockSecondEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockFirstEq = jest.fn().mockReturnValue({ eq: mockSecondEq });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockFirstEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      mockCreateClient.mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const role = await getUserRole('user-123', 'clinic-456');
      expect(role).toBe('doctor');
    });

    it('should return null if user has no role', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const mockSecondEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockFirstEq = jest.fn().mockReturnValue({ eq: mockSecondEq });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockFirstEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      mockCreateClient.mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const role = await getUserRole('user-999', 'clinic-999');
      expect(role).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockCreateClient.mockImplementation(() => {
        throw new Error('Connection error');
      });

      const role = await getUserRole('user-123', 'clinic-456');
      expect(role).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('should return true if user has role', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: { roles: [{ name: 'admin' }] },
        error: null,
      });

      const mockSecondEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockFirstEq = jest.fn().mockReturnValue({ eq: mockSecondEq });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockFirstEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      mockCreateClient.mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const hasAdmin = await hasRole('user-123', 'clinic-456', 'admin');
      expect(hasAdmin).toBe(true);
    });

    it('should return false if user does not have role', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: { roles: [{ name: 'patient' }] },
        error: null,
      });

      const mockSecondEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockFirstEq = jest.fn().mockReturnValue({ eq: mockSecondEq });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockFirstEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      mockCreateClient.mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const hasAdmin = await hasRole('user-123', 'clinic-456', 'admin');
      expect(hasAdmin).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          roles: [
            {
              permissions: ['read', 'write', 'manage_patients'],
            },
          ],
        },
        error: null,
      });

      const mockSecondEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockFirstEq = jest.fn().mockReturnValue({ eq: mockSecondEq });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockFirstEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      mockCreateClient.mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const hasWrite = await hasPermission('user-123', 'clinic-456', 'write');
      expect(hasWrite).toBe(true);
    });

    it('should return false if user does not have permission', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          roles: [
            {
              permissions: ['read_own_data'],
            },
          ],
        },
        error: null,
      });

      const mockSecondEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockFirstEq = jest.fn().mockReturnValue({ eq: mockSecondEq });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockFirstEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      mockCreateClient.mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const canDelete = await hasPermission('user-123', 'clinic-456', 'delete');
      expect(canDelete).toBe(false);
    });

    it('should handle missing permissions gracefully', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: { roles: [] },
        error: null,
      });

      const mockSecondEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockFirstEq = jest.fn().mockReturnValue({ eq: mockSecondEq });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockFirstEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      mockCreateClient.mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const hasPerm = await hasPermission('user-999', 'clinic-999', 'read');
      expect(hasPerm).toBe(false);
    });
  });

  describe('getUserRoles', () => {
    it('should return all roles for user across clinics', async () => {
      const mockEq = jest.fn().mockResolvedValue({
        data: [
          { clinic_id: 'clinic-1', roles: [{ name: 'admin' }] },
          { clinic_id: 'clinic-2', roles: [{ name: 'doctor' }] },
        ],
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      mockCreateClient.mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const roles = await getUserRoles('user-123');
      expect(roles).toHaveLength(2);
      expect(roles[0]).toEqual({ clinicId: 'clinic-1', role: 'admin' });
      expect(roles[1]).toEqual({ clinicId: 'clinic-2', role: 'doctor' });
    });

    it('should return empty array if user has no roles', async () => {
      const mockEq = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      mockCreateClient.mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const roles = await getUserRoles('user-999');
      expect(roles).toEqual([]);
    });
  });

  describe('assignRole', () => {
    it('should assign role to user', async () => {
      const mockUpsert = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'role-admin' },
            error: null,
          }),
        }),
      });

      const mockFrom = jest.fn()
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ upsert: mockUpsert });

      mockCreateClient.mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const success = await assignRole('user-123', 'clinic-456', 'admin');
      expect(success).toBe(true);
    });

    it('should return false if role does not exist', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Role not found' },
      });

      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      mockCreateClient.mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const success = await assignRole('user-123', 'clinic-456', 'invalid');
      expect(success).toBe(false);
    });
  });

  describe('removeRole', () => {
    it('should remove role from user', async () => {
      const mockThirdEq = jest.fn().mockResolvedValue({ error: null });
      const mockSecondEq = jest.fn().mockReturnValue({ eq: mockThirdEq });
      const mockFirstEq = jest.fn().mockReturnValue({ eq: mockSecondEq });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockFirstEq });

      const mockSingle = jest.fn().mockResolvedValue({
        data: { id: 'role-admin' },
        error: null,
      });
      const mockSelectEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockSelectEq });

      const mockFrom = jest.fn()
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ delete: mockDelete });

      mockCreateClient.mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const success = await removeRole('user-123', 'clinic-456', 'admin');
      expect(success).toBe(true);
    });

    it('should return false if role does not exist', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Role not found' },
      });

      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      mockCreateClient.mockReturnValue({
        from: mockFrom,
      } as unknown as SupabaseClient);

      const success = await removeRole('user-123', 'clinic-456', 'invalid');
      expect(success).toBe(false);
    });
  });
});
