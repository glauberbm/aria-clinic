"use client";

import { useState, useMemo, useCallback } from "react";
import { useScheduler } from "@/lib/store/scheduler";
import { filterAndSortAppointments, HistoryFilters } from "@/lib/utils/history";
import { calculateAnalytics } from "@/lib/utils/analytics";
import { convertToCSV, downloadCSV } from "@/lib/utils/export";
import { HistoryAnalytics } from "@/components/scheduler/HistoryAnalytics";
import { HistoryTable } from "@/components/scheduler/HistoryTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentStatus } from "@/lib/store/scheduler";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";

const STATUS_OPTIONS: AppointmentStatus[] = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "noshow",
  "rescheduled",
];

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
  noshow: "Não Compareceu",
  rescheduled: "Reagendado",
};

export default function HistoryPage() {
  const { appointments, doctors } = useScheduler();
  const [filters, setFilters] = useState<HistoryFilters>({});
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<AppointmentStatus[]>([]);

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return filterAndSortAppointments(appointments, {
      ...filters,
      searchQuery,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      sortBy: sortBy as "date" | "doctor" | "patient" | "status" | "duration",
      sortOrder,
    });
  }, [appointments, filters, searchQuery, selectedStatuses, sortBy, sortOrder]);

  // Calculate metrics
  const metrics = useMemo(() => {
    return calculateAnalytics(filteredAppointments, doctors);
  }, [filteredAppointments, doctors]);

  // Handle sort
  const handleSort = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Handle export
  const handleExportCSV = () => {
    const csv = convertToCSV(filteredAppointments);
    downloadCSV(csv, "appointment-history.csv");
  };

  // Handle status toggle
  const toggleStatus = (status: AppointmentStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Handle date from
  const handleDateFromChange = (value: string) => {
    if (value) {
      const date = new Date(value);
      setFilters((prev) => ({ ...prev, dateFrom: date }));
    } else {
      setFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters.dateFrom;
        return newFilters;
      });
    }
  };

  // Handle date to
  const handleDateToChange = (value: string) => {
    if (value) {
      const date = new Date(value);
      setFilters((prev) => ({ ...prev, dateTo: date }));
    } else {
      setFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters.dateTo;
        return newFilters;
      });
    }
  };

  // Handle doctor filter
  const handleDoctorChange = (value: string) => {
    if (value) {
      setFilters((prev) => ({ ...prev, doctorIds: [value] }));
    } else {
      setFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters.doctorIds;
        return newFilters;
      });
    }
  };

  // Format date for input
  const formatDateForInput = (date?: Date): string => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Histórico de Agendamentos</h1>
        <p className="text-gray-600">
          Visualize e analise todos os agendamentos passados
        </p>
      </div>

      {/* Analytics Dashboard */}
      <HistoryAnalytics metrics={metrics} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateFrom" className="block text-sm font-medium mb-2">
                Data Inicial
              </Label>
              <input
                id="dateFrom"
                type="date"
                value={formatDateForInput(filters.dateFrom)}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="dateTo" className="block text-sm font-medium mb-2">
                Data Final
              </Label>
              <input
                id="dateTo"
                type="date"
                value={formatDateForInput(filters.dateTo)}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Doctor Selection */}
          <div>
            <Label htmlFor="doctor" className="block text-sm font-medium mb-2">
              Médico
            </Label>
            <Select
              value={filters.doctorIds?.[0] || ""}
              onValueChange={handleDoctorChange}
            >
              <SelectTrigger id="doctor">
                <SelectValue placeholder="Todos os médicos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os médicos</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Multiselect */}
          <div>
            <Label className="block text-sm font-medium mb-3">Status</Label>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="font-normal cursor-pointer"
                  >
                    {STATUS_LABELS[status]}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <Label htmlFor="search" className="block text-sm font-medium mb-2">
              Buscar (Nome do Paciente ou ID)
            </Label>
            <Input
              id="search"
              type="text"
              placeholder="Digite o nome do paciente ou ID..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Agendamentos</CardTitle>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Total: {filteredAppointments.length} agendamentos
              </p>
              <HistoryTable
                appointments={filteredAppointments}
                onSort={handleSort}
                currentSort={{ sortBy, sortOrder }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
