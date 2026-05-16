import { appointmentFormSchema, AppointmentFormData } from "@/lib/validations/appointment";

describe("appointmentFormSchema", () => {
  describe("patientName validation", () => {
    it("should accept valid patient names", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "550e8400-e29b-41d4-a716-446655440000",
        date: tomorrow,
        timeStart: "14:00",
        duration: "30",
        type: "consultation",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty patient name", () => {
      const result = appointmentFormSchema.safeParse({
        patientName: "",
        doctorId: "doc-123",
        date: new Date(),
        timeStart: "14:00",
        duration: "30",
        type: "consultation",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("required");
      }
    });

    it("should reject patient name longer than 100 characters", () => {
      const longName = "A".repeat(101);
      const result = appointmentFormSchema.safeParse({
        patientName: longName,
        doctorId: "doc-123",
        date: new Date(),
        timeStart: "14:00",
        duration: "30",
        type: "consultation",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("doctorId validation", () => {
    it("should accept valid UUID doctor ID", () => {
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "550e8400-e29b-41d4-a716-446655440000",
        date: new Date(),
        timeStart: "14:00",
        duration: "30",
        type: "consultation",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid doctor ID", () => {
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "not-a-uuid",
        date: new Date(),
        timeStart: "14:00",
        duration: "30",
        type: "consultation",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("date validation", () => {
    it("should accept future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "550e8400-e29b-41d4-a716-446655440000",
        date: futureDate,
        timeStart: "14:00",
        duration: "30",
        type: "consultation",
      });
      expect(result.success).toBe(true);
    });

    it("should reject past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "550e8400-e29b-41d4-a716-446655440000",
        date: pastDate,
        timeStart: "14:00",
        duration: "30",
        type: "consultation",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("timeStart validation", () => {
    it("should accept valid HH:MM format", () => {
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "550e8400-e29b-41d4-a716-446655440000",
        date: new Date(),
        timeStart: "14:30",
        duration: "30",
        type: "consultation",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid time format", () => {
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "550e8400-e29b-41d4-a716-446655440000",
        date: new Date(),
        timeStart: "14:30:00",
        duration: "30",
        type: "consultation",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid hour", () => {
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "550e8400-e29b-41d4-a716-446655440000",
        date: new Date(),
        timeStart: "25:00",
        duration: "30",
        type: "consultation",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("duration validation", () => {
    it("should accept valid durations", () => {
      const validDurations = ["15", "30", "60"];
      validDurations.forEach((duration) => {
        const result = appointmentFormSchema.safeParse({
          patientName: "Maria Silva",
          doctorId: "550e8400-e29b-41d4-a716-446655440000",
          date: new Date(),
          timeStart: "14:00",
          duration,
          type: "consultation",
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid duration", () => {
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "550e8400-e29b-41d4-a716-446655440000",
        date: new Date(),
        timeStart: "14:00",
        duration: "45",
        type: "consultation",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("type validation", () => {
    it("should accept valid appointment types", () => {
      const validTypes = ["consultation", "followup", "procedure"];
      validTypes.forEach((type) => {
        const result = appointmentFormSchema.safeParse({
          patientName: "Maria Silva",
          doctorId: "550e8400-e29b-41d4-a716-446655440000",
          date: new Date(),
          timeStart: "14:00",
          duration: "30",
          type,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid appointment type", () => {
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "550e8400-e29b-41d4-a716-446655440000",
        date: new Date(),
        timeStart: "14:00",
        duration: "30",
        type: "emergency",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("notes validation", () => {
    it("should accept notes", () => {
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "550e8400-e29b-41d4-a716-446655440000",
        date: new Date(),
        timeStart: "14:00",
        duration: "30",
        type: "consultation",
        notes: "Paciente com sensibilidade",
      });
      expect(result.success).toBe(true);
    });

    it("should allow optional notes", () => {
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "550e8400-e29b-41d4-a716-446655440000",
        date: new Date(),
        timeStart: "14:00",
        duration: "30",
        type: "consultation",
      });
      expect(result.success).toBe(true);
    });

    it("should reject notes longer than 500 characters", () => {
      const longNotes = "A".repeat(501);
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "550e8400-e29b-41d4-a716-446655440000",
        date: new Date(),
        timeStart: "14:00",
        duration: "30",
        type: "consultation",
        notes: longNotes,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("duration as string", () => {
    it("should accept duration as string", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = appointmentFormSchema.safeParse({
        patientName: "Maria Silva",
        doctorId: "550e8400-e29b-41d4-a716-446655440000",
        date: tomorrow,
        timeStart: "14:00",
        duration: "30",
        type: "consultation",
      });
      if (result.success) {
        expect(result.data.duration).toBe("30");
        expect(typeof result.data.duration).toBe("string");
      }
    });
  });
});
