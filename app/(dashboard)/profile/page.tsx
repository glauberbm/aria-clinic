'use client';

import { useState, useEffect } from 'react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, Building, User, Calendar, Edit } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  clinic_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar perfil');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <Shell>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading">Meu Perfil</h1>
              <p className="text-sm text-gray-500">Visualize suas informações pessoais</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-red-600">{error}</div>
            </CardContent>
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading">Meu Perfil</h1>
            <p className="text-sm text-gray-500">Visualize suas informações pessoais</p>
          </div>
          <Link href="/profile/edit">
            <Button className="flex items-center gap-2">
              <Edit size={16} />
              Editar Perfil
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle>Carregando...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardContent>
          </Card>
        ) : profile ? (
          <div className="space-y-6">
            {/* Avatar & Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    {profile.avatar_url && (
                      <AvatarImage src={profile.avatar_url} alt={profile.name} />
                    )}
                    <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-heading">{profile.name}</h2>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                    {profile.active && (
                      <Badge className="mt-2 bg-green-100 text-green-800">Ativo</Badge>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 border-t pt-6">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Profissionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Clínica</p>
                    <p className="font-medium">
                      {profile.clinic_id || 'Sem clínica atribuída'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Cadastro em</p>
                    <p className="font-medium">{formatDate(profile.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Última atualização</p>
                    <p className="font-medium">{formatDate(profile.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </Shell>
  );
}
