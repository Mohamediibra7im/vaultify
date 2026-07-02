"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { VaultifyLogo } from "@/components/vaultify-logo";
import { Shield, Users, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

interface PreviewData {
  workspace: { id: string; name: string };
  memberCount: number;
  role: string;
}

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { user, token: authToken, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .get<PreviewData>(`/invite/${token}`)
      .then(setPreview)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    if (!authToken || !token) return;
    setAccepting(true);
    try {
      const res = await api.post<{ workspaceId: string }>(
        `/invite/${token}/accept`,
        {},
        authToken,
      );
      setAccepted(true);
      toast.success("Joined workspace successfully!");
      router.push(`/dashboard/workspaces/${res.workspaceId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to accept invite");
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#090909] text-foreground font-sans relative overflow-hidden px-4 select-none">
      
      {/* Glow overlays */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-[0.02]" />
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-glow/30 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2">
            <VaultifyLogo className="h-7 w-7" />
            <span className="text-sm font-bold font-mono tracking-tight">Vaultify</span>
          </Link>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Cryptographic Access Invitation
          </p>
        </div>

        {/* Card Box */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-white/5 bg-zinc-950/40 backdrop-blur-xl p-6 sm:p-8 text-center font-mono space-y-6"
        >
          {loading || (authLoading && !preview) ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Verifying Link Key...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <XCircle className="h-8 w-8 text-destructive" />
              <h2 className="text-xs font-bold uppercase text-foreground">Expired Link</h2>
              <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed">{error}</p>
              <div className="h-2" />
              <Link href="/">
                <Button variant="outline" size="sm" className="h-8 text-[10px] border-white/10 hover:bg-white/5">
                  Go Home
                </Button>
              </Link>
            </div>
          ) : accepted ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="h-8 w-8 text-primary animate-pulse" />
              <h2 className="text-xs font-bold uppercase text-foreground">Authorization Verified</h2>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Adding keys for <span className="text-primary font-bold">{preview?.workspace.name}</span>
              </p>
              <div className="h-2" />
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : preview ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Workspace invitation</h2>
                  <p className="text-sm font-bold text-foreground truncate">{preview.workspace.name}</p>
                </div>
                <div className="flex items-center justify-center gap-3 text-[9px] text-zinc-500 pt-2 border-t border-white/[0.03]">
                  <span>{preview.memberCount} member{preview.memberCount !== 1 ? "s" : ""}</span>
                  <span className="h-1 w-1 bg-zinc-700 rounded-full" />
                  <span className="text-primary uppercase font-bold">{preview.role} Access</span>
                </div>
              </div>

              {user ? (
                <Button
                  className="w-full h-9 text-[10px] font-semibold rounded-lg"
                  onClick={handleAccept}
                  disabled={accepting}
                >
                  {accepting ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Decrypting Invitation...
                    </>
                  ) : (
                    "Accept & Synchronize Keys"
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Link href={`/login?redirect=/invite/${token}`}>
                    <Button className="w-full h-9 text-[10px] font-semibold rounded-lg">
                      Log In to Accept
                    </Button>
                  </Link>
                  <p className="text-[9px] text-muted-foreground leading-normal">
                    New user?{" "}
                    <Link
                      href={`/register?redirect=/invite/${token}`}
                      className="text-primary hover:underline font-bold"
                    >
                      Initialize credentials
                    </Link>
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
