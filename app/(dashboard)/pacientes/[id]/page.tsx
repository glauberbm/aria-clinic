'use client';

import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Archive, Printer, Lock, AlertCircle, Calendar, Pill, MessageSquare } from 'lucide-react';

// Mock patient data
const mockPatient = {
  id: 1,
  name: 'Alessandra Costa',
  email: 'alessandra@example.com',
  phone: '(85) 98888-1111',
  dob: '1985-03-15',
  status: 'active',
  registeredDate: '2026-01-10',
  address: 'Rua das Flores, 123, Fortaleza - CE',
  lastAppointment: '2026-05-14',
};

// Medical history
const mockMedicalHistory = [
  { date: '2026-05-14', type: 'Consulta', procedure: 'Aplicação de Botox', professional: 'Dra. Sabryna', notes: 'Procedimento realizado com sucesso' },
  { date: '2026-04-20', type: 'Consulta', procedure: 'Harmonização Facial', professional: 'Dr. Felipe', notes: 'Preenchimento com ácido hialurônico' },
  { date: '2026-03-15', type: 'Consulta', procedure: 'Peeling Químico', professional: 'Dra. Sabryna', notes: 'Tratamento de manchas' },
  { date: '2026-02-10', type: 'Avaliação', procedure: 'Consulta Inicial', professional: 'Dr. Felipe', notes: 'Avaliação para tratamento estético' },
];

// Medications
const mockMedications = [
  { name: 'Ácido Retinoico', dosage: '0.025%', frequency: 'Noturno', prescribed: '2026-04-01' },
  { name: 'Vitamina C Sérum', dosage: '20%', frequency: 'Diurno', prescribed: '2026-04-01' },
  { name: 'Protetor Solar', dosage: 'SPF 50+', frequency: 'Diário', prescribed: '2026-01-10' },
];

// Allergies
const mockAllergies = [
  { allergen: 'Benzoína', severity: 'Moderada', reaction: 'Irritação local' },
];

// Communication history
const mockCommunications = [
  { date: '2026-05-15', type: 'WhatsApp', message: 'Lembrete: Cuidados pós-procedimento', status: 'Entregue' },
  { date: '2026-05-10', type: 'SMS', message: 'Confirmação de agendamento', status: 'Entregue' },
  { date: '2026-04-20', type: 'Email', message: 'Resultado do procedimento', status: 'Lido' },
];

// Audit log
const mockAuditLog = [
  { timestamp: '2026-05-14 14:30', action: 'Consulta agendada', user: 'Dra. Sabryna', ipAddress: '192.168.1.100' },
  { timestamp: '2026-05-12 10:15', action: 'Dados alterados', user: 'Paciente', ipAddress: '187.45.123.456' },
  { timestamp: '2026-05-10 09:00', action: 'Perfil visualizado', user: 'Dr. Felipe', ipAddress: '192.168.1.101' },
];

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

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const [showAuditLog, setShowAuditLog] = useState(false);
  const statusStyle = getStatusStyle(mockPatient.status);

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between print:hidden">
        <div>
          <h1 className="font-display text-4xl font-normal mb-2" style={{ color: 'var(--color-text)', letterSpacing: '0.1em' }}>
            {mockPatient.name}
          </h1>
          <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
            ID: {params.id} • Registrado em {new Date(mockPatient.registeredDate).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="font-body text-sm font-normal px-4 py-2 flex items-center gap-2"
            style={{ backgroundColor: 'var(--color-gold)', color: 'white' }}
          >
            <Edit2 size={16} />
            Editar
          </Button>
          <Button
            variant="outline"
            className="font-body text-sm font-normal px-4 py-2"
            style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
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
              {new Date(mockPatient.lastAppointment).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card className="aria-card">
          <CardContent className="pt-6">
            <p className="font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Procedimentos</p>
            <p className="font-display text-lg" style={{ color: 'var(--color-text)' }}>
              {mockMedicalHistory.length}
            </p>
          </CardContent>
        </Card>

        <Card className="aria-card">
          <CardContent className="pt-6">
            <p className="font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Alergias</p>
            <p className="font-display text-lg" style={{ color: mockAllergies.length > 0 ? '#D32F2F' : 'var(--color-text)' }}>
              {mockAllergies.length > 0 ? `${mockAllergies.length} registrada(s)` : 'Nenhuma'}
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
              <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{mockPatient.email}</p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Telefone</p>
              <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{mockPatient.phone}</p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Data de Nascimento</p>
              <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>
                {new Date(mockPatient.dob).toLocaleDateString('pt-BR')} (40 anos)
              </p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Endereço</p>
              <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{mockPatient.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allergies Alert */}
      {mockAllergies.length > 0 && (
        <Card className="aria-card mb-8" style={{ borderLeft: '4px solid #D32F2F' }}>
          <CardHeader>
            <CardTitle className="font-body text-lg font-normal flex items-center gap-2" style={{ color: '#D32F2F' }}>
              <AlertCircle size={20} />
              Alergias Registradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAllergies.map((allergy, index) => (
                <div key={index} className="flex items-start justify-between pb-3 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                  <div>
                    <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{allergy.allergen}</p>
                    <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>{allergy.reaction}</p>
                  </div>
                  <Badge style={{ backgroundColor: '#FFCDD2', color: '#D32F2F' }}>
                    {allergy.severity}
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
            {mockMedications.map((med, index) => (
              <div key={index} className="flex items-start justify-between pb-3 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                <div>
                  <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{med.name}</p>
                  <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {med.dosage} • {med.frequency}
                  </p>
                </div>
                <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Desde {new Date(med.prescribed).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
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
            {mockMedicalHistory.map((entry, index) => (
              <div key={index} className="pb-4 border-b" style={{ borderColor: 'var(--color-divider)' }}>
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
            ))}
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
            {mockCommunications.map((comm, index) => (
              <div key={index} className="flex items-start justify-between pb-3 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{comm.message}</p>
                    <Badge style={{ backgroundColor: '#E8D5B0', color: '#8B6914' }}>
                      {comm.type}
                    </Badge>
                  </div>
                  <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(comm.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge style={{ backgroundColor: '#C8E6C9', color: '#2E7D32' }}>
                  {comm.status}
                </Badge>
              </div>
            ))}
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
              {mockAuditLog.map((log, index) => (
                <div key={index} className="flex items-start justify-between pb-3 border-b" style={{ borderColor: 'var(--color-divider)' }}>
                  <div className="flex-1">
                    <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{log.action}</p>
                    <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Por {log.user} • {log.timestamp}
                    </p>
                  </div>
                  <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {log.ipAddress}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </Shell>
  );
}
