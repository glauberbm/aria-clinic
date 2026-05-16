"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useScheduler } from "@/lib/store/scheduler";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { AppointmentCard } from "@/components/scheduler/AppointmentCard";

export default function AppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { appointments } = useScheduler();

  const appointmentId = params.id as string;
  const appointment = appointments.find((apt) => apt.id === appointmentId);

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
      <div className="p-6 max-w-2xl mx-auto">
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Trash2 className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>

        <AppointmentCard appointment={appointment} />
      </div>
    </div>
  );
}
