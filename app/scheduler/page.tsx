"use client";

import { useRouter } from "next/navigation";
import { useScheduler } from "@/lib/store/scheduler";
import { AppointmentCard } from "@/components/scheduler/AppointmentCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";

export default function SchedulerDashboard() {
  const router = useRouter();
  const { appointments } = useScheduler();

  // Calculate metrics
  const metrics = useMemo(() => {
    const today = new Date();
    const nextWeekDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const todayAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return (
        aptDate.getFullYear() === today.getFullYear() &&
        aptDate.getMonth() === today.getMonth() &&
        aptDate.getDate() === today.getDate()
      );
    });

    const thisWeekAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && aptDate <= nextWeekDate;
    });

    const pendingConfirmation = appointments.filter(
      (apt) => apt.status === "scheduled"
    );
    const confirmed = appointments.filter((apt) => apt.status === "confirmed");

    return {
      totalAppointments: appointments.length,
      todayAppointments: todayAppointments.length,
      thisWeekAppointments: thisWeekAppointments.length,
      pendingConfirmation: pendingConfirmation.length,
      confirmed: confirmed.length,
      todayList: todayAppointments.sort((a, b) =>
        a.timeStart.localeCompare(b.timeStart)
      ),
    };
  }, [appointments]);

  const handleNewAppointment = () => {
    router.push("/scheduler/appointment/new");
  };

  const handleViewCalendar = () => {
    router.push("/scheduler/calendar");
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard de Agendamentos
            </h1>
            <p className="text-gray-600 mt-1">
              Bem-vindo ao gerenciador de agenda
            </p>
          </div>
          <Button
            onClick={handleNewAppointment}
            className="bg-[#8B6F47] hover:bg-[#8B6F47]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Appointments */}
          <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total de Agendamentos
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {metrics.totalAppointments}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </Card>

          {/* Today */}
          <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Hoje
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {metrics.todayAppointments}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </Card>

          {/* This Week */}
          <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Esta Semana
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {metrics.thisWeekAppointments}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </Card>

          {/* Pending Confirmation */}
          <Card className="p-6 border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  A Confirmar
                </p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {metrics.pendingConfirmation}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Agenda de Hoje
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewCalendar}
              >
                Ver Calendário
              </Button>
            </div>

            {metrics.todayList.length > 0 ? (
              <div className="space-y-3">
                {metrics.todayList.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onClick={() =>
                      router.push(`/scheduler/appointment/${appointment.id}`)
                    }
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-dashed">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400" />
                <p className="text-gray-500">
                  Nenhum agendamento para hoje
                </p>
              </Card>
            )}
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="p-6 border-0 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confirmados</span>
                  <span className="font-semibold text-gray-900">
                    {metrics.confirmed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">A Confirmar</span>
                  <span className="font-semibold text-gray-900">
                    {metrics.pendingConfirmation}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#8B6F47] h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (metrics.confirmed /
                            metrics.totalAppointments) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Taxa de confirmação:{" "}
                    {Math.round(
                      (metrics.confirmed / metrics.totalAppointments) * 100
                    )}
                    %
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 border-0 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={handleNewAppointment}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </Button>
                <Button
                  onClick={handleViewCalendar}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Calendário
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
