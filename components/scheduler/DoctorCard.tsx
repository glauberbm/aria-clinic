"use client";

import { useScheduler } from "@/lib/store/scheduler";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope } from "lucide-react";
import { getDoctorAvailabilitySummary } from "@/lib/utils/scheduler";
import type { Doctor } from "@/lib/store/scheduler";

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const { appointments } = useScheduler();
  const today = new Date();

  // Get today's availability
  const summary = getDoctorAvailabilitySummary(
    doctor.id,
    today,
    appointments,
    [doctor]
  );

  const isAvailable = summary.available > 0;

  return (
    <Link href={`/scheduler/doctors/${doctor.id}`}>
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="flex items-start gap-4">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 bg-[#8B6F47]/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-6 h-6 text-[#8B6F47]" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Name */}
            <h3 className="font-semibold text-gray-900 truncate">
              {doctor.name}
            </h3>

            {/* Specialty */}
            <p className="text-sm text-gray-600 truncate">
              {doctor.specialty}
            </p>

            {/* Working Hours */}
            <p className="text-xs text-gray-500 mt-2">
              {doctor.workingHours.start} - {doctor.workingHours.end}
            </p>

            {/* Availability Badge */}
            <div className="mt-3 flex items-center gap-2">
              <Badge
                variant={isAvailable ? "default" : "secondary"}
                className={
                  isAvailable
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                }
              >
                {isAvailable ? (
                  <span className="text-xs">
                    {summary.available}/{summary.total} slots
                  </span>
                ) : (
                  <span className="text-xs">Full</span>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
