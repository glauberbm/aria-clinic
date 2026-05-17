"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useScheduler } from "@/lib/store/scheduler";
import { ArrowLeft, Edit } from "lucide-react";
import { AppointmentCard } from "@/components/scheduler/AppointmentCard";
import { AppointmentActions } from "@/components/scheduler/AppointmentActions";
import type { AppointmentStatus } from "@/lib/store/scheduler";

export default function AppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { appointments, updateAppointment } = useScheduler();
  const [isLoading, setIsLoading] = useState(false);
  const [statusUpdated, setStatusUpdated] = useState(false);

  const appointmentId = params.id as string;
  const appointment = appointments.find((apt) => apt.id === appointmentId);

  const handleStatusChange = async (
    id: string,
    status: AppointmentStatus,
    data?: { reason?: string; notes?: string }
  ) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updates: Record<string, unknown> = { status };
      if (data?.notes) {
        updates.notes = data.notes;
      }

      updateAppointment(id, updates);
      setStatusUpdated(true);

      // Clear success message after 3 seconds
      setTimeout(() => setStatusUpdated(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = () => {
    router.push(`/scheduler/appointment/${appointmentId}/edit`);
  };

  if (!appointment) {
    return (
      <div className="h-full overflow-auto">
        <div className="p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Agendamento Não Encontrado
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Detalhes do Agendamento
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleReschedule()}>
            <Edit className="w-4 h-4 mr-2" />
            Reagendar
          </Button>
        </div>

        {statusUpdated && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            Status do agendamento atualizado com sucesso!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointment Details */}
          <div className="lg:col-span-2">
            <AppointmentCard appointment={appointment} />
          </div>

          {/* Actions Panel */}
          <div>
            <AppointmentActions
              appointment={appointment}
              onStatusChange={handleStatusChange}
              isLoading={isLoading}
              onReschedule={handleReschedule}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
