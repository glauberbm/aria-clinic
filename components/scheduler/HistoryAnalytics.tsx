"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AnalyticsMetrics } from "@/lib/utils/analytics";

interface HistoryAnalyticsProps {
  metrics: AnalyticsMetrics;
}

export function HistoryAnalytics({ metrics }: HistoryAnalyticsProps) {
  const analyticsCards = [
    {
      label: "No-Show Rate",
      value: `${metrics.noShowRate}%`,
      color: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
      label: "Completion Rate",
      value: `${metrics.completionRate}%`,
      color: "bg-green-50 text-green-700 border-green-200",
    },
    {
      label: "Avg Duration",
      value: `${metrics.avgDuration} min`,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      label: "Busiest Doctor",
      value: metrics.busiestDoctor.doctorName,
      subtitle: `${metrics.busiestDoctor.count} appointments`,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      label: "Busiest Day",
      value: metrics.busiestDay.dayOfWeek,
      subtitle: `${metrics.busiestDay.count} appointments`,
      color: "bg-pink-50 text-pink-700 border-pink-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {analyticsCards.map((card) => (
        <Card key={card.label} className={`border ${card.color}`}>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
            <p className="text-2xl font-bold mt-2">{card.value}</p>
            {card.subtitle && (
              <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
