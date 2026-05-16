'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { PatientRecord, patientData } from '@/lib/mock/patient-data';

type SortField = 'name' | 'protocol' | 'lastAppointment' | null;
type SortOrder = 'asc' | 'desc';

interface PatientTableProps {
  data?: PatientRecord[];
}

const PatientTable = ({ data = patientData }: PatientTableProps) => {
  const [sortField, setSortField] = useState<SortField>('lastAppointment');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field with ascending order
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: string | number = '';
    let bValue: string | number = '';

    if (sortField === 'name') {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    } else if (sortField === 'protocol') {
      aValue = a.protocol.toLowerCase();
      bValue = b.protocol.toLowerCase();
    } else if (sortField === 'lastAppointment') {
      aValue = new Date(a.lastAppointment).getTime();
      bValue = new Date(b.lastAppointment).getTime();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline-block ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline-block ml-1" />
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th
              className="px-6 py-3 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('name')}
              aria-sort={sortField === 'name' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Patient Name {getSortIcon('name')}
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">
              Patient ID
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-900">
              Phone
            </th>
            <th
              className="px-6 py-3 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('protocol')}
              aria-sort={sortField === 'protocol' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Protocol {getSortIcon('protocol')}
            </th>
            <th
              className="px-6 py-3 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('lastAppointment')}
              aria-sort={sortField === 'lastAppointment' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              Last Appointment {getSortIcon('lastAppointment')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((patient) => (
            <tr
              key={patient.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 text-gray-900 font-medium">{patient.name}</td>
              <td className="px-6 py-4 text-gray-600">{patient.id}</td>
              <td className="px-6 py-4 text-gray-600">{patient.phone}</td>
              <td className="px-6 py-4 text-gray-600">{patient.protocol}</td>
              <td className="px-6 py-4 text-gray-600">{formatDate(patient.lastAppointment)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;
