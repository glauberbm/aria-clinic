import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { medicalHistorySchema } from '@/lib/validations/patient';
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
 * PUT /api/patient/medical-history/[historyId]
 * Update medical history entry
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ historyId: string }> }
) {
  try {
    const { historyId } = await params;

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

    // Validate input (partial update)
    const validatedData = medicalHistorySchema.partial().parse(body);

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

    // Update medical history record
    const updatePayload: Record<string, string | null | undefined> = {};
    if (validatedData.historyType) updatePayload.history_type = validatedData.historyType;
    if (validatedData.description) updatePayload.description = validatedData.description;
    if (validatedData.severity !== undefined) updatePayload.severity = validatedData.severity;

    const { data: medicalRecord, error: updateError } = await supabase
      .from('medical_history')
      .update(updatePayload)
      .eq('id', historyId)
      .eq('patient_id', patient.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating medical history record:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar registro de histórico médico' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Histórico médico atualizado com sucesso',
      record: medicalRecord,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Erro de validação', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating medical history:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/patient/medical-history/[historyId]
 * Soft delete medical history entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ historyId: string }> }
) {
  try {
    const { historyId } = await params;

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

    // Soft delete (set is_active to false)
    const { error: deleteError } = await supabase
      .from('medical_history')
      .update({ is_active: false })
      .eq('id', historyId)
      .eq('patient_id', patient.id);

    if (deleteError) {
      console.error('Error deleting medical history record:', deleteError);
      return NextResponse.json(
        { error: 'Erro ao deletar registro de histórico médico' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Histórico médico removido com sucesso',
    });
  } catch (error) {
    console.error('Error deleting medical history:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
