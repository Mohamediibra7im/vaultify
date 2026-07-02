"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Users, Loader2, ArrowRight, FolderKanban, Shield } from "lucide-react";
import { motion } from "motion/react";

interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  _count: { members: number; projects: number };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

interface Environment {
  id: string;
  name: string;
}

interface ProjectWithMeta extends Project {
  workspaceName: string;
  workspaceId: string;
  memberCount: number;
  environmentCount: number;
  ownerId: string;
}

export default function SharedProjectsPage() {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) return;

    const currentUserId = user.id;
    let cancelled = false;

    async function fetchSharedProjects() {
      try {
        const workspaces = await api.get<Workspace[]>("/workspaces", token);

        // Filter workspaces where user is not owner OR has multiple members
        const sharedWorkspaces = workspaces.filter(
          (ws) => ws.ownerId !== currentUserId || ws._count.members > 1,
        );

        const projectPromises = sharedWorkspaces.map(async (ws) => {
          try {
            const wsProjects = await api.get<Project[]>(
              `/workspaces/${ws.id}/projects`,
              token,
            );
            const projectsArray = Array.isArray(wsProjects) ? wsProjects : [];

            // Fetch environments for each project
            const envPromises = projectsArray.map((p) =>
              api
                .get<Environment[]>(`/projects/${p.id}/environments`, token)
                .then((envs) => (Array.isArray(envs) ? envs : []))
                .catch(() => [] as Environment[]),
            );

            const envResults = await Promise.all(envPromises);

            return projectsArray.map((p, i) => ({
              ...p,
              workspaceName: ws.name,
              workspaceId: ws.id,
              memberCount: ws._count.members,
              environmentCount: envResults[i].length,
              ownerId: ws.ownerId,
            }));
          } catch {
            return [] as ProjectWithMeta[];
          }
        });

        const results = await Promise.all(projectPromises);
        if (!cancelled) {
          setProjects(results.flat());
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSharedProjects();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center font-mono text-xs text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
        <span>Scanning shared project access...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 text-left font-mono">
      {/* Title Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Shared With Me
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Projects shared with you across workspaces
        </p>
      </div>

      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/5 bg-zinc-950/20 py-16 text-center"
        >
          <div className="h-10 w-10 rounded-full border border-white/5 bg-zinc-900/50 flex items-center justify-center mb-4">
            <Users className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            No projects have been shared with you yet
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground max-w-xs leading-relaxed">
            When someone adds you to a workspace or shares a project, it will appear here.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="h-full"
            >
              <Link
                href={`/dashboard/projects/${p.id}`}
                className="group flex flex-col justify-between h-full rounded-2xl border border-white/5 bg-zinc-950/45 p-5 backdrop-blur-md hover:border-primary/20 hover:bg-zinc-950/55 transition-all duration-200"
              >
                <div>
                  {/* Icon + Arrow */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                      <FolderKanban className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>

                  {/* Project Name */}
                  <h3 className="mt-4 text-xs font-bold text-foreground uppercase tracking-wider">
                    {p.name}
                  </h3>

                  {/* Description */}
                  {p.description ? (
                    <p className="text-[10px] text-muted-foreground/80 leading-relaxed mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  ) : null}

                  {/* Workspace badge */}
                  <div className="mt-3">
                    <span className="inline-flex items-center text-[8px] uppercase tracking-widest font-bold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded">
                      {p.workspaceName}
                    </span>
                  </div>
                </div>

                {/* Footer stats */}
                <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center gap-4 text-[9px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-primary/70" />
                    {p.memberCount} Member{p.memberCount !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderKanban className="h-3 w-3 text-zinc-600" />
                    {p.environmentCount} Env{p.environmentCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
