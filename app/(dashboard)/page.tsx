"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Cake,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data
const protocolStats = [
  { month: "Jan", value: 12 },
  { month: "Fev", value: 19 },
  { month: "Mar", value: 35 },
  { month: "Abr", value: 28 },
  { month: "Mai", value: 42 },
  { month: "Jun", value: 38 },
];

const financialData = [
  { name: "Botox", value: 25000, fill: "#C9A96E" },
  { name: "Preenchimento", value: 38000, fill: "#E8D5B0" },
  { name: "Outros", value: 16629.5, fill: "#D4B896" },
];

const upcomingPatients = [
  {
    id: 1,
    name: "Alessandra Costa",
    protocol: "Botox + Preenchimento",
    time: "09:30",
    status: "confirmada",
    initials: "AC",
  },
  {
    id: 2,
    name: "Bruna Rugue",
    protocol: "Preenchimento Labial",
    time: "10:45",
    status: "confirmada",
    initials: "BR",
  },
  {
    id: 3,
    name: "Carolina Silva",
    protocol: "Limpeza Profunda",
    time: "14:00",
    status: "pendente",
    initials: "CS",
  },
  {
    id: 4,
    name: "Diana Santos",
    protocol: "Botox",
    time: "15:30",
    status: "confirmada",
    initials: "DS",
  },
  {
    id: 5,
    name: "Erica Mendes",
    protocol: "Preenchimento",
    time: "16:45",
    status: "confirmada",
    initials: "EM",
  },
];

export default function Dashboard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada":
        return { bg: "#c8e6c9", text: "#2e7d32" };
      case "pendente":
        return { bg: "#ffe0b2", text: "#e65100" };
      default:
        return { bg: "#E8D5B0", text: "#8B6914" };
    }
  };

  return (
    <Shell>
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="font-display text-4xl font-normal mb-2" style={{ color: "var(--color-text)", letterSpacing: "0.1em" }}>
          Boa tarde, Dra. Sabryna
        </h1>
        <p className="font-display text-lg italic" style={{ color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>
          Beleza que transcende. Ciência que transforma.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Card 1: Agendadas/Atendidas */}
        <Card className="aria-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-body text-sm font-normal" style={{ color: "var(--color-text-muted)" }}>
                Agendadas/Atendidas
              </CardTitle>
              <Calendar size={18} style={{ color: "var(--color-gold)" }} strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-normal mb-2" style={{ color: "var(--color-gold)" }}>
              42
            </p>
            <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
              <span>para o mês</span>
              <select className="aria-select text-xs" style={{ width: "100px", marginTop: "8px" }}>
                <option>Mês</option>
                <option>Semana</option>
                <option>Dia</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Retornos */}
        <Card className="aria-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-body text-sm font-normal" style={{ color: "var(--color-text-muted)" }}>
                Retornos
              </CardTitle>
              <CalendarCheck size={18} style={{ color: "#0097A7" }} strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-normal mb-2" style={{ color: "#0097A7" }}>
              26
            </p>
            <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
              <span>para o mês</span>
              <select className="aria-select text-xs" style={{ width: "100px", marginTop: "8px" }}>
                <option>Mês</option>
                <option>Semana</option>
                <option>Dia</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Desmarcadas */}
        <Card className="aria-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-body text-sm font-normal" style={{ color: "var(--color-text-muted)" }}>
                Desmarcadas
              </CardTitle>
              <CalendarX size={18} style={{ color: "#D32F2F" }} strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-normal mb-2" style={{ color: "#D32F2F" }}>
              0
            </p>
            <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
              <span>para o mês</span>
              <select className="aria-select text-xs" style={{ width: "100px", marginTop: "8px" }}>
                <option>Mês</option>
                <option>Semana</option>
                <option>Dia</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Aniversariantes */}
        <Card className="aria-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-body text-sm font-normal" style={{ color: "var(--color-text-muted)" }}>
                Aniversariantes
              </CardTitle>
              <Cake size={18} style={{ color: "var(--color-gold)" }} strokeWidth={1.5} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-normal mb-2" style={{ color: "var(--color-gold)" }}>
              4
            </p>
            <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
              <span>para o mês</span>
              <select className="aria-select text-xs" style={{ width: "100px", marginTop: "8px" }}>
                <option>Mês</option>
                <option>Semana</option>
                <option>Dia</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Bar Chart — Estatísticas de Protocolos */}
        <Card className="aria-card">
          <CardHeader>
            <CardTitle className="font-body text-lg font-normal" style={{ color: "var(--color-text)" }}>
              Estatísticas de Protocolos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={protocolStats}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-divider)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-bg-card)",
                    border: "1px solid var(--color-divider)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "var(--color-text)" }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-gold)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart — Total Financeiro */}
        <Card className="aria-card">
          <CardHeader>
            <CardTitle className="font-body text-lg font-normal" style={{ color: "var(--color-text)" }}>
              Total Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={financialData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `R$ ${(value as number).toLocaleString("pt-BR")}`}
                  contentStyle={{
                    backgroundColor: "var(--color-bg-card)",
                    border: "1px solid var(--color-divider)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <p className="font-display text-2xl font-normal mt-4" style={{ color: "var(--color-gold)" }}>
              R$ 79.629,50
            </p>
            <p className="font-body text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
              Total do período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Patients List */}
      <Card className="aria-card">
        <CardHeader>
          <CardTitle className="font-body text-lg font-normal" style={{ color: "var(--color-text)" }}>
            Próximas pacientes do dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingPatients.map((patient) => {
              const statusColor = getStatusColor(patient.status);
              return (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: "var(--color-bg)" }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback
                        style={{
                          backgroundColor: "var(--color-gold-light)",
                          color: "var(--color-text)",
                        }}
                      >
                        {patient.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-body text-sm font-normal" style={{ color: "var(--color-text)" }}>
                        {patient.name}
                      </p>
                      <p className="font-body text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {patient.protocol}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-body text-sm" style={{ color: "var(--color-text-muted)" }}>
                      {patient.time}
                    </span>
                    <Badge
                      className="font-body text-xs font-normal"
                      style={{
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                      }}
                    >
                      {patient.status.charAt(0).toUpperCase() +
                        patient.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}
