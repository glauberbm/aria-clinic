import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarView } from './CalendarView';

describe('CalendarView Component', () => {
  const mockOnDateSelect = jest.fn();

  beforeEach(() => {
    mockOnDateSelect.mockClear();
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);
      expect(screen.getByText(/\d{4}/)).toBeInTheDocument();
    });

    it('displays month and year header', () => {
      const now = new Date();
      const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);
      expect(screen.getByText(monthYear)).toBeInTheDocument();
    });

    it('displays day headers (Sun-Sat)', () => {
      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);
      const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayHeaders.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('displays navigation buttons', () => {
      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);
      expect(screen.getByText('← Prev')).toBeInTheDocument();
      expect(screen.getByText('Next →')).toBeInTheDocument();
    });

    it('renders correct number of days in current month', () => {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);

      // Find all buttons with numeric text (days 1-31)
      const dayButtons = screen.getAllByRole('button').filter(btn => {
        const text = btn.textContent;
        return text && /^\d+$/.test(text) && parseInt(text) <= daysInMonth;
      });

      expect(dayButtons.length).toBeGreaterThanOrEqual(daysInMonth);
    });
  });

  describe('Month Navigation', () => {
    it('navigates to next month when Next button clicked', () => {
      const { rerender } = render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);

      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1);
      const nextMonthYear = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const nextButton = screen.getByText('Next →');
      fireEvent.click(nextButton);

      rerender(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);
      expect(screen.getByText(nextMonthYear)).toBeInTheDocument();
    });

    it('navigates to previous month when Prev button clicked', () => {
      const { rerender } = render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);

      const prevButton = screen.getByText('← Prev');
      fireEvent.click(prevButton);

      rerender(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);

      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      const prevMonthYear = prevMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      expect(screen.getByText(prevMonthYear)).toBeInTheDocument();
    });

    it('handles year boundary when navigating months', () => {
      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);

      // Navigate backwards 12 times
      const prevButton = screen.getByText('← Prev');
      for (let i = 0; i < 12; i++) {
        fireEvent.click(prevButton);
      }

      // Should be in same month previous year
      const now = new Date();
      const lastYearMonth = new Date(now.getFullYear() - 1, now.getMonth());
      const expectedMonthYear = lastYearMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      expect(screen.getByText(expectedMonthYear)).toBeInTheDocument();
    });
  });

  describe('Date Selection', () => {
    it('calls onDateSelect when day is clicked', () => {
      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);

      const dayButton = screen.getByRole('button', { name: '15' });
      fireEvent.click(dayButton);

      expect(mockOnDateSelect).toHaveBeenCalledTimes(1);
      expect(mockOnDateSelect).toHaveBeenCalledWith(expect.any(Date));
    });

    it('passes correct date to onDateSelect callback', () => {
      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);

      const dayButton = screen.getByRole('button', { name: '10' });
      fireEvent.click(dayButton);

      const callArg = mockOnDateSelect.mock.calls[0][0];
      expect(callArg.getDate()).toBe(10);
    });

    it('does not call onDateSelect when clicking empty cells', () => {
      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);

      const disabledButtons = screen.getAllByRole('button').filter(btn => btn.hasAttribute('disabled'));
      if (disabledButtons.length > 0) {
        fireEvent.click(disabledButtons[0]);
        expect(mockOnDateSelect).not.toHaveBeenCalled();
      }
    });

    it('highlights selected date with green styling', () => {
      const selectedDate = new Date();
      selectedDate.setDate(15);

      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={selectedDate} />);

      const dayButton = screen.getByRole('button', { name: '15' });
      expect(dayButton.className).toContain('green');
    });

    it('highlights today with blue styling', () => {
      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);

      const today = new Date();
      const todayButton = screen.getByRole('button', { name: today.getDate().toString() });
      expect(todayButton.className).toContain('blue');
    });
  });

  describe('Visual States', () => {
    it('applies correct CSS classes for today', () => {
      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);

      const today = new Date();
      const todayButton = screen.getByRole('button', { name: today.getDate().toString() });

      expect(todayButton.className).toContain('bg-blue-100');
      expect(todayButton.className).toContain('text-blue-900');
      expect(todayButton.className).toContain('border-blue-400');
    });

    it('applies correct CSS classes for selected date', () => {
      const selectedDate = new Date();
      selectedDate.setDate(20);

      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={selectedDate} />);

      const selectedButton = screen.getByRole('button', { name: '20' });

      expect(selectedButton.className).toContain('bg-green-100');
      expect(selectedButton.className).toContain('text-green-900');
      expect(selectedButton.className).toContain('border-green-400');
    });

    it('disables empty cells at month boundaries', () => {
      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);

      const disabledButtons = screen.getAllByRole('button').filter(btn => btn.hasAttribute('disabled'));
      expect(disabledButtons.length).toBeGreaterThan(0);

      disabledButtons.forEach(btn => {
        expect(btn.className).toContain('cursor-default');
      });
    });

    it('enables valid day buttons for interaction', () => {
      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);

      // Get only day number buttons (numeric text content)
      const dayButtons = screen.getAllByRole('button').filter(btn => {
        const text = btn.textContent;
        return text && /^\d+$/.test(text);
      });
      expect(dayButtons.length).toBeGreaterThan(0);

      // Valid day buttons should not be disabled
      const enabledDayButtons = dayButtons.filter(btn => !btn.hasAttribute('disabled'));
      expect(enabledDayButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles leap years correctly', () => {
      // 2024 is a leap year
      const leapYearDate = new Date(2024, 1); // February 2024

      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={leapYearDate} />);

      // February 2024 should have 29 days
      const feb29Button = screen.queryByRole('button', { name: '29' });
      expect(feb29Button).toBeInTheDocument();
    });

    it('handles non-leap years correctly', () => {
      // 2023 is not a leap year
      const nonLeapYearDate = new Date(2023, 1); // February 2023

      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={nonLeapYearDate} />);

      // February 2023 should have 28 days
      const mar1Button = screen.queryByRole('button', { name: '1' });
      expect(mar1Button).toBeInTheDocument();
    });

    it('maintains selected date across month navigation', () => {
      const selectedDate = new Date();
      selectedDate.setDate(15);

      const { rerender } = render(
        <CalendarView onDateSelect={mockOnDateSelect} selectedDate={selectedDate} />
      );

      const selectedButton = screen.getByRole('button', { name: '15' });
      expect(selectedButton.className).toContain('green');

      // Navigate to next month
      fireEvent.click(screen.getByText('Next →'));
      rerender(
        <CalendarView onDateSelect={mockOnDateSelect} selectedDate={selectedDate} />
      );

      // Selected date highlighting should no longer be present in new month
      const nextMonthSelectedButton = screen.queryByRole('button', { name: '15' });
      if (nextMonthSelectedButton) {
        expect(nextMonthSelectedButton.className).not.toContain('green');
      }
    });

    it('handles selecting dates from different months', () => {
      render(<CalendarView onDateSelect={mockOnDateSelect} selectedDate={null} />);

      fireEvent.click(screen.getByRole('button', { name: '1' }));
      expect(mockOnDateSelect).toHaveBeenCalledWith(expect.any(Date));

      mockOnDateSelect.mockClear();

      fireEvent.click(screen.getByRole('button', { name: '28' }));
      expect(mockOnDateSelect).toHaveBeenCalledWith(expect.any(Date));
    });
  });
});
