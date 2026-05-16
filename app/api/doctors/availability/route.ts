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
 * GET /api/doctors/availability
 * Get available time slots for doctors
 * Query params:
 *   - date: ISO date string (YYYY-MM-DD) - required
 *   - provider_id: UUID (optional, single provider)
 *   - duration_minutes: number (default 30)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const providerId = searchParams.get('provider_id');
    const durationMinutes = parseInt(searchParams.get('duration_minutes') || '30');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'date parameter required in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get all doctors/providers or specific one
    let providersQuery = supabase.from('users').select('id, name, email, role');

    if (providerId) {
      providersQuery = providersQuery.eq('id', providerId);
    }

    const { data: providers, error: providersError } = await providersQuery;

    if (providersError) {
      console.error('Error fetching providers:', providersError);
      return NextResponse.json(
        { error: 'Erro ao buscar médicos' },
        { status: 500 }
      );
    }

    // Get appointments for the date
    const dateStart = `${date}T00:00:00Z`;
    const dateEnd = `${date}T23:59:59Z`;

    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select('provider_id, appointment_date, duration_minutes')
      .gte('appointment_date', dateStart)
      .lte('appointment_date', dateEnd)
      .eq('status', 'scheduled');

    if (apptError) {
      console.error('Error fetching appointments:', apptError);
      return NextResponse.json(
        { error: 'Erro ao buscar agendamentos' },
        { status: 500 }
      );
    }

    // Generate time slots (9 AM to 6 PM, 30-min intervals)
    const slots: Array<{
      date: string;
      time: string;
      timeMs: number;
      provider: { id: string; name: string; email: string };
      available: boolean;
      durationMinutes: number;
    }> = [];
    const slotStart = 9 * 60; // 9 AM in minutes
    const slotEnd = 18 * 60; // 6 PM in minutes

    for (let minutes = slotStart; minutes < slotEnd; minutes += durationMinutes) {
      const hour = Math.floor(minutes / 60);
      const min = minutes % 60;
      const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

      const slotTime = new Date(`${date}T${timeStr}:00Z`);
      const slotEndTime = new Date(slotTime.getTime() + durationMinutes * 60 * 1000);

      providers?.forEach(provider => {
        // Check if provider has conflicting appointment
        const hasConflict = appointments?.some(apt => {
          if (apt.provider_id !== provider.id) return false;

          const aptStart = new Date(apt.appointment_date);
          const aptEnd = new Date(aptStart.getTime() + (apt.duration_minutes || 30) * 60 * 1000);

          // Check overlap
          return slotTime < aptEnd && slotEndTime > aptStart;
        });

        if (!hasConflict) {
          slots.push({
            date,
            time: timeStr,
            timeMs: slotTime.getTime(),
            provider: {
              id: provider.id,
              name: provider.name,
              email: provider.email,
            },
            available: true,
            durationMinutes,
          });
        }
      });
    }

    // Sort by time
    slots.sort((a, b) => a.timeMs - b.timeMs);

    return NextResponse.json({
      date,
      durationMinutes,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      slots: slots.map(({ timeMs, ...rest }) => rest),
      total: slots.length,
    });
  } catch (error) {
    console.error('Error in GET /api/doctors/availability:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
