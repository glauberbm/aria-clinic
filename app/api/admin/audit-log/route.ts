import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { hasRole } from '@/lib/auth/permissions';

const getSupabaseClientWithAuth = (token: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
};

// GET /api/admin/audit-log - Get audit log for the clinic
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const accessToken = token || cookieToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClientWithAuth(accessToken);
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user's clinic
    const { data: currentUserData, error: userError } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', user.id)
      .single();

    if (userError || !currentUserData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const clinicId = currentUserData.clinic_id;

    // Check if user is admin
    const isAdmin = await hasRole(supabaseAdmin, user.id, clinicId, 'admin');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('audit_log')
      .select(`
        id,
        actor_id,
        action,
        target_user_id,
        target_role_id,
        clinic_id,
        created_at,
        actor:actor_id(id, email, name),
        target_user:target_user_id(id, email, name),
        role:target_role_id(id, name)
      `)
      .eq('clinic_id', clinicId);

    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Apply pagination
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit log:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit log' },
        { status: 500 }
      );
    }

    // Transform response
    const logs = data?.map((log) => ({
      id: log.id,
      actor: log.actor,
      action: log.action,
      targetUser: log.target_user,
      role: log.role,
      createdAt: log.created_at,
    })) || [];

    return NextResponse.json(
      {
        data: logs,
        total: count || 0,
        page,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/admin/audit-log error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
