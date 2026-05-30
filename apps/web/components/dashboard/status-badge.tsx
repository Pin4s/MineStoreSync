import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "success" | "danger" | "warning" | "neutral";
};

const tones = {
  success: "border-[#1a4a1a] bg-[#0d1710] text-[#86efac]",
  danger: "border-[#4a1a1a] bg-[#170909] text-[#fca5a5]",
  warning: "border-[#4a3d1a] bg-[#171209] text-[#fde68a]",
  neutral: "border-[#1f2a1f] bg-[#0d0f0d] text-[#9ca3af]"
} as const;

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.26em]",
        tones[tone]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
