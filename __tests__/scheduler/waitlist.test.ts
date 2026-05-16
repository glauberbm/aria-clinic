import { renderHook, act } from "@testing-library/react";
import { useScheduler, WaitlistEntry, WaitlistEntryStatus } from "@/lib/store/scheduler";

describe("Waitlist Store — FIFO Ordering", () => {
  it("should initialize with empty waitlist", () => {
    const { result } = renderHook(() => useScheduler());
    expect(result.current.waitlist).toEqual([]);
  });

  it("should add entry to waitlist", () => {
    const { result } = renderHook(() => useScheduler());

    act(() => {
      result.current.addToWaitlist({
        patientId: "patient-1",
        patientName: "Maria Silva",
        status: "pending",
      });
    });

    expect(result.current.waitlist).toHaveLength(1);
    expect(result.current.waitlist[0].patientName).toBe("Maria Silva");
    expect(result.current.waitlist[0].status).toBe("pending");
  });

  it("should return next patient in FIFO order", () => {
    const { result } = renderHook(() => useScheduler());

    act(() => {
      result.current.addToWaitlist({
        patientId: "patient-1",
        patientName: "Maria Silva",
        status: "pending",
      });
      result.current.addToWaitlist({
        patientId: "patient-2",
        patientName: "Ana Costa",
        status: "pending",
      });
      result.current.addToWaitlist({
        patientId: "patient-3",
        patientName: "Patricia Oliveira",
        status: "pending",
      });
    });

    const next = result.current.getNextWaitlistPatient();
    expect(next?.patientName).toBe("Maria Silva");
  });

  it("should skip non-pending entries in FIFO order", () => {
    const { result } = renderHook(() => useScheduler());

    act(() => {
      const entry1 = result.current.addToWaitlist({
        patientId: "patient-1",
        patientName: "Maria Silva",
        status: "pending",
      });
      const entry2 = result.current.addToWaitlist({
        patientId: "patient-2",
        patientName: "Ana Costa",
        status: "pending",
      });
      result.current.updateWaitlistEntry(entry1.id, { status: "offered" });
    });

    const next = result.current.getNextWaitlistPatient();
    expect(next?.patientName).toBe("Ana Costa");
  });

  it("should update waitlist entry status", () => {
    const { result } = renderHook(() => useScheduler());
    let entryId: string;

    act(() => {
      const entry = result.current.addToWaitlist({
        patientId: "patient-1",
        patientName: "Maria Silva",
        status: "pending",
      });
      entryId = entry.id;
    });

    act(() => {
      result.current.updateWaitlistEntry(entryId, {
        status: "offered",
      });
    });

    const updated = result.current.waitlist.find((e) => e.id === entryId);
    expect(updated?.status).toBe("offered");
  });

  it("should update entry to accepted with appointment ID", () => {
    const { result } = renderHook(() => useScheduler());
    let entryId: string;

    act(() => {
      const entry = result.current.addToWaitlist({
        patientId: "patient-1",
        patientName: "Maria Silva",
        status: "pending",
      });
      entryId = entry.id;
    });

    act(() => {
      result.current.updateWaitlistEntry(entryId, {
        status: "accepted",
        acceptedAppointmentId: "apt-123",
      });
    });

    const updated = result.current.waitlist.find((e) => e.id === entryId);
    expect(updated?.status).toBe("accepted");
    expect(updated?.acceptedAppointmentId).toBe("apt-123");
  });

  it("should remove entry from waitlist", () => {
    const { result } = renderHook(() => useScheduler());
    let entryId: string;

    act(() => {
      const entry = result.current.addToWaitlist({
        patientId: "patient-1",
        patientName: "Maria Silva",
        status: "pending",
      });
      entryId = entry.id;
    });

    expect(result.current.waitlist).toHaveLength(1);

    act(() => {
      result.current.removeFromWaitlist(entryId);
    });

    expect(result.current.waitlist).toHaveLength(0);
  });

  it("should filter by status", () => {
    const { result } = renderHook(() => useScheduler());

    act(() => {
      result.current.addToWaitlist({
        patientId: "patient-1",
        patientName: "Maria Silva",
        status: "pending",
      });
      result.current.addToWaitlist({
        patientId: "patient-2",
        patientName: "Ana Costa",
        status: "pending",
      });
      result.current.addToWaitlist({
        patientId: "patient-3",
        patientName: "Patricia Oliveira",
        status: "declined",
      });
    });

    const pending = result.current.getWaitlistByStatus("pending");
    expect(pending).toHaveLength(2);
    expect(pending.every((e) => e.status === "pending")).toBe(true);
  });

  it("should return null when no pending patients", () => {
    const { result } = renderHook(() => useScheduler());

    act(() => {
      result.current.addToWaitlist({
        patientId: "patient-1",
        patientName: "Maria Silva",
        status: "declined",
      });
    });

    const next = result.current.getNextWaitlistPatient();
    expect(next).toBeNull();
  });

  it("should add entry with doctor preference", () => {
    const { result } = renderHook(() => useScheduler());

    act(() => {
      result.current.addToWaitlist({
        patientId: "patient-1",
        patientName: "Maria Silva",
        doctorId: "doctor-123",
        status: "pending",
      });
    });

    expect(result.current.waitlist[0].doctorId).toBe("doctor-123");
  });

  it("should add entry with date/time preference", () => {
    const { result } = renderHook(() => useScheduler());
    const date = new Date(2025, 5, 20);

    act(() => {
      result.current.addToWaitlist({
        patientId: "patient-1",
        patientName: "Maria Silva",
        requestedDate: date,
        requestedTime: "14:00",
        status: "pending",
      });
    });

    const entry = result.current.waitlist[0];
    expect(entry.requestedDate).toEqual(date);
    expect(entry.requestedTime).toBe("14:00");
  });
});
