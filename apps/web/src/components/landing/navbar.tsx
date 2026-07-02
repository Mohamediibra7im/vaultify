"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { VaultifyLogo } from "@/components/vaultify-logo";
import { Button } from "@/components/ui/button";
import { Menu, X, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#security", label: "Security Protocol" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [ping, setPing] = useState(12);

  // Simulate subtle real-time database server latency fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setPing((prev) => {
        const diff = Math.floor(Math.random() * 5) - 2;
        const next = prev + diff;
        return next < 8 ? 8 : next > 18 ? 18 : next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
      scrolled
        ? "border-white/5 bg-zinc-950/75 backdrop-blur-md py-3 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
        : "border-transparent bg-transparent py-4"
    )}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        {/* Logo & Node Telemetry */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="transition-transform group-hover:rotate-6 duration-300">
              <VaultifyLogo className="h-8 w-8" />
            </div>
            <span className="text-sm font-bold tracking-tight font-mono text-foreground uppercase">Vaultify</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-4 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-primary animate-pulse" />
              <span>us-east: <span className="text-primary font-bold">{ping}ms</span></span>
            </div>
            <span className="text-zinc-700">&bull;</span>
            <span>node: aes-256</span>
          </div>
        </div>

        {/* Desktop Navigation with Neon Underline */}
        <nav className="hidden md:flex items-center gap-2 h-8">
          {navLinks.map((link, idx) => (
            <div
              key={link.href}
              className="relative h-full flex items-center"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <Link
                href={link.href}
                className={cn(
                  "relative z-10 block text-xs font-mono font-medium px-4 py-1 transition-colors duration-200",
                  hoveredIdx === idx ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
              {hoveredIdx === idx && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </div>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs hover:bg-white/5 hover:text-foreground text-muted-foreground transition cursor-pointer"
                onClick={() => logout()}
              >
                Sign Out
              </Button>
              <Button
                size="sm"
                className="rounded border border-primary/20 bg-zinc-950 hover:bg-primary/5 text-primary font-mono text-xs px-4 shadow-[0_0_12px_rgba(16,185,129,0.05)] hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-primary/50 transition-all duration-200"
                asChild
              >
                <Link href="/dashboard">Console</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="font-mono text-xs hover:bg-white/5 hover:text-foreground text-muted-foreground transition" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" className="rounded border border-primary/20 bg-zinc-950 hover:bg-primary/5 text-primary font-mono text-xs px-4 shadow-[0_0_12px_rgba(16,185,129,0.05)] hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-primary/50 transition-all duration-200" asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition rounded-lg hover:bg-white/5"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-white/5 bg-zinc-950/95 backdrop-blur-xl md:hidden w-full overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col gap-1.5 px-6 py-5 font-mono text-xs">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2.5 border-white/5" />
              <div className="flex items-center justify-between text-[8px] text-zinc-500 px-3 uppercase tracking-wider mb-2">
                <span>Latency: {ping}ms</span>
                <span>Mode: aes-256</span>
              </div>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    Console
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="rounded-lg px-3 py-2 text-left text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 inline-flex items-center justify-center rounded border border-primary/35 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
