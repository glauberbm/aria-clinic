import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validations/auth';
import { z } from 'zod';

const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// Simple in-memory rate limiting (in production, use Redis)
const failedAttempts = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  const attempt = failedAttempts.get(ip);

  if (!attempt) {
    return { allowed: true, remaining: 5 };
  }

  if (now > attempt.resetTime) {
    failedAttempts.delete(ip);
    return { allowed: true, remaining: 5 };
  }

  const remaining = Math.max(0, 5 - attempt.count);
  return {
    allowed: remaining > 0,
    remaining,
  };
};

const recordFailedAttempt = (ip: string) => {
  const attempt = failedAttempts.get(ip);
  const now = Date.now();

  if (!attempt) {
    failedAttempts.set(ip, {
      count: 1,
      resetTime: now + 15 * 60 * 1000, // 15 minutes
    });
  } else {
    attempt.count++;
  }
};

const clearFailedAttempts = (ip: string) => {
  failedAttempts.delete(ip);
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Get client IP for rate limiting
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
          remaining: 0,
        },
        { status: 429 }
      );
    }

    const supabase = getSupabaseClient();

    // Attempt authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (authError) {
      recordFailedAttempt(ip);

      // Provide specific error messages
      const isUserNotFound =
        authError.message.includes('Invalid login credentials') ||
        authError.message.includes('not found');

      return NextResponse.json(
        {
          error: isUserNotFound
            ? 'Usuário não encontrado'
            : 'Senha incorreta',
          remaining: Math.max(0, 5 - (failedAttempts.get(ip)?.count || 0)),
        },
        { status: 401 }
      );
    }

    if (!authData.session) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: 'Falha ao criar sessão' },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(ip);

    // Create response with token in httpOnly cookie
    const response = NextResponse.json(
      {
        message: 'Login realizado com sucesso',
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
      { status: 200 }
    );

    // Set httpOnly, secure cookie with JWT token
    response.cookies.set({
      name: 'auth-token',
      value: authData.session.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: authData.session.expires_in,
      path: '/',
    });

    // Also set refresh token in separate httpOnly cookie
    if (authData.session.refresh_token) {
      response.cookies.set({
        name: 'refresh-token',
        value: authData.session.refresh_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
