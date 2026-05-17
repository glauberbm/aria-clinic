"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Save, X } from "lucide-react";
import { appointmentFormSchema, AppointmentFormData } from "@/lib/validations/appointment";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { canAssignDoctor, getAvailableSlots } from "@/lib/utils/scheduler";
import type { Appointment, Doctor } from "@/lib/store/scheduler";

interface AppointmentFormProps {
  initialData?: Appointment;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  doctors: Doctor[];
  appointments: Appointment[];
  isLoading?: boolean;
  onCancel?: () => void;
  onConflict?: () => void;
}

export function AppointmentForm({
  initialData,
  onSubmit,
  doctors,
  appointments,
  isLoading = false,
  onCancel,
  onConflict,
}: AppointmentFormProps) {
  const [showWaitlistPrompt, setShowWaitlistPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<AppointmentFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(appointmentFormSchema) as any,
    defaultValues: (initialData
      ? {
          patientName: initialData.patientName,
          doctorId: initialData.doctorId,
          date: initialData.date,
          timeStart: initialData.timeStart,
          duration: String(initialData.duration),
          type: initialData.type,
          notes: initialData.notes,
        }
      : {
          duration: "30",
          type: "consultation",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any,
  });

  const selectedDate = watch("date");
  const selectedDoctorId = watch("doctorId");
  const selectedDuration = watch("duration");
  const selectedTime = watch("timeStart");

  // Compute available slots in real-time
  const availableSlots =
    selectedDoctorId && selectedDate && selectedDuration
      ? getAvailableSlots(
          selectedDoctorId,
          selectedDate,
          parseInt(selectedDuration),
          appointments,
          doctors
        )
      : [];

  const handleSubmit2 = async (data: AppointmentFormData) => {
    setError(null);
    setShowWaitlistPrompt(false);

    // Check if doctor exists
    const doctor = doctors.find((d) => d.id === data.doctorId);
    if (!doctor) {
      setError("Doctor not found");
      return;
    }

    // Check for conflicts
    const canAssign = canAssignDoctor(
      data.doctorId,
      {
        date: data.date,
        start: data.timeStart,
        duration: parseInt(data.duration, 10),
      },
      appointments.filter((apt) => apt.id !== initialData?.id) // Exclude current appointment if editing
    );

    if (!canAssign) {
      setShowWaitlistPrompt(true);
      onConflict?.();
      return;
    }

    try {
      await onSubmit(data);
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save appointment";
      setError(message);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {showWaitlistPrompt && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-amber-900">
                All doctors busy for this time slot
              </p>
              <p className="text-sm text-amber-800">
                Would you like to add this patient to the waitlist?
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-l-4 border-l-[#8B6F47]">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(handleSubmit2)} className="space-y-6">
            {/* Patient Name */}
            <div>
              <label htmlFor="patientName" className="text-sm font-medium">
                Patient Name *
              </label>
              <input
                {...register("patientName")}
                id="patientName"
                type="text"
                placeholder="Ex: Maria Silva"
                className="w-full px-4 py-2 mt-1 border rounded-lg text-sm"
              />
              {errors.patientName && (
                <p className="text-red-600 text-xs mt-1">{errors.patientName.message}</p>
              )}
            </div>

            {/* Doctor Dropdown */}
            <div>
              <label htmlFor="doctorId" className="text-sm font-medium">
                Doctor *
              </label>
              <select
                {...register("doctorId")}
                id="doctorId"
                className="w-full px-4 py-2 mt-1 border rounded-lg text-sm"
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
              {errors.doctorId && (
                <p className="text-red-600 text-xs mt-1">{errors.doctorId.message}</p>
              )}
            </div>

            {/* Date Picker */}
            <div>
              <label htmlFor="date" className="text-sm font-medium">
                Date *
              </label>
              <input
                {...register("date", {
                  setValueAs: (value) => {
                    if (typeof value === "string") {
                      return new Date(value);
                    }
                    return value;
                  },
                })}
                id="date"
                type="date"
                className="w-full px-4 py-2 mt-1 border rounded-lg text-sm"
              />
              {errors.date && (
                <p className="text-red-600 text-xs mt-1">{errors.date.message}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm font-medium">Duration (minutes) *</label>
              <div className="flex gap-3 mt-2">
                {["15", "30", "60"].map((duration) => (
                  <label key={duration} className="flex items-center gap-2">
                    <input
                      {...register("duration")}
                      type="radio"
                      value={duration}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{duration} min</span>
                  </label>
                ))}
              </div>
              {errors.duration && (
                <p className="text-red-600 text-xs mt-1">{errors.duration.message}</p>
              )}
            </div>

            {/* Time Slot Picker */}
            {selectedDate && selectedDoctorId && selectedDuration && (
              <div>
                <TimeSlotPicker
                  date={selectedDate}
                  doctorId={selectedDoctorId}
                  selectedTime={selectedTime}
                  onSelectTime={(time) => setValue("timeStart", time)}
                  availableSlots={availableSlots}
                  disabled={isLoading}
                />
                {errors.timeStart && (
                  <p className="text-red-600 text-xs mt-1">{errors.timeStart.message}</p>
                )}
              </div>
            )}

            {/* Appointment Type */}
            <div>
              <label htmlFor="type" className="text-sm font-medium">
                Appointment Type *
              </label>
              <select
                {...register("type")}
                id="type"
                className="w-full px-4 py-2 mt-1 border rounded-lg text-sm"
              >
                <option value="consultation">Consultation</option>
                <option value="followup">Follow-up</option>
                <option value="procedure">Procedure</option>
              </select>
              {errors.type && (
                <p className="text-red-600 text-xs mt-1">{errors.type.message}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="text-sm font-medium">
                Notes
              </label>
              <textarea
                {...register("notes")}
                id="notes"
                placeholder="Add any relevant notes (optional)"
                rows={3}
                className="w-full px-4 py-2 mt-1 border rounded-lg text-sm"
              />
              {errors.notes && (
                <p className="text-red-600 text-xs mt-1">{errors.notes.message}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 flex items-center gap-2"
                style={{ backgroundColor: "#8B6F47", color: "white" }}
              >
                <Save size={16} />
                {isLoading
                  ? "Saving..."
                  : initialData
                    ? "Update"
                    : "Create"} Appointment
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="ghost"
                  className="px-6 py-2"
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
