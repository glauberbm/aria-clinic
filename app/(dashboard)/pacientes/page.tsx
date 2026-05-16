'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@supabase/supabase-js';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent } from '@/components/ui/card';
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
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  status: 'active' | 'inactive' | 'archived';
  registeredDate: string;
  lastAppointment: string;
}

export default function PacientesPage() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; patientId: string | null; patientName: string | null }>({ open: false, patientId: null, patientName: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch patients from Supabase
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user?.id) return;

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
          .eq('clinic_id', profile.clinic_id)
          .order(sortBy === 'name' ? 'name' : sortBy, {
            ascending: sortBy === 'name'
          });

        if (supabaseError) throw supabaseError;
        setPatients(data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar pacientes';
        setError(errorMessage);
        console.error('Fetch patients error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [user?.id, user?.session?.access_token, sortBy]);

  // Handle patient deletion
  const handleDeleteClick = (patientId: string, patientName: string) => {
    setDeleteDialog({ open: true, patientId, patientName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.patientId || !user?.id) return;

    setIsDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from('patients')
        .delete()
        .eq('id', deleteDialog.patientId);

      if (deleteError) throw deleteError;

      // Log audit trail for patient deletion
      try {
        await supabase.from('audit_logs').insert({
          patient_id: deleteDialog.patientId,
          action: 'DELETE',
          user_id: user.id,
          description: `Paciente ${deleteDialog.patientName} deletado`,
          created_at: new Date().toISOString(),
        });
      } catch (auditError) {
        console.warn('Failed to log audit trail:', auditError);
        // Don't throw - audit logging failure shouldn't block patient deletion
      }

      // Remove patient from local state
      setPatients(prev => prev.filter(p => p.id !== deleteDialog.patientId));
      setDeleteDialog({ open: false, patientId: null, patientName: null });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar paciente';
      setError(errorMessage);
      console.error('Delete patient error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter and sort logic
  const filteredAndSortedPatients = useMemo(() => {
    let result = patients;

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
  }, [searchTerm, statusFilter, sortBy, patients]);

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
          onClick={() => router.push('/pacientes/novo')}
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
            {!isLoading && (
              <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedPatients.length)} de {filteredAndSortedPatients.length} pacientes
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="aria-card mb-8" style={{ borderColor: '#D32F2F' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} style={{ color: '#D32F2F' }} />
              <div>
                <p className="font-body text-sm font-medium" style={{ color: '#D32F2F' }}>
                  Erro ao carregar pacientes
                </p>
                <p className="font-body text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                {isLoading ? (
                  // Skeleton loaders
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <tr key={`skeleton-${index}`} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : displayedPatients.length > 0 ? (
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
                            <button
                              onClick={() => router.push(`/pacientes/${patient.id}/editar`)}
                              className="p-1 rounded hover:opacity-70"
                              title="Editar"
                            >
                              <Edit2 size={16} style={{ color: 'var(--color-gold)' }} strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(patient.id, patient.name)}
                              className="p-1 rounded hover:opacity-70"
                              title="Deletar"
                            >
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, patientId: null, patientName: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Paciente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o paciente <strong>{deleteDialog.patientName}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, patientId: null, patientName: null })}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              style={{ backgroundColor: '#D32F2F', color: 'white' }}
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
