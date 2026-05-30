import { ProgressBar } from "@/components/dashboard/progress-bar";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  formatAutomationValue,
  formatFriendlyDate,
  getAutomationDescription,
  getCurrentValue,
  getGoalValue,
  getProgressPercentage,
  hasProgress,
  type AutomationRecord
} from "@/lib/dashboard";

type AutomationRowProps = {
  automation: AutomationRecord;
  onOpenSettings: () => void;
};

export function AutomationRow({ automation, onOpenSettings }: AutomationRowProps) {
  const progress = getProgressPercentage(automation);
  const currentValue = getCurrentValue(automation);
  const goalValue = getGoalValue(automation);
  const showProgress = hasProgress(automation.conditionType);

  return (
    <article className="grid gap-4 border-t border-[#112411] px-4 py-4 first:border-t-0 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_120px] lg:items-start">
      <div className="min-w-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="truncate font-[family:var(--font-share-tech-mono)] text-sm uppercase tracking-[0.18em] text-[#f0f0f0]">
              {automation.conditionType}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              {getAutomationDescription(automation.conditionType)}
            </p>
          </div>
          <StatusBadge tone={automation.active ? "success" : "neutral"}>
            {automation.active ? "Ativa" : "Inativa"}
          </StatusBadge>
        </div>

        <p className="mt-3 text-xs text-[#6b7280]">
          Última execução:{" "}
          <span className="text-[#f0f0f0]">{formatFriendlyDate(automation.lastTriggeredAt)}</span>
        </p>

        {showProgress && progress !== null ? (
          <div className="mt-4 max-w-xl">
            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-[#86efac]">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <ProgressBar value={progress} />
            <p className="mt-2 text-xs text-[#6b7280]">
              <span className="text-[#f0f0f0]">
                {formatAutomationValue(automation.conditionType, currentValue)}
              </span>{" "}
              / {formatAutomationValue(automation.conditionType, goalValue)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 text-xs uppercase tracking-[0.18em] text-[#6b7280]">
        <div className="panel-surface-soft p-3">
          <p className="text-[10px] tracking-[0.24em] text-[#6b7280]">Nome</p>
          <p className="mt-2 truncate text-xs text-[#f0f0f0]">{automation.name}</p>
        </div>
        <div className="panel-surface-soft p-3">
          <p className="text-[10px] tracking-[0.24em] text-[#6b7280]">Comando</p>
          <p className="mt-2 truncate text-xs text-[#f0f0f0]">{automation.command}</p>
        </div>
      </div>

      <div className="flex items-start justify-start lg:justify-end">
        <button
          type="button"
          onClick={onOpenSettings}
          className="text-xs uppercase tracking-[0.24em] text-[#86efac] transition-colors duration-75 hover:text-[#f0f0f0]"
        >
          &gt; Ver detalhes
        </button>
      </div>
    </article>
  );
}
