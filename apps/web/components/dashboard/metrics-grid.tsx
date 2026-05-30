import { MetricCard } from "@/components/dashboard/metric-card";

type MetricItem = {
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "success" | "warning";
};

type MetricsGridProps = {
  items: MetricItem[];
  loading?: boolean;
};

export function MetricsGrid({ items, loading = false }: MetricsGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="panel-surface skeleton-shimmer p-4">
            <div className="h-3 w-20 bg-[#101510]" />
            <div className="mt-4 h-10 w-24 bg-[#101510]" />
            <div className="mt-3 h-3 w-28 bg-[#101510]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <MetricCard key={item.label} {...item} />
      ))}
    </div>
  );
}
