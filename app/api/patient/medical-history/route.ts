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
 * GET /api/patient/medical-history
 * Retrieve current patient's medical history
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

    // Get medical history grouped by type
    const { data: history, error: historyError } = await supabase
      .from('medical_history')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('is_active', true)
      .order('date_recorded', { ascending: false });

    if (historyError) {
      return NextResponse.json(
        { error: 'Erro ao buscar histórico médico' },
        { status: 500 }
      );
    }

    // Group by type
    const grouped = {
      conditions: history?.filter(h => h.history_type === 'condition') || [],
      allergies: history?.filter(h => h.history_type === 'allergy') || [],
      medications: history?.filter(h => h.history_type === 'medication') || [],
    };

    return NextResponse.json({
      summary: grouped,
      total: history?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching medical history:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patient/medical-history
 * Create medical history entry for current patient
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
    const validatedData = medicalHistorySchema.parse(body);

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

    // Create medical history record
    const { data: medicalRecord, error: insertError } = await supabase
      .from('medical_history')
      .insert({
        patient_id: patient.id,
        history_type: validatedData.historyType,
        description: validatedData.description,
        severity: validatedData.severity || null,
        is_active: true,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error creating medical history record:', insertError);
      return NextResponse.json(
        { error: 'Erro ao criar registro de histórico médico' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Histórico médico adicionado com sucesso',
      record: medicalRecord,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Erro de validação', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating medical history:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/patient/medical-history/[historyId]
 * Update medical history entry
 */
export async function PUT(request: NextRequest, { params }: { params: { historyId: string } }) {
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
      .eq('id', params.historyId)
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
export async function DELETE(request: NextRequest, { params }: { params: { historyId: string } }) {
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

    // Soft delete (set is_active to false)
    const { error: deleteError } = await supabase
      .from('medical_history')
      .update({ is_active: false })
      .eq('id', params.historyId)
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
