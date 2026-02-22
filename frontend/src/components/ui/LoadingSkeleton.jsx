export function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-bg-elevated rounded animate-pulse" />
      ))}
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-4 animate-pulse">
      <div className="h-3 bg-bg-elevated rounded w-1/2 mb-3" />
      <div className="h-8 bg-bg-elevated rounded w-1/3 mb-2" />
      <div className="h-3 bg-bg-elevated rounded w-2/3" />
    </div>
  );
}
