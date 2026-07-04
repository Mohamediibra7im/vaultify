"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Plus, Search, FileUp, Shield } from "lucide-react";

/* ── Action Definitions ──────────────────────────────────────── */

const actions = [
  {
    label: "Create Workspace",
    href: "/dashboard/workspaces/new",
    icon: Plus,
    color: "text-emerald-400",
    hoverBorder: "hover:border-emerald-500/30",
    hoverGlow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    label: "Search Secrets",
    href: "/dashboard/secrets/search",
    icon: Search,
    color: "text-blue-400",
    hoverBorder: "hover:border-blue-500/30",
    hoverGlow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]",
    iconBg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    label: "Import .env",
    href: "/dashboard/projects",
    icon: FileUp,
    color: "text-amber-400",
    hoverBorder: "hover:border-amber-500/30",
    hoverGlow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]",
    iconBg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    label: "Audit Trail",
    href: "/dashboard/audit",
    icon: Shield,
    color: "text-rose-400",
    hoverBorder: "hover:border-rose-500/30",
    hoverGlow: "hover:shadow-[0_0_20px_rgba(244,63,94,0.1)]",
    iconBg: "bg-rose-500/10 border-rose-500/20",
  },
] as const;

/* ── Main Component ──────────────────────────────────────────── */

export function QuickActions() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-gradient-to-br from-surface-1/95 to-surface-0/98 backdrop-blur-xl transition-all duration-300 hover:border-primary/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      {/* Laser Cut Corner Details */}
      <div className="absolute top-0 left-0 size-[4px] border-t border-l border-primary/40 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-0 right-0 size-[4px] border-t border-r border-primary/40 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-0 left-0 size-[4px] border-b border-l border-primary/40 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-0 right-0 size-[4px] border-b border-r border-primary/40 rounded-br-sm pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.03] px-5 py-4 bg-zinc-950/20">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted font-bold block">
            Shortcuts
          </span>
          <h2 className="mt-0.5 text-[13px] font-bold text-text-primary font-mono uppercase tracking-wider">
            Quick Actions
          </h2>
        </div>
      </header>

      {/* Actions Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
        {actions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div
              className={cn(
                "group flex flex-col items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4",
                "transition-all duration-300",
                "hover:border-white/[0.12] hover:bg-white/[0.04]",
                action.hoverBorder,
                action.hoverGlow,
                "active:scale-[0.97]"
              )}
            >
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg border transition-colors duration-300",
                  action.iconBg
                )}
              >
                <action.icon
                  className={cn("size-5 transition-transform duration-300 group-hover:scale-110", action.color)}
                />
              </div>
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-text-muted text-center transition-colors duration-300 group-hover:text-text-secondary">
                {action.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
