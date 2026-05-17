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
 * GET /api/patient/insurance
 * Retrieve current patient's insurance information
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseClient(token);

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

    // Get insurance info
    const { data: insurance, error: insuranceError } = await supabase
      .from('insurance_info')
      .select('*')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false });

    if (insuranceError) {
      return NextResponse.json(
        { error: 'Erro ao buscar informações de seguros' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      insurance,
    });
  } catch (error) {
    console.error('Error fetching insurance info:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patient/insurance
 * Create insurance information for current patient
 */
export async function POST(request: NextRequest) {
  try {
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
    const validatedData = insuranceInfoSchema.parse(body);

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

    // Create insurance record
    const { data: insurance, error: insertError } = await supabase
      .from('insurance_info')
      .insert({
        patient_id: patient.id,
        provider_name: validatedData.providerName,
        policy_number: validatedData.policyNumber,
        group_number: validatedData.groupNumber || null,
        coverage_start: validatedData.coverageStart || null,
        coverage_end: validatedData.coverageEnd || null,
        is_active: true,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error creating insurance record:', insertError);
      return NextResponse.json(
        { error: 'Erro ao criar registro de seguro' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Informação de seguro adicionada com sucesso',
      insurance,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Erro de validação', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating insurance info:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
