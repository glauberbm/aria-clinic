import { z } from 'zod';

export const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  date: z.date().min(new Date(new Date().setHours(0, 0, 0, 0)), 'Date cannot be in the past'),
  timeStart: z.string().regex(/^\d{2}:\d{2}$/, 'Time format must be HH:MM'),
  duration: z.enum(['15', '30', '60']),
  appointmentType: z.enum(['consultation', 'followup', 'check-in']),
  notes: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const mockDoctors = [
  { id: 'doc-001', name: 'Dr. Silva', specialty: 'General Medicine' },
  { id: 'doc-002', name: 'Dr. Santos', specialty: 'Cardiology' },
  { id: 'doc-003', name: 'Dr. Oliveira', specialty: 'Dermatology' },
  { id: 'doc-004', name: 'Dr. Costa', specialty: 'Pediatrics' },
  { id: 'doc-005', name: 'Dr. Ferreira', specialty: 'Orthopedics' },
];

export const mockPatients = [
  { id: 'pat-001', name: 'João Silva' },
  { id: 'pat-002', name: 'Maria Santos' },
  { id: 'pat-003', name: 'Pedro Oliveira' },
  { id: 'pat-004', name: 'Ana Costa' },
  { id: 'pat-005', name: 'Carlos Ferreira' },
];

export const mockAppointments = [
  {
    id: 'apt-001',
    patientId: 'pat-001',
    doctorId: 'doc-001',
    date: new Date(2026, 4, 20),
    timeStart: '10:00',
    duration: '30',
    appointmentType: 'consultation',
    notes: 'Initial consultation',
  },
  {
    id: 'apt-002',
    patientId: 'pat-002',
    doctorId: 'doc-002',
    date: new Date(2026, 4, 20),
    timeStart: '14:00',
    duration: '60',
    appointmentType: 'followup',
    notes: 'Cardiac follow-up',
  },
];

export function isDoctorDoubleBooked(doctorId: string, date: Date, timeStart: string, duration: string, excludeId?: string): boolean {
  const newStart = parseInt(timeStart.split(':')[0]) * 60 + parseInt(timeStart.split(':')[1]);
  const newEnd = newStart + parseInt(duration);

  return mockAppointments.some(apt => {
    if (excludeId && apt.id === excludeId) return false;
    if (apt.doctorId !== doctorId) return false;
    if (apt.date.getTime() !== date.getTime()) return false;

    const existingStart = parseInt(apt.timeStart.split(':')[0]) * 60 + parseInt(apt.timeStart.split(':')[1]);
    const existingEnd = existingStart + parseInt(apt.duration);

    return !(newEnd <= existingStart || newStart >= existingEnd);
  });
}
