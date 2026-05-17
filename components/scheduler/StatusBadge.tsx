"use client";

import { AppointmentStatus } from "@/lib/store/scheduler";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  noshow: "bg-orange-100 text-orange-800",
  rescheduled: "bg-purple-100 text-purple-800",
};

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
  noshow: "Não Compareceu",
  rescheduled: "Reagendado",
};

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClass = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1";

  return (
    <Badge variant="outline" className={`${statusColors[status]} ${sizeClass}`}>
      {statusLabels[status]}
    </Badge>
  );
}
