"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 text-left font-mono">
      {/* Title */}
      <div className="space-y-1">
        <Skeleton className="h-6 w-28 bg-zinc-800" />
        <Skeleton className="h-3 w-64 bg-zinc-800/60" />
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-lg bg-zinc-800" />
        ))}
      </div>

      {/* Profile + Workspace Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/5 bg-zinc-950/45 p-6 backdrop-blur-md space-y-5"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg bg-zinc-800" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-32 bg-zinc-800" />
                <Skeleton className="h-2 w-24 bg-zinc-800/60" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-9 w-full rounded-lg bg-zinc-800" />
              <Skeleton className="h-9 w-full rounded-lg bg-zinc-800" />
              <Skeleton className="h-8 w-full rounded-lg bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>

      {/* Session + API Tokens Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/5 bg-zinc-950/45 p-6 backdrop-blur-md space-y-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg bg-zinc-800" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-36 bg-zinc-800" />
                <Skeleton className="h-2 w-28 bg-zinc-800/60" />
              </div>
            </div>
            <Skeleton className="h-8 w-full rounded-lg bg-zinc-800" />
            <Skeleton className="h-8 w-full rounded-lg bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
