"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Shield, Lock, Award, Key, Terminal, Code, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "derivation",
    title: "1. Key Derivation",
    subtitle: "PBKDF2 / Salted Hash",
    desc: "A workspace master key is derived locally using PBKDF2. Your raw master passphrase never leaves your browser or CLI terminal.",
    code: `// Local Key Derivation
const salt = crypto.getRandomValues(new Uint8Array(16));
const keyMaterial = await crypto.subtle.importKey(
  "raw", 
  passphraseBytes, 
  "PBKDF2", 
  false, 
  ["deriveKey"]
);
const masterKey = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
  keyMaterial,
  { name: "AES-GCM", length: 256 },
  true,
  ["encrypt", "decrypt"]
);`
  },
  {
    id: "encryption",
    title: "2. AES-GCM Encrypt",
    subtitle: "Zero-Knowledge Storage",
    desc: "Secrets are encrypted client-side using AES-256-GCM. The Vaultify server only sees the ciphertext payload and authentication tags.",
    code: `// Client-Side Encryption
const iv = crypto.getRandomValues(new Uint8Array(12));
const encodedSecrets = new TextEncoder().encode(JSON.stringify(rawSecrets));
const ciphertext = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  masterKey,
  encodedSecrets
);
// Payload uploaded: { ciphertext, iv, salt }`
  },
  {
    id: "injection",
    title: "3. CLI Injection",
    subtitle: "Secure Environment Streams",
    desc: "Our CLI stream-injects decrypted secrets directly into your application process memory (process.env) at startup without writing config files to disk.",
    code: `# Run your app securely
$ vaultify run -- npm run dev

[vault] Derived workspace master key... OK
[vault] Fetched encrypted envelope... OK
[vault] Decrypted 14 secrets locally... OK
[vault] Injecting variables into subprocess... OK

> next dev
- Ready in 0.9s`
  }
];

export function Security() {
  const [activeStep, setActiveStep] = useState("derivation");
  
  const currentStepData = STEPS.find(s => s.id === activeStep) || STEPS[0];

  return (
    <section id="security" className="relative py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.45 }}
            className="flex justify-center"
          >
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 px-2.5 py-0.5 rounded-full mb-3">
              Security Protocol
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            Zero-Knowledge <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-300 bg-clip-text text-transparent">Cryptographic Engine</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-4 text-sm text-muted-foreground leading-relaxed md:text-base"
          >
            Vaultify handles secrets securely with client-side encryption. We store zero keys, protecting your credentials from external database breaches.
          </motion.p>
        </div>

        {/* Interactive Architecture Workspace Layout */}
        <div className="grid gap-8 lg:grid-cols-5 items-start">
          {/* Left Column: Selector Steps */}
          <div className="lg:col-span-2 space-y-3.5">
            {STEPS.map((step) => {
              const isActive = step.id === activeStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={cn(
                    "w-full text-left rounded-xl border p-4.5 transition-all duration-300 flex items-start gap-4 cursor-pointer",
                    isActive
                      ? "border-primary/30 bg-primary/5 shadow-[0_0_20px_rgba(16,185,129,0.03)]"
                      : "border-white/5 bg-zinc-950/20 hover:border-white/10 hover:bg-zinc-950/30"
                  )}
                >
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border shrink-0 transition-colors duration-300",
                    isActive 
                      ? "bg-primary/10 border-primary/35 text-primary" 
                      : "bg-white/5 border-white/5 text-zinc-400"
                  )}>
                    {step.id === "derivation" && <Key className="h-4.5 w-4.5" />}
                    {step.id === "encryption" && <Cpu className="h-4.5 w-4.5" />}
                    {step.id === "injection" && <Terminal className="h-4.5 w-4.5" />}
                  </div>
                  <div className="space-y-1">
                    <h3 className={cn(
                      "text-xs font-bold font-mono tracking-tight",
                      isActive ? "text-foreground" : "text-zinc-300"
                    )}>
                      {step.title}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{step.subtitle}</p>
                    <p className="text-[10.5px] text-muted-foreground leading-normal mt-1">{step.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Code/Terminal Visualizer */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-white/5 bg-black/40 overflow-hidden shadow-2xl">
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/60 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500/80" />
                  <div className="h-2 w-2 rounded-full bg-yellow-500/80" />
                  <div className="h-2 w-2 rounded-full bg-green-500/80" />
                  <span className="text-[9px] font-mono text-zinc-500 ml-2 select-none uppercase tracking-wider flex items-center gap-1">
                    <Code className="h-3 w-3 text-primary" /> {currentStepData.id === "injection" ? "cli.sh" : "crypto.js"}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-primary border border-primary/20 bg-primary/5 px-2 py-0.2 rounded font-bold uppercase tracking-wider">
                  Zero Trust active
                </span>
              </div>
              
              {/* Window Code Content */}
              <div className="p-5 font-mono text-[10.5px] text-left leading-relaxed text-zinc-300 overflow-x-auto bg-zinc-950/20 max-h-[300px] min-h-[250px]">
                <pre className="whitespace-pre">
                  <code className="text-zinc-300 select-all block">
                    {currentStepData.code}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Security Compliance Trust Row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-150px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 border-t border-white/5 pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/80"
        >
          <div className="flex flex-col items-center gap-1">
            <Lock className="h-4 w-4 text-primary/70 mb-1" />
            <span>256-bit AES-GCM</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Shield className="h-4 w-4 text-primary/70 mb-1" />
            <span>SOC2 Compliance Ready</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Award className="h-4 w-4 text-primary/70 mb-1" />
            <span>ISO-27001 Audited</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Key className="h-4 w-4 text-primary/70 mb-1" />
            <span>Zero-Knowledge Server</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
