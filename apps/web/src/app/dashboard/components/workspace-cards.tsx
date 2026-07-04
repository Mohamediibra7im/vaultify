"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FolderKanban, Users, ArrowRight, Shield } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  _count: { members: number; projects: number };
}

/* ── Loading Skeleton ──────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-gradient-to-br from-surface-1/95 to-surface-0/98 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <div className="absolute top-0 left-0 size-[4px] border-t border-l border-primary/40 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-0 right-0 size-[4px] border-t border-r border-primary/40 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-0 left-0 size-[4px] border-b border-l border-primary/40 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-0 right-0 size-[4px] border-b border-r border-primary/40 rounded-br-sm pointer-events-none" />

      <div className="p-5">
        <div className="h-5 w-40 animate-pulse rounded-md bg-white/[0.06]" />
        <div className="mt-4 flex gap-6">
          <div className="h-4 w-20 animate-pulse rounded bg-white/[0.04]" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/[0.04]" />
        </div>
        <div className="mt-5 flex justify-end">
          <div className="h-4 w-16 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

/* ── Workspace Card ────────────────────────────────────────────── */

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <Link href={`/dashboard/workspaces/${workspace.id}`}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-white/[0.04] bg-gradient-to-br from-surface-1/95 to-surface-0/98 backdrop-blur-xl",
          "transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.6)] cursor-pointer"
        )}
      >
        {/* Laser Cut Corner Details */}
        <div className="absolute top-0 left-0 size-[4px] border-t border-l border-primary/40 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-0 right-0 size-[4px] border-t border-r border-primary/40 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-0 left-0 size-[4px] border-b border-l border-primary/40 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-0 right-0 size-[4px] border-b border-r border-primary/40 rounded-br-sm pointer-events-none" />

        <div className="relative z-10 p-5">
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <Shield className="size-4 text-primary" />
            </div>
            <h3 className="text-[13px] font-bold text-text-primary font-mono uppercase tracking-wider truncate">
              {workspace.name}
            </h3>
          </div>

          {/* Stats Row */}
          <div className="mt-4 flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <Users className="size-3.5 text-text-muted" />
              <span className="text-xs font-mono text-text-muted">
                {workspace._count.members}
                <span className="ml-1 text-[10px] uppercase tracking-wider">members</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <FolderKanban className="size-3.5 text-text-muted" />
              <span className="text-xs font-mono text-text-muted">
                {workspace._count.projects}
                <span className="ml-1 text-[10px] uppercase tracking-wider">projects</span>
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-text-muted">
              Created {new Date(workspace.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono font-medium text-primary transition-colors group-hover:text-primary/80">
              View
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Empty State ───────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-gradient-to-br from-surface-1/95 to-surface-0/98 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] p-16 text-center">
      <div className="absolute top-0 left-0 size-[4px] border-t border-l border-primary/40 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-0 right-0 size-[4px] border-t border-r border-primary/40 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-0 left-0 size-[4px] border-b border-l border-primary/40 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-0 right-0 size-[4px] border-b border-r border-primary/40 rounded-br-sm pointer-events-none" />

      <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
        <Shield className="size-6 text-primary" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-text-primary font-mono uppercase tracking-wider">
        No Workspaces Yet
      </h3>
      <p className="mt-2 text-xs text-text-muted max-w-xs mx-auto">
        Create your first workspace to start managing encrypted secrets with your team.
      </p>
      <Link
        href="/dashboard/workspaces/new"
        className={cn(
          "mt-6 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2",
          "text-[11px] font-mono font-medium uppercase tracking-wider text-primary",
          "transition-all duration-200 hover:bg-primary/20 hover:border-primary/40"
        )}
      >
        Create Workspace
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}

/* ── Main Export ───────────────────────────────────────────────── */

export function WorkspaceCards({
  workspaces,
  loading,
}: {
  workspaces: Workspace[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (workspaces.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} workspace={workspace} />
      ))}
    </div>
  );
}
