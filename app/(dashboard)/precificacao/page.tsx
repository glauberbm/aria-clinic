"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Zap, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data
const pricingStats = {
  totalProfit: 156893.50,
  totalInvoiced: 234500.00,
  clinicHourCost: 185.00,
  totalExpense: 77606.50,
};

const performanceData = [
  { protocol: "Botox", revenue: 28000 },
  { protocol: "Preenchimento", revenue: 32500 },
  { protocol: "Bioestimulador", revenue: 21000 },
  { protocol: "Harmonização", revenue: 29000 },
  { protocol: "Limpeza", revenue: 15000 },
  { protocol: "Peeling", revenue: 18000 },
  { protocol: "Outros", revenue: 91000 },
];

export default function Precificacao() {
  return (
    <Shell>
      {/* Header */}
      <div className="mb-12">
        <h1
          className="font-display text-4xl font-normal mb-2"
          style={{ color: "var(--color-text)", letterSpacing: "0.1em" }}
        >
          Precificação Inteligente
        </h1>
        <p
          className="font-body text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Gerencie investimentos e rentabilidade dos protocolos
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Card 1: Lucro Total */}
        <Card className="aria-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle
                className="font-body text-sm font-normal"
                style={{ color: "var(--color-text-muted)" }}
              >
                Lucro Total
              </CardTitle>
              <TrendingUp
                size={18}
                style={{ color: "#2e7d32" }}
                strokeWidth={1.5}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p
              className="font-display text-3xl font-normal mb-2"
              style={{ color: "#2e7d32" }}
            >
              R$ {pricingStats.totalProfit.toLocaleString("pt-BR")}
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              acumulado
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Faturamento */}
        <Card className="aria-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle
                className="font-body text-sm font-normal"
                style={{ color: "var(--color-text-muted)" }}
              >
                Total Faturamento
              </CardTitle>
              <DollarSign
                size={18}
                style={{ color: "var(--color-gold)" }}
                strokeWidth={1.5}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p
              className="font-display text-3xl font-normal mb-2"
              style={{ color: "var(--color-gold)" }}
            >
              R$ {pricingStats.totalInvoiced.toLocaleString("pt-BR")}
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              este período
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Custo Hora Clínica */}
        <Card className="aria-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle
                className="font-body text-sm font-normal"
                style={{ color: "var(--color-text-muted)" }}
              >
                Custo Hora Clínica
              </CardTitle>
              <Zap
                size={18}
                style={{ color: "#2196F3" }}
                strokeWidth={1.5}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p
              className="font-display text-3xl font-normal mb-2"
              style={{ color: "#2196F3" }}
            >
              R$ {pricingStats.clinicHourCost.toFixed(2)}
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              custo operacional
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Total Despesa */}
        <Card className="aria-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle
                className="font-body text-sm font-normal"
                style={{ color: "var(--color-text-muted)" }}
              >
                Total Despesa
              </CardTitle>
              <AlertCircle
                size={18}
                style={{ color: "#D32F2F" }}
                strokeWidth={1.5}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p
              className="font-display text-3xl font-normal mb-2"
              style={{ color: "#D32F2F" }}
            >
              R$ {pricingStats.totalExpense.toLocaleString("pt-BR")}
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              este período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Precificador Card */}
        <Card className="aria-card lg:col-span-2">
          <CardHeader>
            <CardTitle
              className="font-body text-lg font-normal"
              style={{ color: "var(--color-text)" }}
            >
              Precificador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    backgroundColor: "var(--color-gold)",
                  }}
                >
                  <span
                    className="font-body text-xs font-bold"
                    style={{ color: "white" }}
                  >
                    1
                  </span>
                </div>
                <div>
                  <p
                    className="font-body text-sm font-normal mb-1"
                    style={{ color: "var(--color-text)" }}
                  >
                    Algoritmo de Precificação Automática
                  </p>
                  <p
                    className="font-body text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Calcula automaticamente o investimento ideal baseado em
                    custos operacionais e demanda de mercado
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    backgroundColor: "var(--color-gold)",
                  }}
                >
                  <span
                    className="font-body text-xs font-bold"
                    style={{ color: "white" }}
                  >
                    2
                  </span>
                </div>
                <div>
                  <p
                    className="font-body text-sm font-normal mb-1"
                    style={{ color: "var(--color-text)" }}
                  >
                    Análise Comparativa de Mercado
                  </p>
                  <p
                    className="font-body text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Compara seus investimentos com a média do mercado de
                    clínicas estéticas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    backgroundColor: "var(--color-gold)",
                  }}
                >
                  <span
                    className="font-body text-xs font-bold"
                    style={{ color: "white" }}
                  >
                    3
                  </span>
                </div>
                <div>
                  <p
                    className="font-body text-sm font-normal mb-1"
                    style={{ color: "var(--color-text)" }}
                  >
                    Simulações de Cenários
                  </p>
                  <p
                    className="font-body text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Teste diferentes estratégias de precificação antes de
                    aplicar em produção
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Protocols Count Card */}
        <Card className="aria-card">
          <CardHeader>
            <CardTitle
              className="font-body text-sm font-normal"
              style={{ color: "var(--color-text-muted)" }}
            >
              Protocolos Precificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="font-display text-5xl font-normal mb-4"
              style={{ color: "var(--color-gold)" }}
            >
              24
            </p>
            <p
              className="font-body text-xs mb-6"
              style={{ color: "var(--color-text-muted)" }}
            >
              protocolos com investimento definido
            </p>
            <div className="space-y-2">
              <p
                className="font-body text-xs font-normal"
                style={{ color: "var(--color-text)" }}
              >
                Taxa de Atualização
              </p>
              <div
                className="w-full h-2 rounded-full"
                style={{ backgroundColor: "var(--color-divider)" }}
              >
                <div
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    width: "92%",
                  }}
                ></div>
              </div>
              <p
                className="font-body text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                92% atualizado
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-12">
        <button
          className="font-body text-sm font-normal px-8 py-3 rounded-lg transition-all"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "#ffffff",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          INICIAR PRECIFICAÇÃO
        </button>
        <button
          className="font-body text-sm font-normal px-8 py-3 rounded-lg border transition-all"
          style={{
            borderColor: "var(--color-gold)",
            color: "var(--color-gold)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          TABELA DE INVESTIMENTOS
        </button>
      </div>

      {/* Performance Chart */}
      <Card className="aria-card">
        <CardHeader>
          <CardTitle
            className="font-body text-lg font-normal"
            style={{ color: "var(--color-text)" }}
          >
            Desempenho do Faturamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-divider)"
              />
              <XAxis
                dataKey="protocol"
                tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-card)",
                  border: "1px solid var(--color-divider)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--color-text)" }}
                formatter={(value) =>
                  `R$ ${(value as number).toLocaleString("pt-BR")}`
                }
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-gold)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Shell>
  );
}
