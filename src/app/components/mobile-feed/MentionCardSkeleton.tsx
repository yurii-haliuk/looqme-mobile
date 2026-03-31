import { Skeleton } from '@/app/components/ui/skeleton';

export function MentionCardSkeleton() {
  return (
    <div className="bg-white border border-[#d4d9e7] rounded-[6px] p-2 flex flex-col gap-4 w-full">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Status line */}
      <Skeleton className="h-[2px] w-full" />

      {/* Author row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="size-5 rounded-full" />
        </div>
      </div>

      {/* Title */}
      <Skeleton className="h-6 w-3/4" />

      {/* Body text */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Separator */}
      <Skeleton className="h-px w-full" />

      {/* Metrics */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-8" />
      </div>
    </div>
  );
}
