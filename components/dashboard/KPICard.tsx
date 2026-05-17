import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: number | string;
  unit: string;
  change: number;
  changePercent: number;
  icon: LucideIcon;
  color: 'green' | 'red' | 'blue' | 'yellow';
}

const colorClasses = {
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    badge: 'bg-green-100 text-green-700',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-700',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    badge: 'bg-yellow-100 text-yellow-700',
  },
};

export default function KPICard({
  label,
  value,
  unit,
  change,
  changePercent,
  icon: Icon,
  color,
}: KPICardProps) {
  const isPositive = change >= 0;
  const classes = colorClasses[color];

  return (
    <div
      className={`
        ${classes.bg} ${classes.border}
        border rounded-lg p-6 transition-all duration-200
        hover:shadow-lg hover:scale-105 cursor-pointer
      `}
      role="article"
      aria-label={`${label}: ${value} ${unit}`}
    >
      {/* Header with Icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">{label}</h3>
        <div className={`${classes.icon} p-2 bg-white rounded-lg`}>
          <Icon size={20} aria-hidden="true" />
        </div>
      </div>

      {/* Value */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          <span className="text-sm text-gray-500">{unit}</span>
        </div>
      </div>

      {/* Change Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`${classes.badge} px-2 py-1 rounded text-xs font-semibold flex items-center gap-1`}
        >
          {isPositive ? (
            <TrendingUp size={14} aria-hidden="true" />
          ) : (
            <TrendingDown size={14} aria-hidden="true" />
          )}
          <span>{Math.abs(changePercent)}%</span>
        </div>
        <span className="text-xs text-gray-500">vs. last period</span>
      </div>
    </div>
  );
}
