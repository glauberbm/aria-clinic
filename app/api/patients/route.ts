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
 * GET /api/patients
 * List all patients accessible to current user (RLS enforced)
 * Requires: Authorization header with valid JWT
 * Query params:
 *   - limit: number (default 50)
 *   - offset: number (default 0)
 *   - status: 'active' | 'inactive' | 'archived' (optional filter)
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') as 'active' | 'inactive' | 'archived' | null;

    // Build query with RLS (automatic through auth token)
    let query = supabase
      .from('patients')
      .select('id, name, email, phone, date_of_birth, sex, status, created_at', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: patients, count, error } = await query;

    if (error) {
      console.error('Error fetching patients:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar pacientes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      patients,
      pagination: {
        limit,
        offset,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/patients:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
