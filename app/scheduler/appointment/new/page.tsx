"use client";

import { useRouter } from "next/navigation";
import { useScheduler } from "@/lib/store/scheduler";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentForm } from "@/components/scheduler/AppointmentForm";
import type { AppointmentFormData } from "@/lib/validations/appointment";
import { convertFormDataToAppointment } from "@/lib/validations/appointment";
import { v4 as uuid } from "uuid";
import { useState } from "react";

export default function CreateAppointmentPage() {
  const router = useRouter();
  const { doctors, appointments, addAppointment } = useScheduler();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true);
    try {
      const appointmentData = convertFormDataToAppointment(data);
      const newAppointment = addAppointment({
        patientId: uuid(),
        patientName: appointmentData.patientName,
        patientPhone: "", // Will be populated in CALE-005 (WhatsApp integration)
        doctorId: appointmentData.doctorId,
        doctorName: doctors.find((d) => d.id === appointmentData.doctorId)?.name || "Unknown",
        date: appointmentData.date,
        timeStart: appointmentData.timeStart,
        duration: appointmentData.duration,
        type: appointmentData.type,
        status: "scheduled",
        notes: appointmentData.notes || "",
      });

      router.push(`/app/scheduler/appointment/${newAppointment.id}`);
    } finally {
      setIsLoading(false);
    }
  };

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
            Novo Agendamento
          </h1>
        </div>

        <AppointmentForm
          onSubmit={handleSubmit}
          doctors={doctors}
          appointments={appointments}
          isLoading={isLoading}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
