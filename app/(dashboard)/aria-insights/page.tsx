"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Download, Trash2, Calendar } from "lucide-react";
import { useState } from "react";

const faturamentoData = [
  { month: "Jan", value: 15000 },
  { month: "Fev", value: 18500 },
  { month: "Mar", value: 22000 },
  { month: "Abr", value: 19800 },
  { month: "Mai", value: 25300 },
  { month: "Jun", value: 28500 },
];

const gaugeData = [
  { name: "Taxa Agendamento", value: 76, color: "#C9A96E" },
];

const gaugeData2 = [
  { name: "Taxa Desmarcados", value: 0, color: "#C9A96E" },
];

const gaugeData3 = [
  { name: "Taxa Comparecimento Leads", value: 6.5, color: "#C9A96E" },
];

const gaugeData4 = [
  { name: "Taxa Perdidos", value: 0, color: "#C9A96E" },
];

const darkMetrics = [
  {
    id: 1,
    title: "Investimento Marketing",
    value: "R$ 12.500",
    sublabel: "Mês atual",
  },
  {
    id: 2,
    title: "Ticket Médio",
    value: "R$ 2.850",
    sublabel: "Por protocolo",
  },
  {
    id: 3,
    title: "Taxa Conversão Orçamentos",
    value: "68%",
    sublabel: "Últimos 30 dias",
  },
  {
    id: 4,
    title: "Conversão Endomkt",
    value: "42%",
    sublabel: "Clientes recorrentes",
  },
  {
    id: 5,
    title: "Índice de Faltas",
    value: "3.2%",
    sublabel: "Taxa média",
  },
];

export default function AriaInsightsPage() {
  const [period, setPeriod] = useState("30d");

  return (
    <Shell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="font-display text-4xl font-normal mb-2"
            style={{ color: "var(--color-text)", letterSpacing: "0.1em" }}
          >
            ArIA Insights
          </h1>
          <p
            className="font-body text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Dashboard de inteligência comercial
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} style={{ color: "var(--color-text-muted)" }} strokeWidth={1.5} />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border-0 bg-transparent font-body text-sm"
              style={{ color: "var(--color-text)" }}
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
          </div>

          <Button variant="outline" size="sm" className="font-body text-xs font-normal">
            <Download size={14} className="mr-1" strokeWidth={1.5} />
            Exportar
          </Button>

          <Button variant="outline" size="sm" className="font-body text-xs font-normal">
            <Trash2 size={14} className="mr-1" strokeWidth={1.5} />
            Limpar
          </Button>
        </div>
      </div>

      {/* Gauges Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Gauge 1 */}
        <Card className="aria-card">
          <CardContent className="pt-6 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                data={gaugeData}
                innerRadius="70%"
                outerRadius="100%"
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  angleAxisId={0}
                  dataKey="value"
                  cornerRadius={10}
                  fill={gaugeData[0].color}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <p
              className="font-display text-2xl font-normal mt-2"
              style={{ color: "var(--color-gold)" }}
            >
              76%
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              Taxa de Agendamento
            </p>
          </CardContent>
        </Card>

        {/* Gauge 2 */}
        <Card className="aria-card">
          <CardContent className="pt-6 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                data={gaugeData2}
                innerRadius="70%"
                outerRadius="100%"
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  angleAxisId={0}
                  dataKey="value"
                  cornerRadius={10}
                  fill={gaugeData2[0].color}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <p
              className="font-display text-2xl font-normal mt-2"
              style={{ color: "var(--color-gold)" }}
            >
              0%
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              Taxa Desmarcados
            </p>
          </CardContent>
        </Card>

        {/* Gauge 3 */}
        <Card className="aria-card">
          <CardContent className="pt-6 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                data={gaugeData3}
                innerRadius="70%"
                outerRadius="100%"
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  angleAxisId={0}
                  dataKey="value"
                  cornerRadius={10}
                  fill={gaugeData3[0].color}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <p
              className="font-display text-2xl font-normal mt-2"
              style={{ color: "var(--color-gold)" }}
            >
              6.5%
            </p>
            <p
              className="font-body text-xs text-center"
              style={{ color: "var(--color-text-muted)" }}
            >
              Taxa Comparecimento Leads
            </p>
          </CardContent>
        </Card>

        {/* Gauge 4 */}
        <Card className="aria-card">
          <CardContent className="pt-6 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart
                data={gaugeData4}
                innerRadius="70%"
                outerRadius="100%"
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  angleAxisId={0}
                  dataKey="value"
                  cornerRadius={10}
                  fill={gaugeData4[0].color}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <p
              className="font-display text-2xl font-normal mt-2"
              style={{ color: "var(--color-gold)" }}
            >
              0%
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              Taxa Perdidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dark Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {darkMetrics.map((metric) => (
          <Card
            key={metric.id}
            className="aria-card"
            style={{ backgroundColor: "#2C1F14" }}
          >
            <CardContent className="pt-6">
              <p
                className="font-body text-xs mb-3"
                style={{ color: "var(--color-gold)" }}
              >
                {metric.title}
              </p>
              <p
                className="font-display text-2xl font-normal mb-2"
                style={{ color: "var(--color-gold)" }}
              >
                {metric.value}
              </p>
              <p
                className="font-body text-xs"
                style={{ color: "var(--color-gold)", opacity: 0.6 }}
              >
                {metric.sublabel}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Faturamento Chart */}
      <Card className="aria-card">
        <CardHeader>
          <CardTitle
            className="font-body text-lg font-normal"
            style={{ color: "var(--color-text)" }}
          >
            Tendência de Faturamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={faturamentoData}>
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
                formatter={(value) => `R$ ${(value as number).toLocaleString("pt-BR")}`}
              />
              <Legend wrapperStyle={{ color: "var(--color-text-muted)" }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-gold)"
                strokeWidth={3}
                dot={{ fill: "var(--color-gold)", r: 5 }}
                activeDot={{ r: 7 }}
                name="Faturamento"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Shell>
  );
}
