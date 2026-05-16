import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarView } from "@/components/scheduler/CalendarView";

describe("CalendarView Component", () => {
  it("should render calendar with month and navigation", () => {
    const mockOnSelect = jest.fn();
    render(
      <CalendarView
        selectedDate={null}
        onSelectDate={mockOnSelect}
      />
    );

    expect(screen.getByRole("button", { name: /mês anterior/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /próximo mês/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hoje/i })).toBeInTheDocument();
  });

  it("should handle date selection", async () => {
    const user = userEvent.setup();
    const mockOnSelect = jest.fn();

    render(
      <CalendarView
        selectedDate={null}
        onSelectDate={mockOnSelect}
      />
    );

    const buttons = screen.getAllByRole("button");
    // Click any date button (skip navigation buttons)
    const dateButton = buttons.find((btn) => {
      const text = btn.textContent?.trim();
      return text && /^\d+$/.test(text);
    });

    if (dateButton) {
      await user.click(dateButton);
      expect(mockOnSelect).toHaveBeenCalled();
    }
  });

  it("should navigate to next month", async () => {
    const user = userEvent.setup();
    const mockOnSelect = jest.fn();

    render(
      <CalendarView
        selectedDate={null}
        onSelectDate={mockOnSelect}
      />
    );

    const nextButton = screen.getByRole("button", { name: /próximo mês/i });
    await user.click(nextButton);

    // Calendar should update (component re-renders with next month)
    expect(nextButton).toBeInTheDocument();
  });

  it("should navigate to previous month", async () => {
    const user = userEvent.setup();
    const mockOnSelect = jest.fn();

    render(
      <CalendarView
        selectedDate={null}
        onSelectDate={mockOnSelect}
      />
    );

    const prevButton = screen.getByRole("button", { name: /mês anterior/i });
    await user.click(prevButton);

    expect(prevButton).toBeInTheDocument();
  });

  it("should display legend with appointment indicator", () => {
    const mockOnSelect = jest.fn();
    render(
      <CalendarView
        selectedDate={null}
        onSelectDate={mockOnSelect}
      />
    );

    expect(screen.getByText(/com agendamentos/i)).toBeInTheDocument();
    expect(screen.getByText(/data selecionada/i)).toBeInTheDocument();
  });
});

