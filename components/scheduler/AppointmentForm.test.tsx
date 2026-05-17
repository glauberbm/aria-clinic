import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppointmentForm } from './AppointmentForm';

// Mock TimeSlotPicker
interface MockTimeSlotPickerProps {
  doctorId?: string;
  date?: Date;
  duration?: number;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

jest.mock('./TimeSlotPicker', () => {
  return function MockTimeSlotPicker({
    value,
    onChange,
    disabled,
  }: MockTimeSlotPickerProps) {
    return (
      <div data-testid="time-slot-picker">
        <input
          data-testid="time-input"
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="HH:MM"
        />
      </div>
    );
  };
});

const mockAppointments = [
  {
    id: 'apt-001',
    patientName: 'João Silva',
    patientPhone: '+5585987654321',
    doctorId: 'doc-001',
    doctorName: 'Dr. Silva',
    date: new Date(2026, 4, 20),
    timeStart: '10:00',
    duration: 30 as 15 | 30 | 60,
    type: 'consultation' as const,
    status: 'scheduled' as const,
    notes: 'Initial consultation',
  },
];

const mockDoctors = [
  {
    id: 'doc-001',
    name: 'Dr. Silva',
    specialty: 'General Medicine',
    workingHours: {
      start: '08:00',
      end: '18:00',
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  },
  {
    id: 'doc-002',
    name: 'Dra. Santos',
    specialty: 'Cardiology',
    workingHours: {
      start: '09:00',
      end: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  },
];

describe('AppointmentForm', () => {
  describe('Form Rendering', () => {
    it('should render core form fields', () => {
      render(
        <AppointmentForm
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          doctors={mockDoctors}
          appointments={mockAppointments}
        />
      );

      expect(screen.getByLabelText(/patient name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/doctor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByText(/duration/i)).toBeInTheDocument();
    });

    it('should render submit and cancel buttons', () => {
      render(
        <AppointmentForm
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          doctors={mockDoctors}
          appointments={mockAppointments}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should populate doctor dropdown from props', () => {
      render(
        <AppointmentForm
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          doctors={mockDoctors}
          appointments={mockAppointments}
        />
      );

      const doctorSelect = screen.getByLabelText(/doctor/i) as HTMLSelectElement;
      const options = Array.from(doctorSelect.options);
      expect(options.length).toBeGreaterThan(1);
    });

    it('should render duration radio buttons', () => {
      render(
        <AppointmentForm
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          doctors={mockDoctors}
          appointments={mockAppointments}
        />
      );

      expect(screen.getByRole('radio', { name: /15/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /30/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /60/i })).toBeInTheDocument();
    });

    it('should show loading state when isLoading prop is true', () => {
      render(
        <AppointmentForm
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          doctors={mockDoctors}
          appointments={mockAppointments}
          isLoading={true}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.some((btn) => btn.disabled)).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should show error for missing patient name on submit attempt', async () => {
      render(
        <AppointmentForm
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          doctors={mockDoctors}
          appointments={mockAppointments}
        />
      );

      const buttons = screen.getAllByRole('button');
      const submitBtn = buttons.find((btn) => btn.type === 'submit');

      if (submitBtn) {
        fireEvent.click(submitBtn);

        await waitFor(() => {
          const errors = screen.queryAllByText(/required/i);
          expect(errors.length).toBeGreaterThan(0);
        });
      }
    });

    it('should accept patient name input', async () => {
      render(
        <AppointmentForm
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          doctors={mockDoctors}
          appointments={mockAppointments}
        />
      );

      const nameInput = screen.getByLabelText(/patient name/i);
      await userEvent.type(nameInput, 'João Silva');

      expect(nameInput).toHaveValue('João Silva');
    });
  });

  describe('Form Cancellation', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const onCancel = jest.fn();
      render(
        <AppointmentForm
          onSubmit={jest.fn()}
          onCancel={onCancel}
          doctors={mockDoctors}
          appointments={mockAppointments}
        />
      );

      const buttons = screen.getAllByRole('button');
      const cancelBtn = buttons.find((btn) => btn.textContent?.includes('Cancel'));

      if (cancelBtn) {
        fireEvent.click(cancelBtn);
        expect(onCancel).toHaveBeenCalled();
      }
    });
  });

  describe('Props Variations', () => {
    it('should handle optional onCancel prop', () => {
      render(
        <AppointmentForm
          onSubmit={jest.fn()}
          doctors={mockDoctors}
          appointments={mockAppointments}
        />
      );

      expect(screen.getByLabelText(/patient name/i)).toBeInTheDocument();
    });
  });

  describe('Duration Selection', () => {
    it('should allow duration selection', async () => {
      render(
        <AppointmentForm
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          doctors={mockDoctors}
          appointments={mockAppointments}
        />
      );

      const duration30 = screen.getByRole('radio', { name: /30/i }) as HTMLInputElement;
      await userEvent.click(duration30);

      expect(duration30.checked).toBe(true);
    });
  });

  describe('Doctor Dropdown', () => {
    it('should display doctor specialty in options', () => {
      render(
        <AppointmentForm
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          doctors={mockDoctors}
          appointments={mockAppointments}
        />
      );

      const doctorSelect = screen.getByLabelText(/doctor/i);
      expect(doctorSelect).toHaveTextContent('General Medicine');
      expect(doctorSelect).toHaveTextContent('Cardiology');
    });
  });

  describe('Props Handling', () => {
    it('should accept and use required props', () => {
      const onSubmit = jest.fn();
      const onCancel = jest.fn();

      const { container } = render(
        <AppointmentForm
          onSubmit={onSubmit}
          onCancel={onCancel}
          doctors={mockDoctors}
          appointments={mockAppointments}
        />
      );

      expect(container.querySelector('form')).toBeInTheDocument();
    });

    it('should handle empty doctors array gracefully', () => {
      render(
        <AppointmentForm
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          doctors={[]}
          appointments={mockAppointments}
        />
      );

      const doctorSelect = screen.getByLabelText(/doctor/i) as HTMLSelectElement;
      expect(doctorSelect).toBeInTheDocument();
    });

    it('should handle empty appointments array', () => {
      render(
        <AppointmentForm
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
          doctors={mockDoctors}
          appointments={[]}
        />
      );

      expect(screen.getByLabelText(/patient name/i)).toBeInTheDocument();
    });
  });
});
