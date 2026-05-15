'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { profileUpdateSchema, ProfileUpdateInput } from '@/lib/validations/profile';
import { ArrowLeft, Upload, Trash2, CheckCircle } from 'lucide-react';
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

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchName = watch('name');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar perfil');
        }

        const data = await response.json();
        setProfile(data);
        setPreviewUrl(data.avatar_url);
        reset({ name: data.name, avatar_url: data.avatar_url || '' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileUpdateInput) => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao atualizar perfil');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile.user);
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);

      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo deve ter no máximo 5MB');
        return;
      }

      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Apenas JPEG e PNG são permitidos');
        return;
      }

      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao fazer upload do avatar');
      }

      const data = await response.json();
      setProfile((prev) => prev ? { ...prev, avatar_url: data.url } : null);
      setSuccess('Avatar atualizado com sucesso!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setError(null);
      setUploading(true);

      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Falha ao deletar avatar');
      }

      setProfile((prev) => prev ? { ...prev, avatar_url: null } : null);
      setPreviewUrl(null);
      setSuccess('Avatar removido com sucesso!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar avatar');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft size={16} />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading">Editar Perfil</h1>
            <p className="text-sm text-gray-500">Atualize suas informações pessoais</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-600">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {/* Form */}
        {loading ? (
          <Card>
            <CardHeader>
              <CardTitle>Carregando...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : profile ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Avatar className="h-32 w-32">
                  {previewUrl && (
                    <AvatarImage src={previewUrl} alt={profile.name} />
                  )}
                  <AvatarFallback className="text-2xl">
                    {getInitials(watchName || profile.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-3">
                  <label className="block">
                    <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 px-6 py-3 text-center hover:border-gray-400">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Upload size={16} />
                        {uploading ? 'Enviando...' : 'Clique para fazer upload'}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        JPEG ou PNG, máximo 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>

                  {previewUrl && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAvatar}
                      disabled={uploading}
                      className="gap-2"
                    >
                      <Trash2 size={16} />
                      Remover Avatar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Basic Info Section */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <Input
                    {...register('name')}
                    placeholder="Seu nome completo"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    value={profile.email}
                    disabled
                    className="mt-1 bg-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email não pode ser alterado
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Clinic Info - Read Only */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Profissionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Clínica
                  </label>
                  <Input
                    value={profile.clinic_id || 'Sem clínica atribuída'}
                    disabled
                    className="mt-1 bg-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Clínica pode ser alterada apenas por administrador
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || uploading}
                className="min-w-32"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Link href="/profile">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        ) : null}
      </div>
    </Shell>
  );
}
