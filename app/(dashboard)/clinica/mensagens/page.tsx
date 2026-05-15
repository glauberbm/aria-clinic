"use client";

import { Shell } from "@/components/layout/Shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  User,
  Clock,
  AlertCircle,
  MessageSquare,
  DollarSign,
  Phone,
  Zap,
  Trash2,
  Check,
} from "lucide-react";
import { useState } from "react";

const messageTemplates = [
  {
    id: 1,
    name: "Confirmação de Agendamento",
    icon: Calendar,
    category: "CRM",
    default:
      "Olá %paciente%, seu agendamento com %profissional% está confirmado para %data% às %hora%. Esperamos você!",
  },
  {
    id: 2,
    name: "Alerta 24h",
    icon: AlertCircle,
    category: "CRM",
    default:
      "Oi %paciente%! Lembrando que seu atendimento com %profissional% é amanhã às %hora%. Confirme sua presença! 😊",
  },
  {
    id: 3,
    name: "CRC Aniversariantes",
    icon: User,
    category: "CRC",
    default:
      "Feliz aniversário, %paciente%! 🎉 Como presente, oferecemos 15% de desconto em qualquer protocolo! Venha nos visitar.",
  },
  {
    id: 4,
    name: "CRC Agendamentos",
    icon: Calendar,
    category: "CRC",
    default:
      "Olá %paciente%, você tem um agendamento pendente para %data%. Confirme sua presença através do link.",
  },
  {
    id: 5,
    name: "CRC Orçamentos",
    icon: DollarSign,
    category: "CRC",
    default:
      "Seu orçamento de %investimento% está pronto! Aproveite e agende seu atendimento com %profissional%.",
  },
  {
    id: 6,
    name: "CRC Inadimplência",
    icon: AlertCircle,
    category: "CRC",
    default:
      "Olá %paciente%, identificamos uma pendência em sua conta. Entre em contato em %telefone% para regularizar!",
  },
  {
    id: 7,
    name: "CRC Faltou",
    icon: Zap,
    category: "CRC",
    default:
      "%paciente%, notamos que você faltou ao agendamento de %data%. Gostaria de reagendar?",
  },
  {
    id: 8,
    name: "CRC Desmarcados",
    icon: X,
    category: "CRC",
    default:
      "Que pena que precisou desmarcar, %paciente%! Quando se sentir pronta, estamos aqui para %profissional% cuidar de você!",
  },
];

const availableTags = [
  "%paciente%",
  "%profissional%",
  "%data%",
  "%hora%",
  "%clinica%",
  "%investimento%",
  "%telefone%",
];

function X() {
  return <Trash2 size={20} />;
}

export default function MensagensPage() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [templates, setTemplates] = useState(messageTemplates);

  const handleEdit = (id: number) => {
    const template = templates.find((t) => t.id === id);
    if (template) {
      setEditingId(id);
      setEditText(template.default);
    }
  };

  const handleSave = () => {
    setTemplates(
      templates.map((t) =>
        t.id === editingId ? { ...t, default: editText } : t
      )
    );
    setEditingId(null);
    setEditText("");
  };

  return (
    <Shell>
      <div className="mb-8">
        <h1
          className="font-display text-4xl font-normal mb-2"
          style={{ color: "var(--color-text)", letterSpacing: "0.1em" }}
        >
          Mensagens da Clínica
        </h1>
        <p
          className="font-body text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          Personalize suas mensagens com as tags: {availableTags.join(" · ")}
        </p>
      </div>

      {/* Grid de Templates */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Dialog key={template.id}>
              <Card className="aria-card h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6 flex flex-col items-center text-center h-full">
                  <div className="mb-4 p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-full">
                    <Icon
                      size={24}
                      style={{ color: "var(--color-gold)" }}
                      strokeWidth={1.5}
                    />
                  </div>

                  <h3
                    className="font-body text-sm font-medium mb-6 flex-1"
                    style={{ color: "var(--color-text)" }}
                  >
                    {template.name}
                  </h3>

                  <DialogTrigger asChild>
                    <Button
                      className="w-full font-body text-xs font-normal"
                      style={{
                        backgroundColor: "var(--color-gold)",
                        color: "var(--color-text)",
                      }}
                      onClick={() => handleEdit(template.id)}
                    >
                      Editar
                    </Button>
                  </DialogTrigger>
                </CardContent>
              </Card>

              {/* Modal de Edição */}
              <DialogContent
                className="max-w-2xl"
                style={{
                  backgroundColor: "var(--color-bg-card)",
                  borderColor: "var(--color-divider)",
                }}
              >
                <DialogHeader>
                  <DialogTitle
                    className="font-display text-2xl font-normal"
                    style={{ color: "var(--color-text)" }}
                  >
                    {template.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-6">
                  {/* Available Tags */}
                  <div>
                    <p
                      className="font-body text-xs mb-2"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Tags disponíveis:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() =>
                            setEditText(editText + tag)
                          }
                          className="px-3 py-1 bg-gray-100 rounded text-xs font-body hover:bg-gray-200"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Editor */}
                  <div>
                    <label
                      className="font-body text-xs mb-2 block"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Mensagem
                    </label>
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="border-0 bg-gray-50 font-body text-sm min-h-32 resize-none"
                      style={{ color: "var(--color-text)" }}
                    />
                  </div>

                  {/* Preview */}
                  <div>
                    <p
                      className="font-body text-xs mb-2"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Preview (exemplo):
                    </p>
                    <div
                      className="p-4 rounded border-l-4"
                      style={{
                        backgroundColor: "#f0f8ff",
                        borderColor: "var(--color-gold)",
                        color: "var(--color-text)",
                      }}
                    >
                      <p className="font-body text-sm leading-relaxed">
                        {editText
                          .replace("%paciente%", "Alessandra")
                          .replace("%profissional%", "Dra. Sabryna")
                          .replace("%data%", "21/05/2026")
                          .replace("%hora%", "14:00")
                          .replace("%clinica%", "Aria Clinic")
                          .replace("%investimento%", "R$ 2.500,00")
                          .replace("%telefone%", "(11) 9999-8888")}
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 justify-end pt-4">
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="font-body text-sm font-normal"
                      >
                        Cancelar
                      </Button>
                    </DialogTrigger>
                    <Button
                      className="font-body text-sm font-normal"
                      style={{
                        backgroundColor: "var(--color-gold)",
                        color: "var(--color-text)",
                      }}
                      onClick={handleSave}
                    >
                      <Check size={16} className="mr-2" strokeWidth={1.5} />
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </Shell>
  );
}
