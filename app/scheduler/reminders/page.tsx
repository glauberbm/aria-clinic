"use client";

import React, { useState } from "react";
import { useScheduler } from "@/lib/store/scheduler";
import { ReminderSettingsComponent } from "@/components/scheduler/ReminderSettings";
import { RemindersHistory } from "@/components/scheduler/RemindersHistory";
import { TestSendModal } from "@/components/scheduler/TestSendModal";

export default function RemindersPage() {
  const [showTestModal, setShowTestModal] = useState(false);
  const { reminderHistory } = useScheduler();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gerenciamento de Lembretes
          </h1>
          <p className="text-gray-600">
            Configure lembretes de consulta e acompanhe o histórico de envios
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Settings Panel */}
          <div className="lg:col-span-2">
            <ReminderSettingsComponent />
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h3>
              <button
                onClick={() => setShowTestModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Enviar Teste
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Selecione uma consulta e simule o envio de lembrete
              </p>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div>
          <RemindersHistory history={reminderHistory} />
        </div>
      </div>

      {/* Test Send Modal */}
      {showTestModal && (
        <TestSendModal onClose={() => setShowTestModal(false)} />
      )}
    </div>
  );
}
