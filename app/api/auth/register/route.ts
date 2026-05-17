import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/auth';
import { z } from 'zod';
import { generateVerificationToken } from '@/lib/auth/verification';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendVerificationEmail } from '@/lib/services/email';

const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 registration attempts per IP per hour
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const rateLimitResult = await checkRateLimit(clientIp, 'register', 5, 3600);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas de registro. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    const supabase = getSupabaseClient();

    // Check if email already registered in patients table
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('email', validatedData.email)
      .single();

    if (existingPatient) {
      return NextResponse.json(
        { error: 'Este email já está registrado.' },
        { status: 409 }
      );
    }

    // Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      user_metadata: {
        full_name: validatedData.full_name,
        phone_number: validatedData.phone_number,
        birth_date: validatedData.birth_date,
      },
      email_confirm: false, // Require email verification
    });

    if (authError) {
      return NextResponse.json(
        { error: `Erro ao criar usuário: ${authError.message}` },
        { status: 400 }
      );
    }

    // Generate 24-hour verification token
    const { token: verificationToken, expiresAt: tokenExpiresAt } = generateVerificationToken();

    // Create patient profile with verification token
    const { error: patientError } = await supabase
      .from('patients')
      .insert({
        user_id: authData.user.id,
        clinic_id: validatedData.clinic_id || '00000000-0000-0000-0000-000000000000',
        full_name: validatedData.full_name,
        email: validatedData.email,
        phone_number: validatedData.phone_number || null,
        birth_date: validatedData.birth_date || null,
        email_verified: false,
        verification_token: verificationToken,
        verification_token_expires_at: tokenExpiresAt,
      });

    if (patientError) {
      console.error('Erro ao criar perfil do paciente:', patientError);
      // Clean up: delete auth user if patient creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: 'Erro ao criar perfil do paciente.' },
        { status: 500 }
      );
    }

    // Send verification email
    try {
      await sendVerificationEmail({
        email: validatedData.email,
        verificationToken,
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Log the error but don't fail the registration
      // The email can be resent later if needed
    }

    return NextResponse.json(
      {
        message: 'Registrado com sucesso! Verifique seu email para confirmar sua conta.',
        user_id: authData.user.id,
        email: validatedData.email,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Erro de validação',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}