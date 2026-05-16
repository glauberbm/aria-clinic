"use client";

import { useScheduler } from "@/lib/store/scheduler";
import { Card } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";

export default function DoctorsPage() {
  const { doctors } = useScheduler();

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Médicos
        </h1>
        <p className="text-gray-600 mb-8">
          Gerenciamento de médicos será implementado na history CALE-003.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#8B6F47]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-6 h-6 text-[#8B6F47]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    {doctor.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {doctor.specialty}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {doctor.workingHours.start} - {doctor.workingHours.end}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
