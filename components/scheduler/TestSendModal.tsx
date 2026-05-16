"use client";

import React, { useState } from "react";
import { useScheduler } from "@/lib/store/scheduler";
import { fillTemplate, REMINDER_TEMPLATES } from "@/lib/utils/reminder";

interface TestSendModalProps {
  onClose: () => void;
}

export function TestSendModal({ onClose }: TestSendModalProps) {
  const { appointments, doctors, sendReminder } = useScheduler();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Filter appointments for future dates and non-cancelled status
  const upcomingAppointments = appointments
    .filter(
      (apt) =>
        new Date(apt.date) > new Date() &&
        apt.status !== "cancelled" &&
        apt.status !== "completed"
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 20); // Limit to 20 for display

  const selectedAppointment = appointments.find(
    (apt) => apt.id === selectedAppointmentId
  );
  const selectedDoctor = selectedAppointment
    ? doctors.find((d) => d.id === selectedAppointment.doctorId)
    : null;

  const preview = selectedAppointment && selectedDoctor
    ? fillTemplate(REMINDER_TEMPLATES.default, selectedAppointment, selectedDoctor)
    : null;

  const handleSend = async () => {
    if (!selectedAppointmentId) {
      setMessage({ type: "error", text: "Selecione uma consulta" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await sendReminder(selectedAppointmentId);

      if (result.success) {
        setMessage({
          type: "success",
          text: `Lembrete enviado com sucesso! ID: ${result.messageId}`,
        });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: `Erro ao enviar: ${result.error}`,
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erro ao enviar lembrete",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Enviar Lembrete de Teste</h2>
          <p className="text-sm text-gray-600 mt-1">
            Selecione uma consulta para enviar um lembrete de teste
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {message && (
            <div
              className={`p-4 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : message.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Appointment Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione uma Consulta
            </label>
            <select
              value={selectedAppointmentId}
              onChange={(e) => {
                setSelectedAppointmentId(e.target.value);
                setMessage(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Selecione uma consulta --</option>
              {upcomingAppointments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.patientName} - {new Date(apt.date).toLocaleDateString("pt-BR")} às{" "}
                  {apt.timeStart} com {apt.doctorName}
                </option>
              ))}
            </select>
            {upcomingAppointments.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Nenhuma consulta futura disponível
              </p>
            )}
          </div>

          {/* Message Preview */}
          {preview && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prévia da Mensagem
              </label>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-sm text-gray-800 leading-relaxed">{preview}</p>
              </div>
            </div>
          )}

          {selectedAppointment && selectedDoctor && (
            <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-800">
              <p>
                <strong>Paciente:</strong> {selectedAppointment.patientName}
              </p>
              <p>
                <strong>Telefone:</strong> {selectedAppointment.patientPhone}
              </p>
              <p>
                <strong>Médico:</strong> {selectedDoctor.name}
              </p>
              <p>
                <strong>Data/Hora:</strong>{" "}
                {new Date(selectedAppointment.date).toLocaleDateString("pt-BR")} às{" "}
                {selectedAppointment.timeStart}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || !selectedAppointmentId}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
          >
            {isLoading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
