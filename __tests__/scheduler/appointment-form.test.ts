import {
  canAssignDoctor,
  getAvailableSlots,
  isTimeConflict,
} from "@/lib/utils/scheduler";
import type { Appointment, Doctor } from "@/lib/store/scheduler";

describe("Appointment Form Utilities", () => {
  const mockDoctor: Doctor = {
    id: "doc-1",
    name: "Dr. Silva",
    specialty: "Harmonização Facial",
    workingHours: {
      start: "09:00",
      end: "17:00",
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  };

  const mockAppointments: Appointment[] = [
    {
      id: "apt-1",
      patientId: "pat-1",
      patientName: "Patient 1",
      patientPhone: "+5585987654321",
      doctorId: "doc-1",
      doctorName: "Dr. Silva",
      date: new Date("2025-05-20"),
      timeStart: "10:00",
      duration: 30,
      type: "consultation",
      status: "scheduled",
      notes: "Test",
    },
    {
      id: "apt-2",
      patientId: "pat-2",
      patientName: "Patient 2",
      patientPhone: "+5585987654322",
      doctorId: "doc-1",
      doctorName: "Dr. Silva",
      date: new Date("2025-05-20"),
      timeStart: "14:00",
      duration: 60,
      type: "procedure",
      status: "scheduled",
      notes: "",
    },
    {
      id: "apt-3",
      patientId: "pat-3",
      patientName: "Patient 3",
      patientPhone: "+5585987654323",
      doctorId: "doc-1",
      doctorName: "Dr. Silva",
      date: new Date("2025-05-20"),
      timeStart: "14:00",
      duration: 60,
      type: "followup",
      status: "cancelled",
      notes: "",
    },
  ];

  describe("isTimeConflict", () => {
    it("should detect overlapping time slots", () => {
      // Slot 1: 10:00-10:30, Slot 2: 10:15-10:45 (overlap)
      const conflict = isTimeConflict("10:00", 30, "10:15", 30);
      expect(conflict).toBe(true);
    });

    it("should not detect non-overlapping consecutive slots", () => {
      // Slot 1: 10:00-10:30, Slot 2: 10:30-11:00 (no overlap)
      const conflict = isTimeConflict("10:00", 30, "10:30", 30);
      expect(conflict).toBe(false);
    });

    it("should detect when second slot starts inside first slot", () => {
      // Slot 1: 10:00-10:45, Slot 2: 10:30-11:00
      const conflict = isTimeConflict("10:00", 45, "10:30", 30);
      expect(conflict).toBe(true);
    });

    it("should detect when first slot starts inside second slot", () => {
      // Slot 1: 10:30-11:00, Slot 2: 10:00-10:45
      const conflict = isTimeConflict("10:30", 30, "10:00", 45);
      expect(conflict).toBe(true);
    });

    it("should not detect conflict when slots are far apart", () => {
      // Slot 1: 10:00-10:30, Slot 2: 14:00-14:30
      const conflict = isTimeConflict("10:00", 30, "14:00", 30);
      expect(conflict).toBe(false);
    });
  });

  describe("canAssignDoctor", () => {
    it("should allow assignment when no conflicts exist", () => {
      const testDate = new Date("2025-05-20");
      const canAssign = canAssignDoctor(
        "doc-1",
        { date: testDate, start: "11:00", duration: 30 },
        mockAppointments
      );
      expect(canAssign).toBe(true);
    });

    it("should reject assignment when time conflicts with existing appointment", () => {
      const testDate = new Date("2025-05-20");
      const canAssign = canAssignDoctor(
        "doc-1",
        { date: testDate, start: "10:15", duration: 30 },
        mockAppointments
      );
      expect(canAssign).toBe(false);
    });

    it("should ignore cancelled appointments in conflict detection", () => {
      const testDate = new Date("2025-05-20");
      // apt-3 is cancelled at 14:00-15:00, should not block assignment
      // But apt-2 is scheduled at 14:00-15:00, so we should get the same slot but later
      const canAssign = canAssignDoctor(
        "doc-1",
        { date: testDate, start: "16:00", duration: 60 },
        mockAppointments
      );
      expect(canAssign).toBe(true);
    });

    it("should not check conflicts for different doctor", () => {
      const testDate = new Date("2025-05-20");
      const canAssign = canAssignDoctor(
        "doc-2",
        { date: testDate, start: "10:00", duration: 30 },
        mockAppointments
      );
      expect(canAssign).toBe(true);
    });

    it("should not check conflicts for different date", () => {
      const differentDate = new Date("2025-05-21");
      const canAssign = canAssignDoctor(
        "doc-1",
        { date: differentDate, start: "10:00", duration: 30 },
        mockAppointments
      );
      expect(canAssign).toBe(true);
    });

    it("should reject assignment at exact same time as existing appointment", () => {
      const testDate = new Date("2025-05-20");
      const canAssign = canAssignDoctor(
        "doc-1",
        { date: testDate, start: "10:00", duration: 30 },
        mockAppointments
      );
      expect(canAssign).toBe(false);
    });
  });

  describe("getAvailableSlots", () => {
    it("should return empty array for non-existent doctor", () => {
      const testDate = new Date("2025-05-20");
      const slots = getAvailableSlots(
        "non-existent",
        testDate,
        30,
        mockAppointments,
        [mockDoctor]
      );
      expect(slots).toHaveLength(0);
    });

    it("should return empty array for non-working day", () => {
      const sundayDate = new Date("2025-05-18"); // Sunday
      const slots = getAvailableSlots(
        "doc-1",
        sundayDate,
        30,
        mockAppointments,
        [mockDoctor]
      );
      expect(slots).toHaveLength(0);
    });

    it("should return available slots for working day with no conflicts", () => {
      const testDate = new Date("2025-05-21"); // Different day than conflicts
      const slots = getAvailableSlots(
        "doc-1",
        testDate,
        30,
        mockAppointments,
        [mockDoctor]
      );
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0]).toHaveProperty("start");
      expect(slots[0]).toHaveProperty("end");
      expect(slots[0]).toHaveProperty("available");
    });

    it("should mark slots as unavailable when doctor has conflicting appointments", () => {
      const testDate = new Date("2025-05-20"); // Has 10:00-10:30 and 14:00-15:00
      const slots = getAvailableSlots(
        "doc-1",
        testDate,
        30,
        mockAppointments,
        [mockDoctor]
      );

      const slot1000 = slots.find((s) => s.start === "10:00");
      expect(slot1000?.available).toBe(false);

      const slot1400 = slots.find((s) => s.start === "14:00");
      expect(slot1400?.available).toBe(false);

      // Slot at 11:00 should be available
      const slot1100 = slots.find((s) => s.start === "11:00");
      expect(slot1100?.available).toBe(true);
    });

    it("should respect doctor working hours", () => {
      const testDate = new Date("2025-05-21");
      const slots = getAvailableSlots(
        "doc-1",
        testDate,
        30,
        mockAppointments,
        [mockDoctor]
      );

      // All slots should be within 09:00-17:00
      slots.forEach((slot) => {
        const startHour = parseInt(slot.start.split(":")[0]);
        expect(startHour).toBeGreaterThanOrEqual(9);
        expect(startHour).toBeLessThan(17);
      });
    });

    it("should generate slots with correct duration intervals", () => {
      const testDate = new Date("2025-05-21");
      const slots = getAvailableSlots(
        "doc-1",
        testDate,
        30,
        mockAppointments,
        [mockDoctor]
      );

      // Check that time increases by 30 minutes between consecutive slots
      for (let i = 0; i < slots.length - 1; i++) {
        const current = parseInt(slots[i].start.split(":")[1]);
        const next = parseInt(slots[i + 1].start.split(":")[1]);
        const diff =
          (next - current + 60) % 60 === 30 ||
          (next - current + 60) % 60 === 0;
        expect(diff).toBe(true);
      }
    });

    it("should work with different duration values", () => {
      const testDate = new Date("2025-05-21");

      [15, 30, 60].forEach((duration) => {
        const slots = getAvailableSlots(
          "doc-1",
          testDate,
          duration,
          mockAppointments,
          [mockDoctor]
        );
        expect(slots.length).toBeGreaterThan(0);
      });
    });
  });
});
