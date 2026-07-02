"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  GitCompare,
  Globe,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface Environment {
  id: string;
  name: string;
  _count?: { secrets: number };
}

interface DiffItem {
  key: string;
  value: string | null;
}

interface DiffResult {
  onlyInA: DiffItem[];
  onlyInB: DiffItem[];
  common: Array<{ key: string; same: boolean; valueA: string | null; valueB: string | null }>;
}

export default function EnvironmentDiffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { token, user } = useAuth();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [envLoading, setEnvLoading] = useState(true);
  const [envError, setEnvError] = useState<string | null>(null);

  const [envA, setEnvA] = useState("");
  const [envB, setEnvB] = useState("");
  const [includeValues, setIncludeValues] = useState(false);

  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [diffError, setDiffError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setProjectId(p.id));
  }, [params]);

  useEffect(() => {
    if (!token || !projectId) return;

    setEnvLoading(true);
    setEnvError(null);

    api
      .get<Environment[]>(`/projects/${projectId}/environments`, token)
      .then((envs) => {
        setEnvironments(envs);
        if (envs.length >= 2) {
          setEnvA(envs[0].id);
          setEnvB(envs[1].id);
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load environments";
        setEnvError(msg);
        toast.error(msg);
      })
      .finally(() => setEnvLoading(false));
  }, [token, projectId]);

  async function handleCompare() {
    if (!token || !projectId || !envA || !envB) return;
    if (envA === envB) {
      toast.error("Select two different environments");
      return;
    }

    setDiffLoading(true);
    setDiffResult(null);
    setDiffError(null);

    try {
      const q = `id1=${envA}&id2=${envB}${includeValues ? "&includeValues=true" : ""}`;
      const res = await api.get<DiffResult>(
        `/projects/${projectId}/environments/diff?${q}`,
        token,
      );
      setDiffResult(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to compare environments";
      setDiffError(msg);
      toast.error(msg);
    } finally {
      setDiffLoading(false);
    }
  }

  const envAMeta = environments.find((e) => e.id === envA);
  const envBMeta = environments.find((e) => e.id === envB);

  if (!user) return null;

  return (
    <div className="space-y-8 text-left font-mono">
      {/* Back Link */}
      <Link
        href={`/dashboard/projects/${projectId}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to project</span>
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-white/5 bg-zinc-950/45 p-6 sm:p-8 relative overflow-hidden backdrop-blur-md"
      >
        <div className="absolute top-0 right-0 h-[200px] w-[200px] rounded-full bg-emerald-glow/20 blur-[60px] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <span className="text-[9px] uppercase tracking-widest text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
            Environment Diff
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Compare Environments
          </h1>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Select two environments to compare their secret keys and values. Differences are highlighted for quick review.
          </p>
        </div>
      </motion.div>

      {/* Selectors Card */}
      <div className="rounded-xl border border-white/5 bg-zinc-950/20 p-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Env A */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              Environment A
            </label>
            <select
              value={envA}
              onChange={(e) => { setEnvA(e.target.value); setDiffResult(null); setDiffError(null); }}
              disabled={envLoading}
              className="w-full h-9 rounded-lg bg-zinc-950/40 border border-white/5 text-xs font-mono px-3 text-foreground disabled:opacity-50 appearance-none cursor-pointer focus:border-primary/30 focus:outline-none"
            >
              <option value="">Select environment...</option>
              {environments
                .filter((e) => e.id !== envB)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} {e._count ? `(${e._count.secrets} secrets)` : ""}
                  </option>
                ))}
            </select>
          </div>

          {/* Env B */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
              Environment B
            </label>
            <select
              value={envB}
              onChange={(e) => { setEnvB(e.target.value); setDiffResult(null); setDiffError(null); }}
              disabled={envLoading}
              className="w-full h-9 rounded-lg bg-zinc-950/40 border border-white/5 text-xs font-mono px-3 text-foreground disabled:opacity-50 appearance-none cursor-pointer focus:border-primary/30 focus:outline-none"
            >
              <option value="">Select environment...</option>
              {environments
                .filter((e) => e.id !== envA)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} {e._count ? `(${e._count.secrets} secrets)` : ""}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Include values toggle */}
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={includeValues}
            onChange={(e) => setIncludeValues(e.target.checked)}
            className="rounded border-white/10 bg-zinc-950/40 accent-emerald-500"
          />
          <span className="text-[10px] font-mono text-muted-foreground">
            Compare decrypted values
          </span>
        </label>

        <Button
          size="sm"
          disabled={!envA || !envB || diffLoading || envLoading}
          onClick={handleCompare}
          className="w-full h-9 text-xs font-semibold gap-1.5"
        >
          {diffLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <GitCompare className="h-3.5 w-3.5" />
          )}
          {diffLoading ? "Comparing..." : "Compare"}
        </Button>
      </div>

      {/* Loading State */}
      {envLoading && (
        <div className="flex h-[30vh] items-center justify-center text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading environments...
        </div>
      )}

      {/* Environments Error */}
      {envError && !envLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-950/10 py-12 text-center gap-3">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-xs text-red-400 max-w-md">{envError}</p>
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] border-red-500/20 hover:bg-red-950/20"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Diff Error */}
      {diffError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-950/10 px-4 py-3 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{diffError}</span>
        </div>
      )}

      {/* Results */}
      {diffResult && !diffLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Only in A */}
          {diffResult.onlyInA.length > 0 && (
            <div className="rounded-xl border border-emerald-500/15 bg-zinc-950/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Only in {envAMeta?.name ?? "Environment A"}
                </h3>
                <span className="text-[9px] text-emerald-400/60 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {diffResult.onlyInA.length}
                </span>
              </div>
              <div className="space-y-1">
                {diffResult.onlyInA.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-4 py-2.5 text-[10px]"
                  >
                    <span className="font-semibold text-foreground">{item.key}</span>
                    <span className="text-muted-foreground max-w-[50%] truncate ml-4">
                      {item.value ?? "***"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Only in B */}
          {diffResult.onlyInB.length > 0 && (
            <div className="rounded-xl border border-amber-500/15 bg-zinc-950/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  Only in {envBMeta?.name ?? "Environment B"}
                </h3>
                <span className="text-[9px] text-amber-400/60 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  {diffResult.onlyInB.length}
                </span>
              </div>
              <div className="space-y-1">
                {diffResult.onlyInB.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-4 py-2.5 text-[10px]"
                  >
                    <span className="font-semibold text-foreground">{item.key}</span>
                    <span className="text-muted-foreground max-w-[50%] truncate ml-4">
                      {item.value ?? "***"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common */}
          {diffResult.common.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-zinc-950/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  Common Keys
                </h3>
                <span className="text-[9px] text-muted-foreground/60 bg-white/5 px-1.5 py-0.5 rounded">
                  {diffResult.common.length}
                </span>
              </div>
              <div className="space-y-1">
                {diffResult.common.map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-[10px] ${
                      item.same
                        ? "border-white/5 bg-black/30"
                        : "border-rose-500/20 bg-rose-950/15"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          item.same ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      <span className="font-semibold text-foreground">
                        {item.key}
                      </span>
                    </div>
                    {!item.same ? (
                      <div className="flex items-center gap-2 text-muted-foreground ml-4 shrink-0">
                        <span className="max-w-[120px] truncate text-rose-300">
                          {item.valueA ?? "***"}
                        </span>
                        <span className="text-zinc-600">→</span>
                        <span className="max-w-[120px] truncate text-emerald-300">
                          {item.valueB ?? "***"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground ml-4 shrink-0 text-[9px]">
                        Match
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {diffResult.onlyInA.length === 0 &&
            diffResult.onlyInB.length === 0 &&
            diffResult.common.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/5 bg-zinc-950/20 py-12 text-center gap-2">
                <Globe className="h-8 w-8 text-zinc-600" />
                <p className="text-xs text-muted-foreground">
                  No secrets found in either environment.
                </p>
              </div>
            )}

          {/* Identical */}
          {diffResult.onlyInA.length === 0 &&
            diffResult.onlyInB.length === 0 &&
            diffResult.common.length > 0 &&
            diffResult.common.every((s) => s.same) && (
              <div className="flex items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-950/10 px-4 py-3 text-xs text-emerald-400 gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Environments are identical — all {diffResult.common.length} secret
                {diffResult.common.length !== 1 ? "s" : ""} match.
              </div>
            )}
        </motion.div>
      )}
    </div>
  );
}
