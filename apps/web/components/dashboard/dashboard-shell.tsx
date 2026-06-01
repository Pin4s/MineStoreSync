"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { useIntegrationStatus } from "@/hooks/use-integration-status";

const sidebarItems = [
  { id: "dashboard", label: "Início", href: "/dashboard" },
  { id: "integrations", label: "Configuração", href: "/dashboard/integrations" },
  { id: "automations", label: "Automações", href: "/dashboard/automations" },
  { id: "guia", label: "Ajuda", href: "/dashboard/guia" },
];

function getActiveItem(pathname: string): string {
  if (pathname === "/dashboard") return "dashboard";
  const match = sidebarItems.find(
    (item) => item.href !== "/dashboard" && pathname.startsWith(item.href)
  );
  return match?.id ?? "dashboard";
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { integration, loading } = useIntegrationStatus();

  const activeItem = getActiveItem(pathname);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f0f0f0]">
      {/* Background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 blueprint-grid opacity-80"
      />
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.06),transparent_28%)]"
      />

      {/* Sidebar persistente */}
      <DashboardSidebar
        items={sidebarItems}
        activeItem={activeItem}
        integration={integration}
        loading={loading}
        isOpen={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        onSelect={() => setSidebarOpen(false)}
      />

      {/* Conteúdo — margem esquerda compensa sidebar fixa */}
      <div className="relative z-10 lg:pl-[272px]">
        <div className="mx-auto max-w-[1600px] px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </div>
      </div>
    </main>
  );
}
