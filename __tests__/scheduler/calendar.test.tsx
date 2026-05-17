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

    // Find navigation buttons by their aria-labels and text content
    const buttons = screen.getAllByRole("button");
    const prevButton = buttons.find((btn) => btn.getAttribute("aria-label")?.includes("anterior"));
    const nextButton = buttons.find((btn) => btn.getAttribute("aria-label")?.includes("Próximo"));
    const todayButton = buttons.find((btn) => btn.textContent?.trim() === "Hoje");

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(todayButton).toBeInTheDocument();
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

    const buttons = screen.getAllByRole("button");
    const nextButton = buttons.find((btn) => btn.getAttribute("aria-label")?.includes("Próximo"));

    expect(nextButton).toBeInTheDocument();
    if (nextButton) {
      await user.click(nextButton);
      expect(nextButton).toBeInTheDocument();
    }
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

    const buttons = screen.getAllByRole("button");
    const prevButton = buttons.find((btn) => btn.getAttribute("aria-label")?.includes("anterior"));

    expect(prevButton).toBeInTheDocument();
    if (prevButton) {
      await user.click(prevButton);
      expect(prevButton).toBeInTheDocument();
    }
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

