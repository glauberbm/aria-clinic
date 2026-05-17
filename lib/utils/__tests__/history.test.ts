import { describe, it, expect } from "@jest/globals";
import { filterAndSortAppointments, HistoryFilters } from "@/lib/utils/history";
import { Appointment } from "@/lib/store/scheduler";

const createAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
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
  ...overrides,
});

describe("filterAndSortAppointments", () => {
  describe("Date range filtering", () => {
    it("should filter by start date only", () => {
      const appointments = [
        createAppointment({ id: "apt-1", date: new Date(2024, 0, 1) }),
        createAppointment({ id: "apt-2", date: new Date(2024, 0, 5) }),
        createAppointment({ id: "apt-3", date: new Date(2024, 0, 10) }),
      ];

      const filters: HistoryFilters = {
        dateFrom: new Date(2024, 0, 5),
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(2);
      // Default sort is by date descending
      expect(result.map((a) => a.id)).toEqual(["apt-3", "apt-2"]);
    });

    it("should filter by end date only", () => {
      const appointments = [
        createAppointment({ id: "apt-1", date: new Date(2024, 0, 1) }),
        createAppointment({ id: "apt-2", date: new Date(2024, 0, 5) }),
        createAppointment({ id: "apt-3", date: new Date(2024, 0, 10) }),
      ];

      const filters: HistoryFilters = {
        dateTo: new Date(2024, 0, 5),
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(2);
      // Default sort is by date descending
      expect(result.map((a) => a.id)).toEqual(["apt-2", "apt-1"]);
    });

    it("should filter by date range (from and to)", () => {
      const appointments = [
        createAppointment({ id: "apt-1", date: new Date(2024, 0, 1) }),
        createAppointment({ id: "apt-2", date: new Date(2024, 0, 5) }),
        createAppointment({ id: "apt-3", date: new Date(2024, 0, 10) }),
      ];

      const filters: HistoryFilters = {
        dateFrom: new Date(2024, 0, 2),
        dateTo: new Date(2024, 0, 8),
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe("apt-2");
    });

    it("should include entire end date (up to 23:59:59)", () => {
      const appointments = [
        createAppointment({
          id: "apt-1",
          date: new Date(2024, 0, 5, 9, 0, 0),
        }),
        createAppointment({
          id: "apt-2",
          date: new Date(2024, 0, 5, 23, 59, 59),
        }),
        createAppointment({
          id: "apt-3",
          date: new Date(2024, 0, 6, 0, 0, 0),
        }),
      ];

      const filters: HistoryFilters = {
        dateTo: new Date(2024, 0, 5),
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(2);
      // Default sort is by date descending
      expect(result.map((a) => a.id)).toEqual(["apt-2", "apt-1"]);
    });
  });

  describe("Doctor filtering", () => {
    it("should filter by single doctor", () => {
      const appointments = [
        createAppointment({ id: "apt-1", doctorId: "doc-1", doctorName: "Dr. Alice" }),
        createAppointment({ id: "apt-2", doctorId: "doc-2", doctorName: "Dr. Bob" }),
        createAppointment({ id: "apt-3", doctorId: "doc-1", doctorName: "Dr. Alice" }),
      ];

      const filters: HistoryFilters = {
        doctorIds: ["doc-1"],
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(2);
      expect(result.map((a) => a.id)).toEqual(["apt-1", "apt-3"]);
    });

    it("should filter by multiple doctors", () => {
      const appointments = [
        createAppointment({ id: "apt-1", doctorId: "doc-1", doctorName: "Dr. Alice" }),
        createAppointment({ id: "apt-2", doctorId: "doc-2", doctorName: "Dr. Bob" }),
        createAppointment({ id: "apt-3", doctorId: "doc-3", doctorName: "Dr. Carol" }),
      ];

      const filters: HistoryFilters = {
        doctorIds: ["doc-1", "doc-3"],
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(2);
      expect(result.map((a) => a.id)).toEqual(["apt-1", "apt-3"]);
    });

    it("should not filter when doctorIds is empty", () => {
      const appointments = [
        createAppointment({ id: "apt-1", doctorId: "doc-1" }),
        createAppointment({ id: "apt-2", doctorId: "doc-2" }),
      ];

      const filters: HistoryFilters = {
        doctorIds: [],
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(2);
    });
  });

  describe("Status filtering", () => {
    it("should filter by single status", () => {
      const appointments = [
        createAppointment({ id: "apt-1", status: "completed" }),
        createAppointment({ id: "apt-2", status: "scheduled" }),
        createAppointment({ id: "apt-3", status: "completed" }),
      ];

      const filters: HistoryFilters = {
        statuses: ["completed"],
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(2);
      expect(result.map((a) => a.id)).toEqual(["apt-1", "apt-3"]);
    });

    it("should filter by multiple statuses", () => {
      const appointments = [
        createAppointment({ id: "apt-1", status: "completed" }),
        createAppointment({ id: "apt-2", status: "scheduled" }),
        createAppointment({ id: "apt-3", status: "noshow" }),
      ];

      const filters: HistoryFilters = {
        statuses: ["completed", "noshow"],
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(2);
      expect(result.map((a) => a.id)).toEqual(["apt-1", "apt-3"]);
    });
  });

  describe("Search filtering", () => {
    it("should search by patient name", () => {
      const appointments = [
        createAppointment({ id: "apt-1", patientName: "Alice Smith" }),
        createAppointment({ id: "apt-2", patientName: "Bob Jones" }),
        createAppointment({ id: "apt-3", patientName: "Alice Brown" }),
      ];

      const filters: HistoryFilters = {
        searchQuery: "alice",
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(2);
      expect(result.map((a) => a.id)).toEqual(["apt-1", "apt-3"]);
    });

    it("should search case-insensitively", () => {
      const appointments = [
        createAppointment({ id: "apt-1", patientName: "ALICE Smith" }),
        createAppointment({ id: "apt-2", patientName: "Bob Jones" }),
      ];

      const filters: HistoryFilters = {
        searchQuery: "alice",
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe("apt-1");
    });

    it("should search by appointment ID", () => {
      const appointments = [
        createAppointment({ id: "apt-ABC-123", patientName: "Alice" }),
        createAppointment({ id: "apt-DEF-456", patientName: "Bob" }),
      ];

      const filters: HistoryFilters = {
        searchQuery: "abc",
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe("apt-ABC-123");
    });

    it("should ignore whitespace in search query", () => {
      const appointments = [
        createAppointment({ id: "apt-1", patientName: "Alice Smith" }),
      ];

      const filters: HistoryFilters = {
        searchQuery: "  alice  ",
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(1);
    });
  });

  describe("Sorting", () => {
    it("should sort by date ascending", () => {
      const appointments = [
        createAppointment({ id: "apt-1", date: new Date("2024-01-10") }),
        createAppointment({ id: "apt-2", date: new Date("2024-01-01") }),
        createAppointment({ id: "apt-3", date: new Date("2024-01-05") }),
      ];

      const filters: HistoryFilters = {
        sortBy: "date",
        sortOrder: "asc",
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.map((a) => a.id)).toEqual(["apt-2", "apt-3", "apt-1"]);
    });

    it("should sort by date descending (default)", () => {
      const appointments = [
        createAppointment({ id: "apt-1", date: new Date("2024-01-01") }),
        createAppointment({ id: "apt-2", date: new Date("2024-01-10") }),
        createAppointment({ id: "apt-3", date: new Date("2024-01-05") }),
      ];

      const filters: HistoryFilters = {
        sortBy: "date",
        sortOrder: "desc",
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.map((a) => a.id)).toEqual(["apt-2", "apt-3", "apt-1"]);
    });

    it("should sort by doctor name", () => {
      const appointments = [
        createAppointment({ id: "apt-1", doctorName: "Dr. Carol" }),
        createAppointment({ id: "apt-2", doctorName: "Dr. Alice" }),
        createAppointment({ id: "apt-3", doctorName: "Dr. Bob" }),
      ];

      const filters: HistoryFilters = {
        sortBy: "doctor",
        sortOrder: "asc",
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.map((a) => a.id)).toEqual(["apt-2", "apt-3", "apt-1"]);
    });

    it("should sort by patient name", () => {
      const appointments = [
        createAppointment({ id: "apt-1", patientName: "Zara" }),
        createAppointment({ id: "apt-2", patientName: "Alice" }),
        createAppointment({ id: "apt-3", patientName: "Bob" }),
      ];

      const filters: HistoryFilters = {
        sortBy: "patient",
        sortOrder: "asc",
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.map((a) => a.id)).toEqual(["apt-2", "apt-3", "apt-1"]);
    });

    it("should sort by status", () => {
      const appointments = [
        createAppointment({ id: "apt-1", status: "scheduled" }),
        createAppointment({ id: "apt-2", status: "completed" }),
        createAppointment({ id: "apt-3", status: "noshow" }),
      ];

      const filters: HistoryFilters = {
        sortBy: "status",
        sortOrder: "asc",
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.map((a) => a.id)).toEqual(["apt-2", "apt-3", "apt-1"]);
    });

    it("should sort by duration", () => {
      const appointments = [
        createAppointment({ id: "apt-1", duration: 60 }),
        createAppointment({ id: "apt-2", duration: 15 }),
        createAppointment({ id: "apt-3", duration: 30 }),
      ];

      const filters: HistoryFilters = {
        sortBy: "duration",
        sortOrder: "asc",
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.map((a) => a.id)).toEqual(["apt-2", "apt-3", "apt-1"]);
    });
  });

  describe("Combined filters and sorting", () => {
    it("should apply multiple filters and sort", () => {
      const appointments = [
        createAppointment({
          id: "apt-1",
          date: new Date("2024-01-01"),
          doctorId: "doc-1",
          status: "completed",
        }),
        createAppointment({
          id: "apt-2",
          date: new Date("2024-01-05"),
          doctorId: "doc-1",
          status: "scheduled",
        }),
        createAppointment({
          id: "apt-3",
          date: new Date("2024-01-10"),
          doctorId: "doc-2",
          status: "completed",
        }),
        createAppointment({
          id: "apt-4",
          date: new Date("2024-01-02"),
          doctorId: "doc-1",
          status: "completed",
        }),
      ];

      const filters: HistoryFilters = {
        dateFrom: new Date("2024-01-01"),
        dateTo: new Date("2024-01-05"),
        doctorIds: ["doc-1"],
        statuses: ["completed"],
        sortBy: "date",
        sortOrder: "asc",
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(2);
      expect(result.map((a) => a.id)).toEqual(["apt-1", "apt-4"]);
    });

    it("should filter by date range, doctor, and search, then sort", () => {
      const appointments = [
        createAppointment({
          id: "apt-1",
          date: new Date("2024-01-05"),
          doctorId: "doc-1",
          patientName: "Alice Smith",
        }),
        createAppointment({
          id: "apt-2",
          date: new Date("2024-01-05"),
          doctorId: "doc-1",
          patientName: "Bob Jones",
        }),
        createAppointment({
          id: "apt-3",
          date: new Date("2024-01-05"),
          doctorId: "doc-2",
          patientName: "Alice Brown",
        }),
      ];

      const filters: HistoryFilters = {
        dateFrom: new Date("2024-01-01"),
        dateTo: new Date("2024-01-10"),
        doctorIds: ["doc-1"],
        searchQuery: "alice",
        sortBy: "patient",
        sortOrder: "asc",
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe("apt-1");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty appointments array", () => {
      const result = filterAndSortAppointments([], {});
      expect(result.length).toBe(0);
    });

    it("should return all appointments with no filters", () => {
      const appointments = [
        createAppointment({ id: "apt-1" }),
        createAppointment({ id: "apt-2" }),
      ];

      const result = filterAndSortAppointments(appointments, {});

      expect(result.length).toBe(2);
    });

    it("should return empty array when filter matches nothing", () => {
      const appointments = [
        createAppointment({ id: "apt-1", doctorId: "doc-1" }),
        createAppointment({ id: "apt-2", doctorId: "doc-1" }),
      ];

      const filters: HistoryFilters = {
        doctorIds: ["doc-999"],
      };

      const result = filterAndSortAppointments(appointments, filters);

      expect(result.length).toBe(0);
    });

    it("should not mutate original array", () => {
      const appointments = [
        createAppointment({ id: "apt-1", date: new Date("2024-01-10") }),
        createAppointment({ id: "apt-2", date: new Date("2024-01-01") }),
      ];

      const originalIds = appointments.map((a) => a.id);

      filterAndSortAppointments(appointments, { sortBy: "date", sortOrder: "asc" });

      expect(appointments.map((a) => a.id)).toEqual(originalIds);
    });
  });
});
