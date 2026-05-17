export interface PatientRecord {
  id: string;
  name: string;
  phone: string;
  protocol: string;
  lastAppointment: string;
}

export const patientData: PatientRecord[] = [
  {
    id: 'PT-001',
    name: 'Sarah Anderson',
    phone: '(555) 123-4567',
    protocol: 'Preventive Care',
    lastAppointment: '2026-05-14',
  },
  {
    id: 'PT-002',
    name: 'Michael Chen',
    phone: '(555) 234-5678',
    protocol: 'Chronic Management',
    lastAppointment: '2026-05-13',
  },
  {
    id: 'PT-003',
    name: 'Jessica White',
    phone: '(555) 345-6789',
    protocol: 'Wellness',
    lastAppointment: '2026-05-12',
  },
  {
    id: 'PT-004',
    name: 'David Rodriguez',
    phone: '(555) 456-7890',
    protocol: 'Acute Treatment',
    lastAppointment: '2026-05-11',
  },
  {
    id: 'PT-005',
    name: 'Emily Thompson',
    phone: '(555) 567-8901',
    protocol: 'Preventive Care',
    lastAppointment: '2026-05-10',
  },
  {
    id: 'PT-006',
    name: 'Robert Martinez',
    phone: '(555) 678-9012',
    protocol: 'Chronic Management',
    lastAppointment: '2026-05-09',
  },
  {
    id: 'PT-007',
    name: 'Amanda Brooks',
    phone: '(555) 789-0123',
    protocol: 'Wellness',
    lastAppointment: '2026-05-08',
  },
  {
    id: 'PT-008',
    name: 'Christopher Lee',
    phone: '(555) 890-1234',
    protocol: 'Preventive Care',
    lastAppointment: '2026-05-07',
  },
  {
    id: 'PT-009',
    name: 'Nicole Garcia',
    phone: '(555) 901-2345',
    protocol: 'Acute Treatment',
    lastAppointment: '2026-05-06',
  },
  {
    id: 'PT-010',
    name: 'Daniel Kim',
    phone: '(555) 012-3456',
    protocol: 'Chronic Management',
    lastAppointment: '2026-05-05',
  },
];
