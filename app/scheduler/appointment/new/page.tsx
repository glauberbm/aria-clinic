"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NewAppointmentPage() {
  const router = useRouter();

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
        <p className="text-gray-600">
          Este formulário será implementado na history CALE-002 (Create/Edit Appointment).
        </p>
      </div>
    </div>
  );
}
