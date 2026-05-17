/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import FinancialChart from '@/components/dashboard/FinancialChart';
import { revenueData } from '@/lib/mock/financial-data';

describe('FinancialChart Component', () => {
  const defaultProps = {
    data: revenueData,
  };

  it('should render the chart title', () => {
    render(<FinancialChart {...defaultProps} />);
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
  });

  it('should render line chart with responsive container', () => {
    const { container } = render(<FinancialChart {...defaultProps} />);
    const responsiveContainer = container.querySelector(
      '[class*="recharts-responsive-container"]'
    );
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should display average revenue stat', () => {
    const { container } = render(<FinancialChart {...defaultProps} />);
    expect(screen.getByText('Average')).toBeInTheDocument();
    // Average of all values
    const avgRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0) / revenueData.length;
    const expectedAvg = `$${(avgRevenue / 1000).toFixed(1)}K`;
    expect(container.textContent).toContain(expectedAvg);
  });

  it('should display highest revenue stat', () => {
    const { container } = render(<FinancialChart {...defaultProps} />);
    expect(screen.getByText('Highest')).toBeInTheDocument();
    const maxRevenue = Math.max(...revenueData.map((item) => item.revenue));
    const expectedMax = `$${(maxRevenue / 1000).toFixed(1)}K`;
    expect(container.textContent).toContain(expectedMax);
  });

  it('should display lowest revenue stat', () => {
    const { container } = render(<FinancialChart {...defaultProps} />);
    expect(screen.getByText('Lowest')).toBeInTheDocument();
    const minRevenue = Math.min(...revenueData.map((item) => item.revenue));
    const expectedMin = `$${(minRevenue / 1000).toFixed(1)}K`;
    expect(container.textContent).toContain(expectedMin);
  });

  it('should have summary stat boxes with correct styling', () => {
    const { container } = render(<FinancialChart {...defaultProps} />);
    const statBoxes = container.querySelectorAll('[class*="rounded"][class*="border"]');
    // Should have at least 3 stat boxes (Average, Highest, Lowest)
    expect(statBoxes.length).toBeGreaterThanOrEqual(3);
  });

  it('should have accessibility attributes', () => {
    render(<FinancialChart {...defaultProps} />);
    const accessibleDiv = screen.getByRole('img', { hidden: true });
    expect(accessibleDiv).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Monthly revenue chart')
    );
  });

  it('should render chart container with proper styling', () => {
    const { container } = render(<FinancialChart {...defaultProps} />);
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('bg-white');
    expect(mainDiv).toHaveClass('border');
    expect(mainDiv).toHaveClass('border-gray-200');
    expect(mainDiv).toHaveClass('rounded-lg');
  });

  it('should handle custom data and calculate stats correctly', () => {
    const customData = [{ month: 'Test', revenue: 50000 }];
    const { container } = render(<FinancialChart data={customData} />);
    // Check that average/min/max are calculated for custom data
    expect(container.textContent).toContain('$50.0K');
  });

  it('should display revenue values formatted in thousands', () => {
    const { container } = render(<FinancialChart {...defaultProps} />);
    // Should show values like "$28.5K" for December revenue of 28500
    expect(container.textContent).toContain('$28.5K');
  });

  it('should have proper margins and padding', () => {
    const { container } = render(<FinancialChart {...defaultProps} />);
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('p-6');
  });

  it('should calculate correct statistics for data', () => {
    const { container } = render(<FinancialChart {...defaultProps} />);
    const textContent = container.textContent || '';

    // Jan = 18500, Dec = 28500
    // Highest should be Dec at $28.5K
    expect(textContent).toContain('$28.5K');
    // Lowest should be Jan at $18.5K
    expect(textContent).toContain('$18.5K');
  });

  it('should render multiple stat labels', () => {
    render(<FinancialChart {...defaultProps} />);
    expect(screen.getByText('Average')).toBeInTheDocument();
    expect(screen.getByText('Highest')).toBeInTheDocument();
    expect(screen.getByText('Lowest')).toBeInTheDocument();
  });

  it('should render legend for the chart', () => {
    render(<FinancialChart {...defaultProps} />);
    // Legend should display "Monthly Revenue"
    const legendText = screen.queryAllByText('Monthly Revenue');
    expect(legendText.length).toBeGreaterThanOrEqual(1);
  });

  it('should render with correct structure', () => {
    const { container } = render(<FinancialChart {...defaultProps} />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('rounded-lg');
    // Check for stat grid
    const gridDiv = container.querySelector('[class*="grid"][class*="grid-cols-3"]');
    expect(gridDiv).toBeInTheDocument();
  });

  it('should have all stat sections with colored backgrounds', () => {
    const { container } = render(<FinancialChart {...defaultProps} />);
    // Average box should be blue
    expect(container.querySelector('[class*="bg-blue-50"]')).toBeInTheDocument();
    // Highest box should be green
    expect(container.querySelector('[class*="bg-green-50"]')).toBeInTheDocument();
    // Lowest box should be amber
    expect(container.querySelector('[class*="bg-amber-50"]')).toBeInTheDocument();
  });
});
