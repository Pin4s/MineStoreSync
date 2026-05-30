import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "success" | "warning";
};

const toneClasses = {
  default: "text-[#f0f0f0]",
  success: "text-[#86efac]",
  warning: "text-[#fde68a]"
} as const;

export function MetricCard({ label, value, detail, tone = "default" }: MetricCardProps) {
  return (
    <article className="panel-surface p-4">
      <p className="text-[10px] uppercase tracking-[0.34em] text-[#6b7280]">{label}</p>
      <p
        className={cn(
          "mt-4 font-[family:var(--font-share-tech-mono)] text-3xl leading-none",
          toneClasses[tone]
        )}
      >
        {value}
      </p>
      {detail ? <p className="mt-3 text-xs text-[#6b7280]">{detail}</p> : null}
    </article>
  );
}
