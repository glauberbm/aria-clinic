import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  email: z.string().email('Email inválido'),
});

const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = verifySchema.parse(body);

    const supabase = getSupabaseClient();

    // Find patient by email and verification token
    const { data: patient, error: findError } = await supabase
      .from('patients')
      .select('id, user_id, email_verified, verification_token_expires_at')
      .eq('email', validatedData.email)
      .eq('verification_token', validatedData.token)
      .single();

    if (findError || !patient) {
      return NextResponse.json(
        { error: 'Token de verificação inválido ou expirado.' },
        { status: 400 }
      );
    }

    // Check if token has expired
    const expiresAt = new Date(patient.verification_token_expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token de verificação expirou. Solicite um novo.' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (patient.email_verified) {
      return NextResponse.json(
        { message: 'Email já foi verificado anteriormente.' },
        { status: 200 }
      );
    }

    // Mark email as verified and clear verification token
    const { error: updateError } = await supabase
      .from('patients')
      .update({
        email_verified: true,
        verification_token: null,
        verification_token_expires_at: null,
      })
      .eq('id', patient.id);

    if (updateError) {
      console.error('Erro ao verificar email:', updateError);
      return NextResponse.json(
        { error: 'Erro ao verificar email.' },
        { status: 500 }
      );
    }

    // Confirm email in auth.users
    await supabase.auth.admin.updateUserById(patient.user_id, {
      email_confirm: true,
    });

    return NextResponse.json(
      {
        message: 'Email verificado com sucesso! Você pode fazer login agora.',
        email: validatedData.email,
      },
      { status: 200 }
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

    console.error('Erro na verificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
