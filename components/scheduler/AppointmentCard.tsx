"use client";

import { Appointment, AppointmentStatus } from "@/lib/store/scheduler";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Stethoscope } from "lucide-react";

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
  isCompact?: boolean;
}

const statusColors: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  confirmed: "bg-green-100 text-green-800 hover:bg-green-200",
  completed: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
  noshow: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  rescheduled: "bg-purple-100 text-purple-800 hover:bg-purple-200",
};

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
  noshow: "Não Compareceu",
  rescheduled: "Reagendado",
};

export function AppointmentCard({
  appointment,
  onClick,
  isCompact = false,
}: AppointmentCardProps) {
  const endTime = calculateEndTime(appointment.timeStart, appointment.duration);

  return (
    <Card
      className={`p-3 border-l-4 border-l-[#8B6F47] hover:shadow-md transition-shadow ${
        onClick ? "cursor-pointer" : ""
      } ${isCompact ? "py-2" : ""}`}
      onClick={onClick}
    >
      <div className={isCompact ? "space-y-1" : "space-y-2"}>
        {/* Header: Patient Name & Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <User className="w-4 h-4 text-[#8B6F47] flex-shrink-0" />
            <p className="font-medium text-sm truncate text-gray-900">
              {appointment.patientName}
            </p>
          </div>
          <Badge variant="outline" className={statusColors[appointment.status]}>
            {statusLabels[appointment.status]}
          </Badge>
        </div>

        {/* Time & Duration */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>
            {appointment.timeStart} - {endTime}
          </span>
          <span className="text-gray-400">({appointment.duration}min)</span>
        </div>

        {/* Doctor & Type */}
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <Stethoscope className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{appointment.doctorName}</span>
        </div>

        {/* Notes - only on full card */}
        {!isCompact && appointment.notes && (
          <p className="text-xs text-gray-500 italic border-t pt-2 mt-2">
            {appointment.notes}
          </p>
        )}
      </div>
    </Card>
  );
}

function calculateEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}
