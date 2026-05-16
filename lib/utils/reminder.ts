import type { Appointment, Doctor } from "@/lib/store/scheduler";

/**
 * Reminder templates with placeholder support
 * Placeholders: {{PATIENT}}, {{DATE}}, {{TIME}}, {{DOCTOR}}, {{PROCEDURE}}
 */
export const REMINDER_TEMPLATES = {
  default:
    "Oi {{PATIENT}}, sua consulta é em {{DATE}} às {{TIME}} com Dr. {{DOCTOR}}. Confirmar presença?",
  followup:
    "Olá {{PATIENT}}, lembrete de sua consulta de acompanhamento em {{DATE}} às {{TIME}}.",
  procedure:
    "Oi {{PATIENT}}, preparação para {{PROCEDURE}} em {{DATE}} às {{TIME}} com {{DOCTOR}}.",
};

export type ReminderTemplate = keyof typeof REMINDER_TEMPLATES;

/**
 * Format date to Portuguese locale (e.g., "15 de maio")
 */
export function formatDatePT(date: Date): string {
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  return `${day} de ${month}`;
}

/**
 * Escape template injection characters to prevent SMS/WhatsApp injection attacks
 * Removes curly braces and other potentially dangerous characters from user input
 */
function escapeTemplate(text: string): string {
  return text.replace(/[{}]/g, '');
}

/**
 * Fill template with appointment and doctor data
 * User input (patientName, doctor.name) is escaped to prevent template injection
 */
export function fillTemplate(
  template: string,
  appointment: Appointment,
  doctor: Doctor
): string {
  let result = template;

  // Escape user input to prevent template injection
  const escapedPatientName = escapeTemplate(appointment.patientName);
  const escapedDoctorName = escapeTemplate(doctor.name);

  result = result.replace(/\{\{PATIENT\}\}/g, escapedPatientName);
  result = result.replace(/\{\{DATE\}\}/g, formatDatePT(appointment.date));
  result = result.replace(/\{\{TIME\}\}/g, appointment.timeStart);
  result = result.replace(/\{\{DOCTOR\}\}/g, escapedDoctorName);
  result = result.replace(
    /\{\{PROCEDURE\}\}/g,
    appointment.type === "procedure" ? "procedimento" : "consulta"
  );

  return result;
}

/**
 * Get sample filled template for preview
 */
export function getSampleFilledTemplate(
  templateKey: ReminderTemplate,
  appointmentType: "consultation" | "followup" | "procedure" = "consultation"
): string {
  const sampleAppointment: Appointment = {
    id: "sample",
    patientId: "sample",
    patientName: "Paciente",
    patientPhone: "+5585987654321",
    doctorId: "sample",
    doctorName: "Silva",
    date: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
    timeStart: "14:30",
    duration: 30,
    type: appointmentType,
    status: "scheduled",
    notes: "",
  };

  const sampleDoctor: Doctor = {
    id: "sample",
    name: "Dr. Silva",
    specialty: "Harmonização Facial",
    workingHours: {
      start: "09:00",
      end: "17:00",
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  };

  return fillTemplate(REMINDER_TEMPLATES[templateKey], sampleAppointment, sampleDoctor);
}
