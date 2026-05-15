"use client";

import { Search } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  return (
    <header
      className="fixed top-0 left-60 right-0 h-16 border-b flex items-center justify-between px-8"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-divider)",
        zIndex: 40,
      }}
    >
      {/* Search Bar — Centered */}
      <div className="flex-1 flex justify-center max-w-md mx-auto">
        <div
          className="relative w-full"
          style={{
            backgroundColor: "var(--color-bg)",
            borderRadius: "8px",
            border: "1px solid var(--color-divider)",
          }}
        >
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            style={{ color: "var(--color-text-muted)" }}
          />
          <input
            type="text"
            placeholder="Encontre pacientes ou funcionalidades"
            className="w-full bg-transparent pl-10 pr-4 py-2 font-body text-sm outline-none"
            style={{ color: "var(--color-text)" }}
          />
        </div>
      </div>

      {/* Right Section — Avatar + Name */}
      <div className="flex items-center gap-3 ml-8">
        <div className="text-right">
          <p className="font-body text-sm font-normal" style={{ color: "var(--color-text)" }}>
            Dra. Sabryna
          </p>
          <p className="font-body text-xs" style={{ color: "var(--color-text-muted)" }}>
            Harmonização Facial
          </p>
        </div>
        <Avatar className="w-10 h-10">
          <AvatarImage src="https://github.com/shadcn.png" alt="Dra. Sabryna" />
          <AvatarFallback style={{ backgroundColor: "var(--color-gold)", color: "#ffffff" }}>
            SV
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
