"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Users,
  Loader2,
  Save,
  Building2,
  Key,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Calendar,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface Workspace {
  id: string;
  name: string;
}

interface ApiToken {
  id: string;
  name: string;
  token?: string;
  createdAt: string;
}

export default function SettingsGeneralPage() {
  const { user, token } = useAuth();

  // Profile
  const [userName, setUserName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Workspace
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [savingWorkspace, setSavingWorkspace] = useState(false);

  // API Tokens
  const [selectedWsId, setSelectedWsId] = useState("");
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [creatingToken, setCreatingToken] = useState(false);
  const [revokingTokenId, setRevokingTokenId] = useState<string | null>(null);
  const [createdTokenVal, setCreatedTokenVal] = useState<string | null>(null);
  const [showSessionToken, setShowSessionToken] = useState(false);

  // Confirm dialog state
  const [revokeTokenDialog, setRevokeTokenDialog] = useState<{ open: boolean; tokenId: string | null; tokenName: string }>({ open: false, tokenId: null, tokenName: "" });

  // Fetch /auth/me on mount
  useEffect(() => {
    if (!token) return;
    setLoadingProfile(true);
    api
      .get<{ id: string; email: string; name: string }>("/auth/me", token)
      .then((data) => {
        setUserName(data.name);
      })
      .catch((err) =>
        toast.error(
          err instanceof Error ? err.message : "Failed to load profile"
        )
      )
      .finally(() => setLoadingProfile(false));
  }, [token]);

  // Fetch workspaces
  useEffect(() => {
    if (!token) return;
    api
      .get<Workspace[]>("/workspaces", token)
      .then((data) => {
        setWorkspaces(data);
        if (data.length > 0) {
          setWorkspaceName(data[0].name);
          setSelectedWsId(data[0].id);
        }
      })
      .catch((err) =>
        toast.error(
          err instanceof Error ? err.message : "Failed to load workspaces"
        )
      );
  }, [token]);

  // Fetch tokens for selected workspace
  useEffect(() => {
    if (!token || !selectedWsId) return;
    setLoadingTokens(true);
    setCreatedTokenVal(null);
    api.get<ApiToken[]>(`/workspaces/${selectedWsId}/tokens`, token)
      .then(setTokens)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load tokens"))
      .finally(() => setLoadingTokens(false));
  }, [token, selectedWsId]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!userName.trim() || !token) return;
    setSavingProfile(true);
    try {
      await api.patch("/auth/me", { name: userName.trim() }, token);
      toast.success("Profile name updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceName.trim() || !token || workspaces.length === 0) return;
    const ws = workspaces[0];
    setSavingWorkspace(true);
    try {
      await api.patch(`/workspaces/${ws.id}`, { name: workspaceName.trim() }, token);
      toast.success("Workspace name updated");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update workspace"
      );
    } finally {
      setSavingWorkspace(false);
    }
  }

  async function handleCreateToken(e: React.FormEvent) {
    e.preventDefault();
    if (!newTokenName.trim() || !token || !selectedWsId) return;
    setCreatingToken(true);
    setCreatedTokenVal(null);
    try {
      const res = await api.post<ApiToken>(
        `/workspaces/${selectedWsId}/tokens`,
        { name: newTokenName.trim() },
        token
      );
      setTokens((prev) => [...prev, res]);
      if (res.token) setCreatedTokenVal(res.token);
      setNewTokenName("");
      toast.success("API access token generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate token");
    } finally {
      setCreatingToken(false);
    }
  }

  function handleRevokeToken(tokenId: string, tokenName: string) {
    setRevokeTokenDialog({ open: true, tokenId, tokenName });
  }

  async function executeRevokeToken() {
    if (!token || !selectedWsId || !revokeTokenDialog.tokenId) return;
    setRevokingTokenId(revokeTokenDialog.tokenId);
    try {
      await api.delete(`/workspaces/${selectedWsId}/tokens/${revokeTokenDialog.tokenId}`, token);
      setTokens((prev) => prev.filter((t) => t.id !== revokeTokenDialog.tokenId));
      toast.success("API token revoked");
      setRevokeTokenDialog({ open: false, tokenId: null, tokenName: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke token");
    } finally {
      setRevokingTokenId(null);
    }
  }

  async function copyToClipboard(val: string) {
    try {
      await navigator.clipboard.writeText(val);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }

  if (!user || !token) return null;

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
          Manage your account, workspace, and billing preferences.
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex gap-2 border-b border-white/5 pb-2 mb-6"
      >
        <Link
          href="/dashboard/settings"
          className="rounded-lg border bg-primary/10 text-primary border-primary/30 px-4 py-2 text-xs font-medium transition-colors"
        >
          <Settings className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
          General
        </Link>
        <Link
          href="/dashboard/settings/members"
          className="rounded-lg border border-white/5 text-muted-foreground px-4 py-2 text-xs font-medium transition-colors hover:text-foreground hover:border-white/10"
        >
          <Users className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
          Members
        </Link>
      </motion.div>

      {loadingProfile ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-2xl border border-white/5 bg-zinc-950/45 p-6 backdrop-blur-md space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Profile Information
                </h2>
                <p className="text-[10px] text-muted-foreground">
                  Update your display name and identifiers.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-[9px] uppercase tracking-wider text-muted-foreground/80"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  disabled={savingProfile}
                  className="h-9 bg-zinc-950/40 border-white/5 hover:border-white/10 focus-visible:ring-primary/20 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase tracking-wider text-muted-foreground/80">
                  Email Address
                </Label>
                <Input
                  value={user.email}
                  disabled
                  className="h-9 bg-zinc-900/30 border-white/5 text-muted-foreground/60 text-xs font-mono cursor-not-allowed"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={
                  savingProfile ||
                  userName.trim() === user.name ||
                  !userName.trim()
                }
                className="h-8 text-[10px] w-full gap-1.5"
              >
                {savingProfile ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Profile Changes
              </Button>
            </form>
          </motion.div>

          {/* Workspace Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="rounded-2xl border border-white/5 bg-zinc-950/45 p-6 backdrop-blur-md space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Workspace Settings
                </h2>
                <p className="text-[10px] text-muted-foreground">
                  Rename your primary workspace.
                </p>
              </div>
            </div>

            {workspaces.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No workspaces found.
              </p>
            ) : (
              <form onSubmit={handleSaveWorkspace} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="wsName"
                    className="text-[9px] uppercase tracking-wider text-muted-foreground/80"
                  >
                    Workspace Name
                  </Label>
                  <Input
                    id="wsName"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    disabled={savingWorkspace}
                    className="h-9 bg-zinc-950/40 border-white/5 hover:border-white/10 focus-visible:ring-primary/20 text-xs font-mono"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    savingWorkspace ||
                    workspaceName.trim() === workspaces[0]?.name ||
                    !workspaceName.trim()
                  }
                  className="h-8 text-[10px] w-full gap-1.5"
                >
                  {savingWorkspace ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Update Workspace Name
                </Button>
              </form>
            )}
          </motion.div>
        </div>

        {/* Session Token + API Tokens row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid gap-6 md:grid-cols-2 mt-6"
        >
          {/* Session Token Card */}
          <div className="rounded-2xl border border-white/5 bg-zinc-950/45 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Active Session Token (JWT)</h2>
                <p className="text-[10px] text-muted-foreground">Your current authentication token for API access.</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                type={showSessionToken ? "text" : "password"}
                value={token}
                readOnly
                className="h-8 bg-zinc-950/40 border-white/5 text-[9px] font-mono flex-1 select-all"
              />
              <button
                onClick={() => setShowSessionToken(!showSessionToken)}
                className="p-1.5 border border-white/5 bg-zinc-900/30 rounded-lg hover:text-primary transition shrink-0"
                title={showSessionToken ? "Hide token" : "Reveal token"}
              >
                {showSessionToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => copyToClipboard(token)}
                className="p-1.5 border border-white/5 bg-zinc-900/30 rounded-lg hover:text-primary transition shrink-0"
                title="Copy token"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* API Tokens Manager Card */}
          <div className="rounded-2xl border border-white/5 bg-zinc-950/45 p-6 backdrop-blur-md space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">API Access Tokens</h2>
                <p className="text-[10px] text-muted-foreground">Tokens allow automated scripts and pipelines to synchronize vault configs.</p>
              </div>
            </div>

            {/* Select Workspace */}
            {workspaces.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase tracking-wider text-muted-foreground/80">Workspace Scope</Label>
                <select
                  value={selectedWsId}
                  onChange={(e) => setSelectedWsId(e.target.value)}
                  className="w-full h-8 bg-zinc-950/40 border border-white/5 hover:border-white/10 rounded-lg px-3 text-[10px] font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>{ws.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Create Token Form */}
            <form onSubmit={handleCreateToken} className="space-y-3 pt-1 border-t border-white/[0.03]">
              <div className="space-y-1.5">
                <Label htmlFor="tokenName" className="text-[9px] uppercase tracking-wider text-muted-foreground/80">Token Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="tokenName"
                    placeholder="e.g. GitHub Actions CI"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    disabled={creatingToken}
                    className="h-8 bg-zinc-950/40 border-white/5 text-xs font-mono flex-1"
                    required
                  />
                  <Button type="submit" size="sm" disabled={creatingToken || !newTokenName.trim()} className="h-8 text-[10px] shrink-0">
                    {creatingToken ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                    Generate
                  </Button>
                </div>
              </div>
            </form>

            {/* Newly Created Token */}
            {createdTokenVal && (
              <div className="bg-primary/5 border border-primary/25 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <Key className="h-4 w-4" />
                  <span>Save token key:</span>
                </div>
                <p className="text-[9.5px] text-muted-foreground leading-normal">Copy it now. You won't see it again.</p>
                <div className="flex gap-2">
                  <code className="bg-black/50 p-2 rounded border border-white/5 select-all flex-1 text-[10px] text-primary truncate">{createdTokenVal}</code>
                  <button
                    onClick={() => copyToClipboard(createdTokenVal)}
                    className="p-2 border border-primary/20 bg-zinc-900/50 rounded hover:text-primary transition shrink-0"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Token List */}
            <div className="space-y-2">
              <Label className="text-[9px] uppercase tracking-wider text-muted-foreground/80">Active Tokens</Label>
              {loadingTokens ? (
                <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
              ) : tokens.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic">No API tokens for this workspace.</p>
              ) : (
                <div className="space-y-1.5">
                  {tokens.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-4 p-2.5 rounded-lg bg-black/30 border border-white/5 text-[9px]">
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="font-bold text-foreground truncate">{t.name}</p>
                        <p className="text-zinc-500 text-[8px] flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-zinc-600" />
                          Created: {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRevokeToken(t.id, t.name)}
                        disabled={revokingTokenId === t.id}
                        className="text-muted-foreground hover:text-destructive p-1 shrink-0 transition"
                        title="Revoke Token"
                      >
                        {revokingTokenId === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={revokeTokenDialog.open}
          onClose={() => setRevokeTokenDialog({ open: false, tokenId: null, tokenName: "" })}
          onConfirm={executeRevokeToken}
          title="Revoke Access Token"
          description={`Revoke the API access token "${revokeTokenDialog.tokenName}"? Any external build pipelines or CLI scripts using this token will fail immediately.`}
          confirmLabel="Revoke Token"
          variant="danger"
          loading={revokingTokenId === revokeTokenDialog.tokenId}
        />
      </>
    )}
    </div>
  );
}
