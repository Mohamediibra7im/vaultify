"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Key, ArrowRight, Shield } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */

interface ApiToken {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
}

interface EnrichedToken extends ApiToken {
  workspaceName: string;
}

interface ApiTokenUsageProps {
  workspaces: { id: string; name: string }[];
}

/* ── Helpers ────────────────────────────────────────────────────── */

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

function maskPrefix(prefix: string) {
  if (!prefix) return "vlt_****";
  return `${prefix}_****`;
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
    <CyberPanel title="API TOKENS" subtitle="CI/CD access">
      <div className="p-5">
        {/* Total count skeleton */}
        <div className="mb-5 flex items-center gap-3">
          <div className="size-9 animate-pulse rounded-lg bg-white/[0.06]" />
          <div>
            <div className="h-7 w-10 animate-pulse rounded bg-white/[0.06]" />
            <div className="mt-1 h-3 w-16 animate-pulse rounded bg-white/[0.04]" />
          </div>
        </div>
        {/* Token row skeletons */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-3"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 animate-pulse rounded-lg bg-white/[0.06]" />
                <div>
                  <div className="h-4 w-24 animate-pulse rounded bg-white/[0.06]" />
                  <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-white/[0.04]" />
                </div>
              </div>
              <div className="h-3 w-14 animate-pulse rounded bg-white/[0.04]" />
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
    <CyberPanel title="API TOKENS" subtitle="CI/CD access">
      <div className="px-6 py-12 text-center">
        <Key className="size-8 mx-auto text-text-muted/30 mb-3" />
        <p className="text-[11px] font-mono text-text-muted uppercase tracking-wider mb-4">
          No API tokens
        </p>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-primary transition-all hover:bg-primary/20 hover:border-primary/30"
        >
          Create Token <ArrowRight className="size-3" />
        </Link>
      </div>
    </CyberPanel>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */

export function ApiTokenUsage({ workspaces }: ApiTokenUsageProps) {
  const { token } = useAuth();
  const [tokens, setTokens] = useState<EnrichedToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaces.length || !token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const allTokens: EnrichedToken[] = [];

        const results = await Promise.all(
          workspaces.map((ws) =>
            api
              .get<ApiToken[]>(`/workspaces/${ws.id}/tokens`, token)
              .then((tokens) =>
                tokens.map((t) => ({ ...t, workspaceName: ws.name })),
              )
              .catch(() => [] as EnrichedToken[]),
          ),
        );

        for (const wsTokens of results) {
          allTokens.push(...wsTokens);
        }

        if (cancelled) return;

        // Sort by lastUsedAt desc (tokens with lastUsedAt first, then by date)
        allTokens.sort((a, b) => {
          if (!a.lastUsedAt && !b.lastUsedAt)
            return (
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
            );
          if (!a.lastUsedAt) return 1;
          if (!b.lastUsedAt) return -1;
          return (
            new Date(b.lastUsedAt).getTime() -
            new Date(a.lastUsedAt).getTime()
          );
        });

        setTokens(allTokens);
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
  if (tokens.length === 0) return <EmptyState />;

  const displayTokens = tokens.slice(0, 5);

  return (
    <CyberPanel
      title="API TOKENS"
      subtitle="CI/CD access"
      rightElement={
        <Link
          href="/dashboard/settings"
          className="group inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted hover:text-primary transition-colors"
        >
          Manage Tokens{" "}
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      }
    >
      <div className="p-5">
        {/* Total Count */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Key className="size-4" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-text-primary font-mono">
              {tokens.length}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
              {tokens.length === 1 ? "Token" : "Tokens"} Total
            </div>
          </div>
        </div>

        {/* Token List */}
        <div className="space-y-2">
          {displayTokens.map((t) => (
            <div
              key={t.id}
              className="group flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.06]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-text-muted">
                  <Shield className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                      {t.name}
                    </span>
                    <span className="shrink-0 rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider text-text-muted">
                      {t.workspaceName}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="text-[10px] font-mono text-text-muted/70">
                      {maskPrefix(t.prefix)}
                    </code>
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <time className="text-[10px] font-mono text-text-muted">
                  {t.lastUsedAt ? relativeTime(t.lastUsedAt) : "Never"}
                </time>
              </div>
            </div>
          ))}
        </div>

        {/* Manage Link */}
        <div className="mt-4 border-t border-white/[0.03] pt-3">
          <Link
            href="/dashboard/settings"
            className="group inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted hover:text-primary transition-colors"
          >
            Manage Tokens{" "}
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </CyberPanel>
  );
}
