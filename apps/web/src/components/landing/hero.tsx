"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Terminal, 
  Cpu, 
  Sparkles,
  Database,
  RefreshCw,
  GitBranch,
  Cloud,
  ChevronRight,
  Settings,
  ScrollText,
  Key,
  Activity,
  Layers,
  Plus,
  X,
  Server,
  Globe,
  Play
} from "lucide-react";

// Types for Mock Secrets
interface MockSecret {
  name: string;
  masked: string;
  unmasked: string;
  env: "production" | "staging" | "development";
  revealed: boolean;
  copied: boolean;
}

// Scramble text effect for simulated encryption
function ScrambledText({ text, speed = 40 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayedText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1/3;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className="font-mono text-xs">{displayedText}</span>;
}

// 1. Secrets Vault Subcomponent
function UnifiedSecretsVault() {
  const [secrets, setSecrets] = useState<MockSecret[]>([
    { 
      name: "DATABASE_URL", 
      masked: "postgresql://db_user:••••••••••••@aws.rds.com:5432/prod", 
      unmasked: "postgresql://db_user:s3cr3t_p@ss_99@aws.rds.com:5432/prod", 
      env: "production", 
      revealed: false, 
      copied: false 
    },
    { 
      name: "STRIPE_SECRET_KEY", 
      masked: "••••••••••••••••••••••••••••••••", 
      unmasked: "YOUR_STRIPE_SECRET_KEY_HERE", 
      env: "production", 
      revealed: false, 
      copied: false 
    },
    { 
      name: "REDIS_HOST", 
      masked: "redis://default:••••••••••••@redis.local", 
      unmasked: "redis://default:redisPass123@redis.local:6379", 
      env: "staging", 
      revealed: false, 
      copied: false 
    },
    { 
      name: "NEXTAUTH_SECRET", 
      masked: "••••••••••••••••••••••••••••••••", 
      unmasked: "dev_auth_secret_token_vaultify_local", 
      env: "development", 
      revealed: false, 
      copied: false 
    }
  ]);
  const [activeEnv, setActiveEnv] = useState<"all" | "production" | "staging" | "development">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newEnv, setNewEnv] = useState<"production" | "staging" | "development">("production");

  const handleToggleReveal = (index: number) => {
    setSecrets((prev) => prev.map((s, i) => i === index ? { ...s, revealed: !s.revealed } : s));
  };

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setSecrets((prev) => prev.map((s, i) => i === index ? { ...s, copied: true } : s));
    setTimeout(() => {
      setSecrets((prev) => prev.map((s, i) => i === index ? { ...s, copied: false } : s));
    }, 1500);
  };

  const handleAddSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const val = newValue || "default_value_123";
    const maskedText = val.substring(0, Math.min(4, val.length)) + "•".repeat(Math.max(8, val.length - 4));
    
    setSecrets((prev) => [
      ...prev,
      {
        name: newName.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
        masked: maskedText,
        unmasked: val,
        env: newEnv,
        revealed: false,
        copied: false
      }
    ]);
    
    setNewName("");
    setNewValue("");
    setShowAddForm(false);
  };

  const filteredSecrets = secrets.filter(s => activeEnv === "all" || s.env === activeEnv);

  return (
    <div className="flex flex-col h-[270px] justify-between text-left">
      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {/* Filter bar + Add button */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded">
            {["all", "production", "staging", "development"].map((env) => (
              <button
                key={env}
                onClick={() => setActiveEnv(env as any)}
                className={`rounded px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase ${
                  activeEnv === env 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {env === "all" ? "All" : env.substring(0, 3)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 rounded bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 hover:bg-primary/20 text-[9px] font-bold"
          >
            {showAddForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            <span>Secret</span>
          </button>
        </div>

        {/* Inline Add Secret Form */}
        {showAddForm ? (
          <form onSubmit={handleAddSecret} className="border border-white/10 bg-black/40 rounded p-2.5 space-y-2 font-mono text-[9px]">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-muted-foreground mb-0.5">Key Name:</label>
                <input
                  type="text"
                  required
                  placeholder="API_KEY"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-black/60 border border-white/5 rounded px-1.5 py-0.5 text-foreground outline-none focus:border-primary/50 text-[9px]"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-0.5">Secret Value:</label>
                <input
                  type="text"
                  placeholder="value..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full bg-black/60 border border-white/5 rounded px-1.5 py-0.5 text-foreground outline-none focus:border-primary/50 text-[9px]"
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-0.5">Env Scope:</label>
                <select
                  value={newEnv}
                  onChange={(e) => setNewEnv(e.target.value as any)}
                  className="w-full bg-black/60 border border-white/5 rounded px-1.5 py-0.5 text-foreground outline-none focus:border-primary/50 text-[9px]"
                >
                  <option value="production">Prod</option>
                  <option value="staging">Stage</option>
                  <option value="development">Dev</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-white/5 hover:bg-white/10 text-muted-foreground px-2 py-0.5 rounded text-[8px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-2 py-0.5 rounded text-[8px]"
              >
                Save Secret
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-1.5">
            {filteredSecrets.map((secret) => {
              const globalIndex = secrets.findIndex(s => s.name === secret.name);
              return (
                <div
                  key={secret.name}
                  className="group flex items-center justify-between rounded border border-white/5 bg-white/[0.01] px-2.5 py-1.5 hover:border-white/10 hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Database className="h-3 w-3 text-primary shrink-0" />
                    <span className="font-mono text-[10px] text-foreground font-semibold truncate max-w-[120px]">{secret.name}</span>
                    <span className="font-mono text-[9px] text-muted-foreground truncate select-none">
                      {secret.revealed ? (
                        <ScrambledText text={secret.unmasked} speed={15} />
                      ) : (
                        secret.masked
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={`rounded-full px-1.5 py-0.2 text-[7px] font-mono border uppercase tracking-wider ${
                      secret.env === "production" 
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                        : secret.env === "staging"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                    }`}>
                      {secret.env.substring(0, 4)}
                    </span>
                    <button
                      onClick={() => handleToggleReveal(globalIndex)}
                      className="rounded p-0.5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    >
                      {secret.revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => handleCopy(globalIndex, secret.unmasked)}
                      className="rounded p-0.5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    >
                      {secret.copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Sync Status Footer */}
      <div className="border-t border-white/5 pt-2 mt-2 flex items-center justify-between font-mono text-[8px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Activity className="h-2.5 w-2.5 text-primary" /> Live connection synced
        </span>
        <span>Secure Local Memory</span>
      </div>
    </div>
  );
}

// 2. Cryptographic Sandbox Subcomponent
function UnifiedCryptoSandbox() {
  const [plainText, setPlainText] = useState("my-super-secret-password-123");
  const [encryptedText, setEncryptedText] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [scrambling, setScrambling] = useState(false);
  const [statusText, setStatusText] = useState("Idle. Awaiting client-side encryption.");

  const handleAction = async () => {
    if (scrambling) return;
    
    if (!isEncrypted) {
      setScrambling(true);
      setStatusText("Generating local PBKDF2 salt & AES key...");
      
      let duration = 0;
      const interval = setInterval(() => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        const fakeCipher = "U2FsdGVkX1" + Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        setEncryptedText(fakeCipher);
        duration += 100;
        if (duration >= 1200) {
          clearInterval(interval);
          setScrambling(false);
          setIsEncrypted(true);
          setStatusText("Encrypted locally using AES-256-GCM. Ready to push to server.");
        }
      }, 80);
    } else {
      setScrambling(true);
      setStatusText("Verifying authorization & decrypting in-memory...");
      
      setTimeout(() => {
        setScrambling(false);
        setIsEncrypted(false);
        setEncryptedText("");
        setStatusText("Decryption complete. Secret restored safely in-memory.");
      }, 1000);
    }
  };

  return (
    <div className="border border-white/5 bg-black/40 rounded-lg p-4 h-[270px] flex flex-col justify-between text-left">
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[8px] font-mono text-muted-foreground uppercase mb-1">Plaintext Input:</label>
            <input
              type="text"
              disabled={isEncrypted}
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              className="w-full rounded border border-white/5 bg-black/40 px-2 py-1.5 font-mono text-[10px] text-foreground outline-none transition focus:border-primary/50 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-[8px] font-mono text-muted-foreground uppercase mb-1">AES-256 Ciphertext (Server Side):</label>
            <div className="w-full rounded border border-white/5 bg-black/40 px-2 py-1.5 font-mono text-[10px] text-emerald-400 break-all select-all leading-tight h-[29px] overflow-hidden truncate">
              {isEncrypted ? encryptedText : "••••••••••••••••••••••••"}
            </div>
          </div>
        </div>

        {isEncrypted && (
          <div className="rounded border border-primary/20 bg-primary/5 p-2 flex items-start gap-1.5">
            <Lock className="h-3 w-3 text-primary shrink-0 mt-0.5" />
            <span className="text-[8px] font-mono text-muted-foreground leading-normal">
              Payload was encrypted client-side using a locally generated key. Vaultify servers never receive the decryption key.
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={handleAction}
          disabled={scrambling}
          className={`flex w-full items-center justify-center gap-2 rounded px-3 py-1.5 font-mono text-[10px] font-semibold tracking-wide transition duration-200 ${
            isEncrypted
              ? "bg-secondary text-foreground hover:bg-secondary/80 border border-white/10"
              : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10"
          }`}
        >
          {scrambling ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Running Cryptography...</span>
            </>
          ) : isEncrypted ? (
            <>
              <Unlock className="h-3 w-3" />
              <span>Client-Decrypt Payload</span>
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" />
              <span>Local AES Encrypt</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5 rounded bg-black/30 px-2 py-1 text-[8px] font-mono text-muted-foreground">
          <Terminal className="h-2.5 w-2.5 text-primary" />
          <span className="flex-1 truncate">{statusText}</span>
        </div>
      </div>
    </div>
  );
}

// 3. CLI Terminal Subcomponent
function InteractiveTerminal() {
  const [lines, setLines] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runSimulation = () => {
    setIsRunning(true);
    setLines([]);
    
    const steps = [
      { text: "$ vaultify pull --scope production", delay: 200 },
      { text: "  [ok] Authenticated with organization: acme-corp", delay: 500 },
      { text: "  [ok] Found active vault: vaultify-secrets", delay: 400 },
      { text: "  [key] Fetching encrypted ciphertext...", delay: 400 },
      { text: "  [secure] Decrypting AES payload locally in-memory...", delay: 500 },
      { text: "  [ok] Decrypted 4 secrets locally", delay: 400 },
      { text: "  [setup] Injecting variables into current shell context", delay: 400 },
      { text: "   DATABASE_URL=postgresql://db_user:***@aws.rds.com:5432/prod", delay: 200 },
      { text: "   STRIPE_SECRET_KEY=••••••••••••••••••••••••", delay: 100 },
      { text: "   REDIS_HOST=redis://default:***@redis.local", delay: 100 },
      { text: "$ npm run dev", delay: 600 },
      { text: "> acme-corp@0.1.0 dev", delay: 200 },
      { text: "  [next] Next.js 16.2.9 - Server started at http://localhost:3000", delay: 400 }
    ];

    let currentStep = 0;
    const executeNext = () => {
      if (currentStep >= steps.length) {
        setIsRunning(false);
        return;
      }
      const step = steps[currentStep];
      setTimeout(() => {
        setLines((prev) => [...prev, step.text]);
        currentStep++;
        executeNext();
      }, step.delay);
    };
    executeNext();
  };

  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <div className="bg-black/80 font-mono text-[10px] text-zinc-300 p-4 rounded-lg border border-white/5 h-[270px] flex flex-col justify-between text-left">
      <div className="space-y-1 overflow-y-auto flex-1 pr-2">
        {lines.map((line, idx) => (
          <div key={idx} className={line.startsWith("$") ? "text-primary font-semibold" : "text-zinc-400"}>
            {line}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between">
        <span className="text-muted-foreground text-[8px]">Typewriter CLI Simulation</span>
        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="flex items-center gap-1 rounded bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 hover:bg-primary/20 disabled:opacity-50 text-[9px] font-bold"
        >
          <Play className="h-3 w-3" /> Rerun CLI
        </button>
      </div>
    </div>
  );
}

// 4. Integrations Canvas Subcomponent
function InteractiveIntegrationsCanvas() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  
  const nodes = [
    { id: "vercel", label: "Vercel", description: "Edge config environment secrets sync", icon: Cloud, x: "15%", y: "20%" },
    { id: "aws", label: "AWS Parameter", description: "Parameter store sync via dynamic IAM integration", icon: Cpu, x: "85%", y: "20%" },
    { id: "github", label: "GitHub CI", description: "Inject environment credentials during actions run steps", icon: GitBranch, x: "15%", y: "80%" },
    { id: "kubernetes", label: "K8s Pods", description: "Securely inject configuration maps into containers", icon: Settings, x: "85%", y: "80%" },
    { id: "vaultify", label: "Vaultify Core", description: "Zero-Knowledge centralized credential management authority", icon: Database, x: "50%", y: "50%", core: true }
  ];

  return (
    <div className="relative border border-white/5 bg-black/40 rounded-lg h-[270px] overflow-hidden p-4 text-left">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid bg-[size:16px_16px] opacity-10" />

      {/* Connection paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1="50%" y1="50%" x2="15%" y2="20%" stroke="var(--primary)" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
        <line x1="50%" y1="50%" x2="85%" y2="20%" stroke="var(--primary)" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
        <line x1="50%" y1="50%" x2="15%" y2="80%" stroke="var(--primary)" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
        <line x1="50%" y1="50%" x2="85%" y2="80%" stroke="var(--primary)" strokeWidth="1" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
      </svg>

      {/* Render Nodes */}
      {nodes.map((node) => {
        const Icon = node.icon;
        const isCore = node.core;
        const isSelected = activeNode === node.id;
        
        return (
          <div
            key={node.id}
            onClick={() => setActiveNode(node.id)}
            style={{ left: node.x, top: node.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center group transition-all duration-300 z-20"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
              isCore 
                ? "bg-primary border-primary shadow-[0_0_15px_var(--primary)] scale-110" 
                : isSelected
                ? "bg-primary/25 border-primary shadow-[0_0_10px_oklch(0.596_0.145_163.2/0.3)]"
                : "bg-black/85 border-white/10 hover:border-primary/50 group-hover:scale-105"
            }`}>
              <Icon className={`h-4 w-4 ${isCore ? "text-primary-foreground" : "text-primary"}`} />
            </div>
            <span className="mt-1 font-mono text-[9px] text-foreground font-semibold">{node.label}</span>
          </div>
        );
      })}

      {/* Info panel */}
      <div className="absolute bottom-2 left-2 right-2 rounded border border-white/5 bg-black/60 p-2 font-mono text-[8px] text-muted-foreground backdrop-blur-sm z-30">
        {activeNode ? (
          <div>
            <span className="text-foreground font-bold">{nodes.find(n => n.id === activeNode)?.label}:</span>{" "}
            {nodes.find(n => n.id === activeNode)?.description}
          </div>
        ) : (
          <div className="text-center">Select any infrastructure node to verify active synchronization routing</div>
        )}
      </div>

      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -40;
          }
        }
      `}</style>
    </div>
  );
}

// 5. Unified Workspace Mockup Component
function UnifiedMockupDashboard() {
  const [activeTab, setActiveTab] = useState<"vault" | "sandbox" | "terminal" | "integrations">("vault");

  return (
    <div className="relative mx-auto w-full max-w-4xl mt-16 px-4">
      {/* Background glowing gradients */}
      <div className="pointer-events-none absolute -inset-8 bg-gradient-to-tr from-emerald-500/5 via-teal-500/5 to-transparent blur-3xl rounded-3xl" />
      
      <div className="glass relative overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
        {/* Title Bar */}
        <div className="flex items-center justify-between border-b border-white/5 bg-black/60 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500/40" />
            <span className="h-2 w-2 rounded-full bg-yellow-500/40" />
            <span className="h-2 w-2 rounded-full bg-green-500/40" />
            <span className="ml-2 text-[10px] font-mono text-muted-foreground">acme-corp / vaultify-workspace</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              agent online
            </span>
          </div>
        </div>

        {/* Dashboard Workspace */}
        <div className="flex flex-col md:flex-row min-h-[300px]">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 p-3 flex md:flex-col justify-between">
            <div className="space-y-1 w-full flex md:flex-col gap-1 md:gap-0">
              <span className="hidden md:block px-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 text-left">Workspace</span>
              
              {[
                { id: "vault", label: "Secret Vault", icon: Lock },
                { id: "sandbox", label: "Crypto Sandbox", icon: Cpu },
                { id: "terminal", label: "Terminal CLI", icon: Terminal },
                { id: "integrations", label: "Integrations", icon: Layers }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full rounded px-2.5 py-1.5 text-left font-mono text-[10px] flex items-center gap-2 transition-all ${
                      isActive 
                        ? "bg-primary/10 text-primary font-semibold" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="hidden md:block border-t border-white/5 pt-3">
              <div className="flex items-center gap-1.5 px-2 font-mono text-[8px] text-muted-foreground text-left">
                <Settings className="h-3 w-3" />
                <span>v1.4.2 (Latest)</span>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-black/10 p-5">
            {activeTab === "vault" && <UnifiedSecretsVault />}
            {activeTab === "sandbox" && <UnifiedCryptoSandbox />}
            {activeTab === "terminal" && <InteractiveTerminal />}
            {activeTab === "integrations" && <InteractiveIntegrationsCanvas />}
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. Integration Marquee Component
const INTEGRATIONS = [
  { name: "Vercel", icon: ChevronRight },
  { name: "AWS Keys", icon: Cloud },
  { name: "GitHub Actions", icon: GitBranch },
  { name: "Kubernetes", icon: Settings },
  { name: "Slack Alerts", icon: Activity },
  { name: "Google Cloud", icon: Cloud },
  { name: "Render", icon: Layers },
  { name: "Supabase", icon: Database },
  { name: "Netlify", icon: Cpu },
  { name: "Fly.io", icon: RefreshCw }
];

function IntegrationMarquee() {
  return (
    <div className="relative mt-20 border-t border-b border-white/5 py-8 overflow-hidden bg-gradient-to-r from-transparent via-white/[0.01] to-transparent w-full">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="text-center mb-4">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Syncs with your active tech stack</span>
      </div>

      <div className="flex overflow-hidden select-none w-full">
        <div className="flex shrink-0 items-center gap-12 min-w-full animate-marquee pr-12">
          {INTEGRATIONS.map((int, idx) => {
            const Icon = int.icon;
            return (
              <div key={`i1-${idx}`} className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.05] hover:scale-105 cursor-pointer whitespace-nowrap">
                <Icon className="h-3 w-3 text-primary shrink-0" />
                <span className="text-xs font-semibold font-mono text-muted-foreground transition hover:text-foreground">{int.name}</span>
              </div>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-12 min-w-full animate-marquee pr-12" aria-hidden="true">
          {INTEGRATIONS.map((int, idx) => {
            const Icon = int.icon;
            return (
              <div key={`i2-${idx}`} className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.05] hover:scale-105 cursor-pointer whitespace-nowrap">
                <Icon className="h-3 w-3 text-primary shrink-0" />
                <span className="text-xs font-semibold font-mono text-muted-foreground transition hover:text-foreground">{int.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 24s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

// Main Hero Redesign Export
export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 pb-10"
    >
      {/* Aurora Radial Dynamic Lighting */}
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-500 ease-out"
        style={{
          background: `
            radial-gradient(550px circle at ${mousePos.x}% ${mousePos.y}%, oklch(0.596 0.145 163.2 / 0.08) 0%, transparent 60%),
            radial-gradient(800px circle at 50% 30%, oklch(0.596 0.145 163.2 / 0.04) 0%, transparent 70%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 flex-1 flex flex-col justify-center text-center">
        {/* Glowing Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <Badge 
            variant="secondary" 
            className="mb-6 inline-flex items-center gap-1.5 border border-primary/20 bg-primary/10 px-3.5 py-1 font-mono text-[10px] font-semibold text-primary transition-all duration-300 hover:bg-primary/15 hover:border-primary/30"
          >
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            <span>Zero-Knowledge Secrets Hub</span>
          </Badge>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[3.75rem] leading-[1.1] max-w-4xl mx-auto"
        >
          Stop sharing secrets over <span className="line-through text-muted-foreground/60 decoration-rose-500/80 decoration-2">Slack</span>.<br />
          Sync <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-300 bg-clip-text text-transparent">safely & instantly</span>.
        </motion.h1>

        {/* Sub-description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-base text-muted-foreground leading-relaxed sm:text-md"
        >
          Vaultify secures your configurations, passwords, and API credentials with end-to-end local encryption. Keep your development, staging, and production environments synchronized securely without exposing private keys.
        </motion.p>

        {/* Action Button Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Button size="lg" className="rounded-lg font-mono text-xs tracking-wider font-semibold shadow-lg shadow-primary/15 group bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="/register">
              Create Account
              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-lg font-mono text-xs tracking-wider border-white/10 hover:border-white/20 hover:bg-white/5 text-text-primary" asChild>
            <Link href="/docs">
              <ScrollText className="mr-1.5 h-4 w-4 text-primary" />
              Documentation
            </Link>
          </Button>
        </motion.div>

        {/* Centerpiece: Highly Interactive Unified Mockup Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <UnifiedMockupDashboard />
        </motion.div>

        {/* Bottom marquee row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <IntegrationMarquee />
        </motion.div>
      </div>
    </section>
  );
}
