import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '@/lib/stripe/webhooks';
import {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleChargeRefunded,
} from '@/lib/stripe/webhooks';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Verify signature
    const event = verifyWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (!event) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Check for duplicate event (idempotency)
    const { data: existingEvent, error: checkError } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingEvent) {
      // Event already processed
      return NextResponse.json({ received: true });
    }

    // Store webhook event
    const { data: storedEvent, error: storeError } = await supabase
      .from('webhook_events')
      .insert({
        clinic_id: null, // Will be updated after processing
        event_type: event.type,
        stripe_event_id: event.id,
        data: event.data,
        processed: false,
      })
      .select()
      .single();

    if (storeError || !storedEvent) {
      console.error('Error storing webhook event:', storeError);
      return NextResponse.json(
        { error: 'Failed to store event' },
        { status: 500 }
      );
    }

    // Process event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(
            event as Stripe.PaymentIntentSucceededEvent
          );
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(
            event as Stripe.PaymentIntentPaymentFailedEvent
          );
          break;

        case 'charge.refunded':
          await handleChargeRefunded(event as Stripe.ChargeRefundedEvent);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Mark event as processed
      await supabase
        .from('webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('id', storedEvent.id);

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);

      // Increment retry count
      await supabase
        .from('webhook_events')
        .update({
          retry_count: (storedEvent.retry_count || 0) + 1,
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', storedEvent.id);

      // Return 200 to prevent Stripe from retrying (we handle retries manually)
      return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error('Error in POST /api/webhooks/stripe:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
