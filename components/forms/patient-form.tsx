'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, PatientInput } from '@/lib/validations/patient';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useSupabaseAuth } from '@/lib/supabase/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Save, X } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PatientFormProps {
  initialData?: PatientInput;
  patientId?: string;
  isEditing?: boolean;
}

export function PatientForm({ initialData, patientId, isEditing = false }: PatientFormProps) {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      dob: '',
      address: '',
      status: 'active',
    },
  });

  const formValues = watch();

  // Auto-save draft to localStorage
  const saveDraft = () => {
    const draft = {
      data: formValues,
      timestamp: Date.now(),
    };
    localStorage.setItem(`patient-draft-${patientId || 'new'}`, JSON.stringify(draft));
    setIsDraftSaved(true);
    setTimeout(() => setIsDraftSaved(false), 2000);
  };

  const onSubmit = async (data: PatientInput) => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get user's clinic
      const profileResponse = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${user.session?.access_token}`,
        },
      });

      if (!profileResponse.ok) throw new Error('Falha ao carregar perfil do usuário');

      const profile = await profileResponse.json();

      if (isEditing && patientId) {
        // Update existing patient
        const { error: updateError } = await supabase
          .from('patients')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', patientId)
          .eq('clinic_id', profile.clinic_id);

        if (updateError) throw updateError;

        // Log audit trail for patient update
        try {
          await supabase.from('audit_logs').insert({
            patient_id: patientId,
            action: 'UPDATE',
            user_id: user.id,
            description: `Paciente ${data.name} atualizado`,
            created_at: new Date().toISOString(),
          });
        } catch (auditError) {
          console.warn('Failed to log audit trail:', auditError);
          // Don't throw - audit logging failure shouldn't block patient update
        }

        // Clear draft after successful save
        localStorage.removeItem(`patient-draft-${patientId}`);

        router.push(`/pacientes/${patientId}`);
      } else {
        // Create new patient
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({
            ...data,
            clinic_id: profile.clinic_id,
            registered_date: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;

        // Log audit trail for patient creation
        try {
          await supabase.from('audit_logs').insert({
            patient_id: newPatient?.id,
            action: 'CREATE',
            user_id: user.id,
            description: `Novo paciente ${data.name} criado`,
            created_at: new Date().toISOString(),
          });
        } catch (auditError) {
          console.warn('Failed to log audit trail:', auditError);
          // Don't throw - audit logging failure shouldn't block patient creation
        }

        // Clear draft after successful save
        localStorage.removeItem('patient-draft-new');

        router.push('/pacientes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar paciente';
      setError(errorMessage);
      console.error('Save patient error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Card className="aria-card" style={{ borderColor: '#D32F2F' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} style={{ color: '#D32F2F' }} />
              <p className="font-body text-sm" style={{ color: '#D32F2F' }}>
                {error}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="aria-card">
        <CardHeader>
          <CardTitle className="font-body text-lg font-normal" style={{ color: 'var(--color-text)' }}>
            {isEditing ? 'Editar Paciente' : 'Novo Paciente'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block font-body text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Nome Completo *
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="Ex: João Silva"
                className="w-full px-4 py-2 border rounded-lg font-body text-sm"
                style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block font-body text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="Ex: joao@email.com"
                className="w-full px-4 py-2 border rounded-lg font-body text-sm"
                style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-body text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Telefone *
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="Ex: 11987654321"
                className="w-full px-4 py-2 border rounded-lg font-body text-sm"
                style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
              />
              {errors.phone && (
                <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block font-body text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Data de Nascimento *
              </label>
              <input
                {...register('dob')}
                type="date"
                className="w-full px-4 py-2 border rounded-lg font-body text-sm"
                style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
              />
              {errors.dob && (
                <p className="text-red-600 text-xs mt-1">{errors.dob.message}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block font-body text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Endereço
              </label>
              <textarea
                {...register('address')}
                placeholder="Ex: Rua Principal, 123, Apt 456"
                rows={3}
                className="w-full px-4 py-2 border rounded-lg font-body text-sm"
                style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
              />
              {errors.address && (
                <p className="text-red-600 text-xs mt-1">{errors.address.message}</p>
              )}
            </div>

            {/* Document Upload */}
            <div>
              <label className="block font-body text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Documentos do Paciente
              </label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    // File handling can be extended to upload to storage
                    console.log(`${files.length} arquivo(s) selecionado(s)`);
                  }
                }}
                className="w-full px-4 py-2 border rounded-lg font-body text-sm"
                style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
              />
              <p className="font-body text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB por arquivo)
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block font-body text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Status *
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-2 border rounded-lg font-body text-sm"
                style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
              >
                <option value="active">Ativa</option>
                <option value="inactive">Inativa</option>
                <option value="archived">Arquivada</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t" style={{ borderColor: 'var(--color-divider)' }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="font-body text-sm font-normal px-6 py-2 flex items-center gap-2"
                style={{ backgroundColor: 'var(--color-gold)', color: 'white' }}
              >
                <Save size={16} />
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>

              <Button
                type="button"
                onClick={saveDraft}
                disabled={isLoading || isDraftSaved}
                variant="outline"
                className="font-body text-sm font-normal px-6 py-2"
                style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
              >
                {isDraftSaved ? '✓ Rascunho Salvo' : 'Salvar Rascunho'}
              </Button>

              <Button
                type="button"
                onClick={() => router.back()}
                variant="ghost"
                className="font-body text-sm font-normal px-6 py-2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
