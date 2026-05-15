'use client';

import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Archive } from 'lucide-react';

const mockPaciente = {
  id: 1,
  nome: 'Maria Silva',
  email: 'maria@example.com',
  telefone: '(82) 99999-1111',
  dataNascimento: '1985-03-15',
  status: 'Ativo',
  ultimaConsulta: '2026-05-10',
};

export default function PacienteDetailPage({ params }: { params: { id: string } }) {
  return (
    <Shell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-normal mb-2" style={{ color: 'var(--color-text)', letterSpacing: '0.1em' }}>
            {mockPaciente.nome}
          </h1>
          <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
            ID: {params.id}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" style={{ borderColor: 'var(--color-gold)' }} className="font-body text-sm">
            <Edit size={16} className="mr-2" />
            Editar
          </Button>
          <Button variant="ghost" style={{ color: 'var(--color-text-muted)' }} className="font-body text-sm">
            <Archive size={16} className="mr-2" />
            Arquivar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="aria-card">
          <CardContent className="pt-6">
            <p className="font-body text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Status</p>
            <Badge style={{ backgroundColor: '#2C5534', color: '#76C776' }}>
              {mockPaciente.status}
            </Badge>
          </CardContent>
        </Card>

        <Card className="aria-card">
          <CardContent className="pt-6">
            <p className="font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Última Consulta</p>
            <p className="font-display text-lg" style={{ color: 'var(--color-gold)' }}>
              {new Date(mockPaciente.ultimaConsulta).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card className="aria-card">
          <CardContent className="pt-6">
            <p className="font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Email</p>
            <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>
              {mockPaciente.email}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="aria-card">
        <CardHeader>
          <CardTitle style={{ color: 'var(--color-text)' }}>Informações do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-body text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Email</p>
              <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{mockPaciente.email}</p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Telefone</p>
              <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{mockPaciente.telefone}</p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Data de Nascimento</p>
              <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{new Date(mockPaciente.dataNascimento).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="font-body text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Status</p>
              <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{mockPaciente.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}
