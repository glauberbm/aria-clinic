'use client';

import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Plus, Plug } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('clinica');

  const tabs = [
    { id: 'clinica', label: 'Clínica' },
    { id: 'profissionais', label: 'Profissionais' },
    { id: 'unidades', label: 'Unidades' },
    { id: 'integracoes', label: 'Integrações' },
    { id: 'conta', label: 'Conta' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'clinica':
        return (
          <div className="space-y-6">
            <div>
              <label className="font-body text-xs mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                Logo da Clínica
              </label>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
                style={{ borderColor: 'var(--color-gold)' }}
              >
                <p className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Clique para fazer upload do logo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="font-body text-xs mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                  Nome da Clínica
                </label>
                <Input
                  defaultValue="ArIA Clinic"
                  className="border"
                  style={{ borderColor: 'var(--color-divider)' }}
                />
              </div>
              <div>
                <label className="font-body text-xs mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                  CNPJ
                </label>
                <Input defaultValue="12.345.678/0001-90" className="border" style={{ borderColor: 'var(--color-divider)' }} />
              </div>
              <div>
                <label className="font-body text-xs mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                  Telefone
                </label>
                <Input defaultValue="(82) 3021-9999" className="border" style={{ borderColor: 'var(--color-divider)' }} />
              </div>
              <div>
                <label className="font-body text-xs mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                  Endereço
                </label>
                <Input defaultValue="Av. Fernandes Lima, 3000" className="border" style={{ borderColor: 'var(--color-divider)' }} />
              </div>
            </div>

            <div>
              <label className="font-body text-xs mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                Horário de Funcionamento
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Seg-Sex: 09:00 - 18:00" className="border" style={{ borderColor: 'var(--color-divider)' }} />
                <Input placeholder="Sábado: 09:00 - 14:00" className="border" style={{ borderColor: 'var(--color-divider)' }} />
              </div>
            </div>

            <Button style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-bg)' }} className="font-body text-sm font-normal">
              Salvar Alterações
            </Button>
          </div>
        );

      case 'profissionais':
        return (
          <div className="space-y-6">
            <Button style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-bg)' }} className="font-body text-sm font-normal mb-4">
              <Plus size={16} className="mr-2" />
              Adicionar Profissional
            </Button>

            <div className="space-y-4">
              {[
                { name: 'Dra. Camila Santos', specialty: 'Médica Estética', status: 'Ativo' },
                { name: 'Dr. Bruno Costa', specialty: 'Cirurgião Plástico', status: 'Ativo' },
                { name: 'Dra. Fernanda Lima', specialty: 'Dermatologista', status: 'Ativo' },
                { name: 'Dr. Roberto Oliveira', specialty: 'Anestesiologista', status: 'Inativo' },
              ].map((prof, idx) => (
                <Card key={idx} className="aria-card">
                  <CardContent className="pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{prof.name.split(' ')[0][0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-display text-sm" style={{ color: 'var(--color-text)' }}>
                          {prof.name}
                        </p>
                        <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {prof.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge style={{ backgroundColor: prof.status === 'Ativo' ? '#2C5534' : '#5C2C2C', color: prof.status === 'Ativo' ? '#76C776' : '#FF6B6B' }}>
                        {prof.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'unidades':
        return (
          <div className="space-y-6">
            <Button style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-bg)' }} className="font-body text-sm font-normal mb-4">
              <Plus size={16} className="mr-2" />
              Adicionar Unidade
            </Button>

            <div className="grid grid-cols-2 gap-6">
              {[
                { city: 'Arapiraca/AL', status: 'Principal' },
                { city: 'Aracaju/SE', status: 'Secundária' },
              ].map((unit, idx) => (
                <Card key={idx} className="aria-card">
                  <CardContent className="pt-6">
                    <p className="font-display text-lg" style={{ color: 'var(--color-text)' }}>
                      {unit.city}
                    </p>
                    <p className="font-body text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                      Unidade {unit.status}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Gerenciar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'integracoes':
        return (
          <div className="space-y-4">
            {[
              { name: 'ArIA Agent — WhatsApp', status: 'CONECTADO', color: '#2C5534' },
              { name: 'Google Calendar', status: 'CONECTADO', color: '#2C5534' },
              { name: 'Asaas — Financeiro', status: 'CONFIGURAR', color: '#6B5B00' },
              { name: 'D4Sign — Assinatura Digital', status: 'CONFIGURAR', color: '#6B5B00' },
            ].map((integ, idx) => (
              <Card key={idx} className="aria-card">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Plug size={24} style={{ color: 'var(--color-gold)' }} />
                    <p className="font-display text-sm" style={{ color: 'var(--color-text)' }}>
                      {integ.name}
                    </p>
                  </div>
                  <Badge style={{ backgroundColor: integ.color, color: integ.status === 'CONECTADO' ? '#76C776' : '#FFD700' }}>
                    {integ.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'conta':
        return (
          <div className="space-y-6">
            <Card className="aria-card">
              <CardHeader>
                <CardTitle style={{ color: 'var(--color-gold)' }}>Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="font-body text-xs mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                    Email
                  </label>
                  <Input defaultValue="admin@ariaclinic.com.br" disabled className="border" style={{ borderColor: 'var(--color-divider)' }} />
                </div>
                <div>
                  <label className="font-body text-xs mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                    Senha
                  </label>
                  <Input type="password" placeholder="••••••••" className="border" style={{ borderColor: 'var(--color-divider)' }} />
                </div>
                <Button style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-bg)' }} className="font-body text-sm font-normal">
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Shell>
      <div className="mb-8">
        <h1
          className="font-display text-4xl font-normal mb-6"
          style={{ color: 'var(--color-text)', letterSpacing: '0.1em' }}
        >
          Configurações
        </h1>

        <div className="flex gap-4 border-b" style={{ borderColor: 'var(--color-divider)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="pb-4 font-body text-sm font-normal transition-colors"
              style={{
                color: activeTab === tab.id ? 'var(--color-gold)' : 'var(--color-text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-gold)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="aria-card">
        <CardContent className="pt-6">{renderTabContent()}</CardContent>
      </Card>
    </Shell>
  );
}
