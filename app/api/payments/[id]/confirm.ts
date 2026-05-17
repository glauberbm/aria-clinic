import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { confirmPaymentIntent } from '@/lib/stripe/client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ConfirmPaymentSchema = z.object({
  payment_method_id: z.string(),
});

/**
 * POST /api/payments/{id}/confirm
 * Confirm PaymentIntent for 3D Secure authentication
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

    // Get payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, stripe_payment_intent_id, clinic_id, appointment_id')
      .eq('id', params.id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { payment_method_id } = ConfirmPaymentSchema.parse(body);

    // Confirm payment intent with payment method
    const confirmedIntent = await confirmPaymentIntent(
      payment.stripe_payment_intent_id,
      payment_method_id
    );

    // Update payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: confirmedIntent.status === 'succeeded' ? 'succeeded' : 'processing',
        requires_action: confirmedIntent.status === 'requires_action',
        client_secret: confirmedIntent.client_secret,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return NextResponse.json(
        { error: 'Erro ao confirmar pagamento' },
        { status: 500 }
      );
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      clinic_id: payment.clinic_id,
      action: 'payment_intent_confirmed',
      resource_type: 'payment',
      resource_id: payment.id,
      metadata: { status: confirmedIntent.status },
    });

    return NextResponse.json({
      payment: {
        id: payment.id,
        status: confirmedIntent.status,
        requires_action: confirmedIntent.status === 'requires_action',
        client_secret: confirmedIntent.client_secret,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validação falhou' },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/payments/[id]/confirm:', error);
    return NextResponse.json(
      { error: 'Erro ao confirmar pagamento' },
      { status: 500 }
    );
  }
}
