"use client";

import Link from "next/link";
import { VaultifyLogo } from "@/components/vaultify-logo";
import { Button } from "@/components/ui/button";
import { Terminal, ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#090909] text-foreground font-mono relative overflow-hidden px-4 select-none">
      
      {/* Visual background overlays */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-[0.02]" />
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-glow/20 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8 text-center">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2">
          <Link href="/" className="flex items-center gap-2">
            <VaultifyLogo className="h-7 w-7 animate-pulse" />
            <span className="text-sm font-bold tracking-tight">Vaultify</span>
          </Link>
          <span className="text-[9px] uppercase tracking-widest text-destructive font-bold bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded">
            Route Resolution Failure
          </span>
        </div>

        {/* 404 Neon Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-white/5 bg-zinc-950/40 backdrop-blur-xl p-6 sm:p-8 space-y-6"
        >
          <div className="relative flex justify-center">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-400 select-none tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.06)]">
              404
            </h1>
          </div>

          <div className="bg-black/50 p-4 rounded-lg border border-white/5 text-[9px] text-left space-y-1.5 leading-relaxed text-zinc-400">
            <div className="flex items-center gap-1.5 text-destructive font-bold uppercase">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              <span>SECURITY EXCEPTION IN TRACE</span>
            </div>
            <div>[NODE] resolving client route trace...</div>
            <div className="text-zinc-600">[FAIL] unable to resolve path context</div>
            <div className="text-zinc-600">[STATUS] code: PAGE_NOT_FOUND</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full text-[10px] font-semibold h-9 border-white/10 hover:bg-white/5 gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                Go Home
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full text-[10px] font-semibold h-9 gap-1.5">
                <Terminal className="h-3.5 w-3.5" />
                Console
              </Button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
