"use client";

import { type FormEvent, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { VaultifyLogo } from "@/components/vaultify-logo";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Lock, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Terminal, 
  Activity, 
  Server, 
  ArrowRight, 
  ArrowLeft, 
  Key, 
  Database,
  Fingerprint,
  RefreshCw,
  Globe
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface AuthFormClientProps {
  mode: "login" | "register";
}

export function AuthFormClient({ mode }: AuthFormClientProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const { login, register } = useAuth();
  
  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [entropyToken, setEntropyToken] = useState("0x3f9A...8C2B");

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Dynamic entropy generation
  useEffect(() => {
    const interval = setInterval(() => {
      const chars = "0123456789ABCDEF";
      let hex = "0x";
      for (let i = 0; i < 4; i++) hex += chars[Math.floor(Math.random() * 16)];
      hex += "...";
      for (let i = 0; i < 4; i++) hex += chars[Math.floor(Math.random() * 16)];
      setEntropyToken(hex);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(emailRef.current!.value, passwordRef.current!.value);
      } else {
        await register(
          nameRef.current!.value,
          emailRef.current!.value,
          passwordRef.current!.value,
        );
      }
      toast.success(isLogin ? "Welcome back!" : "Account created!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#05080b] text-foreground font-sans selection:bg-primary/20 select-none">
      
      {/* ── Left Side: Interactive Security Console & Operations (60% Width) ── */}
      <section className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 overflow-hidden border-r border-white/[0.03]">
        
        {/* Soft Background Aurora Lights */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/8 via-cyan-500/3 to-transparent blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-primary/3 via-transparent to-transparent blur-[100px]" />

        {/* Top Header Branding */}
        <div className="relative flex items-center gap-3 z-10">
          <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 border border-primary/20 text-primary shadow-[0_0_15px_rgba(5,243,162,0.15)]">
            <VaultifyLogo className="size-5.5" />
          </div>
          <span className="font-mono text-xs font-bold tracking-[0.25em] text-text-primary uppercase">
            Vaultify
          </span>
        </div>

        {/* Interactive Holographic Simulation Deck */}
        <div className="relative my-auto space-y-10 z-10 max-w-xl text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-primary">
              <Fingerprint className="size-3.5 animate-pulse" />
              Zero-Knowledge Encryption
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-text-primary leading-tight font-mono">
              SECURELY SYNC & <br />
              <span className="bg-gradient-to-r from-primary via-teal-400 to-cyan-400 bg-clip-text text-transparent">MANAGE TEAM SECRETS</span>
            </h1>
            
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Encrypt variables and credentials client-side. Keep your development, staging, and production environments synced safely without exposing private keys.
            </p>
          </div>

          {/* Symmetrical Security Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Encryption Key simulator */}
            <div className="rounded-2xl border border-white/[0.04] bg-surface-1/40 p-4.5 space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] uppercase text-text-muted">SESSION SECURITY</span>
                <RefreshCw className="size-2.5 text-primary animate-spin [animation-duration:10s]" />
              </div>
              <div className="font-mono text-sm font-bold text-primary select-all">
                {entropyToken}
              </div>
              <p className="font-mono text-[8px] text-text-muted uppercase">
                SPEC: AES-GCM-256
              </p>
            </div>

            {/* Ingress status simulator */}
            <div className="rounded-2xl border border-white/[0.04] bg-surface-1/40 p-4.5 space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] uppercase text-text-muted">NETWORK STATUS</span>
                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="font-mono text-sm font-bold text-text-primary">
                CONNECTED
              </div>
              <p className="font-mono text-[8px] text-text-muted uppercase">
                SECURED VIA TLS 1.3
              </p>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="relative rounded-2xl border border-white/[0.03] bg-zinc-950/20 p-5 backdrop-blur-sm">
            <p className="text-[12px] italic text-text-secondary leading-relaxed">
              "We migrated all production secrets from environment files to Vaultify. It saved us hundreds of DevOps hours while keeping audit logs completely airtight."
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="size-6 rounded-full bg-gradient-to-r from-primary to-cyan-500" />
              <div className="font-mono text-[9px] uppercase">
                <span className="font-bold text-text-primary block">Alex Rivera</span>
                <span className="text-text-muted">Principal Architect, Acme Corp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Telemetry */}
        <div className="relative border-t border-white/[0.03] pt-6 z-10 flex items-center justify-between text-[9px] font-mono text-text-muted uppercase">
          <div className="flex items-center gap-5">
            <span>SOC-2 COMPLIANT</span>
            <span>·</span>
            <span>HIPAA READY</span>
            <span>·</span>
            <span>ZERO-KNOWLEDGE AUTH</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="size-3 text-primary" />
            <span>SYNC ACTIVE</span>
          </div>
        </div>
      </section>

      {/* ── Right Side: Authentication Panel (40% Width) ── */}
      <section className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden bg-surface-1/10">
        
        {/* Mobile Background Ambient Lights */}
        <div className="lg:hidden pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[80px]" />

        {/* Back Link */}
        <div className="flex justify-end relative z-10">
          <Link href="/" className="font-mono text-[9px] text-text-muted hover:text-text-primary flex items-center gap-1.5 transition duration-200">
            <ArrowLeft className="size-3.5" /> BACK TO HOME
          </Link>
        </div>

        {/* Centered Auth Card */}
        <div className="my-auto w-full max-w-sm mx-auto relative z-10 space-y-8 text-left">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight font-mono text-text-primary uppercase">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>
            <p className="text-[11.5px] text-text-secondary leading-relaxed font-mono">
              {isLogin
                ? "Sign in to access your secure credentials and vaults."
                : "Create an account to start managing your team's secrets."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[9px] font-mono uppercase tracking-wider text-text-muted">Name</Label>
                <Input
                  ref={nameRef}
                  id="name"
                  type="text"
                  placeholder="e.g. John Doe"
                  autoComplete="name"
                  disabled={isLoading}
                  required
                  className="h-9.5 bg-surface-1/40 border-white/[0.04] hover:border-white/10 focus-visible:ring-primary/20 text-xs font-mono rounded-xl focus:border-primary/45 transition-colors placeholder:text-text-muted"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[9px] font-mono uppercase tracking-wider text-text-muted">Email Address</Label>
              <Input
                ref={emailRef}
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
                required
                className="h-9.5 bg-surface-1/40 border-white/[0.04] hover:border-white/10 focus-visible:ring-primary/20 text-xs font-mono rounded-xl focus:border-primary/45 transition-colors placeholder:text-text-muted"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-[9px] font-mono uppercase tracking-wider text-text-muted">Password</Label>
                {isLogin && (
                  <Link href="#" className="text-[8px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline transition">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  ref={passwordRef}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-9.5 bg-surface-1/40 border-white/[0.04] hover:border-white/10 focus-visible:ring-primary/20 text-xs font-mono pr-10 rounded-xl focus:border-primary/45 transition-colors placeholder:text-text-muted"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  disabled={isLoading}
                  required
                  minLength={isLogin ? undefined : 8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-9.5 font-mono text-xs font-bold rounded-xl shadow-lg shadow-primary/5 hover:shadow-primary/10 transition-all duration-200 group bg-primary hover:bg-primary/95 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    {isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          <div className="flex items-center gap-2.5 py-1">
            <Separator className="flex-1 bg-white/[0.03]" />
            <span className="text-[7.5px] font-mono uppercase text-text-muted">
              or continue with
            </span>
            <Separator className="flex-1 bg-white/[0.03]" />
          </div>

          {/* GitHub Validation */}
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/github`}
            className="inline-flex w-full h-9.5 items-center justify-center gap-2 rounded-xl border border-white/[0.04] bg-surface-1/40 px-4 text-xs font-mono text-text-primary hover:bg-white/[0.02] hover:border-white/10 transition-all duration-200 disabled:pointer-events-none disabled:opacity-50"
          >
            <svg
              className="size-4 text-primary"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>Continue with GitHub</span>
          </a>

          <p className="text-[10px] text-text-muted font-mono">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-primary hover:underline font-bold transition"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-bold transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </p>
        </div>

        {/* Compliance Footer Row for Mobile */}
        <div className="lg:hidden border-t border-white/[0.03] pt-4 text-[7.5px] font-mono text-text-muted uppercase text-center">
          SOC-2 COMPLIANT · HIPAA READY · ZERO-KNOWLEDGE
        </div>
      </section>

    </div>
  );
}
