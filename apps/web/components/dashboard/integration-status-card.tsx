import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  formatFriendlyDate,
  formatRelativeDate,
  getTokenStatusLabel,
  type IntegrationStatus
} from "@/lib/dashboard";

type IntegrationStatusCardProps = {
  status: IntegrationStatus | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenSettings: () => void;
};

function getConnectionTone(connected: boolean) {
  return connected ? "success" : "danger";
}

function getTokenTone(tokenStatus: IntegrationStatus["tokenStatus"]) {
  if (tokenStatus === "valid") {
    return "success";
  }

  if (tokenStatus === "expired") {
    return "warning";
  }

  return "neutral";
}

export function IntegrationStatusCard({
  status,
  loading,
  error,
  onRetry,
  onOpenSettings
}: IntegrationStatusCardProps) {
  if (loading) {
    return (
      <section id="integration" className="panel-surface skeleton-shimmer overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#163a16] bg-[#0f1a0f] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
            <span className="h-3 w-3 rounded-full bg-[#eab308]" />
            <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
          </div>
          <div className="h-3 w-32 bg-[#163a16]" />
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
          <div className="space-y-3">
            <div className="h-5 w-28 bg-[#101510]" />
            <div className="h-10 w-40 bg-[#101510]" />
            <div className="h-4 w-52 bg-[#101510]" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="h-16 bg-[#101510]" />
            <div className="h-16 bg-[#101510]" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="integration" className="panel-surface p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#ef4444]">
              configuration.error
            </p>
            <h2 className="font-[family:var(--font-share-tech-mono)] text-2xl text-[#f0f0f0]">
              Não foi possível carregar a configuração
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-[#6b7280]">{error}</p>
          </div>
          <Button
            type="button"
            onClick={onRetry}
            className="h-11 rounded-none border border-[#22c55e] bg-[#22c55e] px-4 font-[family:var(--font-jetbrains-mono)] text-sm font-semibold text-[#031404] hover:bg-[#16a34a]"
          >
            Tentar novamente
          </Button>
        </div>
      </section>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <section id="integration" className="panel-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#163a16] bg-[#0f1a0f] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
          <span className="h-3 w-3 rounded-full bg-[#eab308]" />
          <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
        </div>
        <p className="terminal-cursor text-[11px] uppercase tracking-[0.3em] text-[#86efac]">
          configuration.status
        </p>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]">Configuração</p>
            <h2 className="font-[family:var(--font-share-tech-mono)] text-3xl text-[#f0f0f0]">
              {status.connected ? "Conectado" : "Pendente"}
            </h2>
            <p className="text-sm leading-6 text-[#6b7280]">
              Loja conectada:{" "}
              <span className="font-medium text-[#f0f0f0]">{status.storeName}</span>
            </p>
            <p className="text-sm leading-6 text-[#6b7280]">
              Última verificação:{" "}
              <span className="text-[#f0f0f0]">
                {status.lastCheckedAt
                  ? `${formatFriendlyDate(status.lastCheckedAt)} (${formatRelativeDate(
                      status.lastCheckedAt
                    )})`
                  : "Sem registro"}
              </span>
            </p>
          </div>

          {!status.connected ? (
            <div className="border border-[#4a1a1a] bg-[#140808] px-4 py-3 text-sm text-[#fca5a5]">
              As automações dependem de uma configuração ativa com a CentralCart e o servidor.
            </div>
          ) : null}
        </div>

        <div className="grid gap-3">
          <div className="panel-surface-soft p-4">
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#6b7280]">Conexão</p>
            <div className="mt-3">
              <StatusBadge tone={getConnectionTone(status.connected)}>
                {status.connected ? "Conectado" : "Pendente"}
              </StatusBadge>
            </div>
          </div>

          <div className="panel-surface-soft p-4">
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#6b7280]">Token</p>
            <div className="mt-3">
              <StatusBadge tone={getTokenTone(status.tokenStatus)}>
                {getTokenStatusLabel(status.tokenStatus)}
              </StatusBadge>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onOpenSettings}
            className="h-11 rounded-none border border-[#1a4a1a] bg-[#0a0a0a] px-4 font-[family:var(--font-jetbrains-mono)] text-sm font-semibold text-[#86efac] shadow-none transition-colors duration-75 hover:border-[#22c55e] hover:bg-[#111611] hover:text-[#f0fdf4]"
          >
            Ver configuração
          </Button>
        </div>
      </div>
    </section>
  );
}
