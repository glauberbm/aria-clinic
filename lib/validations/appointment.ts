import { z } from "zod";

export const appointmentFormSchema = z.object({
  patientName: z
    .string()
    .min(1, "Patient name required")
    .max(100, "Patient name too long"),

  patientPhone: z
    .string()
    .optional()
    .refine(
      (phone) => !phone || /^\+55\d{10,11}$/.test(phone),
      "Invalid Brazilian phone number (format: +55XXXXXXXXXXX)"
    ),

  doctorId: z.string().uuid("Invalid doctor"),

  date: z.date({ message: "Date required" }).refine(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    "Cannot schedule in past"
  ),

  timeStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)")
    .refine((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }, "Invalid time"),

  duration: z
    .enum(["15", "30", "60"], { message: "Invalid duration" }),

  type: z.enum(["consultation", "followup", "procedure"], {
    message: "Invalid appointment type",
  }),

  notes: z
    .string()
    .max(500, "Notes too long")
    .default(""),
});

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

// Helper to convert form data to appointment data
export function convertFormDataToAppointment(data: AppointmentFormData) {
  return {
    ...data,
    duration: parseInt(data.duration, 10) as 15 | 30 | 60,
  };
}
