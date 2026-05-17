"use client";

import { useState, useMemo, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import "react-day-picker/dist/style.css";
import { useScheduler } from "@/lib/store/scheduler";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function CalendarView({
  selectedDate,
  onSelectDate,
}: CalendarViewProps) {
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const { appointments } = useScheduler();

  // Get all dates with appointments (memoized)
  const datesWithAppointments = useMemo(() => {
    return new Set(
      appointments.map((apt) => {
        const date = new Date(apt.date);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
    );
  }, [appointments]);

  // Custom CSS classes for days with appointments (memoized)
  const modifiers = useMemo(() => ({
    hasAppointment: (date: Date) => {
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      return datesWithAppointments.has(key);
    },
  }), [datesWithAppointments]);

  const modifiersClassNames = useMemo(() => ({
    hasAppointment: "bg-[#8B6F47]/10 font-semibold text-[#8B6F47]",
  }), []);

  const modifiersStyles = useMemo(() => ({
    selected: {
      backgroundColor: "#8B6F47",
      color: "white",
    },
    today: {
      fontWeight: "bold" as const,
      color: "#8B6F47",
    },
  }), []);

  const handlePreviousMonth = useCallback(() => {
    setDisplayMonth((month) =>
      new Date(month.getFullYear(), month.getMonth() - 1, 1)
    );
  }, []);

  const handleNextMonth = useCallback(() => {
    setDisplayMonth((month) =>
      new Date(month.getFullYear(), month.getMonth() + 1, 1)
    );
  }, []);

  const handleToday = useCallback(() => {
    setDisplayMonth(new Date());
    onSelectDate(new Date());
  }, [onSelectDate]);

  return (
    <Card className="p-4 border-0 bg-white shadow-sm">
      <div className="space-y-4">
        {/* Header with navigation */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {displayMonth.toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              className="h-8 w-8"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-8 px-2 text-xs"
            >
              Hoje
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div className="calendar-wrapper overflow-x-auto">
          <DayPicker
            mode="single"
            selected={selectedDate || undefined}
            onSelect={(date) => date && onSelectDate(date)}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            locale={ptBR}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            modifiersStyles={modifiersStyles}
            disabled={(date) => {
              // Disable weekends for demo
              const day = date.getDay();
              return day === 0 || day === 6;
            }}
            showOutsideDays={false}
            className="w-full"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 text-xs text-gray-600 pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#8B6F47]/10 border border-[#8B6F47]" />
            <span>Com agendamentos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#8B6F47]" />
            <span>Data selecionada</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(.calendar-wrapper) {
          --accent: #8b6f47;
        }

        :global(.calendar-wrapper .rdp) {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #8b6f47;
          --rdp-background-color: #f3f0ed;
          width: 100%;
        }

        :global(.calendar-wrapper .rdp-month) {
          width: 100%;
        }

        :global(.calendar-wrapper .rdp-head_cell) {
          font-size: 0.75rem;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
        }

        :global(.calendar-wrapper .rdp-cell) {
          padding: 0;
          text-align: center;
        }

        :global(.calendar-wrapper .rdp-day) {
          font-size: 0.875rem;
          border-radius: 4px;
        }

        :global(.calendar-wrapper .rdp-day_disabled) {
          opacity: 0.4;
        }
      `}</style>
    </Card>
  );
}
