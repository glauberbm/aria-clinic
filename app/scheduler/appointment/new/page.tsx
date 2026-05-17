"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppointmentForm } from "@/components/scheduler/AppointmentForm";
import { useScheduler } from "@/lib/store/scheduler";
import type { AppointmentFormData } from "@/lib/validations/appointment";

export default function NewAppointmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { addAppointment, doctors, appointments } = useScheduler();

  const handleSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true);
    try {
      // Simulate server processing delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const doctor = doctors.find((d) => d.id === data.doctorId);
      if (!doctor) {
        throw new Error("Doctor not found");
      }

      addAppointment({
        patientId: crypto.randomUUID(),
        patientName: data.patientName,
        patientPhone: data.patientPhone || "+5585900000000",
        doctorId: data.doctorId,
        doctorName: doctor.name,
        date: data.date,
        timeStart: data.timeStart,
        duration: parseInt(data.duration, 10) as 15 | 30 | 60,
        type: data.type,
        status: "scheduled",
        notes: data.notes,
      });

      // Redirect to calendar
      router.push("/app/scheduler");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/app/scheduler");
  };

  const handleConflict = () => {
    console.log("Doctor conflict detected - showing waitlist option");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Novo Agendamento</h1>
        <p className="mt-2 text-gray-600">
          Preencha os dados abaixo para agendar uma consulta
        </p>
      </div>

      <AppointmentForm
        onSubmit={handleSubmit}
        doctors={doctors}
        appointments={appointments}
        isLoading={isLoading}
        onCancel={handleCancel}
        onConflict={handleConflict}
      />
    </div>
  );
}
