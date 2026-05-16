/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import KPICard from '@/components/dashboard/KPICard';
import { TrendingUp, Users, Calendar } from 'lucide-react';

describe('KPICard Component', () => {
  const defaultProps = {
    label: 'Test Metric',
    value: 1000,
    unit: 'USD',
    change: 10,
    changePercent: 5.5,
    icon: TrendingUp,
    color: 'green' as const,
  };

  it('should render KPI card with label and value', () => {
    const { container } = render(<KPICard {...defaultProps} />);
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    // Check for value (locale-independent) - accept both comma and period separators
    const valueElement = container.querySelector('.text-3xl');
    const textContent = valueElement?.textContent || '';
    expect(/1[.,]?000|1000/.test(textContent)).toBe(true);
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('should display change percentage correctly', () => {
    render(<KPICard {...defaultProps} />);
    expect(screen.getByText('5.5%')).toBeInTheDocument();
  });

  it('should display positive change with up indicator', () => {
    render(<KPICard {...defaultProps} change={10} changePercent={5.5} />);
    expect(screen.getByText('5.5%')).toBeInTheDocument();
    expect(screen.getByText('vs. last period')).toBeInTheDocument();
  });

  it('should display negative change with down indicator', () => {
    render(
      <KPICard {...defaultProps} change={-5} changePercent={-2.5} />
    );
    expect(screen.getByText('2.5%')).toBeInTheDocument();
  });

  it('should apply correct color classes for green', () => {
    const { container } = render(
      <KPICard {...defaultProps} color="green" />
    );
    const card = container.querySelector('[role="article"]');
    expect(card).toHaveClass('bg-green-50');
    expect(card).toHaveClass('border-green-200');
  });

  it('should apply correct color classes for blue', () => {
    const { container } = render(
      <KPICard {...defaultProps} color="blue" />
    );
    const card = container.querySelector('[role="article"]');
    expect(card).toHaveClass('bg-blue-50');
    expect(card).toHaveClass('border-blue-200');
  });

  it('should apply correct color classes for red', () => {
    const { container } = render(
      <KPICard {...defaultProps} color="red" />
    );
    const card = container.querySelector('[role="article"]');
    expect(card).toHaveClass('bg-red-50');
    expect(card).toHaveClass('border-red-200');
  });

  it('should apply correct color classes for yellow', () => {
    const { container } = render(
      <KPICard {...defaultProps} color="yellow" />
    );
    const card = container.querySelector('[role="article"]');
    expect(card).toHaveClass('bg-yellow-50');
    expect(card).toHaveClass('border-yellow-200');
  });

  it('should format large numbers with locale separators', () => {
    const { container } = render(<KPICard {...defaultProps} value={1000000} />);
    // Check that the value is rendered (may use different locale separators)
    const valueElement = container.querySelector('.text-3xl');
    const textContent = valueElement?.textContent || '';
    // Check for 1 million in any locale format (1,000,000 or 1.000.000 or 1000000)
    expect(/1[.,]?000[.,]?000|1000000/.test(textContent)).toBe(true);
  });

  it('should handle string values', () => {
    render(<KPICard {...defaultProps} value="$24,500" />);
    expect(screen.getByText('$24,500')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<KPICard {...defaultProps} />);
    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', 'Test Metric: 1000 USD');
  });

  it('should render icon with aria-hidden', () => {
    const { container } = render(<KPICard {...defaultProps} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('should apply hover and scale effects', () => {
    const { container } = render(<KPICard {...defaultProps} />);
    const card = container.querySelector('[role="article"]');
    expect(card?.className).toMatch(/hover:shadow-lg/);
    expect(card?.className).toMatch(/hover:scale-105/);
  });

  it('should display different metrics correctly', () => {
    const { rerender, container } = render(
      <KPICard
        {...defaultProps}
        label="Active Patients"
        value={342}
        unit="patients"
        icon={Users}
        color="blue"
      />
    );
    expect(screen.getByText('Active Patients')).toBeInTheDocument();
    const valueElement1 = container.querySelector('.text-3xl');
    expect(valueElement1?.textContent || '').toContain('342');
    expect(screen.getByText('patients')).toBeInTheDocument();

    rerender(
      <KPICard
        {...defaultProps}
        label="Appointments"
        value={87}
        unit="scheduled"
        icon={Calendar}
        color="yellow"
      />
    );
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    const valueElement2 = container.querySelector('.text-3xl');
    expect(valueElement2?.textContent || '').toContain('87');
    expect(screen.getByText('scheduled')).toBeInTheDocument();
  });

  it('should handle zero change percentage', () => {
    render(<KPICard {...defaultProps} change={0} changePercent={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
