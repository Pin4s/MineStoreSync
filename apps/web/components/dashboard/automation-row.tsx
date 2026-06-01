"use client";

import { useState } from "react";

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
};

export function AutomationRow({ automation }: AutomationRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const progress = getProgressPercentage(automation);
  const currentValue = getCurrentValue(automation);
  const goalValue = getGoalValue(automation);
  const showProgress = hasProgress(automation.conditionType);

  return (
    <article className="panel-surface-soft p-4">
      <div className="flex flex-col gap-3 border-b border-[#112411] pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="font-[family:var(--font-share-tech-mono)] text-base uppercase tracking-[0.18em] text-[#f0f0f0]">
            {automation.name}
          </p>
          <p className="text-sm leading-6 text-[#6b7280]">
            {getAutomationDescription(automation.conditionType)}
          </p>
          <p className="text-xs text-[#6b7280]">
            Última execução:{" "}
            <span className="text-[#f0f0f0]">{formatFriendlyDate(automation.lastTriggeredAt)}</span>
          </p>
        </div>

        <div className="shrink-0">
          <StatusBadge tone={automation.active ? "success" : "neutral"}>
            {automation.active ? "Ativa" : "Inativa"}
          </StatusBadge>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        {showProgress && progress !== null ? (
          <section className="space-y-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#86efac]">Progresso</p>
              <p className="text-xs text-[#6b7280]">
                <span className="text-[#f0f0f0]">
                  {formatAutomationValue(automation.conditionType, currentValue)}
                </span>{" "}
                / {formatAutomationValue(automation.conditionType, goalValue)}
              </p>
            </div>
            <ProgressBar value={progress} />
            <p className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">{progress}% concluído</p>
          </section>
        ) : null}

        <section className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#86efac]">Comando</p>
            <button
              type="button"
              onClick={() => setDetailsOpen((current) => !current)}
              className="text-xs font-medium text-[#86efac] transition-colors duration-75 hover:text-[#f0f0f0]"
            >
              {detailsOpen ? "Ocultar detalhes" : "Ver detalhes"}
            </button>
          </div>

          <div className="border border-[#111111] bg-[#050505] px-3 py-3">
            <p
              className={
                detailsOpen
                  ? "break-words font-[family:var(--font-jetbrains-mono)] text-xs leading-6 text-[#f0f0f0]"
                  : "overflow-hidden font-[family:var(--font-jetbrains-mono)] text-xs leading-6 text-[#f0f0f0] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
              }
            >
              {automation.command}
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
