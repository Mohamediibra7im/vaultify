"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { GitCompare, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */

interface Project {
  id: string;
  name: string;
  workspaceId: string;
  environments: { id: string; name: string }[];
}

interface EnvDiffPreviewProps {
  workspaces: { id: string; name: string }[];
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

/* ── Environment Badge Color Map ────────────────────────────────── */

function envBadgeColor(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("prod")) return "border-red-500/20 bg-red-500/10 text-red-400";
  if (lower.includes("staging") || lower.includes("stage"))
    return "border-amber-500/20 bg-amber-500/10 text-amber-400";
  if (lower.includes("dev")) return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  return "border-blue-500/20 bg-blue-500/10 text-blue-400";
}

/* ── Skeleton Loader ─────────────────────────────────────────────── */

function SkeletonLoader() {
  return (
    <CyberPanel title="ENVIRONMENT DRIFT" subtitle="Configuration sync">
      <div className="divide-y divide-white/[0.03]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
            <div className="h-4 w-28 rounded bg-white/[0.06]" />
            <div className="flex gap-2">
              <div className="h-5 w-12 rounded-full bg-white/[0.04]" />
              <div className="h-5 w-14 rounded-full bg-white/[0.04]" />
            </div>
            <div className="ml-auto h-4 w-16 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </CyberPanel>
  );
}

/* ── Empty State ───────────────────────────────────────────────── */

function EmptyState() {
  return (
    <CyberPanel title="ENVIRONMENT DRIFT" subtitle="Configuration sync">
      <div className="px-5 py-16 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
          <GitCompare className="size-6 text-primary" />
        </div>
        <h3 className="mt-4 text-sm font-bold text-text-primary font-mono uppercase tracking-wider">
          No projects found
        </h3>
        <p className="mt-2 text-xs text-text-muted max-w-xs mx-auto">
          Create projects with multiple environments to start comparing configuration drift.
        </p>
        <Link
          href="/dashboard/projects/new"
          className={cn(
            "mt-6 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2",
            "text-[11px] font-mono font-medium uppercase tracking-wider text-primary",
            "transition-all duration-200 hover:bg-primary/20 hover:border-primary/40",
          )}
        >
          Create Project
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </CyberPanel>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */

export function EnvDiffPreview({ workspaces }: EnvDiffPreviewProps) {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaces.length || !token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProjects() {
      try {
        // For each workspace, fetch projects (with environments embedded)
        const projectLists = await Promise.all(
          workspaces.map((ws) =>
            api
              .get<{ id: string; name: string; environments: { id: string; name: string }[] }[]>(
                `/workspaces/${ws.id}/projects`,
                token,
              )
              .catch(() => []),
          ),
        );

        const allProjects = projectLists.flat();

        // Fetch full project details to get environments
        const detailed = await Promise.all(
          allProjects.map((p) =>
            api
              .get<{ id: string; name: string; workspaceId: string; environments: { id: string; name: string }[] }>(
                `/projects/${p.id}`,
                token,
              )
              .catch(() => null),
          ),
        );

        if (!cancelled) {
          setProjects(detailed.filter(Boolean) as Project[]);
        }
      } catch {
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProjects();

    return () => {
      cancelled = true;
    };
  }, [workspaces, token]);

  if (loading) return <SkeletonLoader />;

  const visibleProjects = projects.slice(0, 5);
  const multiEnvProjects = visibleProjects.filter((p) => p.environments.length >= 2);

  if (visibleProjects.length === 0) return <EmptyState />;

  return (
    <CyberPanel title="ENVIRONMENT DRIFT" subtitle="Configuration sync">
      <div className="divide-y divide-white/[0.03]">
        {visibleProjects.map((project) => {
          const hasMultipleEnvs = project.environments.length >= 2;
          const diffPageUrl = `/dashboard/projects/${project.id}/diff`;

          return (
            <div
              key={project.id}
              className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-white/[0.02]"
            >
              {/* Project Name */}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="text-[13px] font-mono font-medium text-text-primary hover:text-primary transition-colors truncate block"
                >
                  {project.name}
                </Link>

                {/* Environment Badges */}
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {project.environments.map((env) => (
                    <span
                      key={env.id}
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider",
                        envBadgeColor(env.name),
                      )}
                    >
                      {env.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 shrink-0">
                {hasMultipleEnvs ? (
                  <>
                    <AlertTriangle className="size-3.5 text-amber-400" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                      Check needed
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-3.5 text-emerald-400" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                      Synced
                    </span>
                  </>
                )}
              </div>

              {/* Compare Link */}
              {hasMultipleEnvs && (
                <Link
                  href={diffPageUrl}
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-primary transition-colors hover:text-primary/80 shrink-0"
                >
                  Compare
                  <ArrowRight className="size-3 transition-transform hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="flex items-center justify-between border-t border-white/[0.03] px-5 py-3 bg-zinc-950/20">
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted">
          {multiEnvProjects.length} project{multiEnvProjects.length !== 1 ? "s" : ""} with drift
          check available
        </span>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-primary transition-colors hover:text-primary/80"
        >
          View all
          <ArrowRight className="size-2.5" />
        </Link>
      </div>
    </CyberPanel>
  );
}
