"use client";

import { useScheduler } from "@/lib/store/scheduler";
import { DoctorCard } from "@/components/scheduler/DoctorCard";

export default function DoctorsPage() {
  const { doctors } = useScheduler();

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Médicos
        </h1>
        <p className="text-gray-600 mb-8">
          {doctors.length} médicos disponíveis. Clique em um médico para visualizar sua agenda.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </div>
  );
}
