"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WaitlistEntry, Doctor } from "@/lib/store/scheduler";

interface WaitlistTableProps {
  entries: WaitlistEntry[];
  doctors: Doctor[];
  onRemove: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  offered: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
};

export function WaitlistTable({
  entries,
  doctors,
  onRemove,
}: WaitlistTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = entries.filter((e) =>
    e.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDoctorName = (doctorId?: string) => {
    if (!doctorId) return "—";
    return doctors.find((d) => d.id === doctorId)?.name || "Unknown";
  };

  const formatDate = (date?: Date) => {
    if (!date) return "—";
    return date.toLocaleDateString("pt-BR", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search patient name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2 font-semibold">Patient</th>
              <th className="text-left py-3 px-2 font-semibold">
                Doctor Preference
              </th>
              <th className="text-left py-3 px-2 font-semibold">
                Date Preference
              </th>
              <th className="text-left py-3 px-2 font-semibold">Time</th>
              <th className="text-left py-3 px-2 font-semibold">Status</th>
              <th className="text-left py-3 px-2 font-semibold">Added</th>
              <th className="text-center py-3 px-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No entries found
                </td>
              </tr>
            ) : (
              filtered.map((entry) => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">{entry.patientName}</td>
                  <td className="py-3 px-2 text-sm text-gray-600">
                    {getDoctorName(entry.doctorId)}
                  </td>
                  <td className="py-3 px-2 text-sm">
                    {formatDate(entry.requestedDate)}
                  </td>
                  <td className="py-3 px-2 text-sm">
                    {entry.requestedTime || "—"}
                  </td>
                  <td className="py-3 px-2">
                    <Badge
                      className={`${STATUS_COLORS[entry.status] || "bg-gray-100 text-gray-800"} capitalize`}
                    >
                      {entry.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-xs text-gray-500">
                    {formatDistanceToNow(new Date(entry.addedAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(entry.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
