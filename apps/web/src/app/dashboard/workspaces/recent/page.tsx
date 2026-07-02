"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { History, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface Workspace {
  id: string;
  name: string;
}

interface AuditLogEntry {
  id: string;
  workspaceId: string;
  actorId: string;
  action: string;
  target: string;
  targetId: string;
  details: string | null;
  createdAt: string;
  actor: { id: string; name: string; email: string };
}

interface AggregatedLog extends AuditLogEntry {
  workspaceName: string;
}

function getActionCategory(action: string): string {
  return action.split(".")[0] || "other";
}

function getBadgeConfig(category: string): { bg: string; text: string; label: string } {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    secret:    { bg: "bg-blue-500/10 border-blue-500/20",    text: "text-blue-400",    label: "Secret" },
    member:    { bg: "bg-purple-500/10 border-purple-500/20", text: "text-purple-400",  label: "Member" },
    invite:    { bg: "bg-amber-500/10 border-amber-500/20",  text: "text-amber-400",   label: "Invite" },
    workspace: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", label: "Workspace" },
  };
  return map[category] ?? { bg: "bg-zinc-500/10 border-zinc-500/20", text: "text-zinc-400", label: category };
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    "workspace.create":    "Created workspace",
    "workspace.update":    "Updated workspace",
    "workspace.delete":    "Deleted workspace",
    "member.add":          "Added member",
    "member.remove":       "Removed member",
    "member.role":         "Changed member role",
    "invite.create":       "Created invite link",
    "invite.revoke":       "Revoked invite link",
    "secret.create":       "Created secret",
    "secret.update":       "Updated secret",
    "secret.delete":       "Deleted secret",
    "secret.reveal":       "Revealed secret",
    "project.create":      "Created project",
    "project.update":      "Updated project",
    "project.delete":      "Deleted project",
    "environment.create":  "Created environment",
    "environment.update":  "Updated environment",
    "environment.delete":  "Deleted environment",
  };
  return map[action] ?? action.replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function RecentActivityPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AggregatedLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function fetchActivity() {
      try {
        const workspaces = await api.get<Workspace[]>("/workspaces", token);

        const promises = workspaces.map((ws) =>
          api
            .get<AuditLogEntry[]>(`/workspaces/${ws.id}/audit-logs?limit=10`, token)
            .then((entries) =>
              (Array.isArray(entries) ? entries : []).map((e) => ({
                ...e,
                workspaceName: ws.name,
              })),
            )
            .catch(() => [] as AggregatedLog[]),
        );

        const results = await Promise.all(promises);
        const flat = results.flat();

        if (!cancelled) {
          flat.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          setLogs(flat);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchActivity();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Group logs by workspace
  const grouped = logs.reduce<Map<string, AggregatedLog[]>>((acc, log) => {
    const existing = acc.get(log.workspaceName) ?? [];
    existing.push(log);
    acc.set(log.workspaceName, existing);
    return acc;
  }, new Map());

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center font-mono text-xs text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
        <span>Fetching audit trail across workspaces...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-mono">
      {/* Title Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Recent Activity
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Latest actions across your workspaces
        </p>
      </div>

      {logs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 bg-zinc-950/20 py-16 text-center"
        >
          <div className="h-10 w-10 rounded-full border border-white/5 bg-zinc-900/50 flex items-center justify-center mb-4">
            <History className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">No recent activity found</h3>
          <p className="mt-1 text-[11px] text-muted-foreground max-w-xs leading-relaxed">
            Audit logs will appear here once actions are performed across your workspaces.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-10">
          {Array.from(grouped.entries()).map(([workspaceName, wsLogs], groupIdx) => (
            <motion.div
              key={workspaceName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: groupIdx * 0.05 }}
            >
              {/* Workspace Section Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[9px] uppercase tracking-widest text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                  {workspaceName}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">
                  {wsLogs.length} event{wsLogs.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Timeline */}
              <div className="relative space-y-2">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/[0.04]" />

                {wsLogs.map((log, idx) => {
                  const category = getActionCategory(log.action);
                  const badge = getBadgeConfig(category);

                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.02 }}
                      className="relative pl-8"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-[7px] top-[7px] h-2 w-2 rounded-full border border-white/10 bg-zinc-800" />

                      {/* Card */}
                      <div className="rounded-2xl border border-white/5 bg-zinc-950/45 p-4 backdrop-blur-md space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`inline-flex items-center text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badge.bg} ${badge.text}`}
                            >
                              {badge.label}
                            </span>
                            <span className="text-[11px] font-semibold text-foreground truncate">
                              {formatAction(log.action)}
                            </span>
                          </div>
                          <span className="shrink-0 text-[9px] text-muted-foreground whitespace-nowrap">
                            {getRelativeTime(log.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="font-medium text-zinc-300">{log.actor.name}</span>
                          {log.target && (
                            <>
                              <span className="text-zinc-600">&rarr;</span>
                              <span className="truncate">{log.target}</span>
                            </>
                          )}
                        </div>

                        {log.details && (
                          <code className="block bg-black/40 border border-white/[0.03] rounded px-2 py-1 text-[9px] text-zinc-500 break-all leading-relaxed mt-1">
                            {log.details}
                          </code>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
