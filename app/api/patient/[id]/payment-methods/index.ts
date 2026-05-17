import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  savePaymentMethod,
  listPaymentMethods,
} from '@/lib/stripe/setup-intent';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ConfirmSetupIntentSchema = z.object({
  stripe_payment_method_id: z.string(),
  brand: z.string(),
  last4: z.string(),
  exp_month: z.number(),
  exp_year: z.number(),
});

/**
 * POST /api/patient/{id}/payment-methods
 * Confirm SetupIntent and save payment method (005.002)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const clientSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    const { data: { user }, error: userError } = await clientSupabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // RLS: Cross-patient access check
    if (user.id !== params.id) {
      return NextResponse.json(
        { error: 'Acesso negado: você só pode visualizar seus próprios métodos' },
        { status: 403 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const payload = ConfirmSetupIntentSchema.parse(body);

    // Get clinic_id from patient record
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 }
      );
    }

    // Save payment method
    const method = await savePaymentMethod(
      user.id,
      patient.clinic_id,
      payload.stripe_payment_method_id,
      {
        brand: payload.brand,
        last4: payload.last4,
        exp_month: payload.exp_month,
        exp_year: payload.exp_year,
      }
    );

    // Create audit log
    await supabase.from('audit_logs').insert({
      clinic_id: patient.clinic_id,
      action: 'payment_method_saved',
      resource_type: 'payment_method',
      resource_id: method.id,
      metadata: { brand: payload.brand, last4: payload.last4 },
    });

    return NextResponse.json({ method }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validação falhou' },
        { status: 400 }
      );
    }
    console.error('Error saving payment method:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar método de pagamento' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/patient/{id}/payment-methods
 * List patient's payment methods (005.002)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const clientSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    const { data: { user }, error: userError } = await clientSupabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // RLS: Cross-patient access check
    if (user.id !== params.id) {
      return NextResponse.json(
        { error: 'Acesso negado: você só pode visualizar seus próprios métodos' },
        { status: 403 }
      );
    }

    const methods = await listPaymentMethods(user.id);
    return NextResponse.json({ methods });
  } catch (error) {
    console.error('Error listing payment methods:', error);
    return NextResponse.json(
      { error: 'Erro ao listar métodos de pagamento' },
      { status: 500 }
    );
  }
}
