import {
  getUserRole,
  hasRole,
  hasPermission,
  getUserRoles,
  assignRole,
  removeRole,
} from '@/lib/auth/permissions';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('Permission Functions', () => {
  let mockClient: Partial<SupabaseClient>;

  beforeEach(() => {
    mockClient = {
      from: jest.fn(),
    };
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
      (mockClient.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const role = await getUserRole(
        mockClient as SupabaseClient,
        'user-123',
        'clinic-456'
      );
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
      (mockClient.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const role = await getUserRole(
        mockClient as SupabaseClient,
        'user-999',
        'clinic-999'
      );
      expect(role).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (mockClient.from as jest.Mock).mockImplementation(() => {
        throw new Error('Connection error');
      });

      const role = await getUserRole(
        mockClient as SupabaseClient,
        'user-123',
        'clinic-456'
      );
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
      (mockClient.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const hasAdmin = await hasRole(
        mockClient as SupabaseClient,
        'user-123',
        'clinic-456',
        'admin'
      );
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
      (mockClient.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const hasAdmin = await hasRole(
        mockClient as SupabaseClient,
        'user-123',
        'clinic-456',
        'admin'
      );
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
      (mockClient.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const hasWrite = await hasPermission(
        mockClient as SupabaseClient,
        'user-123',
        'clinic-456',
        'write'
      );
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
      (mockClient.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const canDelete = await hasPermission(
        mockClient as SupabaseClient,
        'user-123',
        'clinic-456',
        'delete'
      );
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
      (mockClient.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const hasPerm = await hasPermission(
        mockClient as SupabaseClient,
        'user-999',
        'clinic-999',
        'read'
      );
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
      (mockClient.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const roles = await getUserRoles(
        mockClient as SupabaseClient,
        'user-123'
      );
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
      (mockClient.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const roles = await getUserRoles(
        mockClient as SupabaseClient,
        'user-999'
      );
      expect(roles).toEqual([]);
    });
  });

  describe('assignRole', () => {
    it('should assign role to user', async () => {
      const mockUpsert = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockRoleSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'role-admin' },
            error: null,
          }),
        }),
      });

      (mockClient.from as jest.Mock)
        .mockReturnValueOnce({ select: mockRoleSelect })
        .mockReturnValueOnce({ upsert: mockUpsert });

      const success = await assignRole(
        mockClient as SupabaseClient,
        'user-123',
        'clinic-456',
        'admin'
      );
      expect(success).toBe(true);
    });

    it('should return false if role does not exist', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Role not found' },
      });

      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (mockClient.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const success = await assignRole(
        mockClient as SupabaseClient,
        'user-123',
        'clinic-456',
        'invalid'
      );
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

      (mockClient.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ delete: mockDelete });

      const success = await removeRole(
        mockClient as SupabaseClient,
        'user-123',
        'clinic-456',
        'admin'
      );
      expect(success).toBe(true);
    });

    it('should return false if role does not exist', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Role not found' },
      });

      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (mockClient.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const success = await removeRole(
        mockClient as SupabaseClient,
        'user-123',
        'clinic-456',
        'invalid'
      );
      expect(success).toBe(false);
    });
  });
});
