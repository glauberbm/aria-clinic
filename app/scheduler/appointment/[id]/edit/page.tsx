"use client";

import { useRouter, useParams } from "next/navigation";
import { useScheduler } from "@/lib/store/scheduler";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentForm } from "@/components/scheduler/AppointmentForm";
import type { AppointmentFormData } from "@/lib/validations/appointment";
import { convertFormDataToAppointment } from "@/lib/validations/appointment";
import { useState } from "react";

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const { doctors, appointments, updateAppointment } = useScheduler();
  const [isLoading, setIsLoading] = useState(false);

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
              Appointment Not Found
            </h1>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true);
    try {
      const appointmentData = convertFormDataToAppointment(data);
      updateAppointment(appointmentId, {
        patientName: appointmentData.patientName,
        doctorId: appointmentData.doctorId,
        doctorName: doctors.find((d) => d.id === appointmentData.doctorId)?.name || "Unknown",
        date: appointmentData.date,
        timeStart: appointmentData.timeStart,
        duration: appointmentData.duration,
        type: appointmentData.type,
        notes: appointmentData.notes || "",
      });

      router.push(`/app/scheduler/appointment/${appointmentId}`);
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
            Edit Appointment
          </h1>
        </div>

        <AppointmentForm
          initialData={appointment}
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
