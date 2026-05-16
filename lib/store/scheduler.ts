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

// Waitlist types
export type WaitlistEntryStatus = "pending" | "offered" | "accepted" | "declined";

export interface OfferedSlot {
  date: Date;
  time: string;
  doctorId: string;
}

export interface WaitlistEntry {
  id: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  requestedDate?: Date;
  requestedTime?: string;
  status: WaitlistEntryStatus;
  addedAt: number;
  offeredSlot?: OfferedSlot;
  acceptedAppointmentId?: string;
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

// Mock appointments - 100+ appointments across past 90 days + 30 future days
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
    "Joana Silva",
    "Keila Costa",
    "Laura Santos",
    "Monica Oliveira",
    "Nina Pereira",
  ];

  const appointmentTypes: AppointmentType[] = [
    "consultation",
    "followup",
    "procedure",
  ];

  // Mix of statuses including completed and noshow for history
  const pastStatuses: AppointmentStatus[] = [
    "completed",
    "completed",
    "completed",
    "confirmed",
    "cancelled",
    "noshow",
  ];

  const futureStatuses: AppointmentStatus[] = [
    "scheduled",
    "confirmed",
    "scheduled",
  ];

  const durations: (15 | 30 | 60)[] = [15, 30, 60];

  let appointmentCount = 0;

  // Generate PAST appointments (90 days back)
  for (let day = -90; day < 0 && appointmentCount < 110; day++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + day);

    // Skip weekends for simplicity
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      continue;
    }

    // 1-3 appointments per day for history
    const aptsPerDay = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < aptsPerDay && appointmentCount < 110; i++) {
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
        status: pastStatuses[Math.floor(Math.random() * pastStatuses.length)],
        notes:
          Math.random() > 0.7
            ? "Paciente com histórico de sensibilidade"
            : "",
      });
      appointmentCount++;
    }
  }

  // Generate FUTURE appointments (30 days forward)
  for (let day = 0; day < 30; day++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + day);

    // Skip weekends for simplicity
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      continue;
    }

    // 0-2 appointments per day
    const aptsPerDay = Math.floor(Math.random() * 3);
    for (let i = 0; i < aptsPerDay && appointmentCount < 140; i++) {
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
        status: futureStatuses[Math.floor(Math.random() * futureStatuses.length)],
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
  waitlist: WaitlistEntry[];

  // UI
  selectedMonth: Date;
  selectedDate: Date | null;

  // Mutations
  addAppointment: (apt: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
  addToWaitlist: (entry: Omit<WaitlistEntry, "id" | "addedAt">) => WaitlistEntry;
  updateWaitlistEntry: (id: string, updates: Partial<WaitlistEntry>) => void;
  removeFromWaitlist: (id: string) => void;
  setReminderSettings: (settings: Partial<ReminderSettings>) => void;
  sendReminder: (appointmentId: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;

  // Selectors
  getAppointmentsForDate: (date: Date) => Appointment[];
  getAppointmentsForMonth: (date: Date) => Appointment[];
  getDoctorById: (id: string) => Doctor | undefined;
  getAvailableSlots: (doctorId: string, date: Date, duration?: number) => Array<{ start: string; end: string; available: boolean }>;
  getAppointmentsForDoctor: (doctorId: string, date?: Date) => Appointment[];
  getNextWaitlistPatient: () => WaitlistEntry | null;
  getWaitlistByStatus: (status: WaitlistEntryStatus) => WaitlistEntry[];
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
  waitlist: [],
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

  addToWaitlist: (entry) => {
    const newEntry: WaitlistEntry = {
      ...entry,
      id: uuid(),
      addedAt: Date.now(),
    };
    set((state) => ({
      waitlist: [...state.waitlist, newEntry],
    }));
    return newEntry;
  },

  updateWaitlistEntry: (id, updates) => {
    set((state) => ({
      waitlist: state.waitlist.map((entry) =>
        entry.id === id ? { ...entry, ...updates } : entry
      ),
    }));
  },

  removeFromWaitlist: (id) => {
    set((state) => ({
      waitlist: state.waitlist.filter((entry) => entry.id !== id),
    }));
  },

  getNextWaitlistPatient: () => {
    const state = get();
    const next = state.waitlist
      .filter((w) => w.status === "pending")
      .sort((a, b) => a.addedAt - b.addedAt)[0];
    return next || null;
  },

  getWaitlistByStatus: (status) => {
    const state = get();
    return state.waitlist
      .filter((w) => w.status === status)
      .sort((a, b) => a.addedAt - b.addedAt);
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
