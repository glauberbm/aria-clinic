import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { hasRole } from '@/lib/auth/permissions';

interface UserRole {
  roles?: {
    id?: string;
    name?: string;
    permissions?: string[];
  } | {
    id?: string;
    name?: string;
    permissions?: string[];
  }[];
}

interface UserData {
  id: string;
  email: string;
  name: string;
  clinic_id: string;
  active: boolean;
  created_at: string;
  user_roles: UserRole[];
}

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

// GET /api/admin/users - List all users in the clinic
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

    // Get query parameters for pagination and search
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        clinic_id,
        active,
        created_at,
        user_roles(
          roles(id, name, permissions)
        )
      `)
      .eq('clinic_id', clinicId);

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply pagination
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Transform response
    const users = data?.map((user: UserData) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      clinic_id: user.clinic_id,
      active: user.active,
      created_at: user.created_at,
      roles: Array.isArray(user.user_roles) ? user.user_roles.map((ur: UserRole) => {
        const roleData = Array.isArray(ur.roles) ? ur.roles[0] : ur.roles;
        return {
          id: roleData?.id,
          name: roleData?.name,
          permissions: roleData?.permissions,
        };
      }) : [],
    })) || [];

    return NextResponse.json(
      {
        data: users,
        total: count || 0,
        page,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
