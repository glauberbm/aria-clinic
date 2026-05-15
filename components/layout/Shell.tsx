"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Sidebar />
      <Header />

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto mt-16 ml-60"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
