"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function NewProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setWorkspaceId(p.id));
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !token || !workspaceId) return;
    setSubmitting(true);
    try {
      const project = await api.post<{ id: string }>(
        `/workspaces/${workspaceId}/projects`,
        { name: name.trim(), description: description.trim() || undefined },
        token,
      );
      toast.success("Project created");
      router.push(`/dashboard/projects/${project.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6 text-left font-mono max-w-md mx-auto">
      {/* Back Link */}
      <Link
        href={workspaceId ? `/dashboard/workspaces/${workspaceId}` : "/dashboard/workspaces"}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to workspace</span>
      </Link>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/5 bg-zinc-950/20 p-6 sm:p-8 space-y-5"
      >
        <div>
          <h1 className="text-base font-bold uppercase tracking-wider text-foreground">Create Project</h1>
          <p className="text-[10px] text-muted-foreground mt-1">
            Projects act as buckets to organize variables per repository.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[9px] uppercase tracking-wider text-muted-foreground/80">
              Project Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Frontend Web App"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="h-9 bg-zinc-950/40 border-white/5 hover:border-white/10 focus-visible:ring-primary/20 text-xs font-mono"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-[9px] uppercase tracking-wider text-muted-foreground/80">
              Description (optional)
            </Label>
            <Input
              id="description"
              placeholder="Brief summary of project scope"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              className="h-9 bg-zinc-950/40 border-white/5 hover:border-white/10 focus-visible:ring-primary/20 text-xs font-mono"
            />
          </div>

          <Button
            type="submit"
            className="w-full gap-1.5 text-[10px] font-semibold h-9 rounded-lg"
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
            {submitting ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
