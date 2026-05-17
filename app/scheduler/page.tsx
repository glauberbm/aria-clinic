'use client';

import React, { useState } from 'react';
import { CalendarView } from '@/components/scheduler/CalendarView';

export default function SchedulerPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scheduler</h1>
          <p className="text-gray-600 mt-2">Manage appointments and availability</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CalendarView
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
