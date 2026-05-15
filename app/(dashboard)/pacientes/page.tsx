'use client';

import { useState, useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

// Mock patient data
const mockPatients = [
  { id: 1, name: 'Alessandra Costa', email: 'alessandra@example.com', phone: '(85) 98888-1111', dob: '1985-03-15', status: 'active', registeredDate: '2026-01-10', lastAppointment: '2026-05-14' },
  { id: 2, name: 'Bruna Rugue', email: 'bruna@example.com', phone: '(85) 98888-2222', dob: '1990-07-22', status: 'active', registeredDate: '2026-01-15', lastAppointment: '2026-05-12' },
  { id: 3, name: 'Carolina Silva', email: 'carolina@example.com', phone: '(85) 98888-3333', dob: '1988-11-08', status: 'active', registeredDate: '2026-02-01', lastAppointment: '2026-05-10' },
  { id: 4, name: 'Diana Santos', email: 'diana@example.com', phone: '(85) 98888-4444', dob: '1992-05-30', status: 'inactive', registeredDate: '2026-02-15', lastAppointment: '2026-03-15' },
  { id: 5, name: 'Erica Mendes', email: 'erica@example.com', phone: '(85) 98888-5555', dob: '1987-09-12', status: 'active', registeredDate: '2026-03-01', lastAppointment: '2026-05-08' },
  { id: 6, name: 'Gabriela Rocha', email: 'gabriela@example.com', phone: '(85) 98888-6666', dob: '1995-01-25', status: 'active', registeredDate: '2026-03-10', lastAppointment: '2026-05-11' },
  { id: 7, name: 'Helena Marques', email: 'helena@example.com', phone: '(85) 98888-7777', dob: '1989-08-18', status: 'active', registeredDate: '2026-03-20', lastAppointment: '2026-05-09' },
  { id: 8, name: 'Iris da Silva', email: 'iris@example.com', phone: '(85) 98888-8888', dob: '1991-12-03', status: 'inactive', registeredDate: '2026-04-01', lastAppointment: '2026-02-28' },
  { id: 9, name: 'Julia Martins', email: 'julia@example.com', phone: '(85) 98888-9999', dob: '1986-04-14', status: 'active', registeredDate: '2026-04-10', lastAppointment: '2026-05-13' },
  { id: 10, name: 'Kamila Santos', email: 'kamila@example.com', phone: '(85) 98888-0000', dob: '1993-06-27', status: 'active', registeredDate: '2026-04-20', lastAppointment: '2026-05-15' },
  { id: 11, name: 'Monica Costa', email: 'monica@example.com', phone: '(85) 99999-1111', dob: '1988-02-09', status: 'archived', registeredDate: '2025-12-01', lastAppointment: '2025-11-20' },
  { id: 12, name: 'Natalia Silva', email: 'natalia@example.com', phone: '(85) 99999-2222', dob: '1994-10-16', status: 'active', registeredDate: '2026-05-01', lastAppointment: '2026-05-07' },
  { id: 13, name: 'Olivia Mendes', email: 'olivia@example.com', phone: '(85) 99999-3333', dob: '1989-03-21', status: 'inactive', registeredDate: '2026-05-05', lastAppointment: '2026-04-15' },
  { id: 14, name: 'Patricia Rocha', email: 'patricia@example.com', phone: '(85) 99999-4444', dob: '1991-09-08', status: 'active', registeredDate: '2026-05-10', lastAppointment: '2026-05-14' },
  { id: 15, name: 'Quinita Santos', email: 'quinita@example.com', phone: '(85) 99999-5555', dob: '1987-07-19', status: 'active', registeredDate: '2026-05-15', lastAppointment: '2026-05-15' },
  { id: 16, name: 'Rosa Lima', email: 'rosa@example.com', phone: '(85) 99999-6666', dob: '1990-11-26', status: 'active', registeredDate: '2026-01-05', lastAppointment: '2026-05-06' },
  { id: 17, name: 'Sandra Alves', email: 'sandra@example.com', phone: '(85) 99999-7777', dob: '1986-08-04', status: 'active', registeredDate: '2026-01-20', lastAppointment: '2026-05-05' },
  { id: 18, name: 'Tania Costa', email: 'tania@example.com', phone: '(85) 99999-8888', dob: '1992-02-13', status: 'inactive', registeredDate: '2026-02-10', lastAppointment: '2026-01-30' },
  { id: 19, name: 'Ursula Silva', email: 'ursula@example.com', phone: '(85) 99999-9999', dob: '1988-06-17', status: 'active', registeredDate: '2026-03-05', lastAppointment: '2026-05-04' },
  { id: 20, name: 'Vanessa Santos', email: 'vanessa@example.com', phone: '(85) 91111-1111', dob: '1995-12-22', status: 'active', registeredDate: '2026-05-12', lastAppointment: '2026-05-12' },
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

type SortKey = 'name' | 'registeredDate' | 'lastAppointment';
type StatusFilter = 'all' | 'active' | 'inactive' | 'archived';

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and sort logic
  const filteredAndSortedPatients = useMemo(() => {
    let result = mockPatients;

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
      );
    }

    // Apply sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'registeredDate') {
        return new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime();
      } else if (sortBy === 'lastAppointment') {
        return new Date(b.lastAppointment).getTime() - new Date(a.lastAppointment).getTime();
      }
      return 0;
    });

    return result;
  }, [searchTerm, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedPatients = filteredAndSortedPatients.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-normal mb-2" style={{ color: 'var(--color-text)', letterSpacing: '0.1em' }}>
            Pacientes
          </h1>
          <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Gerencie informações dos pacientes da clínica
          </p>
        </div>
        <Button
          className="font-body text-sm font-normal px-6 py-3 flex items-center gap-2"
          style={{ backgroundColor: 'var(--color-gold)', color: 'white' }}
        >
          <Plus size={18} />
          Novo Paciente
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="aria-card mb-8">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg font-body text-sm"
                style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
              />
            </div>

            {/* Filters and Sort */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-lg font-body text-sm"
                  style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativas</option>
                  <option value="inactive">Inativas</option>
                  <option value="archived">Arquivadas</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="w-full px-3 py-2 border rounded-lg font-body text-sm"
                  style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
                >
                  <option value="name">Nome (A-Z)</option>
                  <option value="registeredDate">Data de Registro (Mais Recentes)</option>
                  <option value="lastAppointment">Última Consulta</option>
                </select>
              </div>

              {/* Items Per Page */}
              <div>
                <label className="block font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Itens por página
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-lg font-body text-sm"
                  style={{ borderColor: 'var(--color-divider)', color: 'var(--color-text)' }}
                >
                  <option value={10}>10 itens</option>
                  <option value={25}>25 itens</option>
                  <option value={50}>50 itens</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedPatients.length)} de {filteredAndSortedPatients.length} pacientes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="aria-card">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                  <th className="font-body text-xs font-normal text-left py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>
                    Nome
                  </th>
                  <th className="font-body text-xs font-normal text-left py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>
                    Email
                  </th>
                  <th className="font-body text-xs font-normal text-left py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>
                    Telefone
                  </th>
                  <th className="font-body text-xs font-normal text-left py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>
                    Data de Nascimento
                  </th>
                  <th className="font-body text-xs font-normal text-left py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>
                    Status
                  </th>
                  <th className="font-body text-xs font-normal text-center py-3 px-4" style={{ color: 'var(--color-text-muted)' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedPatients.length > 0 ? (
                  displayedPatients.map((patient) => {
                    const statusStyle = getStatusStyle(patient.status);
                    const dobDate = new Date(patient.dob);
                    const formattedDOB = dobDate.toLocaleDateString('pt-BR');

                    return (
                      <tr key={patient.id} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                        <td className="font-body text-sm py-4 px-4" style={{ color: 'var(--color-text)' }}>
                          {patient.name}
                        </td>
                        <td className="font-body text-sm py-4 px-4" style={{ color: 'var(--color-text-muted)' }}>
                          {patient.email}
                        </td>
                        <td className="font-body text-sm py-4 px-4" style={{ color: 'var(--color-text-muted)' }}>
                          {patient.phone}
                        </td>
                        <td className="font-body text-sm py-4 px-4" style={{ color: 'var(--color-text-muted)' }}>
                          {formattedDOB}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className="font-body text-xs font-normal"
                            style={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                            }}
                          >
                            {statusStyle.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-1 rounded hover:opacity-70" title="Visualizar">
                              <Edit2 size={16} style={{ color: 'var(--color-gold)' }} strokeWidth={1.5} />
                            </button>
                            <button className="p-1 rounded hover:opacity-70" title="Deletar">
                              <Trash2 size={16} style={{ color: '#D32F2F' }} strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Nenhum paciente encontrado
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-divider)' }}>
              <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: 'var(--color-divider)' }}
                >
                  <ChevronLeft size={18} style={{ color: 'var(--color-text)' }} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: 'var(--color-divider)' }}
                >
                  <ChevronRight size={18} style={{ color: 'var(--color-text)' }} />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Shell>
  );
}
