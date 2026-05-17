import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPaymentIntent } from '@/lib/stripe/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PT-BR error messages
const ERROR_MESSAGES: Record<string, string> = {
  card_declined: 'Seu cartão foi recusado. Verifique os dados e tente novamente.',
  processing_error: 'Erro ao processar o pagamento. Tente novamente em alguns instantes.',
  rate_limit_error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  expired_card: 'Seu cartão expirou. Use outro cartão.',
  incorrect_cvc: 'Código de segurança incorreto. Verifique os dados.',
  payment_intent_failed: 'Falha ao criar intenção de pagamento. Contate o suporte.',
  invalid_amount: 'Valor do pagamento inválido.',
  appointment_not_found: 'Consulta não encontrada.',
};

const CreatePaymentSchema = z.object({
  appointment_id: z.string().uuid(),
  amount_cents: z.number().positive(),
  currency: z.string().default('BRL'),
});

/**
 * POST /api/payments/process
 * Create a Stripe PaymentIntent for appointment payment
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const payload = CreatePaymentSchema.parse(body);

    const { appointment_id, amount_cents, currency } = payload;

    // Get appointment with clinic info
    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .select('id, clinic_id, patient_id, appointment_date')
      .eq('id', appointment_id)
      .single();

    if (apptError || !appointment) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.appointment_not_found },
        { status: 404 }
      );
    }

    // Check if already paid
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('appointment_id', appointment_id)
      .eq('status', 'succeeded')
      .single();

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Consulta já foi paga' },
        { status: 409 }
      );
    }

    // Generate idempotency key
    const idempotencyKey = `${appointment_id}-${Date.now()}`;

    // Create Stripe PaymentIntent
    const paymentIntent = await createPaymentIntent(
      amount_cents,
      currency,
      {
        appointment_id,
        clinic_id: appointment.clinic_id,
        patient_id: appointment.patient_id,
      },
      idempotencyKey
    );

    // Save payment record to database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        clinic_id: appointment.clinic_id,
        appointment_id,
        patient_id: appointment.patient_id,
        stripe_payment_intent_id: paymentIntent.id,
        amount_cents,
        currency,
        status: 'pending',
        client_secret: paymentIntent.client_secret,
        requires_action: paymentIntent.status === 'requires_action',
        idempotency_key: idempotencyKey,
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error saving payment:', paymentError);
      return NextResponse.json(
        { error: ERROR_MESSAGES.payment_intent_failed },
        { status: 500 }
      );
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      clinic_id: appointment.clinic_id,
      action: 'payment_intent_created',
      resource_type: 'payment',
      resource_id: payment.id,
      metadata: { stripe_payment_intent_id: paymentIntent.id },
    });

    return NextResponse.json({
      payment: {
        id: payment.id,
        stripe_payment_intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount_cents,
        currency,
        status: paymentIntent.status,
        requires_action: paymentIntent.status === 'requires_action',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validação falhou', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/payments/process:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
