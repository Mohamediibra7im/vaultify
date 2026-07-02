"use client";

import { Skeleton } from "@/components/ui/skeleton";

const heroStatRows = ["coverage", "activity", "posture"];
const deckRows = ["client-protection", "audit-stream"];
const sidebarSkeletonRows = ["primary", "secondary"];

export default function DashboardLoading() {
  return (
    <div className="space-y-6 pb-10">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
        <div className="rounded-2xl border border-line bg-surface-1 p-6 sm:p-8">
          <div className="space-y-4">
            <Skeleton className="h-4 w-28 rounded-full bg-zinc-800" />
            <Skeleton className="h-10 w-3/4 bg-zinc-800" />
            <Skeleton className="h-4 w-full max-w-xl bg-zinc-800/60" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 w-32 rounded-full bg-zinc-800" />
              <Skeleton className="h-10 w-36 rounded-full bg-zinc-800" />
            </div>
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {heroStatRows.map((row) => (
                <div key={row} className="rounded-2xl border border-line bg-(--surface-0)/70 p-4">
                  <Skeleton className="h-3 w-24 bg-zinc-800" />
                  <Skeleton className="mt-3 h-8 w-12 bg-zinc-800" />
                  <Skeleton className="mt-2 h-3 w-full bg-zinc-800/60" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {deckRows.map((row) => (
            <div key={row} className="rounded-2xl border border-line bg-surface-1 p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24 bg-zinc-800" />
                  <Skeleton className="h-4 w-48 bg-zinc-800" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl bg-zinc-800" />
              </div>
              <div className="mt-4 space-y-3">
                {sidebarSkeletonRows.map((row) => (
                  <div key={row} className="flex items-center gap-3 rounded-2xl border border-line bg-(--surface-0)/70 p-3">
                    <Skeleton className="h-8 w-8 rounded-xl bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-36 bg-zinc-800" />
                      <Skeleton className="h-3 w-4/5 bg-zinc-800/60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
