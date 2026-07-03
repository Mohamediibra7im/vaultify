"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderKanban, ArrowRight, Search } from "lucide-react";
import { motion } from "motion/react";

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  workspaceName?: string;
  workspaceId?: string;
}

interface Workspace {
  id: string;
  name: string;
}

export default function ProjectsListPage() {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!token) return;

    // Fetch workspaces, then load projects for each workspace
    setLoading(true);
    api.get<Workspace[]>("/workspaces", token)
      .then(async (workspaces) => {
        try {
          const promises = workspaces.map(ws => 
            api.get<Project[]>(`/workspaces/${ws.id}/projects`, token)
              .then(projs => projs.map(p => ({
                ...p,
                workspaceName: ws.name,
                workspaceId: ws.id
              })))
          );
          const results = await Promise.all(promises);
          const flatProjects = results.flat();
          setProjects(flatProjects);
        } catch (err) {
          console.error("Failed to load projects inside workspaces:", err);
        }
      })
      .catch((err) => {
        console.error("Failed to load workspaces list:", err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.workspaceName && p.workspaceName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center font-mono text-xs text-muted-foreground">
        <span>Querying workspace project indexes...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8 text-left font-mono">
      {/* Title Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground uppercase font-mono">Projects</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse and search secret groups across all your workspaces.
          </p>
        </div>
        <Link
          href="/dashboard/secrets/search"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[10px] font-semibold font-mono border border-white/10 hover:border-primary/20 hover:bg-white/5 transition shrink-0 self-start sm:self-auto"
        >
          <Search className="h-3.5 w-3.5" />
          Search Secrets
        </Link>
      </div>

      {/* Search Filter input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search by name, description or workspace..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 bg-zinc-950/40 border-white/5 hover:border-white/10 focus-visible:ring-primary/20 text-xs font-mono"
        />
      </div>

      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/5 bg-zinc-950/20 py-16 text-center"
        >
          <div className="h-10 w-10 rounded-full border border-white/5 bg-zinc-900/50 flex items-center justify-center mb-4">
            <FolderKanban className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">No projects found</h3>
          <p className="mt-1 text-[10px] text-muted-foreground max-w-xs leading-relaxed">
            Create a workspace first, then map project contexts inside it.
          </p>
          <Link href="/dashboard/workspaces" className="mt-4">
            <Button size="sm" variant="outline" className="gap-1.5 text-[10px] border-white/10 hover:bg-white/5">
              Go to Workspaces
            </Button>
          </Link>
        </motion.div>
      ) : filteredProjects.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic">No projects matches search filter query.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredProjects.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="h-full"
            >
              <Link
                href={`/dashboard/projects/${p.id}`}
                className="group flex flex-col justify-between h-full rounded-xl border border-white/5 bg-zinc-950/25 p-5 hover:border-primary/20 hover:bg-zinc-950/45 transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                      <FolderKanban className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  
                  <h3 className="mt-4 text-xs font-bold text-foreground uppercase tracking-wider">{p.name}</h3>
                  {p.description ? (
                    <p className="text-[9px] text-muted-foreground truncate mt-1">{p.description}</p>
                  ) : (
                    <p className="text-[9px] text-transparent select-none mt-1">&nbsp;</p>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center justify-between text-[8px] text-zinc-500">
                  <span className="uppercase tracking-wider">
                    Workspace: <span className="text-zinc-400 font-bold">{p.workspaceName}</span>
                  </span>
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
