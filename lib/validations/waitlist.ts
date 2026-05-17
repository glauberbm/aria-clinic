import { z } from "zod";

export const waitlistFormSchema = z.object({
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

  doctorId: z
    .string()
    .uuid("Invalid doctor")
    .optional()
    .nullable(),

  requestedDate: z
    .date({ message: "Date required" })
    .refine(
      (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      "Cannot request past date"
    )
    .optional()
    .nullable(),

  requestedTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)")
    .refine((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
    }, "Invalid time")
    .optional()
    .nullable(),
});

export type WaitlistFormData = z.infer<typeof waitlistFormSchema>;
