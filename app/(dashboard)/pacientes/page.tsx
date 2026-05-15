"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MessageCircle,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// Mock data
const mockPatients = [
  {
    id: 1,
    name: "Alessandra Costa",
    age: 32,
    whatsapp: "(11) 99901-2345",
    status: "ATIVA",
    lastProtocol: "Botox + Preenchimento",
    nextAppointment: "2026-05-21 14:00",
    initials: "AC",
  },
  {
    id: 2,
    name: "Bruna Rugue",
    age: 28,
    whatsapp: "(11) 99902-3456",
    status: "ATIVA",
    lastProtocol: "Preenchimento Labial",
    nextAppointment: "2026-05-22 10:30",
    initials: "BR",
  },
  {
    id: 3,
    name: "Carolina Silva",
    age: 45,
    whatsapp: "(11) 99903-4567",
    status: "INATIVA",
    lastProtocol: "Limpeza Profunda",
    nextAppointment: "—",
    initials: "CS",
  },
  {
    id: 4,
    name: "Diana Santos",
    age: 29,
    whatsapp: "(11) 99904-5678",
    status: "ATIVA",
    lastProtocol: "Botox",
    nextAppointment: "2026-05-23 15:45",
    initials: "DS",
  },
  {
    id: 5,
    name: "Erica Mendes",
    age: 38,
    whatsapp: "(11) 99905-6789",
    status: "ATIVA",
    lastProtocol: "Preenchimento",
    nextAppointment: "2026-05-24 09:15",
    initials: "EM",
  },
  {
    id: 6,
    name: "Fernanda Oliveira",
    age: 52,
    whatsapp: "(11) 99906-7890",
    status: "ATIVA",
    lastProtocol: "Bioestimulador",
    nextAppointment: "2026-05-25 11:00",
    initials: "FO",
  },
  {
    id: 7,
    name: "Gabriela Rocha",
    age: 35,
    whatsapp: "(11) 99907-8901",
    status: "INATIVA",
    lastProtocol: "Hidratação Facial",
    nextAppointment: "—",
    initials: "GR",
  },
  {
    id: 8,
    name: "Helena Marques",
    age: 41,
    whatsapp: "(11) 99908-9012",
    status: "ATIVA",
    lastProtocol: "Toxina + Preenchimento",
    nextAppointment: "2026-05-26 13:30",
    initials: "HM",
  },
];

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    return status === "ATIVA"
      ? {
          bg: "#c8e6c9",
          text: "#2e7d32",
          label: "ATIVA",
        }
      : {
          bg: "#f0f0f0",
          text: "#666",
          label: "INATIVA",
        };
  };

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1
            className="font-display text-4xl font-normal mb-2"
            style={{ color: "var(--color-text)", letterSpacing: "0.1em" }}
          >
            Pacientes
          </h1>
        </div>
        <Button
          className="font-body text-sm font-normal px-6 py-2"
          style={{
            backgroundColor: "var(--color-gold)",
            color: "var(--color-text)",
          }}
        >
          + Nova Paciente
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="aria-card mb-8">
        <CardContent className="pt-6">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: "var(--color-text-muted)" }}
              strokeWidth={1.5}
            />
            <Input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 border-0 bg-transparent font-body text-sm"
              style={{ color: "var(--color-text)" }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="aria-card">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-divider)" }}>
                  <th
                    className="text-left py-3 px-4 font-body text-xs font-normal"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Nome
                  </th>
                  <th
                    className="text-left py-3 px-4 font-body text-xs font-normal"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Idade
                  </th>
                  <th
                    className="text-left py-3 px-4 font-body text-xs font-normal"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    WhatsApp
                  </th>
                  <th
                    className="text-left py-3 px-4 font-body text-xs font-normal"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Status
                  </th>
                  <th
                    className="text-left py-3 px-4 font-body text-xs font-normal"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Último Protocolo
                  </th>
                  <th
                    className="text-left py-3 px-4 font-body text-xs font-normal"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Próximo Agendamento
                  </th>
                  <th
                    className="text-left py-3 px-4 font-body text-xs font-normal"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedPatients.map((patient) => {
                  const statusStyle = getStatusBadge(patient.status);
                  return (
                    <tr
                      key={patient.id}
                      style={{ borderBottom: "1px solid var(--color-divider)" }}
                    >
                      <td className="py-4 px-4 font-body text-sm">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback
                              style={{
                                backgroundColor: "var(--color-gold-light)",
                                color: "var(--color-text)",
                                fontSize: "12px",
                              }}
                            >
                              {patient.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span style={{ color: "var(--color-text)" }}>
                            {patient.name}
                          </span>
                        </div>
                      </td>
                      <td
                        className="py-4 px-4 font-body text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {patient.age}
                      </td>
                      <td className="py-4 px-4 font-body text-sm">
                        <Badge
                          className="font-body text-xs font-normal bg-green-100 text-green-700 hover:bg-green-100"
                          style={{
                            backgroundColor: "#d4edda",
                            color: "#155724",
                            cursor: "pointer",
                          }}
                        >
                          {patient.whatsapp}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-body text-sm">
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
                      <td
                        className="py-4 px-4 font-body text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {patient.lastProtocol}
                      </td>
                      <td
                        className="py-4 px-4 font-body text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {patient.nextAppointment}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/pacientes/${patient.id}`}>
                            <button
                              className="p-1 rounded hover:opacity-70"
                              title="Ver ficha"
                            >
                              <Eye
                                size={16}
                                style={{ color: "var(--color-gold)" }}
                                strokeWidth={1.5}
                              />
                            </button>
                          </Link>
                          <button
                            className="p-1 rounded hover:opacity-70"
                            title="Editar"
                          >
                            <Edit
                              size={16}
                              style={{ color: "var(--color-text-muted)" }}
                              strokeWidth={1.5}
                            />
                          </button>
                          <button
                            className="p-1 rounded hover:opacity-70"
                            title="WhatsApp"
                          >
                            <MessageCircle
                              size={16}
                              style={{ color: "#25D366" }}
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <span
              className="font-body text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded disabled:opacity-50"
              >
                <ChevronLeft
                  size={18}
                  style={{ color: "var(--color-text-muted)" }}
                  strokeWidth={1.5}
                />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded disabled:opacity-50"
              >
                <ChevronRight
                  size={18}
                  style={{ color: "var(--color-text-muted)" }}
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Shell>
  );
}
