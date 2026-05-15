import {
  getUserRole,
  hasRole,
  hasPermission,
  getUserRoles,
  assignRole,
  removeRole,
} from '@/lib/auth/permissions';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn(),
  })),
}));

describe('Permission Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserRole', () => {
    it('should return user role for clinic', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn()
              .mockReturnValueOnce({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { roles: { name: 'doctor' } },
                    error: null,
                  }),
                }),
              }),
          }),
        }),
      } as ReturnType<typeof createSupabaseClient>);

      const role = await getUserRole('user-123', 'clinic-456');
      expect(role).toBe('doctor');
    });

    it('should return null if user has no role', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn()
              .mockReturnValueOnce({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Not found' },
                  }),
                }),
              }),
          }),
        }),
      } as ReturnType<typeof createSupabaseClient>);

      const role = await getUserRole('user-999', 'clinic-999');
      expect(role).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockImplementation(() => {
        throw new Error('Connection error');
      });

      const role = await getUserRole('user-123', 'clinic-456');
      expect(role).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('should return true if user has role', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn()
              .mockReturnValueOnce({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { roles: { name: 'admin' } },
                    error: null,
                  }),
                }),
              }),
          }),
        }),
      } as ReturnType<typeof createSupabaseClient>);

      const hasAdmin = await hasRole('user-123', 'clinic-456', 'admin');
      expect(hasAdmin).toBe(true);
    });

    it('should return false if user does not have role', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn()
              .mockReturnValueOnce({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { roles: { name: 'patient' } },
                    error: null,
                  }),
                }),
              }),
          }),
        }),
      } as ReturnType<typeof createSupabaseClient>);

      const hasAdmin = await hasRole('user-123', 'clinic-456', 'admin');
      expect(hasAdmin).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn()
              .mockReturnValueOnce({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: {
                      roles: {
                        permissions: ['read', 'write', 'manage_patients'],
                      },
                    },
                    error: null,
                  }),
                }),
              }),
          }),
        }),
      } as ReturnType<typeof createSupabaseClient>);

      const hasWrite = await hasPermission('user-123', 'clinic-456', 'write');
      expect(hasWrite).toBe(true);
    });

    it('should return false if user does not have permission', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn()
              .mockReturnValueOnce({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: {
                      roles: {
                        permissions: ['read_own_data'],
                      },
                    },
                    error: null,
                  }),
                }),
              }),
          }),
        }),
      } as ReturnType<typeof createSupabaseClient>);

      const canDelete = await hasPermission('user-123', 'clinic-456', 'delete');
      expect(canDelete).toBe(false);
    });

    it('should handle missing permissions gracefully', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn()
              .mockReturnValueOnce({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: { roles: null },
                    error: null,
                  }),
                }),
              }),
          }),
        }),
      } as ReturnType<typeof createSupabaseClient>);

      const hasPerm = await hasPermission('user-999', 'clinic-999', 'read');
      expect(hasPerm).toBe(false);
    });
  });

  describe('getUserRoles', () => {
    it('should return all roles for user across clinics', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [
                { clinic_id: 'clinic-1', roles: { name: 'admin' } },
                { clinic_id: 'clinic-2', roles: { name: 'doctor' } },
              ],
              error: null,
            }),
          }),
        }),
      } as ReturnType<typeof createSupabaseClient>);

      const roles = await getUserRoles('user-123');
      expect(roles).toHaveLength(2);
      expect(roles[0]).toEqual({ clinicId: 'clinic-1', role: 'admin' });
      expect(roles[1]).toEqual({ clinicId: 'clinic-2', role: 'doctor' });
    });

    it('should return empty array if user has no roles', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      } as ReturnType<typeof createSupabaseClient>);

      const roles = await getUserRoles('user-999');
      expect(roles).toEqual([]);
    });
  });

  describe('assignRole', () => {
    it('should assign role to user', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockReturnValue({
        from: jest.fn()
          .mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
              eq: jest.fn()
                .mockReturnValueOnce({
                  single: jest.fn().mockResolvedValue({
                    data: { id: 'role-admin' },
                    error: null,
                  }),
                }),
            }),
          })
          .mockReturnValueOnce({
            upsert: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
      } as ReturnType<typeof createSupabaseClient>);

      const success = await assignRole('user-123', 'clinic-456', 'admin');
      expect(success).toBe(true);
    });

    it('should return false if role does not exist', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Role not found' },
            }),
          }),
        }),
      } as ReturnType<typeof createSupabaseClient>);

      const success = await assignRole('user-123', 'clinic-456', 'invalid');
      expect(success).toBe(false);
    });
  });

  describe('removeRole', () => {
    it('should remove role from user', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockReturnValue({
        from: jest.fn()
          .mockReturnValueOnce({
            select: jest.fn().mockReturnValue({
              eq: jest.fn()
                .mockReturnValueOnce({
                  single: jest.fn().mockResolvedValue({
                    data: { id: 'role-admin' },
                    error: null,
                  }),
                }),
            }),
          })
          .mockReturnValueOnce({
            delete: jest.fn().mockReturnValue({
              eq: jest.fn()
                .mockReturnValueOnce({
                  eq: jest.fn()
                    .mockReturnValueOnce({
                      eq: jest.fn().mockResolvedValue({
                        error: null,
                      }),
                    }),
                }),
            }),
          }),
      } as ReturnType<typeof createSupabaseClient>);

      const success = await removeRole('user-123', 'clinic-456', 'admin');
      expect(success).toBe(true);
    });

    it('should return false if role does not exist', async () => {
      const mockCreateClient = jest.mocked(createSupabaseClient);
      mockCreateClient.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Role not found' },
            }),
          }),
        }),
      } as ReturnType<typeof createSupabaseClient>);

      const success = await removeRole('user-123', 'clinic-456', 'invalid');
      expect(success).toBe(false);
    });
  });
});
