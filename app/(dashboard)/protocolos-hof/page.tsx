"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapaFacial,
} from "@/components/modules/MapaFacial";
import {
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";

const protocolOptions = {
  "Suporte Estrutural": [
    "Botox",
    "Toxina Botulínica",
    "Preenchimento 1ml",
    "Preenchimento 2ml",
  ],
  "Vitalidade Dérmica": [
    "Bioestimulador 150un",
    "Bioestimulador 300un",
    "Skinbooster",
    "Hidratação Profunda",
  ],
  "Refinamento Artístico": [
    "Microagulhamento",
    "Peeling Químico",
    "Laser Fracionado",
    "Ultrassom Microfocado",
  ],
};

const regions = [
  "Testa",
  "Glabela",
  "Olhos",
  "Bochechas",
  "Nariz",
  "Lábios",
  "Mandíbula",
  "Pescoço",
];

const professionals = [
  "Dra. Sabryna",
  "Dra. Cristina",
  "Dra. Marina",
  "Dra. Patricia",
];

interface ProtocolItem {
  id: number;
  pillar: string;
  protocol: string;
  date: string;
  investment: string;
  professional: string;
  regions: string[];
  quantity: string;
  unit: string;
  session: string;
}

export default function ProtocolosHOFPage() {
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [protocolDescription, setProtocolDescription] = useState("");
  const [protocolItems, setProtocolItems] = useState<ProtocolItem[]>([
    {
      id: 1,
      pillar: "Suporte Estrutural",
      protocol: "Botox",
      date: "",
      investment: "",
      professional: professionals[0],
      regions: [],
      quantity: "",
      unit: "UN",
      session: "",
    },
  ]);

  const [showFacialMap, setShowFacialMap] = useState(false);

  const addProtocolItem = () => {
    const newItem: ProtocolItem = {
      id: Math.max(...protocolItems.map((p) => p.id), 0) + 1,
      pillar: "Suporte Estrutural",
      protocol: protocolOptions["Suporte Estrutural"][0],
      date: "",
      investment: "",
      professional: professionals[0],
      regions: [],
      quantity: "",
      unit: "UN",
      session: "",
    };
    setProtocolItems([...protocolItems, newItem]);
  };

  const removeProtocolItem = (id: number) => {
    setProtocolItems(protocolItems.filter((item) => item.id !== id));
  };

  const updateProtocolItem = (
    id: number,
    field: keyof ProtocolItem,
    value: any
  ) => {
    setProtocolItems(
      protocolItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const totalInvestment = protocolItems.reduce((sum, item) => {
    const value = parseFloat(item.investment) || 0;
    return sum + value;
  }, 0);

  const handleSave = () => {
    alert("Protocolo salvo com sucesso!");
  };

  const handleClose = () => {
    setPatientName("");
    setPatientPhone("");
    setProtocolDescription("");
    setProtocolItems([
      {
        id: 1,
        pillar: "Suporte Estrutural",
        protocol: protocolOptions["Suporte Estrutural"][0],
        date: "",
        investment: "",
        professional: professionals[0],
        regions: [],
        quantity: "",
        unit: "UN",
        session: "",
      },
    ]);
  };

  if (showFacialMap) {
    return (
      <Shell>
        <MapaFacial onClose={() => setShowFacialMap(false)} />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="font-display text-4xl font-normal"
            style={{ color: "var(--color-text)", letterSpacing: "0.1em" }}
          >
            Protocolo HOF
          </h1>
          <Badge
            className="font-body text-xs font-normal mt-2"
            style={{
              backgroundColor: "var(--color-gold)",
              color: "var(--color-text)",
            }}
          >
            Arquitetura Facial
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Patient Data */}
          <Card className="aria-card">
            <CardHeader>
              <CardTitle
                className="font-body text-lg font-normal"
                style={{ color: "var(--color-text)" }}
              >
                Dados da Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  className="font-body text-xs mb-2 block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Paciente
                </label>
                <Input
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nome da paciente"
                  className="border-0 bg-gray-50 font-body text-sm"
                  style={{ color: "var(--color-text)" }}
                />
              </div>

              <div>
                <label
                  className="font-body text-xs mb-2 block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Telefone
                </label>
                <Input
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="(11) 9999-9999"
                  className="border-0 bg-gray-50 font-body text-sm"
                  style={{ color: "var(--color-text)" }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Protocol Description */}
          <Card className="aria-card">
            <CardHeader>
              <CardTitle
                className="font-body text-lg font-normal"
                style={{ color: "var(--color-text)" }}
              >
                Página de Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label
                  className="font-body text-xs mb-2 block"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Descrição *
                </label>
                <Textarea
                  value={protocolDescription}
                  onChange={(e) => setProtocolDescription(e.target.value)}
                  placeholder="Descrição do protocolo..."
                  className="border-0 bg-gray-50 font-body text-sm min-h-20 resize-none"
                  style={{ color: "var(--color-text)" }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Protocol Items */}
          <Card className="aria-card">
            <CardHeader>
              <CardTitle
                className="font-body text-lg font-normal"
                style={{ color: "var(--color-text)" }}
              >
                Adicionar Protocolo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {protocolItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-gray-50 rounded space-y-3 relative"
                >
                  <button
                    onClick={() => removeProtocolItem(item.id)}
                    className="absolute top-2 right-2 p-1 hover:opacity-70"
                  >
                    <X
                      size={16}
                      style={{ color: "var(--color-text-muted)" }}
                      strokeWidth={1.5}
                    />
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="font-body text-xs mb-1 block"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Pilar
                      </label>
                      <Select
                        value={item.pillar}
                        onValueChange={(value) =>
                          updateProtocolItem(item.id, "pillar", value)
                        }
                      >
                        <SelectTrigger
                          className="border-0 bg-white font-body text-sm"
                          style={{ color: "var(--color-text)" }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(protocolOptions).map((pillar) => (
                            <SelectItem key={pillar} value={pillar}>
                              {pillar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label
                        className="font-body text-xs mb-1 block"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Protocolo
                      </label>
                      <Select
                        value={item.protocol}
                        onValueChange={(value) =>
                          updateProtocolItem(item.id, "protocol", value)
                        }
                      >
                        <SelectTrigger
                          className="border-0 bg-white font-body text-sm"
                          style={{ color: "var(--color-text)" }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {protocolOptions[
                            item.pillar as keyof typeof protocolOptions
                          ]?.map((proto) => (
                            <SelectItem key={proto} value={proto}>
                              {proto}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label
                        className="font-body text-xs mb-1 block"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Data
                      </label>
                      <Input
                        type="date"
                        value={item.date}
                        onChange={(e) =>
                          updateProtocolItem(item.id, "date", e.target.value)
                        }
                        className="border-0 bg-white font-body text-sm"
                        style={{ color: "var(--color-text)" }}
                      />
                    </div>

                    <div>
                      <label
                        className="font-body text-xs mb-1 block"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Investimento
                      </label>
                      <Input
                        type="number"
                        value={item.investment}
                        onChange={(e) =>
                          updateProtocolItem(
                            item.id,
                            "investment",
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        className="border-0 bg-white font-body text-sm"
                        style={{ color: "var(--color-text)" }}
                      />
                    </div>

                    <div>
                      <label
                        className="font-body text-xs mb-1 block"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Profissional
                      </label>
                      <Select
                        value={item.professional}
                        onValueChange={(value) =>
                          updateProtocolItem(item.id, "professional", value)
                        }
                      >
                        <SelectTrigger
                          className="border-0 bg-white font-body text-sm"
                          style={{ color: "var(--color-text)" }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {professionals.map((prof) => (
                            <SelectItem key={prof} value={prof}>
                              {prof}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="font-body text-xs mb-1 block"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Regiões Selecionadas
                      </label>
                      <Input
                        value={item.regions.join(", ")}
                        readOnly
                        placeholder="Selecione no mapa"
                        className="border-0 bg-white font-body text-sm text-gray-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label
                          className="font-body text-xs mb-1 block"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          Qtd ML/UN
                        </label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateProtocolItem(item.id, "quantity", e.target.value)
                          }
                          placeholder="0"
                          className="border-0 bg-white font-body text-sm"
                          style={{ color: "var(--color-text)" }}
                        />
                      </div>

                      <div>
                        <label
                          className="font-body text-xs mb-1 block"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          Sessão
                        </label>
                        <Input
                          type="number"
                          value={item.session}
                          onChange={(e) =>
                            updateProtocolItem(item.id, "session", e.target.value)
                          }
                          placeholder="0"
                          className="border-0 bg-white font-body text-sm"
                          style={{ color: "var(--color-text)" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full font-body text-sm font-normal"
                onClick={addProtocolItem}
              >
                <Plus size={16} className="mr-2" strokeWidth={1.5} />
                Adicionar Protocolo
              </Button>
            </CardContent>
          </Card>

          {/* Summary & Actions */}
          <Card className="aria-card">
            <CardContent className="pt-6">
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <div className="flex items-center justify-between">
                  <span
                    className="font-body text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Total Investimento:
                  </span>
                  <span
                    className="font-display text-xl font-normal"
                    style={{ color: "var(--color-gold)" }}
                  >
                    R$ {totalInvestment.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 font-body text-sm font-normal"
                  onClick={handleClose}
                >
                  Fechar
                </Button>
                <Button
                  className="flex-1 font-body text-sm font-normal"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-text)",
                  }}
                  onClick={handleSave}
                >
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Facial Map */}
        <div>
          <Card className="aria-card sticky top-8">
            <CardHeader>
              <CardTitle
                className="font-body text-lg font-normal"
                style={{ color: "var(--color-text)" }}
              >
                Mapa Facial Interativo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-96">
              <div className="text-center space-y-4">
                <p
                  className="font-body text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Clique abaixo para visualizar o mapa facial interativo
                </p>
                <Button
                  className="font-body text-sm font-normal"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-text)",
                  }}
                  onClick={() => setShowFacialMap(true)}
                >
                  Abrir Mapa Facial
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
