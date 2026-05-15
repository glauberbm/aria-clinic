'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@supabase/supabase-js';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Edit2, Archive, Printer, Lock, AlertCircle, Calendar, Pill, MessageSquare, Loader } from 'lucide-react';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  status: 'active' | 'inactive' | 'archived';
  registeredDate: string;
  address: string;
  lastAppointment: string;
}

interface MedicalRecord {
  id: string;
  procedure: string;
  date: string;
  type: string;
  professional: string;
  notes: string;
}

interface Medication {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  prescribed: string;
  is_allergy?: boolean;
}

interface Allergy {
  id: string;
  medication_name: string;
  notes?: string;
}

interface Communication {
  id: string;
  message: string;
  type: string;
  created_at: string;
  status: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  created_at: string;
  ip_address?: string;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'active':
      return { bg: '#C8E6C9', text: '#2E7D32', label: 'Ativa' };
    case 'inactive':
      return { bg: '#FFF3E0', text: '#E65100', label: 'Inativa' };
    case 'archived':
      return { bg: '#ECEFF1', text: '#455A64', label: 'Arquivada' };
    default:
      return { bg: '#E8D5B0', text: '#8B6914', label: 'Status' };
  }
};

const calculateAge = (dob: string): number => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Fetch patient and related data from Supabase
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!user?.id || !params.id) return;

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

        // Fetch patient
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', params.id)
          .eq('clinic_id', profile.clinic_id)
          .single();

        if (patientError) throw patientError;
        setPatient(patientData);

        // Fetch related data in parallel
        const [
          { data: historyData },
          { data: medsData },
          { data: allergiesData },
          { data: commsData },
          { data: auditData }
        ] = await Promise.all([
          supabase
            .from('patient_medical_history')
            .select('*')
            .eq('patient_id', params.id)
            .order('date', { ascending: false }),
          supabase
            .from('patient_medications')
            .select('*')
            .eq('patient_id', params.id)
            .order('prescribed', { ascending: false }),
          supabase
            .from('patient_medications')
            .select('*')
            .eq('patient_id', params.id)
            .eq('is_allergy', true),
          supabase
            .from('patient_communications')
            .select('*')
            .eq('patient_id', params.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('patient_audit_logs')
            .select('*')
            .eq('patient_id', params.id)
            .order('created_at', { ascending: false })
        ]);

        setMedicalHistory(historyData || []);
        setMedications(medsData?.filter((m: Medication) => !m.is_allergy) || []);
        setAllergies(allergiesData || []);
        setCommunications(commsData || []);
        setAuditLog(auditData || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do paciente';
        setError(errorMessage);
        console.error('Fetch patient data error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [user?.id, user?.session?.access_token, params.id]);

  // Auth guard: redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user?.id) {
      router.push('/login');
    }
  }, [user?.id, isLoading, router]);

  const handleEdit = () => {
    router.push(`/pacientes/${params.id}/editar`);
  };

  const handleArchive = async () => {
    if (!patient) return;

    setIsArchiving(true);
    try {
      const { error: updateError } = await supabase
        .from('patients')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', patient.id);

      if (updateError) throw updateError;

      setPatient({ ...patient, status: 'archived' });
      setShowArchiveDialog(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao arquivar paciente';
      setError(errorMessage);
      console.error('Archive patient error:', err);
    } finally {
      setIsArchiving(false);
    }
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-16">
          <Loader size={24} className="animate-spin" style={{ color: 'var(--color-gold)' }} />
        </div>
      </Shell>
    );
  }

  if (error || !patient) {
    return (
      <Shell>
        <Card className="aria-card" style={{ borderColor: '#D32F2F' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} style={{ color: '#D32F2F' }} />
              <p className="font-body text-sm" style={{ color: '#D32F2F' }}>
                {error || 'Paciente não encontrado'}
              </p>
            </div>
          </CardContent>
        </Card>
      </Shell>
    );
  }

  const statusStyle = getStatusStyle(patient.status);

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between print:hidden">
        <div>
          <h1 className="font-display text-4xl font-normal mb-2" style={{ color: 'var(--color-text)', letterSpacing: '0.1em' }}>
            {patient.name}
          </h1>
          <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
            ID: {params.id} • Registrado em {new Date(patient.registeredDate).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleEdit}
            className="font-body text-sm font-normal px-4 py-2 flex items-center gap-2"
            style={{ backgroundColor: 'var(--color-gold)', color: 'white' }}
          >
            <Edit2 size={16} />
            Editar
          </Button>
          <Button
            onClick={() => setShowArchiveDialog(true)}
            variant="outline"
            className="font-body text-sm font-normal px-4 py-2"
            style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
            disabled={isArchiving}
          >
            <Archive size={16} className="mr-2" />
            Arquivar
          </Button>
          <Button
            variant="ghost"
            className="font-body text-sm font-normal px-4 py-2"
            style={{ color: 'var(--color-text-muted)' }}
            onClick={() => window.print()}
          >
            <Printer size={16} />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="aria-card">
          <CardContent className="pt-6">
            <p className="font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Status</p>
            <Badge style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
              {statusStyle.label}
            </Badge>
          </CardContent>
        </Card>

        <Card className="aria-card">
          <CardContent className="pt-6">
            <p className="font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Última Consulta</p>
            <p className="font-display text-lg" style={{ color: 'var(--color-gold)' }}>
              {new Date(patient.lastAppointment).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card className="aria-card">
          <CardContent className="pt-6">
            <p className="font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Procedimentos</p>
            <p className="font-display text-lg" style={{ color: 'var(--color-text)' }}>
              {medicalHistory.length}
            </p>
          </CardContent>
        </Card>

        <Card className="aria-card">
          <CardContent className="pt-6">
            <p className="font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Alergias</p>
            <p className="font-display text-lg" style={{ color: allergies.length > 0 ? '#D32F2F' : 'var(--color-text)' }}>
              {allergies.length > 0 ? `${allergies.length} registrada(s)` : 'Nenhuma'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Information */}
      <Card className="aria-card mb-8">
        <CardHeader>
          <CardTitle className="font-body text-lg font-normal" style={{ color: 'var(--color-text)' }}>
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-body text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Email</p>
              <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{patient.email}</p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Telefone</p>
              <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{patient.phone}</p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Data de Nascimento</p>
              <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>
                {new Date(patient.dob).toLocaleDateString('pt-BR')} ({calculateAge(patient.dob)} anos)
              </p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Endereço</p>
              <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{patient.address || 'Não informado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allergies Alert */}
      {allergies.length > 0 && (
        <Card className="aria-card mb-8" style={{ borderLeft: '4px solid #D32F2F' }}>
          <CardHeader>
            <CardTitle className="font-body text-lg font-normal flex items-center gap-2" style={{ color: '#D32F2F' }}>
              <AlertCircle size={20} />
              Alergias Registradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allergies.map((allergy: Allergy) => (
                <div key={allergy.id} className="flex items-start justify-between pb-3 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                  <div>
                    <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{allergy.medication_name}</p>
                    <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>{allergy.notes || 'Sem observações'}</p>
                  </div>
                  <Badge style={{ backgroundColor: '#FFCDD2', color: '#D32F2F' }}>
                    Alergia
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medications */}
      <Card className="aria-card mb-8">
        <CardHeader>
          <CardTitle className="font-body text-lg font-normal flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Pill size={20} />
            Medicações e Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {medications.length > 0 ? (
              medications.map((med: Medication) => (
                <div key={med.id} className="flex items-start justify-between pb-3 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                  <div>
                    <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{med.medication_name}</p>
                    <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {med.dosage} • {med.frequency}
                    </p>
                  </div>
                  <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Desde {new Date(med.prescribed).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))
            ) : (
              <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhuma medicação registrada</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card className="aria-card mb-8">
        <CardHeader>
          <CardTitle className="font-body text-lg font-normal flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Calendar size={20} />
            Histórico Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medicalHistory.length > 0 ? (
              medicalHistory.map((entry: MedicalRecord) => (
                <div key={entry.id} className="pb-4 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-body text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {entry.procedure}
                      </p>
                      <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(entry.date).toLocaleDateString('pt-BR')} • {entry.professional}
                      </p>
                    </div>
                    <Badge style={{ backgroundColor: 'var(--color-gold)', color: 'white' }}>
                      {entry.type}
                    </Badge>
                  </div>
                  <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>
                    {entry.notes}
                  </p>
                </div>
              ))
            ) : (
              <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhum procedimento registrado</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Communication History */}
      <Card className="aria-card mb-8">
        <CardHeader>
          <CardTitle className="font-body text-lg font-normal flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <MessageSquare size={20} />
            Histórico de Comunicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {communications.length > 0 ? (
              communications.map((comm: Communication) => (
                <div key={comm.id} className="flex items-start justify-between pb-3 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{comm.message}</p>
                      <Badge style={{ backgroundColor: '#E8D5B0', color: '#8B6914' }}>
                        {comm.type}
                      </Badge>
                    </div>
                    <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(comm.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge style={{ backgroundColor: '#C8E6C9', color: '#2E7D32' }}>
                    {comm.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhuma comunicação registrada</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log (Admin Only) */}
      <Card className="aria-card print:hidden">
        <CardHeader>
          <button
            onClick={() => setShowAuditLog(!showAuditLog)}
            className="w-full flex items-center justify-between hover:opacity-70"
          >
            <CardTitle className="font-body text-lg font-normal flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Lock size={20} />
              Log de Auditoria (Somente Admin)
            </CardTitle>
            <span style={{ color: 'var(--color-text-muted)' }}>
              {showAuditLog ? '▼' : '▶'}
            </span>
          </button>
        </CardHeader>
        {showAuditLog && (
          <CardContent>
            <div className="space-y-3">
              {auditLog.length > 0 ? (
                auditLog.map((log: AuditLog) => (
                  <div key={log.id} className="flex items-start justify-between pb-3 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                    <div className="flex-1">
                      <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{log.action}</p>
                      <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Por {log.user} • {new Date(log.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {log.ip_address}
                    </p>
                  </div>
                ))
              ) : (
                <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>Nenhum registro de auditoria</p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar Paciente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja arquivar o paciente <strong>{patient?.name}</strong>? Esta ação não pode ser desfeita facilmente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowArchiveDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleArchive}
              disabled={isArchiving}
              style={{ backgroundColor: '#D32F2F', color: 'white' }}
            >
              {isArchiving ? 'Arquivando...' : 'Arquivar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
