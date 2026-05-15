"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Trash2 } from "lucide-react";
import { useState } from "react";

// Mock data
const budgets = [
  {
    id: 1,
    patient: "Alessandra Costa",
    protocol: "Botox + Preenchimento",
    amount: 2800.00,
    date: "2026-05-14",
    professional: "Dra. Sabryna",
    status: "em_aberto",
  },
  {
    id: 2,
    patient: "Bruna Rugue",
    protocol: "Preenchimento Labial",
    amount: 1800.00,
    date: "2026-05-12",
    professional: "Dra. Sabryna",
    status: "em_aberto",
  },
  {
    id: 3,
    patient: "Carolina Silva",
    protocol: "Bioestimulador + Peeling",
    amount: 2500.00,
    date: "2026-05-10",
    professional: "Dr. Felipe",
    status: "em_aberto",
  },
  {
    id: 4,
    patient: "Diana Santos",
    protocol: "Botox",
    amount: 1200.00,
    date: "2026-05-08",
    professional: "Dra. Sabryna",
    status: "em_aberto",
  },
  {
    id: 5,
    patient: "Erica Mendes",
    protocol: "Preenchimento",
    amount: 1500.00,
    date: "2026-05-06",
    professional: "Dr. Felipe",
    status: "em_aberto",
  },
  {
    id: 6,
    patient: "Fernanda Oliveira",
    protocol: "Limpeza Profunda",
    amount: 950.00,
    date: "2026-05-04",
    professional: "Dra. Sabryna",
    status: "em_aberto",
  },
  {
    id: 7,
    patient: "Gabriela Rocha",
    protocol: "Botox + Preenchimento",
    amount: 2800.00,
    date: "2026-05-12",
    professional: "Dr. Felipe",
    status: "aprovado",
  },
  {
    id: 8,
    patient: "Helena Marques",
    protocol: "Harmonização Facial",
    amount: 3200.00,
    date: "2026-05-10",
    professional: "Dra. Sabryna",
    status: "aprovado",
  },
  {
    id: 9,
    patient: "Iris da Silva",
    protocol: "Preenchimento Labial",
    amount: 1800.00,
    date: "2026-05-08",
    professional: "Dr. Felipe",
    status: "aprovado",
  },
  {
    id: 10,
    patient: "Julia Martins",
    protocol: "Bioestimulador",
    amount: 2200.00,
    date: "2026-05-06",
    professional: "Dra. Sabryna",
    status: "aprovado",
  },
  {
    id: 11,
    patient: "Kamila Santos",
    protocol: "Botox",
    amount: 1200.00,
    date: "2026-05-04",
    professional: "Dr. Felipe",
    status: "aprovado",
  },
  {
    id: 12,
    patient: "Larissa Oliveira",
    protocol: "Limpeza + Peeling",
    amount: 1450.00,
    date: "2026-05-02",
    professional: "Dra. Sabryna",
    status: "aprovado",
  },
  {
    id: 13,
    patient: "Monica Costa",
    protocol: "Preenchimento",
    amount: 1500.00,
    date: "2026-05-10",
    professional: "Dr. Felipe",
    status: "reprovado",
  },
  {
    id: 14,
    patient: "Natalia Silva",
    protocol: "Harmonização Facial",
    amount: 3200.00,
    date: "2026-05-08",
    professional: "Dra. Sabryna",
    status: "reprovado",
  },
  {
    id: 15,
    patient: "Olivia Mendes",
    protocol: "Botox + Preenchimento",
    amount: 2800.00,
    date: "2026-05-06",
    professional: "Dr. Felipe",
    status: "reprovado",
  },
  {
    id: 16,
    patient: "Patricia Rocha",
    protocol: "Bioestimulador",
    amount: 2200.00,
    date: "2026-05-04",
    professional: "Dra. Sabryna",
    status: "reprovado",
  },
  {
    id: 17,
    patient: "Quinita Santos",
    protocol: "Limpeza Profunda",
    amount: 950.00,
    date: "2026-05-02",
    professional: "Dr. Felipe",
    status: "reprovado",
  },
  {
    id: 18,
    patient: "Raquel Oliveira",
    protocol: "Preenchimento Labial",
    amount: 1800.00,
    date: "2026-04-30",
    professional: "Dra. Sabryna",
    status: "reprovado",
  },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case "em_aberto":
      return { bg: "#FFF3E0", text: "#E65100", label: "Em Aberto" };
    case "aprovado":
      return { bg: "#C8E6C9", text: "#2E7D32", label: "Aprovado" };
    case "reprovado":
      return { bg: "#FFCDD2", text: "#C62828", label: "Reprovado" };
    default:
      return { bg: "#E8D5B0", text: "#8B6914", label: "Status" };
  }
};

export default function Orcamentos() {
  const [activeTab, setActiveTab] = useState<
    "em_aberto" | "aprovado" | "reprovado"
  >("em_aberto");

  const filteredBudgets = budgets.filter((b) => b.status === activeTab);

  const tabs = [
    { id: "em_aberto", label: "Em Aberto", count: 6 },
    { id: "aprovado", label: "Aprovados", count: 6 },
    { id: "reprovado", label: "Reprovados", count: 6 },
  ];

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-display text-4xl font-normal mb-2"
          style={{ color: "var(--color-text)", letterSpacing: "0.1em" }}
        >
          Orçamentos
        </h1>
        <p
          className="font-body text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Gerencie orçamentos de protocolos
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b" style={{ borderColor: "var(--color-divider)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "em_aberto" | "aprovado" | "reprovado")}
            className="px-6 py-3 font-body text-sm font-normal transition-all border-b-2"
            style={{
              color:
                activeTab === tab.id
                  ? "var(--color-gold)"
                  : "var(--color-text-muted)",
              borderBottomColor:
                activeTab === tab.id ? "var(--color-gold)" : "transparent",
              paddingBottom: activeTab === tab.id ? "11px" : "11px",
            }}
          >
            {tab.label}
            <span
              className="ml-2 font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              ({tab.count})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="aria-card">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-divider)" }}>
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
                    Protocolo
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
                    Data
                  </th>
                  <th
                    className="font-body text-xs font-normal text-left py-3 px-4"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Profissional
                  </th>
                  <th
                    className="font-body text-xs font-normal text-left py-3 px-4"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Status
                  </th>
                  <th
                    className="font-body text-xs font-normal text-center py-3 px-4"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBudgets.map((budget) => {
                  const statusStyle = getStatusStyle(budget.status);
                  const dateObj = new Date(budget.date);
                  const formattedDate = dateObj.toLocaleDateString("pt-BR");

                  return (
                    <tr
                      key={budget.id}
                      style={{
                        borderBottom: "1px solid var(--color-divider)",
                      }}
                    >
                      <td
                        className="font-body text-sm py-4 px-4"
                        style={{ color: "var(--color-text)" }}
                      >
                        {budget.patient}
                      </td>
                      <td
                        className="font-body text-sm py-4 px-4"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {budget.protocol}
                      </td>
                      <td
                        className="font-body text-sm py-4 px-4 font-normal"
                        style={{ color: "var(--color-gold)" }}
                      >
                        R$ {budget.amount.toLocaleString("pt-BR")}
                      </td>
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
                        {budget.professional}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className="font-body text-xs font-normal"
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                          }}
                        >
                          {statusStyle.label}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-1 rounded hover:opacity-70"
                            title="Ver detalhes"
                          >
                            <Eye
                              size={16}
                              style={{ color: "var(--color-gold)" }}
                              strokeWidth={1.5}
                            />
                          </button>
                          <button
                            className="p-1 rounded hover:opacity-70"
                            title="Baixar"
                          >
                            <Download
                              size={16}
                              style={{ color: "var(--color-text-muted)" }}
                              strokeWidth={1.5}
                            />
                          </button>
                          <button
                            className="p-1 rounded hover:opacity-70"
                            title="Deletar"
                          >
                            <Trash2
                              size={16}
                              style={{ color: "#D32F2F" }}
                              strokeWidth={1.5}
                            />
                          </button>
                        </div>
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
