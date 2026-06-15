export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-espresso/10 animate-pulse rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-espresso/15 rounded-xl p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-2 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonLine() {
  return <Skeleton className="h-3 w-full my-1" />;
}
