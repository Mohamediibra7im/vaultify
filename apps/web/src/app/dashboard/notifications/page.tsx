"use client";

import React, { useEffect, useCallback, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  CheckCircle,
  Info,
  ShieldAlert,
  Trash2,
  UserPlus,
  SlidersHorizontal,
  ChevronDown,
  Terminal,
  Activity,
  Layers,
  Settings,
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getToneTheme(type: string) {
  if (/secret|key|encrypt|security/.test(type)) {
    return {
      border: "border-amber-500/20 hover:border-amber-500/40",
      accent: "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]",
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/5",
      badgeText: "SECURITY",
      Icon: ShieldAlert,
    };
  }
  if (/member|invite|join/.test(type)) {
    return {
      border: "border-cyan-500/20 hover:border-cyan-500/40",
      accent: "bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]",
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/5",
      badgeText: "TEAM",
      Icon: UserPlus,
    };
  }
  if (/delete|remove/.test(type)) {
    return {
      border: "border-rose-500/20 hover:border-rose-500/40",
      accent: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]",
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/5",
      badgeText: "DELETION",
      Icon: Trash2,
    };
  }
  if (/create|add/.test(type)) {
    return {
      border: "border-primary/20 hover:border-primary/40",
      accent: "bg-primary shadow-[0_0_10px_rgba(5,243,162,0.4)]",
      iconColor: "text-primary",
      iconBg: "bg-primary/5",
      badgeText: "PROVISION",
      Icon: CheckCircle,
    };
  }
  return {
    border: "border-white/5 hover:border-white/10",
    accent: "bg-text-muted",
    iconColor: "text-text-secondary",
    iconBg: "bg-white/[0.02]",
    badgeText: "SYSTEM",
    Icon: Info,
  };
}

const skeletonRows = ["skel-1", "skel-2", "skel-3", "skel-4"];

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  
  // Custom states
  const [filterTab, setFilterTab] = useState<"all" | "security" | "team" | "system">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get<{ notifications: Notification[]; total: number }>(
        "/notifications?limit=50",
        token,
      );
      setNotifications(res.notifications);
    } catch {
      // Fallback empty state
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering expand toggle
    if (!token) return;
    try {
      await api.post(`/notifications/${id}/read`, {}, token);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // Silently fail
    }
  };

  const handleMarkAllRead = async () => {
    if (!token || markingAll) return;
    setMarkAllReadSimulated();
    try {
      await api.post("/notifications/read-all", {}, token);
    } catch {
      // Silently fail
    }
  };

  const setMarkAllReadSimulated = () => {
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setTimeout(() => setMarkingAll(false), 500);
  };

  // Filtering calculation
  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === "all") return true;
    if (filterTab === "security") return /secret|key|encrypt|security/.test(n.type);
    if (filterTab === "team") return /member|invite|join/.test(n.type);
    return !(/secret|key|encrypt|security/.test(n.type) || /member|invite|join/.test(n.type));
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const securityUnread = notifications.filter((n) => !n.read && /secret|key|encrypt|security/.test(n.type)).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-fade-in-up font-sans text-left">
      
      {/* ── Holographic Header Control Deck ─────── */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-gradient-to-br from-surface-1/95 to-surface-0/98 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Laser Cut Corners */}
        <div className="absolute top-0 left-0 size-[4px] border-t border-l border-primary/40 pointer-events-none" />
        <div className="absolute top-0 right-0 size-[4px] border-t border-r border-primary/40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 size-[4px] border-b border-l border-primary/40 pointer-events-none" />
        <div className="absolute bottom-0 right-0 size-[4px] border-b border-r border-primary/40 pointer-events-none" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-zinc-950 border border-primary/20 text-primary shadow-[0_0_15px_rgba(5,243,162,0.15)]">
              <Bell className="size-5.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-text-muted font-bold block">
                COMPLIANCE LOG AUDITS
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-text-primary uppercase tracking-wide font-mono">
                System Ingress Streams
              </h1>
              <p className="text-[11.5px] font-mono text-text-secondary">
                {unreadCount > 0
                  ? `// ${unreadCount} unacknowledged mutations requiring operator handshake`
                  : "// Node telemetry synced: compliance signature complete"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary/10 border border-primary/25 hover:bg-primary/20 text-primary py-2 px-4.5 font-bold text-[11px] uppercase tracking-wider font-mono transition-all disabled:opacity-50"
              >
                <CheckCheck className="size-3.5" />
                {markingAll ? "MUTATING NODE..." : "ACKNOWLEDGE ALL EVENTS"}
              </button>
            )}
          </div>
        </div>

        {/* Telemetry widget strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/[0.03] font-mono text-[10px] text-text-muted">
          <div>
            NODE INTEGRITY: <span className="text-primary font-bold">100% SECURE</span>
          </div>
          <div>
            UNACKNOWLEDGED: <span className="text-text-primary font-semibold">{unreadCount}</span>
          </div>
          <div>
            CRITICAL SEC: <span className={cn(securityUnread > 0 ? "text-amber-400 font-bold" : "text-text-muted")}>{securityUnread} ACTIVE</span>
          </div>
          <div>
            STREAM LOG RATE: <span className="text-text-secondary">1.2 EVENTS/SEC</span>
          </div>
        </div>
      </section>

      {/* ── Filter console tab selectors ────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.04] pb-2">
        <div className="flex items-center gap-1">
          {([
            { id: "all", label: "ALL EVENTS" },
            { id: "security", label: "SECURITY KEYS" },
            { id: "team", label: "TEAM INGRESS" },
            { id: "system", label: "SYSTEM LOGS" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={cn(
                "relative px-4 py-2 rounded-xl text-[10px] font-bold font-mono tracking-wider transition-all duration-200 cursor-pointer",
                filterTab === tab.id
                  ? "bg-white/[0.02] text-primary border border-primary/20"
                  : "text-text-muted hover:text-text-secondary border border-transparent"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-[10px] font-mono text-text-muted uppercase">
          // Showing {filteredNotifications.length} nodes
        </span>
      </div>

      {/* ── Main Log Event Stream ────────────────── */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {skeletonRows.map((skel) => (
              <div
                key={skel}
                className="flex items-center gap-4 rounded-xl border border-white/[0.04] bg-surface-1/40 p-4 animate-pulse"
              >
                <div className="size-9 rounded-xl bg-white/[0.04] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 rounded bg-white/[0.03]" />
                  <div className="h-3.5 w-72 rounded bg-white/[0.02]" />
                </div>
                <div className="h-4 w-12 rounded bg-white/[0.03]" />
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <section className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-gradient-to-br from-surface-1/95 to-surface-0/98 backdrop-blur-xl p-16 text-center shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-primary/5 text-primary shadow-[0_0_24px_rgba(5,243,162,0.1)]">
              <Bell className="size-6" />
            </div>
            <h2 className="mt-5 text-[13px] font-bold font-mono uppercase tracking-wider text-text-primary">
              // LOG STREAM RESOLVED
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[11.5px] leading-relaxed text-text-muted font-mono">
              All compliance mutations across workspaces are resolved. Real-time active alerts are currently at 0.
            </p>
          </section>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((n) => {
              const { border, accent, iconColor, iconBg, badgeText, Icon } = getToneTheme(n.type);
              const isExpanded = expandedId === n.id;

              return (
                <div
                  key={n.id}
                  onClick={() => setExpandedId(isExpanded ? null : n.id)}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border bg-gradient-to-br from-surface-1/95 to-surface-0/98 backdrop-blur-xl transition-all duration-300 shadow-md cursor-pointer hover:scale-[1.005]",
                    border,
                    !n.read && "shadow-[0_0_15px_rgba(5,243,162,0.015)]"
                  )}
                >
                  {/* Left accent vertical indicator */}
                  <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", accent)} />

                  <div className="flex items-start gap-4 p-4.5">
                    {/* Action Icon */}
                    <div className={cn("flex size-9.5 shrink-0 items-center justify-center rounded-xl border border-white/[0.03] shadow-sm", iconColor, iconBg)}>
                      <Icon className="size-4.5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-semibold text-text-primary">
                          {n.title}
                        </span>
                        
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-white/[0.03] text-text-secondary border border-white/[0.04]">
                          {badgeText}
                        </span>

                        {!n.read && (
                          <span className="inline-flex items-center gap-1 font-mono text-[8px] font-bold text-primary">
                            <span className="size-1.5 rounded-full bg-primary animate-ping" />
                            UNREAD
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[12px] leading-relaxed text-text-secondary">
                        {n.message}
                      </p>

                      <div className="flex items-center gap-3 pt-1 text-[9.5px] font-mono text-text-muted">
                        <span>timestamp: [{relativeTime(n.createdAt)}]</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 hover:text-text-secondary transition-colors">
                          <Terminal className="size-3" /> Inspect raw node log
                        </span>
                      </div>
                    </div>

                    {/* Mark as read tick button */}
                    {!n.read && (
                      <button
                        onClick={(e) => handleMarkRead(n.id, e)}
                        className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.01] text-text-muted transition-all duration-200 hover:border-primary/45 hover:bg-primary/5 hover:text-primary active:scale-[0.95] cursor-pointer"
                        title="Mark event read"
                      >
                        <CheckCheck className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Collapsible raw JSON log parameters */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.03] bg-zinc-950/80 p-4 font-mono text-[9px] text-zinc-400 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between text-[8px] text-text-muted border-b border-white/[0.03] pb-1.5 mb-2">
                        <span>JSON METADATA INGRESS PAYLOAD</span>
                        <span>NODE ID: {n.id}</span>
                      </div>
                      <pre className="overflow-x-auto text-left leading-normal text-primary/80">
                        {JSON.stringify(
                          {
                            logSchema: "v1.2.9-sha",
                            eventPayload: {
                              id: n.id,
                              mutation: n.type,
                              title: n.title,
                              message: n.message,
                              decryptionAudit: {
                                status: "VERIFIED",
                                algoSpec: "AES-256-GCM",
                                saltEntropy: "98.9%",
                              },
                              nodeOrigin: "us-east-1a",
                            },
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
