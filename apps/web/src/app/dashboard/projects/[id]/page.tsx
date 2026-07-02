"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  Plus,
  Globe,
  GitCompare,
  X,
  Pencil,
  Save,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Label } from "@radix-ui/react-label";

interface Environment {
  id: string;
  name: string;
  _count: { secrets: number };
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  workspaceId: string;
  environments: Environment[];
}

interface SecretDiffItem {
  key: string;
  value: string | null;
}

interface EnvironmentDiffResult {
  onlyInA: SecretDiffItem[];
  onlyInB: SecretDiffItem[];
  common: Array<{ key: string; same: boolean; valueA: string | null; valueB: string | null }>;
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [envName, setEnvName] = useState("");
  const [creatingEnv, setCreatingEnv] = useState(false);
  const [deletingEnvId, setDeletingEnvId] = useState<string | null>(null);

  // Edit project states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingProject, setSavingProject] = useState(false);

  // Confirm dialog states
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [deleteEnvDialog, setDeleteEnvDialog] = useState<{ open: boolean; envId: string | null; envName: string }>({ open: false, envId: null, envName: "" });

  // Diff modal state
  const [diffOpen, setDiffOpen] = useState(false);
  const [diffEnvA, setDiffEnvA] = useState<string>("");
  const [diffEnvB, setDiffEnvB] = useState<string>("");
  const [diffResult, setDiffResult] = useState<EnvironmentDiffResult | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [diffIncludeValues, setDiffIncludeValues] = useState(false);

  useEffect(() => {
    params.then((p) => setProjectId(p.id));
  }, [params]);

  useEffect(() => {
    if (!token || !projectId) return;

    api
      .get<ProjectDetail>(`/projects/${projectId}`, token)
      .then(setProject)
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load project");
        router.push("/dashboard/workspaces");
      })
      .finally(() => setLoading(false));
  }, [token, projectId, router]);

  function startEditing() {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description || "");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditName("");
    setEditDescription("");
  }

  async function handleSaveProject() {
    if (!token || !projectId || !editName.trim()) return;
    setSavingProject(true);
    try {
      const updated = await api.patch<ProjectDetail>(
        `/projects/${projectId}`,
        { name: editName.trim(), description: editDescription.trim() || null },
        token,
      );
      setProject((prev) =>
        prev
          ? { ...prev, name: updated.name, description: updated.description }
          : prev,
      );
      setIsEditing(false);
      toast.success("Project updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setSavingProject(false);
    }
  }

  async function handleCreateEnv(e: React.FormEvent) {
    e.preventDefault();
    if (!envName.trim() || !token || !projectId) return;
    setCreatingEnv(true);
    try {
      const newEnv = await api.post<Environment>(
        `/projects/${projectId}/environments`,
        { name: envName.trim().toLowerCase() },
        token,
      );
      setProject((prev) =>
        prev
          ? { ...prev, environments: [...prev.environments, newEnv] }
          : prev,
      );
      setEnvName("");
      toast.success("Environment created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create environment");
    } finally {
      setCreatingEnv(false);
    }
  }

  function handleDeleteEnv(envId: string, envName: string) {
    setDeleteEnvDialog({ open: true, envId, envName });
  }

  async function executeDeleteEnv() {
    if (!token || !deleteEnvDialog.envId) return;
    setDeletingEnvId(deleteEnvDialog.envId);
    try {
      await api.delete(`/environments/${deleteEnvDialog.envId}`, token);
      setProject((prev) =>
        prev
          ? { ...prev, environments: prev.environments.filter((e) => e.id !== deleteEnvDialog.envId) }
          : prev,
      );
      toast.success("Environment deleted");
      setDeleteEnvDialog({ open: false, envId: null, envName: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete environment");
    } finally {
      setDeletingEnvId(null);
    }
  }

  function handleDeleteProject() {
    setDeleteProjectOpen(true);
  }

  async function executeDeleteProject() {
    if (!token || !projectId) return;
    setDeletingProject(true);
    try {
      await api.delete(`/projects/${projectId}`, token);
      toast.success("Project deleted");
      router.push(`/dashboard/workspaces/${project?.workspaceId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete project");
    } finally {
      setDeletingProject(false);
      setDeleteProjectOpen(false);
    }
  }

  async function handleDiff() {
    if (!token || !projectId || !diffEnvA || !diffEnvB) return;
    if (diffEnvA === diffEnvB) { toast.error("Select two different environments"); return; }
    setDiffLoading(true);
    setDiffResult(null);
    try {
      const q = `id1=${diffEnvA}&id2=${diffEnvB}${diffIncludeValues ? '&includeValues=true' : ''}`;
      const res = await api.get<EnvironmentDiffResult>(`/projects/${projectId}/environments/diff?${q}`, token);
      setDiffResult(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to compare environments");
    } finally {
      setDiffLoading(false);
    }
  }

  if (loading || !project || !user) {
    return (
      <div className="flex h-[40vh] items-center justify-center font-mono text-xs text-muted-foreground">
        <span>Loading project metadata...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left font-mono">
      {/* Back Link */}
      <Link
        href={`/dashboard/workspaces/${project.workspaceId}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to workspace</span>
      </Link>

      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1.5 flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/80">Project Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={savingProject}
                  className="h-9 bg-zinc-950/40 border-white/5 hover:border-white/10 focus-visible:ring-primary/20 text-xs font-mono max-w-sm"
                  placeholder="Project name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/80">Description</label>
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={savingProject}
                  className="h-9 bg-zinc-950/40 border-white/5 hover:border-white/10 focus-visible:ring-primary/20 text-xs font-mono max-w-sm"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-7 text-[10px] gap-1.5"
                  onClick={handleSaveProject}
                  disabled={savingProject || !editName.trim()}
                >
                  {savingProject ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                  Save Changes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] gap-1.5 border-white/10 hover:bg-white/5"
                  onClick={cancelEditing}
                  disabled={savingProject}
                >
                  <XCircle className="h-3 w-3" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">{project.name}</h1>
                <button
                  onClick={startEditing}
                  className="p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
                  title="Edit project"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              {project.description && (
                <p className="text-xs text-muted-foreground">{project.description}</p>
              )}
              <p className="text-[10px] text-zinc-500">
                {project.environments.length} Environment{project.environments.length !== 1 ? "s" : ""}
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 self-start">
          <Link
            href={`/dashboard/projects/${projectId}/environments/diff`}
            className="inline-flex items-center gap-1.5 h-8 rounded-md border border-white/5 bg-zinc-900/40 px-3 text-[10px] font-mono text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-colors"
          >
            <GitCompare className="h-3.5 w-3.5" />
            Compare Environments
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] text-destructive border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10 h-8"
            onClick={handleDeleteProject}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete Project
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Environments Listing Card */}
        <div className="rounded-xl border border-white/5 bg-zinc-950/20 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Environments</h2>
            <div className="flex items-center gap-2">
              {project.environments.length >= 2 && (
                <button
                  onClick={() => setDiffOpen(true)}
                  className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-primary transition"
                  title="Compare environments"
                >
                  <GitCompare className="h-3 w-3" />
                  <span className="hidden sm:inline">Compare</span>
                </button>
              )}
              <span className="text-[9px] bg-white/5 rounded px-1.5 py-0.2">{project.environments.length}</span>
            </div>
          </div>

          {project.environments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Globe className="h-8 w-8 text-zinc-600 mb-2" />
              <p className="text-[10px] text-muted-foreground">No environments created yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {project.environments.map((env) => (
                <div
                  key={env.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-zinc-950/30 p-3 text-[10px]"
                >
                  <Link
                    href={`/dashboard/environments/${env.id}`}
                    className="flex items-center gap-2.5 min-w-0 flex-1 hover:text-primary transition"
                  >
                    <Globe className="h-4 w-4 text-primary shrink-0 animate-pulse" />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{env.name}</p>
                      <p className="text-[8px] text-muted-foreground truncate mt-0.5">
                        {env._count?.secrets ?? 0} Secret{env._count?.secrets !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleDeleteEnv(env.id, env.name)}
                    disabled={deletingEnvId === env.id}
                    className="text-muted-foreground hover:text-destructive p-1 shrink-0 transition"
                    title="Delete environment"
                  >
                    {deletingEnvId === env.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Environment Card */}
        <div className="rounded-xl border border-white/5 bg-zinc-950/20 p-5 space-y-4 h-fit">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Create Environment</h2>
          <form onSubmit={handleCreateEnv} className="space-y-3.5">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="envName" className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/80">
                Environment Name
              </Label>
              <Input
                id="envName"
                placeholder="e.g. staging"
                value={envName}
                onChange={(e) => setEnvName(e.target.value)}
                disabled={creatingEnv}
                className="h-9 bg-zinc-950/40 border-white/5 hover:border-white/10 focus-visible:ring-primary/20 text-xs font-mono"
                required
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={creatingEnv || !envName.trim()}
              className="w-full gap-1.5 text-[10px] font-semibold h-8 rounded-lg"
            >
              {creatingEnv ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
              Add Environment
            </Button>
          </form>
        </div>
      </div>

      {/* Diff Modal */}
      {diffOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (!diffLoading) { setDiffOpen(false); setDiffResult(null); } }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-white/5 bg-zinc-950/90 backdrop-blur-xl shadow-2xl shadow-black/50"
            >
              <div className="flex items-center justify-between p-5 pb-0">
                <h3 className="text-sm font-bold font-mono text-foreground">Compare Environments</h3>
                <button
                  onClick={() => { setDiffOpen(false); setDiffResult(null); }}
                  className="p-1 rounded-md text-zinc-500 hover:text-foreground hover:bg-white/5 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Selectors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/80">Environment A</label>
                    <select
                      value={diffEnvA}
                      onChange={(e) => { setDiffEnvA(e.target.value); setDiffResult(null); }}
                      className="w-full h-9 rounded-lg bg-zinc-950/40 border border-white/5 text-xs font-mono px-3"
                    >
                      <option value="">Select...</option>
                      {project.environments.filter(e => e.id !== diffEnvB).map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/80">Environment B</label>
                    <select
                      value={diffEnvB}
                      onChange={(e) => { setDiffEnvB(e.target.value); setDiffResult(null); }}
                      className="w-full h-9 rounded-lg bg-zinc-950/40 border border-white/5 text-xs font-mono px-3"
                    >
                      <option value="">Select...</option>
                      {project.environments.filter(e => e.id !== diffEnvA).map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Include values toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={diffIncludeValues}
                    onChange={(e) => setDiffIncludeValues(e.target.checked)}
                    className="rounded border-white/10"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground">Compare decrypted values</span>
                </label>

                <Button
                  size="sm"
                  disabled={!diffEnvA || !diffEnvB || diffLoading}
                  onClick={handleDiff}
                  className="w-full h-8 text-[10px] font-semibold gap-1.5"
                >
                  {diffLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <GitCompare className="h-3 w-3" />}
                  Compare
                </Button>

                {/* Results */}
                {diffResult && (
                  <div className="space-y-4 pt-2">
                    {diffResult.onlyInA.length > 0 && (
                      <div>
                        <h4 className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 mb-2">Only in Environment A</h4>
                        <div className="space-y-1">
                          {diffResult.onlyInA.map(s => (
                            <div key={s.key} className="flex justify-between rounded border border-white/5 bg-black/30 px-3 py-2 text-[10px] font-mono">
                              <span className="text-foreground">{s.key}</span>
                              <span className="text-muted-foreground">{s.value ?? '***'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {diffResult.onlyInB.length > 0 && (
                      <div>
                        <h4 className="text-[9px] font-mono uppercase tracking-wider text-amber-400 mb-2">Only in Environment B</h4>
                        <div className="space-y-1">
                          {diffResult.onlyInB.map(s => (
                            <div key={s.key} className="flex justify-between rounded border border-white/5 bg-black/30 px-3 py-2 text-[10px] font-mono">
                              <span className="text-foreground">{s.key}</span>
                              <span className="text-muted-foreground">{s.value ?? '***'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {diffResult.common.length > 0 && (
                      <div>
                        <h4 className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Common Keys</h4>
                        <div className="space-y-1">
                          {diffResult.common.map(s => (
                            <div
                              key={s.key}
                              className={`flex justify-between rounded border px-3 py-2 text-[10px] font-mono ${
                                s.same ? 'border-white/5 bg-black/30' : 'border-red-500/20 bg-red-950/20'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${s.same ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                                <span className="text-foreground">{s.key}</span>
                              </div>
                              <div className="flex gap-4 text-muted-foreground">
                                <span>{s.valueA ?? '***'}</span>
                                <span className="text-zinc-600">→</span>
                                <span>{s.valueB ?? '***'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {diffResult.onlyInA.length === 0 && diffResult.onlyInB.length === 0 && diffResult.common.every(s => s.same) && (
                      <p className="text-[10px] text-muted-foreground text-center py-4">Environments are identical.</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={deleteProjectOpen}
        onClose={() => setDeleteProjectOpen(false)}
        onConfirm={executeDeleteProject}
        title="Delete Project"
        description={`Permanently delete "${project.name}" and all its environments and secrets? This action is irreversible.`}
        confirmLabel="Delete Project"
        variant="danger"
        loading={deletingProject}
      />

      <ConfirmDialog
        open={deleteEnvDialog.open}
        onClose={() => setDeleteEnvDialog({ open: false, envId: null, envName: "" })}
        onConfirm={executeDeleteEnv}
        title="Delete Environment"
        description={`Permanently delete the "${deleteEnvDialog.envName}" environment and all its secrets? This cannot be undone.`}
        confirmLabel="Delete Environment"
        variant="danger"
        loading={!!deletingEnvId}
      />
    </div>
  );
}
