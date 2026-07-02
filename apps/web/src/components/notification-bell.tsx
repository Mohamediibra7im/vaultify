"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Info, ShieldAlert, Trash2, UserPlus, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function typeIcon(type: string) {
  if (/secret|key|encrypt/.test(type)) return ShieldAlert;
  if (/member|invite|join/.test(type)) return UserPlus;
  if (/delete|remove/.test(type)) return Trash2;
  if (/create|add/.test(type)) return CheckCircle;
  return Info;
}

function typeTone(type: string) {
  if (/secret|key|encrypt|security/.test(type)) return "text-amber-400";
  if (/member|invite|join/.test(type)) return "text-emerald-400";
  if (/delete|remove/.test(type)) return "text-red-400";
  if (/create|add/.test(type)) return "text-emerald-400";
  return "text-text-secondary";
}

export function NotificationBell() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get<{ count: number }>("/notifications/unread-count", token);
      setUnreadCount(res.count);
    } catch {
      // Silently fail
    }
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get<{ notifications: Notification[]; total: number }>(
        "/notifications?limit=5",
        token
      );
      setNotifications(res.notifications);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleDropdownOpen = (open: boolean) => {
    if (open) {
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const handleMarkRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!token) return;
    try {
      await api.post(`/notifications/${id}/read`, {}, token);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!token) return;
    try {
      await api.post("/notifications/read-all", {}, token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  };

  return (
    <DropdownMenu onOpenChange={handleDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex size-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-text-muted backdrop-blur-xl transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.05] hover:text-text-primary active:scale-[0.97]"
          title="Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold tabular-nums text-surface-0 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 border border-white/[0.08] bg-surface-1/95 p-0 text-text-primary backdrop-blur-xl shadow-2xl"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[13px]">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-accent uppercase tracking-wider">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-accent hover:text-accent/80 transition-colors"
            >
              <CheckCheck className="size-3" />
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-white/[0.06] m-0" />
        
        <div className="max-h-[300px] overflow-y-auto divide-y divide-white/[0.03]">
          {loading ? (
            <div className="p-4 text-center text-[11px] font-mono text-text-muted">
              Loading stream...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-[12px] font-mono text-text-muted">// Zero events recorded</p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = typeIcon(n.type);
              const tone = typeTone(n.type);

              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 p-3 transition-colors hover:bg-white/[0.015]",
                    !n.read && "bg-accent/[0.02]"
                  )}
                >
                  <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.02] text-[12px]", tone)}>
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-semibold text-text-primary truncate">
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="size-1 rounded-full bg-accent shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                      )}
                    </div>
                    <p className="text-[11px] text-text-secondary leading-normal truncate mt-0.5">
                      {n.message}
                    </p>
                    <span className="text-[9px] font-mono text-text-muted mt-1 block">
                      {relativeTime(n.createdAt)}
                    </span>
                  </div>
                  {!n.read && (
                    <button
                      onClick={(e) => handleMarkRead(e, n.id)}
                      className="flex size-5 shrink-0 items-center justify-center rounded border border-white/[0.06] bg-white/[0.02] text-text-muted hover:text-accent hover:border-accent/30 transition-all"
                      title="Mark read"
                    >
                      <CheckCheck className="size-2.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        <DropdownMenuSeparator className="bg-white/[0.06] m-0" />
        
        <div className="p-2 bg-white/[0.01]">
          <Link
            href="/dashboard/notifications"
            className="flex h-8 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-all"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
