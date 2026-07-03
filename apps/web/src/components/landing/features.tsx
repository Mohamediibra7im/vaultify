"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Users,
  RefreshCw,
  ScrollText,
  Terminal,
  Check,
  Sliders,
  ChevronRight,
  UserCheck,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Live Sync Visualizer Redesign (Sleek Network Diagram)
function LiveSyncVisualizer() {
  return (
    <div className="relative h-32 w-full rounded-xl bg-zinc-950/40 border border-white/5 overflow-hidden flex items-center justify-between px-6 py-4">
      {/* Subtle grid backdrop */}
      <div className="absolute inset-0 bg-grid bg-[size:12px_12px] opacity-[0.07]" />
      
      {/* Central Core Node */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center h-12 w-12 rounded-full border border-primary/30 bg-black shadow-[0_0_15px_oklch(0.596_0.145_163.2/0.2)]">
        <Lock className="h-4.5 w-4.5 text-primary animate-pulse" />
        <span className="text-[6px] font-mono mt-0.5 text-primary/75 uppercase tracking-wider">Vault</span>
      </div>

      {/* SVG Connecting paths */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none">
        {/* Left path */}
        <path d="M 40,64 L 160,64" stroke="oklch(0.596 0.145 163.2 / 0.15)" strokeWidth="1" strokeDasharray="3 3" />
        {/* Right path */}
        <path d="M 200,64 L 320,64" stroke="oklch(0.596 0.145 163.2 / 0.15)" strokeWidth="1" strokeDasharray="3 3" />
        
        {/* Animated pulses */}
        <circle r="2" fill="var(--primary)">
          <animateMotion dur="2.2s" repeatCount="indefinite" path="M 40,64 L 160,64" />
        </circle>
        <circle r="2" fill="var(--primary)">
          <animateMotion dur="2.2s" repeatCount="indefinite" path="M 160,64 L 320,64" />
        </circle>
      </svg>

      {/* Left Node: CLI Developer */}
      <div className="flex flex-col items-center z-10">
        <div className="h-9 w-9 rounded-lg border border-white/10 bg-zinc-900/80 flex items-center justify-center shadow-lg">
          <Terminal className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-[8px] font-mono mt-1.5 text-muted-foreground font-semibold">Local CLI</span>
      </div>

      {/* Right Node: Production Host */}
      <div className="flex flex-col items-center z-10">
        <div className="h-9 w-9 rounded-lg border border-rose-500/20 bg-rose-950/20 flex items-center justify-center shadow-lg">
          <Server className="h-4 w-4 text-rose-400" />
        </div>
        <span className="text-[8px] font-mono mt-1.5 text-rose-400 font-semibold">Production</span>
      </div>
    </div>
  );
}

// 2. Interactive Audit Logs Redesign (Timeline Feed)
interface AuditEvent {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  status: "success" | "warning";
}

const INITIAL_EVENTS: AuditEvent[] = [
  { id: "1", time: "10:12:02", actor: "alice@acme.com", action: "decrypted", target: "STRIPE_KEY", status: "success" },
  { id: "2", time: "10:11:45", actor: "api-service", action: "fetched", target: "DATABASE_URL", status: "success" },
  { id: "3", time: "10:09:12", actor: "bob@acme.com", action: "rotated", target: "JWT_SECRET", status: "success" },
  { id: "4", time: "10:07:30", actor: "system-bot", action: "failed auth", target: "production scope", status: "warning" }
];

const NEW_MOCK_EVENTS: Omit<AuditEvent, "id">[] = [
  { time: "10:13:45", actor: "actions-ci", action: "validated", target: "github-deployment", status: "success" },
  { time: "10:14:10", actor: "dev-local", action: "pulled", target: "development scope", status: "success" },
  { time: "10:15:02", actor: "unknown-ip", action: "blocked access", target: "ADMIN_CONSOLE", status: "warning" },
  { time: "10:16:11", actor: "bob@acme.com", action: "deleted", target: "OLD_MONGO_URL", status: "success" }
];

function InteractiveAuditLogs() {
  const [events, setEvents] = useState<AuditEvent[]>(INITIAL_EVENTS);
  const eventCounter = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const newEventBase = NEW_MOCK_EVENTS[eventCounter.current % NEW_MOCK_EVENTS.length];
      const newEvent: AuditEvent = {
        ...newEventBase,
        id: Math.random().toString(),
      };
      setEvents((prev) => [newEvent, ...prev.slice(0, 3)]);
      eventCounter.current += 1;
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono text-[9px] w-full text-left relative pl-4 mt-2">
      {/* Vertical connection line */}
      <div className="absolute left-1 top-2 bottom-2 w-[1px] bg-white/5" />

      {/* Fixed-height container — prevents layout shifts when entries animate in/out */}
      <div className="h-[112px] overflow-hidden relative">
        <div className="space-y-2.5">
          <AnimatePresence initial={false} mode="popLayout">
          {events.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -16, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 12, filter: "blur(2px)" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-between py-1 overflow-hidden"
            >
              {/* Scan-line flash on newest entry */}
              {i === 0 && (
                <motion.div
                  initial={{ scaleX: 0, opacity: 0.6 }}
                  animate={{ scaleX: 1, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 bg-primary/10 origin-left rounded pointer-events-none"
                />
              )}

              {/* Timeline Indicator Node */}
              <div className={cn(
                "absolute -left-[15px] h-1.5 w-1.5 rounded-full border transition-all",
                ev.status === "success"
                  ? "bg-primary border-primary shadow-[0_0_5px_var(--primary)]"
                  : "bg-rose-500 border-rose-500 shadow-[0_0_5px_oklch(0.577_0.245_27.3)]"
              )} />

              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-muted-foreground/50 shrink-0">{ev.time}</span>
                <span className="font-semibold text-foreground truncate max-w-[80px]">{ev.actor}</span>
                <span className="text-muted-foreground shrink-0">{ev.action}</span>
                <span className="underline decoration-dotted text-zinc-300 truncate">{ev.target}</span>
              </div>

              <div className="shrink-0 ml-1.5 flex items-center gap-1">
                {i === 0 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                    className="text-[6px] font-bold text-primary bg-primary/10 border border-primary/30 rounded px-1 uppercase tracking-widest"
                  >
                    new
                  </motion.span>
                )}
                {ev.status === "warning" ? (
                  <span className="text-[7px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded px-1 uppercase">Blocked</span>
                ) : (
                  <span className="text-[7px] font-bold text-primary bg-primary/10 border border-primary/20 rounded px-1 uppercase">Ok</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// 3. Auto-typing CLI Terminal Redesign (Window Code Pane)
function AutoTypingTerminal() {
  const [terminalText, setTerminalText] = useState("");
  const [status, setStatus] = useState("idle"); // idle, typing, loading, success
  const fullCommand = "vaultify pull --scope production --out .env";

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const runTerminalFlow = () => {
      setStatus("typing");
      let currentLength = 0;
      
      const type = () => {
        if (currentLength <= fullCommand.length) {
          setTerminalText(fullCommand.substring(0, currentLength));
          currentLength++;
          timer = setTimeout(type, 60);
        } else {
          setStatus("loading");
          timer = setTimeout(() => {
            setStatus("success");
            timer = setTimeout(() => {
              setTerminalText("");
              setStatus("idle");
            }, 6000);
          }, 1000);
        }
      };
      
      type();
    };

    if (status === "idle") {
      timer = setTimeout(runTerminalFlow, 1000);
    }

    return () => clearTimeout(timer);
  }, [status]);

  return (
    <div className="rounded-xl border border-white/5 bg-zinc-950/60 font-mono text-[9px] text-left relative overflow-hidden h-[130px] flex flex-col shadow-inner">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-white/5 bg-black/60 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-500/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-green-500/40" />
          <span className="ml-2 text-[8px] text-muted-foreground uppercase font-bold tracking-wider">vaultify.sh</span>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <span className="text-primary font-bold">~</span>
            <span className="text-foreground">{terminalText}</span>
            {status === "typing" && <span className="w-1 h-2.5 bg-primary animate-pulse inline-block" />}
          </div>

          {status === "loading" && (
            <div className="text-muted-foreground/60 space-y-1">
              <div className="flex items-center gap-1">
                <RefreshCw className="h-2.5 w-2.5 text-primary shrink-0 animate-spin" />
                <span>Decrypting AES credentials local context...</span>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="text-primary space-y-0.5">
              <div className="flex items-center gap-1">
                <Check className="h-2.5 w-2.5 text-primary shrink-0" />
                <span>Successfully injected 12 active secrets</span>
              </div>
              <div className="text-muted-foreground text-[8px] pl-3.5">
                ↳ Written securely to .env file [local]
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 4. Interactive Secret Promoter Redesign (Environment Scopes)
const ENV_STEPS = ["development", "staging", "production"];
const MOCK_SECRETS_PROMOTER = [
  { name: "STRIPE_SECRET_KEY", val: "••••••••••••••••••••••••", dev: true, stage: true, prod: false },
  { name: "SUPABASE_SERVICE_ROLE", val: "eyJhbGc...", dev: true, stage: false, prod: false },
  { name: "SENDGRID_API_KEY", val: "SG.yH92...", dev: true, stage: true, prod: true }
];

function SecretEnvironmentPromoter() {
  const [secrets, setSecrets] = useState(MOCK_SECRETS_PROMOTER);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [promoting, setPromoting] = useState(false);

  const handlePromote = () => {
    if (promoting) return;
    const currentSecret = secrets[selectedIdx];
    
    let nextScope: "stage" | "prod" | null = null;
    if (currentSecret.dev && !currentSecret.stage) {
      nextScope = "stage";
    } else if (currentSecret.stage && !currentSecret.prod) {
      nextScope = "prod";
    }

    if (!nextScope) {
      setSecrets(prev => prev.map((s, idx) => idx === selectedIdx ? { ...s, stage: false, prod: false } : s));
      return;
    }

    setPromoting(true);
    setTimeout(() => {
      setSecrets(prev => prev.map((s, idx) => {
        if (idx === selectedIdx) {
          return {
            ...s,
            stage: nextScope === "stage" ? true : s.stage,
            prod: nextScope === "prod" ? true : s.prod
          };
        }
        return s;
      }));
      setPromoting(false);
    }, 1000);
  };

  const activeSecret = secrets[selectedIdx];
  const canPromote = !activeSecret.prod;

  return (
    <div className="grid md:grid-cols-2 gap-4 text-left font-mono text-[9px] mt-2">
      {/* Selector */}
      <div className="space-y-1.5">
        <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold">1. Select secret variable</label>
        <div className="space-y-1">
          {secrets.map((sec, idx) => (
            <button
              key={sec.name}
              onClick={() => setSelectedIdx(idx)}
              className={cn(
                "w-full rounded border px-2 py-1.5 text-left flex justify-between items-center transition-all",
                selectedIdx === idx
                  ? "bg-primary/10 border-primary/20 text-primary font-semibold"
                  : "bg-black/25 border-white/5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <span className="truncate">{sec.name}</span>
              <span className="text-[8px] opacity-75">val: {sec.val}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scopes Visualizer */}
      <div className="border border-white/5 bg-zinc-950/20 rounded-xl p-3 flex flex-col justify-between min-h-[120px]">
        <div className="space-y-2">
          <label className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold block">2. Environment Scope Flow</label>
          <div className="flex items-center gap-1 py-1">
            {ENV_STEPS.map((env, idx) => {
              const isAvailable = 
                env === "development" ? activeSecret.dev :
                env === "staging" ? activeSecret.stage :
                activeSecret.prod;
              
              return (
                <div key={env} className="flex-1 flex items-center gap-1">
                  <div className={cn(
                    "flex-1 rounded p-1.5 text-center border font-bold text-[8px] uppercase transition-all duration-150",
                    isAvailable 
                      ? env === "production"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : "bg-primary/10 border-primary/20 text-primary"
                      : "bg-white/5 border-white/5 text-muted-foreground/30"
                  )}>
                    {env.substring(0, 4)}
                  </div>
                  {idx < 2 && <ChevronRight className="h-3 w-3 text-muted-foreground/20 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-2.5">
          <button
            onClick={handlePromote}
            disabled={promoting}
            className="w-full flex items-center justify-center gap-1 rounded bg-primary text-primary-foreground font-semibold py-1.5 text-[9px] hover:bg-primary/95 transition disabled:opacity-50"
          >
            {promoting ? (
              <>
                <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                <span>Syncing Environment...</span>
              </>
            ) : canPromote ? (
              <>
                <Sliders className="h-2.5 w-2.5" />
                <span>Promote Environment</span>
              </>
            ) : (
              <>
                <Check className="h-2.5 w-2.5" />
                <span>Fully Scoped (Reset)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// 5. Bento Card List Configuration
const BENTO_FEATURES = [
  {
    title: "Zero-Knowledge Cryptography",
    description: "Your secrets are locked locally with military-grade AES-256-GCM. Decryption keys never touch our servers, meaning completely blind storage hosting.",
    icon: Lock,
    className: "md:col-span-2",
    element: (
      <div className="relative mt-2 h-32 rounded-xl bg-zinc-950/40 border border-white/5 flex items-center justify-center overflow-hidden p-4">
        <div className="absolute inset-0 bg-grid bg-[size:14px_14px] opacity-[0.08]" />
        <div className="relative z-10 flex flex-col items-center gap-1 text-center font-mono">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10 shadow-[0_0_15px_oklch(0.596_0.145_163.2/0.2)]">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[10px] text-foreground font-semibold mt-1.5">AES-256-GCM Client Decrypted</span>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">PBKDF2 SHA-256 Key Derivation</span>
        </div>
      </div>
    )
  },
  {
    title: "Granular Team Access Controls",
    description: "Role-based authorization limits variables to selected members. Prevent development users from reading production API tokens.",
    icon: Users,
    className: "md:col-span-1",
    element: (
      <div className="mt-2 rounded-xl bg-zinc-950/40 border border-white/5 p-3 text-left font-mono text-[9px] space-y-2">
        <div className="flex items-center gap-1.5 text-muted-foreground uppercase text-[8px] font-bold border-b border-white/5 pb-1.5">
          <UserCheck className="h-3 w-3 text-primary" /> Access Controls
        </div>
        <div className="flex justify-between items-center py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center text-[8px] text-primary font-bold">AL</div>
            <span className="text-foreground">alice@acme.com</span>
          </div>
          <span className="text-[8px] bg-primary/10 border border-primary/20 px-1 rounded text-primary font-semibold uppercase">Owner</span>
        </div>
        <div className="flex justify-between items-center py-0.5 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[8px] text-muted-foreground font-bold">DV</div>
            <span>developer@acme.com</span>
          </div>
          <span className="text-[8px] bg-white/5 border border-white/10 px-1 rounded uppercase">Dev Only</span>
        </div>
        <div className="flex justify-between items-center py-0.5 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[8px] text-muted-foreground font-bold">RT</div>
            <span>rotator-service</span>
          </div>
          <span className="text-[8px] bg-white/5 border border-white/10 px-1 rounded uppercase">Rotator</span>
        </div>
      </div>
    )
  },
  {
    title: "Real-time Sync Across Terminals",
    description: "Environment secrets propagate immediately to connected developer workstations, local pipelines, and servers. Never Slack a .env file again.",
    icon: RefreshCw,
    className: "md:col-span-1",
    element: <LiveSyncVisualizer />
  },
  {
    title: "Immutable Security Audit Logs",
    description: "Every read, write, update, and rotation creates a cryptographic trail. Comply with SOC2 and ISO-27001 requirements out of the box.",
    icon: ScrollText,
    className: "md:col-span-1",
    element: <InteractiveAuditLogs />
  },
  {
    title: "Developer CLI & API Keys",
    description: "Easily inject credentials into local shell sessions or CI processes. Integrate with Docker, Kubernetes, and popular host environments.",
    icon: Terminal,
    className: "md:col-span-1",
    element: <AutoTypingTerminal />
  },
  {
    title: "Multi-Environment Promotion Scopes",
    description: "Promote credentials between staging, development, and production scopes smoothly without manual copy-pasting. Keep configurations separate, isolated, and safe.",
    icon: Sliders,
    className: "md:col-span-3",
    element: <SecretEnvironmentPromoter />
  }
];

// Main Features Section Component
export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
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
              Core Platform
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            Secure variables. <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">Power your builds.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-200px" }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mt-4 text-sm text-muted-foreground leading-relaxed md:text-base"
          >
            Vaultify packages enterprise credential containment, auto-sync engines, and secure key propagation pipelines into a unified developer dashboard.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {BENTO_FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-150px" }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
                className={cn(
                  "group glass flex flex-col justify-between rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.01] to-white/[0.03] p-6 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.04]",
                  feature.className
                )}
              >
                <div>
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 transition-colors group-hover:bg-primary/10">
                    <Icon className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-1">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
                
                {/* Visual panel */}
                <div className="mt-4 pt-2 border-t border-white/[0.02]">
                  {feature.element}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
