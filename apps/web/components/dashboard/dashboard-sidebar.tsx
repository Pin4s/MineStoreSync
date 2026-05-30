"use client";

import { Menu, X } from "lucide-react";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { cn } from "@/lib/utils";
import { getTokenStatusLabel, type IntegrationStatus } from "@/lib/dashboard";

type SidebarItem = {
  id: string;
  label: string;
  href: string;
};

type DashboardSidebarProps = {
  items: SidebarItem[];
  activeItem: string;
  integration: IntegrationStatus | null;
  loading: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (itemId: string) => void;
};

function getConnectionTone(integration: IntegrationStatus | null) {
  return integration?.connected ? "success" : "danger";
}

function getTokenTone(integration: IntegrationStatus | null) {
  if (!integration) {
    return "neutral";
  }

  if (integration.tokenStatus === "valid") {
    return "success";
  }

  if (integration.tokenStatus === "expired") {
    return "warning";
  }

  return "neutral";
}

export function DashboardSidebar({
  items,
  activeItem,
  integration,
  loading,
  isOpen,
  onOpen,
  onClose,
  onSelect
}: DashboardSidebarProps) {
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center border border-[#1a4a1a] bg-[#0a0a0a] text-[#86efac] shadow-[0_0_14px_rgba(34,197,94,0.08)] lg:hidden"
        aria-label="Abrir navegação"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/70 transition-opacity duration-200 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-[#1a4a1a] bg-[#040404] px-5 py-5 shadow-[0_0_24px_rgba(34,197,94,0.06)] transition-transform duration-200 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 grid-cols-2 gap-[2px] border border-[#1a4a1a] bg-[#071107] p-[4px]">
              <span className="bg-[#163a16]" />
              <span className="bg-[#1f4f1f]" />
              <span className="bg-[#22c55e]" />
              <span className="bg-[#14532d]" />
            </div>
            <div className="space-y-1">
              <p className="font-[family:var(--font-share-tech-mono)] text-lg uppercase tracking-[0.2em] text-[#f0f0f0]">
                MineStoreSync
              </p>
              <p className="text-[10px] uppercase tracking-[0.34em] text-[#6b7280]">
                centralcart ops
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-[#1a4a1a] bg-[#0a0a0a] text-[#86efac] lg:hidden"
            aria-label="Fechar navegação"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 panel-surface-soft p-4">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#6b7280]">Loja</p>
          <p className="mt-3 font-[family:var(--font-share-tech-mono)] text-xl text-[#f0f0f0]">
            {integration?.storeName ?? "CentralCart"}
          </p>

          {loading ? (
            <div className="mt-4 space-y-2">
              <div className="h-6 w-full bg-[#101510]" />
              <div className="h-6 w-32 bg-[#101510]" />
            </div>
          ) : (
            <div className="mt-4 grid gap-2">
              <StatusBadge tone={getConnectionTone(integration)}>
                {integration?.connected ? "Conectado" : "Desconectado"}
              </StatusBadge>
              <StatusBadge tone={getTokenTone(integration)}>
                {getTokenStatusLabel(integration?.tokenStatus ?? "missing")}
              </StatusBadge>
            </div>
          )}
        </div>

        <nav className="mt-8 space-y-2">
          {items.map((item) => {
            const active = activeItem === item.id;

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                className={cn(
                  "block border px-3 py-3 text-sm uppercase tracking-[0.22em] transition-colors duration-75",
                  active
                    ? "border-[#1a4a1a] bg-[#0d1710] text-[#86efac]"
                    : "border-transparent text-[#6b7280] hover:border-[#112411] hover:bg-[#090d09] hover:text-[#f0f0f0]"
                )}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
