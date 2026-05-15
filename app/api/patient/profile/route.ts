import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { patientProfileSchema } from '@/lib/validations/patient';
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
 * GET /api/patient/profile
 * Retrieve current patient's profile
 * Requires: Authorization header with valid JWT
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
      .select('id, name, email, phone, date_of_birth, sex, status')
      .eq('email', user.email)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Perfil de paciente não encontrado' },
        { status: 404 }
      );
    }

    // Get patient profile
    const { data: profile, error: profileError } = await supabase
      .from('patient_profiles')
      .select('id, blood_type, height_cm, weight_kg, avatar_url, created_at, updated_at')
      .eq('patient_id', patient.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Erro ao buscar perfil' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      patient,
      profile,
    });
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/patient/profile
 * Update current patient's profile
 * Requires: Authorization header with valid JWT
 */
export async function PUT(request: NextRequest) {
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
    const validatedData = patientProfileSchema.parse(body);

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

    // Update patient profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('patient_profiles')
      .update({
        blood_type: validatedData.bloodType || null,
        height_cm: validatedData.heightCm || null,
        weight_kg: validatedData.weightKg || null,
        updated_at: new Date().toISOString(),
      })
      .eq('patient_id', patient.id)
      .select('id, blood_type, height_cm, weight_kg, avatar_url, updated_at')
      .single();

    if (updateError) {
      console.error('Error updating patient profile:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar perfil' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      profile: updatedProfile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Erro de validação', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating patient profile:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
