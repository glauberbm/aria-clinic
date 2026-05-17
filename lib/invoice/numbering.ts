import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Generate unique invoice number in YYYY-MM-00001 format
 * Uses PostgreSQL sequence to prevent race conditions
 */
export async function generateInvoiceNumber(clinicId: string): Promise<string> {
  const { data, error } = await supabase.rpc('generate_invoice_number', {
    clinic_id: clinicId,
  });

  if (error) {
    console.error('Error generating invoice number:', error);
    throw error;
  }

  return data as string;
}

/**
 * Validate invoice number format
 */
export function validateInvoiceNumberFormat(invoiceNumber: string): boolean {
  const pattern = /^\d{4}-\d{2}-\d{5}$/;
  return pattern.test(invoiceNumber);
}

/**
 * Parse invoice number to get month
 */
export function parseInvoiceNumber(
  invoiceNumber: string
): { year: number; month: number } | null {
  const pattern = /^(\d{4})-(\d{2})-\d{5}$/;
  const match = invoiceNumber.match(pattern);

  if (!match) {
    return null;
  }

  return {
    year: parseInt(match[1]),
    month: parseInt(match[2]),
  };
}
