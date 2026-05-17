'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  async function handleVerify() {
    if (!token.trim()) {
      setError('Por favor, insira o código de verificação');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao verificar email');
      }

      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendCode() {
    setResendLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Erro ao reenviar código');
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reenviar código');
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificar Email</h1>
        <p className="text-gray-600 mb-6">
          Enviamos um código de verificação para <span className="font-semibold">{email}</span>
        </p>

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Email verificado com sucesso! Redirecionando...
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Verificação
            </label>
            <Input
              type="text"
              placeholder="000000"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading || success}
              maxLength={6}
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={isLoading || success || !token.trim()}
            className="w-full"
          >
            {isLoading ? 'Verificando...' : 'Verificar'}
          </Button>

          <Button
            onClick={handleResendCode}
            disabled={resendLoading}
            variant="outline"
            className="w-full"
          >
            {resendLoading ? 'Reenviando...' : 'Reenviar Código'}
          </Button>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Problemas para entrar?{' '}
          <a href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            Voltar ao login
          </a>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center"><p className="text-gray-600">Carregando...</p></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
