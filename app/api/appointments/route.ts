import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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
 * POST /api/appointments
 * Book an appointment
 * Body: { patient_id, provider_id, appointment_date, duration_minutes, reason }
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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { patient_id, provider_id, appointment_date, duration_minutes = 30, reason } = body;

    // Validation
    if (!patient_id || !provider_id || !appointment_date) {
      return NextResponse.json(
        { error: 'patient_id, provider_id, appointment_date são obrigatórios' },
        { status: 400 }
      );
    }

    // Check for conflicts
    const apptStart = new Date(appointment_date);
    const apptEnd = new Date(apptStart.getTime() + duration_minutes * 60 * 1000);

    const { data: conflicts, error: conflictError } = await supabase
      .from('appointments')
      .select('id')
      .eq('provider_id', provider_id)
      .eq('status', 'scheduled')
      .gte('appointment_date', apptStart.toISOString())
      .lt('appointment_date', apptEnd.toISOString());

    if (conflictError) {
      console.error('Error checking conflicts:', conflictError);
      return NextResponse.json(
        { error: 'Erro ao verificar disponibilidade' },
        { status: 500 }
      );
    }

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Horário indisponível' },
        { status: 409 }
      );
    }

    // Create appointment
    const { data: appointment, error: createError } = await supabase
      .from('appointments')
      .insert({
        patient_id,
        provider_id,
        appointment_date,
        duration_minutes,
        reason,
        status: 'scheduled',
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating appointment:', createError);
      return NextResponse.json(
        { error: 'Erro ao agendar consulta' },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/appointments:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
