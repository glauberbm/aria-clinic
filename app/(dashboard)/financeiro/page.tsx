"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data
const financialStats = {
  totalRevenue: 79629.50,
  expenses: 23000.00,
  profit: 56629.50,
  defaultRate: 8.5,
};

const chartData = [
  { month: "Jan", value: 42000 },
  { month: "Fev", value: 51000 },
  { month: "Mar", value: 58000 },
  { month: "Abr", value: 73000 },
  { month: "Mai", value: 79000 },
  { month: "Jun", value: 85000 },
];

const transactions = [
  {
    id: 1,
    date: "2026-05-14",
    description: "Botox - Sessão Única",
    patient: "Alessandra Costa",
    method: "Cartão Crédito",
    amount: 1200.00,
    status: "pago",
  },
  {
    id: 2,
    date: "2026-05-13",
    description: "Preenchimento Labial",
    patient: "Bruna Rugue",
    method: "Dinheiro",
    amount: 1800.00,
    status: "pago",
  },
  {
    id: 3,
    date: "2026-05-12",
    description: "Bioestimulador + Peeling",
    patient: "Carolina Silva",
    method: "Pix",
    amount: 2500.00,
    status: "pendente",
  },
  {
    id: 4,
    date: "2026-05-11",
    description: "Harmonização Facial",
    patient: "Diana Santos",
    method: "Cartão Débito",
    amount: 3200.00,
    status: "pago",
  },
  {
    id: 5,
    date: "2026-05-10",
    description: "Limpeza Profunda",
    patient: "Erica Mendes",
    method: "Cartão Crédito",
    amount: 950.00,
    status: "atrasado",
  },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case "pago":
      return { bg: "#c8e6c9", text: "#2e7d32" };
    case "pendente":
      return { bg: "#ffe0b2", text: "#e65100" };
    case "atrasado":
      return { bg: "#ffcdd2", text: "#c62828" };
    default:
      return { bg: "#E8D5B0", text: "#8B6914" };
  }
};

export default function Financeiro() {
  return (
    <Shell>
      {/* Header */}
      <div className="mb-12">
        <h1
          className="font-display text-4xl font-normal mb-2"
          style={{ color: "var(--color-text)", letterSpacing: "0.1em" }}
        >
          Financeiro
        </h1>
        <p
          className="font-body text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Gestão de receitas, despesas e fluxo de caixa
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {/* Card 1: Receita Total */}
        <Card className="aria-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle
                className="font-body text-sm font-normal"
                style={{ color: "var(--color-text-muted)" }}
              >
                Receita Total
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
              R$ {financialStats.totalRevenue.toLocaleString("pt-BR")}
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              este mês
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Despesas */}
        <Card className="aria-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle
                className="font-body text-sm font-normal"
                style={{ color: "var(--color-text-muted)" }}
              >
                Despesas
              </CardTitle>
              <TrendingDown
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
              R$ {financialStats.expenses.toLocaleString("pt-BR")}
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              este mês
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Lucro */}
        <Card className="aria-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle
                className="font-body text-sm font-normal"
                style={{ color: "var(--color-text-muted)" }}
              >
                Lucro
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
              R$ {financialStats.profit.toLocaleString("pt-BR")}
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              este mês
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Inadimplência */}
        <Card className="aria-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle
                className="font-body text-sm font-normal"
                style={{ color: "var(--color-text-muted)" }}
              >
                Inadimplência
              </CardTitle>
              <AlertCircle
                size={18}
                style={{ color: "#FF9800" }}
                strokeWidth={1.5}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p
              className="font-display text-3xl font-normal mb-2"
              style={{ color: "#FF9800" }}
            >
              {financialStats.defaultRate}%
            </p>
            <p
              className="font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              da carteira
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="aria-card mb-12">
        <CardHeader>
          <CardTitle
            className="font-body text-lg font-normal"
            style={{ color: "var(--color-text)" }}
          >
            Faturamento — Últimos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-gold)"
                strokeWidth={2}
                dot={{ fill: "var(--color-gold)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <select className="aria-select">
          <option>Últimos 30 dias</option>
          <option>Últimos 90 dias</option>
          <option>Este mês</option>
          <option>Este ano</option>
        </select>
        <select className="aria-select">
          <option>Todos os profissionais</option>
          <option>Dra. Sabryna</option>
          <option>Dr. Felipe</option>
        </select>
        <select className="aria-select">
          <option>Todos os status</option>
          <option>Pago</option>
          <option>Pendente</option>
          <option>Atrasado</option>
        </select>
      </div>

      {/* Transactions Table */}
      <Card className="aria-card">
        <CardHeader>
          <CardTitle
            className="font-body text-lg font-normal"
            style={{ color: "var(--color-text)" }}
          >
            Lançamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-divider)" }}>
                  <th
                    className="font-body text-xs font-normal text-left py-3 px-4"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Data
                  </th>
                  <th
                    className="font-body text-xs font-normal text-left py-3 px-4"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Descrição
                  </th>
                  <th
                    className="font-body text-xs font-normal text-left py-3 px-4"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Paciente
                  </th>
                  <th
                    className="font-body text-xs font-normal text-left py-3 px-4"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Método
                  </th>
                  <th
                    className="font-body text-xs font-normal text-left py-3 px-4"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Investimento
                  </th>
                  <th
                    className="font-body text-xs font-normal text-left py-3 px-4"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const statusStyle = getStatusStyle(transaction.status);
                  const dateObj = new Date(transaction.date);
                  const formattedDate = dateObj.toLocaleDateString("pt-BR");

                  return (
                    <tr
                      key={transaction.id}
                      style={{
                        borderBottom: "1px solid var(--color-divider)",
                      }}
                    >
                      <td
                        className="font-body text-sm py-4 px-4"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {formattedDate}
                      </td>
                      <td
                        className="font-body text-sm py-4 px-4"
                        style={{ color: "var(--color-text)" }}
                      >
                        {transaction.description}
                      </td>
                      <td
                        className="font-body text-sm py-4 px-4"
                        style={{ color: "var(--color-text)" }}
                      >
                        {transaction.patient}
                      </td>
                      <td
                        className="font-body text-sm py-4 px-4"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {transaction.method}
                      </td>
                      <td
                        className="font-body text-sm py-4 px-4 font-normal"
                        style={{ color: "var(--color-gold)" }}
                      >
                        R$ {transaction.amount.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className="font-body text-xs font-normal"
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                          }}
                        >
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}
