/**
 * Scheduler utility functions for appointment management
 * - Conflict detection
 * - Available time slot calculation
 * - Doctor assignment validation
 */

import type { Appointment, Doctor } from "@/lib/store/scheduler";

/**
 * Parse time string in HH:MM format to minutes since midnight
 */
export function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Format minutes since midnight to HH:MM format
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Add minutes to a time string and return the result as HH:MM
 */
export function addMinutes(timeStr: string, minutesToAdd: number): string {
  const totalMinutes = parseTime(timeStr) + minutesToAdd;
  return formatTime(totalMinutes);
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if two time slots overlap
 * @param start1 - Start time of first slot (HH:MM format)
 * @param duration1 - Duration of first slot in minutes
 * @param start2 - Start time of second slot (HH:MM format)
 * @param duration2 - Duration of second slot in minutes
 * @returns true if time slots overlap
 */
export function isTimeConflict(
  start1: string,
  duration1: number,
  start2: string,
  duration2: number
): boolean {
  const end1 = parseTime(start1) + duration1;
  const end2 = parseTime(start2) + duration2;
  const startMin1 = parseTime(start1);
  const startMin2 = parseTime(start2);

  // Two intervals overlap if: start1 < end2 AND start2 < end1
  return startMin1 < end2 && startMin2 < end1;
}

/**
 * Check if a doctor can be assigned to a time slot
 * @param doctorId - Doctor ID
 * @param timeSlot - Time slot with date, start time, and duration
 * @param appointments - All appointments
 * @returns true if doctor can be assigned (no conflicts)
 */
export function canAssignDoctor(
  doctorId: string,
  timeSlot: { date: Date; start: string; duration: number },
  appointments: Appointment[]
): boolean {
  const conflicts = appointments.filter((apt) => {
    // Skip cancelled appointments
    if (apt.status === "cancelled") return false;

    // Must be same doctor and same day
    if (apt.doctorId !== doctorId) return false;
    if (!isSameDay(apt.date, timeSlot.date)) return false;

    // Check for time conflict
    return isTimeConflict(apt.timeStart, apt.duration, timeSlot.start, timeSlot.duration);
  });

  return conflicts.length === 0;
}

/**
 * Get available time slots for a doctor on a specific date
 * @param doctorId - Doctor ID
 * @param date - Date to check
 * @param slotDuration - Duration of each slot in minutes (default 30)
 * @param appointments - All appointments
 * @param doctors - All doctors
 * @returns Array of time slots with availability status
 */
export function getAvailableSlots(
  doctorId: string,
  date: Date,
  slotDuration: number = 30,
  appointments: Appointment[],
  doctors: Doctor[]
): Array<{ start: string; end: string; available: boolean }> {
  const doctor = doctors.find((d) => d.id === doctorId);
  if (!doctor) return [];

  // Check if the date is a working day for this doctor
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  if (!doctor.workingHours.daysOfWeek.includes(dayOfWeek)) {
    return [];
  }

  const slots: Array<{ start: string; end: string; available: boolean }> = [];
  const workStart = parseTime(doctor.workingHours.start);
  const workEnd = parseTime(doctor.workingHours.end);

  // Generate slots from start to end of working hours
  for (let time = workStart; time < workEnd; time += slotDuration) {
    const start = formatTime(time);
    const end = formatTime(time + slotDuration);

    const available = canAssignDoctor(
      doctorId,
      { date, start, duration: slotDuration },
      appointments
    );

    slots.push({ start, end, available });
  }

  return slots;
}

/**
 * Get all appointments for a doctor, optionally filtered by date
 */
export function getAppointmentsForDoctor(
  doctorId: string,
  date: Date | undefined,
  appointments: Appointment[]
): Appointment[] {
  const filtered = appointments.filter((apt) => apt.doctorId === doctorId);
  if (!date) return filtered;
  return filtered.filter((apt) => isSameDay(apt.date, date));
}

/**
 * Get availability summary for a doctor on a given date
 */
export function getDoctorAvailabilitySummary(
  doctorId: string,
  date: Date,
  appointments: Appointment[],
  doctors: Doctor[]
): { total: number; available: number; booked: number } {
  const slots = getAvailableSlots(doctorId, date, 30, appointments, doctors);
  const available = slots.filter((s) => s.available).length;
  return {
    total: slots.length,
    available,
    booked: slots.length - available,
  };
}
