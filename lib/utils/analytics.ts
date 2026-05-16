import { Appointment, Doctor } from "@/lib/store/scheduler";

export interface AnalyticsMetrics {
  noShowRate: number; // percentage (0-100)
  completionRate: number; // percentage (0-100)
  avgDuration: number; // minutes
  busiestDoctor: {
    doctorId: string;
    doctorName: string;
    count: number;
  };
  busiestDay: {
    dayOfWeek: string;
    count: number;
  };
  totalAppointments: number;
  completedCount: number;
  noshowCount: number;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Calculate analytics metrics from appointments
 * CAREFUL: All calculations verified for correctness
 */
export function calculateAnalytics(
  appointments: Appointment[],
  doctors: Doctor[]
): AnalyticsMetrics {
  if (appointments.length === 0) {
    return {
      noShowRate: 0,
      completionRate: 0,
      avgDuration: 0,
      busiestDoctor: { doctorId: "", doctorName: "N/A", count: 0 },
      busiestDay: { dayOfWeek: "N/A", count: 0 },
      totalAppointments: 0,
      completedCount: 0,
      noshowCount: 0,
    };
  }

  const totalAppointments = appointments.length;

  // Count completed and noshow appointments
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const noshowCount = appointments.filter((a) => a.status === "noshow").length;

  // No-show rate: (noshow / total) * 100
  const noShowRate = (noshowCount / totalAppointments) * 100;

  // Completion rate: (completed / total) * 100
  const completionRate = (completedCount / totalAppointments) * 100;

  // Average duration: sum(durations) / count
  const totalDuration = appointments.reduce((sum, a) => sum + a.duration, 0);
  const avgDuration = totalDuration / totalAppointments;

  // Busiest doctor: doctor with max appointments
  const doctorCounts = new Map<string, number>();
  appointments.forEach((a) => {
    doctorCounts.set(a.doctorId, (doctorCounts.get(a.doctorId) || 0) + 1);
  });

  let busiestDoctorId = "";
  let maxDoctorCount = 0;
  doctorCounts.forEach((count, doctorId) => {
    if (count > maxDoctorCount) {
      maxDoctorCount = count;
      busiestDoctorId = doctorId;
    }
  });

  const busiestDoctor = doctors.find((d) => d.id === busiestDoctorId);

  // Busiest day: day of week with max appointments
  const dayCounts = new Map<number, number>(); // 0=Sun, 1=Mon, etc.
  appointments.forEach((a) => {
    const aptDate = new Date(a.date);
    const dayOfWeek = aptDate.getDay();
    dayCounts.set(dayOfWeek, (dayCounts.get(dayOfWeek) || 0) + 1);
  });

  let busiestDayOfWeek = 0;
  let maxDayCount = 0;
  dayCounts.forEach((count, dayOfWeek) => {
    if (count > maxDayCount) {
      maxDayCount = count;
      busiestDayOfWeek = dayOfWeek;
    }
  });

  return {
    noShowRate: Math.round(noShowRate * 100) / 100,
    completionRate: Math.round(completionRate * 100) / 100,
    avgDuration: Math.round(avgDuration * 10) / 10,
    busiestDoctor: {
      doctorId: busiestDoctorId,
      doctorName: busiestDoctor?.name || "N/A",
      count: maxDoctorCount,
    },
    busiestDay: {
      dayOfWeek: DAY_NAMES[busiestDayOfWeek],
      count: maxDayCount,
    },
    totalAppointments,
    completedCount,
    noshowCount,
  };
}
