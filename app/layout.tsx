import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArIA Clinic — Gestão Inteligente de Clínicas de Estética",
  description:
    "Sistema de gestão completo para clínicas de harmonização facial e estética no Brasil. Agende, organize e cresça.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2C1F14" />
      </head>
      <body className="antialiased h-screen w-screen overflow-hidden">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
