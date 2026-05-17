import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AppointmentActions } from "./AppointmentActions";
import type { Appointment, AppointmentStatus } from "@/lib/store/scheduler";

const mockAppointment: Appointment = {
  id: "apt-1",
  patientId: "pat-1",
  patientName: "João Silva",
  patientPhone: "+5585987654321",
  doctorId: "doc-1",
  doctorName: "Dr. Carlos",
  date: new Date("2026-05-20"),
  timeStart: "14:00",
  duration: 30,
  type: "consultation",
  status: "scheduled",
  notes: "Initial consultation",
};

describe("AppointmentActions", () => {
  it("renders status badge with current status", () => {
    const mockHandler = jest.fn();
    render(
      <AppointmentActions
        appointment={mockAppointment}
        onStatusChange={mockHandler}
      />
    );

    expect(screen.getByText("Agendado")).toBeInTheDocument();
  });

  it("shows confirm button only when status is scheduled", () => {
    const mockHandler = jest.fn();
    render(
      <AppointmentActions
        appointment={mockAppointment}
        onStatusChange={mockHandler}
      />
    );

    expect(screen.getByText("Confirm Appointment")).toBeInTheDocument();
  });

  it("hides confirm button when status is confirmed", () => {
    const confirmedAppointment = { ...mockAppointment, status: "confirmed" as AppointmentStatus };
    const mockHandler = jest.fn();
    render(
      <AppointmentActions
        appointment={confirmedAppointment}
        onStatusChange={mockHandler}
      />
    );

    expect(screen.queryByText("Confirm Appointment")).not.toBeInTheDocument();
  });

  it("calls onStatusChange with correct status when confirm is clicked", async () => {
    const mockHandler = jest.fn(() => Promise.resolve());
    render(
      <AppointmentActions
        appointment={mockAppointment}
        onStatusChange={mockHandler}
      />
    );

    const confirmButton = screen.getByText("Confirm Appointment");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalledWith(mockAppointment.id, "confirmed");
    });
  });

  it("shows cancel confirmation dialog when cancel is clicked", () => {
    const mockHandler = jest.fn();
    render(
      <AppointmentActions
        appointment={mockAppointment}
        onStatusChange={mockHandler}
      />
    );

    const cancelButtons = screen.getAllByText(/^Cancel$/);
    fireEvent.click(cancelButtons[0]);

    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    const confirmButtons = screen.getAllByText(/Cancel Appointment/);
    expect(confirmButtons.length).toBeGreaterThan(0);
  });

  it("shows cancel dialog and confirmation buttons", async () => {
    const mockHandler = jest.fn(() => Promise.resolve());
    render(
      <AppointmentActions
        appointment={mockAppointment}
        onStatusChange={mockHandler}
      />
    );

    // Open cancel dialog
    const cancelButtons = screen.getAllByText(/^Cancel$/);
    fireEvent.click(cancelButtons[0]);

    // Verify dialog appears
    await waitFor(() => {
      expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    });

    // Verify reason dropdown exists
    expect(screen.getByLabelText(/Cancellation Reason/i)).toBeInTheDocument();
  });

  it("shows reschedule confirmation dialog when reschedule is clicked", () => {
    const mockHandler = jest.fn();
    render(
      <AppointmentActions
        appointment={mockAppointment}
        onStatusChange={mockHandler}
      />
    );

    const rescheduleButton = screen.getByText("Reschedule");
    fireEvent.click(rescheduleButton);

    expect(screen.getByText(/Reschedule Appointment/)).toBeInTheDocument();
  });

  it("calls onReschedule callback when reschedule is confirmed", async () => {
    const mockHandler = jest.fn(() => Promise.resolve());
    const mockReschedule = jest.fn();
    render(
      <AppointmentActions
        appointment={mockAppointment}
        onStatusChange={mockHandler}
        onReschedule={mockReschedule}
      />
    );

    // Open reschedule dialog
    const rescheduleButton = screen.getByText("Reschedule");
    fireEvent.click(rescheduleButton);

    // Confirm reschedule
    const proceedButton = screen.getByText("Proceed");
    fireEvent.click(proceedButton);

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalled();
    });
  });

  it("shows mark done confirmation with notes textarea", () => {
    const mockHandler = jest.fn();
    render(
      <AppointmentActions
        appointment={mockAppointment}
        onStatusChange={mockHandler}
      />
    );

    const markDoneButton = screen.getByText("Mark as Done");
    fireEvent.click(markDoneButton);

    expect(screen.getByText("Mark as Completed")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Add any notes/)).toBeInTheDocument();
  });

  it("disables buttons when loading", () => {
    const mockHandler = jest.fn();
    render(
      <AppointmentActions
        appointment={mockAppointment}
        onStatusChange={mockHandler}
        isLoading={true}
      />
    );

    const confirmButton = screen.getByText("Confirm Appointment");
    expect(confirmButton).toBeDisabled();
  });

  it("shows no-show button and calls handler correctly", async () => {
    const mockHandler = jest.fn(() => Promise.resolve());
    render(
      <AppointmentActions
        appointment={mockAppointment}
        onStatusChange={mockHandler}
      />
    );

    const noShowButton = screen.getByText("Mark as No-show");
    fireEvent.click(noShowButton);

    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalledWith(
        mockAppointment.id,
        "noshow"
      );
    });
  });

  it("hides status-changing buttons for completed appointments", () => {
    const completedAppointment = { ...mockAppointment, status: "completed" as AppointmentStatus };
    const mockHandler = jest.fn();
    render(
      <AppointmentActions
        appointment={completedAppointment}
        onStatusChange={mockHandler}
      />
    );

    expect(screen.queryByText("Confirm Appointment")).not.toBeInTheDocument();
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    expect(screen.queryByText("Mark as Done")).not.toBeInTheDocument();
  });
});
