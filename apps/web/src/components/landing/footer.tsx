"use client";

import { useState } from "react";
import Link from "next/link";
import { VaultifyLogo } from "@/components/vaultify-logo";
import { Terminal, Copy, Check, ExternalLink } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Security & Protocol", href: "/security" },
      { label: "Platform Changelog", href: "/changelog" },
      { label: "Documentation", href: "/docs" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security Scope", href: "/security" },
      { label: "GDPR Compliance", href: "/gdpr" },
    ],
  },
];

export function Footer() {
  const [copied, setCopied] = useState(false);

  const copyCLICommand = () => {
    navigator.clipboard.writeText("npm i -g @vaultify/cli");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="relative mt-24 border-t border-white/5 bg-zinc-950/20 pt-16 pb-12 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-6xl px-6">
        
        {/* Main Unified 12-Column Grid */}
        <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-12 items-start">
          
          {/* Column 1: Brand & CLI widget (spans 4 cols on desktop) */}
          <div className="col-span-2 md:col-span-3 lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <VaultifyLogo className="h-8 w-8" />
              <span className="text-sm font-semibold tracking-tight font-mono text-foreground uppercase">Vaultify</span>
            </Link>
            <p className="text-xs leading-relaxed text-muted-foreground max-w-sm">
              Stop sharing plaintext environment keys. Vaultify derives, seals, and streams your credentials directly to child processes using zero-knowledge client-side decryption.
            </p>
            
            {/* Interactive CLI Install Box */}
            <div className="flex max-w-xs items-center justify-between rounded-lg border border-white/5 bg-black/60 p-2 pl-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-[9.5px] text-zinc-300 select-all">npm i -g @vaultify/cli</span>
              </div>
              <button 
                onClick={copyCLICommand}
                className="h-6 w-6 rounded bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer border border-white/5"
              >
                {copied ? <Check className="h-3 w-3 text-primary animate-scale" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Columns 2, 3, 4: Navigation Links (2 cols each) */}
          {footerLinks.map((group) => (
            <div key={group.title} className="col-span-1 md:col-span-1 lg:col-span-2 space-y-3">
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-l-2 border-primary/40 pl-2">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 group font-mono"
                    >
                      <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary font-bold">#</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 5: Telemetry System Status (2 cols) */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-3">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-l-2 border-primary/40 pl-2">
              Telemetry
            </h4>
            <div className="rounded-lg border border-white/5 bg-zinc-950/40 p-3.5 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">API Status</span>
                <span className="flex items-center gap-1 font-mono text-[7px] bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">
                  <span className="h-1 w-1 rounded-full bg-primary animate-pulse" /> Live
                </span>
              </div>
              <div className="space-y-1.5 text-[9px] font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span>Latency</span>
                  <span className="text-zinc-300">~14ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Encryption</span>
                  <span className="text-zinc-300">AES-256</span>
                </div>
                <div className="flex justify-between">
                  <span>Audit Logs</span>
                  <span className="text-primary font-bold">Secure</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar: Copyright & Author attribution */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-[10px] font-mono text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Vaultify.</span>
            <div className="h-3 w-[1px] bg-white/10 hidden sm:block" />
            <span className="flex items-center gap-1 select-none">
              Crafted by 
              <a
                href="https://mohamediibrahim.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-bold underline transition-colors inline-flex items-center gap-0.5"
              >
                Mohamed Ibrahim <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
