'use client';

import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, X } from 'lucide-react';

const personalizationTags = [
  { tag: '{{nome}}', description: 'Nome do paciente' },
  { tag: '{{protocolo}}', description: 'Protocolo do atendimento' },
  { tag: '{{data}}', description: 'Data da consulta' },
  { tag: '{{profissional}}', description: 'Nome do profissional' },
  { tag: '{{preco}}', description: 'Valor do procedimento' },
];

const mockTemplates = [
  {
    id: 1,
    title: 'Bem-vindo',
    preview: 'Olá {{nome}}, bem-vindo à nossa clínica!',
    content: 'Olá {{nome}},\n\nBem-vindo à nossa clínica de estética avançada. Estamos prontos para transformar sua aparência e confiança.\n\nAtenciosamente,\nEquipe {{profissional}}',
  },
  {
    id: 2,
    title: 'Confirmação de Agendamento',
    preview: 'Confirme seu agendamento para {{data}}',
    content: 'Caro(a) {{nome}},\n\nConfirme seu agendamento para {{data}} às {{hora}}.\nProcedimento: {{protocolo}}\nValor: {{preco}}\n\nPor favor, responda SIM para confirmar.',
  },
  {
    id: 3,
    title: 'Lembrete 24h',
    preview: 'Lembrete: seu agendamento é amanhã!',
    content: 'Olá {{nome}},\n\nEste é um lembrete de que seu agendamento está marcado para amanhã às {{hora}}.\n\nProtocolo: {{protocolo}}\nProfissional: {{profissional}}\n\nAte breve!',
  },
  {
    id: 4,
    title: 'Pós-Procedimento',
    preview: 'Cuidados após seu procedimento',
    content: 'Caro(a) {{nome}},\n\nObrigado por confiar em nós! Aqui estão os cuidados essenciais:\n\n1. Evite sol direto por 7 dias\n2. Use protetor solar SPF 50+\n3. Beba bastante água\n4. Agende seu retorno em 30 dias\n\nQualquer dúvida, nos contacte!',
  },
  {
    id: 5,
    title: 'Falta na Consulta',
    preview: 'Saudade! Gostaria de remarcar?',
    content: 'Oi {{nome}},\n\nNotamos que você não compareceu ao seu agendamento de {{data}}.\n\nGostaria de remarcar? Temos horários disponíveis!\n\nAbrassos,\nEquipe {{profissional}}',
  },
  {
    id: 6,
    title: 'Feedback',
    preview: 'Como foi sua experiência?',
    content: 'Querido(a) {{nome}},\n\nGostaria de ouvir sua opinião sobre o procedimento {{protocolo}} realizado por {{profissional}}.\n\nPoderia nos enviar seu feedback?\n\nSua opinião é muito importante!',
  },
  {
    id: 7,
    title: 'Promoção',
    preview: 'Promoção exclusiva para você!',
    content: 'Olá {{nome}},\n\nTemos uma promoção especial para você!\n\n20% de desconto em qualquer procedimento esta semana!\n\nValor original: {{preco}}\nCom desconto: confirme para saber!\n\nAproveite!',
  },
  {
    id: 8,
    title: 'Despedida',
    preview: 'Até a próxima {{nome}}!',
    content: 'Caro(a) {{nome}},\n\nFoi uma honra atendê-lo(a).\n\nNão hesite em nos contatar para futuras consultas.\n\nAté breve!',
  },
];

type ModalState = 'closed' | 'view' | 'edit';

interface TemplateModal {
  template: (typeof mockTemplates)[0] | null;
  mode: ModalState;
}

export default function MensagensPage() {
  const [modalState, setModalState] = useState<TemplateModal>({
    template: null,
    mode: 'closed',
  });
  const [editedContent, setEditedContent] = useState('');

  const openModal = (template: (typeof mockTemplates)[0]) => {
    setModalState({ template, mode: 'view' });
    setEditedContent(template.content);
  };

  const closeModal = () => {
    setModalState({ template: null, mode: 'closed' });
    setEditedContent('');
  };

  const startEdit = () => {
    setModalState(prev => ({ ...prev, mode: 'edit' }));
  };

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-normal mb-2" style={{ color: 'var(--color-text)', letterSpacing: '0.1em' }}>
          Mensagens CRC
        </h1>
        <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Templates de mensagens personalizadas para WhatsApp
        </p>
      </div>

      {/* Personalization Tags */}
      <Card className="aria-card mb-8">
        <CardHeader>
          <CardTitle className="font-body text-lg font-normal" style={{ color: 'var(--color-text)' }}>
            Tags de Personalização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {personalizationTags.map((tag) => (
              <div key={tag.tag} className="flex items-center gap-2">
                <Badge
                  className="font-body text-xs font-normal"
                  style={{
                    backgroundColor: 'var(--color-gold)',
                    color: 'white',
                  }}
                >
                  {tag.tag}
                </Badge>
                <span className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {tag.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid 2x4 */}
      <div className="grid grid-cols-2 gap-4">
        {mockTemplates.map((template) => (
          <Card
            key={template.id}
            className="aria-card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => openModal(template)}
          >
            <CardHeader>
              <CardTitle className="font-body text-sm font-normal" style={{ color: 'var(--color-text)' }}>
                {template.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)', minHeight: '40px' }}>
                {template.preview}
              </p>
              <div className="flex gap-2">
                <button
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded hover:bg-blue-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(template);
                  }}
                >
                  Visualizar
                </button>
                <button
                  className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-semibold rounded hover:bg-gray-200 transition-colors"
                  title="Editar"
                >
                  <Edit2 size={14} strokeWidth={1.5} />
                </button>
                <button
                  className="px-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded hover:bg-red-100 transition-colors"
                  title="Deletar"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {modalState.mode !== 'closed' && modalState.template && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="aria-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="font-body text-lg font-normal" style={{ color: 'var(--color-text)' }}>
                {modalState.template.title}
              </CardTitle>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="space-y-6">
              {modalState.mode === 'view' ? (
                <>
                  <div>
                    <p className="font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                      Prévia
                    </p>
                    <div className="p-4 bg-gray-50 rounded border border-gray-200">
                      <p className="font-body text-sm whitespace-pre-line" style={{ color: 'var(--color-text)' }}>
                        {editedContent}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 font-body text-sm font-normal"
                      style={{ backgroundColor: 'var(--color-gold)', color: 'white' }}
                      onClick={startEdit}
                    >
                      Editar
                    </Button>
                    <Button
                      className="flex-1 font-body text-sm font-normal"
                      style={{
                        backgroundColor: '#25D366',
                        color: 'white',
                      }}
                    >
                      Usar Template
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                      Conteúdo da Mensagem
                    </p>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded font-body text-sm"
                      rows={10}
                      style={{ color: 'var(--color-text)' }}
                    />
                  </div>
                  <div>
                    <p className="font-body text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                      Prévia
                    </p>
                    <div className="p-4 bg-gray-50 rounded border border-gray-200">
                      <p className="font-body text-sm whitespace-pre-line" style={{ color: 'var(--color-text)' }}>
                        {editedContent}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 font-body text-sm font-normal"
                      style={{ backgroundColor: 'var(--color-gold)', color: 'white' }}
                      onClick={() => setModalState(prev => ({ ...prev, mode: 'view' }))}
                    >
                      Salvar
                    </Button>
                    <Button
                      className="flex-1 font-body text-sm font-normal border"
                      style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)', backgroundColor: 'transparent' }}
                      onClick={closeModal}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Shell>
  );
}
