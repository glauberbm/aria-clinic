import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { hasRole } from '@/lib/auth/permissions';
import { z } from 'zod';

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

const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

const assignRoleSchema = z.object({
  roleName: z.string().min(1, 'Role name is required'),
});

// PUT /api/admin/users/{userId}/roles - Assign a role to a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

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
    const supabaseAdmin = getSupabaseClient();

    // Get current user
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user's clinic
    const { data: currentUserData, error: userError } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', currentUser.id)
      .single();

    if (userError || !currentUserData) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    const clinicId = currentUserData.clinic_id;

    // Check if current user is admin
    const isAdmin = await hasRole(supabaseAdmin, currentUser.id, clinicId, 'admin');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const { roleName } = assignRoleSchema.parse(body);

    // Get target user's clinic to ensure they belong to same clinic
    const { data: targetUserData, error: targetUserError } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .single();

    if (targetUserError || !targetUserData) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }

    if (targetUserData.clinic_id !== clinicId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot modify users from other clinics' },
        { status: 403 }
      );
    }

    // Get role ID
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    const roleId = roleData.id as string;

    // Assign role to user
    const { error: assignError } = await supabaseAdmin
      .from('user_roles')
      .upsert(
        {
          user_id: userId,
          role_id: roleId,
          clinic_id: clinicId,
        },
        {
          onConflict: 'user_id,role_id,clinic_id',
        }
      );

    if (assignError) {
      console.error('Failed to assign role:', assignError.message);
      return NextResponse.json(
        { error: 'Failed to assign role' },
        { status: 500 }
      );
    }

    // Log to audit_log
    const { error: auditError } = await supabaseAdmin
      .from('audit_log')
      .insert({
        actor_id: currentUser.id,
        action: 'role_assigned',
        target_user_id: userId,
        target_role_id: roleId,
        clinic_id: clinicId,
      });

    if (auditError) {
      console.error('Failed to log audit entry:', auditError.message);
      // Don't fail the request, but log it
    }

    return NextResponse.json(
      {
        message: `Role "${roleName}" assigned successfully`,
        userId,
        roleName,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('PUT /api/admin/users/[userId]/roles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/{userId}/roles/{roleId} - Remove a role from a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const roleId = request.nextUrl.searchParams.get('roleId');

    if (!roleId) {
      return NextResponse.json(
        { error: 'roleId query parameter is required' },
        { status: 400 }
      );
    }

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
    const supabaseAdmin = getSupabaseClient();

    // Get current user
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user's clinic
    const { data: currentUserData, error: userError } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', currentUser.id)
      .single();

    if (userError || !currentUserData) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    const clinicId = currentUserData.clinic_id;

    // Check if current user is admin
    const isAdmin = await hasRole(supabaseAdmin, currentUser.id, clinicId, 'admin');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Get target user's clinic
    const { data: targetUserData, error: targetUserError } = await supabase
      .from('users')
      .select('clinic_id')
      .eq('id', userId)
      .single();

    if (targetUserError || !targetUserData) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }

    if (targetUserData.clinic_id !== clinicId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot modify users from other clinics' },
        { status: 403 }
      );
    }

    // Get role details to check if it's admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('name')
      .eq('id', roleId)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    const roleName = roleData.name;

    // Safeguard: Check if removing admin role and only one admin exists
    if (roleName === 'admin') {
      const { data: adminCount, error: countError } = await supabaseAdmin
        .from('user_roles')
        .select('id', { count: 'exact' })
        .eq('clinic_id', clinicId)
        .eq('role_id', roleId);

      if (!countError && adminCount && adminCount.length === 1) {
        return NextResponse.json(
          { error: 'Cannot remove the only admin from clinic' },
          { status: 400 }
        );
      }
    }

    // Remove role from user
    const { error: deleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .eq('clinic_id', clinicId);

    if (deleteError) {
      console.error('Failed to remove role:', deleteError.message);
      return NextResponse.json(
        { error: 'Failed to remove role' },
        { status: 500 }
      );
    }

    // Log to audit_log
    const { error: auditError } = await supabaseAdmin
      .from('audit_log')
      .insert({
        actor_id: currentUser.id,
        action: 'role_removed',
        target_user_id: userId,
        target_role_id: roleId,
        clinic_id: clinicId,
      });

    if (auditError) {
      console.error('Failed to log audit entry:', auditError.message);
      // Don't fail the request, but log it
    }

    return NextResponse.json(
      {
        message: `Role removed successfully`,
        userId,
        roleId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/admin/users/[userId]/roles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
