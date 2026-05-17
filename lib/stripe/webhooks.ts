import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
export { verifyWebhookSignature } from './client';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Handle payment_intent.succeeded webhook event
 */
export async function handlePaymentIntentSucceeded(
  event: Stripe.PaymentIntentSucceededEvent
) {
  const paymentIntent = event.data.object;

  // Find payment by Stripe ID
  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('id, appointment_id, clinic_id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (fetchError || !payment) {
    console.error('Payment not found:', paymentIntent.id);
    return;
  }

  // Update payment status
  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id);

  if (updateError) {
    console.error('Error updating payment:', updateError);
    throw updateError;
  }

  // Update appointment status to paid
  const { error: apptError } = await supabase
    .from('appointments')
    .update({
      payment_status: 'paid',
      payment_id: payment.id,
    })
    .eq('id', payment.appointment_id);

  if (apptError) {
    console.error('Error updating appointment:', apptError);
    throw apptError;
  }

  // Create audit log
  await supabase.from('audit_logs').insert({
    clinic_id: payment.clinic_id,
    action: 'payment_succeeded',
    resource_type: 'payment',
    resource_id: payment.id,
    metadata: { stripe_payment_intent_id: paymentIntent.id },
  });
}

/**
 * Handle payment_intent.payment_failed webhook event
 */
export async function handlePaymentIntentFailed(
  event: Stripe.PaymentIntentPaymentFailedEvent
) {
  const paymentIntent = event.data.object;

  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('id, clinic_id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (fetchError || !payment) {
    console.error('Payment not found:', paymentIntent.id);
    return;
  }

  const lastError = paymentIntent.last_payment_error;
  const errorCode = lastError?.code || 'unknown_error';

  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'failed',
      error_code: errorCode,
      error_message: lastError?.message,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id);

  if (updateError) {
    console.error('Error updating failed payment:', updateError);
    throw updateError;
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    clinic_id: payment.clinic_id,
    action: 'payment_failed',
    resource_type: 'payment',
    resource_id: payment.id,
    metadata: { error_code: errorCode },
  });
}

/**
 * Handle charge.refunded webhook event
 */
export async function handleChargeRefunded(
  event: Stripe.ChargeRefundedEvent
) {
  const charge = event.data.object;
  const paymentIntentId = charge.payment_intent as string;

  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('id, clinic_id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (fetchError || !payment) {
    console.error('Payment not found:', paymentIntentId);
    return;
  }

  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'refunded',
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id);

  if (updateError) {
    console.error('Error updating refunded payment:', updateError);
    throw updateError;
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    clinic_id: payment.clinic_id,
    action: 'payment_refunded',
    resource_type: 'payment',
    resource_id: payment.id,
    metadata: { refund_amount: charge.amount_refunded },
  });
}
