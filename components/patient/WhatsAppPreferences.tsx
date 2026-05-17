'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface WhatsAppPreferencesProps {
  patientId: string;
  onSaved?: () => void;
}

export function WhatsAppPreferences({ patientId, onSaved }: WhatsAppPreferencesProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [preferences, setPreferences] = useState({
    whatsapp_enabled: true,
    appointment_reminder_consent: true,
    marketing_consent: false,
    newsletter_consent: false,
    prefer_morning: false,
    prefer_afternoon: true,
    prefer_evening: false,
  });

  // Fetch current preferences
  useEffect(() => {
    async function fetchPreferences() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('patient_contact_preferences')
          .select('*')
          .eq('patient_id', patientId)
          .single();

        if (fetchError) {
          // If no preferences exist, they'll be created on save
          setIsLoading(false);
          return;
        }

        if (data) {
          setPreferences(data);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching preferences:', error);
        setError('Erro ao carregar preferências');
        setIsLoading(false);
      }
    }

    fetchPreferences();
  }, [patientId]);

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSaved(false);

      // Try to update, if not found, create new record
      const { error: upsertError } = await supabase
        .from('patient_contact_preferences')
        .upsert(
          {
            patient_id: patientId,
            ...preferences,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'patient_id',
          }
        );

      if (upsertError) {
        throw upsertError;
      }

      setSaved(true);
      onSaved?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Erro ao salvar preferências');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="aria-card">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500">Carregando preferências...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="aria-card">
      <CardHeader>
        <CardTitle className="font-body text-lg font-normal flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <MessageSquare size={20} style={{ color: 'var(--color-gold)' }} />
          Preferências de Comunicação WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#FEE', borderColor: '#D32F2F', borderWidth: '1px' }}>
            <AlertCircle size={18} style={{ color: '#D32F2F' }} />
            <p className="text-sm" style={{ color: '#D32F2F' }}>
              {error}
            </p>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F0F9FF', borderColor: '#0284C7', borderWidth: '1px' }}>
            <CheckCircle2 size={18} style={{ color: '#0284C7' }} />
            <p className="text-sm" style={{ color: '#0284C7' }}>
              Preferências atualizadas com sucesso!
            </p>
          </div>
        )}

        {/* Enable WhatsApp */}
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.whatsapp_enabled}
              onChange={(e) => handlePreferenceChange('whatsapp_enabled', e.target.checked)}
              className="w-4 h-4"
            />
            <div>
              <p className="font-body font-medium" style={{ color: 'var(--color-text)' }}>
                Habilitar WhatsApp
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Receber comunicações via WhatsApp
              </p>
            </div>
          </label>
        </div>

        {preferences.whatsapp_enabled && (
          <>
            {/* Appointment Reminders */}
            <div className="space-y-2 pl-7 border-l-2" style={{ borderColor: 'var(--color-divider)' }}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.appointment_reminder_consent}
                  onChange={(e) => handlePreferenceChange('appointment_reminder_consent', e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-body font-medium" style={{ color: 'var(--color-text)' }}>
                    Lembretes de Consulta
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Receber lembretes 24h e 1h antes da consulta
                  </p>
                </div>
              </label>
            </div>

            {/* Marketing & Newsletter */}
            <div className="space-y-3 pl-7 border-l-2" style={{ borderColor: 'var(--color-divider)' }}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.marketing_consent}
                  onChange={(e) => handlePreferenceChange('marketing_consent', e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-body font-medium" style={{ color: 'var(--color-text)' }}>
                    Comunicações de Marketing
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Promoções, atualizações de serviços e conteúdo informativo
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.newsletter_consent}
                  onChange={(e) => handlePreferenceChange('newsletter_consent', e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-body font-medium" style={{ color: 'var(--color-text)' }}>
                    Boletim Informativo
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Dicas de saúde e dicas de wellness
                  </p>
                </div>
              </label>
            </div>

            {/* Preferred Communication Times */}
            <div className="space-y-2">
              <p className="font-body font-medium" style={{ color: 'var(--color-text)' }}>
                Horários Preferidos de Comunicação
              </p>
              <div className="space-y-2 pl-7">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.prefer_morning}
                    onChange={(e) => handlePreferenceChange('prefer_morning', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>
                    Manhã (6h - 12h)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.prefer_afternoon}
                    onChange={(e) => handlePreferenceChange('prefer_afternoon', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>
                    Tarde (12h - 18h)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.prefer_evening}
                    onChange={(e) => handlePreferenceChange('prefer_evening', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>
                    Noite (18h - 23h)
                  </span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="pt-4 border-t" style={{ borderColor: 'var(--color-divider)' }}>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="font-body text-sm font-normal px-6 py-2"
            style={{ backgroundColor: 'var(--color-gold)', color: 'white' }}
          >
            {isSaving ? 'Salvando...' : 'Salvar Preferências'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
