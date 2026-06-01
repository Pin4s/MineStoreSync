import { AutomationRow } from "@/components/dashboard/automation-row";
import { Button } from "@/components/ui/button";
import { type AutomationRecord } from "@/lib/dashboard";

type AutomationsListProps = {
  automations: AutomationRecord[];
  loading: boolean;
  error: string | null;
  connected: boolean;
  onRetry: () => void;
  onCreateAutomation: () => void;
};

export function AutomationsList({
  automations,
  loading,
  error,
  connected,
  onRetry,
  onCreateAutomation
}: AutomationsListProps) {
  return (
    <section id="automations" className="panel-surface overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#112411] px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]">
            Automações ativas
          </p>
          <p className="text-sm leading-6 text-[#6b7280]">
            Rotinas em execução no momento, com progresso apenas onde existe meta acumulada.
          </p>
        </div>
        {!connected ? (
          <p className="text-xs uppercase tracking-[0.22em] text-[#fde68a]">
            Execução depende da conexão
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="grid gap-4 px-4 py-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="panel-surface-soft skeleton-shimmer p-4">
              <div className="h-4 w-40 bg-[#101510]" />
              <div className="mt-3 h-3 w-60 bg-[#101510]" />
              <div className="mt-4 h-3 w-36 bg-[#101510]" />
              <div className="mt-4 h-2 w-full bg-[#101510]" />
              <div className="mt-3 h-10 w-full bg-[#101510]" />
            </div>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="space-y-4 px-4 py-6">
          <p className="text-sm text-[#fca5a5]">{error}</p>
          <Button
            type="button"
            onClick={onRetry}
            className="h-10 rounded-none border border-[#22c55e] bg-[#22c55e] px-4 font-[family:var(--font-jetbrains-mono)] text-sm font-semibold text-[#031404] hover:bg-[#16a34a]"
          >
            Recarregar automações
          </Button>
        </div>
      ) : null}

      {!loading && !error && automations.length === 0 ? (
        <div className="flex flex-col items-start gap-4 px-4 py-8">
          <div className="space-y-2">
            <p className="font-[family:var(--font-share-tech-mono)] text-2xl text-[#f0f0f0]">
              Nenhuma automação ativa ainda.
            </p>
            <p className="max-w-2xl text-sm leading-6 text-[#6b7280]">
              Crie sua primeira automação para começar a sincronizar metas e eventos da
              CentralCart.
            </p>
          </div>
          <Button
            type="button"
            onClick={onCreateAutomation}
            className="h-11 rounded-none border border-[#22c55e] bg-[#22c55e] px-4 font-[family:var(--font-jetbrains-mono)] text-sm font-semibold text-[#031404] hover:bg-[#16a34a]"
          >
            + Nova automação
          </Button>
        </div>
      ) : null}

      {!loading && !error && automations.length > 0 ? (
        <div className="grid gap-4 px-4 py-4">
          {automations.map((automation) => (
            <AutomationRow key={automation.id} automation={automation} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
