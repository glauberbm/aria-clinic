import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deletePaymentMethod } from '@/lib/stripe/setup-intent';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * DELETE /api/patient/{id}/payment-methods/{method_id}
 * Delete (soft-delete) payment method (005.002)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; method_id: string } }
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
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Verify payment method belongs to this patient
    const { data: method, error: methodError } = await supabase
      .from('payment_methods')
      .select('id, clinic_id')
      .eq('id', params.method_id)
      .eq('patient_id', user.id)
      .single();

    if (methodError || !method) {
      return NextResponse.json(
        { error: 'Método de pagamento não encontrado' },
        { status: 404 }
      );
    }

    // Soft-delete
    await deletePaymentMethod(params.method_id, user.id);

    // Create audit log
    await supabase.from('audit_logs').insert({
      clinic_id: method.clinic_id,
      action: 'payment_method_deleted',
      resource_type: 'payment_method',
      resource_id: method.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Erro ao remover método de pagamento' },
      { status: 500 }
    );
  }
}
