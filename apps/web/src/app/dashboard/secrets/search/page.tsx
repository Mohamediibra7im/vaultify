"use client";

import { useEffect, useState, useCallback } from "react";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  key: string;
  value: string;
  environmentId: string;
  environmentName: string;
  projectId: string;
  projectName: string;
  updatedAt: string;
}

interface Workspace {
  id: string;
  name: string;
}

export default function SecretsSearchPage() {
  const { token } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get<Workspace[]>("/workspaces", token)
      .then((data) => {
        setWorkspaces(data);
        if (data.length > 0) {
          setWorkspaceId(data[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load workspaces:", err);
      })
      .finally(() => setLoadingWorkspaces(false));
  }, [token]);

  const handleSearch = useCallback(async () => {
    if (!token || !workspaceId || !query.trim()) return;
    setSearching(true);
    setSearched(false);
    try {
      const data = await api.post<SearchResult[]>(
        "/secrets/search",
        { workspaceId, query: query.trim() },
        token,
      );
      setResults(data);
      setSearched(true);
      setRevealedKeys(new Set());
    } catch (err) {
      console.error("Search failed:", err);
      toast.error("Search failed — check connection and permissions");
    } finally {
      setSearching(false);
    }
  }, [token, workspaceId, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const toggleReveal = (key: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyValue = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (loadingWorkspaces) {
    return (
      <div className="flex h-[40vh] items-center justify-center font-mono text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>Loading workspaces...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left font-mono">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">
          Secret Search
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Search across all environments in a workspace.
        </p>
      </div>

      {/* Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="w-full sm:w-64 space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Workspace
          </label>
          <select
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            className="w-full rounded-lg border border-white/5 bg-zinc-900/50 px-3 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition"
          >
            {workspaces.length === 0 && (
              <option value="" disabled>
                No workspaces available
              </option>
            )}
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 w-full space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Search Query
          </label>
          <Input
            placeholder="Type a secret key to search for..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="font-mono text-xs"
          />
        </div>

        <Button
          onClick={handleSearch}
          disabled={searching || !query.trim() || !workspaceId}
          size="sm"
          className="gap-1.5 font-semibold text-xs rounded-lg h-9"
        >
          {searching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
          {searching ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Results */}
      {searched && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/5 bg-zinc-950/20 py-16 text-center"
        >
          <div className="h-10 w-10 rounded-full border border-white/5 bg-zinc-900/50 flex items-center justify-center mb-4">
            <Key className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            No secrets found
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground max-w-xs leading-relaxed">
            No secrets match &ldquo;{query}&rdquo; in the selected workspace.
            Try a different search term.
          </p>
        </motion.div>
      )}

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/5 bg-zinc-950/30 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-900/40">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Key
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Value
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Environment
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Project
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-foreground font-semibold">
                      <div className="flex items-center gap-2">
                        <Key className="h-3 w-3 text-primary/60 shrink-0" />
                        <span>{r.key}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground max-w-[200px] truncate">
                          {revealedKeys.has(r.id)
                            ? r.value
                            : "•".repeat(Math.min(r.value.length, 32))}
                        </span>
                        <button
                          onClick={() => toggleReveal(r.id)}
                          className="p-1 rounded text-zinc-600 hover:text-foreground transition shrink-0"
                          title={revealedKeys.has(r.id) ? "Hide" : "Reveal"}
                        >
                          {revealedKeys.has(r.id) ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.environmentName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.projectName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/dashboard/environments/${r.environmentId}`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-500 hover:text-foreground"
                            title="Open environment"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                        {revealedKeys.has(r.id) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-500 hover:text-foreground"
                            title="Copy value"
                            onClick={() => copyValue(r.value, r.id)}
                          >
                            {copiedId === r.id ? (
                              <Check className="h-3 w-3 text-primary" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-white/5 text-[10px] text-zinc-600 text-right">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </div>
        </motion.div>
      )}
    </div>
  );
}
