"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  Mail,
  MessageCircle,
  Printer,
  Eye,
  Trash2,
  Paperclip,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";

// Mock patient data
const mockPatient = {
  id: 1,
  name: "Alessandra Costa",
  age: 32,
  birthDate: "1993-08-15",
  email: "alessandra.costa@email.com",
  whatsapp: "(11) 99901-2345",
  status: "ATIVA",
  plan: "Particular",
  sex: "Feminino",
  referredBy: "Referência pessoal",
  initials: "AC",
};

const mockEvolutions = [
  {
    id: 1,
    professional: "Dra. Sabryna",
    date: "2026-05-10",
    status: "Concluído",
    text: "Paciente apresenta boa resposta ao botox. Recomendado retorno em 30 dias.",
    hasImages: true,
  },
  {
    id: 2,
    professional: "Dra. Sabryna",
    date: "2026-04-28",
    status: "Pendente",
    text: "Aplicação de preenchimento labial com satisfação da paciente.",
    hasImages: false,
  },
  {
    id: 3,
    professional: "Dra. Cristina",
    date: "2026-04-15",
    status: "Concluído",
    text: "Atendimento inicial. Paciente deseja protocolo de hidratação facial profunda.",
    hasImages: true,
  },
];

const professionals = [
  "Dra. Sabryna",
  "Dra. Cristina",
  "Dra. Marina",
  "Dra. Patricia",
];

type TabType = "sobre" | "agendamentos" | "protocolos" | "orcamentos" | "anamnese" | "documentos" | "investimentos";

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id;

  const [activeTab, setActiveTab] = useState<TabType>("sobre");
  const [professional, setProfessional] = useState(professionals[0]);
  const [evolutionDate, setEvolutionDate] = useState("");
  const [evolutionText, setEvolutionText] = useState("");
  const [evolutions, setEvolutions] = useState(mockEvolutions);

  const handleAddEvolution = () => {
    if (!professional || !evolutionDate || !evolutionText.trim()) {
      alert("Preencha todos os campos");
      return;
    }

    const newEvolution = {
      id: evolutions.length + 1,
      professional,
      date: evolutionDate,
      status: "Pendente",
      text: evolutionText,
      hasImages: false,
    };

    setEvolutions([newEvolution, ...evolutions]);
    setProfessional(professionals[0]);
    setEvolutionDate("");
    setEvolutionText("");
  };

  const handleDeleteEvolution = (id: number) => {
    setEvolutions(evolutions.filter((e) => e.id !== id));
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "Concluído"
      ? { bg: "#d4edda", text: "#155724" }
      : { bg: "#fff3cd", text: "#856404" };
  };

  return (
    <Shell>
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-80">
          <Card
            className="aria-card"
            style={{ backgroundColor: "var(--color-bg-warm)" }}
          >
            <CardContent className="pt-8 pb-6 px-6">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarFallback
                    style={{
                      backgroundColor: "var(--color-gold)",
                      color: "white",
                      fontSize: "32px",
                      fontWeight: "bold",
                    }}
                  >
                    {mockPatient.initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name & Status */}
              <h2
                className="font-display text-2xl font-normal text-center mb-3"
                style={{ color: "var(--color-text)" }}
              >
                {mockPatient.name}
              </h2>
              <div className="text-center mb-6">
                <Badge
                  className="font-body text-xs font-normal"
                  style={{
                    backgroundColor: "var(--color-gold)",
                    color: "var(--color-text)",
                  }}
                >
                  {mockPatient.status}
                </Badge>
              </div>

              {/* Update Avatar Button */}
              <Button
                className="w-full font-body text-xs font-normal py-2 mb-8"
                style={{
                  backgroundColor: "var(--color-text)",
                  color: "white",
                }}
              >
                Atualizar Avatar
              </Button>

              {/* Dados da Paciente */}
              <div>
                <h3
                  className="font-body text-xs font-normal mb-4 uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Dados da Paciente
                </h3>

                <div className="space-y-3 mb-6">
                  <div>
                    <p
                      className="font-body text-xs mb-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      E-mail
                    </p>
                    <p
                      className="font-body text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {mockPatient.email}
                    </p>
                  </div>

                  <div>
                    <p
                      className="font-body text-xs mb-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Idade
                    </p>
                    <p
                      className="font-body text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {mockPatient.age} anos
                    </p>
                  </div>

                  <div>
                    <p
                      className="font-body text-xs mb-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Data de nascimento
                    </p>
                    <p
                      className="font-body text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {new Date(mockPatient.birthDate).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </div>

                  <div>
                    <p
                      className="font-body text-xs mb-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Contato WhatsApp
                    </p>
                    <Badge
                      className="font-body text-xs font-normal bg-green-100 text-green-700"
                      style={{
                        backgroundColor: "#d4edda",
                        color: "#155724",
                      }}
                    >
                      {mockPatient.whatsapp}
                    </Badge>
                  </div>

                  <div>
                    <p
                      className="font-body text-xs mb-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Plano
                    </p>
                    <p
                      className="font-body text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {mockPatient.plan}
                    </p>
                  </div>

                  <div>
                    <p
                      className="font-body text-xs mb-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Sexo
                    </p>
                    <p
                      className="font-body text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {mockPatient.sex}
                    </p>
                  </div>

                  <div>
                    <p
                      className="font-body text-xs mb-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Indicada por
                    </p>
                    <p
                      className="font-body text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {mockPatient.referredBy}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-6 mb-8 border-b border-gray-200">
            {[
              { id: "sobre" as TabType, label: "Sobre" },
              { id: "agendamentos" as TabType, label: "Agendamentos" },
              { id: "protocolos" as TabType, label: "Protocolos" },
              { id: "orcamentos" as TabType, label: "Orçamentos" },
              { id: "anamnese" as TabType, label: "Anamnese" },
              { id: "documentos" as TabType, label: "Documentos" },
              { id: "investimentos" as TabType, label: "Investimentos Pendentes" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="font-body text-sm pb-3 px-1 border-b-2 font-normal"
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
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content — Sobre */}
          {activeTab === "sobre" && (
            <div className="space-y-6">
              {/* Add Evolution Card */}
              <Card className="aria-card">
                <CardHeader>
                  <CardTitle
                    className="font-body text-lg font-normal"
                    style={{ color: "var(--color-text)" }}
                  >
                    Adicionar Evolução
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Professional Select */}
                  <div>
                    <label
                      className="font-body text-xs mb-2 block"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Profissional
                    </label>
                    <Select value={professional} onValueChange={setProfessional}>
                      <SelectTrigger
                        className="border-0 bg-gray-50 font-body text-sm"
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

                  {/* Date Picker */}
                  <div>
                    <label
                      className="font-body text-xs mb-2 block"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Data da Evolução
                    </label>
                    <Input
                      type="date"
                      value={evolutionDate}
                      onChange={(e) => setEvolutionDate(e.target.value)}
                      className="border-0 bg-gray-50 font-body text-sm"
                      style={{ color: "var(--color-text)" }}
                    />
                  </div>

                  {/* Text Area */}
                  <div>
                    <label
                      className="font-body text-xs mb-2 block"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Digite a evolução da paciente...
                    </label>
                    <Textarea
                      value={evolutionText}
                      onChange={(e) => setEvolutionText(e.target.value)}
                      placeholder="Descreva o atendimento, procedimento realizado, observações..."
                      className="border-0 bg-gray-50 font-body text-sm min-h-24 resize-none"
                      style={{ color: "var(--color-text)" }}
                    />
                  </div>

                  {/* File Attachment */}
                  <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded">
                    <Paperclip
                      size={16}
                      style={{ color: "var(--color-gold)" }}
                      strokeWidth={1.5}
                    />
                    <label
                      className="font-body text-xs cursor-pointer flex-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Anexar Imagens (máx. 5)
                      <input type="file" multiple accept="image/*" className="hidden" />
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 font-body text-sm font-normal"
                      onClick={() => {
                        setProfessional(professionals[0]);
                        setEvolutionDate("");
                        setEvolutionText("");
                      }}
                    >
                      Limpar
                    </Button>
                    <Button
                      className="flex-1 font-body text-sm font-normal"
                      style={{
                        backgroundColor: "var(--color-gold)",
                        color: "var(--color-text)",
                      }}
                      onClick={handleAddEvolution}
                    >
                      Adicionar Evolução
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Evolutions List */}
              <div>
                <h3
                  className="font-body text-lg font-normal mb-4"
                  style={{ color: "var(--color-text)" }}
                >
                  Evoluções
                </h3>
                <div className="space-y-4">
                  {evolutions.map((evolution) => {
                    const statusColor = getStatusBadgeColor(evolution.status);
                    return (
                      <Card key={evolution.id} className="aria-card">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4
                                className="font-body font-medium text-sm"
                                style={{ color: "var(--color-text)" }}
                              >
                                {evolution.professional}
                              </h4>
                              <p
                                className="font-body text-xs"
                                style={{ color: "var(--color-text-muted)" }}
                              >
                                {new Date(evolution.date).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </p>
                            </div>
                            <Badge
                              className="font-body text-xs font-normal"
                              style={{
                                backgroundColor: statusColor.bg,
                                color: statusColor.text,
                              }}
                            >
                              {evolution.status}
                            </Badge>
                          </div>

                          <p
                            className="font-body text-sm mb-4 leading-relaxed"
                            style={{ color: "var(--color-text)" }}
                          >
                            {evolution.text}
                          </p>

                          {evolution.hasImages && (
                            <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 rounded">
                              <AlertCircle
                                size={14}
                                style={{ color: "#0097A7" }}
                                strokeWidth={1.5}
                              />
                              <span
                                className="font-body text-xs"
                                style={{ color: "#0097A7" }}
                              >
                                {evolution.id > 2 ? "3 imagens" : "2 imagens"} anexadas
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              className="p-1 hover:opacity-70"
                              title="Email"
                            >
                              <Mail
                                size={16}
                                style={{ color: "var(--color-text-muted)" }}
                                strokeWidth={1.5}
                              />
                            </button>
                            <button
                              className="p-1 hover:opacity-70"
                              title="WhatsApp"
                            >
                              <MessageCircle
                                size={16}
                                style={{ color: "#25D366" }}
                                strokeWidth={1.5}
                              />
                            </button>
                            <button
                              className="p-1 hover:opacity-70"
                              title="Imprimir"
                            >
                              <Printer
                                size={16}
                                style={{ color: "var(--color-text-muted)" }}
                                strokeWidth={1.5}
                              />
                            </button>
                            <button
                              className="p-1 hover:opacity-70"
                              title="Visualizar"
                            >
                              <Eye
                                size={16}
                                style={{ color: "var(--color-gold)" }}
                                strokeWidth={1.5}
                              />
                            </button>
                            <button
                              className="p-1 hover:opacity-70 ml-auto"
                              title="Deletar"
                              onClick={() => handleDeleteEvolution(evolution.id)}
                            >
                              <Trash2
                                size={16}
                                style={{ color: "#D32F2F" }}
                                strokeWidth={1.5}
                              />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {activeTab !== "sobre" && (
            <Card className="aria-card">
              <CardContent className="py-12 text-center">
                <p
                  className="font-body text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Conteúdo de {activeTab} será adicionado em breve.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Shell>
  );
}
