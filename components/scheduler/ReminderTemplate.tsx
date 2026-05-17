"use client";

import React from "react";
import type { ReminderTemplate } from "@/lib/utils/reminder";
import {
  REMINDER_TEMPLATES,
  getSampleFilledTemplate,
} from "@/lib/utils/reminder";

interface ReminderTemplateProps {
  selectedTemplate: ReminderTemplate;
  onTemplateChange: (template: ReminderTemplate) => void;
  appointmentType?: "consultation" | "followup" | "procedure";
}

export function ReminderTemplate({
  selectedTemplate,
  onTemplateChange,
  appointmentType = "consultation",
}: ReminderTemplateProps) {
  const templates = Object.entries(REMINDER_TEMPLATES);
  const sampleText = getSampleFilledTemplate(selectedTemplate, appointmentType);

  return (
    <div className="space-y-4">
      {/* Template Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template de Lembrete
        </label>
        <select
          value={selectedTemplate}
          onChange={(e) => onTemplateChange(e.target.value as ReminderTemplate)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {templates.map(([key]) => (
            <option key={key} value={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Template Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Visualização
        </label>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <p className="text-gray-800 text-sm leading-relaxed">{sampleText}</p>
        </div>
      </div>

      {/* Placeholder Legend */}
      <div className="bg-blue-50 p-3 rounded-md">
        <p className="text-xs font-medium text-blue-900 mb-2">Placeholders:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>
            <code className="bg-white px-1 py-0.5 rounded">{"{{PATIENT}}"}</code>{" "}
            — Nome do paciente
          </li>
          <li>
            <code className="bg-white px-1 py-0.5 rounded">{"{{DATE}}"}</code> —
            Data da consulta
          </li>
          <li>
            <code className="bg-white px-1 py-0.5 rounded">{"{{TIME}}"}</code> —
            Horário da consulta
          </li>
          <li>
            <code className="bg-white px-1 py-0.5 rounded">{"{{DOCTOR}}"}</code> —
            Nome do médico
          </li>
          <li>
            <code className="bg-white px-1 py-0.5 rounded">
              {"{{PROCEDURE}}"}
            </code>{" "}
            — Tipo de procedimento
          </li>
        </ul>
      </div>
    </div>
  );
}
