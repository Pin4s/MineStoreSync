type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="mt-3 h-2 w-full overflow-hidden border border-[#163a16] bg-[#060806]">
      <div
        className="h-full bg-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.18)] transition-[width] duration-300"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
