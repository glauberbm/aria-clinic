"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  date: Date;
  doctorId: string;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  availableSlots: TimeSlot[];
  disabled?: boolean;
}

export function TimeSlotPicker({
  date,
  selectedTime,
  onSelectTime,
  availableSlots,
  disabled = false,
}: TimeSlotPickerProps) {
  const allSlotsUnavailable = availableSlots.every((slot) => !slot.available);

  return (
    <div className="space-y-2">
      <label htmlFor="timeStart" className="text-sm font-medium">Time Start</label>
      <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
        {availableSlots.map((slot) => (
          <Button
            key={slot.start}
            type="button"
            id={slot.available ? undefined : "time-slot-unavailable"}
            variant={selectedTime === slot.start ? "default" : "outline"}
            disabled={!slot.available || disabled}
            onClick={() => onSelectTime(slot.start)}
            className="text-sm"
          >
            {slot.start}
          </Button>
        ))}
      </div>
      {allSlotsUnavailable && (
        <p className="text-sm text-amber-600">
          No available slots for this doctor on {format(date, "MMM dd")}.
          <button className="underline ml-1">Add to waitlist?</button>
        </p>
      )}
    </div>
  );
}
