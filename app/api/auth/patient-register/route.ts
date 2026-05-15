import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { patientRegistrationSchema } from '@/lib/validations/patient';
import { z } from 'zod';

const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = patientRegistrationSchema.parse(body);

    const supabase = getSupabaseClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    // Check if CPF already exists (if provided)
    if (validatedData.cpf) {
      const { data: existingCpf } = await supabase
        .from('patients')
        .select('id')
        .eq('cpf', validatedData.cpf.replace(/\D/g, ''))
        .eq('clinic_id', validatedData.clinicId)
        .single();

      if (existingCpf) {
        return NextResponse.json(
          { error: 'CPF já cadastrado nesta clínica' },
          { status: 400 }
        );
      }
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      user_metadata: {
        name: validatedData.name,
      },
      email_confirm: false, // Require email verification
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create patient record
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .insert({
        clinic_id: validatedData.clinicId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        date_of_birth: validatedData.dateOfBirth,
        sex: validatedData.sex || null,
        status: 'ATIVA',
        consent_terms: true, // Should be set by user acceptance
        consent_data_processing: true,
      })
      .select('id')
      .single();

    if (patientError) {
      console.error('Error creating patient record:', patientError);
      // Cleanup: delete auth user if patient creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Erro ao criar registro de paciente' },
        { status: 500 }
      );
    }

    // Create patient profile
    const { error: profileError } = await supabase
      .from('patient_profiles')
      .insert({
        patient_id: patientData.id,
      });

    if (profileError) {
      console.error('Error creating patient profile:', profileError);
      // Cleanup: delete auth user and patient if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Erro ao criar perfil do paciente' },
        { status: 500 }
      );
    }

    // Assign patient role to user
    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'patient')
      .eq('clinic_id', validatedData.clinicId)
      .single();

    if (roleData) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          clinic_id: validatedData.clinicId,
          role_id: roleData.id,
        });

      if (roleError) {
        console.error('Error assigning patient role:', roleError);
        // Don't fail registration if role assignment fails, but log it
      }
    }

    // Send verification email
    const { error: emailError } = await supabase.auth.resendOtp({
      email: validatedData.email,
      type: 'email_change',
    });

    if (emailError) {
      console.error('Error sending verification email:', emailError);
      // Don't fail registration if email send fails
    }

    return NextResponse.json(
      {
        message: 'Paciente registrado com sucesso. Verifique seu email para ativar a conta.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        patient: {
          id: patientData.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Erro de validação', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Patient registration error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
