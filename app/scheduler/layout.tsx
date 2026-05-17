"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ListTodo,
  Users,
  BarChart3,
  Settings,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Calendário", href: "/scheduler/calendar", icon: <Calendar className="w-4 h-4" /> },
  { label: "Agendamentos", href: "/scheduler/appointments", icon: <ListTodo className="w-4 h-4" /> },
  { label: "Médicos", href: "/scheduler/doctors", icon: <Users className="w-4 h-4" /> },
  { label: "Relatórios", href: "/scheduler/reports", icon: <BarChart3 className="w-4 h-4" /> },
  { label: "Configurações", href: "/scheduler/settings", icon: <Settings className="w-4 h-4" /> },
];

export default function SchedulerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-lg font-semibold text-gray-900">
              Agendador
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#8B6F47] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  {item.icon}
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen && (
            <p className="text-xs text-gray-500">
              © 2024 ArIA Clinic
            </p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
