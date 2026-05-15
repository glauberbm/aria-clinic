'use client';

import { useRouter } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { PatientForm } from '@/components/forms/patient-form';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NovoPatientePage() {
  const router = useRouter();

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
          Novo Paciente
        </h1>
        <p className="font-body text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Registre um novo paciente no sistema
        </p>
      </div>

      {/* Form */}
      <PatientForm />
    </Shell>
  );
}
