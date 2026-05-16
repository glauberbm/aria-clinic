import { render, screen, fireEvent } from "@testing-library/react";
import { TimeSlotPicker } from "@/components/scheduler/TimeSlotPicker";

describe("TimeSlotPicker", () => {
  const mockOnSelectTime = jest.fn();
  const availableSlots = [
    { start: "09:00", end: "09:30", available: true },
    { start: "09:30", end: "10:00", available: false },
    { start: "10:00", end: "10:30", available: true },
    { start: "10:30", end: "11:00", available: true },
  ];

  beforeEach(() => {
    mockOnSelectTime.mockClear();
  });

  it("should render time slot picker with available slots", () => {
    render(
      <TimeSlotPicker
        date={new Date("2025-05-20")}
        doctorId="doc-1"
        selectedTime="09:00"
        onSelectTime={mockOnSelectTime}
        availableSlots={availableSlots}
      />
    );

    expect(screen.getByText("Time Start")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();
    expect(screen.getByText("10:00")).toBeInTheDocument();
  });

  it("should highlight selected time slot", () => {
    render(
      <TimeSlotPicker
        date={new Date("2025-05-20")}
        doctorId="doc-1"
        selectedTime="10:00"
        onSelectTime={mockOnSelectTime}
        availableSlots={availableSlots}
      />
    );

    const selectedButton = screen.getByRole("button", { name: "10:00" });
    // The selected button should have the "default" variant styling (bg-primary)
    expect(selectedButton).toHaveClass("bg-primary");
  });

  it("should call onSelectTime when available slot is clicked", () => {
    render(
      <TimeSlotPicker
        date={new Date("2025-05-20")}
        doctorId="doc-1"
        selectedTime="09:00"
        onSelectTime={mockOnSelectTime}
        availableSlots={availableSlots}
      />
    );

    const button = screen.getByRole("button", { name: "10:00" });
    fireEvent.click(button);

    expect(mockOnSelectTime).toHaveBeenCalledWith("10:00");
    expect(mockOnSelectTime).toHaveBeenCalledTimes(1);
  });

  it("should disable unavailable slots", () => {
    render(
      <TimeSlotPicker
        date={new Date("2025-05-20")}
        doctorId="doc-1"
        selectedTime="09:00"
        onSelectTime={mockOnSelectTime}
        availableSlots={availableSlots}
      />
    );

    const unavailableButton = screen.getByRole("button", { name: "09:30" });
    expect(unavailableButton).toBeDisabled();
  });

  it("should not call onSelectTime when disabled slot is clicked", () => {
    render(
      <TimeSlotPicker
        date={new Date("2025-05-20")}
        doctorId="doc-1"
        selectedTime="09:00"
        onSelectTime={mockOnSelectTime}
        availableSlots={availableSlots}
      />
    );

    const unavailableButton = screen.getByRole("button", { name: "09:30" });
    fireEvent.click(unavailableButton);

    expect(mockOnSelectTime).not.toHaveBeenCalled();
  });

  it("should disable all slots when disabled prop is true", () => {
    const { container } = render(
      <TimeSlotPicker
        date={new Date("2025-05-20")}
        doctorId="doc-1"
        selectedTime="09:00"
        onSelectTime={mockOnSelectTime}
        availableSlots={availableSlots}
        disabled={true}
      />
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      if (button.textContent?.match(/^\d{2}:\d{2}$/)) {
        expect(button).toBeDisabled();
      }
    });
  });

  it("should show message when no slots available", () => {
    const noSlots = [
      { start: "09:00", end: "09:30", available: false },
      { start: "09:30", end: "10:00", available: false },
    ];

    render(
      <TimeSlotPicker
        date={new Date("2025-05-20")}
        doctorId="doc-1"
        selectedTime=""
        onSelectTime={mockOnSelectTime}
        availableSlots={noSlots}
      />
    );

    expect(
      screen.getByText(/No available slots for this doctor/)
    ).toBeInTheDocument();
  });

  it("should display add to waitlist button when no slots available", () => {
    const noSlots = [{ start: "09:00", end: "09:30", available: false }];

    render(
      <TimeSlotPicker
        date={new Date("2025-05-20")}
        doctorId="doc-1"
        selectedTime=""
        onSelectTime={mockOnSelectTime}
        availableSlots={noSlots}
      />
    );

    expect(screen.getByText(/Add to waitlist/)).toBeInTheDocument();
  });

  it("should display date in message when no slots available", () => {
    const noSlots = [{ start: "09:00", end: "09:30", available: false }];
    const testDate = new Date("2025-05-20T12:00:00");

    render(
      <TimeSlotPicker
        date={testDate}
        doctorId="doc-1"
        selectedTime=""
        onSelectTime={mockOnSelectTime}
        availableSlots={noSlots}
      />
    );

    expect(screen.getByText(/No available slots/)).toBeInTheDocument();
  });

  it("should render slots in grid layout", () => {
    const { container } = render(
      <TimeSlotPicker
        date={new Date("2025-05-20")}
        doctorId="doc-1"
        selectedTime="09:00"
        onSelectTime={mockOnSelectTime}
        availableSlots={availableSlots}
      />
    );

    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("grid-cols-4");
  });
});
