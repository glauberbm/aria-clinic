import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { profileUpdateSchema } from '@/lib/validations/profile';
import { z } from 'zod';

const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

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

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header or cookies
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

    // Get current user from auth
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

    // Get user profile from public.users
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, avatar_url, clinic_id, active, created_at, updated_at')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update user's profile
export async function PATCH(request: NextRequest) {
  try {
    // Extract token from Authorization header or cookies
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

    // Get current user from auth
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

    const body = await request.json();

    // Validate input
    const validatedData = profileUpdateSchema.parse(body);

    // Prepare update data
    const updateData: Record<string, any> = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.avatar_url !== undefined) {
      updateData.avatar_url = validatedData.avatar_url || null;
    }

    // Update user profile
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('id, email, name, avatar_url, clinic_id, active, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user: data,
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

    console.error('PATCH /api/profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
