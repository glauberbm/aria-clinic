"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarView } from "@/components/scheduler/CalendarView";
import { AppointmentCard } from "@/components/scheduler/AppointmentCard";
import { useScheduler } from "@/lib/store/scheduler";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function CalendarPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { getAppointmentsForDate } = useScheduler();

  const appointmentsForSelectedDate = selectedDate
    ? getAppointmentsForDate(selectedDate)
    : [];

  // Sort appointments by time
  const sortedAppointments = appointmentsForSelectedDate.sort((a, b) => {
    const aTime = a.timeStart.split(":").join("");
    const bTime = b.timeStart.split(":").join("");
    return aTime.localeCompare(bTime);
  });

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleViewDay = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];
    router.push(`/scheduler/calendar/${formattedDate}`);
  };

  const handleNewAppointment = () => {
    router.push("/scheduler/appointment/new");
  };

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Calendário de Agendamentos
            </h1>
            <p className="text-gray-600 mt-1">
              Visualize e gerencie todos os agendamentos
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar - Left */}
          <div className="lg:col-span-1">
            <CalendarView
              selectedDate={selectedDate}
              onDateSelect={handleSelectDate}
            />
          </div>

          {/* Appointments - Right */}
          <div className="lg:col-span-2 space-y-4">
            {/* Selected Date Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedDate ? (
                  <>
                    {selectedDate.toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </>
                ) : (
                  "Selecione uma data"
                )}
              </h2>
              {selectedDate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDay(selectedDate)}
                >
                  Ver Dia Completo
                </Button>
              )}
            </div>

            {/* Appointments List */}
            {sortedAppointments.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {sortedAppointments.length} agendamento
                  {sortedAppointments.length !== 1 ? "s" : ""} neste dia
                </p>
                {sortedAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onClick={() =>
                      router.push(
                        `/scheduler/appointment/${appointment.id}`
                      )
                    }
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-dashed">
                <p className="text-gray-500 mb-4">
                  Nenhum agendamento para esta data
                </p>
                <Button
                  onClick={handleNewAppointment}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Agendamento
                </Button>
              </Card>
            )}

            {/* Stats Card */}
            {selectedDate && (
              <Card className="p-4 bg-gradient-to-br from-[#8B6F47]/5 to-transparent border-[#8B6F47]/20">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#8B6F47]">
                      {sortedAppointments.length}
                    </p>
                    <p className="text-xs text-gray-600">Agendamentos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {
                        sortedAppointments.filter(
                          (a) => a.status === "confirmed"
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-600">Confirmados</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {
                        sortedAppointments.filter(
                          (a) => a.status === "scheduled"
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-600">Agendados</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
