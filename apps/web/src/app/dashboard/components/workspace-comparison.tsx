"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Users, FolderKanban } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  _count: { members: number; projects: number };
}

interface WorkspaceComparisonProps {
  workspaces: Workspace[];
  loading: boolean;
}

/* ── CyberPanel (inline — mirrors dashboard/page.tsx) ───────────── */

function CyberPanel({
  children,
  className,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.04] bg-gradient-to-br from-surface-1/95 to-surface-0/98 backdrop-blur-xl transition-all duration-300 hover:border-primary/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      {/* Laser Cut Corner Details */}
      <div className="absolute top-0 left-0 size-[4px] border-t border-l border-primary/40 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-0 right-0 size-[4px] border-t border-r border-primary/40 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-0 left-0 size-[4px] border-b border-l border-primary/40 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-0 right-0 size-[4px] border-b border-r border-primary/40 rounded-br-sm pointer-events-none" />

      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-white/[0.03] px-5 py-4 bg-zinc-950/20">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted font-bold block">
              {subtitle}
            </span>
            <h2 className="mt-0.5 text-[13px] font-bold text-text-primary font-mono uppercase tracking-wider">
              {title}
            </h2>
          </div>
        </header>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ── Skeleton Loader ─────────────────────────────────────────────── */

function SkeletonLoader() {
  return (
    <CyberPanel title="Workspace Comparison" subtitle="Side-by-side overview">
      <div className="divide-y divide-white/[0.03]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
            <div className="h-4 w-32 rounded bg-white/[0.06]" />
            <div className="h-4 w-12 rounded bg-white/[0.04] ml-auto" />
            <div className="h-4 w-14 rounded bg-white/[0.04]" />
            <div className="h-4 w-20 rounded bg-white/[0.04]" />
            <div className="h-4 w-14 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </CyberPanel>
  );
}

/* ── Empty State ───────────────────────────────────────────────── */

function EmptyState() {
  return (
    <CyberPanel title="Workspace Comparison" subtitle="Side-by-side overview">
      <div className="px-5 py-16 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
          <FolderKanban className="size-6 text-primary" />
        </div>
        <h3 className="mt-4 text-sm font-bold text-text-primary font-mono uppercase tracking-wider">
          No workspaces yet
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
    </CyberPanel>
  );
}

/* ── Main Export ───────────────────────────────────────────────── */

export function WorkspaceComparison({
  workspaces,
  loading,
}: WorkspaceComparisonProps) {
  if (loading) {
    return <SkeletonLoader />;
  }

  if (workspaces.length === 0) {
    return <EmptyState />;
  }

  return (
    <CyberPanel title="Workspace Comparison" subtitle="Side-by-side overview">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.04]">
              <th className="px-5 py-3 text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted font-bold">
                Workspace
              </th>
              <th className="px-5 py-3 text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted font-bold text-right">
                Members
              </th>
              <th className="px-5 py-3 text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted font-bold text-right">
                Projects
              </th>
              <th className="px-5 py-3 text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted font-bold text-right">
                Created
              </th>
              <th className="px-5 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {workspaces.map((workspace, idx) => (
              <tr
                key={workspace.id}
                className={cn(
                  "transition-colors duration-150 hover:bg-primary/5",
                  idx % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"
                )}
              >
                <td className="px-5 py-3.5">
                  <Link
                    href={`/dashboard/workspaces/${workspace.id}`}
                    className="text-[13px] font-mono font-medium text-text-primary hover:text-primary transition-colors"
                  >
                    {workspace.name}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted">
                    <Users className="size-3 text-text-muted/60" />
                    {workspace._count.members}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted">
                    <FolderKanban className="size-3 text-text-muted/60" />
                    {workspace._count.projects}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    {new Date(workspace.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/dashboard/workspaces/${workspace.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    View
                    <ArrowRight className="size-3 transition-transform hover:translate-x-0.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CyberPanel>
  );
}
