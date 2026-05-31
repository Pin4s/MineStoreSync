"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AutomationsList } from "@/components/dashboard/automations-list";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { IntegrationStatusCard } from "@/components/dashboard/integration-status-card";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { ApiError, getAutomations, getIntegrationStatus } from "@/lib/api";
import { clearStoredAuthToken } from "@/lib/auth";
import {
  formatFriendlyDate,
  formatRelativeDate,
  getGeneralStatus,
  getLatestExecution,
  normalizeIntegrationStatus,
  type AutomationRecord,
  type IntegrationStatus,
} from "@/lib/dashboard";

type AutomationsResponse = {
  automations: AutomationRecord[];
};

export function DashboardContent() {
  const mountedRef = useRef(true);
  const redirectedRef = useRef(false);
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null);
  const [automations, setAutomations] = useState<AutomationRecord[]>([]);
  const [integrationLoading, setIntegrationLoading] = useState(true);
  const [automationsLoading, setAutomationsLoading] = useState(true);
  const [integrationError, setIntegrationError] = useState<string | null>(null);
  const [automationsError, setAutomationsError] = useState<string | null>(null);
  const router = useRouter();

  function redirectToLogin(sessionState: "expired" | "missing") {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    clearStoredAuthToken();
    router.replace(`/login?session=${sessionState}`);
  }

  function handleLogout() {
    clearStoredAuthToken();
    router.replace("/login?loggedOut=1");
  }

  const loadIntegration = async () => {
    setIntegrationLoading(true);
    setIntegrationError(null);
    try {
      const data = await getIntegrationStatus<IntegrationStatus>();
      if (!mountedRef.current) return;
      startTransition(() => setIntegration(normalizeIntegrationStatus(data)));
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        redirectToLogin("expired");
        return;
      }
      if (!mountedRef.current) return;
      setIntegrationError(
        error instanceof Error ? error.message : "Falha ao carregar integração."
      );
    } finally {
      if (mountedRef.current) setIntegrationLoading(false);
    }
  };

  const loadAutomations = async () => {
    setAutomationsLoading(true);
    setAutomationsError(null);
    try {
      const data = await getAutomations<AutomationsResponse>();
      if (!mountedRef.current) return;
      startTransition(() => setAutomations(data.automations ?? []));
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        redirectToLogin("expired");
        return;
      }
      if (!mountedRef.current) return;
      setAutomationsError(
        error instanceof Error ? error.message : "Falha ao carregar automações."
      );
    } finally {
      if (mountedRef.current) setAutomationsLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    redirectedRef.current = false;
    void Promise.all([loadIntegration(), loadAutomations()]);
    return () => { mountedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeAutomations = automations.filter((a) => a.active);
  const latestExecution = getLatestExecution(automations);

  const metrics = [
    {
      label: "AUTOMAÇÕES",
      value: String(automations.length),
      detail: "Total de rotinas cadastradas",
    },
    {
      label: "ATIVAS",
      value: String(activeAutomations.length),
      detail: "Rotinas habilitadas agora",
      tone: activeAutomations.length > 0 ? "success" : "warning",
    },
    {
      label: "ÚLTIMA EXECUÇÃO",
      value: latestExecution ? formatRelativeDate(latestExecution) : "Aguardando",
      detail: latestExecution
        ? formatFriendlyDate(latestExecution)
        : "Sem execuções registradas",
    },
    {
      label: "STATUS GERAL",
      value: getGeneralStatus(Boolean(integration?.connected), activeAutomations.length),
      detail: integration?.connected
        ? "CentralCart conectada"
        : "Configure a integração para executar automações",
      tone: integration?.connected ? "success" : "warning",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <DashboardHeader
        onCreateAutomation={() => router.push("/dashboard/automations")}
        onOpenSettings={() => router.push("/dashboard/integrations")}
      />

      <IntegrationStatusCard
        status={integration}
        loading={integrationLoading}
        error={integrationError}
        onRetry={() => void loadIntegration()}
        onOpenSettings={() => router.push("/dashboard/integrations")}
      />

      <MetricsGrid
        items={[...metrics]}
        loading={automationsLoading && automations.length === 0}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_320px]">
        <AutomationsList
          automations={activeAutomations}
          loading={automationsLoading}
          error={automationsError}
          connected={Boolean(integration?.connected)}
          onRetry={() => void loadAutomations()}
          onCreateAutomation={() => router.push("/dashboard/automations")}
          onOpenSettings={() => router.push("/dashboard/integrations")}
        />

        <aside className="space-y-4">
          <section className="panel-surface p-4">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]">
                Configurações
              </p>
              <h2 className="font-[family:var(--font-share-tech-mono)] text-2xl text-[#f0f0f0]">
                Ações rápidas
              </h2>
              <p className="text-sm leading-6 text-[#6b7280]">
                Acesso rápido para revisar a integração e preparar novas rotinas.
              </p>
            </div>
            <div className="mt-5 grid gap-3">
              <Button
                type="button"
                onClick={() => router.push("/dashboard/integrations")}
                className="h-11 rounded-none border border-[#22c55e] bg-[#22c55e] px-4 font-[family:var(--font-jetbrains-mono)] text-xs font-bold uppercase tracking-[0.24em] text-[#031404] hover:bg-[#16a34a]"
              >
                &gt; Revisar integração
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/automations")}
                className="h-11 rounded-none border border-[#1a4a1a] bg-[#0a0a0a] px-4 font-[family:var(--font-jetbrains-mono)] text-xs font-semibold uppercase tracking-[0.24em] text-[#86efac] shadow-none transition-colors duration-75 hover:border-[#22c55e] hover:bg-[#111611] hover:text-[#f0fdf4]"
              >
                + Nova automação
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                className="h-11 rounded-none border border-[#3a1616] bg-[#0a0a0a] px-4 font-[family:var(--font-jetbrains-mono)] text-xs font-semibold uppercase tracking-[0.24em] text-[#fca5a5] shadow-none transition-colors duration-75 hover:border-[#ef4444] hover:bg-[#150909] hover:text-[#fee2e2]"
              >
                Sair
              </Button>
            </div>
          </section>

          <section className="panel-surface p-4">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]">
                Resumo técnico
              </p>
              <div className="grid gap-3 text-sm text-[#6b7280]">
                <div className="panel-surface-soft p-3">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#6b7280]">Loja</p>
                  <p className="mt-2 text-[#f0f0f0]">
                    {integration?.storeName ?? "CentralCart"}
                  </p>
                </div>
                <div className="panel-surface-soft p-3">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#6b7280]">RCON</p>
                  <p className="mt-2 text-[#f0f0f0]">
                    {integration?.rconHost
                      ? `${integration.rconHost}:${integration.rconPort ?? "--"}`
                      : "Não configurado"}
                  </p>
                </div>
                <div className="panel-surface-soft p-3">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#6b7280]">
                    Status
                  </p>
                  <div className="mt-2">
                    <StatusBadge tone={integration?.connected ? "success" : "warning"}>
                      {integration?.connected ? "Operacional" : "Aguardando conexão"}
                    </StatusBadge>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}