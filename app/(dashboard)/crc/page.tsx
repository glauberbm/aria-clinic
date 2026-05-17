"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

const mockCRCData = {
  aniversariantes: [
    { id: 1, name: "Alessandra Costa", date: "2026-05-21", initials: "AC" },
    { id: 2, name: "Bruna Rugue", date: "2026-05-25", initials: "BR" },
    { id: 3, name: "Carolina Silva", date: "2026-06-02", initials: "CS" },
    { id: 4, name: "Diana Santos", date: "2026-06-08", initials: "DS" },
  ],
  agendamentos: [
    { id: 1, name: "Erica Mendes", date: "2026-05-22 10:30", initials: "EM" },
    { id: 2, name: "Fernanda Oliveira", date: "2026-05-23 14:00", initials: "FO" },
    { id: 3, name: "Gabriela Rocha", date: "2026-05-24 09:15", initials: "GR" },
    { id: 4, name: "Helena Marques", date: "2026-05-25 15:30", initials: "HM" },
  ],
  orcamentos: [
    { id: 1, name: "Ingrid Santos", amount: "R$ 2.500,00", initials: "IS" },
    { id: 2, name: "Joana Silva", amount: "R$ 1.800,00", initials: "JS" },
    { id: 3, name: "Karina Melo", amount: "R$ 3.200,00", initials: "KM" },
    { id: 4, name: "Larissa Costa", amount: "R$ 2.100,00", initials: "LC" },
  ],
  inadimplencia: [
    { id: 1, name: "Marina Gomes", amount: "R$ 950,00", initials: "MG" },
    { id: 2, name: "Natalia Rocha", amount: "R$ 1.200,00", initials: "NR" },
    { id: 3, name: "Olivia Martins", amount: "R$ 680,00", initials: "OM" },
    { id: 4, name: "Patricia Silva", amount: "R$ 1.450,00", initials: "PS" },
  ],
  faltou: [
    { id: 1, name: "Quesia Santos", date: "2026-05-10", initials: "QS" },
    { id: 2, name: "Rita Ferreira", date: "2026-05-12", initials: "RF" },
    { id: 3, name: "Sandra Lima", date: "2026-05-15", initials: "SL" },
    { id: 4, name: "Tania Oliveira", date: "2026-05-18", initials: "TO" },
  ],
  desmarcados: [
    { id: 1, name: "Ursula Costa", date: "2026-05-20", initials: "UC" },
    { id: 2, name: "Vanessa Alves", date: "2026-05-21", initials: "VA" },
    { id: 3, name: "Wanessa Santos", date: "2026-05-22", initials: "WS" },
    { id: 4, name: "Yasmin Melo", date: "2026-05-23", initials: "YM" },
  ],
};

type TabType = "aniversariantes" | "agendamentos" | "orcamentos" | "inadimplencia" | "faltou" | "desmarcados";

export default function CRCPage() {
  const [activeTab, setActiveTab] = useState<TabType>("aniversariantes");

  const tabs: { id: TabType; label: string; icon?: string }[] = [
    { id: "aniversariantes", label: "Aniversariantes" },
    { id: "agendamentos", label: "Agendamentos" },
    { id: "orcamentos", label: "Orçamentos" },
    { id: "inadimplencia", label: "Inadimplência" },
    { id: "faltou", label: "Faltou" },
    { id: "desmarcados", label: "Desmarcados" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "aniversariantes":
        return (
          <div className="space-y-3">
            {(mockCRCData.aniversariantes as typeof mockCRCData.aniversariantes).map(
              (item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback
                        style={{
                          backgroundColor: "var(--color-gold-light)",
                          color: "var(--color-text)",
                          fontSize: "12px",
                        }}
                      >
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p
                        className="font-body text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="font-body text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {new Date(item.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="font-body text-xs font-normal"
                    style={{
                      backgroundColor: "#25D366",
                      color: "white",
                    }}
                  >
                    <MessageCircle size={14} className="mr-1" strokeWidth={1.5} />
                    Enviar
                  </Button>
                </div>
              )
            )}
          </div>
        );

      case "agendamentos":
        return (
          <div className="space-y-3">
            {(mockCRCData.agendamentos as typeof mockCRCData.agendamentos).map(
              (item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback
                        style={{
                          backgroundColor: "var(--color-gold-light)",
                          color: "var(--color-text)",
                          fontSize: "12px",
                        }}
                      >
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p
                        className="font-body text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="font-body text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {item.date}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="font-body text-xs font-normal"
                    style={{
                      backgroundColor: "#25D366",
                      color: "white",
                    }}
                  >
                    <MessageCircle size={14} className="mr-1" strokeWidth={1.5} />
                    Enviar
                  </Button>
                </div>
              )
            )}
          </div>
        );

      case "orcamentos":
        return (
          <div className="space-y-3">
            {(mockCRCData.orcamentos as typeof mockCRCData.orcamentos).map(
              (item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback
                        style={{
                          backgroundColor: "var(--color-gold-light)",
                          color: "var(--color-text)",
                          fontSize: "12px",
                        }}
                      >
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p
                        className="font-body text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="font-body text-xs"
                        style={{ color: "var(--color-gold)" }}
                      >
                        {item.amount}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="font-body text-xs font-normal"
                    style={{
                      backgroundColor: "#25D366",
                      color: "white",
                    }}
                  >
                    <MessageCircle size={14} className="mr-1" strokeWidth={1.5} />
                    Enviar
                  </Button>
                </div>
              )
            )}
          </div>
        );

      case "inadimplencia":
        return (
          <div className="space-y-3">
            {(mockCRCData.inadimplencia as typeof mockCRCData.inadimplencia).map(
              (item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback
                        style={{
                          backgroundColor: "#ffcdd2",
                          color: "#d32f2f",
                          fontSize: "12px",
                        }}
                      >
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p
                        className="font-body text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="font-body text-xs"
                        style={{ color: "#d32f2f" }}
                      >
                        {item.amount}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="font-body text-xs font-normal"
                    style={{
                      backgroundColor: "#25D366",
                      color: "white",
                    }}
                  >
                    <MessageCircle size={14} className="mr-1" strokeWidth={1.5} />
                    Enviar
                  </Button>
                </div>
              )
            )}
          </div>
        );

      case "faltou":
        return (
          <div className="space-y-3">
            {(mockCRCData.faltou as typeof mockCRCData.faltou).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      style={{
                        backgroundColor: "#fff3e0",
                        color: "#e65100",
                        fontSize: "12px",
                      }}
                    >
                      {item.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p
                      className="font-body text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {item.name}
                    </p>
                    <p
                      className="font-body text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {new Date(item.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="font-body text-xs font-normal"
                  style={{
                    backgroundColor: "#25D366",
                    color: "white",
                  }}
                >
                  <MessageCircle size={14} className="mr-1" strokeWidth={1.5} />
                  Enviar
                </Button>
              </div>
            ))}
          </div>
        );

      case "desmarcados":
        return (
          <div className="space-y-3">
            {(mockCRCData.desmarcados as typeof mockCRCData.desmarcados).map(
              (item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback
                        style={{
                          backgroundColor: "#f3e5f5",
                          color: "#7b1fa2",
                          fontSize: "12px",
                        }}
                      >
                        {item.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p
                        className="font-body text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="font-body text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {new Date(item.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="font-body text-xs font-normal"
                    style={{
                      backgroundColor: "#25D366",
                      color: "white",
                    }}
                  >
                    <MessageCircle size={14} className="mr-1" strokeWidth={1.5} />
                    Enviar
                  </Button>
                </div>
              )
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Shell>
      <div className="mb-8">
        <h1
          className="font-display text-4xl font-normal"
          style={{ color: "var(--color-text)", letterSpacing: "0.1em" }}
        >
          CRC
        </h1>
      </div>

      {/* Tabs with Badges */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="pb-3 px-1 border-b-2 font-normal relative whitespace-nowrap"
              style={{
                color:
                  activeTab === tab.id
                    ? "var(--color-gold)"
                    : "var(--color-text-muted)",
                borderColor:
                  activeTab === tab.id
                    ? "var(--color-gold)"
                    : "transparent",
              }}
            >
              <span className="font-body text-sm">{tab.label}</span>
              <Badge
                className="absolute -top-1 -right-2 font-body text-xs font-normal"
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "var(--color-text)",
                  minWidth: "20px",
                  padding: "2px 6px",
                }}
              >
                {mockCRCData[tab.id].length}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <Card className="aria-card">
        <CardContent className="pt-6">
          {renderTabContent()}
        </CardContent>
      </Card>
    </Shell>
  );
}
