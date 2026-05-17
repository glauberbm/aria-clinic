import { describe, it, expect } from "@jest/globals";
import {
  fillTemplate,
  getSampleFilledTemplate,
  formatDatePT,
  REMINDER_TEMPLATES,
  type ReminderTemplate,
} from "../reminder";
import type { Appointment, Doctor } from "@/lib/store/scheduler";

describe("Reminder Utilities", () => {
  const mockAppointment: Appointment = {
    id: "apt-1",
    patientId: "pat-1",
    patientName: "Maria Silva",
    patientPhone: "+5585987654321",
    doctorId: "doc-1",
    doctorName: "Silva",
    date: new Date("2024-05-20"),
    timeStart: "14:30",
    duration: 30,
    type: "consultation",
    status: "scheduled",
    notes: "",
  };

  const mockDoctor: Doctor = {
    id: "doc-1",
    name: "Dr. Carlos Silva",
    specialty: "Harmonização Facial",
    workingHours: {
      start: "09:00",
      end: "17:00",
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  };

  describe("formatDatePT", () => {
    it("should format date to Portuguese locale", () => {
      const date = new Date("2024-05-20");
      const result = formatDatePT(date);
      expect(result).toMatch(/\d+ de \w+/);
      expect(result).toContain("maio");
    });

    it("should handle different months", () => {
      const dates = [
        { date: new Date("2024-01-15"), month: "janeiro" },
        { date: new Date("2024-02-15"), month: "fevereiro" },
        { date: new Date("2024-12-25"), month: "dezembro" },
      ];

      dates.forEach(({ date, month }) => {
        expect(formatDatePT(date)).toContain(month);
      });
    });
  });

  describe("fillTemplate", () => {
    it("should replace {{PATIENT}} placeholder", () => {
      const template = "Oi {{PATIENT}}!";
      const result = fillTemplate(template, mockAppointment, mockDoctor);
      expect(result).toBe("Oi Maria Silva!");
    });

    it("should replace {{DATE}} placeholder", () => {
      const template = "Data: {{DATE}}";
      const result = fillTemplate(template, mockAppointment, mockDoctor);
      expect(result).toContain("Data: ");
      expect(result).toContain("maio");
    });

    it("should replace {{TIME}} placeholder", () => {
      const template = "Horário: {{TIME}}";
      const result = fillTemplate(template, mockAppointment, mockDoctor);
      expect(result).toBe("Horário: 14:30");
    });

    it("should replace {{DOCTOR}} placeholder", () => {
      const template = "com {{DOCTOR}}";
      const result = fillTemplate(template, mockAppointment, mockDoctor);
      expect(result).toBe("com Dr. Carlos Silva");
    });

    it("should replace {{PROCEDURE}} for consultation type", () => {
      const template = "Preparação para {{PROCEDURE}}";
      const result = fillTemplate(
        template,
        { ...mockAppointment, type: "consultation" },
        mockDoctor
      );
      expect(result).toBe("Preparação para consulta");
    });

    it("should replace {{PROCEDURE}} for procedure type", () => {
      const template = "Preparação para {{PROCEDURE}}";
      const result = fillTemplate(
        template,
        { ...mockAppointment, type: "procedure" },
        mockDoctor
      );
      expect(result).toBe("Preparação para procedimento");
    });

    it("should fill default template correctly", () => {
      const result = fillTemplate(REMINDER_TEMPLATES.default, mockAppointment, mockDoctor);
      expect(result).toContain("Maria Silva");
      expect(result).toContain("14:30");
      expect(result).toContain("Dr. Carlos Silva");
    });

    it("should fill followup template correctly", () => {
      const result = fillTemplate(
        REMINDER_TEMPLATES.followup,
        { ...mockAppointment, type: "followup" },
        mockDoctor
      );
      expect(result).toContain("Maria Silva");
      expect(result).toContain("acompanhamento");
    });

    it("should fill procedure template correctly", () => {
      const result = fillTemplate(
        REMINDER_TEMPLATES.procedure,
        { ...mockAppointment, type: "procedure" },
        mockDoctor
      );
      expect(result).toContain("Maria Silva");
      expect(result).toContain("procedimento");
      expect(result).toContain("Dr. Carlos Silva");
    });

    it("should replace all occurrences of a placeholder", () => {
      const template = "{{PATIENT}} ligar para {{PATIENT}}";
      const result = fillTemplate(template, mockAppointment, mockDoctor);
      expect(result).toBe("Maria Silva ligar para Maria Silva");
    });

    it("should handle missing placeholders gracefully", () => {
      const template = "Teste {{UNKNOWN}}";
      const result = fillTemplate(template, mockAppointment, mockDoctor);
      expect(result).toContain("{{UNKNOWN}}");
    });
  });

  describe("getSampleFilledTemplate", () => {
    it("should return a string for default template", () => {
      const result = getSampleFilledTemplate("default");
      expect(typeof result).toBe("string");
      expect(result).toContain("Paciente");
      expect(result).toContain("14:30");
    });

    it("should return a string for all templates", () => {
      const templates: ReminderTemplate[] = ["default", "followup", "procedure"];
      templates.forEach((template) => {
        const result = getSampleFilledTemplate(template);
        expect(typeof result).toBe("string");
        expect(result.length > 0).toBe(true);
      });
    });

    it("should show procedure type correctly", () => {
      const result = getSampleFilledTemplate("procedure", "procedure");
      expect(result).toContain("procedimento");
    });

    it("should not contain unresolved placeholders", () => {
      const result = getSampleFilledTemplate("default");
      expect(result).not.toContain("{{");
      expect(result).not.toContain("}}");
    });
  });

  describe("REMINDER_TEMPLATES", () => {
    it("should have default template", () => {
      expect(REMINDER_TEMPLATES.default).toBeDefined();
      expect(REMINDER_TEMPLATES.default).toContain("{{PATIENT}}");
    });

    it("should have followup template", () => {
      expect(REMINDER_TEMPLATES.followup).toBeDefined();
      expect(REMINDER_TEMPLATES.followup).toContain("{{PATIENT}}");
    });

    it("should have procedure template", () => {
      expect(REMINDER_TEMPLATES.procedure).toBeDefined();
      expect(REMINDER_TEMPLATES.procedure).toContain("{{PATIENT}}");
    });

    it("should all contain required placeholders", () => {
      Object.values(REMINDER_TEMPLATES).forEach((template) => {
        expect(template).toContain("{{PATIENT}}");
      });
    });
  });
});
