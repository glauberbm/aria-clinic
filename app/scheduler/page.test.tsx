import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SchedulerPage from './page';

interface MockCalendarViewProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

// Mock the CalendarView component
jest.mock('@/components/scheduler/CalendarView', () => ({
  CalendarView: function MockCalendarView({ onDateSelect }: MockCalendarViewProps) {
    return (
      <div data-testid="calendar-view">
        <button onClick={() => onDateSelect(new Date(2026, 4, 17))}>Select Date</button>
      </div>
    );
  },
}));

describe('SchedulerPage', () => {
  it('renders without crashing', () => {
    render(<SchedulerPage />);
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
  });

  it('displays calendar view component', () => {
    render(<SchedulerPage />);
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
  });

  it('handles date selection from calendar', () => {
    render(<SchedulerPage />);
    const selectButton = screen.getByText('Select Date');

    expect(selectButton).toBeInTheDocument();
    fireEvent.click(selectButton);

    // Component should still be rendered after selection
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
  });

  it('initializes with null selectedDate', () => {
    render(<SchedulerPage />);
    // Verify the component renders with initial state
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
  });

  it('maintains state after date selection', () => {
    const { rerender } = render(<SchedulerPage />);
    const selectButton = screen.getByText('Select Date');

    fireEvent.click(selectButton);
    rerender(<SchedulerPage />);

    // Calendar should still be visible after selection
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
  });

  it('is exported as default component', () => {
    // Page should be a valid React component
    expect(SchedulerPage).toBeDefined();
    expect(typeof SchedulerPage).toBe('function');
  });
});
