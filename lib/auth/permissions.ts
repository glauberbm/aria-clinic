import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

/**
 * Get the user's role for a specific clinic
 */
export async function getUserRole(userId: string, clinicId: string): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();

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

    const roleData = data as { roles: { name: string }[] | null };
    const roles = Array.isArray(roleData.roles) ? roleData.roles : [];
    return roles[0]?.name ?? null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if a user has a specific role
 */
export async function hasRole(userId: string, clinicId: string, roleName: string): Promise<boolean> {
  const userRole = await getUserRole(userId, clinicId);
  return userRole === roleName;
}

/**
 * Check if a user has permission to perform an action
 * This checks the permissions array in the roles table
 */
export async function hasPermission(
  userId: string,
  clinicId: string,
  permission: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

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

    const roleData = data as { roles: { permissions: string[] }[] | null };
    const roles = Array.isArray(roleData.roles) ? roleData.roles : [];
    const permissions = roles[0]?.permissions ?? [];

    return Array.isArray(permissions) && permissions.includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Get all roles for a user across all clinics
 */
export async function getUserRoles(userId: string): Promise<Array<{ clinicId: string; role: string }>> {
  try {
    const supabase = getSupabaseClient();

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
        const itemData = item as { clinic_id: string; roles: { name: string }[] | null };
        const roles = Array.isArray(itemData.roles) ? itemData.roles : [];
        return {
          clinicId: itemData.clinic_id,
          role: roles[0]?.name ?? 'unknown',
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
 * Only callable by admins or service role
 */
export async function assignRole(userId: string, clinicId: string, roleName: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

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
 * Only callable by admins or service role
 */
export async function removeRole(userId: string, clinicId: string, roleName: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();

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
