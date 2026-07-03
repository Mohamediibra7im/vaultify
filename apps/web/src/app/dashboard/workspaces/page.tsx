"use client";

import { useEffect, useState } from "react";
// next/navigation router removed (unused)
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Users, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  ownerId: string;
  _count: { members: number; projects: number };
}

export default function WorkspacesPage() {
  const { token } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    api
      .get<Workspace[]>("/workspaces", token)
      .then(setWorkspaces)
      .catch((err) => {
        console.error("Failed to load workspaces:", err);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center font-mono text-xs text-muted-foreground">
        <span>Querying secure workspace list...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left font-mono">
      {/* Title Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground uppercase">Workspaces</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Isolate configurations and define team access boundaries.
          </p>
        </div>
        <Link href="/dashboard/workspaces/new">
          <Button size="sm" className="gap-1.5 font-semibold text-xs rounded-lg">
            <Plus className="h-3.5 w-3.5" />
            New Workspace
          </Button>
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/5 bg-zinc-950/20 py-16 text-center"
        >
          <div className="h-10 w-10 rounded-full border border-white/5 bg-zinc-900/50 flex items-center justify-center mb-4">
            <Users className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">No workspaces yet</h3>
          <p className="mt-1 text-[11px] text-muted-foreground max-w-xs leading-relaxed">
            Create your first workspace context to start mapping secure environments and projects.
          </p>
          <Link href="/dashboard/workspaces/new" className="mt-4">
            <Button size="sm" variant="outline" className="gap-1.5 text-[11px] border-white/10 hover:bg-white/5">
              <Plus className="h-3.5 w-3.5" />
              Create Workspace
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {workspaces.map((ws, idx) => (
            <motion.div
              key={ws.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Link
                href={`/dashboard/workspaces/${ws.id}`}
                className="group block rounded-xl border border-white/5 bg-zinc-950/25 p-5 hover:border-primary/20 hover:bg-zinc-950/45 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                
                <h3 className="mt-4 text-xs font-bold text-foreground uppercase tracking-wider">{ws.name}</h3>
                
                <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center gap-4 text-[9px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-primary/70" />
                    {ws._count.members} Member{ws._count.members !== 1 ? "s" : ""}
                  </span>
                  <span>
                    {ws._count.projects} Project{ws._count.projects !== 1 ? "s" : ""}
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
