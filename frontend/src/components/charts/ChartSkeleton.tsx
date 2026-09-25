import React from 'react';
import { cn } from '@/lib/utils';

interface ChartSkeletonProps {
  height?: number | string;
  className?: string;
  title?: string;
}

export function ChartSkeleton({ height = 300, className, title }: ChartSkeletonProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;
  const labelText = `Loading ${title || 'chart'} visualization`;

  return (
    <div
      style={{ height: heightStyle }}
      className={cn(
        "w-full rounded-md border border-border-subtle bg-surface/50 p-4 flex flex-col justify-between animate-pulse select-none",
        className
      )}
      aria-label={labelText}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <span className="sr-only">{labelText}</span>

      {/* Chart Title / Legend Skeleton */}
      <div className="flex items-center justify-between" aria-hidden="true">
        <div className="h-4 w-32 bg-border-subtle rounded" />
        <div className="flex gap-2">
          <div className="h-3 w-12 bg-border-subtle rounded" />
          <div className="h-3 w-12 bg-border-subtle rounded" />
        </div>
      </div>

      {/* Grid Lines & Placeholder Bars/Graph Area */}
      <div
        className="flex-1 my-4 flex flex-col justify-between border-l border-b border-border-subtle/80 pl-2 pb-2"
        aria-hidden="true"
      >
        <div className="w-full border-t border-dashed border-border-subtle/40" />
        <div className="w-full border-t border-dashed border-border-subtle/40" />
        <div className="w-full border-t border-dashed border-border-subtle/40" />
        <div className="w-full border-t border-dashed border-border-subtle/40" />
      </div>

      {/* X-Axis Labels Skeleton */}
      <div className="flex justify-between px-2" aria-hidden="true">
        <div className="h-2.5 w-8 bg-border-subtle rounded" />
        <div className="h-2.5 w-8 bg-border-subtle rounded" />
        <div className="h-2.5 w-8 bg-border-subtle rounded" />
        <div className="h-2.5 w-8 bg-border-subtle rounded" />
        <div className="h-2.5 w-8 bg-border-subtle rounded" />
      </div>
    </div>
  );
}
