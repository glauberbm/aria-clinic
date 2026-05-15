'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@supabase/supabase-js';
import { PatientInput } from '@/lib/validations/patient';
import { Shell } from '@/components/layout/Shell';
import { PatientForm } from '@/components/forms/patient-form';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditarPatientePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useSupabaseAuth();
  const patientId = params.id as string;

  const [patientData, setPatientData] = useState<PatientInput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!user?.id || !patientId) return;

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

        const { data, error: supabaseError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .eq('clinic_id', profile.clinic_id)
          .single();

        if (supabaseError) throw supabaseError;
        setPatientData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar paciente';
        setError(errorMessage);
        console.error('Fetch patient error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [user?.id, user?.session?.access_token, patientId]);

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 text-sm font-body hover:opacity-70"
          style={{ color: 'var(--color-gold)' }}
        >
          <ChevronLeft size={18} />
          Voltar
        </button>
        <h1 className="font-display text-4xl font-normal" style={{ color: 'var(--color-text)', letterSpacing: '0.1em' }}>
          Editar Paciente
        </h1>
        <p className="font-body text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Atualize as informações do paciente
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="aria-card mb-8" style={{ borderColor: '#D32F2F' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} style={{ color: '#D32F2F' }} />
              <div>
                <p className="font-body text-sm font-medium" style={{ color: '#D32F2F' }}>
                  Erro ao carregar paciente
                </p>
                <p className="font-body text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Card className="aria-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : patientData ? (
        <PatientForm
          initialData={patientData}
          patientId={patientId}
          isEditing={true}
        />
      ) : null}
    </Shell>
  );
}
