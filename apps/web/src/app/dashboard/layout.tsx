"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebarShell } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#05080b] text-text-primary">
        <div className="relative flex items-center justify-center">
          {/* Cybernetic spinner design */}
          <div className="h-12 w-12 rounded-full border-t-2 border-primary border-r-2 border-r-transparent animate-spin [animation-duration:1.2s]" />
          <div className="absolute h-6 w-6 rounded-full border border-primary/20 bg-primary/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardSidebarShell>
      <div className="relative min-h-dvh overflow-hidden bg-[#05080b] text-text-primary font-sans">
        {/* Intersecting Glowing Lights */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.08),transparent_40%),radial-gradient(circle_at_80%_90%,rgba(16,185,129,0.06),transparent_35%)]" />

        <div className="relative flex min-h-dvh flex-col">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-zinc-950 focus:outline-none"
          >
            Skip to content
          </a>
          
          <main id="main-content" className="relative flex-1">
            <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardSidebarShell>
  );
}
