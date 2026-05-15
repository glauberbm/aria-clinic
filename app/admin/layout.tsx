'use client';

import { AuthProvider } from '@/lib/supabase/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/lib/supabase/auth-context';
import { hasRole } from '@/lib/auth/permissions';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useSupabaseAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get user's clinic
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${user.session?.access_token}`,
        },
      });

      if (!response.ok) {
        router.push('/auth/login');
        return;
      }

      const profile = await response.json();
      const admin = await hasRole(user.id, profile.clinic_id, 'admin');

      if (!admin) {
        router.push('/app/dashboard');
        return;
      }

      setIsAdmin(true);
      setChecking(false);
    };

    if (!loading) {
      checkAdmin();
    }
  }, [user, loading, router]);

  if (loading || checking) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return <div>{children}</div>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
