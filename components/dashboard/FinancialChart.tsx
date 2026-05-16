'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { RevenueData } from '@/lib/mock/financial-data';

interface FinancialChartProps {
  data: RevenueData[];
}

interface TooltipPayload {
  payload?: RevenueData;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data) return null;
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
        <p className="text-sm font-semibold text-gray-900">{data.month}</p>
        <p className="text-sm text-blue-600">
          ${(data.revenue / 1000).toFixed(1)}K
        </p>
      </div>
    );
  }
  return null;
};

const formatYAxis = (value: number) => {
  return `$${(value / 1000).toFixed(0)}K`;
};

export default function FinancialChart({ data }: FinancialChartProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Monthly Revenue
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
            }}
            cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
            content={<CustomTooltip />}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={() => 'Monthly Revenue'}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
            name="Monthly Revenue"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 rounded border border-blue-100">
          <p className="text-xs text-blue-600 font-medium">Average</p>
          <p className="text-lg font-bold text-blue-900">
            ${(data.reduce((sum, item) => sum + item.revenue, 0) / data.length / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded border border-green-100">
          <p className="text-xs text-green-600 font-medium">Highest</p>
          <p className="text-lg font-bold text-green-900">
            ${(Math.max(...data.map((item) => item.revenue)) / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="p-3 bg-amber-50 rounded border border-amber-100">
          <p className="text-xs text-amber-600 font-medium">Lowest</p>
          <p className="text-lg font-bold text-amber-900">
            ${(Math.min(...data.map((item) => item.revenue)) / 1000).toFixed(1)}K
          </p>
        </div>
      </div>

      {/* Accessibility */}
      <div
        className="sr-only"
        role="img"
        aria-label={`Monthly revenue chart showing ${data.map((d) => `${d.month}: $${d.revenue}`).join(', ')}`}
      />
    </div>
  );
}
