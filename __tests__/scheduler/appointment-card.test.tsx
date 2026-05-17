import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppointmentCard } from "@/components/scheduler/AppointmentCard";
import { Appointment } from "@/lib/store/scheduler";

const mockAppointment: Appointment = {
  id: "test-id-1",
  patientId: "patient-1",
  patientName: "Maria Silva",
  doctorId: "doctor-1",
  doctorName: "Dra. Amanda Silva",
  date: new Date("2024-05-20"),
  timeStart: "10:00",
  duration: 30,
  type: "consultation",
  status: "confirmed",
  notes: "Avaliação inicial",
};

describe("AppointmentCard Component", () => {
  it("should render appointment details", () => {
    render(<AppointmentCard appointment={mockAppointment} />);

    expect(screen.getByText(mockAppointment.patientName)).toBeInTheDocument();
    expect(screen.getByText(mockAppointment.doctorName)).toBeInTheDocument();
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
    expect(screen.getByText(/30min/)).toBeInTheDocument();
  });

  it("should display correct status badge", () => {
    render(<AppointmentCard appointment={mockAppointment} />);
    expect(screen.getByText(/confirmado/i)).toBeInTheDocument();
  });

  it("should display notes when present", () => {
    render(<AppointmentCard appointment={mockAppointment} />);
    expect(screen.getByText(mockAppointment.notes)).toBeInTheDocument();
  });

  it("should not display notes when absent", () => {
    const appointmentWithoutNotes = {
      ...mockAppointment,
      notes: "",
    };
    render(<AppointmentCard appointment={appointmentWithoutNotes} />);
    expect(
      screen.queryByText(/Avaliação inicial/)
    ).not.toBeInTheDocument();
  });

  it("should handle click callback", async () => {
    const user = userEvent.setup();
    const mockOnClick = jest.fn();

    render(
      <AppointmentCard
        appointment={mockAppointment}
        onClick={mockOnClick}
      />
    );

    const card = screen.getByText(mockAppointment.patientName).closest("div");
    if (card?.parentElement) {
      await user.click(card.parentElement);
      expect(mockOnClick).toHaveBeenCalled();
    }
  });

  it("should calculate end time correctly", () => {
    render(<AppointmentCard appointment={mockAppointment} />);
    // 10:00 + 30 min = 10:30
    expect(screen.getByText(/10:00 - 10:30/)).toBeInTheDocument();
  });

  it("should render in compact mode", () => {
    const { container } = render(
      <AppointmentCard appointment={mockAppointment} isCompact={true} />
    );
    const card = container.querySelector(".py-2");
    expect(card).toBeInTheDocument();
  });

  it("should display scheduled status correctly", () => {
    const scheduledAppointment = {
      ...mockAppointment,
      status: "scheduled" as const,
    };
    render(<AppointmentCard appointment={scheduledAppointment} />);
    expect(screen.getByText(/agendado/i)).toBeInTheDocument();
  });

  it("should display cancelled status correctly", () => {
    const cancelledAppointment = {
      ...mockAppointment,
      status: "cancelled" as const,
    };
    render(<AppointmentCard appointment={cancelledAppointment} />);
    expect(screen.getByText(/cancelado/i)).toBeInTheDocument();
  });
});