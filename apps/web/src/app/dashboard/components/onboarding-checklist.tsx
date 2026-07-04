"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check, Circle, Plus, Users, Key, Search, FileDown } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */

interface OnboardingChecklistProps {
  workspaceCount: number;
  memberCount: number;
  projectCount: number;
}

interface ChecklistItem {
  label: string;
  completed: boolean;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

/* ── Main Component ──────────────────────────────────────────────── */

export function OnboardingChecklist({
  workspaceCount,
  memberCount,
  projectCount,
}: OnboardingChecklistProps) {
  const items: ChecklistItem[] = [
    {
      label: "Create workspace",
      completed: workspaceCount > 0,
      href: "/dashboard/workspaces/new",
      icon: Plus,
    },
    {
      label: "Add team member",
      completed: memberCount > 1,
      href: "/dashboard/settings/members",
      icon: Users,
    },
    {
      label: "Create project",
      completed: projectCount > 0,
      href: "/dashboard/projects",
      icon: Search,
    },
    {
      label: "Import secrets",
      completed: false,
      href: "/dashboard/projects",
      icon: FileDown,
    },
    {
      label: "Setup CI/CD token",
      completed: false,
      href: "/dashboard/settings",
      icon: Key,
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const total = items.length;
  const progress = total > 0 ? (completedCount / total) * 100 : 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.04] bg-gradient-to-br from-surface-1/95 to-surface-0/98 backdrop-blur-xl transition-all duration-300 hover:border-primary/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
      )}
    >
      {/* Laser Cut Corner Details */}
      <div className="absolute top-0 left-0 size-[4px] border-t border-l border-primary/40 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-0 right-0 size-[4px] border-t border-r border-primary/40 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-0 left-0 size-[4px] border-b border-l border-primary/40 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-0 right-0 size-[4px] border-b border-r border-primary/40 rounded-br-sm pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.03] px-5 py-4 bg-zinc-950/20">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted font-bold block">
            Onboarding progress
          </span>
          <h2 className="mt-0.5 text-[13px] font-bold text-text-primary font-mono uppercase tracking-wider">
            Getting started
          </h2>
        </div>
        <span className="text-[10px] font-mono text-text-muted tabular-nums">
          {completedCount} of {total}
        </span>
      </header>

      {/* Content */}
      <div className="relative z-10 p-5 space-y-5">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.label}>
              {item.completed ? (
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Check className="size-3.5 text-primary" />
                  </div>
                  <span className="text-[12px] font-mono text-primary/80 line-through decoration-primary/30">
                    {item.label}
                  </span>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-white/[0.03]"
                >
                  <Circle className="size-6 shrink-0 text-text-muted/50" />
                  <span className="flex-1 text-[12px] font-mono text-text-muted transition-colors group-hover:text-text-secondary">
                    {item.label}
                  </span>
                  <item.icon className="size-3.5 text-text-muted/40 transition-colors group-hover:text-primary/60" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
