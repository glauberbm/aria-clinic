"use client";

import { useScheduler } from "@/lib/store/scheduler";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isSameDay } from "@/lib/utils/scheduler";
import type { Doctor } from "@/lib/store/scheduler";

interface DoctorScheduleProps {
  doctor: Doctor;
  date: Date;
}

export function DoctorSchedule({ doctor, date }: DoctorScheduleProps) {
  const { appointments } = useScheduler();

  // Get appointments for this doctor on this date
  const dayAppointments = appointments.filter(
    (apt) =>
      apt.doctorId === doctor.id &&
      isSameDay(apt.date, date) &&
      apt.status !== "cancelled"
  );

  // Check if it's a working day
  const dayOfWeek = date.getDay();
  const isWorkingDay = doctor.workingHours.daysOfWeek.includes(dayOfWeek);

  if (!isWorkingDay) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500 py-8">
          Doctor não atende nesta data
        </p>
      </Card>
    );
  }

  // Parse working hours
  const [startHour] = doctor.workingHours.start
    .split(":")
    .map(Number);
  const [endHour] = doctor.workingHours.end.split(":").map(Number);

  // Generate hourly slots
  const hours: Array<{ hour: number; appointments: typeof dayAppointments }> =
    [];

  for (let hour = startHour; hour < endHour; hour++) {
    const hourAppointments = dayAppointments.filter((apt) => {
      const [aptHour] = apt.timeStart.split(":").map(Number);
      return aptHour === hour;
    });
    hours.push({ hour, appointments: hourAppointments });
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">
          Schedule for {date.toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h3>

        {/* Timeline Grid - Responsive scroll on mobile */}
        <div className="overflow-x-auto">
          <div className="space-y-3 min-w-max md:min-w-full">
            {hours.map(({ hour, appointments: hourAppts }) => (
              <div key={hour} className="flex gap-4">
                {/* Time label */}
                <div className="w-20 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                </div>

                {/* Slots container */}
                <div className="flex-1 flex gap-2 flex-wrap md:flex-nowrap">
                  {/* Show 30-min slots or booked appointments */}
                  {hourAppts.length > 0 ? (
                    // Show booked appointments
                    hourAppts.map((apt) => (
                      <div
                        key={apt.id}
                        className={`flex-1 p-3 rounded-lg text-xs border-l-4 ${
                          apt.status === "confirmed"
                            ? "bg-blue-50 border-l-blue-500"
                            : apt.status === "completed"
                              ? "bg-green-50 border-l-green-500"
                              : "bg-gray-50 border-l-gray-500"
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {apt.patientName}
                        </div>
                        <div className="text-gray-600">
                          {apt.timeStart} ({apt.duration}min)
                        </div>
                        <Badge
                          variant="outline"
                          className="mt-2"
                        >
                          {apt.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    // Show available slot
                    <div className="flex-1 p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300 text-xs text-gray-500">
                      Available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-6 pt-6 border-t flex gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total slots:</span>
            <span className="font-semibold text-gray-900 ml-2">
              {hours.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Booked:</span>
            <span className="font-semibold text-gray-900 ml-2">
              {dayAppointments.length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Available:</span>
            <span className="font-semibold text-gray-900 ml-2">
              {hours.length - dayAppointments.length}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
