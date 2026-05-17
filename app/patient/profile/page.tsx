'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PatientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
  avatarUrl?: string;
}

interface InsuranceInfo {
  id: string;
  provider: string;
  policyNumber: string;
  coverage: string[];
}

interface MedicalHistory {
  id: string;
  type: 'condition' | 'allergy' | 'medication';
  description: string;
  recordedAt: string;
}

export default function PatientProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [insurance, setInsurance] = useState<InsuranceInfo | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const response = await fetch('/api/patient/profile');
      if (!response.ok) throw new Error('Erro ao carregar perfil');

      const data = await response.json();
      setProfile(data.profile);
      setInsurance(data.insurance);
      setMedicalHistory(data.medicalHistory || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!profile) return;
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          bloodType: profile.bloodType,
          heightCm: profile.heightCm,
          weightKg: profile.weightKg,
        }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar perfil');

      setIsEditing(false);
      await fetchProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/patient/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erro ao fazer upload do avatar');

      const data = await response.json();
      setProfile(prev => prev ? { ...prev, avatarUrl: data.url } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-gray-600">Carregando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 mb-4">{error || 'Perfil não encontrado'}</p>
            <Button onClick={() => router.push('/auth/login')} className="w-full">
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 text-red-700">{error}</CardContent>
          </Card>
        )}

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Pessoal</TabsTrigger>
            <TabsTrigger value="insurance">Seguro</TabsTrigger>
            <TabsTrigger value="medical">Médico</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatarUrl || '/default-avatar.png'}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full mb-4 object-cover"
                  />
                  {isEditing && (
                    <label className="text-sm text-indigo-600 cursor-pointer hover:text-indigo-700">
                      Trocar Avatar
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={isSaving}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input value={profile.email} disabled className="bg-gray-100" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo Sanguíneo
                    </label>
                    <Input
                      value={profile.bloodType || ''}
                      onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                      placeholder="O+"
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Altura (cm)
                    </label>
                    <Input
                      type="number"
                      value={profile.heightCm || ''}
                      onChange={(e) => setProfile({ ...profile, heightCm: parseInt(e.target.value) })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peso (kg)
                    </label>
                    <Input
                      type="number"
                      value={profile.weightKg || ''}
                      onChange={(e) => setProfile({ ...profile, weightKg: parseFloat(e.target.value) })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insurance">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Seguro</CardTitle>
              </CardHeader>
              <CardContent>
                {insurance ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Operadora
                      </label>
                      <Input value={insurance.provider} disabled className="bg-gray-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número da Apólice
                      </label>
                      <Input value={insurance.policyNumber} disabled className="bg-gray-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cobertura
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {insurance.coverage.map((c) => (
                          <span
                            key={c}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Nenhuma informação de seguro adicionada</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical">
            <Card>
              <CardHeader>
                <CardTitle>Histórico Médico</CardTitle>
              </CardHeader>
              <CardContent>
                {medicalHistory.length > 0 ? (
                  <div className="space-y-4">
                    {medicalHistory.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.type === 'condition'
                                ? 'Condição'
                                : item.type === 'allergy'
                                ? 'Alergia'
                                : 'Medicação'}
                            </p>
                            <p className="text-gray-700 mt-1">{item.description}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(item.recordedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Nenhum histórico médico registrado</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
