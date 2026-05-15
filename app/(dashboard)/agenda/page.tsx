"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

// Mock data for appointments
const mockAppointments = [
  {
    id: 1,
    time: "09:00",
    patient: "Alessandra Costa",
    protocol: "Botox + Preenchimento",
    professional: "Dra. Sabryna",
    status: "confirmada",
    color: "#C9A96E",
  },
  {
    id: 2,
    time: "10:30",
    patient: "Bruna Rugue",
    protocol: "Preenchimento Labial",
    professional: "Dra. Sabryna",
    status: "confirmada",
    color: "#E8D5B0",
  },
  {
    id: 3,
    time: "14:00",
    patient: "Carolina Silva",
    protocol: "Limpeza Profunda + Peeling",
    professional: "Dr. Felipe",
    status: "pendente",
    color: "#D4B896",
  },
  {
    id: 4,
    time: "15:30",
    patient: "Diana Santos",
    protocol: "Botox",
    professional: "Dra. Sabryna",
    status: "confirmada",
    color: "#C9A96E",
  },
  {
    id: 5,
    time: "16:45",
    patient: "Erica Mendes",
    protocol: "Preenchimento",
    professional: "Dr. Felipe",
    status: "confirmada",
    color: "#E8D5B0",
  },
];

// Time slots
const timeSlots = Array.from({ length: 12 }, (_, i) => {
  const hour = 8 + i;
  return `${String(hour).padStart(2, "0")}:00`;
});

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 14)); // May 14, 2026
  const [selectedDay, setSelectedDay] = useState(14);

  // Generate calendar days for the current month
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const monthName = currentDate.toLocaleString("pt-BR", { month: "long" });
  const year = currentDate.getFullYear();

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-display text-4xl font-normal mb-2"
          style={{ color: "var(--color-text)", letterSpacing: "0.1em" }}
        >
          Agenda Semanal
        </h1>
        <p
          className="font-body text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Visualize e gerencie seus agendamentos
        </p>
      </div>

      {/* Main Layout: Sidebar + Calendar Grid */}
      <div className="flex gap-6 h-[calc(100vh-240px)]">
        {/* Left Sidebar — Mini Calendar + Filters */}
        <div className="w-72 flex flex-col gap-6">
          {/* Mini Calendar */}
          <Card className="aria-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <button onClick={goToPreviousMonth}>
                  <ChevronLeft
                    size={18}
                    style={{ color: "var(--color-gold)" }}
                    strokeWidth={2}
                  />
                </button>
                <p
                  className="font-body text-sm font-normal capitalize"
                  style={{ color: "var(--color-text)" }}
                >
                  {monthName} {year}
                </p>
                <button onClick={goToNextMonth}>
                  <ChevronRight
                    size={18}
                    style={{ color: "var(--color-gold)" }}
                    strokeWidth={2}
                  />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((day) => (
                  <div
                    key={day}
                    className="text-center font-body text-xs font-normal"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className="w-full aspect-square rounded-lg text-sm font-normal transition-all"
                    style={{
                      backgroundColor:
                        selectedDay === day
                          ? "var(--color-gold)"
                          : "var(--color-bg)",
                      color:
                        selectedDay === day
                          ? "#ffffff"
                          : "var(--color-text)",
                      border:
                        selectedDay === day
                          ? "none"
                          : "1px solid var(--color-divider)",
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="aria-card">
            <CardHeader className="pb-3">
              <CardTitle
                className="font-body text-sm font-normal"
                style={{ color: "var(--color-text)" }}
              >
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label
                  className="font-body text-xs font-normal mb-2 block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Profissional
                </label>
                <select className="aria-select w-full">
                  <option>Todos</option>
                  <option>Dra. Sabryna</option>
                  <option>Dr. Felipe</option>
                </select>
              </div>
              <div>
                <label
                  className="font-body text-xs font-normal mb-2 block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Status
                </label>
                <select className="aria-select w-full">
                  <option>Todos</option>
                  <option>Confirmada</option>
                  <option>Pendente</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Button */}
          <button
            className="w-full font-body text-sm font-normal py-3 rounded-lg transition-all"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "#ffffff",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            + FAZER AGENDAMENTO
          </button>
        </div>

        {/* Right Side — Weekly Calendar Grid */}
        <div className="flex-1 overflow-y-auto">
          <Card className="aria-card h-full">
            <CardContent className="pt-6">
              {/* Time slot headers */}
              <div className="flex gap-4 mb-6">
                <div className="w-20 flex-shrink-0"></div>
                <div className="flex-1">
                  <p
                    className="font-body text-sm font-normal"
                    style={{ color: "var(--color-text)" }}
                  >
                    {selectedDay} de {monthName.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Time slots */}
              <div className="space-y-4">
                {timeSlots.map((time) => {
                  const appointmentAtTime = mockAppointments.find(
                    (apt) => apt.time === time
                  );

                  return (
                    <div key={time} className="flex gap-4">
                      {/* Time label */}
                      <div className="w-20 flex-shrink-0">
                        <p
                          className="font-body text-xs font-normal"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {time}
                        </p>
                      </div>

                      {/* Appointment slot */}
                      <div className="flex-1">
                        {appointmentAtTime ? (
                          <div
                            className="p-4 rounded-lg border-l-4"
                            style={{
                              backgroundColor: appointmentAtTime.color,
                              borderLeftColor: "var(--color-gold)",
                              opacity: 0.15,
                            }}
                          >
                            <div
                              className="flex items-start gap-3"
                              style={{
                                filter: "brightness(0.7)",
                              }}
                            >
                              <div className="flex-1">
                                <p
                                  className="font-body text-sm font-normal mb-1"
                                  style={{ color: "var(--color-text)" }}
                                >
                                  {appointmentAtTime.patient}
                                </p>
                                <p
                                  className="font-body text-xs"
                                  style={{ color: "var(--color-text-muted)" }}
                                >
                                  {appointmentAtTime.protocol}
                                </p>
                                <p
                                  className="font-body text-xs mt-2"
                                  style={{ color: "var(--color-text-muted)" }}
                                >
                                  {appointmentAtTime.professional}
                                </p>
                              </div>
                              <Badge
                                className="font-body text-xs font-normal"
                                style={{
                                  backgroundColor:
                                    appointmentAtTime.status === "confirmada"
                                      ? "#c8e6c9"
                                      : "#ffe0b2",
                                  color:
                                    appointmentAtTime.status === "confirmada"
                                      ? "#2e7d32"
                                      : "#e65100",
                                }}
                              >
                                {appointmentAtTime.status.charAt(0).toUpperCase() +
                                  appointmentAtTime.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="h-12 rounded-lg border-2 border-dashed"
                            style={{
                              borderColor: "var(--color-divider)",
                            }}
                          ></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
