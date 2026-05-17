"use client";

import React, { useState } from "react";
import type { ReminderTemplate as ReminderTemplateKey } from "@/lib/utils/reminder";
import { useScheduler } from "@/lib/store/scheduler";
import { ReminderTemplate } from "./ReminderTemplate";

export function ReminderSettingsComponent() {
  const { reminderSettings, setReminderSettings } = useScheduler();
  const [selectedTemplate, setSelectedTemplate] = useState<ReminderTemplateKey>(
    "default"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = () => {
    setIsLoading(true);
    // Simulate save delay
    setTimeout(() => {
      setIsLoading(false);
      setMessage({ type: "success", text: "Configurações salvas com sucesso!" });
      setTimeout(() => setMessage(null), 3000);
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Configurações de Lembretes
        </h2>

        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enable-reminders"
              checked={reminderSettings.enabled}
              onChange={(e) =>
                setReminderSettings({ enabled: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="enable-reminders" className="ml-3">
              <span className="font-medium text-gray-900">
                Ativar lembretes de consulta
              </span>
              <p className="text-sm text-gray-600">
                Envie mensagens de lembrete automáticas aos pacientes
              </p>
            </label>
          </div>

          {/* Timing Options */}
          {reminderSettings.enabled && (
            <div className="ml-7 space-y-3 border-l-2 border-gray-200 pl-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reminderSettings.timings.dayBefore}
                  onChange={(e) =>
                    setReminderSettings({
                      timings: {
                        ...reminderSettings.timings,
                        dayBefore: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">
                  Enviar 24 horas antes da consulta
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reminderSettings.timings.hourBefore}
                  onChange={(e) =>
                    setReminderSettings({
                      timings: {
                        ...reminderSettings.timings,
                        hourBefore: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">
                  Enviar 1 hora antes da consulta
                </span>
              </label>
            </div>
          )}

          {/* Template Selection */}
          {reminderSettings.enabled && (
            <div className="pt-4 border-t border-gray-200">
              <ReminderTemplate
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
              />
            </div>
          )}

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {isLoading ? "Salvando..." : "Salvar Configurações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
