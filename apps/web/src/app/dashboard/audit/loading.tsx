"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLoading() {
  return (
    <div className="space-y-6 text-left font-mono">
      {/* Title */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg bg-zinc-800" />
        <div className="space-y-1">
          <Skeleton className="h-6 w-24 bg-zinc-800" />
          <Skeleton className="h-3 w-64 bg-zinc-800/60" />
        </div>
      </div>

      {/* Workspace Selector */}
      <Skeleton className="h-9 w-full max-w-xs rounded-lg bg-zinc-800" />

      {/* Audit Log Table Card */}
      <div className="rounded-2xl border border-white/5 bg-zinc-950/45 p-6 backdrop-blur-md">
        {/* Column Headers */}
        <div className="grid grid-cols-5 gap-4 pb-3 border-b border-white/5 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-3 bg-zinc-800" />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-white/[0.03]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-4 py-3"
            >
              <Skeleton className="h-4 w-full bg-zinc-800/60" />
              <Skeleton className="h-4 w-full bg-zinc-800/60" />
              <Skeleton className="h-4 w-full bg-zinc-800/60" />
              <Skeleton className="h-4 w-full bg-zinc-800/60" />
              <Skeleton className="h-4 w-full bg-zinc-800/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
