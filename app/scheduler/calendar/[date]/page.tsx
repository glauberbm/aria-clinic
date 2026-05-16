"use client";

import { useRouter, useParams } from "next/navigation";
import { useScheduler } from "@/lib/store/scheduler";
import { AppointmentCard } from "@/components/scheduler/AppointmentCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Clock } from "lucide-react";
import { useMemo } from "react";

export default function DayViewPage() {
  const router = useRouter();
  const params = useParams();
  const { getAppointmentsForDate, doctors } = useScheduler();

  // Parse the date from URL
  const dateString = params.date as string;
  const selectedDate = useMemo(() => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [dateString]);

  const appointmentsForDay = useMemo(() => {
    return getAppointmentsForDate(selectedDate).sort((a, b) => {
      const aTime = a.timeStart.split(":").join("");
      const bTime = b.timeStart.split(":").join("");
      return aTime.localeCompare(bTime);
    });
  }, [selectedDate, getAppointmentsForDate]);

  // Group appointments by doctor
  const appointmentsByDoctor = useMemo(() => {
    const grouped = new Map<string, typeof appointmentsForDay>();
    appointmentsForDay.forEach((apt) => {
      const key = apt.doctorId;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(apt);
    });
    return grouped;
  }, [appointmentsForDay]);

  // Calculate occupancy metrics
  const metrics = useMemo(() => {
    return {
      total: appointmentsForDay.length,
      confirmed: appointmentsForDay.filter((a) => a.status === "confirmed")
        .length,
      scheduled: appointmentsForDay.filter((a) => a.status === "scheduled")
        .length,
      completed: appointmentsForDay.filter((a) => a.status === "completed")
        .length,
      cancelled: appointmentsForDay.filter((a) => a.status === "cancelled")
        .length,
    };
  }, [appointmentsForDay]);

  const handleBack = () => {
    router.push("/scheduler/calendar");
  };

  const handleNewAppointment = () => {
    router.push(
      `/scheduler/appointment/new?date=${dateString}`
    );
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-10 w-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedDate.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h1>
              <p className="text-gray-600 mt-1">
                Visualize todos os agendamentos do dia
              </p>
            </div>
          </div>
          <Button
            onClick={handleNewAppointment}
            className="bg-[#8B6F47] hover:bg-[#8B6F47]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[#8B6F47]">{metrics.total}</p>
            <p className="text-xs text-gray-600 mt-1">Total</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {metrics.confirmed}
            </p>
            <p className="text-xs text-gray-600 mt-1">Confirmados</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {metrics.scheduled}
            </p>
            <p className="text-xs text-gray-600 mt-1">Agendados</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {metrics.completed}
            </p>
            <p className="text-xs text-gray-600 mt-1">Concluídos</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {metrics.cancelled}
            </p>
            <p className="text-xs text-gray-600 mt-1">Cancelados</p>
          </Card>
        </div>

        {/* Content */}
        {appointmentsForDay.length > 0 ? (
          <div className="space-y-6">
            {/* Timeline View */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <Clock className="w-5 h-5 inline mr-2" />
                Cronograma do Dia
              </h2>
              <div className="space-y-3">
                {appointmentsForDay.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex gap-4 items-start"
                  >
                    <div className="w-20 pt-1 text-center">
                      <div className="text-lg font-semibold text-[#8B6F47]">
                        {appointment.timeStart}
                      </div>
                      <div className="text-xs text-gray-500">
                        {appointment.duration}min
                      </div>
                    </div>
                    <div className="flex-1">
                      <AppointmentCard
                        appointment={appointment}
                        onClick={() =>
                          router.push(
                            `/scheduler/appointment/${appointment.id}`
                          )
                        }
                        isCompact={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* By Doctor View */}
            {appointmentsByDoctor.size > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Por Médico
                </h2>
                <div className="space-y-4">
                  {Array.from(appointmentsByDoctor.entries()).map(
                    ([doctorId, doctorAppointments]) => {
                      const doctor = doctors.find((d) => d.id === doctorId);
                      return (
                        <Card
                          key={doctorId}
                          className="p-4 border-l-4 border-l-[#8B6F47]"
                        >
                          <h3 className="font-semibold text-gray-900 mb-3">
                            {doctor?.name || "Médico Desconhecido"}
                          </h3>
                          <div className="space-y-2">
                            {doctorAppointments.map((apt) => (
                              <div
                                key={apt.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {apt.patientName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {apt.timeStart} ({apt.duration}min)
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/scheduler/appointment/${apt.id}`
                                    )
                                  }
                                  className="text-[#8B6F47]"
                                >
                                  Ver
                                </Button>
                              </div>
                            ))}
                          </div>
                        </Card>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <div className="text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                Nenhum agendamento para este dia
              </p>
              <p className="text-sm mb-6">
                Não há consultas agendadas para{" "}
                {selectedDate.toLocaleDateString("pt-BR", {
                  weekday: "short",
                })}
                .
              </p>
              <Button
                onClick={handleNewAppointment}
                className="bg-[#8B6F47] hover:bg-[#8B6F47]/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Agendamento
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
