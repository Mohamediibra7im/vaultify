"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Users,
  Loader2,
  ChevronDown,
  ChevronRight,
  XCircle,
  Globe,
  Shield,
  Plus,
  Trash2,
  User,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface Workspace {
  id: string;
  name: string;
}

interface Member {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
}

interface MemberEnvOverride {
  id: string;
  memberId: string;
  environmentId: string;
  role: string;
  environment: { id: string; name: string };
}

interface ProjectWithEnvs {
  id: string;
  name: string;
  environments: Array<{ id: string; name: string }>;
}

const ROLE_COLORS: Record<string, string> = {
  OWNER: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  EDITOR: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  VIEWER: "border-gray-500/30 bg-gray-500/10 text-gray-400",
};

const ROLE_OPTIONS = ["OWNER", "EDITOR", "VIEWER"];
const ENV_ROLE_OPTIONS = ["EDITOR", "VIEWER"];

export default function SettingsMembersPage() {
  const { user, token } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWsId, setSelectedWsId] = useState("");
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  // Expanded member for env access
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [memberEnvOverrides, setMemberEnvOverrides] = useState<MemberEnvOverride[]>([]);
  const [loadingEnvOverrides, setLoadingEnvOverrides] = useState(false);

  // All environments in workspace (for granting access)
  const [workspaceEnvs, setWorkspaceEnvs] = useState<Array<{ id: string; name: string; projectName: string }>>([]);
  const [loadingWorkspaceEnvs, setLoadingWorkspaceEnvs] = useState(false);

  // Grant access state
  const [grantEnvId, setGrantEnvId] = useState("");
  const [grantRole, setGrantRole] = useState("VIEWER");
  const [granting, setGranting] = useState(false);

  // Revoking state
  const [revokingEnvId, setRevokingEnvId] = useState<string | null>(null);

  // Remove dialog
  const [removeDialog, setRemoveDialog] = useState<{
    open: boolean;
    memberId: string | null;
    memberName: string;
  }>({ open: false, memberId: null, memberName: "" });
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  // Current user's role in selected workspace
  const [currentUserRole, setCurrentUserRole] = useState("");

  // Fetch workspaces
  useEffect(() => {
    if (!token) return;
    setLoadingWorkspaces(true);
    api
      .get<Workspace[]>("/workspaces", token)
      .then((data) => {
        setWorkspaces(data);
        if (data.length > 0) setSelectedWsId(data[0].id);
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Failed to load workspaces")
      )
      .finally(() => setLoadingWorkspaces(false));
  }, [token]);

  // Fetch members using dedicated endpoint
  const fetchMembers = useCallback(() => {
    if (!token || !selectedWsId) return;
    setLoadingMembers(true);
    api
      .get<any[]>(`/workspaces/${selectedWsId}/members`, token)
      .then((data) => {
        const mapped: Member[] = (data ?? []).map((m: any) => ({
          id: m.id,
          userId: m.user?.id ?? "",
          userName: m.user?.name ?? m.user?.email ?? "Unknown",
          userEmail: m.user?.email ?? "",
          role: m.role,
        }));
        setMembers(mapped);
        const me = mapped.find((m) => m.userId === user?.id);
        setCurrentUserRole(me?.role ?? "");
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Failed to load members")
      )
      .finally(() => setLoadingMembers(false));
  }, [token, selectedWsId, user?.id]);

  useEffect(() => {
    fetchMembers();
    setExpandedMemberId(null);
  }, [fetchMembers]);

  // Fetch all environments in workspace (for grant dropdown)
  const fetchWorkspaceEnvs = useCallback(async () => {
    if (!token || !selectedWsId) return;
    setLoadingWorkspaceEnvs(true);
    try {
      const projects = await api.get<ProjectWithEnvs[]>(
        `/workspaces/${selectedWsId}/projects`,
        token,
      );
      const allEnvs: Array<{ id: string; name: string; projectName: string }> = [];
      for (const p of projects) {
        const detail = await api.get<ProjectWithEnvs>(`/projects/${p.id}`, token);
        for (const env of detail.environments ?? []) {
          allEnvs.push({ id: env.id, name: env.name, projectName: p.name });
        }
      }
      setWorkspaceEnvs(allEnvs);
    } catch {
      // silently fail - non-critical
    } finally {
      setLoadingWorkspaceEnvs(false);
    }
  }, [token, selectedWsId]);

  // Fetch member environment overrides
  async function fetchMemberEnvs(memberId: string) {
    if (!token || !selectedWsId) return;
    setLoadingEnvOverrides(true);
    try {
      const overrides = await api.get<MemberEnvOverride[]>(
        `/workspaces/${selectedWsId}/members/${memberId}/environments`,
        token,
      );
      setMemberEnvOverrides(Array.isArray(overrides) ? overrides : []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load environment access");
      setMemberEnvOverrides([]);
    } finally {
      setLoadingEnvOverrides(false);
    }
  }

  // Toggle expanded member
  async function toggleExpandMember(memberId: string) {
    if (expandedMemberId === memberId) {
      setExpandedMemberId(null);
      return;
    }
    setExpandedMemberId(memberId);
    setGrantEnvId("");
    setGrantRole("VIEWER");
    await Promise.all([fetchMemberEnvs(memberId), fetchWorkspaceEnvs()]);
  }

  // Grant environment access
  async function handleGrantAccess(memberId: string) {
    if (!token || !selectedWsId || !grantEnvId) return;
    setGranting(true);
    try {
      await api.put(
        `/workspaces/${selectedWsId}/members/${memberId}/environments/${grantEnvId}`,
        { role: grantRole },
        token,
      );
      toast.success("Environment access granted");
      setGrantEnvId("");
      await fetchMemberEnvs(memberId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to grant access");
    } finally {
      setGranting(false);
    }
  }

  // Revoke environment access
  async function handleRevokeAccess(memberId: string, environmentId: string) {
    if (!token || !selectedWsId) return;
    setRevokingEnvId(environmentId);
    try {
      await api.delete(
        `/workspaces/${selectedWsId}/members/${memberId}/environments/${environmentId}`,
        token,
      );
      toast.success("Environment access revoked");
      setMemberEnvOverrides((prev) => prev.filter((o) => o.environmentId !== environmentId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke access");
    } finally {
      setRevokingEnvId(null);
    }
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    if (!token || !selectedWsId) return;
    setChangingRole(memberId);
    try {
      await api.patch(
        `/workspaces/${selectedWsId}/members/${memberId}/role`,
        { role: newRole },
        token,
      );
      toast.success("Member role updated");
      fetchMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setChangingRole(null);
    }
  }

  function handleRemoveClick(memberId: string, memberName: string) {
    setRemoveDialog({ open: true, memberId, memberName });
  }

  async function executeRemoveMember() {
    if (!token || !selectedWsId || !removeDialog.memberId) return;
    setRemovingMember(removeDialog.memberId);
    try {
      await api.delete(
        `/workspaces/${selectedWsId}/members/${removeDialog.memberId}`,
        token,
      );
      toast.success("Member removed from workspace");
      setRemoveDialog({ open: false, memberId: null, memberName: "" });
      fetchMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setRemovingMember(null);
    }
  }

  const ownerCount = members.filter((m) => m.role === "OWNER").length;

  if (!user || !token) return null;

  // Filter out environments that already have overrides for the grant dropdown
  const availableEnvsForGrant = workspaceEnvs.filter(
    (env) => !memberEnvOverrides.some((o) => o.environmentId === env.id),
  );

  return (
    <div className="space-y-6 text-left font-mono">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your account, workspace, and security preferences.
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex gap-1 border-b border-white/5 pb-0"
      >
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-1.5 rounded-t-lg border border-b-0 border-white/5 text-muted-foreground px-4 py-2.5 text-xs font-medium transition-colors hover:text-foreground hover:border-white/10"
        >
          <User className="h-3.5 w-3.5" />
          Profile
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-1.5 rounded-t-lg border border-b-0 border-white/5 text-muted-foreground px-4 py-2.5 text-xs font-medium transition-colors hover:text-foreground hover:border-white/10"
        >
          <Building2 className="h-3.5 w-3.5" />
          Workspace
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-1.5 rounded-t-lg border border-b-0 border-white/5 text-muted-foreground px-4 py-2.5 text-xs font-medium transition-colors hover:text-foreground hover:border-white/10"
        >
          <Shield className="h-3.5 w-3.5" />
          Security
        </Link>
        <Link
          href="/dashboard/settings/members"
          className="flex items-center gap-1.5 rounded-t-lg border border-b-0 bg-primary/10 text-primary border-primary/30 px-4 py-2.5 text-xs font-medium transition-colors"
        >
          <Users className="h-3.5 w-3.5" />
          Members
        </Link>
      </motion.div>

      {/* Workspace Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-2xl border border-white/5 bg-zinc-950/45 p-6 backdrop-blur-md space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Workspace Members
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Select a workspace to manage its team members, roles, and environment access.
            </p>
          </div>
        </div>

        {loadingWorkspaces ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        ) : workspaces.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No workspaces available.
          </p>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider text-muted-foreground/80">
              Select Workspace
            </label>
            <select
              value={selectedWsId}
              onChange={(e) => setSelectedWsId(e.target.value)}
              className="w-full h-9 bg-zinc-950/40 border border-white/5 hover:border-white/10 rounded-lg px-3 text-xs font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </motion.div>

      {/* Members List */}
      {selectedWsId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-2xl border border-white/5 bg-zinc-950/45 p-6 backdrop-blur-md space-y-4"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Team Members
            {members.length > 0 && (
              <span className="text-muted-foreground font-normal ml-2">
                ({members.length})
              </span>
            )}
          </h3>

          {loadingMembers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No members found.
            </p>
          ) : (
            <div className="space-y-2">
              {members.map((member, idx) => {
                const initials = (member.userName ?? member.userEmail?.[0] ?? "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                const isSelf = member.userId === user.id;
                const isOnlyOwner = member.role === "OWNER" && ownerCount <= 1;
                const isExpanded = expandedMemberId === member.id;

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="rounded-xl bg-black/30 border border-white/5 overflow-hidden"
                  >
                    {/* Member row */}
                    <div className="flex items-center justify-between gap-4 p-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground truncate">
                              {member.userName}
                            </span>
                            {isSelf && (
                              <span className="text-[8px] text-muted-foreground border border-white/5 rounded px-1.5 py-0.5">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {member.userEmail}
                          </p>
                        </div>

                        <Badge
                          variant="outline"
                          className={`text-[9px] px-2 py-0.5 font-mono font-bold uppercase border ${
                            ROLE_COLORS[member.role] ??
                            "border-gray-500/30 bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {member.role}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Env access toggle */}
                        {currentUserRole === "OWNER" && !isSelf && (
                          <button
                            onClick={() => toggleExpandMember(member.id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-mono transition ${
                              isExpanded
                                ? "text-primary bg-primary/10 border border-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-white/5"
                            }`}
                            title="Manage environment access"
                          >
                            <Shield className="h-3 w-3" />
                            <span className="hidden sm:inline">Env Access</span>
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </button>
                        )}

                        {/* Role Dropdown */}
                        {currentUserRole === "OWNER" && !isOnlyOwner && (
                          <div className="relative">
                            <select
                              value={member.role}
                              onChange={(e) =>
                                handleRoleChange(member.id, e.target.value)
                              }
                              disabled={changingRole === member.id || isSelf}
                              className="h-7 bg-zinc-950/60 border border-white/5 rounded-lg px-2 pr-6 text-[9px] font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="h-3 w-3 text-muted-foreground absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            {changingRole === member.id && (
                              <Loader2 className="h-3 w-3 animate-spin text-primary absolute right-1.5 top-1/2 -translate-y-1/2" />
                            )}
                          </div>
                        )}

                        {/* Remove Button */}
                        {currentUserRole === "OWNER" && !isSelf && (
                          <button
                            onClick={() => handleRemoveClick(member.id, member.userName)}
                            disabled={removingMember === member.id}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition rounded-md hover:bg-destructive/10 disabled:opacity-50"
                            title="Remove member"
                          >
                            {removingMember === member.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded: Environment Access Panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/5 p-4 space-y-4 bg-zinc-950/30">
                            <div className="flex items-center gap-2">
                              <Globe className="h-3.5 w-3.5 text-primary" />
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                                Environment Access Overrides
                              </h4>
                            </div>

                            {loadingEnvOverrides ? (
                              <div className="flex justify-center py-4">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              </div>
                            ) : (
                              <>
                                {/* Current overrides */}
                                {memberEnvOverrides.length === 0 ? (
                                  <p className="text-[10px] text-muted-foreground italic py-2">
                                    No environment-specific access overrides configured. This member uses their workspace-level role for all environments.
                                  </p>
                                ) : (
                                  <div className="space-y-1.5">
                                    {memberEnvOverrides.map((override) => (
                                      <div
                                        key={override.environmentId}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-[10px]"
                                      >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                          <Globe className="h-3 w-3 text-primary/60 shrink-0" />
                                          <span className="font-semibold text-zinc-200 truncate">
                                            {override.environment.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <Badge
                                            variant="outline"
                                            className={`text-[8px] px-1.5 py-0 font-mono font-bold uppercase border ${
                                              ROLE_COLORS[override.role] ?? "border-gray-500/30 bg-gray-500/10 text-gray-400"
                                            }`}
                                          >
                                            {override.role}
                                          </Badge>
                                          <button
                                            onClick={() => handleRevokeAccess(member.id, override.environmentId)}
                                            disabled={revokingEnvId === override.environmentId}
                                            className="p-1 text-muted-foreground hover:text-destructive transition rounded"
                                            title="Revoke access"
                                          >
                                            {revokingEnvId === override.environmentId ? (
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                              <Trash2 className="h-3 w-3" />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Grant access form */}
                                <div className="border-t border-white/[0.03] pt-3 space-y-2">
                                  <label className="text-[9px] uppercase tracking-wider text-muted-foreground/80 font-bold">
                                    Grant Environment Access
                                  </label>
                                  {loadingWorkspaceEnvs ? (
                                    <div className="flex items-center gap-2 py-2">
                                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                      <span className="text-[10px] text-muted-foreground">Loading environments...</span>
                                    </div>
                                  ) : availableEnvsForGrant.length === 0 ? (
                                    <p className="text-[10px] text-muted-foreground italic">
                                      {workspaceEnvs.length === 0
                                        ? "No environments exist in this workspace yet."
                                        : "All environments already have overrides."}
                                    </p>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={grantEnvId}
                                        onChange={(e) => setGrantEnvId(e.target.value)}
                                        className="flex-1 h-8 bg-zinc-950/40 border border-white/5 hover:border-white/10 rounded-lg px-2 text-[10px] font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary/20"
                                      >
                                        <option value="">Select environment...</option>
                                        {availableEnvsForGrant.map((env) => (
                                          <option key={env.id} value={env.id}>
                                            {env.projectName} → {env.name}
                                          </option>
                                        ))}
                                      </select>
                                      <select
                                        value={grantRole}
                                        onChange={(e) => setGrantRole(e.target.value)}
                                        className="h-8 bg-zinc-950/40 border border-white/5 hover:border-white/10 rounded-lg px-2 text-[10px] font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary/20"
                                      >
                                        {ENV_ROLE_OPTIONS.map((r) => (
                                          <option key={r} value={r}>{r}</option>
                                        ))}
                                      </select>
                                      <Button
                                        size="sm"
                                        className="h-8 text-[10px] gap-1 shrink-0"
                                        onClick={() => handleGrantAccess(member.id)}
                                        disabled={granting || !grantEnvId}
                                      >
                                        {granting ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <Plus className="h-3 w-3" />
                                        )}
                                        Grant
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Confirm Remove Dialog */}
      <ConfirmDialog
        open={removeDialog.open}
        onClose={() =>
          setRemoveDialog({ open: false, memberId: null, memberName: "" })
        }
        onConfirm={executeRemoveMember}
        title="Remove Member"
        description={`Remove "${removeDialog.memberName}" from this workspace? They will lose access to all projects and secrets within.`}
        confirmLabel="Remove Member"
        variant="danger"
        loading={removingMember === removeDialog.memberId}
      />
    </div>
  );
}
