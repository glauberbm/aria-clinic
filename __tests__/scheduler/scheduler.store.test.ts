import { renderHook, act } from "@testing-library/react";
import { useScheduler } from "@/lib/store/scheduler";

describe("Scheduler Store", () => {

  it("should initialize with mock appointments", () => {
    const { result } = renderHook(() => useScheduler());
    expect(result.current.appointments.length).toBeGreaterThan(100);
  });

  it("should initialize with 5 mock doctors", () => {
    const { result } = renderHook(() => useScheduler());
    expect(result.current.doctors).toHaveLength(5);
  });

  it("should add appointment", () => {
    const { result } = renderHook(() => useScheduler());
    const initialCount = result.current.appointments.length;

    act(() => {
      result.current.addAppointment({
        patientId: "test-patient",
        patientName: "Test Patient",
        doctorId: result.current.doctors[0].id,
        doctorName: result.current.doctors[0].name,
        date: new Date(),
        timeStart: "10:00",
        duration: 30,
        type: "consultation",
        status: "scheduled",
        notes: "Test appointment",
      });
    });

    expect(result.current.appointments).toHaveLength(initialCount + 1);
  });

  it("should get appointments for a specific date", () => {
    const { result } = renderHook(() => useScheduler());
    const testDate = result.current.appointments[0].date;

    act(() => {
      const appointments = result.current.getAppointmentsForDate(testDate);
      expect(appointments.length).toBeGreaterThan(0);
      expect(appointments[0].date).toEqual(testDate);
    });
  });

  it("should get appointments for a specific month", () => {
    const { result } = renderHook(() => useScheduler());
    const testDate = new Date();

    act(() => {
      const appointments = result.current.getAppointmentsForMonth(testDate);
      expect(appointments.length).toBeGreaterThanOrEqual(0);
    });
  });

  it("should update appointment status", () => {
    const { result } = renderHook(() => useScheduler());
    const appointmentId = result.current.appointments[0].id;

    act(() => {
      result.current.updateAppointment(appointmentId, {
        status: "confirmed",
      });
    });

    const updatedAppointment = result.current.appointments.find(
      (apt) => apt.id === appointmentId
    );
    expect(updatedAppointment?.status).toBe("confirmed");
  });

  it("should cancel appointment", () => {
    const { result } = renderHook(() => useScheduler());
    const appointmentId = result.current.appointments[0].id;

    act(() => {
      result.current.cancelAppointment(appointmentId);
    });

    const cancelledAppointment = result.current.appointments.find(
      (apt) => apt.id === appointmentId
    );
    expect(cancelledAppointment?.status).toBe("cancelled");
  });

  it("should get doctor by id", () => {
    const { result } = renderHook(() => useScheduler());
    const doctorId = result.current.doctors[0].id;

    act(() => {
      const doctor = result.current.getDoctorById(doctorId);
      expect(doctor).toBeDefined();
      expect(doctor?.id).toBe(doctorId);
    });
  });

  it("should return undefined for non-existent doctor", () => {
    const { result } = renderHook(() => useScheduler());

    act(() => {
      const doctor = result.current.getDoctorById("non-existent-id");
      expect(doctor).toBeUndefined();
    });
  });
});
