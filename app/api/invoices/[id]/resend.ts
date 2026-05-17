import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/invoices/{id}/resend
 * Manually retry sending invoice email (005.003)
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

    // Get invoice with RLS
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, patient_id, email_failed_count')
      .eq('id', params.id)
      .eq('patient_id', user.id)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Nota fiscal não encontrada' },
        { status: 404 }
      );
    }

    // Check max retries
    if ((invoice.email_failed_count || 0) >= 3) {
      return NextResponse.json(
        {
          error:
            'Máximo de tentativas atingido. Contate o suporte para assistência.',
        },
        { status: 400 }
      );
    }

    // Queue for resend (would trigger a webhook or queue)
    // For now, just update status to pending
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ email_status: 'pending' })
      .eq('id', invoice.id);

    if (updateError) {
      console.error('Error queuing resend:', updateError);
      return NextResponse.json(
        { error: 'Erro ao reenviar nota' },
        { status: 500 }
      );
    }

    // Create audit log
    const { data: invData } = await supabase
      .from('invoices')
      .select('clinic_id')
      .eq('id', invoice.id)
      .single();

    await supabase.from('audit_logs').insert({
      clinic_id: invData?.clinic_id,
      action: 'invoice_resend_requested',
      resource_type: 'invoice',
      resource_id: invoice.id,
    });

    return NextResponse.json({ success: true, message: 'Nota será reenviada em breve' });
  } catch (error) {
    console.error('Error requesting invoice resend:', error);
    return NextResponse.json(
      { error: 'Erro ao reenviar nota fiscal' },
      { status: 500 }
    );
  }
}
