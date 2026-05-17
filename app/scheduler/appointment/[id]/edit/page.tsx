"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { AppointmentForm } from "@/components/scheduler/AppointmentForm";
import { useScheduler } from "@/lib/store/scheduler";
import type { AppointmentFormData } from "@/lib/validations/appointment";

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const { appointments, updateAppointment, doctors } = useScheduler();

  const appointment = appointments.find((a) => a.id === appointmentId);

  if (!appointment) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Agendamento não encontrado</h1>
        <button
          onClick={() => router.push("/app/scheduler")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Voltar ao calendário
        </button>
      </div>
    );
  }

  const handleSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true);
    try {
      // Simulate server processing delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const doctor = doctors.find((d) => d.id === data.doctorId);
      if (!doctor) {
        throw new Error("Doctor not found");
      }

      updateAppointment(appointmentId, {
        patientName: data.patientName,
        patientPhone: data.patientPhone || appointment.patientPhone,
        doctorId: data.doctorId,
        doctorName: doctor.name,
        date: data.date,
        timeStart: data.timeStart,
        duration: parseInt(data.duration, 10) as 15 | 30 | 60,
        type: data.type,
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
        <h1 className="text-3xl font-bold text-gray-900">Editar Agendamento</h1>
        <p className="mt-2 text-gray-600">
          Atualize os dados do agendamento conforme necessário
        </p>
      </div>

      <AppointmentForm
        initialData={appointment}
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
