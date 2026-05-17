import { describe, it, expect } from "@jest/globals";
import { calculateAnalytics } from "@/lib/utils/analytics";
import { Appointment, Doctor } from "@/lib/store/scheduler";

// Test doctors
const TEST_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Alice",
    specialty: "General",
    workingHours: { start: "09:00", end: "17:00", daysOfWeek: [1, 2, 3, 4, 5] },
  },
  {
    id: "doc-2",
    name: "Dr. Bob",
    specialty: "Specialist",
    workingHours: { start: "10:00", end: "18:00", daysOfWeek: [1, 2, 3, 4, 5] },
  },
  {
    id: "doc-3",
    name: "Dr. Carol",
    specialty: "Expert",
    workingHours: { start: "09:00", end: "17:00", daysOfWeek: [1, 2, 3, 4, 5] },
  },
];

describe("calculateAnalytics", () => {
  describe("Empty appointments", () => {
    it("should return zeroed metrics for empty list", () => {
      const metrics = calculateAnalytics([], TEST_DOCTORS);

      expect(metrics.totalAppointments).toBe(0);
      expect(metrics.completedCount).toBe(0);
      expect(metrics.noshowCount).toBe(0);
      expect(metrics.noShowRate).toBe(0);
      expect(metrics.completionRate).toBe(0);
      expect(metrics.avgDuration).toBe(0);
      expect(metrics.busiestDoctor.count).toBe(0);
      expect(metrics.busiestDay.dayOfWeek).toBe("N/A");
    });
  });

  describe("No-show rate calculation", () => {
    it("should calculate 0% no-show rate when no noshow appointments", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-01"),
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient B",
          patientPhone: "+5585987654322",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-02"),
          timeStart: "10:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      expect(metrics.totalAppointments).toBe(2);
      expect(metrics.noshowCount).toBe(0);
      expect(metrics.noShowRate).toBe(0);
    });

    it("should calculate 50% no-show rate with 1 of 2 noshow", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-01"),
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient B",
          patientPhone: "+5585987654322",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-02"),
          timeStart: "10:00",
          duration: 30,
          type: "consultation",
          status: "noshow",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      expect(metrics.totalAppointments).toBe(2);
      expect(metrics.noshowCount).toBe(1);
      expect(metrics.noShowRate).toBe(50);
    });

    it("should calculate 100% no-show rate when all noshow", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-01"),
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "noshow",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient B",
          patientPhone: "+5585987654322",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-02"),
          timeStart: "10:00",
          duration: 30,
          type: "consultation",
          status: "noshow",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      expect(metrics.totalAppointments).toBe(2);
      expect(metrics.noshowCount).toBe(2);
      expect(metrics.noShowRate).toBe(100);
    });

    it("should calculate 33.33% no-show rate with 1 of 3", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-01"),
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "noshow",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient B",
          patientPhone: "+5585987654322",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-02"),
          timeStart: "10:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-3",
          patientId: "pat-3",
          patientName: "Patient C",
          patientPhone: "+5585987654323",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-03"),
          timeStart: "11:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      expect(metrics.totalAppointments).toBe(3);
      expect(metrics.noshowCount).toBe(1);
      expect(metrics.noShowRate).toBeCloseTo(33.33, 2);
    });
  });

  describe("Completion rate calculation", () => {
    it("should calculate 100% completion rate when all completed", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-01"),
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient B",
          patientPhone: "+5585987654322",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-02"),
          timeStart: "10:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      expect(metrics.completedCount).toBe(2);
      expect(metrics.completionRate).toBe(100);
    });

    it("should calculate 0% completion rate when none completed", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-01"),
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "scheduled",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient B",
          patientPhone: "+5585987654322",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-02"),
          timeStart: "10:00",
          duration: 30,
          type: "consultation",
          status: "cancelled",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      expect(metrics.completedCount).toBe(0);
      expect(metrics.completionRate).toBe(0);
    });

    it("should calculate 50% completion rate", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-01"),
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient B",
          patientPhone: "+5585987654322",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-02"),
          timeStart: "10:00",
          duration: 30,
          type: "consultation",
          status: "scheduled",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      expect(metrics.completedCount).toBe(1);
      expect(metrics.completionRate).toBe(50);
    });
  });

  describe("Average duration calculation", () => {
    it("should calculate correct average with same durations", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-01"),
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient B",
          patientPhone: "+5585987654322",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-02"),
          timeStart: "10:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      expect(metrics.avgDuration).toBe(30);
    });

    it("should calculate correct average with different durations", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-01"),
          timeStart: "09:00",
          duration: 15,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient B",
          patientPhone: "+5585987654322",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-02"),
          timeStart: "10:00",
          duration: 60,
          type: "consultation",
          status: "completed",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      // (15 + 60) / 2 = 37.5
      expect(metrics.avgDuration).toBe(37.5);
    });

    it("should calculate correct average with 3 different durations", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-01"),
          timeStart: "09:00",
          duration: 15,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient B",
          patientPhone: "+5585987654322",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-02"),
          timeStart: "10:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-3",
          patientId: "pat-3",
          patientName: "Patient C",
          patientPhone: "+5585987654323",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-03"),
          timeStart: "11:00",
          duration: 60,
          type: "consultation",
          status: "completed",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      // (15 + 30 + 60) / 3 = 35
      expect(metrics.avgDuration).toBe(35);
    });
  });

  describe("Busiest doctor calculation", () => {
    it("should identify busiest doctor correctly", () => {
      const appointments: Appointment[] = [
        // Doc-1: 3 appointments
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-01"),
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient B",
          patientPhone: "+5585987654322",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-02"),
          timeStart: "10:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-3",
          patientId: "pat-3",
          patientName: "Patient C",
          patientPhone: "+5585987654323",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-03"),
          timeStart: "11:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        // Doc-2: 2 appointments
        {
          id: "apt-4",
          patientId: "pat-4",
          patientName: "Patient D",
          patientPhone: "+5585987654324",
          doctorId: "doc-2",
          doctorName: "Dr. Bob",
          date: new Date("2024-01-01"),
          timeStart: "14:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-5",
          patientId: "pat-5",
          patientName: "Patient E",
          patientPhone: "+5585987654325",
          doctorId: "doc-2",
          doctorName: "Dr. Bob",
          date: new Date("2024-01-02"),
          timeStart: "15:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      expect(metrics.busiestDoctor.doctorId).toBe("doc-1");
      expect(metrics.busiestDoctor.doctorName).toBe("Dr. Alice");
      expect(metrics.busiestDoctor.count).toBe(3);
    });

    it("should handle single doctor correctly", () => {
      const appointments: Appointment[] = [
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date("2024-01-01"),
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      expect(metrics.busiestDoctor.doctorId).toBe("doc-1");
      expect(metrics.busiestDoctor.doctorName).toBe("Dr. Alice");
      expect(metrics.busiestDoctor.count).toBe(1);
    });
  });

  describe("Busiest day calculation", () => {
    it("should identify busiest day correctly", () => {
      // Use explicit date construction to avoid timezone issues
      const appointments: Appointment[] = [
        // Monday: 2 appointments
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date(2024, 0, 8), // January 8, 2024 (Monday)
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient B",
          patientPhone: "+5585987654322",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date(2024, 0, 8), // Monday
          timeStart: "10:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        // Tuesday: 1 appointment
        {
          id: "apt-3",
          patientId: "pat-3",
          patientName: "Patient C",
          patientPhone: "+5585987654323",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date(2024, 0, 9), // January 9, 2024 (Tuesday)
          timeStart: "11:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      expect(metrics.busiestDay.dayOfWeek).toBe("Monday");
      expect(metrics.busiestDay.count).toBe(2);
    });

    it("should handle appointments spread across week", () => {
      const appointments: Appointment[] = [
        // Friday (January 12, 2024): 3 appointments
        {
          id: "apt-1",
          patientId: "pat-1",
          patientName: "Patient A",
          patientPhone: "+5585987654321",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date(2024, 0, 12), // Friday
          timeStart: "09:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-2",
          patientId: "pat-2",
          patientName: "Patient B",
          patientPhone: "+5585987654322",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date(2024, 0, 12), // Friday
          timeStart: "10:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-3",
          patientId: "pat-3",
          patientName: "Patient C",
          patientPhone: "+5585987654323",
          doctorId: "doc-1",
          doctorName: "Dr. Alice",
          date: new Date(2024, 0, 12), // Friday
          timeStart: "11:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        // Wednesday (January 10, 2024): 2 appointments
        {
          id: "apt-4",
          patientId: "pat-4",
          patientName: "Patient D",
          patientPhone: "+5585987654324",
          doctorId: "doc-2",
          doctorName: "Dr. Bob",
          date: new Date(2024, 0, 10), // Wednesday
          timeStart: "14:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
        {
          id: "apt-5",
          patientId: "pat-5",
          patientName: "Patient E",
          patientPhone: "+5585987654325",
          doctorId: "doc-2",
          doctorName: "Dr. Bob",
          date: new Date(2024, 0, 10), // Wednesday
          timeStart: "15:00",
          duration: 30,
          type: "consultation",
          status: "completed",
          notes: "",
        },
      ];

      const metrics = calculateAnalytics(appointments, TEST_DOCTORS);

      expect(metrics.busiestDay.dayOfWeek).toBe("Friday");
      expect(metrics.busiestDay.count).toBe(3);
    });
  });
});
