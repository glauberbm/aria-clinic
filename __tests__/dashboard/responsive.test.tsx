/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';

describe('Dashboard Responsive Layout', () => {
  // Mock window.matchMedia for responsive tests
  const mockMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  };

  it('should render dashboard page', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Aria Clinic Dashboard')).toBeInTheDocument();
  });

  it('should render all dashboard sections', () => {
    render(<DashboardPage />);
    // KPI Cards section
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    // Charts section (Protocol and Financial charts should render)
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    // Patient List section
    expect(screen.getByText('Recent Patients')).toBeInTheDocument();
  });

  it('should have proper grid structure for KPI cards', () => {
    const { container } = render(<DashboardPage />);
    const kpiGrid = container.querySelector('[class*="grid"][class*="grid-cols"]');
    expect(kpiGrid).toBeInTheDocument();
    expect(kpiGrid).toHaveClass('grid');
    expect(kpiGrid).toHaveClass('gap-6');
  });

  it('should have responsive KPI grid classes', () => {
    const { container } = render(<DashboardPage />);
    const kpiGrid = container.querySelector('[class*="grid-cols-1"]');
    expect(kpiGrid).toHaveClass('md:grid-cols-2');
    expect(kpiGrid).toHaveClass('lg:grid-cols-4');
  });

  it('should have responsive chart grid', () => {
    const { container } = render(<DashboardPage />);
    const chartGrid = container.querySelectorAll('[class*="lg:grid-cols-2"]');
    // Should have charts grid with responsive classes
    expect(chartGrid.length).toBeGreaterThan(0);
  });

  it('should render PatientTable component', () => {
    render(<DashboardPage />);
    // Table headers should be present
    expect(screen.getByText('Patient Name')).toBeInTheDocument();
    expect(screen.getByText('Patient ID')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Protocol')).toBeInTheDocument();
    expect(screen.getByText('Last Appointment')).toBeInTheDocument();
  });

  it('should have table with overflow handling for mobile', () => {
    const { container } = render(<DashboardPage />);
    const tableContainer = container.querySelector('.overflow-x-auto');
    expect(tableContainer).toBeInTheDocument();
  });

  it('should have proper max-width container', () => {
    const { container } = render(<DashboardPage />);
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('max-w-6xl');
  });

  it('should have proper spacing between sections', () => {
    const { container } = render(<DashboardPage />);
    const sections = container.querySelectorAll('[class*="mt-8"]');
    // Should have margin-top for spacing between sections
    expect(sections.length).toBeGreaterThan(0);
  });

  it('should have title with proper typography', () => {
    render(<DashboardPage />);
    const title = screen.getByText('Dashboard');
    expect(title).toHaveClass('text-3xl');
    expect(title).toHaveClass('font-bold');
    expect(title).toHaveClass('text-gray-900');
  });

  it('should have subtitle text', () => {
    render(<DashboardPage />);
    const subtitle = screen.getByText('Welcome to Aria Clinic Dashboard');
    expect(subtitle).toHaveClass('text-gray-600');
  });

  it('should render section headers with proper styling', () => {
    const { container } = render(<DashboardPage />);
    const headers = container.querySelectorAll('h2');
    headers.forEach((header) => {
      expect(header).toHaveClass('font-semibold');
      expect(header).toHaveClass('text-gray-900');
    });
  });

  it('should have proper card styling for sections', () => {
    const { container } = render(<DashboardPage />);
    // Select only the main section divs with full card styling
    const cards = container.querySelectorAll('[class*="bg-white"][class*="rounded-lg"][class*="border-gray-200"]');
    expect(cards.length).toBeGreaterThan(0);
    cards.forEach((card) => {
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border-gray-200');
    });
  });

  it('should display all chart components', () => {
    render(<DashboardPage />);
    // ProtocolChart
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
  });

  it('should have proper responsive classes for all elements', () => {
    const { container } = render(<DashboardPage />);
    // Should contain responsive utility classes
    expect(container.innerHTML).toContain('md:');
    expect(container.innerHTML).toContain('lg:');
  });

  it('should render patient table in card container', () => {
    render(<DashboardPage />);
    const tableCard = screen.getByText('Recent Patients').closest('[class*="bg-white"]');
    expect(tableCard).toHaveClass('rounded-lg');
    expect(tableCard).toHaveClass('border');
    expect(tableCard).toHaveClass('border-gray-200');
    expect(tableCard).toHaveClass('p-6');
  });

  it('should handle mobile viewport gracefully', () => {
    mockMatchMedia(true); // Simulate mobile
    render(<DashboardPage />);
    // Should still render all content
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Patient Name')).toBeInTheDocument();
  });

  it('should handle desktop viewport gracefully', () => {
    mockMatchMedia(false); // Simulate desktop
    render(<DashboardPage />);
    // Should still render all content
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
  });
});
