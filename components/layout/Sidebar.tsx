"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Sparkles,
  FileText,
  FileX,
  DollarSign,
  Bell,
  ScrollText,
  UserCheck,
  Settings,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const menuItems = [
    {
      section: "RECURSOS & ROTINAS",
      items: [
        { label: "Dashboard", href: "/", icon: LayoutDashboard },
        { label: "Agenda", href: "/agenda", icon: Calendar },
        { label: "Pacientes", href: "/pacientes", icon: Users },
        { label: "Protocolos HOF", href: "/protocolos", icon: Sparkles },
        { label: "Orçamentos", href: "/orcamentos", icon: FileText },
        { label: "Orç. Reprovados", href: "/orcamentos-reprovados", icon: FileX },
      ],
    },
    {
      section: "CLÍNICA",
      items: [
        { label: "Financeiro", href: "/financeiro", icon: DollarSign },
        { label: "CRC", href: "/crc", icon: Bell },
        { label: "Contratos", href: "/contratos", icon: ScrollText },
        { label: "Profissionais", href: "/profissionais", icon: UserCheck },
        { label: "Configurações", href: "/configuracoes", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-60 overflow-y-auto border-r"
      style={{
        backgroundColor: "var(--color-sidebar)",
        borderColor: "var(--color-divider)",
      }}
    >
      {/* Logo Section */}
      <div className="flex flex-col items-center gap-1 border-b px-6 py-8">
        <div className="text-center">
          <h1
            className="font-display text-3xl font-normal"
            style={{ color: "var(--color-gold)", letterSpacing: "0.1em" }}
          >
            ArIA
          </h1>
          <p
            className="font-body text-xs font-light"
            style={{
              color: "var(--color-gold-light)",
              letterSpacing: "0.15em",
            }}
          >
            CLINIC
          </p>
        </div>
        <div
          className="text-2xl"
          style={{
            color: "var(--color-gold)",
            opacity: 0.4,
          }}
        >
          ∞
        </div>
        <p
          className="text-center font-body text-xs mt-3"
          style={{
            color: "var(--color-gold-light)",
            letterSpacing: "0.05em",
          }}
        >
          SV Clinic
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-8 px-4 py-8">
        {menuItems.map((section) => (
          <div key={section.section}>
            {/* Section Label */}
            <p
              className="font-body text-xs font-normal mb-3 px-3"
              style={{
                color: "var(--color-gold-light)",
                letterSpacing: "0.08em",
              }}
            >
              {section.section}
            </p>

            {/* Menu Items */}
            <ul className="space-y-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                        active ? "sidebar-item-active" : ""
                      }`}
                      style={
                        active
                          ? {
                              backgroundColor: "rgba(201, 169, 110, 0.1)",
                              color: "var(--color-gold)",
                              borderLeft: "3px solid var(--color-gold)",
                              paddingLeft: "12px",
                            }
                          : {
                              color: "var(--color-gold-light)",
                            }
                      }
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.5}
                        className="flex-shrink-0"
                      />
                      <span className="font-body text-sm font-normal">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div
        className="border-t px-6 py-6 mt-auto font-body text-xs"
        style={{
          borderColor: "var(--color-divider)",
          color: "var(--color-gold-light)",
        }}
      >
        <p className="text-center mb-2">ArIA v1.0</p>
        <p className="text-center opacity-50">Desenvolvido com ∞</p>
      </div>
    </aside>
  );
}
