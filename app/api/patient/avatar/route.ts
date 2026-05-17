import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Get file from request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'Nenhum arquivo fornecido' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: 'Tipo de arquivo não permitido' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: 'Arquivo muito grande (máximo 5MB)' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${user.id}-${uuidv4()}.${ext}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('patient-avatars')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { message: 'Erro ao fazer upload do arquivo' },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from('patient-avatars')
      .getPublicUrl(filename);

    // Update patient profile with new avatar URL
    const { error: updateError } = await supabase
      .from('patient_profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { message: 'Erro ao atualizar perfil' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Avatar enviado com sucesso',
        url: publicUrl,
        filename: data.path,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
