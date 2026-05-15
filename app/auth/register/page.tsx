import { RegisterForm } from '@/components/auth/register-form';
import Link from 'next/link';

export const metadata = {
  title: 'Registrar — ArIA Clinic',
  description: 'Crie sua conta para acessar o sistema de gestão da clínica',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900">
            ArIA Clinic
          </h1>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            Criar Conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <Link
              href="/app/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              faça login na sua conta existente
            </Link>
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-xs text-gray-500">
          Ao registrar, você concorda com nossos{' '}
          <Link href="/terms" className="hover:text-gray-400">
            Termos de Serviço
          </Link>
          {' '}e{' '}
          <Link href="/privacy" className="hover:text-gray-400">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
}
