import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

const checkRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  clinicId: z.string().uuid('Invalid clinic ID'),
  roleName: z.string().min(1, 'Role name is required'),
});

/**
 * POST /api/auth/check-role
 * Check if a user has a specific role in a clinic
 * Server-side only - uses service role key
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, clinicId, roleName } = checkRoleSchema.parse(body);

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { hasRole: false, role: null },
        { status: 200 }
      );
    }

    const roleData = data as { roles: Array<{ name: string }> | null };
    const roles = Array.isArray(roleData.roles) ? roleData.roles : [];
    const userRole = roles[0]?.name ?? null;
    const hasRole = userRole === roleName;

    return NextResponse.json(
      { hasRole, role: userRole },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('POST /api/auth/check-role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
