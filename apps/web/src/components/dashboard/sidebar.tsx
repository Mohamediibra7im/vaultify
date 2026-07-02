"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Activity,
  Bell,
  Cpu,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Plus,
  ScrollText,
  Search,
  Settings,
  Terminal,
  Users,
  ShieldAlert,
  User,
  ShieldCheck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { VaultifyLogo } from "@/components/vaultify-logo";
import { NotificationBell } from "@/components/notification-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/workspaces", label: "Workspaces", icon: ShieldAlert },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/secrets/search", label: "Search Keys", icon: Search },
  { href: "/dashboard/audit", label: "Audit Trail", icon: ScrollText },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "System Settings", icon: Settings },
];

const utilityItems = [
  { href: "/dashboard/workspaces/new", label: "New scope", icon: Plus },
  { href: "/dashboard/settings/members", label: "Members", icon: Users },
  { href: "/dashboard/workspaces/recent", label: "Telemetry", icon: Activity },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebarShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [entropy, setEntropy] = useState("0x8E1...F3A");
  const [ping, setPing] = useState(12);

  // Latency telemetry sync
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

  // Entropy hash sync
  useEffect(() => {
    const interval = setInterval(() => {
      const hex = "0123456789ABCDEF";
      let res = "0x";
      for (let i = 0; i < 3; i++) res += hex[Math.floor(Math.random() * 16)];
      res += "...";
      for (let i = 0; i < 3; i++) res += hex[Math.floor(Math.random() * 16)];
      setEntropy(res);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-[#05080b]">
        <Sidebar
          collapsible="icon"
          className="border-r border-white/[0.03] bg-[#05080b] data-[state=collapsed]:bg-[#05080b]"
        >
          {/* Radial Gradient Ambient Lights */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-primary/[0.04] blur-[80px]" />
            <div className="absolute bottom-20 -left-10 h-48 w-48 rounded-full bg-primary/[0.02] blur-[60px]" />
          </div>

          <div className="relative flex h-full flex-col">
            {/* Header branding & notifications */}
            <SidebarHeader className="gap-4 p-4 border-b border-white/[0.02] bg-[#05080b]/80 backdrop-blur-md sticky top-0 z-20 group-data-[state=collapsed]:px-1 group-data-[state=collapsed]:py-4">
              <div className="flex items-center justify-between gap-2 group-data-[state=collapsed]:flex-col group-data-[state=collapsed]:gap-4 group-data-[state=collapsed]:items-center group-data-[state=collapsed]:justify-center w-full">
                <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0 group-data-[state=collapsed]:mx-auto">
                  {/* Hexagonal corner branding layout */}
                  <div className="relative flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-zinc-950 border border-primary/30 text-primary shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all duration-300 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <VaultifyLogo className="size-5.5" />
                    <div className="absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
                  </div>
                  <span className="text-xs font-bold tracking-[0.2em] font-mono text-foreground uppercase group-data-[state=collapsed]:hidden">
                    Vaultify
                  </span>
                </Link>

                <div className="flex items-center gap-2 group-data-[state=collapsed]:flex-col group-data-[state=collapsed]:items-center group-data-[state=collapsed]:justify-center">
                  {/* Notification Bell */}
                  <NotificationBell />
                  
                  {/* Collapse Trigger */}
                  <SidebarTrigger className="h-9 w-9 rounded-xl border border-white/[0.06] bg-white/[0.01] text-text-muted hover:text-foreground hover:bg-white/[0.04] transition-all cursor-pointer group-data-[state=collapsed]:mx-auto" />
                </div>
              </div>

              {/* Quick Search trigger */}
              <Link
                href="/dashboard/secrets/search"
                className="group flex h-9 items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.01] px-3 text-text-muted backdrop-blur-xl transition-all duration-300 hover:border-primary/20 hover:bg-primary/5 hover:text-text-secondary active:scale-[0.98] group-data-[state=collapsed]:hidden"
              >
                <Search className="size-3.5 shrink-0 transition-colors group-hover:text-primary" />
                <span className="flex-1 text-left text-[11px] font-mono">search console...</span>
              </Link>
            </SidebarHeader>

            {/* Navigation Scopes */}
            <SidebarContent className="px-2 py-4 group-data-[state=collapsed]:px-0">
              <SidebarGroup className="p-0 group-data-[state=collapsed]:p-0">
                <SidebarGroupLabel className="px-3 text-[9px] uppercase tracking-[0.2em] text-text-muted font-bold font-mono group-data-[state=collapsed]:hidden">
                  Directories
                </SidebarGroupLabel>
                <SidebarGroupContent className="mt-1.5 group-data-[state=collapsed]:mt-0">
                  <SidebarMenu className="gap-0.5">
                    {mainItems.map((item) => {
                      const active = isActivePath(pathname, item.href);
                      const Icon = item.icon;

                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={active}
                            tooltip={item.label}
                            className="group relative h-9 rounded-xl text-[12px] font-mono font-medium transition-colors duration-200 hover:bg-white/[0.02] hover:text-foreground data-[active=true]:text-primary group-data-[state=collapsed]:mx-auto"
                          >
                            <Link href={item.href} className="flex items-center gap-3 group-data-[state=collapsed]:justify-center">
                              <Icon className="size-4 shrink-0 transition-colors duration-200 group-hover:text-primary" />
                              <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                              
                              {/* Sliding Link Pill with Quantum Accent Glow */}
                              {active && (
                                <motion.div
                                  layoutId="sidebar-active-pill-quantum"
                                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-l-[3px] border-primary shadow-[inset_4px_0_12px_rgba(16,185,129,0.06)] z-[-1]"
                                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <div className="mx-3 my-4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent group-data-[state=collapsed]:hidden" />

              <SidebarGroup className="p-0 group-data-[state=collapsed]:p-0">
                <SidebarGroupLabel className="px-3 text-[9px] uppercase tracking-[0.2em] text-text-muted font-bold font-mono group-data-[state=collapsed]:hidden">
                  Utility Scopes
                </SidebarGroupLabel>
                <SidebarGroupContent className="mt-1.5 group-data-[state=collapsed]:mt-0">
                  <SidebarMenu className="gap-0.5">
                    {utilityItems.map((item) => {
                      const active = isActivePath(pathname, item.href);
                      const Icon = item.icon;

                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={active}
                            tooltip={item.label}
                            className="group relative h-9 rounded-xl text-[12px] font-mono font-medium transition-colors duration-200 hover:bg-white/[0.02] hover:text-foreground data-[active=true]:text-primary group-data-[state=collapsed]:mx-auto"
                          >
                            <Link href={item.href} className="flex items-center gap-3 group-data-[state=collapsed]:justify-center">
                              <Icon className="size-4 shrink-0 transition-colors duration-200 group-hover:text-primary" />
                              <span className="group-data-[state=collapsed]:hidden">{item.label}</span>

                              {/* Sliding Link Pill with Quantum Accent Glow */}
                              {active && (
                                <motion.div
                                  layoutId="sidebar-active-pill-quantum"
                                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-l-[3px] border-primary shadow-[inset_4px_0_12px_rgba(16,185,129,0.06)] z-[-1]"
                                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            {/* Footer telemetry & user dropdown triggers */}
            <SidebarFooter className="gap-3 p-3 border-t border-t-white/[0.02] bg-[#05080b] sticky bottom-0 z-20 group-data-[state=collapsed]:p-2">
              {/* Telemetry metrics widget */}
              <div className="relative overflow-hidden rounded-xl border border-white/[0.04] bg-zinc-950 p-3 group-data-[state=collapsed]:hidden">
                <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]" />
                <div className="relative space-y-2 font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="relative size-1.5 rounded-full bg-primary">
                        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-40" />
                      </span>
                      system status
                    </span>
                    <span className="text-primary font-bold">ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>region</span>
                    <span className="text-primary font-semibold">{ping}ms (us-east)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>session key</span>
                    <span className="text-text-secondary select-all">{entropy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>encryption spec</span>
                    <span className="text-text-secondary">AES-256-GCM</span>
                  </div>
                </div>
              </div>

              {/* User settings dropdown wrapper */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative overflow-hidden rounded-xl border border-white/[0.04] bg-zinc-950 p-2.5 group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:border-0 group-data-[state=collapsed]:bg-transparent transition-all duration-300 w-full text-left hover:border-primary/20 hover:shadow-[0_0_12px_rgba(16,185,129,0.05)] cursor-pointer group-data-[state=collapsed]:mx-auto group-data-[state=collapsed]:w-auto">
                      <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] group-data-[state=collapsed]:hidden" />
                      <div className="relative flex items-center gap-2.5 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:mx-auto">
                        <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-surface-1 to-surface-2 text-[12px] font-bold text-primary shadow-[0_0_10px_rgba(16,185,129,0.08)]">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1 group-data-[state=collapsed]:hidden">
                          <p className="truncate text-[11px] font-semibold text-foreground">
                            {user.name}
                          </p>
                          <p className="truncate text-[9px] font-mono text-text-muted leading-none mt-0.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="right"
                    align="end"
                    className="w-56 border border-white/10 bg-surface-1/95 p-1.5 text-text-primary backdrop-blur-xl shadow-2xl"
                  >
                    <DropdownMenuLabel className="px-2.5 py-2">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[12px] font-semibold text-foreground">{user.name}</p>
                        <p className="text-[10px] font-mono text-text-muted truncate font-normal">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5 my-1" />
                    <DropdownMenuItem asChild className="rounded-lg hover:bg-white/5 cursor-pointer">
                      <Link href="/dashboard/settings" className="flex w-full items-center gap-2.5 px-2.5 py-2 text-[11px] font-mono">
                        <User className="size-3.5 text-text-muted" />
                        Account Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg hover:bg-white/5 cursor-pointer">
                      <Link href="/dashboard/settings/members" className="flex w-full items-center gap-2.5 px-2.5 py-2 text-[11px] font-mono">
                        <Settings className="size-3.5 text-text-muted" />
                        Workspace Config
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5 my-1" />
                    <DropdownMenuItem
                      onClick={logout}
                      className="rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer"
                    >
                      <div className="flex w-full items-center gap-2.5 px-2.5 py-2 text-[11px] font-mono font-semibold">
                        <LogOut className="size-3.5" />
                        Terminate Session
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarFooter>
          </div>
        </Sidebar>

        <SidebarInset className="overflow-x-hidden bg-[#070b0f]">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
