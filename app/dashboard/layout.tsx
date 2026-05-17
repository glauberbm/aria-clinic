import { ReactNode } from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';

export const metadata = {
  title: 'Dashboard | Aria Clinic',
  description: 'Clinic dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      <main className="md:ml-64 pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
