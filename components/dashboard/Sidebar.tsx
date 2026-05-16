'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  Users,
  DollarSign,
  Settings,
  LogOut,
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/patients', label: 'Patients', icon: Users },
    { href: '/dashboard/financials', label: 'Financials', icon: DollarSign },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Toggle Button (hidden on desktop) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed md:hidden top-4 left-4 z-40 p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay (visible when menu is open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200
          pt-20 overflow-y-auto transition-transform duration-300 z-30
          md:translate-x-0 md:left-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        aria-label="Main navigation"
      >
        {/* Navigation Items */}
        <div className="px-4 py-6">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors
                ${
                  isActive(href)
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
              onClick={() => setIsOpen(false)}
              aria-current={isActive(href) ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Logout */}
        <div className="px-4 py-6">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-left"
            onClick={() => {
              // Logout logic will be added later
              console.log('Logout clicked');
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
