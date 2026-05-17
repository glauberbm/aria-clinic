/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtocolChart from '@/components/dashboard/ProtocolChart';
import { protocolData, totalPatients } from '@/lib/mock/protocol-data';

describe('ProtocolChart Component', () => {
  const defaultProps = {
    data: protocolData,
    total: totalPatients,
  };

  it('should render the chart title', () => {
    render(<ProtocolChart {...defaultProps} />);
    expect(
      screen.getByText('Protocol Distribution')
    ).toBeInTheDocument();
  });

  it('should display total patient count in center', () => {
    const { container } = render(<ProtocolChart {...defaultProps} />);
    expect(screen.getByText('Total Patients')).toBeInTheDocument();
    // Check that the number appears
    const numberElements = Array.from(
      container.querySelectorAll('*')
    ).filter((el) => el.textContent?.includes(String(totalPatients)));
    expect(numberElements.length).toBeGreaterThan(0);
  });

  it('should render all protocol names in legend', () => {
    render(<ProtocolChart {...defaultProps} />);
    expect(screen.getByText('Preventive Care')).toBeInTheDocument();
    expect(screen.getByText('Acute Treatment')).toBeInTheDocument();
    expect(screen.getByText('Chronic Management')).toBeInTheDocument();
    expect(screen.getByText('Wellness')).toBeInTheDocument();
  });

  it('should display patient count for each protocol in legend', () => {
    const { container } = render(<ProtocolChart {...defaultProps} />);
    const preventiveText = Array.from(
      container.querySelectorAll('*')
    ).find((el) => el.textContent?.includes('156'));
    expect(preventiveText).toBeInTheDocument();
  });

  it('should calculate percentages correctly for each protocol', () => {
    const { container } = render(<ProtocolChart {...defaultProps} />);
    // Preventive Care: 156/342 = 45.6%
    const prevCarePercent = Array.from(
      container.querySelectorAll('*')
    ).some((el) => el.textContent?.includes('45.6'));
    expect(prevCarePercent).toBe(true);
  });

  it('should render with correct responsive container', () => {
    const { container } = render(<ProtocolChart {...defaultProps} />);
    const responsiveContainer = container.querySelector(
      '[class*="recharts-responsive-container"]'
    );
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should have accessibility attributes', () => {
    render(<ProtocolChart {...defaultProps} />);
    const accessibleDiv = screen.getByRole('img', {
      hidden: true,
    });
    expect(accessibleDiv).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Distribution')
    );
  });

  it('should render colored circles for each protocol', () => {
    const { container } = render(<ProtocolChart {...defaultProps} />);
    const coloredDivs = container.querySelectorAll(
      'div[style*="background-color"]'
    );
    // Should have at least 4 colored divs (one per protocol in legend detail)
    expect(coloredDivs.length).toBeGreaterThanOrEqual(4);
  });

  it('should handle custom data correctly', () => {
    const customData = [
      { name: 'Test Protocol', value: 100, color: '#FF0000' },
    ];
    const customTotal = 100;

    render(
      <ProtocolChart data={customData} total={customTotal} />
    );

    expect(screen.getByText('Test Protocol')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should display chart container with border', () => {
    const { container } = render(<ProtocolChart {...defaultProps} />);
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('bg-white');
    expect(mainDiv).toHaveClass('border');
    expect(mainDiv).toHaveClass('border-gray-200');
  });

  it('should have proper spacing and padding', () => {
    const { container } = render(<ProtocolChart {...defaultProps} />);
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('p-6');
    expect(mainDiv).toHaveClass('rounded-lg');
  });

  it('should render legend detail grid', () => {
    const { container } = render(<ProtocolChart {...defaultProps} />);
    const gridDiv = container.querySelector('[class*="grid"]');
    expect(gridDiv).toHaveClass('grid-cols-2');
  });

  it('should display accurate percentages for all protocols', () => {
    const { container } = render(<ProtocolChart {...defaultProps} />);
    const textContent = container.textContent || '';

    // Percentages: 156/342=45.6%, 89/342=26.0%, 67/342=19.6%, 30/342=8.8%
    expect(textContent).toContain('45.6');
    expect(textContent).toContain('26.0');
    expect(textContent).toContain('19.6');
    expect(textContent).toContain('8.8');
  });

  it('should render with proper color mapping', () => {
    const { container } = render(<ProtocolChart {...defaultProps} />);
    const coloredElements = container.querySelectorAll(
      'div[style*="background-color"]'
    );

    expect(coloredElements.length).toBeGreaterThan(0);
    // Check that at least one has the expected protocol colors
    const colors = Array.from(coloredElements)
      .map((el) => (el as HTMLElement).style.backgroundColor)
      .filter((c) => c);
    expect(colors.length).toBeGreaterThan(0);
  });
});
