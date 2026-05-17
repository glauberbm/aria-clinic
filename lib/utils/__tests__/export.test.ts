import { describe, it, expect } from "@jest/globals";
import { convertToCSV } from "@/lib/utils/export";
import { Appointment } from "@/lib/store/scheduler";

const createAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: "apt-1",
  patientId: "pat-1",
  patientName: "Patient A",
  patientPhone: "+5585987654321",
  doctorId: "doc-1",
  doctorName: "Dr. Alice",
  date: new Date(2024, 0, 1),
  timeStart: "09:00",
  duration: 30,
  type: "consultation",
  status: "completed",
  notes: "",
  ...overrides,
});

describe("CSV Export", () => {
  it("should convert single appointment to CSV", () => {
    const appointments = [createAppointment()];

    const csv = convertToCSV(appointments);

    expect(csv).toContain("Date,Time,Patient,Doctor,Type,Duration,Status");
    expect(csv).toContain("2024-01-01");
    expect(csv).toContain("09:00");
    expect(csv).toContain("Patient A");
    expect(csv).toContain("Dr. Alice");
    expect(csv).toContain("consultation");
    expect(csv).toContain("30");
    expect(csv).toContain("completed");
  });

  it("should convert multiple appointments to CSV", () => {
    const appointments = [
      createAppointment({ id: "apt-1", patientName: "Patient A" }),
      createAppointment({ id: "apt-2", patientName: "Patient B", date: new Date(2024, 0, 2) }),
      createAppointment({ id: "apt-3", patientName: "Patient C", date: new Date(2024, 0, 3) }),
    ];

    const csv = convertToCSV(appointments);

    expect(csv.split("\n").length).toBe(4); // Header + 3 rows
    expect(csv).toContain("Patient A");
    expect(csv).toContain("Patient B");
    expect(csv).toContain("Patient C");
  });

  it("should escape quotes in values", () => {
    const appointments = [
      createAppointment({
        id: "apt-1",
        patientName: 'Patient "Quoted" Name',
      }),
    ];

    const csv = convertToCSV(appointments);

    // Should have escaped quotes
    expect(csv).toContain('Patient ""Quoted"" Name');
  });

  it("should format dates as YYYY-MM-DD", () => {
    const appointments = [
      createAppointment({ id: "apt-1", date: new Date(2024, 11, 25) }), // Dec 25
      createAppointment({ id: "apt-2", date: new Date(2024, 0, 5) }), // Jan 5
    ];

    const csv = convertToCSV(appointments);

    expect(csv).toContain("2024-12-25");
    expect(csv).toContain("2024-01-05");
  });

  it("should handle empty appointments", () => {
    const csv = convertToCSV([]);

    expect(csv).toContain("Date,Time,Patient,Doctor,Type,Duration,Status");
    expect(csv.split("\n").length).toBe(1); // Only header
  });

  it("should wrap all values in quotes for valid CSV", () => {
    const appointments = [createAppointment({ id: "apt-1", patientName: "Patient A" })];

    const csv = convertToCSV(appointments);

    const lines = csv.split("\n");
    const dataLine = lines[1];

    // All fields should be quoted
    const fields = dataLine.split('","');
    expect(fields.length).toBeGreaterThanOrEqual(5);
  });
});
