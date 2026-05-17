import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

/**
 * Create a Stripe PaymentIntent
 */
export async function createPaymentIntent(
  amountCents: number,
  currency: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>,
  idempotencyKey: string
) {
  return stripe.paymentIntents.create(
    {
      amount: amountCents,
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    },
    {
      idempotencyKey,
    }
  );
}

/**
 * Confirm a PaymentIntent (for 3D Secure)
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
) {
  return stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  });
}

/**
 * Get a PaymentIntent
 */
export async function getPaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  endpointSecret: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}
