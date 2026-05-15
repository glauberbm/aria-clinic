'use client';

import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Check, X } from 'lucide-react';

const mockPagamentos = [
  {
    id: 1,
    profissional: 'Dra. Camila Santos',
    protocolos: 12,
    valorBruto: 15000.0,
    comissao: 15,
    valorLiquido: 12750.0,
    status: 'Pago',
  },
  {
    id: 2,
    profissional: 'Dr. Bruno Costa',
    protocolos: 8,
    valorBruto: 24000.0,
    comissao: 20,
    valorLiquido: 19200.0,
    status: 'Pendente',
  },
  {
    id: 3,
    profissional: 'Dra. Fernanda Lima',
    protocolos: 15,
    valorBruto: 18000.0,
    comissao: 15,
    valorLiquido: 15300.0,
    status: 'Pago',
  },
  {
    id: 4,
    profissional: 'Dr. Roberto Oliveira',
    protocolos: 5,
    valorBruto: 8000.0,
    comissao: 20,
    valorLiquido: 6400.0,
    status: 'Pendente',
  },
];

export default function PagamentoProfissionaisPage() {
  const [periodo, setPeriodo] = useState('30d');

  const totalAPagar = mockPagamentos.reduce((sum, p) => sum + p.valorLiquido, 0);
  const totalPago = mockPagamentos.filter((p) => p.status === 'Pago').reduce((sum, p) => sum + p.valorLiquido, 0);
  const totalPendente = mockPagamentos.filter((p) => p.status === 'Pendente').reduce((sum, p) => sum + p.valorLiquido, 0);

  return (
    <Shell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="font-display text-4xl font-normal mb-2"
            style={{ color: 'var(--color-text)', letterSpacing: '0.1em' }}
          >
            Pagamento de Profissionais
          </h1>
          <p
            className="font-body text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Gestão de comissões e pagamentos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Calendar size={18} style={{ color: 'var(--color-text-muted)' }} strokeWidth={1.5} />
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="border-0 bg-transparent font-body text-sm"
            style={{ color: 'var(--color-text)' }}
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
        </div>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="aria-card">
          <CardContent className="pt-6">
            <p
              className="font-body text-xs mb-3"
              style={{ color: 'var(--color-gold)' }}
            >
              Total a Pagar
            </p>
            <p
              className="font-display text-3xl font-normal mb-2"
              style={{ color: 'var(--color-gold)' }}
            >
              R$ {totalAPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p
              className="font-body text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Período: {periodo === '30d' ? 'Últimos 30 dias' : 'Selecionado'}
            </p>
          </CardContent>
        </Card>

        <Card className="aria-card">
          <CardContent className="pt-6">
            <p
              className="font-body text-xs mb-3"
              style={{ color: '#76C776' }}
            >
              Pago
            </p>
            <p
              className="font-display text-3xl font-normal mb-2"
              style={{ color: '#76C776' }}
            >
              R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p
              className="font-body text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {mockPagamentos.filter((p) => p.status === 'Pago').length} profissionais
            </p>
          </CardContent>
        </Card>

        <Card className="aria-card">
          <CardContent className="pt-6">
            <p
              className="font-body text-xs mb-3"
              style={{ color: '#FFD700' }}
            >
              Pendente
            </p>
            <p
              className="font-display text-3xl font-normal mb-2"
              style={{ color: '#FFD700' }}
            >
              R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p
              className="font-body text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {mockPagamentos.filter((p) => p.status === 'Pendente').length} profissionais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="aria-card">
        <CardHeader>
          <CardTitle
            className="font-body text-lg font-normal"
            style={{ color: 'var(--color-text)' }}
          >
            Detalhes de Pagamento
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
                    Profissional
                  </th>
                  <th
                    className="py-4 px-4 text-left font-body text-sm font-normal"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Protocolos
                  </th>
                  <th
                    className="py-4 px-4 text-left font-body text-sm font-normal"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Valor Bruto
                  </th>
                  <th
                    className="py-4 px-4 text-left font-body text-sm font-normal"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Comissão
                  </th>
                  <th
                    className="py-4 px-4 text-left font-body text-sm font-normal"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Valor Líquido
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
                {mockPagamentos.map((pag) => (
                  <tr
                    key={pag.id}
                    style={{ borderBottom: '1px solid var(--color-divider)' }}
                  >
                    <td
                      className="py-4 px-4 font-body text-sm"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {pag.profissional}
                    </td>
                    <td
                      className="py-4 px-4 font-body text-sm"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {pag.protocolos}
                    </td>
                    <td
                      className="py-4 px-4 font-body text-sm"
                      style={{ color: 'var(--color-text)' }}
                    >
                      R$ {pag.valorBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      className="py-4 px-4 font-body text-sm"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {pag.comissao}%
                    </td>
                    <td
                      className="py-4 px-4 font-display text-sm font-normal"
                      style={{ color: 'var(--color-gold)' }}
                    >
                      R$ {pag.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        style={{
                          backgroundColor: pag.status === 'Pago' ? '#2C5534' : '#6B5B00',
                          color: pag.status === 'Pago' ? '#76C776' : '#FFD700',
                        }}
                      >
                        {pag.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      {pag.status === 'Pendente' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{
                            backgroundColor: 'var(--color-gold)',
                            color: 'var(--color-bg)',
                          }}
                          className="font-body text-xs font-normal"
                        >
                          <Check size={14} className="mr-1" />
                          Pagar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}
