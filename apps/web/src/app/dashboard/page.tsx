"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowRight, Plus, Flame } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  _count: { members: number; projects: number };
}

interface AuditEntry {
  id: string;
  action: string;
  target: string;
  actorName: string;
  createdAt: string;
  workspaceName?: string;
}

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

function ScrambledText({ text, speed = 35 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayedText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1/3;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className="font-mono">{displayedText}</span>;
}

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

// ponytail: removed quickLinks — redundant with sidebar nav

/* ── Premium Cyber Glass Panel with Grid Overlay ──────────────── */

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

/* ── Hologram Stats Metric Dials ─────────────────────────────── */

function MetricDial({
  label,
  value,
  detail,
  loading,
}: {
  label: string;
  value: number | string;
  detail: string;
  loading: boolean;
}) {
  // ponytail: removed fake percentage dials — real numbers only
  return (
    <CyberPanel className="group transition-all duration-200 hover:scale-[1.01]">
      <div className="p-5">
        <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-text-muted block">
          {label}
        </span>
        {loading ? (
          <div className="h-9 w-12 animate-pulse rounded-lg bg-white/[0.04] mt-2" />
        ) : (
          <div className="text-3xl font-bold tracking-tight text-foreground font-mono mt-2">
            {value}
          </div>
        )}
        <p className="text-[10px] font-mono text-text-muted mt-2">{detail}</p>
      </div>
    </CyberPanel>
  );
}

// ponytail: removed QuantumKeyRotation and TabbedCommandCenter — fake demos, no API backing

/* ── Symmetrical Multiphase Decryption Log Timeline ───────────── */

function MultiphaseTimeline({ activity, loading }: { activity: AuditEntry[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-4 px-6 py-6">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="flex gap-4 items-start animate-pulse">
            <div className="size-2.5 rounded-full bg-white/[0.05] mt-1" />
            <div className="h-4 flex-1 rounded bg-white/[0.02]" />
          </div>
        ))}
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-[11px] font-mono text-text-muted uppercase">
        {/* No secure logs generated on node */}
      </div>
    );
  }

  return (
    <div className="relative px-6 py-6 text-left">
      {/* Symmetrical vertical line */}
      <div className="absolute top-8 bottom-8 left-[31px] w-[1px] bg-white/[0.04]" />

      <div className="space-y-6">
        {activity.map((entry) => {
          const tone = actionTone(entry.action);
          return (
            <div key={entry.id} className="relative flex gap-4 items-start group">
              {/* Event node */}
              <div className={cn(
                "relative z-10 size-3 rounded-full border border-zinc-950 shrink-0 mt-1 transition-all duration-300",
                tone === "positive" && "bg-primary shadow-[0_0_10px_var(--primary)]",
                tone === "warning" && "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
                tone === "danger" && "bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                tone === "neutral" && "bg-zinc-500"
              )} />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-text-primary group-hover:text-primary transition-colors">
                      {entry.target}
                    </span>
                    <span className={cn(
                      "rounded border px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider",
                      toneGlow[tone]
                    )}>
                      {entry.action.split(".")[1] ?? entry.action}
                    </span>
                  </div>
                  <time className="text-[10px] font-mono text-text-muted">
                    [{relativeTime(entry.createdAt)}]
                  </time>
                </div>

                <p className="text-[11px] font-mono text-text-muted mt-1">
                  operator: <span className="text-text-secondary">{entry.actorName}</span>
                  {entry.workspaceName && (
                    <span> · node scope: <span className="text-primary/70">{entry.workspaceName}</span></span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Dashboard Component ────────────────────────────────── */

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const workspaceRows = await api.get<Workspace[]>(
          "/workspaces",
          token,
        );
        if (cancelled) return;

        setWorkspaces(workspaceRows);
        
        // Fetch activity logs for timelines
        const rows: AuditEntry[] = [];
        for (const workspace of workspaceRows.slice(0, 3)) {
          try {
            const entries = await api.get<AuditEntry[]>(
              `/workspaces/${workspace.id}/audit-logs?limit=4`,
              token,
            );
            for (const entry of entries) {
              rows.push({ ...entry, workspaceName: workspace.name });
            }
          } catch {
            // Keep going
          }
        }
        if (cancelled) return;

        const sorted = rows.toSorted(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
        );
        setActivity(sorted.slice(0, 4));
      } catch {
        // Fallbacks
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const stats = useMemo(() => {
    const projects = workspaces.reduce(
      (count, workspace) => count + (workspace._count?.projects ?? 0),
      0,
    );
    const members = workspaces.reduce(
      (count, workspace) => count + (workspace._count?.members ?? 0),
      0,
    );
    return { workspaces: workspaces.length, projects, members };
  }, [workspaces]);

  if (!user) return null;

  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="space-y-6 pb-16 relative z-10">
      
      {/* ── WORKSPACE DASHBOARD Greeting Banner ─────── */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-gradient-to-br from-surface-1/95 to-surface-0/98 backdrop-blur-xl p-6 sm:p-8">
        {/* Laser details */}
        <div className="absolute top-0 left-0 size-[4px] border-t border-l border-primary/50 pointer-events-none" />
        <div className="absolute top-0 right-0 size-[4px] border-t border-r border-primary/50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 size-[4px] border-b border-l border-primary/50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 size-[4px] border-b border-r border-primary/50 pointer-events-none" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-primary">
                <Flame className="size-3 animate-pulse" />
                WORKSPACE DASHBOARD
              </span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl uppercase">
              WELCOME BACK, <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent"><ScrambledText text={firstName} /></span>
            </h1>
            <p className="text-[12.5px] leading-relaxed text-text-secondary font-mono">
              {/* Secure session active. Your synced environment configurations and credentials are live and monitoring. */}
            </p>
          </div>

          <div className="flex flex-row sm:flex-col gap-3 shrink-0">
            <Link
              href="/dashboard/workspaces/new"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-mono text-xs px-5 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all duration-200"
            >
              <Plus className="size-4" />
              CREATE WORKSPACE
            </Link>
          </div>
        </div>
      </section>

      {/* ── Hologram stats gauges ───────────────── */}
      <section className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <MetricDial
          label="Secure Workspaces"
          value={stats.workspaces}
          detail="Isolated workspace contexts for your teams"
          loading={loading}
        />
        <MetricDial
          label="Linked Projects"
          value={stats.projects}
          detail="Connected repositories and platforms"
          loading={loading}
        />
        <MetricDial
          label="Workspace Members"
          value={stats.members}
          detail="Users with access to organization secrets"
          loading={loading}
        />
      </section>

      {/* ── Stats + Audit log deck ── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CyberPanel
            title="Security Audit Log"
            subtitle="Recent activities"
            rightElement={
              <Link
                href="/dashboard/audit"
                className="group inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted hover:text-primary transition-colors"
              >
                Inspect ALL <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          >
            <MultiphaseTimeline activity={activity} loading={loading} />
          </CyberPanel>
        </div>
      </section>
    </div>
  );
}
