import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WaitlistForm } from "@/components/scheduler/WaitlistForm";
import { Doctor } from "@/lib/store/scheduler";

const mockDoctors: Doctor[] = [
  {
    id: "doc-1",
    name: "Dra. Amanda Silva",
    specialty: "Harmonização Facial",
    workingHours: {
      start: "09:00",
      end: "17:00",
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  },
  {
    id: "doc-2",
    name: "Dr. Carlos Mendes",
    specialty: "Botox & Preenchimento",
    workingHours: {
      start: "10:00",
      end: "18:00",
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  },
];

describe("WaitlistForm Component", () => {
  it("should render form fields", () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <WaitlistForm onSubmit={mockOnSubmit} doctors={mockDoctors} isLoading={false} />
    );

    expect(screen.getByLabelText(/Patient Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferred Doctor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferred Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferred Time/i)).toBeInTheDocument();
  });

  it("should show doctor options", () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <WaitlistForm onSubmit={mockOnSubmit} doctors={mockDoctors} isLoading={false} />
    );

    const doctorSelect = screen.getByRole("combobox");
    fireEvent.click(doctorSelect);

    expect(screen.getAllByText(/Dra. Amanda Silva/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Dr. Carlos Mendes/i).length).toBeGreaterThan(0);
  });

  it("should disable submit button when loading", () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <WaitlistForm onSubmit={mockOnSubmit} doctors={mockDoctors} isLoading={true} />
    );

    const submitButton = screen.getByRole("button", { name: /Adding to Waitlist/i });
    expect(submitButton).toBeDisabled();
  });

  it("should require patient name", async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <WaitlistForm onSubmit={mockOnSubmit} doctors={mockDoctors} isLoading={false} />
    );

    const submitButton = screen.getByRole("button", { name: /Add to Waitlist/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Patient name required/i)).toBeInTheDocument();
    });
  });
});
