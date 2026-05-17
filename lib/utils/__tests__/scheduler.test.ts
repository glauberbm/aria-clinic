import {
  parseTime,
  formatTime,
  addMinutes,
  isSameDay,
  isTimeConflict,
  canAssignDoctor,
  getAvailableSlots,
  getDoctorAvailabilitySummary,
} from "../scheduler";
import type { Appointment, Doctor } from "@/lib/store/scheduler";

// Helper to create a date that's definitely a specific day of week
// 2024-01-08 is a Sunday (day 0), 2024-01-09 is Monday (day 1), etc.
const createDateForDayOfWeek = (dayOfWeek: number, extraDays: number = 0): Date => {
  const date = new Date("2024-01-08"); // Start with a Sunday
  date.setDate(date.getDate() + dayOfWeek + extraDays);
  return date;
};

describe("Scheduler Utilities", () => {
  describe("parseTime", () => {
    it("parses time string to minutes", () => {
      expect(parseTime("09:00")).toBe(540); // 9 * 60
      expect(parseTime("17:30")).toBe(1050); // 17 * 60 + 30
      expect(parseTime("00:00")).toBe(0);
    });
  });

  describe("formatTime", () => {
    it("formats minutes to time string", () => {
      expect(formatTime(540)).toBe("09:00"); // 9 * 60
      expect(formatTime(1050)).toBe("17:30"); // 17 * 60 + 30
      expect(formatTime(0)).toBe("00:00");
    });
  });

  describe("addMinutes", () => {
    it("adds minutes to time string", () => {
      expect(addMinutes("09:00", 30)).toBe("09:30");
      expect(addMinutes("09:30", 30)).toBe("10:00");
      expect(addMinutes("17:00", 60)).toBe("18:00");
    });
  });

  describe("isSameDay", () => {
    it("returns true if dates are on same day", () => {
      const date1 = new Date("2024-01-15T09:00:00");
      const date2 = new Date("2024-01-15T17:00:00");
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it("returns false if dates are on different days", () => {
      const date1 = new Date("2024-01-15T09:00:00");
      const date2 = new Date("2024-01-16T09:00:00");
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe("isTimeConflict", () => {
    it("detects overlapping time slots", () => {
      // 09:00-09:30 overlaps with 09:15-09:45
      expect(isTimeConflict("09:00", 30, "09:15", 30)).toBe(true);
    });

    it("detects contained time slots", () => {
      // 09:00-10:00 contains 09:15-09:45
      expect(isTimeConflict("09:00", 60, "09:15", 30)).toBe(true);
    });

    it("returns false for adjacent time slots", () => {
      // 09:00-09:30 and 09:30-10:00 don't overlap
      expect(isTimeConflict("09:00", 30, "09:30", 30)).toBe(false);
    });

    it("returns false for non-overlapping time slots", () => {
      // 09:00-09:30 and 10:00-10:30 don't overlap
      expect(isTimeConflict("09:00", 30, "10:00", 30)).toBe(false);
    });

    it("detects when first slot is contained", () => {
      // 09:15-09:45 is contained in 09:00-10:00
      expect(isTimeConflict("09:15", 30, "09:00", 60)).toBe(true);
    });
  });

  describe("canAssignDoctor", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const doctor: Doctor = {
      id: "doc-1",
      name: "Dr. Test",
      specialty: "Test Specialty",
      workingHours: {
        start: "09:00",
        end: "17:00",
        daysOfWeek: [1, 2, 3, 4, 5],
      },
    };

    const testDate = createDateForDayOfWeek(1); // Monday (day 1)

    it("returns true when no conflicts", () => {
      const appointments: Appointment[] = [];
      const result = canAssignDoctor("doc-1", {
        date: testDate,
        start: "09:00",
        duration: 30,
      }, appointments);
      expect(result).toBe(true);
    });

    it("returns false when there's a conflict", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient 1",
          doctorId: "doc-1",
          doctorName: "Dr. Test",
          date: testDate,
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "scheduled",
          notes: "",
        },
      ];

      // Try to assign at 09:15 (conflicts with 09:00-09:30)
      const result = canAssignDoctor("doc-1", {
        date: testDate,
        start: "09:15",
        duration: 30,
      }, appointments);
      expect(result).toBe(false);
    });

    it("ignores cancelled appointments", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient 1",
          doctorId: "doc-1",
          doctorName: "Dr. Test",
          date: testDate,
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "cancelled",
          notes: "",
        },
      ];

      // Should be assignable even though there's a cancelled appointment at same time
      const result = canAssignDoctor("doc-1", {
        date: testDate,
        start: "09:00",
        duration: 30,
      }, appointments);
      expect(result).toBe(true);
    });

    it("ignores appointments for different doctors", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient 1",
          doctorId: "doc-2",
          doctorName: "Dr. Other",
          date: testDate,
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "scheduled",
          notes: "",
        },
      ];

      // Should be assignable for doc-1 even if doc-2 has appointment
      const result = canAssignDoctor("doc-1", {
        date: testDate,
        start: "09:00",
        duration: 30,
      }, appointments);
      expect(result).toBe(true);
    });

    it("ignores appointments on different days", () => {
      const testDate2 = new Date("2024-01-16"); // Tuesday
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient 1",
          doctorId: "doc-1",
          doctorName: "Dr. Test",
          date: testDate,
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "scheduled",
          notes: "",
        },
      ];

      // Should be assignable on different day
      const result = canAssignDoctor("doc-1", {
        date: testDate2,
        start: "09:00",
        duration: 30,
      }, appointments);
      expect(result).toBe(true);
    });
  });

  describe("getAvailableSlots", () => {
    const doctor: Doctor = {
      id: "doc-1",
      name: "Dr. Test",
      specialty: "Test Specialty",
      workingHours: {
        start: "09:00",
        end: "11:00",
        daysOfWeek: [1, 2, 3, 4, 5],
      },
    };

    it("returns all slots for empty day", () => {
      const testDate = createDateForDayOfWeek(1); // Monday (day 1)
      const slots = getAvailableSlots("doc-1", testDate, 30, [], [doctor]);

      expect(slots).toHaveLength(4); // 09:00, 09:30, 10:00, 10:30
      expect(slots.every((s) => s.available)).toBe(true);
    });

    it("marks booked slots as unavailable", () => {
      const testDate = createDateForDayOfWeek(1); // Monday (day 1)
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient 1",
          doctorId: "doc-1",
          doctorName: "Dr. Test",
          date: testDate,
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "scheduled",
          notes: "",
        },
      ];

      const slots = getAvailableSlots("doc-1", testDate, 30, appointments, [doctor]);

      expect(slots[0].available).toBe(false); // 09:00 is booked
      expect(slots[1].available).toBe(true); // 09:30 is available
    });

    it("returns empty array for non-working day", () => {
      const testDate = createDateForDayOfWeek(0); // Sunday (day 0)
      const slots = getAvailableSlots("doc-1", testDate, 30, [], [doctor]);

      expect(slots).toHaveLength(0);
    });

    it("returns empty array for non-existent doctor", () => {
      const testDate = createDateForDayOfWeek(1); // Monday (day 1)
      const slots = getAvailableSlots("doc-99", testDate, 30, [], [doctor]);

      expect(slots).toHaveLength(0);
    });
  });

  describe("getDoctorAvailabilitySummary", () => {
    const doctor: Doctor = {
      id: "doc-1",
      name: "Dr. Test",
      specialty: "Test Specialty",
      workingHours: {
        start: "09:00",
        end: "11:00",
        daysOfWeek: [1, 2, 3, 4, 5],
      },
    };

    it("calculates correct summary for empty day", () => {
      const testDate = createDateForDayOfWeek(1); // Monday (day 1)
      const summary = getDoctorAvailabilitySummary("doc-1", testDate, [], [doctor]);

      expect(summary.total).toBe(4); // 09:00, 09:30, 10:00, 10:30
      expect(summary.available).toBe(4);
      expect(summary.booked).toBe(0);
    });

    it("calculates correct summary with bookings", () => {
      const testDate = createDateForDayOfWeek(1); // Monday (day 1)
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient 1",
          doctorId: "doc-1",
          doctorName: "Dr. Test",
          date: testDate,
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "scheduled",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient 2",
          doctorId: "doc-1",
          doctorName: "Dr. Test",
          date: testDate,
          timeStart: "10:00",
          duration: 30,
          type: "consultation",
          status: "scheduled",
          notes: "",
        },
      ];

      const summary = getDoctorAvailabilitySummary("doc-1", testDate, appointments, [doctor]);

      expect(summary.total).toBe(4);
      expect(summary.available).toBe(2);
      expect(summary.booked).toBe(2);
    });
  });
});
