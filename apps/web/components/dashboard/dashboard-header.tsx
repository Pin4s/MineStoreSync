import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  onCreateAutomation: () => void;
  onOpenSettings: () => void;
};

export function DashboardHeader({
  onCreateAutomation,
  onOpenSettings
}: DashboardHeaderProps) {
  return (
    <header
      id="dashboard"
      className="flex flex-col gap-5 border-b border-[#112411] pb-6 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]">main.home</p>
        <div className="space-y-2">
          <h1 className="font-[family:var(--font-share-tech-mono)] text-4xl text-[#f0f0f0]">
            Início
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[#6b7280]">
            Visão geral da configuração, da loja e das automações ativas.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onOpenSettings}
          className="h-11 rounded-none border border-[#1a4a1a] bg-[#0a0a0a] px-4 font-[family:var(--font-jetbrains-mono)] text-sm font-semibold text-[#86efac] shadow-none transition-colors duration-75 hover:border-[#22c55e] hover:bg-[#111611] hover:text-[#f0fdf4]"
        >
          Ver configuração
        </Button>
        <Button
          type="button"
          onClick={onCreateAutomation}
          className="relative h-11 overflow-hidden rounded-none border border-[#22c55e] bg-[#22c55e] px-5 font-[family:var(--font-jetbrains-mono)] text-sm font-semibold text-[#031404] transition-colors duration-150 hover:bg-[#16a34a]"
        >
          + Criar automação
        </Button>
      </div>
    </header>
  );
}
