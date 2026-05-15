'use client';

import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Pen, Trash2 } from 'lucide-react';

const mockContratos = [
  {
    id: 1,
    paciente: 'Maria Silva',
    tipo: 'Preenchimento Labial',
    data: '2024-05-10',
    status: 'Assinado',
  },
  {
    id: 2,
    paciente: 'João Santos',
    tipo: 'Lipo Aspirativa',
    data: '2024-05-12',
    status: 'Pendente',
  },
  {
    id: 3,
    paciente: 'Ana Costa',
    tipo: 'Rinoplastia',
    data: '2024-05-08',
    status: 'Assinado',
  },
  {
    id: 4,
    paciente: 'Carlos Oliveira',
    tipo: 'Abdominoplastia',
    data: '2024-05-05',
    status: 'Expirado',
  },
  {
    id: 5,
    paciente: 'Beatriz Lima',
    tipo: 'Microblading',
    data: '2024-05-15',
    status: 'Pendente',
  },
  {
    id: 6,
    paciente: 'Fernando Rocha',
    tipo: 'Botox',
    data: '2024-05-20',
    status: 'Assinado',
  },
];

const statusBadgeColor: Record<string, { bg: string; text: string }> = {
  Assinado: { bg: '#2C5534', text: '#76C776' },
  Pendente: { bg: '#6B5B00', text: '#FFD700' },
  Expirado: { bg: '#5C2C2C', text: '#FF6B6B' },
};

export default function ContratosPage() {
  return (
    <Shell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="font-display text-4xl font-normal mb-2"
            style={{ color: 'var(--color-text)', letterSpacing: '0.1em' }}
          >
            Contratos
          </h1>
          <p
            className="font-body text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Gerenciamento de contratos de serviços
          </p>
        </div>

        <Button
          style={{
            backgroundColor: 'var(--color-gold)',
            color: 'var(--color-bg)',
          }}
          className="font-body text-sm font-normal"
        >
          <FileText size={16} className="mr-2" />
          Novo Contrato
        </Button>
      </div>

      <Card className="aria-card">
        <CardHeader>
          <CardTitle
            className="font-body text-lg font-normal"
            style={{ color: 'var(--color-text)' }}
          >
            Contratos Registrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                  <th
                    className="py-4 px-4 text-left font-body text-sm font-normal"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Paciente
                  </th>
                  <th
                    className="py-4 px-4 text-left font-body text-sm font-normal"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Tipo de Serviço
                  </th>
                  <th
                    className="py-4 px-4 text-left font-body text-sm font-normal"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Data
                  </th>
                  <th
                    className="py-4 px-4 text-left font-body text-sm font-normal"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Status
                  </th>
                  <th
                    className="py-4 px-4 text-left font-body text-sm font-normal"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockContratos.map((contrato) => {
                  const statusColor = statusBadgeColor[contrato.status] || statusBadgeColor.Pendente;
                  return (
                    <tr
                      key={contrato.id}
                      style={{ borderBottom: '1px solid var(--color-divider)' }}
                    >
                      <td
                        className="py-4 px-4 font-body text-sm"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {contrato.paciente}
                      </td>
                      <td
                        className="py-4 px-4 font-body text-sm"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {contrato.tipo}
                      </td>
                      <td
                        className="py-4 px-4 font-body text-sm"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {new Date(contrato.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                          }}
                        >
                          {contrato.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          {contrato.status === 'Pendente' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              style={{
                                backgroundColor: 'var(--color-gold)',
                                color: 'var(--color-bg)',
                              }}
                              className="font-body text-xs font-normal"
                            >
                              <Pen size={14} className="mr-1" />
                              Assinar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}
