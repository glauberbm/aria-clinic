import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Mock rate limit
jest.mock('@/lib/middleware/rate-limit', () => ({
  rateLimit: jest.fn().mockResolvedValue({ allowed: true }),
}));

// Mock auth utilities
jest.mock('@/lib/auth/verification', () => ({
  generateVerificationToken: jest.fn(() => ({
    token: 'test-token-123',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })),
}));

// Mock email service
jest.mock('@/lib/services/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: jest.fn().mockResolvedValue({ error: null }),
    }),
    auth: {
      admin: {
        createUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
            },
          },
          error: null,
        }),
      },
    },
  })),
}));

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for invalid email', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: 'Test User',
        email: 'invalid-email',
        password: 'ValidPass123!',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for duplicate email', async () => {
    const createClient = jest.mocked(createSupabaseClient);
    createClient.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'existing-id' },
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      }),
      auth: {
        admin: {
          createUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id', email: 'test@example.com' } },
            error: null,
          }),
        },
      },
    } as unknown as ReturnType<typeof createSupabaseClient>);

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: 'Test User',
        email: 'existing@example.com',
        password: 'ValidPass123!',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toContain('já está registrado');
  });

  it('should return 400 for Supabase auth error', async () => {
    const createClient = jest.mocked(createSupabaseClient);
    createClient.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: jest.fn().mockResolvedValue({ error: null }),
      }),
      auth: {
        admin: {
          createUser: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Invalid password' },
          }),
        },
      },
    } as unknown as ReturnType<typeof createSupabaseClient>);

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass123!',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain('Erro ao criar usuário');
  });

  it('should return 201 for successful registration', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass123!',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const json = await response.json();
    expect(json).toHaveProperty('user_id');
    expect(json.email).toBe('test@example.com');
  });

  it('should handle missing full_name field', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'ValidPass123!',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should handle weak password (no special character)', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPass123',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should handle empty full_name', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: '',
        email: 'test@example.com',
        password: 'ValidPass123!',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
