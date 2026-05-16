import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';

/**
 * Integration tests for complete user registration flow
 * Tests the full pipeline: form submission → API → database sync
 */

// Mock Supabase for integration testing
const mockSupabase = {
  from: jest.fn(),
  auth: {
    admin: {
      createUser: jest.fn(),
    },
  },
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

// Mock rate limit to always allow in tests
jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ allowed: true }),
}));

describe('User Registration Flow - Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default successful mocks for integration tests
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    });

    mockSupabase.auth.admin.createUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id-123',
          email: 'newuser@example.com',
        },
      },
      error: null,
    });
  });

  describe('Full registration flow', () => {
    it('should complete full registration workflow with trigger success', async () => {
      // Arrange: Setup mocks for successful flow
      const userEmail = 'integration-test@example.com';
      const userName = 'Integration Test User';
      const userId = 'user-123-456';

      // First call: Check for duplicate email
      // Second call: Verify user was created (trigger success)
      let callCount = 0;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                // Duplicate check: no existing user
                return Promise.resolve({ data: null, error: null });
              }
              // Trigger verification: user exists (trigger worked)
              return Promise.resolve({
                data: { id: userId, email: userEmail, name: userName },
                error: null,
              });
            }),
          }),
        }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: {
          user: {
            id: userId,
            email: userEmail,
          },
        },
        error: null,
      });

      // Act: Submit registration request
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: userName,
          email: userEmail,
          password: 'SecurePass123!',
        }),
      });

      const response = await POST(request);

      // Assert: Verify successful registration
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.message).toContain('com sucesso');
      expect(json.user_id).toBe(userId);
      expect(json.email).toBe(userEmail);

      // Verify Supabase calls were made correctly
      expect(mockSupabase.auth.admin.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userEmail,
          password: 'SecurePass123!',
          user_metadata: {
            full_name: userName,
          },
        })
      );
    });

    it('should handle trigger failure and fallback to manual insert', async () => {
      // Arrange: Setup mocks for trigger failure scenario
      const userEmail = 'trigger-fail@example.com';
      const userId = 'user-456-789';

      let callCount = 0;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                return Promise.resolve({ data: null, error: null });
              }
              // Trigger failed - user not found
              return Promise.resolve({
                data: null,
                error: { message: 'No rows found' },
              });
            }),
          }),
        }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: {
          user: {
            id: userId,
            email: userEmail,
          },
        },
        error: null,
      });

      // Act: Submit registration
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'Fallback Test',
          email: userEmail,
          password: 'ValidPassword123!',
        }),
      });

      const response = await POST(request);

      // Assert: Should still succeed with fallback
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.message).toContain('com sucesso');

      // Verify insert was attempted
      expect(mockSupabase.from().insert).toHaveBeenCalled();
    });
  });

  describe('Error scenarios in registration flow', () => {
    it('should prevent duplicate registrations', async () => {
      // Arrange: User already exists
      const duplicateEmail = 'duplicate@example.com';
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'existing-user-id' },
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      // Act: Attempt to register with existing email
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'Test User',
          email: duplicateEmail,
          password: 'ValidPass123!',
        }),
      });

      const response = await POST(request);

      // Assert: Should be rejected (409 conflict or 400)
      expect([400, 409]).toContain(response.status);
      const json = await response.json();
      expect(json.error).toContain('registrado');
    });

    it('should handle Supabase authentication service errors', async () => {
      // Arrange: Auth service returns error
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: null,
        error: {
          message: 'User already registered',
          status: 400,
        },
      });

      // Act: Submit registration
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'Test User',
          email: 'auth-error@example.com',
          password: 'ValidPass123!',
        }),
      });

      const response = await POST(request);

      // Assert: Error from auth service should be returned
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toContain('usuário');
    });
  });

  describe('Data validation in registration flow', () => {
    it('should validate email format throughout flow', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'Test User',
          email: 'invalid.email.format',
          password: 'ValidPass123!',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toContain('validação');
    });

    it('should enforce password strength requirements', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'nouppercase123!', // Missing uppercase
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should validate password strength requirements', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'ValidPass123', // Missing special character
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});
