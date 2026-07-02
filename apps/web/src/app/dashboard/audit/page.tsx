"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ScrollText, Loader2, RefreshCw, Download } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  target: string;
  actorId: string;
  actorName: string;
  details: string | null;
  createdAt: string;
}

type ActionCategory = "secret" | "member" | "invite" | "workspace";

function getActionCategory(action: string): ActionCategory {
  if (action.startsWith("secret.")) return "secret";
  if (action.startsWith("member.")) return "member";
  if (action.startsWith("invite.")) return "invite";
  if (action.startsWith("workspace.")) return "workspace";
  return "secret";
}

function getActionBadge(action: string) {
  const cat = getActionCategory(action);
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border";

  switch (cat) {
    case "secret":
      return `${base} border-blue-500/20 bg-blue-500/10 text-blue-300`;
    case "member":
      return `${base} border-purple-500/20 bg-purple-500/10 text-purple-300`;
    case "invite":
      return `${base} border-amber-500/20 bg-amber-500/10 text-amber-300`;
    case "workspace":
      return `${base} border-emerald-500/20 bg-emerald-500/10 text-emerald-300`;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLogPage() {
  const { token } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loadedWorkspace, setLoadedWorkspace] = useState(false);

  // Fetch workspaces on mount
  useEffect(() => {
    if (!token) return;
    api.get<Workspace[]>("/workspaces", token)
      .then((data) => {
        setWorkspaces(data);
        if (data.length > 0) {
          setSelectedWorkspaceId(data[0].id);
        }
        setLoadedWorkspace(true);
      })
      .catch((err) => {
        console.error("Failed to load workspaces:", err);
        setLoadedWorkspace(true);
      });
  }, [token]);

  // Fetch audit logs when workspace changes
  const fetchLogs = useCallback(() => {
    if (!token || !selectedWorkspaceId) return;
    setLoading(true);
    setError(null);
    api.get<AuditLogEntry[]>(`/workspaces/${selectedWorkspaceId}/audit-logs?limit=50`, token)
      .then(setEntries)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load audit logs"))
      .finally(() => setLoading(false));
  }, [token, selectedWorkspaceId]);

  useEffect(() => {
    if (selectedWorkspaceId) {
      fetchLogs();
    }
  }, [selectedWorkspaceId, fetchLogs]);

  async function handleExportCsv() {
    if (!token || !selectedWorkspaceId) return;
    setExporting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/workspaces/${selectedWorkspaceId}/audit-logs/export`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  if (!token) return null;

  return (
    <div className="space-y-6 text-left font-mono">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <ScrollText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">Audit Log</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable record of every action across your workspace.
          </p>
        </div>
      </motion.div>

      {/* Workspace Selector + Export */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-3"
      >
        <div className="max-w-xs flex-1">
          {workspaces.length > 0 ? (
            <select
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="w-full h-9 bg-zinc-950/40 border border-white/5 hover:border-white/10 rounded-lg px-3 text-xs font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          ) : loadedWorkspace ? (
            <p className="text-[10px] text-muted-foreground italic">No workspaces available.</p>
          ) : (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading workspaces...
            </div>
          )}
        </div>

        {selectedWorkspaceId && entries.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] h-9 border-white/10 hover:bg-white/5 shrink-0"
            onClick={handleExportCsv}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            ) : (
              <Download className="h-3.5 w-3.5 mr-1" />
            )}
            Export CSV
          </Button>
        )}
      </motion.div>

      {/* Audit Log Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-white/5 bg-zinc-950/45 p-6 backdrop-blur-md"
      >
        {/* Column Headers */}
        <div className="grid grid-cols-5 gap-4 pb-3 border-b border-white/5 mb-2">
          <span className="text-[9px] uppercase tracking-widest text-primary font-bold">Action</span>
          <span className="text-[9px] uppercase tracking-widest text-primary font-bold">Target</span>
          <span className="text-[9px] uppercase tracking-widest text-primary font-bold">Actor</span>
          <span className="text-[9px] uppercase tracking-widest text-primary font-bold">Details</span>
          <span className="text-[9px] uppercase tracking-widest text-primary font-bold text-right">Date</span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <p className="text-[11px] text-red-400/80">{error}</p>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-[10px] border-white/10 hover:bg-white/5"
              onClick={fetchLogs}
            >
              <RefreshCw className="h-3 w-3" />
              Try Again
            </Button>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-10 w-10 rounded-full border border-white/5 bg-zinc-900/50 flex items-center justify-center mb-4">
              <ScrollText className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">No audit log entries yet</h3>
            <p className="mt-1 text-[10px] text-muted-foreground max-w-xs leading-relaxed">
              Actions performed in this workspace will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {entries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="grid grid-cols-5 gap-4 py-3 text-[11px] items-center"
              >
                {/* Action */}
                <div>
                  <span className={getActionBadge(entry.action)}>
                    {entry.action}
                  </span>
                </div>

                {/* Target */}
                <div className="truncate text-zinc-300 font-medium">
                  {entry.target}
                </div>

                {/* Actor */}
                <div className="truncate text-zinc-400">
                  {entry.actorName}
                </div>

                {/* Details */}
                <div className="truncate text-zinc-500">
                  {entry.details || "\u2014"}
                </div>

                {/* Date */}
                <div className="text-right text-zinc-500 text-[10px]">
                  {formatDate(entry.createdAt)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
