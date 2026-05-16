import { create } from "zustand";
import { v4 as uuid } from "uuid";
import { getAvailableSlots, getAppointmentsForDoctor } from "@/lib/utils/scheduler";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "noshow";
export type AppointmentType = "consultation" | "followup" | "procedure";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string; // WhatsApp phone number (format: +55XXXXXXXXXXX)
  doctorId: string;
  doctorName: string;
  date: Date;
  timeStart: string; // HH:MM format
  duration: 15 | 30 | 60; // minutes
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
    daysOfWeek: number[]; // [1, 2, 3, 4, 5] = Mon-Fri
  };
}

// Mock doctors
const MOCK_DOCTORS: Doctor[] = [
  {
    id: uuid(),
    name: "Dra. Amanda Silva",
    specialty: "Harmonização Facial",
    workingHours: {
      start: "09:00",
      end: "17:00",
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  },
  {
    id: uuid(),
    name: "Dr. Carlos Mendes",
    specialty: "Botox & Preenchimento",
    workingHours: {
      start: "10:00",
      end: "18:00",
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  },
  {
    id: uuid(),
    name: "Dra. Beatriz Costa",
    specialty: "Limpeza de Pele",
    workingHours: {
      start: "09:00",
      end: "17:00",
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  },
  {
    id: uuid(),
    name: "Dr. Felipe Santos",
    specialty: "Microagulhamento",
    workingHours: {
      start: "14:00",
      end: "19:00",
      daysOfWeek: [2, 3, 4, 5, 6],
    },
  },
  {
    id: uuid(),
    name: "Dra. Isabela Rocha",
    specialty: "Peelings Químicos",
    workingHours: {
      start: "09:00",
      end: "17:00",
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  },
];

// Mock phone numbers for testing WhatsApp integration
const MOCK_PATIENT_PHONES = [
  "+5585987654321",
  "+5585987654322",
  "+5585987654323",
  "+5585987654324",
  "+5585987654325",
  "+5585987654326",
  "+5585987654327",
  "+5585987654328",
  "+5585987654329",
  "+5585987654330",
  "+5585987654331",
  "+5585987654332",
  "+5585987654333",
  "+5585987654334",
  "+5585987654335",
];

// Mock appointments - 25 appointments across 30 days starting from today
const generateMockAppointments = (): Appointment[] => {
  const today = new Date();
  const appointments: Appointment[] = [];
  const patientNames = [
    "Maria Silva",
    "Ana Costa",
    "Patricia Oliveira",
    "Fernanda Souza",
    "Juliana Martins",
    "Camila Santos",
    "Marina Gomes",
    "Beatriz Alves",
    "Carla Ribeiro",
    "Daniela Ferreira",
    "Elena Pereira",
    "Flavia Rocha",
    "Gabriela Dias",
    "Helena Lima",
    "Iris Nascimento",
  ];

  const appointmentTypes: AppointmentType[] = [
    "consultation",
    "followup",
    "procedure",
  ];
  const statuses: AppointmentStatus[] = [
    "scheduled",
    "confirmed",
    "completed",
  ];
  const durations: (15 | 30 | 60)[] = [15, 30, 60];

  let appointmentCount = 0;
  for (let day = 0; day < 30 && appointmentCount < 25; day++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + day);

    // Skip weekends for simplicity
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      continue;
    }

    // 0-2 appointments per day
    const aptsPerDay = Math.floor(Math.random() * 3);
    for (let i = 0; i < aptsPerDay && appointmentCount < 25; i++) {
      const doctor = MOCK_DOCTORS[Math.floor(Math.random() * MOCK_DOCTORS.length)];
      const hour = 9 + Math.floor(Math.random() * 8); // 9:00 - 17:00
      const minute = Math.random() > 0.5 ? 30 : 0;
      const timeStart = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

      appointments.push({
        id: uuid(),
        patientId: uuid(),
        patientName:
          patientNames[Math.floor(Math.random() * patientNames.length)],
        patientPhone:
          MOCK_PATIENT_PHONES[Math.floor(Math.random() * MOCK_PATIENT_PHONES.length)],
        doctorId: doctor.id,
        doctorName: doctor.name,
        date: new Date(currentDate),
        timeStart,
        duration: durations[Math.floor(Math.random() * durations.length)],
        type: appointmentTypes[
          Math.floor(Math.random() * appointmentTypes.length)
        ],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        notes:
          Math.random() > 0.7
            ? "Paciente com histórico de sensibilidade"
            : "",
      });
      appointmentCount++;
    }
  }

  return appointments;
};

const MOCK_APPOINTMENTS = generateMockAppointments();

export interface ReminderSettings {
  enabled: boolean;
  timings: {
    dayBefore: boolean;  // 24h before
    hourBefore: boolean; // 1h before
  };
}

export interface ReminderHistory {
  id: string;
  appointmentId: string;
  patientName: string;
  timestamp: Date;
  status: "sent" | "failed";
  messageId?: string;
  error?: string;
}

interface SchedulerStore {
  // Data
  appointments: Appointment[];
  doctors: Doctor[];
  reminderSettings: ReminderSettings;
  reminderHistory: ReminderHistory[];

  // UI
  selectedMonth: Date;
  selectedDate: Date | null;

  // Mutations
  addAppointment: (apt: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
  setReminderSettings: (settings: Partial<ReminderSettings>) => void;
  sendReminder: (appointmentId: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;

  // Selectors
  getAppointmentsForDate: (date: Date) => Appointment[];
  getAppointmentsForMonth: (date: Date) => Appointment[];
  getDoctorById: (id: string) => Doctor | undefined;
  getAvailableSlots: (doctorId: string, date: Date, duration?: number) => Array<{ start: string; end: string; available: boolean }>;
  getAppointmentsForDoctor: (doctorId: string, date?: Date) => Appointment[];
}

export const useScheduler = create<SchedulerStore>((set, get) => ({
  appointments: MOCK_APPOINTMENTS,
  doctors: MOCK_DOCTORS,
  reminderSettings: {
    enabled: true,
    timings: {
      dayBefore: true,
      hourBefore: true,
    },
  },
  reminderHistory: [],
  selectedMonth: new Date(),
  selectedDate: null,

  addAppointment: (apt) => {
    const newAppointment: Appointment = {
      ...apt,
      id: uuid(),
    };
    set((state) => ({
      appointments: [...state.appointments, newAppointment],
    }));
    return newAppointment;
  },

  updateAppointment: (id, updates) => {
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === id ? { ...apt, ...updates } : apt
      ),
    }));
  },

  cancelAppointment: (id) => {
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === id ? { ...apt, status: "cancelled" } : apt
      ),
    }));
  },

  getAppointmentsForDate: (date) => {
    const state = get();
    return state.appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return (
        aptDate.getFullYear() === date.getFullYear() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getDate() === date.getDate()
      );
    });
  },

  getAppointmentsForMonth: (date) => {
    const state = get();
    return state.appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return (
        aptDate.getFullYear() === date.getFullYear() &&
        aptDate.getMonth() === date.getMonth()
      );
    });
  },

  getDoctorById: (id) => {
    const state = get();
    return state.doctors.find((doctor) => doctor.id === id);
  },

  getAvailableSlots: (doctorId, date, duration = 30) => {
    const state = get();
    return getAvailableSlots(doctorId, date, duration, state.appointments, state.doctors);
  },

  getAppointmentsForDoctor: (doctorId, date) => {
    const state = get();
    return getAppointmentsForDoctor(doctorId, date, state.appointments);
  },

  setReminderSettings: (settings) => {
    set((state) => ({
      reminderSettings: {
        ...state.reminderSettings,
        ...settings,
        timings: settings.timings
          ? { ...state.reminderSettings.timings, ...settings.timings }
          : state.reminderSettings.timings,
      },
    }));
  },

  sendReminder: async (appointmentId) => {
    const state = get();
    const appointment = state.appointments.find((a) => a.id === appointmentId);

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    const doctor = state.doctors.find((d) => d.id === appointment.doctorId);
    if (!doctor) {
      return { success: false, error: "Doctor not found" };
    }

    // Mock WhatsApp send with 500ms delay
    try {
      const result = await new Promise<{ status: "sent"; messageId: string }>((resolve) => {
        setTimeout(() => {
          resolve({ status: "sent", messageId: `mock-${Date.now()}` });
        }, 500);
      });

      // Add to history
      const historyEntry: ReminderHistory = {
        id: uuid(),
        appointmentId,
        patientName: appointment.patientName,
        timestamp: new Date(),
        status: "sent",
        messageId: result.messageId,
      };

      set((state) => ({
        reminderHistory: [historyEntry, ...state.reminderHistory],
      }));

      return { success: true, messageId: result.messageId };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      const historyEntry: ReminderHistory = {
        id: uuid(),
        appointmentId,
        patientName: appointment.patientName,
        timestamp: new Date(),
        status: "failed",
        error: errorMsg,
      };

      set((state) => ({
        reminderHistory: [historyEntry, ...state.reminderHistory],
      }));

      return { success: false, error: errorMsg };
    }
  },
}));
