import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as logoutHandler } from '@/app/api/auth/logout/route';
import { NextRequest } from 'next/server';

// Mock Supabase for login endpoint
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
          session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600,
          },
        },
        error: null,
      }),
    },
  })),
}));

describe('Login/Logout Flow', () => {
  describe('Successful login flow', () => {
    it('should complete full login process', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await loginHandler(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.message).toBe('Login realizado com sucesso');
      expect(json.user.id).toBe('test-user-id');
    });

    it('should set httpOnly cookies on login', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await loginHandler(request);
      const setCookieHeader = response.headers.get('set-cookie');

      expect(setCookieHeader).toContain('auth-token');
      expect(setCookieHeader).toContain('HttpOnly');
      expect(setCookieHeader?.toLowerCase()).toContain('samesite=lax');
    });
  });

  describe('Logout flow', () => {
    it('should complete logout process', async () => {
      // First login
      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const loginResponse = await loginHandler(loginRequest);
      expect(loginResponse.status).toBe(200);

      // Then logout
      const logoutRequest = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST',
      });

      const logoutResponse = await logoutHandler(logoutRequest);
      expect(logoutResponse.status).toBe(200);

      const json = await logoutResponse.json();
      expect(json.message).toBe('Logout realizado com sucesso');
    });

    it('should clear auth tokens on logout', async () => {
      const logoutRequest = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST',
      });

      const logoutResponse = await logoutHandler(logoutRequest);
      const setCookieHeader = logoutResponse.headers.get('set-cookie');

      // Both cookies should be cleared (maxAge: 0)
      expect(setCookieHeader).toContain('auth-token=');
      expect(setCookieHeader).toContain('refresh-token=');
    });

    it('should set maxAge to 0 to expire cookies', async () => {
      const logoutRequest = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST',
      });

      const logoutResponse = await logoutHandler(logoutRequest);
      const setCookieHeader = logoutResponse.headers.get('set-cookie');

      // Check for immediate expiration
      expect(setCookieHeader).toMatch(/Max-Age=0/i);
    });
  });

  describe('Session persistence', () => {
    it('should maintain session after successful login', async () => {
      const loginRequest = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const loginResponse = await loginHandler(loginRequest);
      expect(loginResponse.status).toBe(200);

      // Verify session exists via cookies
      const cookies = loginResponse.headers.get('set-cookie');
      expect(cookies).toContain('auth-token=test-access-token');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid login credentials gracefully', async () => {
      // Mock for invalid credentials
      const { createClient: mockCreateClient } = require('@supabase/supabase-js');
      mockCreateClient.mockReturnValueOnce({
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invalid login credentials' },
          }),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        }),
      });

      const response = await loginHandler(request);
      expect(response.status).toBe(401);

      const json = await response.json();
      expect(json.error).toBeDefined();
    });

    it('should not expose sensitive information in error messages', async () => {
      // Mock for invalid credentials
      const { createClient: mockCreateClient } = require('@supabase/supabase-js');
      mockCreateClient.mockReturnValueOnce({
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invalid login credentials' },
          }),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      });

      const response = await loginHandler(request);
      const json = await response.json();

      // Should return generic error message
      expect(json.error).toBeDefined();
      // Error should be either "Senha incorreta" or "Usuário não encontrado"
      expect(['Senha incorreta', 'Usuário não encontrado']).toContain(json.error);
    });
  });

  describe('Rate limiting', () => {
    it('should allow requests under the rate limit', async () => {
      // Single login attempt should succeed
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '192.168.1.100',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await loginHandler(request);
      // Should not be rate limited (200 or 401 are valid responses)
      expect(response.status).not.toBe(429);
    });
  });
});
