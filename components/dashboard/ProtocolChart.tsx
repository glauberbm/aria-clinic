'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ProtocolData } from '@/lib/mock/protocol-data';

interface ProtocolChartProps {
  data: ProtocolData[];
  total: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ProtocolData & { totalPatients: number };
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    const total = payload[0].payload.totalPatients || 342;
    const percentage = ((entry.value / total) * 100).toFixed(1);
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
        <p className="text-sm font-semibold text-gray-900">{entry.name}</p>
        <p className="text-sm text-gray-600">{entry.value} patients</p>
        <p className="text-xs text-gray-500">{percentage}%</p>
      </div>
    );
  }
  return null;
};

export default function ProtocolChart({
  data,
  total,
}: ProtocolChartProps) {
  // Add total to each data point for tooltip calculation
  const chartData = data.map((item) => ({
    ...item,
    totalPatients: total,
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Protocol Distribution
      </h2>

      <div className="relative">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={chartData}
              cx="45%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  aria-label={entry.name}
                />
              ))}
            </Pie>
            <Tooltip cursor={false} content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-500">Total Patients</div>
          </div>
        </div>
      </div>

      {/* Legend Detail */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {data.map((protocol) => (
          <div
            key={protocol.name}
            className="flex items-center gap-3 p-3 rounded border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: protocol.color }}
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {protocol.name}
              </p>
              <p className="text-xs text-gray-500">
                {protocol.value} • {((protocol.value / total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Accessibility */}
      <div className="sr-only" role="img" aria-label={`Distribution of ${total} patients across protocols: ${data.map(d => `${d.name}: ${d.value} patients`).join('; ')}`} />
    </div>
  );
}
