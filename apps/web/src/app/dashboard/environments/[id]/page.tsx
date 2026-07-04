"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
// ponytail: no WebSocket on Vercel (serverless) — refetch on tab focus instead
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  Globe,
  Key,
  Pencil,
  Check,
  X,
  Copy,
  Upload,
  Download,
  History,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface Secret {
  id: string;
  key: string;
  version: number;
  updatedAt: string;
  createdAt: string;
}

interface RevealedSecret {
  id: string;
  key: string;
  value: string;
}

interface EnvDetail {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  role: string;
  project: {
    id: string;
    name: string;
    workspaceId: string;
  };
}

function daysAgo(dateStr: string): { days: number; label: string; color: string } {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return { days: 0, label: "today", color: "text-emerald-400" };
  if (days < 30) return { days, label: `${days}d ago`, color: "text-zinc-400" };
  if (days < 60) return { days, label: `${days}d ago`, color: "text-amber-400" };
  if (days < 90) return { days, label: `${days}d ago`, color: "text-orange-400" };
  return { days, label: `${days}d ago`, color: "text-red-400" };
}

export default function EnvironmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [envId, setEnvId] = useState<string | null>(null);
  const [env, setEnv] = useState<EnvDetail | null>(null);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [revealedValues, setRevealedValues] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);

  // Confirm dialog state
  const [deleteSecretDialog, setDeleteSecretDialog] = useState<{ open: boolean; secretId: string | null; secretKey: string }>({ open: false, secretId: null, secretKey: "" });

  // Secret history
  const [historyForSecret, setHistoryForSecret] = useState<string | null>(null);
  const [historyEntries, setHistoryEntries] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [rollingBack, setRollingBack] = useState<string | null>(null);

  // Import/export
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Reference picker state
  const [envList, setEnvList] = useState<{ id: string; name: string }[]>([]);
  const [envSecretKeys, setEnvSecretKeys] = useState<Record<string, { key: string }[]>>({});
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [showRefPicker, setShowRefPicker] = useState<'new' | 'edit' | null>(null);

  async function loadProjectEnvs() {
    if (!token || !env?.project?.id) return;
    setLoadingRefs(true);
    try {
      const environments = await api.get<{ id: string; name: string }[]>(
        `/projects/${env.project.id}/environments`, token,
      );
      setEnvList(environments);
      const keysMap: Record<string, { key: string }[]> = {};
      await Promise.all(environments.map(async (e) => {
        try {
          const secrets = await api.get<{ key: string }[]>(`/environments/${e.id}/secrets`, token);
          keysMap[e.id] = secrets;
        } catch { /* env may have no secrets */ }
      }));
      setEnvSecretKeys(keysMap);
    } catch {
      toast.error("Failed to load project environments");
    } finally {
      setLoadingRefs(false);
    }
  }

  function insertReference(refStr: string) {
    if (showRefPicker === 'new') {
      setNewValue((prev) => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + refStr);
    } else if (showRefPicker === 'edit') {
      setEditValue((prev) => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + refStr);
    }
    setShowRefPicker(null);
  }

  function renderRevealedValue(value: string) {
    const pattern = /\{\{\s*([^}]+)\s*\}\}/g;
    const parts: { text: string; isRef: boolean; refKey?: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(value)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: value.slice(lastIndex, match.index), isRef: false });
      }
      parts.push({ text: match[0], isRef: true, refKey: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < value.length) {
      parts.push({ text: value.slice(lastIndex), isRef: false });
    }
    if (parts.length === 0) return value;
    return parts.map((part, i) =>
      part.isRef ? (
        <span
          key={i}
          onClick={() => navigator.clipboard.writeText(part.text).catch(() => {})}
          title="Click to copy reference"
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[9px] font-mono font-bold cursor-pointer hover:bg-primary/20 transition-colors"
        >
          <span className="text-[7px] opacity-70">↗</span>
          {part.refKey}
        </span>
      ) : (
        <span key={i}>{part.text}</span>
      ),
    );
  }

  useEffect(() => {
    params.then((p) => setEnvId(p.id));
  }, [params]);

  useEffect(() => {
    if (!token || !envId) return;

    const fetchSecrets = () =>
      api.get<Secret[]>(`/environments/${envId}/secrets`, token)
        .then(setSecrets)
        .catch(() => {});

    // initial load
    Promise.all([
      api.get<EnvDetail>(`/environments/${envId}`, token),
      api.get<Secret[]>(`/environments/${envId}/secrets`, token),
    ])
      .then(([envData, secretsData]) => {
        setEnv(envData);
        setSecrets(secretsData);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load environment");
        router.push("/dashboard");
      })
      .finally(() => setLoading(false));

    // ponytail: refetch secrets when user returns to tab (no WebSocket on Vercel)
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchSecrets();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [token, envId, router]);

  async function handleCreateSecret(e: React.FormEvent) {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim() || !token || !envId) return;
    setCreating(true);
    try {
      const secret = await api.post<Secret>(
        `/environments/${envId}/secrets`,
        { key: newKey.trim(), value: newValue.trim() },
        token,
      );
      setSecrets((prev) => [...prev, secret]);
      setNewKey("");
      setNewValue("");
      toast.success("Secret created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create secret");
    } finally {
      setCreating(false);
    }
  }

  function handleDeleteSecret(secretId: string, secretKey: string) {
    setDeleteSecretDialog({ open: true, secretId, secretKey });
  }

  async function executeDeleteSecret() {
    if (!token || !deleteSecretDialog.secretId) return;
    setDeletingId(deleteSecretDialog.secretId);
    try {
      await api.delete(`/secrets/${deleteSecretDialog.secretId}`, token);
      setSecrets((prev) => prev.filter((s) => s.id !== deleteSecretDialog.secretId));
      setRevealedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteSecretDialog.secretId!);
        return next;
      });
      toast.success("Secret deleted");
      setDeleteSecretDialog({ open: false, secretId: null, secretKey: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete secret");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleReveal(secretId: string) {
    if (!token) return;
    if (revealedIds.has(secretId)) {
      setRevealedIds((prev) => {
        const next = new Set(prev);
        next.delete(secretId);
        return next;
      });
      return;
    }
    setRevealingId(secretId);
    try {
      const result = await api.post<RevealedSecret>(
        `/secrets/${secretId}/reveal`,
        {},
        token,
      );
      setRevealedValues((prev) => ({ ...prev, [secretId]: result.value }));
      setRevealedIds((prev) => new Set(prev).add(secretId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reveal secret");
    } finally {
      setRevealingId(null);
    }
  }

  function handleStartEdit(secretId: string, currentValue: string) {
    setEditingId(secretId);
    setEditValue(currentValue);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  async function handleSaveEdit(secretId: string) {
    if (!token || !editValue.trim()) return;
    setSavingEdit(true);
    try {
      await api.patch<Secret>(
        `/secrets/${secretId}`,
        { value: editValue.trim() },
        token,
      );
      setSecrets((prev) =>
        prev.map((s) =>
          s.id === secretId
            ? { ...s, version: s.version + 1, updatedAt: new Date().toISOString() }
            : s,
        ),
      );
      setEditingId(null);
      setEditValue("");
      toast.success("Secret updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update secret");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleCopyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }

  async function handleRotateSecret(secretId: string, secretKey: string) {
    if (!token) return;
    const newValue = prompt(`Enter new value for "${secretKey}":`);
    if (!newValue || !newValue.trim()) return;
    setRotatingId(secretId);
    try {
      await api.post<Secret>(
        `/secrets/${secretId}/rotate`,
        { value: newValue.trim() },
        token,
      );
      setSecrets((prev) =>
        prev.map((s) =>
          s.id === secretId
            ? { ...s, version: s.version + 1, updatedAt: new Date().toISOString() }
            : s,
        ),
      );
      toast.success(`${secretKey} rotated successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rotate secret");
    } finally {
      setRotatingId(null);
    }
  }

  async function handleExport() {
    if (!token || !envId) return;
    setExporting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/environments/${envId}/secrets/export`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Export failed");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${env?.name || "env"}.env`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  async function handleImport() {
    if (!token || !envId || !importText.trim()) return;
    setImporting(true);
    try {
      const result = await api.post<{ imported: number; skipped: number; errors: string[] }>(
        `/environments/${envId}/secrets/import`,
        { text: importText.trim() },
        token,
      );
      toast.success(`Imported ${result.imported} secrets${result.skipped ? ` (${result.skipped} skipped)` : ""}`);
      setShowImport(false);
      setImportText("");
      const secretsData = await api.get<Secret[]>(`/environments/${envId}/secrets`, token);
      setSecrets(secretsData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  async function handleOpenHistory(secretId: string) {
    if (!token) return;
    setHistoryForSecret(secretId);
    setLoadingHistory(true);
    try {
      const entries = await api.get<any[]>(`/secrets/${secretId}/history`, token);
      setHistoryEntries(entries);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleRollback(historyId: string) {
    if (!token || !historyForSecret) return;
    setRollingBack(historyId);
    try {
      await api.post(`/secrets/${historyForSecret}/rollback`, { historyId }, token);
      toast.success("Rolled back successfully");
      setHistoryForSecret(null);
      const secretsData = await api.get<Secret[]>(`/environments/${envId}/secrets`, token);
      setSecrets(secretsData);
    } catch {
      toast.error("Rollback failed");
    } finally {
      setRollingBack(null);
    }
  }

  if (loading || !env || !user) {
    return (
      <div className="flex h-[40vh] items-center justify-center font-mono text-xs text-muted-foreground">
        <span>Loading secrets payload...</span>
      </div>
    );
  }

  const isViewer = env.role === "VIEWER";

  return (
    <div className="space-y-8 text-left font-mono">
      {/* Back Link */}
      <Link
        href={`/dashboard/projects/${env.project.id}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to {env.project.name}</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary shrink-0 animate-pulse" />
            <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">{env.name}</h1>
            <span className="text-[7.5px] border border-white/10 bg-white/5 text-muted-foreground px-1.5 py-0.2 rounded font-bold uppercase">
              {env.role.toLowerCase()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {env.project.name} &middot; {secrets.length} Secret{secrets.length !== 1 ? "s" : ""}
          </p>
        </div>

        {!isViewer && (
          <div className="flex gap-2 self-start">
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] h-8 border-white/10 hover:bg-white/5"
              onClick={() => setShowImport(true)}
            >
              <Upload className="h-3.5 w-3.5 mr-1" /> Import
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] h-8 border-white/10 hover:bg-white/5"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1" />
              )}
              Export
            </Button>
          </div>
        )}
      </div>

      {/* New Secret Panel */}
      {!isViewer ? (
        <div className="rounded-xl border border-white/5 bg-zinc-950/20 p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Add New Secret</h2>
            <span className="text-[7px] font-mono text-primary/70 border border-primary/20 bg-primary/5 px-1.5 py-0.5 rounded-full">
              {'{{'} envName.KEY {'}}'}
            </span>
          </div>
          <form onSubmit={handleCreateSecret} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-1.5">
              <Label className="text-[9px] uppercase text-muted-foreground/80">Key Name</Label>
              <Input
                placeholder="DATABASE_URL"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                disabled={creating}
                className="h-9 bg-zinc-950/40 border-white/5 hover:border-white/10 focus-visible:ring-primary/20 text-xs font-mono"
                required
              />
            </div>
            <div className="flex-[2] min-w-[280px] space-y-1.5">
              <Label className="text-[9px] uppercase text-muted-foreground/80">Value</Label>
              <p className="text-[6.5px] text-muted-foreground/50 -mt-1 mb-1">Tip: use {'{{'} envName.KEY {'}}'} to reference another env&apos;s secret</p>
              <div className="flex gap-2">
                <Input
                  placeholder="postgresql://..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  disabled={creating}
                  className="h-9 bg-zinc-950/40 border-white/5 hover:border-white/10 focus-visible:ring-primary/20 text-xs font-mono flex-1"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!showRefPicker) {
                      loadProjectEnvs();
                      setShowRefPicker('new');
                    } else {
                      setShowRefPicker(null);
                    }
                  }}
                  title="Insert cross-environment reference"
                  className="h-9 px-2 rounded-lg bg-primary/10 border border-primary/20 text-[8px] font-mono text-primary font-bold hover:bg-primary/20 transition shrink-0"
                >
                  {'{'} {'}'}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={creating || !newKey.trim() || !newValue.trim()}
              className="h-9 font-semibold text-xs rounded-lg px-4 shrink-0"
            >
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add Secret"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-zinc-950/10 p-5 text-center text-xs text-muted-foreground">
          You hold view-only access keys. Modifications are disabled.
        </div>
      )}

      {/* Secrets Table */}
      <div className="rounded-xl border border-white/5 bg-zinc-950/20 p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Stored Secrets</h2>
        
        {secrets.length === 0 ? (
          <p className="text-[10px] text-muted-foreground italic py-4">No secrets stored in this environment scope.</p>
        ) : (
          <div className="space-y-3">
            {secrets.map((sec) => (
              <div
                key={sec.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-lg bg-black/40 border border-white/5 text-[10px]"
              >
                {/* Key Label */}
                <div className="min-w-[160px] truncate">
                  <code className="text-primary font-bold">{sec.key}</code>
                </div>

                {/* Secret Value View / Edit */}
                <div className="flex-1 min-w-0">
                  {editingId === sec.id ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8 bg-zinc-950/40 border-white/5 focus-visible:ring-primary/20 text-xs font-mono flex-1"
                        autoFocus
                        disabled={savingEdit}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!showRefPicker) {
                            loadProjectEnvs();
                            setShowRefPicker('edit');
                          } else {
                            setShowRefPicker(null);
                          }
                        }}
                        title="Insert cross-environment reference"
                        className="h-8 px-1.5 rounded bg-primary/10 border border-primary/20 text-[7px] font-mono text-primary font-bold hover:bg-primary/20 transition shrink-0"
                      >
                        {'{'} {'}'}
                      </button>
                      <button
                        onClick={() => handleSaveEdit(sec.id)}
                        disabled={savingEdit || !editValue.trim()}
                        className="text-primary hover:text-primary-foreground p-1 shrink-0"
                      >
                        {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={savingEdit}
                        className="text-muted-foreground hover:text-foreground p-1 shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : revealedIds.has(sec.id) ? (
                    <div className="flex items-center gap-2">
                      <code className="text-zinc-300 truncate font-mono select-all flex-1">
                        {renderRevealedValue(revealedValues[sec.id])}
                      </code>
                      <button
                        onClick={() => handleCopyValue(revealedValues[sec.id])}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <code className="text-zinc-700 tracking-widest">&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</code>
                  )}
                </div>

                {/* Meta details & Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="text-[8px] bg-white/5 text-zinc-400 border border-white/5 rounded px-1.5 py-0.2">
                    v{sec.version}
                  </span>
                  <span className={`text-[8px] ${daysAgo(sec.updatedAt).color} bg-white/5 border border-white/5 rounded px-1.5 py-0.2`}>
                    {daysAgo(sec.updatedAt).label}
                  </span>

                  <div className="flex items-center gap-1.5 border-l border-white/5 pl-3">
                    {/* Reveal toggle */}
                    <button
                      onClick={() => handleReveal(sec.id)}
                      disabled={revealingId === sec.id || editingId === sec.id}
                      className="p-1 hover:text-primary transition disabled:opacity-50"
                      title={revealedIds.has(sec.id) ? "Hide Value" : "Reveal Value"}
                    >
                      {revealingId === sec.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : revealedIds.has(sec.id) ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </button>

                    {/* Edit button */}
                    {!isViewer && (
                      <>
                        <button
                          onClick={() => {
                            if (revealedIds.has(sec.id)) {
                              handleStartEdit(sec.id, revealedValues[sec.id]);
                            } else {
                              api.post<RevealedSecret>(`/secrets/${sec.id}/reveal`, {}, token)
                                .then((r) => {
                                  setRevealedValues((prev) => ({ ...prev, [sec.id]: r.value }));
                                  setRevealedIds((prev) => new Set(prev).add(sec.id));
                                  handleStartEdit(sec.id, r.value);
                                })
                                .catch((err) => toast.error(err.message));
                            }
                          }}
                          disabled={editingId === sec.id}
                          className="p-1 hover:text-primary transition"
                          title="Edit Secret"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>

                        {/* History button */}
                        <button
                          onClick={() => handleOpenHistory(sec.id)}
                          className="p-1 hover:text-primary transition"
                          title="Secret Version History"
                        >
                          <History className="h-3 w-3" />
                        </button>

                        {/* Rotation button */}
                        {daysAgo(sec.updatedAt).days >= 60 && (
                          <button
                            onClick={() => handleRotateSecret(sec.id, sec.key)}
                            disabled={rotatingId === sec.id}
                            className="p-1 text-amber-400 hover:text-amber-300 transition disabled:opacity-50"
                            title="Secret hasn't been updated in 60+ days — rotate now"
                          >
                            {rotatingId === sec.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3" />
                            )}
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteSecret(sec.id, sec.key)}
                          disabled={deletingId === sec.id}
                          className="p-1 hover:text-destructive transition disabled:opacity-50"
                          title="Delete Secret"
                        >
                          {deletingId === sec.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reference Picker */}
      {showRefPicker && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/30 backdrop-blur-[2px] px-4"
          onClick={() => setShowRefPicker(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-white/10 bg-zinc-950 p-5 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[9px] font-bold uppercase tracking-wider text-foreground">Insert Cross-Environment Reference</h2>
              <button onClick={() => setShowRefPicker(null)} className="text-muted-foreground hover:text-foreground p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
            <p className="text-[8px] text-muted-foreground">Click a secret to insert <code className="text-primary font-mono text-[7px]">{'{{'} envName.KEY {'}}'}</code> at cursor.</p>

            {loadingRefs ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : envList.length === 0 ? (
              <p className="text-[9px] text-muted-foreground italic py-4 text-center">No other environments found.</p>
            ) : (
              <RefPickerList
                envList={envList}
                envSecretKeys={envSecretKeys}
                onSelect={insertReference}
              />
            )}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Import .env File</h2>
              <p className="text-[10px] text-muted-foreground mt-1">
                Paste raw key-value pairs below. Pre-existing keys will be skipped.
              </p>
            </div>
            <textarea
              className="min-h-[160px] w-full rounded-lg border border-white/5 bg-zinc-950/40 p-3 font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/40 text-zinc-300"
              placeholder="DATABASE_URL=postgresql://..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              disabled={importing}
            />
            <div className="flex justify-end gap-2 text-xs">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImport(false);
                  setImportText("");
                }}
                disabled={importing}
                size="sm"
                className="h-8 text-[10px]"
              >
                Cancel
              </Button>
              <Button onClick={handleImport} size="sm" className="h-8 text-[10px]" disabled={importing || !importText.trim()}>
                {importing ? <Loader2 className="h-3 w-3 animate-spin" /> : "Import Secrets"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* History / Rollback Modal */}
      {historyForSecret && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => {
            setHistoryForSecret(null);
            setHistoryEntries([]);
          }}
        >
          <div
            className="w-full max-w-xl rounded-xl border border-white/10 bg-zinc-950 p-6 shadow-2xl max-h-[70vh] flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Version Audit History</h2>
              <button
                className="p-1 hover:text-primary transition"
                onClick={() => {
                  setHistoryForSecret(null);
                  setHistoryEntries([]);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : historyEntries.length === 0 ? (
              <p className="text-[10px] text-muted-foreground italic py-4">No audit version backups found.</p>
            ) : (
              <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                {historyEntries.map((entry: any) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-black/40 border border-white/5 text-[9px]"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">Version {entry.version}</span>
                        <span className="text-[8px] text-zinc-500">{new Date(entry.changedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-muted-foreground truncate">Modified by: {entry.changedBy?.name || "System"}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[9px] border-white/10 hover:bg-white/5 shrink-0"
                      onClick={() => handleRollback(entry.id)}
                      disabled={rollingBack === entry.id}
                    >
                      {rollingBack === entry.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Rollback"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={deleteSecretDialog.open}
        onClose={() => setDeleteSecretDialog({ open: false, secretId: null, secretKey: "" })}
        onConfirm={executeDeleteSecret}
        title="Delete Secret"
        description={`Are you sure you want to permanently delete the secret key "${deleteSecretDialog.secretKey}"? Active environments fetching this key will throw configuration load errors.`}
        confirmLabel="Delete Secret"
        variant="danger"
        loading={deletingId === deleteSecretDialog.secretId}
      />
    </div>
  );
}

function RefPickerList({
  envList,
  envSecretKeys,
  onSelect,
}: {
  envList: { id: string; name: string }[];
  envSecretKeys: Record<string, { key: string }[]>;
  onSelect: (ref: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
      {envList.map((env) => {
        const keys = envSecretKeys[env.id] ?? [];
        const isExpanded = expanded === env.id;
        return (
          <div key={env.id} className="rounded-lg border border-white/5 bg-black/20">
            <button
              onClick={() => setExpanded(isExpanded ? null : env.id)}
              className="flex items-center justify-between w-full px-3 py-2 text-left text-[9px] font-semibold text-foreground hover:bg-white/5 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-primary" />
                {env.name}
              </span>
              <span className="text-[8px] text-muted-foreground">{keys.length} keys</span>
            </button>
            {isExpanded && (
              <div className="px-3 pb-2 pt-1 space-y-0.5">
                {keys.length === 0 ? (
                  <p className="text-[8px] text-muted-foreground italic">No secrets</p>
                ) : (
                  keys.map((sec) => (
                    <button
                      key={sec.key}
                      onClick={() => onSelect(`{{ ${env.name}.${sec.key} }}`)}
                      className="flex items-center gap-1.5 w-full px-2 py-1 rounded text-[8px] font-mono text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Key className="h-2.5 w-2.5 shrink-0" />
                      {sec.key}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
