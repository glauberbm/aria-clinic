import KPICard from '@/components/dashboard/KPICard';
import ProtocolChart from '@/components/dashboard/ProtocolChart';
import FinancialChart from '@/components/dashboard/FinancialChart';
import { mockKPIs } from '@/lib/mock/dashboard-data';
import { protocolData, totalPatients } from '@/lib/mock/protocol-data';
import { revenueData } from '@/lib/mock/financial-data';

export default function DashboardPage() {
  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-600">Welcome to Aria Clinic Dashboard</p>

      {/* KPI Cards Grid (DASH-002) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {mockKPIs.map((kpi) => (
          <KPICard
            key={kpi.id}
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            change={kpi.change}
            changePercent={kpi.changePercent}
            icon={kpi.icon}
            color={kpi.color}
          />
        ))}
      </div>

      {/* Charts (DASH-003, DASH-004) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Protocol Chart (DASH-003) */}
        <ProtocolChart data={protocolData} total={totalPatients} />

        {/* Financial Chart (DASH-004) */}
        <FinancialChart data={revenueData} />
      </div>

      {/* Placeholder Patient List (DASH-005) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Patients
        </h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 rounded"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
