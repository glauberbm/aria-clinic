export interface ProtocolData {
  name: string;
  value: number;
  color: string;
}

export const protocolData: ProtocolData[] = [
  {
    name: 'Preventive Care',
    value: 156,
    color: '#3B82F6',
  },
  {
    name: 'Acute Treatment',
    value: 89,
    color: '#EF4444',
  },
  {
    name: 'Chronic Management',
    value: 67,
    color: '#10B981',
  },
  {
    name: 'Wellness',
    value: 30,
    color: '#F59E0B',
  },
];

export const totalPatients = protocolData.reduce((sum, item) => sum + item.value, 0);
