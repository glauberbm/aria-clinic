'use client';

import React, { useState } from 'react';

interface CalendarViewProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

export function CalendarView({ onDateSelect, selectedDate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      selectedDate &&
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handleDayClick = (day: number) => {
    onDateSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const days: Array<number | null> = Array.from({ length: firstDay }, () => null);
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{monthYear}</h2>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            ← Prev
          </button>
          <button
            onClick={goToNextMonth}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day && handleDayClick(day)}
            disabled={!day}
            className={`
              aspect-square py-2 rounded text-sm font-medium transition-colors
              ${!day ? 'bg-gray-50 cursor-default' : ''}
              ${isToday(day!) ? 'bg-blue-100 text-blue-900 border-2 border-blue-400' : ''}
              ${isSelected(day!) ? 'bg-green-100 text-green-900 border-2 border-green-400' : ''}
              ${day && !isToday(day) && !isSelected(day) ? 'bg-gray-50 hover:bg-gray-100 text-gray-900 cursor-pointer' : ''}
            `}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
