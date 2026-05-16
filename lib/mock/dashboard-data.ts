import {
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export interface KPIData {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  change: number;
  changePercent: number;
  icon: typeof TrendingUp;
  color: 'green' | 'red' | 'blue' | 'yellow';
}

export const mockKPIs: KPIData[] = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: 24500,
    unit: 'USD',
    change: 12,
    changePercent: 8.2,
    icon: TrendingUp,
    color: 'green',
  },
  {
    id: 'patients',
    label: 'Active Patients',
    value: 342,
    unit: 'patients',
    change: 18,
    changePercent: 5.6,
    icon: Users,
    color: 'blue',
  },
  {
    id: 'appointments',
    label: 'Appointments (This Month)',
    value: 87,
    unit: 'scheduled',
    change: -5,
    changePercent: -4.2,
    icon: Calendar,
    color: 'yellow',
  },
  {
    id: 'consultations',
    label: 'Pending Consultations',
    value: 12,
    unit: 'waiting',
    change: 3,
    changePercent: 33.3,
    icon: CheckCircle,
    color: 'red',
  },
];
