import { stripe } from './client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Create a Stripe SetupIntent for payment method tokenization
 */
export async function createSetupIntent(
  customerId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
) {
  return stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
    metadata,
  });
}

/**
 * Get SetupIntent details
 */
export async function getSetupIntent(setupIntentId: string) {
  return stripe.setupIntents.retrieve(setupIntentId);
}

/**
 * Save payment method to database
 */
export async function savePaymentMethod(
  patientId: string,
  clinicId: string,
  stripePaymentMethodId: string,
  metadata: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  }
) {
  const { data: method, error } = await supabase
    .from('payment_methods')
    .insert({
      patient_id: patientId,
      clinic_id: clinicId,
      stripe_payment_method_id: stripePaymentMethodId,
      brand: metadata.brand,
      last4: metadata.last4,
      exp_month: metadata.exp_month,
      exp_year: metadata.exp_year,
      is_default: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving payment method:', error);
    throw error;
  }

  return method;
}

/**
 * List patient's payment methods
 */
export async function listPaymentMethods(patientId: string) {
  const { data: methods, error } = await supabase
    .from('payment_methods')
    .select('id, brand, last4, exp_month, exp_year, is_default, created_at')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing payment methods:', error);
    throw error;
  }

  return methods || [];
}

/**
 * Delete (soft-delete) payment method
 */
export async function deletePaymentMethod(methodId: string, patientId: string) {
  const { error } = await supabase
    .from('payment_methods')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', methodId)
    .eq('patient_id', patientId);

  if (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(
  methodId: string,
  patientId: string
) {
  // First, unset all other defaults for this patient
  await supabase
    .from('payment_methods')
    .update({ is_default: false })
    .eq('patient_id', patientId)
    .is('deleted_at', null);

  // Set the new default
  const { data: method, error } = await supabase
    .from('payment_methods')
    .update({ is_default: true })
    .eq('id', methodId)
    .eq('patient_id', patientId)
    .select()
    .single();

  if (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }

  return method;
}
