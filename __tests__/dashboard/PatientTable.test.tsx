/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PatientTable from '@/components/dashboard/PatientTable';
import { patientData } from '@/lib/mock/patient-data';

describe('PatientTable Component', () => {
  const defaultProps = {
    data: patientData,
  };

  it('should render the table with headers', () => {
    render(<PatientTable {...defaultProps} />);
    expect(screen.getByText('Patient Name')).toBeInTheDocument();
    expect(screen.getByText('Patient ID')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Protocol')).toBeInTheDocument();
    expect(screen.getByText('Last Appointment')).toBeInTheDocument();
  });

  it('should render all patient rows', () => {
    render(<PatientTable {...defaultProps} />);
    // Should have 10 patient rows
    patientData.forEach((patient) => {
      expect(screen.getByText(patient.name)).toBeInTheDocument();
      expect(screen.getByText(patient.id)).toBeInTheDocument();
    });
  });

  it('should display patient data correctly', () => {
    render(<PatientTable {...defaultProps} />);
    const firstPatient = patientData[0];
    expect(screen.getByText(firstPatient.name)).toBeInTheDocument();
    expect(screen.getByText(firstPatient.id)).toBeInTheDocument();
    expect(screen.getByText(firstPatient.phone)).toBeInTheDocument();
    // Check protocol appears in table (may appear multiple times)
    expect(screen.getAllByText(firstPatient.protocol).length).toBeGreaterThan(0);
  });

  it('should default sort by lastAppointment in descending order', () => {
    render(<PatientTable {...defaultProps} />);
    const rows = screen.getAllByRole('row');
    // Skip header row, check first data row has most recent appointment
    const firstDataCell = rows[1].querySelector('td:nth-child(5)');
    // Check for May 2026 - exact day may vary due to timezone
    expect(firstDataCell?.textContent).toMatch(/May \d{1,2}, 2026/);
  });

  it('should sort by name when header is clicked', () => {
    render(<PatientTable {...defaultProps} />);
    const nameHeader = screen.getByText('Patient Name');
    fireEvent.click(nameHeader);
    const rows = screen.getAllByRole('row');
    // First data row should have "Amanda Brooks" (A comes first when sorting asc)
    const firstNameCell = rows[1].querySelector('td:nth-child(1)');
    expect(firstNameCell?.textContent).toContain('Amanda Brooks');
  });

  it('should toggle sort order when clicking same header twice', () => {
    render(<PatientTable {...defaultProps} />);
    const nameHeader = screen.getByText('Patient Name');

    // First click: ascending
    fireEvent.click(nameHeader);
    let rows = screen.getAllByRole('row');
    let firstNameCell = rows[1].querySelector('td:nth-child(1)');
    expect(firstNameCell?.textContent).toContain('Amanda Brooks');

    // Second click: descending
    fireEvent.click(nameHeader);
    rows = screen.getAllByRole('row');
    firstNameCell = rows[1].querySelector('td:nth-child(1)');
    expect(firstNameCell?.textContent).toContain('Sarah Anderson');
  });

  it('should sort by protocol when header is clicked', () => {
    render(<PatientTable {...defaultProps} />);
    const protocolHeader = screen.getByText('Protocol');
    fireEvent.click(protocolHeader);
    const rows = screen.getAllByRole('row');
    const firstProtocolCell = rows[1].querySelector('td:nth-child(4)');
    // "Acute Treatment" comes first alphabetically
    expect(firstProtocolCell?.textContent).toContain('Acute Treatment');
  });

  it('should sort by lastAppointment when header is clicked', () => {
    render(<PatientTable {...defaultProps} />);
    const dateHeader = screen.getByText('Last Appointment');
    fireEvent.click(dateHeader);
    const rows = screen.getAllByRole('row');
    const firstDateCell = rows[1].querySelector('td:nth-child(5)');
    // Should be oldest date in ascending order (May 4 or 5, 2026)
    expect(firstDateCell?.textContent).toMatch(/May [45], 2026/);
  });

  it('should display formatted dates correctly', () => {
    const { container } = render(<PatientTable {...defaultProps} />);
    // Check that dates are displayed in "Month Day, Year" format
    const datePattern = /May \d{1,2}, 2026/;
    const matches = container.textContent?.match(datePattern);
    expect(matches).not.toBeNull();
  });

  it('should have hover effect on rows', () => {
    const { container } = render(<PatientTable {...defaultProps} />);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0]).toHaveClass('hover:bg-gray-50');
  });

  it('should have sortable headers with aria-sort attributes', () => {
    render(<PatientTable {...defaultProps} />);
    const nameHeader = screen.getByText('Patient Name').closest('th');
    expect(nameHeader).toHaveAttribute('aria-sort', 'none');

    fireEvent.click(nameHeader!);
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

    fireEvent.click(nameHeader!);
    expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
  });

  it('should update aria-sort when switching sort fields', () => {
    render(<PatientTable {...defaultProps} />);
    const nameHeader = screen.getByText('Patient Name').closest('th');
    const protocolHeader = screen.getByText('Protocol').closest('th');

    fireEvent.click(nameHeader!);
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    expect(protocolHeader).toHaveAttribute('aria-sort', 'none');

    fireEvent.click(protocolHeader!);
    expect(nameHeader).toHaveAttribute('aria-sort', 'none');
    expect(protocolHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('should have proper table structure', () => {
    const { container } = render(<PatientTable {...defaultProps} />);
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    expect(container.querySelector('thead')).toBeInTheDocument();
    expect(container.querySelector('tbody')).toBeInTheDocument();
  });

  it('should handle custom data prop', () => {
    const customData = [
      {
        id: 'PT-TEST',
        name: 'Test Patient',
        phone: '(555) 999-9999',
        protocol: 'Test Protocol',
        lastAppointment: '2026-05-15',
      },
    ];
    render(<PatientTable data={customData} />);
    expect(screen.getByText('Test Patient')).toBeInTheDocument();
    expect(screen.getByText('PT-TEST')).toBeInTheDocument();
  });

  it('should render header cells with proper styling', () => {
    const { container } = render(<PatientTable {...defaultProps} />);
    const headerCells = container.querySelectorAll('thead th');
    expect(headerCells.length).toBe(5);
    headerCells.forEach((cell) => {
      expect(cell).toHaveClass('font-semibold');
      expect(cell).toHaveClass('text-gray-900');
    });
  });

  it('should have sortable header indicators', () => {
    render(<PatientTable {...defaultProps} />);
    const nameHeader = screen.getByText('Patient Name');
    fireEvent.click(nameHeader);

    // Check for chevron icon
    const icon = nameHeader.parentElement?.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should maintain sort state when re-rendering', () => {
    const { rerender } = render(<PatientTable {...defaultProps} />);
    const nameHeader = screen.getByText('Patient Name');
    fireEvent.click(nameHeader);

    let rows = screen.getAllByRole('row');
    let firstNameCell = rows[1].querySelector('td:nth-child(1)');
    expect(firstNameCell?.textContent).toContain('Amanda Brooks');

    // Re-render with same props
    rerender(<PatientTable {...defaultProps} />);

    // Sort state should persist
    rows = screen.getAllByRole('row');
    firstNameCell = rows[1].querySelector('td:nth-child(1)');
    expect(firstNameCell?.textContent).toContain('Amanda Brooks');
  });

  it('should handle empty custom data gracefully', () => {
    render(<PatientTable data={[]} />);
    expect(screen.getByText('Patient Name')).toBeInTheDocument();
    const rows = screen.getAllByRole('row');
    // Only header row should exist
    expect(rows.length).toBe(1);
  });
});
