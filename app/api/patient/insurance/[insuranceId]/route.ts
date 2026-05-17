import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { insuranceInfoSchema } from '@/lib/validations/patient';
import { z } from 'zod';

const getSupabaseClient = (token?: string) => {
  if (token) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

/**
 * PUT /api/patient/insurance/[insuranceId]
 * Update insurance information
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ insuranceId: string }> }
) {
  try {
    const { insuranceId } = await params;

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseClient(token);

    const body = await request.json();

    // Validate input
    const validatedData = insuranceInfoSchema.partial().parse(body);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // Get patient record
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('email', user.email)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Perfil de paciente não encontrado' },
        { status: 404 }
      );
    }

    // Update insurance record
    const { data: insurance, error: updateError } = await supabase
      .from('insurance_info')
      .update({
        ...(validatedData.providerName && { provider_name: validatedData.providerName }),
        ...(validatedData.policyNumber && { policy_number: validatedData.policyNumber }),
        ...(validatedData.groupNumber && { group_number: validatedData.groupNumber }),
        ...(validatedData.coverageStart && { coverage_start: validatedData.coverageStart }),
        ...(validatedData.coverageEnd && { coverage_end: validatedData.coverageEnd }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', insuranceId)
      .eq('patient_id', patient.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating insurance record:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar registro de seguro' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Informação de seguro atualizada com sucesso',
      insurance,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Erro de validação', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating insurance info:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
