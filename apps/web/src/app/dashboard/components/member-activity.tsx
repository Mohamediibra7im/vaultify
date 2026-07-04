"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Users, ArrowRight } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */

interface AuditEntry {
  id: string;
  action: string;
  target: string;
  actorName: string;
  createdAt: string;
  workspaceName?: string;
}

interface MemberActivityProps {
  workspaces: { id: string; name: string }[];
}

/* ── Helpers ────────────────────────────────────────────────────── */

type ActionTone = "positive" | "warning" | "danger" | "neutral";

function actionTone(action: string): ActionTone {
  const verb = action.split(".")[1] ?? action;
  if (/create|add|join|grant|accept/.test(verb)) return "positive";
  if (/rotate|update|change|revoke/.test(verb)) return "warning";
  if (/delete|remove/.test(verb)) return "danger";
  return "neutral";
}

const toneGlow: Record<ActionTone, string> = {
  positive: "shadow-[0_0_12px_rgba(16,185,129,0.3)] border-primary/40 text-primary bg-primary/5",
  warning: "shadow-[0_0_12px_rgba(245,158,11,0.3)] border-amber-500/40 text-amber-400 bg-amber-500/5",
  danger: "shadow-[0_0_12px_rgba(239,68,68,0.3)] border-rose-500/40 text-rose-400 bg-rose-500/5",
  neutral: "border-white/10 text-text-muted bg-white/[0.02]",
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/* ── CyberPanel (inline — mirrors dashboard/page.tsx) ───────────── */

function CyberPanel({
  children,
  className,
  title,
  subtitle,
  rightElement,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
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
          {rightElement}
        </header>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ── Skeleton Loader ─────────────────────────────────────────────── */

function SkeletonLoader() {
  return (
    <CyberPanel title="MEMBER ACTIVITY" subtitle="Who did what">
      <div className="relative px-6 py-6">
        <div className="absolute top-8 bottom-8 left-[31px] w-[1px] bg-white/[0.04]" />
        <div className="space-y-6">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="relative flex gap-4 items-start animate-pulse">
              <div className="relative z-10 size-3 rounded-full border border-zinc-950 bg-white/[0.05] shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 rounded bg-white/[0.06]" />
                  <div className="h-4 w-16 rounded bg-white/[0.04]" />
                </div>
                <div className="mt-1.5 h-3 w-40 rounded bg-white/[0.03]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </CyberPanel>
  );
}

/* ── Empty State ────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <CyberPanel title="MEMBER ACTIVITY" subtitle="Who did what">
      <div className="px-6 py-12 text-center">
        <Users className="size-8 mx-auto text-text-muted/30 mb-3" />
        <p className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
          No activity recorded across nodes
        </p>
      </div>
    </CyberPanel>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */

export function MemberActivity({ workspaces }: MemberActivityProps) {
  const { token } = useAuth();
  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaces.length || !token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const rows: AuditEntry[] = [];

        for (const ws of workspaces) {
          try {
            const entries = await api.get<AuditEntry[]>(
              `/workspaces/${ws.id}/audit-logs?limit=5`,
              token,
            );
            for (const entry of entries) {
              rows.push({ ...entry, workspaceName: ws.name });
            }
          } catch {
            // Workspace fetch failed — continue with others
          }
        }

        if (cancelled) return;

        const sorted = rows.toSorted(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
        );
        setActivity(sorted.slice(0, 8));
      } catch {
        // Graceful degradation
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [workspaces, token]);

  if (loading) return <SkeletonLoader />;
  if (activity.length === 0) return <EmptyState />;

  return (
    <CyberPanel
      title="MEMBER ACTIVITY"
      subtitle="Who did what"
      rightElement={
        <Link
          href="/dashboard/audit"
          className="group inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted hover:text-primary transition-colors"
        >
          View All <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      }
    >
      <div className="relative px-6 py-6 text-left">
        {/* Symmetrical vertical line */}
        <div className="absolute top-8 bottom-8 left-[31px] w-[1px] bg-white/[0.04]" />

        <div className="space-y-6">
          {activity.map((entry) => {
            const tone = actionTone(entry.action);
            return (
              <div key={entry.id} className="relative flex gap-4 items-start group">
                {/* Event node */}
                <div
                  className={cn(
                    "relative z-10 size-3 rounded-full border border-zinc-950 shrink-0 mt-1 transition-all duration-300",
                    tone === "positive" && "bg-primary shadow-[0_0_10px_var(--primary)]",
                    tone === "warning" && "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
                    tone === "danger" && "bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                    tone === "neutral" && "bg-zinc-500",
                  )}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-text-primary group-hover:text-primary transition-colors">
                        {entry.actorName}
                      </span>
                      <span
                        className={cn(
                          "rounded border px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider",
                          toneGlow[tone],
                        )}
                      >
                        {entry.action.split(".")[1] ?? entry.action}
                      </span>
                      <span className="text-[12px] text-text-secondary">
                        {entry.target}
                      </span>
                    </div>
                    <time className="text-[10px] font-mono text-text-muted">
                      [{relativeTime(entry.createdAt)}]
                    </time>
                  </div>

                  {entry.workspaceName && (
                    <p className="text-[10px] font-mono text-text-muted mt-1">
                      <span className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[8px] uppercase tracking-wider">
                        {entry.workspaceName}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CyberPanel>
  );
}
