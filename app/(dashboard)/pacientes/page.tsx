'use client';

import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ChevronRight } from 'lucide-react';

// Mock data
const mockPacientes = [
  {
    id: 1,
    nome: 'Maria Silva',
    email: 'maria@example.com',
    telefone: '(82) 99999-1111',
    dataNascimento: '1985-03-15',
    status: 'Ativo',
    ultimaConsulta: '2026-05-10',
  },
  {
    id: 2,
    nome: 'João Santos',
    email: 'joao@example.com',
    telefone: '(82) 99999-2222',
    dataNascimento: '1990-07-22',
    status: 'Ativo',
    ultimaConsulta: '2026-05-08',
  },
  {
    id: 3,
    nome: 'Ana Costa',
    email: 'ana@example.com',
    telefone: '(82) 99999-3333',
    dataNascimento: '1988-11-30',
    status: 'Inativo',
    ultimaConsulta: '2026-03-15',
  },
  {
    id: 4,
    nome: 'Carlos Oliveira',
    email: 'carlos@example.com',
    telefone: '(82) 99999-4444',
    dataNascimento: '1992-01-10',
    status: 'Ativo',
    ultimaConsulta: '2026-05-12',
  },
  {
    id: 5,
    nome: 'Beatriz Lima',
    email: 'beatriz@example.com',
    telefone: '(82) 99999-5555',
    dataNascimento: '1987-06-05',
    status: 'Ativo',
    ultimaConsulta: '2026-05-14',
  },
  {
    id: 6,
    nome: 'Fernando Rocha',
    email: 'fernando@example.com',
    telefone: '(82) 99999-6666',
    dataNascimento: '1995-09-18',
    status: 'Ativo',
    ultimaConsulta: '2026-05-11',
  },
];

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const filteredPacientes = mockPacientes.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || p.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Shell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="font-display text-4xl font-normal mb-2"
            style={{ color: 'var(--color-text)', letterSpacing: '0.1em' }}
          >
            Pacientes
          </h1>
          <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Gestão de pacientes e histórico médico
          </p>
        </div>

        <Button
          style={{
            backgroundColor: 'var(--color-gold)',
            color: 'var(--color-bg)',
          }}
          className="font-body text-sm font-normal"
        >
          <Plus size={16} className="mr-2" />
          Novo Paciente
        </Button>
      </div>

      {/* Filtros */}
      <Card className="aria-card mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  size={18}
                  style={{ color: 'var(--color-text-muted)' }}
                  className="absolute left-3 top-3"
                />
                <Input
                  placeholder="Buscar por nome ou email..."
                  className="pl-10 border"
                  style={{ borderColor: 'var(--color-divider)' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-0 bg-transparent font-body text-sm px-3 rounded"
              style={{
                color: 'var(--color-text)',
                borderBottom: '1px solid var(--color-divider)',
              }}
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pacientes */}
      <div className="space-y-4">
        {filteredPacientes.map((paciente) => (
          <Card key={paciente.id} className="aria-card hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-display text-lg" style={{ color: 'var(--color-text)' }}>
                    {paciente.nome}
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Email
                      </p>
                      <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>
                        {paciente.email}
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Telefone
                      </p>
                      <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>
                        {paciente.telefone}
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Última Consulta
                      </p>
                      <p className="font-body text-sm" style={{ color: 'var(--color-text)' }}>
                        {new Date(paciente.ultimaConsulta).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge
                    style={{
                      backgroundColor: paciente.status === 'Ativo' ? '#2C5534' : '#5C2C2C',
                      color: paciente.status === 'Ativo' ? '#76C776' : '#FF6B6B',
                    }}
                  >
                    {paciente.status}
                  </Badge>
                  <ChevronRight
                    size={20}
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPacientes.length === 0 && (
          <Card className="aria-card">
            <CardContent className="pt-6 text-center">
              <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Nenhum paciente encontrado
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  );
}
