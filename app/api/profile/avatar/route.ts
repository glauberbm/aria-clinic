import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

// POST /api/profile/avatar - Upload avatar
export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG and PNG files are allowed' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const filename = `${user.id}-${Date.now()}.${ext}`;
    const filepath = `avatars/${user.id}/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filepath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      return NextResponse.json(
        { error: 'Failed to upload avatar' },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filepath);

    // Update user profile with avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating avatar URL:', updateError);
      // Still return success because file was uploaded
    }

    return NextResponse.json(
      {
        message: 'Avatar uploaded successfully',
        url: publicUrl,
        path: data.path,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/profile/avatar error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/profile/avatar - Delete avatar
export async function DELETE(request: NextRequest) {
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

    // List files in user's avatar folder
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list(`avatars/${user.id}`);

    if (listError) {
      console.error('Error listing avatar files:', listError);
      return NextResponse.json(
        { error: 'Failed to delete avatar' },
        { status: 500 }
      );
    }

    // Delete all existing avatars
    if (files && files.length > 0) {
      const filePaths = files.map((f) => `avatars/${user.id}/${f.name}`);
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove(filePaths);

      if (deleteError) {
        console.error('Error deleting avatar files:', deleteError);
      }
    }

    // Clear avatar URL from profile
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: null })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error clearing avatar URL:', updateError);
    }

    return NextResponse.json(
      { message: 'Avatar deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/profile/avatar error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
