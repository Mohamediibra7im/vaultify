"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VaultifyLogo } from "@/components/vaultify-logo";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Finalizing authorization handshake...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("No cryptographic token received. Aborting handshake...");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    localStorage.setItem("vaultify_token", token);
    window.location.href = "/dashboard";
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#090909] font-mono relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-[0.02]" />
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-emerald-glow/20 blur-[110px] pointer-events-none" />

      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-primary" />
          <VaultifyLogo className="h-6 w-6 absolute text-primary animate-pulse" />
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{status}</p>
      </div>
    </div>
  );
}

export default function GithubCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#090909] font-mono relative overflow-hidden">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-primary" />
              <VaultifyLogo className="h-6 w-6 absolute text-primary" />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Loading Handshake...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
