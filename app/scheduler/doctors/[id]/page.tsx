"use client";

import { useScheduler } from "@/lib/store/scheduler";
import { DoctorSchedule } from "@/components/scheduler/DoctorSchedule";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Doctor } from "@/lib/store/scheduler";

interface DoctorDetailPageProps {
  params: {
    id: string;
  };
}

export default function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const { doctors } = useScheduler();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // If today is not a working day, find next working day
    const doctorDaysOfWeek = (doctors.find((d) => d.id === params.id) as Doctor)
      ?.workingHours.daysOfWeek || [1, 2, 3, 4, 5];

    const date = new Date(today);
    while (!doctorDaysOfWeek.includes(date.getDay())) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  });

  const doctor = doctors.find((d) => d.id === params.id);

  if (!doctor) {
    return (
      <div className="h-full overflow-auto">
        <div className="p-6 max-w-4xl mx-auto">
          <Link href="/scheduler/doctors" className="mb-6">
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <Card className="p-6">
            <p className="text-center text-gray-600">Doctor not found</p>
          </Card>
        </div>
      </div>
    );
  }

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);

    // Skip to previous working day if not working day
    while (!doctor.workingHours.daysOfWeek.includes(newDate.getDay())) {
      newDate.setDate(newDate.getDate() - 1);
    }

    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);

    // Skip to next working day if not working day
    while (!doctor.workingHours.daysOfWeek.includes(newDate.getDay())) {
      newDate.setDate(newDate.getDate() + 1);
    }

    setSelectedDate(newDate);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    // Ensure selected date is a working day
    while (!doctor.workingHours.daysOfWeek.includes(newDate.getDay())) {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  // Format date for input value
  const dateInputValue = selectedDate.toISOString().split("T")[0];

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Back button */}
        <Link href="/scheduler/doctors" className="mb-6">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Doctors
          </Button>
        </Link>

        {/* Doctor Header */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-[#8B6F47]/5 to-transparent">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {doctor.name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">{doctor.specialty}</p>
          <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-600">
            <div>
              <span className="font-semibold">Working Hours:</span>
              <span className="ml-2">
                {doctor.workingHours.start} - {doctor.workingHours.end}
              </span>
            </div>
            <div>
              <span className="font-semibold">Available Days:</span>
              <span className="ml-2">
                {doctor.workingHours.daysOfWeek
                  .map((day) => {
                    const dayNames = [
                      "Sun",
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                    ];
                    return dayNames[day];
                  })
                  .join(", ")}
              </span>
            </div>
          </div>
        </Card>

        {/* Date Selection */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Select Date</h2>

            {/* Date picker and navigation */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={handlePreviousDay}>
                ← Previous
              </Button>

              <input
                type="date"
                value={dateInputValue}
                onChange={handleMonthChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B6F47] focus:border-transparent"
              />

              <Button variant="outline" onClick={handleNextDay}>
                Next →
              </Button>
            </div>

            <p className="text-sm text-gray-600">
              {selectedDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </Card>

        {/* Schedule Grid */}
        <DoctorSchedule doctor={doctor} date={selectedDate} />
      </div>
    </div>
  );
}
