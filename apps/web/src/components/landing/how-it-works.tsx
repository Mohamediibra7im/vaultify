"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  FolderKanban, 
  Layers, 
  KeyRound, 
  ChevronRight,
  ShieldCheck,
  Check,
  Plus,
  RefreshCw,
  ExternalLink,
  Laptop,
  Globe,
  Settings,
  Lock,
  Unlock
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Users,
    title: "Create Workspace",
    description: "Set up your team workspace in seconds. Invite members and define granular RBAC roles — admin, developer, or viewer.",
  },
  {
    icon: FolderKanban,
    title: "Add Projects & Secrets",
    description: "Link your microservices and specify credentials. Organize by configuration stacks, projects, or API profiles.",
  },
  {
    icon: Layers,
    title: "Isolate Scopes",
    description: "Scope credentials separately for dev, staging, and production. Production variables stay sealed and isolated.",
  },
  {
    icon: KeyRound,
    title: "Auto-Sync Anywhere",
    description: "Sync variables to Vercel, AWS, or local environments automatically. Zero manual typing, zero exposed credentials.",
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle effect
  useEffect(() => {
    if (paused) return;
    
    timerRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setPaused(true); // Pause auto-cycling upon manual user click
  };

  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-180px" }}
            transition={{ duration: 0.45 }}
            className="flex justify-center"
          >
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 px-2.5 py-0.5 rounded-full mb-3">
              Developer Workflow
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-180px" }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            Symmetric flow, <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">simple deployment</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-180px" }}
            transition={{ duration: 0.45, delay: 0.07 }}
            className="mt-4 text-sm text-muted-foreground leading-relaxed md:text-base"
          >
            Vaultify integrates into your team's active processes. Set up a secure workspace, configure variables, and run builds.
          </motion.p>
        </div>

        {/* Double Column Showcase */}
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Interactive Steps List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative pl-6 space-y-4"
          >
            {/* Timeline connector line */}
            <div className="absolute left-2.5 top-3 bottom-3 w-[1px] bg-white/5" />
            
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              
              return (
                <div
                  key={step.title}
                  onClick={() => handleStepClick(idx)}
                  className={cn(
                    "group relative cursor-pointer rounded-xl border p-4 transition-all duration-300 text-left",
                    isActive
                      ? "bg-white/[0.03] border-primary/20 shadow-[0_0_20px_oklch(0.596_0.145_163.2/0.05)]"
                      : "bg-transparent border-transparent hover:bg-white/[0.01] hover:border-white/5"
                  )}
                >
                  {/* Active Indicator Timeline Dot */}
                  <div className={cn(
                    "absolute -left-[20px] top-7 -translate-y-1/2 h-2 w-2 rounded-full border transition-all duration-300 z-10",
                    isActive 
                      ? "bg-primary border-primary shadow-[0_0_8px_var(--primary)] scale-110" 
                      : "bg-zinc-800 border-zinc-700"
                  )} />

                  {/* Active Slide Timing Ring */}
                  {isActive && !paused && (
                    <div className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                  )}

                  <div className="flex gap-4">
                    {/* Circle Icon Container */}
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                      isActive
                        ? "bg-primary border-primary text-primary-foreground shadow-[0_0_12px_oklch(0.596_0.145_163.2/0.3)]"
                        : "bg-white/5 border-white/10 text-muted-foreground group-hover:border-white/20 group-hover:text-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className={cn(
                        "text-sm font-semibold tracking-tight transition-colors",
                        isActive ? "text-foreground font-bold" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Right Column: Live Mockup Interface corresponding to activeStep */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="glass relative min-h-[320px] rounded-2xl border border-white/10 bg-black/40 p-5 shadow-2xl overflow-hidden flex flex-col justify-between">
              
              {/* Mockup Frame Bar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500/40" />
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500/40" />
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500/40" />
                  <span className="ml-2 font-mono text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                    {activeStep === 0 && "Step 1: Workspace Creator"}
                    {activeStep === 1 && "Step 2: microservices vault"}
                    {activeStep === 2 && "Step 3: environment isolation"}
                    {activeStep === 3 && "Step 4: push & sync targets"}
                  </span>
                </div>
                <span className="font-mono text-[8px] bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.2 rounded uppercase font-bold">
                  Preview
                </span>
              </div>

              {/* Dynamic Screens */}
              <div className="flex-1 flex items-center justify-center py-4">
                <AnimatePresence mode="wait">
                  
                  {/* Step 1: Workspace */}
                  {activeStep === 0 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="w-full max-w-sm rounded-xl border border-white/5 bg-zinc-950/40 p-4 text-left font-mono text-[10px] space-y-3"
                    >
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider text-muted-foreground mb-1">Workspace ID</label>
                        <div className="rounded border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-primary font-bold">
                          acme-corp-vault
                        </div>
                      </div>

                      <div>
                        <label className="block text-[8px] uppercase tracking-wider text-muted-foreground mb-1">Invite Members</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value="developer@acme.com"
                            className="flex-1 rounded border border-white/5 bg-black/40 px-2 py-1 text-muted-foreground outline-none text-[9px]"
                          />
                          <button className="rounded bg-primary px-3 py-1 font-semibold text-primary-foreground flex items-center gap-1 text-[9px]">
                            <Plus className="h-3 w-3" /> Invite
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <div className="flex justify-between items-center text-[9px]">
                          <div className="flex items-center gap-1.5">
                            <div className="h-4 w-4 rounded-full bg-primary/10 border border-primary/20 text-[7px] text-primary flex items-center justify-center font-bold">AL</div>
                            <span className="text-foreground">alice@acme.com</span>
                          </div>
                          <span className="text-primary font-semibold">Owner</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <div className="h-4 w-4 rounded-full bg-white/5 border border-white/10 text-[7px] text-muted-foreground flex items-center justify-center font-bold">BO</div>
                            <span>bob@acme.com</span>
                          </div>
                          <span>Admin</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Projects & Secrets */}
                  {activeStep === 1 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="w-full max-w-sm rounded-xl border border-white/5 bg-zinc-950/40 p-4 text-left font-mono text-[10px] space-y-3"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-foreground font-bold">Project: api-service</span>
                        <span className="text-muted-foreground">12 secrets active</span>
                      </div>
                      
                      <div className="space-y-2">
                        {[
                          { name: "CLOUDINARY_API_KEY", status: "secured", val: "•••••••••••" },
                          { name: "AWS_SECRET_ACCESS_KEY", status: "secured", val: "•••••••••••" },
                          { name: "POSTGRES_DB", status: "secured", val: "•••••••••••" },
                        ].map((sec) => (
                          <div key={sec.name} className="flex justify-between items-center rounded border border-white/5 bg-black/25 p-2">
                            <div>
                              <div className="text-foreground font-semibold text-[9px]">{sec.name}</div>
                              <div className="text-muted-foreground text-[8px] mt-0.5">{sec.val}</div>
                            </div>
                            <span className="text-[7px] bg-primary/10 border border-primary/20 text-primary px-1.5 rounded flex items-center gap-0.5 font-bold uppercase">
                              <ShieldCheck className="h-2.5 w-2.5" /> {sec.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Isolate Scopes */}
                  {activeStep === 2 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="w-full max-w-sm rounded-xl border border-white/5 bg-zinc-950/40 p-4 text-left font-mono text-[10px] space-y-3"
                    >
                      <label className="block text-[8px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Sealed Scopes</label>
                      <div className="space-y-2">
                        {[
                          { name: "Development Scope", desc: "Decrypted on developer workstations.", active: true, icon: Unlock },
                          { name: "Staging Scope", desc: "Automated test runner sync.", active: true, icon: Unlock },
                          { name: "Production Scope", desc: "Zero access granted to team devs.", active: false, badge: "Sealed", icon: Lock },
                        ].map((scope) => {
                          const IconComp = scope.icon;
                          return (
                            <div key={scope.name} className={cn(
                              "rounded border p-2.5 flex justify-between items-start transition-all",
                              scope.active 
                                ? "bg-black/25 border-white/5 text-muted-foreground" 
                                : "bg-rose-500/5 border-rose-500/10 text-rose-300"
                            )}>
                              <div className="flex gap-2">
                                <IconComp className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", scope.active ? "text-primary/75" : "text-rose-400")} />
                                <div>
                                  <div className="font-semibold text-foreground text-[9px]">{scope.name}</div>
                                  <div className="text-[8px] mt-0.5 text-muted-foreground">{scope.desc}</div>
                                </div>
                              </div>
                              <span className={cn(
                                "text-[7px] px-1 rounded font-bold uppercase border",
                                scope.active 
                                  ? "bg-primary/10 border-primary/20 text-primary" 
                                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                              )}>
                                {scope.badge || "Open"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Auto-Sync */}
                  {activeStep === 3 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="w-full max-w-sm rounded-xl border border-white/5 bg-zinc-950/40 p-4 text-left font-mono text-[10px] space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <span className="text-foreground font-bold">Auto-Sync Integration Nodes</span>
                        <span className="text-primary flex items-center gap-1 text-[9px] font-bold">
                          <Check className="h-3 w-3" /> Sync Active
                        </span>
                      </div>

                      <div className="space-y-2">
                        {[
                          { node: "Vercel Sync Hook", time: "2s ago", path: "acme-corp-frontend" },
                          { node: "AWS Parameter Store", time: "12s ago", path: "us-east-1/production" },
                          { node: "Docker Daemon CLI", time: "Just now", path: "localhost:2375" },
                        ].map((sync) => (
                          <div key={sync.node} className="flex justify-between items-center rounded border border-white/5 bg-black/25 p-2">
                            <div>
                              <div className="text-foreground font-semibold text-[9px]">{sync.node}</div>
                              <div className="text-muted-foreground text-[8px] mt-0.5">{sync.path}</div>
                            </div>
                            <span className="text-[7px] text-muted-foreground font-semibold flex items-center gap-1">
                              <RefreshCw className="h-2.5 w-2.5 text-primary animate-spin" /> {sync.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mockup Footer Info */}
              <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between font-mono text-[8px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Laptop className="h-2.5 w-2.5 text-primary" /> Active workspace session
                </span>
                <span>SECURE SSL 256-bit encryption</span>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
