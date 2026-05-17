"use client";

import { Appointment } from "@/lib/store/scheduler";
import { format } from "date-fns";
import { StatusBadge } from "@/components/scheduler/StatusBadge";

interface HistoryTableProps {
  appointments: Appointment[];
  onSort: (sortBy: string, sortOrder: "asc" | "desc") => void;
  currentSort: { sortBy: string; sortOrder: "asc" | "desc" };
}

export function HistoryTable({
  appointments,
  onSort,
  currentSort,
}: HistoryTableProps) {
  const handleHeaderClick = (sortBy: string) => {
    const newOrder =
      currentSort.sortBy === sortBy && currentSort.sortOrder === "asc"
        ? "desc"
        : "asc";
    onSort(sortBy, newOrder);
  };

  const getSortIndicator = (sortBy: string): string => {
    if (currentSort.sortBy !== sortBy) return "";
    return currentSort.sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-3 cursor-pointer hover:bg-gray-100 font-medium">
              <button
                onClick={() => handleHeaderClick("date")}
                className="flex items-center gap-1"
              >
                Date
                {getSortIndicator("date")}
              </button>
            </th>
            <th className="text-left p-3 cursor-pointer hover:bg-gray-100 font-medium">
              <button
                onClick={() => handleHeaderClick("doctor")}
                className="flex items-center gap-1"
              >
                Doctor
                {getSortIndicator("doctor")}
              </button>
            </th>
            <th className="text-left p-3 cursor-pointer hover:bg-gray-100 font-medium">
              <button
                onClick={() => handleHeaderClick("patient")}
                className="flex items-center gap-1"
              >
                Patient
                {getSortIndicator("patient")}
              </button>
            </th>
            <th className="text-left p-3 cursor-pointer hover:bg-gray-100 font-medium">
              <button
                onClick={() => handleHeaderClick("status")}
                className="flex items-center gap-1"
              >
                Status
                {getSortIndicator("status")}
              </button>
            </th>
            <th className="text-left p-3 cursor-pointer hover:bg-gray-100 font-medium">
              <button
                onClick={() => handleHeaderClick("duration")}
                className="flex items-center gap-1"
              >
                Duration
                {getSortIndicator("duration")}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr key={apt.id} className="border-b hover:bg-gray-50">
              <td className="p-3 text-gray-900">
                {format(new Date(apt.date), "MMM dd, yyyy")}
              </td>
              <td className="p-3 text-gray-900">{apt.doctorName}</td>
              <td className="p-3 text-gray-900">{apt.patientName}</td>
              <td className="p-3">
                <StatusBadge status={apt.status} size="sm" />
              </td>
              <td className="p-3 text-gray-900">{apt.duration} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
