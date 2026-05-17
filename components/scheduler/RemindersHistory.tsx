"use client";

import React from "react";
import type { ReminderHistory } from "@/lib/store/scheduler";

interface RemindersHistoryProps {
  history: ReminderHistory[];
}

export function RemindersHistory({ history }: RemindersHistoryProps) {
  const recentHistory = history.slice(0, 5); // Show only last 5

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Histórico de Envios Recentes
      </h3>

      {recentHistory.length === 0 ? (
        <p className="text-gray-500 text-center py-6">
          Nenhum lembrete enviado ainda
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-sm font-semibold text-gray-900 pb-3">
                  Paciente
                </th>
                <th className="text-left text-sm font-semibold text-gray-900 pb-3">
                  Data/Hora
                </th>
                <th className="text-left text-sm font-semibold text-gray-900 pb-3">
                  Status
                </th>
                <th className="text-left text-sm font-semibold text-gray-900 pb-3">
                  ID da Mensagem
                </th>
              </tr>
            </thead>
            <tbody>
              {recentHistory.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 text-sm text-gray-900">
                    {entry.patientName}
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {new Date(entry.timestamp).toLocaleString("pt-BR")}
                  </td>
                  <td className="py-3 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === "sent"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {entry.status === "sent" ? "✓ Enviado" : "✗ Falha"}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {entry.messageId ? (
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {entry.messageId.substring(0, 20)}...
                      </code>
                    ) : (
                      entry.error && (
                        <span className="text-red-600 text-xs">{entry.error}</span>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {history.length > 5 && (
        <p className="text-xs text-gray-500 mt-4">
          Mostrando 5 de {history.length} envios
        </p>
      )}
    </div>
  );
}
