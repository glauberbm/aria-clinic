"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Eye } from "lucide-react";

// Mock data
const protocolsData = {
  open: 12,
  pending: 8,
  completed: 156,
};

const patientsData = [
  {
    id: 1,
    name: "Alessandra Costa",
    date: "2026-05-15",
    status: "confirmada",
    whatsapp: true,
    professional: "Dra. Sabryna",
    protocols: ["Botox", "Preenchimento"],
  },
  {
    id: 2,
    name: "Bruna Rugue",
    date: "2026-05-15",
    status: "confirmada",
    whatsapp: true,
    professional: "Dra. Sabryna",
    protocols: ["Preenchimento Labial"],
  },
  {
    id: 3,
    name: "Carolina Silva",
    date: "2026-05-16",
    status: "pendente",
    whatsapp: false,
    professional: "Dr. Felipe",
    protocols: ["Limpeza Profunda", "Peeling"],
  },
  {
    id: 4,
    name: "Diana Santos",
    date: "2026-05-16",
    status: "confirmada",
    whatsapp: true,
    professional: "Dra. Sabryna",
    protocols: ["Botox"],
  },
  {
    id: 5,
    name: "Erica Mendes",
    date: "2026-05-17",
    status: "cancelada",
    whatsapp: true,
    professional: "Dr. Felipe",
    protocols: ["Preenchimento"],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmada":
      return { bg: "#c8e6c9", text: "#2e7d32" };
    case "pendente":
      return { bg: "#ffe0b2", text: "#e65100" };
    case "cancelada":
      return { bg: "#ffcdd2", text: "#c62828" };
    default:
      return { bg: "#E8D5B0", text: "#8B6914" };
  }
};

export default function Painel() {
  return (
    <Shell>
      {/* Header */}
      <div className="mb-12">
        <h1
          className="font-display text-4xl font-normal mb-2"
          style={{ color: "var(--color-text)", letterSpacing: "0.1em" }}
        >
          Painel de Controle
        </h1>
        <p
          className="font-body text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Visão geral dos protocolos e pacientes agendadas
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Card: Protocolos em Aberto */}
        <Card className="aria-card">
          <CardHeader>
            <CardTitle
              className="font-body text-sm font-normal"
              style={{ color: "var(--color-text-muted)" }}
            >
              Protocolos em Aberto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p
                  className="font-display text-5xl font-normal mb-2"
                  style={{ color: "var(--color-gold)" }}
                >
                  {protocolsData.open}
                </p>
                <p
                  className="font-body text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  pendentes de conclusão
                </p>
              </div>
              <button
                className="font-body text-sm font-normal px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "#ffffff",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                VER
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Card: Resumo com Período */}
        <Card className="aria-card">
          <CardHeader>
            <CardTitle
              className="font-body text-sm font-normal"
              style={{ color: "var(--color-text-muted)" }}
            >
              Resumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p
                  className="font-body text-sm"
                  style={{ color: "var(--color-text)" }}
                >
                  Total de protocolos
                </p>
                <p
                  className="font-display text-2xl font-normal"
                  style={{ color: "var(--color-gold)" }}
                >
                  {protocolsData.completed}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p
                  className="font-body text-sm"
                  style={{ color: "var(--color-text)" }}
                >
                  Pendentes
                </p>
                <p
                  className="font-display text-2xl font-normal"
                  style={{ color: "#0097A7" }}
                >
                  {protocolsData.pending}
                </p>
              </div>
              <select className="aria-select w-full">
                <option>Maio 2026</option>
                <option>Abril 2026</option>
                <option>Março 2026</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Table */}
      <Card className="aria-card">
        <CardHeader>
          <CardTitle
            className="font-body text-lg font-normal"
            style={{ color: "var(--color-text)" }}
          >
            Pacientes Agendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--color-divider)",
                  }}
                >
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
                    Data
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
                    WhatsApp
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
                    Protocolo(s)
                  </th>
                </tr>
              </thead>
              <tbody>
                {patientsData.map((patient) => {
                  const statusColor = getStatusColor(patient.status);
                  const dateObj = new Date(patient.date);
                  const formattedDate = dateObj.toLocaleDateString("pt-BR");

                  return (
                    <tr
                      key={patient.id}
                      style={{
                        borderBottom: "1px solid var(--color-divider)",
                      }}
                    >
                      <td
                        className="font-body text-sm py-4 px-4"
                        style={{ color: "var(--color-text)" }}
                      >
                        {patient.name}
                      </td>
                      <td
                        className="font-body text-sm py-4 px-4"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {formattedDate}
                      </td>
                      <td className="py-4 px-4">
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
                      </td>
                      <td className="text-center py-4 px-4">
                        {patient.whatsapp && (
                          <MessageCircle
                            size={18}
                            style={{ color: "var(--color-gold)", margin: "0 auto" }}
                            strokeWidth={1.5}
                          />
                        )}
                      </td>
                      <td
                        className="font-body text-sm py-4 px-4"
                        style={{ color: "var(--color-text)" }}
                      >
                        {patient.professional}
                      </td>
                      <td
                        className="font-body text-sm py-4 px-4"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {patient.protocols.join(", ")}
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
