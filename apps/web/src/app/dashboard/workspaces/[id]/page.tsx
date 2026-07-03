"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { getSocket, useWorkspaceSubscription } from "@/lib/websocket";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FolderKanban,
  Plus,
  Trash2,
  Loader2,
  Link2,
  Copy,
  XCircle,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface WorkspaceDetail {
  id: string;
  name: string;
  createdAt: string;
  ownerId: string;
  members: Array<{
    id: string;
    role: string;
    joinedAt: string;
    user: { id: string; name: string; email: string; avatarUrl: string | null };
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
  }>;
}

interface InviteLinkEntry {
  id: string;
  url?: string;
  active: boolean;
  role?: string;
  expiresAt?: string | null;
  usesCount?: number;
  maxUses?: number | null;
  email?: string | null;
  createdAt: string;
}

interface ApiTokenEntry {
  id: string;
  workspaceId: string;
  name: string;
  tokenPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
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
  actor: {
    id: string;
    name: string;
    email: string;
  };
}

export default function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [ws, setWs] = useState<WorkspaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Invite links state
  const [inviteLinks, setInviteLinks] = useState<InviteLinkEntry[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [revokingInvite, setRevokingInvite] = useState<string | null>(null);
  const [latestInviteUrl, setLatestInviteUrl] = useState<string | null>(null);

  // Audit log state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditFetched, setAuditFetched] = useState(false);

  // API token state
  const [apiTokens, setApiTokens] = useState<ApiTokenEntry[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [tokensFetched, setTokensFetched] = useState(false);
  const [creatingToken, setCreatingToken] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [showCreateToken, setShowCreateToken] = useState(false);
  const [createdTokenRaw, setCreatedTokenRaw] = useState<string | null>(null);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "tokens">("overview");

  // Confirm dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState(false);
  const [removeMemberDialog, setRemoveMemberDialog] = useState<{ open: boolean; memberId: string | null; memberName: string }>({ open: false, memberId: null, memberName: "" });
  const [removingMember, setRemovingMember] = useState(false);

  useEffect(() => {
    params.then((p) => setWorkspaceId(p.id));
  }, [params]);

  useWorkspaceSubscription(workspaceId ?? undefined);

  useEffect(() => {
    if (!token || !workspaceId) return;

    api
      .get<WorkspaceDetail>(`/workspaces/${workspaceId}`, token)
      .then(setWs)
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load workspace");
        router.push("/dashboard/workspaces");
      })
      .finally(() => setLoading(false));

    const socket = getSocket();
    if (socket) {
      const refresh = () => {
        api.get<WorkspaceDetail>(`/workspaces/${workspaceId}`, token)
          .then(setWs)
          .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to refresh workspace"));
      };
      socket.on('workspace:changed', refresh);
      socket.on('project:changed', refresh);
      socket.on('project:deleted', refresh);
      socket.on('member:changed', refresh);
      socket.on('member:removed', refresh);
      socket.on('audit:new', refresh);
      return () => {
        socket.off('workspace:changed', refresh);
        socket.off('project:changed', refresh);
        socket.off('project:deleted', refresh);
        socket.off('member:changed', refresh);
        socket.off('member:removed', refresh);
        socket.off('audit:new', refresh);
      };
    }
  }, [token, workspaceId, router]);

  const fetchInviteLinks = useCallback(async () => {
    if (!token || !workspaceId) return;
    setLoadingInvites(true);
    try {
      const links = await api.get<InviteLinkEntry[]>(
        `/workspaces/${workspaceId}/invite-links`,
        token,
      );
      setInviteLinks(Array.isArray(links) ? links : []);
    } catch {
      // Non-owner requests fail silently
    } finally {
      setLoadingInvites(false);
    }
  }, [token, workspaceId]);

  // Fetch invite links once workspace is loaded (owner only)
  useEffect(() => {
    if (ws && user && user.id === ws.ownerId && token) {
      fetchInviteLinks();
    }
  }, [ws, ws?.id, user, token, fetchInviteLinks]);

  async function handleGenerateInvite() {
    if (!token || !workspaceId) return;
    setGeneratingInvite(true);
    setLatestInviteUrl(null);
    try {
      const res = await api.post<{ url: string }>(
        `/workspaces/${workspaceId}/invite-link`,
        {},
        token,
      );
      setLatestInviteUrl(res.url);
      toast.success("Invite link generated");
      await fetchInviteLinks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate invite link");
    } finally {
      setGeneratingInvite(false);
    }
  }

  async function handleRevokeInvite(id: string) {
    if (!token || !workspaceId) return;
    setRevokingInvite(id);
    try {
      await api.post(`/workspaces/${workspaceId}/invite-links/${id}/revoke`, {}, token);
      toast.success("Invite link revoked");
      setInviteLinks((prev) =>
        prev.map((l) => (l.id === id ? { ...l, active: false } : l)),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke link");
    } finally {
      setRevokingInvite(null);
    }
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    if (!token || !workspaceId) return;
    try {
      await api.patch(
        `/workspaces/${workspaceId}/members/${memberId}/role`,
        { role: newRole },
        token,
      );
      setWs((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.map((m) =>
                m.id === memberId ? { ...m, role: newRole } : m,
              ),
            }
          : prev,
      );
      toast.success("Role updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  function handleRemoveMember(memberId: string, memberName: string) {
    setRemoveMemberDialog({ open: true, memberId, memberName });
  }

  async function executeRemoveMember() {
    if (!token || !workspaceId || !removeMemberDialog.memberId) return;
    setRemovingMember(true);
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${removeMemberDialog.memberId}`, token);
      setWs((prev) =>
        prev
          ? { ...prev, members: prev.members.filter((m) => m.id !== removeMemberDialog.memberId) }
          : prev,
      );
      toast.success("Member removed");
      setRemoveMemberDialog({ open: false, memberId: null, memberName: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setRemovingMember(false);
    }
  }

  async function fetchAuditLogs() {
    if (!token || !workspaceId || auditFetched) return;
    setLoadingAudit(true);
    try {
      const logs = await api.get<AuditLogEntry[]>(
        `/workspaces/${workspaceId}/audit-logs`,
        token,
      );
      setAuditLogs(Array.isArray(logs) ? logs : []);
      setAuditFetched(true);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setLoadingAudit(false);
    }
  }

  // API token handlers
  async function fetchApiTokens() {
    if (!token || !workspaceId || tokensFetched) return;
    setLoadingTokens(true);
    try {
      const tokens = await api.get<ApiTokenEntry[]>(
        `/workspaces/${workspaceId}/tokens`,
        token,
      );
      setApiTokens(Array.isArray(tokens) ? tokens : []);
      setTokensFetched(true);
    } catch {
      toast.error("Failed to load API tokens");
    } finally {
      setLoadingTokens(false);
    }
  }

  async function handleCreateToken() {
    if (!token || !workspaceId || !newTokenName.trim()) return;
    setCreatingToken(true);
    setCreatedTokenRaw(null);
    try {
      const result = await api.post<ApiTokenEntry & { rawToken: string }>(
        `/workspaces/${workspaceId}/tokens`,
        { name: newTokenName.trim() },
        token,
      );
      setCreatedTokenRaw(result.rawToken);
      setNewTokenName("");
      setShowCreateToken(false);
      await fetchApiTokens();
      toast.success("API token created — copy it now, it won't be shown again");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create token");
    } finally {
      setCreatingToken(false);
    }
  }

  async function handleRevokeToken(tokenId: string) {
    if (!token || !workspaceId) return;
    setRevokingToken(tokenId);
    try {
      await api.delete(`/workspaces/${workspaceId}/tokens/${tokenId}`, token);
      setApiTokens((prev) =>
        prev.map((t) => (t.id === tokenId ? { ...t, active: false } : t)),
      );
      toast.success("Token revoked");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke token");
    } finally {
      setRevokingToken(null);
    }
  }

  function handleDelete() {
    setDeleteDialogOpen(true);
  }

  async function executeDelete() {
    if (!token || !workspaceId) return;
    setDeletingWorkspace(true);
    try {
      await api.delete(`/workspaces/${workspaceId}`, token);
      toast.success("Workspace deleted");
      router.push("/dashboard/workspaces");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingWorkspace(false);
      setDeleteDialogOpen(false);
    }
  }

  function formatAction(action: string): string {
    const map: Record<string, string> = {
      "workspace.create": "Created workspace",
      "workspace.update": "Updated workspace",
      "workspace.delete": "Deleted workspace",
      "member.add": "Added member",
      "member.remove": "Removed member",
      "member.role": "Changed member role",
      "invite.create": "Created invite link",
      "invite.revoke": "Revoked invite link",
      "secret.create": "Created secret",
      "secret.update": "Updated secret",
      "secret.delete": "Deleted secret",
      "secret.reveal": "Revealed secret",
      "project.create": "Created project",
      "project.update": "Updated project",
      "project.delete": "Deleted project",
      "environment.create": "Created environment",
      "environment.update": "Updated environment",
      "environment.delete": "Deleted environment",
    };
    return (
      map[action] ||
      action.replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    );
  }

  if (loading || !ws || !user) {
    return (
      <div className="flex h-[40vh] items-center justify-center font-mono text-xs text-muted-foreground">
        <span>Retrieving workspace configurations...</span>
      </div>
    );
  }

  const isOwner = user.id === ws.ownerId;

  return (
    <div className="space-y-8 text-left font-mono">
      {/* Back Link */}
      <Link
        href="/dashboard/workspaces"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to workspaces</span>
      </Link>

      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">{ws.name}</h1>
            {isOwner && (
              <span className="text-[7.5px] border border-primary/20 bg-primary/10 text-primary px-1.5 py-0.2 rounded font-bold uppercase">
                Owner
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {ws.members.length} Member{ws.members.length !== 1 ? "s" : ""} &middot; {ws.projects.length} Project{ws.projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] text-destructive border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10 h-8 self-start"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete Workspace
          </Button>
        )}
      </div>

      {/* Invite Links Widget (Owner Only) */}
      {isOwner && (
        <div className="rounded-xl border border-white/5 bg-zinc-950/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">Invite Tokens</h2>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] border-white/10 hover:bg-white/5 gap-1.5"
              onClick={handleGenerateInvite}
              disabled={generatingInvite}
            >
              {generatingInvite ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
              Generate Token
            </Button>
          </div>

          {/* Newly Generated Link Display */}
          {latestInviteUrl && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <Link2 className="h-4 w-4" />
                <span>Save Invitation Link:</span>
              </div>
              <p className="text-[9.5px] text-muted-foreground leading-normal">
                Make sure to copy it now. For security reasons, you won&apos;t be able to retrieve it again after a page refresh.
              </p>
              <div className="flex gap-2">
                <code className="bg-black/50 p-2 rounded border border-white/5 select-all flex-1 text-[10px] text-primary truncate font-mono">
                  {latestInviteUrl}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(latestInviteUrl);
                    toast.success("Copied to clipboard");
                  }}
                  className="p-2 border border-primary/20 bg-zinc-900/50 rounded hover:text-primary transition shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {loadingInvites ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : inviteLinks.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic">No active invite tokens.</p>
          ) : (
            <div className="space-y-2">
              {inviteLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-zinc-950/30 px-3 py-2.5 text-[10px]"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Link2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <div className="flex flex-col gap-0.5 min-w-0 text-left">
                      <span className="font-bold text-zinc-300 truncate">
                        Invite ID: <span className="font-mono text-zinc-500">{link.id.substring(0, 8)}...</span>
                      </span>
                      <span className="text-[8.5px] text-zinc-500 flex items-center gap-1.5 font-mono">
                        <span>Role: {link.role}</span>
                        {link.email && <span>&bull; Recipient: {link.email}</span>}
                        {link.maxUses && <span>&bull; Uses: {link.usesCount}/{link.maxUses}</span>}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={link.active ? "text-primary font-semibold" : "text-zinc-600"}>
                      {link.active ? "Active" : "Revoked"}
                    </span>
                    {link.active && (
                      <button
                        onClick={() => handleRevokeInvite(link.id)}
                        disabled={revokingInvite === link.id}
                        className="p-1 hover:text-destructive transition disabled:opacity-50"
                        title="Revoke Link"
                      >
                        {revokingInvite === link.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 gap-6 text-xs pb-0.5">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-2.5 font-bold uppercase tracking-wider transition ${
            activeTab === "overview" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => {
            setActiveTab("activity");
            fetchAuditLogs();
          }}
          className={`pb-2.5 font-bold uppercase tracking-wider transition ${
            activeTab === "activity" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Audit Stream
        </button>
        <button
          onClick={() => {
            setActiveTab("tokens");
            fetchApiTokens();
          }}
          className={`pb-2.5 font-bold uppercase tracking-wider transition ${
            activeTab === "tokens" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          API Tokens
        </button>
      </div>

      {/* Tab Contents: Overview */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Members Panel */}
          <div className="rounded-xl border border-white/5 bg-zinc-950/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Workspace Members</h2>
              <span className="text-[9px] bg-white/5 rounded px-1.5 py-0.2">{ws.members.length}</span>
            </div>
            <div className="space-y-2">
              {ws.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-zinc-950/30 p-3 text-[10px]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[10px] font-bold text-primary shrink-0">
                      {m.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{m.user.name}</p>
                      <p className="text-[8px] text-muted-foreground truncate">{m.user.email}</p>
                    </div>
                  </div>
                  {m.user.id === ws.ownerId ? (
                    <span className="text-[8px] border border-white/10 bg-white/5 text-muted-foreground px-1.5 py-0.2 rounded uppercase">
                      {m.role}
                    </span>
                  ) : isOwner ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        className="rounded border border-white/10 bg-zinc-900 px-1 py-0.5 text-[9px] outline-none text-zinc-300 focus:border-primary"
                      >
                        <option value="EDITOR">Editor</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                      <button
                        onClick={() => handleRemoveMember(m.id, m.user.name)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        title="Remove member"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[8px] border border-white/10 bg-white/5 text-muted-foreground px-1.5 py-0.2 rounded uppercase">
                      {m.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Projects Panel */}
          <div className="rounded-xl border border-white/5 bg-zinc-950/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Projects</h2>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/workspaces/${workspaceId}/projects/new`}>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-[9px] border-white/10 hover:bg-white/5">
                    <Plus className="h-3 w-3 mr-0.5" /> New
                  </Button>
                </Link>
                <span className="text-[9px] bg-white/5 rounded px-1.5 py-0.2">{ws.projects.length}</span>
              </div>
            </div>

            {ws.projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FolderKanban className="h-8 w-8 text-zinc-600 mb-2" />
                <p className="text-[10px] text-muted-foreground">No projects configured yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {ws.projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/projects/${p.id}`}
                    className="flex items-center gap-3 rounded-lg border border-white/5 bg-zinc-950/30 p-3 hover:border-primary/20 hover:bg-zinc-950/45 transition text-[10px]"
                  >
                    <FolderKanban className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{p.name}</p>
                      {p.description && (
                        <p className="text-[8.5px] text-muted-foreground truncate mt-0.5">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Contents: Activity Audit logs */}
      {activeTab === "activity" && (
        <div className="rounded-xl border border-white/5 bg-zinc-950/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Security Logs</h2>
            {loadingAudit && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
          </div>

          {loadingAudit ? (
            <p className="text-[10px] text-muted-foreground py-4">Querying database journals...</p>
          ) : auditLogs.length === 0 ? (
            <p className="text-[10px] text-muted-foreground py-4 italic">No logs recorded yet.</p>
          ) : (
            <div className="space-y-3 font-mono text-[9px] text-left">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{log.actor.name}</span>
                    <span className="text-[8px] text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-zinc-400">
                    <span className="text-primary font-bold">{formatAction(log.action)}</span>
                    {log.target && (
                      <span className="text-muted-foreground"> &gt; {log.target}</span>
                    )}
                  </div>
                  {log.details && (
                    <code className="block bg-black/50 p-1.5 rounded border border-white/5 text-zinc-500 text-[8px] break-all leading-normal">
                      {log.details}
                    </code>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: API Tokens */}
      {activeTab === "tokens" && (
        <div className="space-y-4">
          {/* Create token form */}
          {showCreateToken && (
            <div className="rounded-xl border border-white/5 bg-zinc-950/20 p-5 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">New API Token</h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="e.g. CI/CD Pipeline"
                  className="flex-1 rounded-lg border border-white/10 bg-zinc-900/50 px-3 py-2 text-[11px] font-mono text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-primary/30"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateToken()}
                />
                <Button
                  size="sm"
                  className="h-8 text-[10px] gap-1"
                  onClick={handleCreateToken}
                  disabled={creatingToken || !newTokenName.trim()}
                >
                  {creatingToken ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-[10px] border-white/10 hover:bg-white/5"
                  onClick={() => { setShowCreateToken(false); setNewTokenName(""); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Created token display */}
          {createdTokenRaw && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Token Created</h2>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Copy this token now — it will <strong className="text-zinc-300">never be shown again</strong>. 
                Store it securely like a password.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 block bg-black/60 border border-primary/20 rounded-lg px-3 py-2.5 text-[11px] font-mono text-primary break-all select-all">
                  {createdTokenRaw}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdTokenRaw);
                    toast.success("Token copied to clipboard");
                  }}
                  className="shrink-0 p-2 rounded-lg border border-primary/20 hover:bg-primary/10 transition text-primary"
                  title="Copy token"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Token list */}
          <div className="rounded-xl border border-white/5 bg-zinc-950/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">API Tokens</h2>
              <div className="flex items-center gap-2">
                {!showCreateToken && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] border-white/10 hover:bg-white/5 gap-1"
                    onClick={() => setShowCreateToken(true)}
                  >
                    <Plus className="h-3 w-3" />
                    New Token
                  </Button>
                )}
                {loadingTokens && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
              </div>
            </div>

            {loadingTokens && apiTokens.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : apiTokens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <KeyRound className="h-8 w-8 text-zinc-600 mb-2" />
                <p className="text-[10px] text-muted-foreground">No API tokens configured for this workspace.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {apiTokens.map((tok) => (
                  <div
                    key={tok.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-zinc-950/30 px-3 py-2.5 text-[10px]"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <KeyRound className={`h-3.5 w-3.5 shrink-0 ${tok.active ? "text-primary" : "text-zinc-600"}`} />
                      <div className="min-w-0">
                        <p className="font-semibold truncate text-zinc-200">{tok.name}</p>
                        <p className="text-[8.5px] text-muted-foreground font-mono">
                          {tok.tokenPrefix}...
                          {tok.lastUsedAt && (
                            <span className="ml-2">
                              Last used: {new Date(tok.lastUsedAt).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        tok.active
                          ? "text-primary border border-primary/20 bg-primary/10"
                          : "text-zinc-600 border border-zinc-800 bg-zinc-900/50"
                      }`}>
                        {tok.active ? "Active" : "Revoked"}
                      </span>
                      {tok.active && (
                        <button
                          onClick={() => handleRevokeToken(tok.id)}
                          disabled={revokingToken === tok.id}
                          className="p-1 hover:text-destructive transition disabled:opacity-50"
                          title="Revoke token"
                        >
                          {revokingToken === tok.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Delete Workspace"
        description={`Permanently delete "${ws.name}" and all its projects, environments, and secrets? This action is irreversible and cannot be recovered.`}
        confirmLabel="Delete Workspace"
        variant="danger"
        loading={deletingWorkspace}
      />

      <ConfirmDialog
        open={removeMemberDialog.open}
        onClose={() => setRemoveMemberDialog({ open: false, memberId: null, memberName: "" })}
        onConfirm={executeRemoveMember}
        title="Remove Member"
        description={`Remove ${removeMemberDialog.memberName || "this member"} from the workspace? They will immediately lose access to all projects and secrets.`}
        confirmLabel="Remove Member"
        variant="warning"
        loading={removingMember}
      />
    </div>
  );
}
