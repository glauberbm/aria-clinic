'use client';

import { useEffect, useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: string;
  body: string;
  channel: string;
  message_type: string;
  status: string;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
}

interface WhatsAppConversationHistoryProps {
  patientId: string;
  limit?: number;
}

const statusColors: Record<string, { bg: string; text: string; icon: ComponentType<SVGProps<SVGSVGElement>> }> = {
  pending: { bg: '#FEF3C7', text: '#D97706', icon: Clock },
  sent: { bg: '#DBEAFE', text: '#0284C7', icon: MessageSquare },
  delivered: { bg: '#DBEAFE', text: '#0284C7', icon: CheckCircle2 },
  read: { bg: '#ECFDF5', text: '#059669', icon: CheckCircle2 },
  failed: { bg: '#FEE2E2', text: '#DC2626', icon: AlertCircle },
};

const messageTypeLabels: Record<string, string> = {
  appointment_reminder: 'Lembrete de Consulta',
  follow_up: 'Acompanhamento',
  treatment_update: 'Atualização de Tratamento',
  notification: 'Notificação',
  general: 'Mensagem Geral',
};

export function WhatsAppConversationHistory({ patientId, limit = 20 }: WhatsAppConversationHistoryProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('patient_communications')
          .select('*')
          .eq('patient_id', patientId)
          .eq('channel', 'whatsapp')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fetchError) {
          throw fetchError;
        }

        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching conversation history:', error);
        setError('Erro ao carregar histórico de mensagens');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, [patientId, limit]);

  if (isLoading) {
    return (
      <Card className="aria-card">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500">Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="aria-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} style={{ color: '#D32F2F' }} />
            <p className="text-sm" style={{ color: '#D32F2F' }}>
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="aria-card">
        <CardHeader>
          <CardTitle className="font-body text-lg font-normal flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <MessageSquare size={20} style={{ color: 'var(--color-gold)' }} />
            Histórico de Mensagens WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Nenhuma mensagem WhatsApp enviada ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="aria-card">
      <CardHeader>
        <CardTitle className="font-body text-lg font-normal flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <MessageSquare size={20} style={{ color: 'var(--color-gold)' }} />
          Histórico de Mensagens WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((message) => {
            const statusInfo = statusColors[message.status] || statusColors.sent;
            const StatusIcon = statusInfo.icon;
            const messageType = messageTypeLabels[message.message_type] || message.message_type;
            const sentTime = new Date(message.sent_at);

            return (
              <div
                key={message.id}
                className="p-3 border rounded-lg"
                style={{ borderColor: 'var(--color-divider)', backgroundColor: 'var(--color-bg-secondary)' }}
              >
                {/* Header: Type and Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs font-body" style={{ backgroundColor: 'var(--color-gold)', color: 'white' }}>
                      {messageType}
                    </Badge>
                    <div className="flex items-center gap-1" style={{ color: statusInfo.text }}>
                      <StatusIcon width={14} height={14} />
                      <span className="text-xs font-medium capitalize">{message.status}</span>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {formatDistanceToNow(sentTime, { addSuffix: true, locale: ptBR })}
                  </p>
                </div>

                {/* Message Content */}
                <p className="font-body text-sm" style={{ color: 'var(--color-text)', lineHeight: '1.5' }}>
                  {message.body}
                </p>

                {/* Delivery Info */}
                {(message.delivered_at || message.read_at || message.error_message) && (
                  <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {message.delivered_at && (
                      <div>
                        ✓ Entregue:{' '}
                        {new Date(message.delivered_at).toLocaleString('pt-BR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                    {message.read_at && (
                      <div>
                        ✓✓ Lido:{' '}
                        {new Date(message.read_at).toLocaleString('pt-BR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                    {message.error_message && (
                      <div style={{ color: '#D32F2F' }}>
                        Erro: {message.error_message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
