"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspacesLoading() {
  return (
    <div className="space-y-8 text-left font-mono">
      {/* Title Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32 bg-zinc-800" />
          <Skeleton className="h-3 w-56 bg-zinc-800/60" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg bg-zinc-800" />
      </div>

      {/* Workspace Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/5 bg-zinc-950/25 p-5"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-9 w-9 rounded-lg bg-zinc-800" />
              <Skeleton className="h-4 w-4 bg-zinc-800" />
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-36 bg-zinc-800" />
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center gap-4">
              <Skeleton className="h-2 w-20 bg-zinc-800/60" />
              <Skeleton className="h-2 w-20 bg-zinc-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
