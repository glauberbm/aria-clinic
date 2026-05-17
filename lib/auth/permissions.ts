import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get the user's role for a specific clinic
 * NOTE: Pass a Supabase client with appropriate permissions (auth token or service role)
 */
export async function getUserRole(
  supabase: SupabaseClient,
  userId: string,
  clinicId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .single();

    if (error || !data) {
      console.error('Failed to get user role:', error?.message);
      return null;
    }

    const roleData = data as { roles: Array<{ name: string }> | null };
    const roles = Array.isArray(roleData.roles) ? roleData.roles : [];
    return roles[0]?.name ?? null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if a user has a specific role
 * NOTE: Pass a Supabase client with appropriate permissions
 */
export async function hasRole(
  supabase: SupabaseClient,
  userId: string,
  clinicId: string,
  roleName: string
): Promise<boolean> {
  const userRole = await getUserRole(supabase, userId, clinicId);
  return userRole === roleName;
}

/**
 * Check if a user has permission to perform an action
 * This checks the permissions array in the roles table
 * NOTE: Pass a Supabase client with appropriate permissions
 */
export async function hasPermission(
  supabase: SupabaseClient,
  userId: string,
  clinicId: string,
  permission: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('roles(permissions)')
      .eq('user_id', userId)
      .eq('clinic_id', clinicId)
      .single();

    if (error || !data) {
      console.error('Failed to check permission:', error?.message);
      return false;
    }

    const roleData = data as { roles: Array<{ permissions: string[] }> | null };
    const rolesArray = Array.isArray(roleData.roles) ? roleData.roles : [];
    const permissions = rolesArray[0]?.permissions ?? [];

    return Array.isArray(permissions) && permissions.includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Get all roles for a user across all clinics
 * NOTE: Pass a Supabase client with appropriate permissions
 */
export async function getUserRoles(
  supabase: SupabaseClient,
  userId: string
): Promise<Array<{ clinicId: string; role: string }>> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('clinic_id, roles(name)')
      .eq('user_id', userId);

    if (error || !data) {
      console.error('Failed to get user roles:', error?.message);
      return [];
    }

    return data
      .map((item) => {
        const itemData = item as { clinic_id: string; roles: Array<{ name: string }> | null };
        const rolesArray = Array.isArray(itemData.roles) ? itemData.roles : [];
        return {
          clinicId: itemData.clinic_id,
          role: rolesArray[0]?.name ?? 'unknown',
        };
      })
      .filter((item) => item.role !== 'unknown');
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}

/**
 * Assign a role to a user in a clinic
 * NOTE: Pass a Supabase client with service role (admin operations only)
 */
export async function assignRole(
  supabase: SupabaseClient,
  userId: string,
  clinicId: string,
  roleName: string
): Promise<boolean> {
  try {
    // Get role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError || !roleData) {
      console.error('Role not found:', roleName);
      return false;
    }

    const roleId = roleData.id as string;

    // Assign role to user
    const { error } = await supabase
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

    if (error) {
      console.error('Failed to assign role:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error assigning role:', error);
    return false;
  }
}

/**
 * Remove a role from a user in a clinic
 * NOTE: Pass a Supabase client with service role (admin operations only)
 */
export async function removeRole(
  supabase: SupabaseClient,
  userId: string,
  clinicId: string,
  roleName: string
): Promise<boolean> {
  try {
    // Get role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError || !roleData) {
      console.error('Role not found:', roleName);
      return false;
    }

    const roleId = roleData.id as string;

    // Remove role from user
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .eq('clinic_id', clinicId);

    if (error) {
      console.error('Failed to remove role:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing role:', error);
    return false;
  }
}
