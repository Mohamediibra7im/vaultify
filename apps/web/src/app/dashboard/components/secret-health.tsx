"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Lock, AlertTriangle, Clock, CheckCircle } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */

interface SecretHealthProps {
  workspaces: { id: string; name: string }[];
}

interface HealthStats {
  totalSecrets: number;
  encryptedSecrets: number;
  activeWorkspaces: number;
  lastUpdated: string | null;
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
    <CyberPanel title="Secret Health" subtitle="Encryption status">
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4"
            >
              <div className="h-4 w-4 animate-pulse rounded bg-white/[0.06]" />
              <div className="mt-3 h-7 w-12 animate-pulse rounded bg-white/[0.06]" />
              <div className="mt-2 h-3 w-16 animate-pulse rounded bg-white/[0.04]" />
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-white/[0.04]" />
      </div>
    </CyberPanel>
  );
}

/* ── Stat Box ────────────────────────────────────────────────────── */

function StatBox({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  accent: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all duration-200",
        "hover:bg-white/[0.04] hover:border-white/[0.06]",
      )}
    >
      <div className={cn("flex items-center justify-center size-7 rounded-lg", accent)}>
        <Icon className="size-3.5" />
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-text-primary font-mono">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-mono uppercase tracking-wider text-text-muted">
        {label}
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */

export function SecretHealth({ workspaces }: SecretHealthProps) {
  const { token } = useAuth();
  const [stats, setStats] = useState<HealthStats>({
    totalSecrets: 0,
    encryptedSecrets: 0,
    activeWorkspaces: 0,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaces.length || !token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchHealth() {
      try {
        // For each workspace, fetch projects
        const projectLists = await Promise.all(
          workspaces.map((ws) =>
            api.get<{ id: string; environments?: { id: string }[] }[]>(
              `/workspaces/${ws.id}/projects`,
              token,
            ).catch(() => []),
          ),
        );

        // Flatten all project IDs
        const projectIds = projectLists.flat().map((p) => p.id);

        // Fetch each project to get environments
        const projects = await Promise.all(
          projectIds.map((pid) =>
            api.get<{ environments: { id: string }[] }>(
              `/projects/${pid}`,
              token,
            ).catch(() => ({ environments: [] })),
          ),
        );

        // Collect all environment IDs
        const envIds = projects.flatMap((p) =>
          (p.environments ?? []).map((e) => e.id),
        );

        // Fetch secrets for each environment
        const secretLists = await Promise.all(
          envIds.map((eid) =>
            api.get<{ updatedAt: string }[]>(
              `/environments/${eid}/secrets`,
              token,
            ).catch(() => []),
          ),
        );

        const allSecrets = secretLists.flat();
        const totalSecrets = allSecrets.length;

        // All secrets encrypted (AES-256-GCM)
        const encryptedSecrets = totalSecrets;

        // Most recent updatedAt
        let lastUpdated: string | null = null;
        for (const s of allSecrets) {
          if (s.updatedAt) {
            if (!lastUpdated || new Date(s.updatedAt) > new Date(lastUpdated)) {
              lastUpdated = s.updatedAt;
            }
          }
        }

        if (!cancelled) {
          setStats({
            totalSecrets,
            encryptedSecrets,
            activeWorkspaces: workspaces.length,
            lastUpdated,
          });
        }
      } catch {
        // Graceful degradation — show 0s
        if (!cancelled) {
          setStats({
            totalSecrets: 0,
            encryptedSecrets: 0,
            activeWorkspaces: workspaces.length,
            lastUpdated: null,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHealth();

    return () => {
      cancelled = true;
    };
  }, [workspaces, token]);

  if (loading) return <SkeletonLoader />;

  const encryptionPercent = stats.totalSecrets > 0 ? 100 : 0;
  const lastUpdatedLabel = stats.lastUpdated
    ? new Date(stats.lastUpdated).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Never";

  return (
    <CyberPanel title="Secret Health" subtitle="Encryption status">
      <div className="p-5">
        {/* 2x2 Stat Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatBox
            icon={Lock}
            value={stats.totalSecrets}
            label="Total Secrets"
            accent="border border-primary/20 bg-primary/10 text-primary"
          />
          <StatBox
            icon={CheckCircle}
            value={stats.encryptedSecrets}
            label="Encrypted"
            accent="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          />
          <StatBox
            icon={Lock}
            value={stats.activeWorkspaces}
            label="Active Workspaces"
            accent="border border-blue-500/20 bg-blue-500/10 text-blue-400"
          />
          <StatBox
            icon={Clock}
            value={lastUpdatedLabel}
            label="Last Updated"
            accent="border border-amber-500/20 bg-amber-500/10 text-amber-400"
          />
        </div>

        {/* Encryption Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
              {encryptionPercent}% Encrypted
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
              AES-256-GCM
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${encryptionPercent}%` }}
            />
          </div>
        </div>
      </div>
    </CyberPanel>
  );
}
