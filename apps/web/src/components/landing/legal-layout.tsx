"use client";

import { motion } from "motion/react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ArrowLeft, Clock, ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPageLayout({ title, subtitle, lastUpdated, sections }: LegalPageLayoutProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40" />
      <div className="absolute top-0 left-1/4 right-1/4 h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <Navbar />

      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-24">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Homepage
        </Link>

        {/* Hero Header */}
        <div className="border-b border-white/5 pb-10 mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Compliance Document
            </span>
            <span className="font-mono text-[9px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Last updated: {lastUpdated}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl flex items-center gap-3">
            <FileText className="h-8 w-8 md:h-10 md:w-10 text-primary/80" />
            {title}
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl font-mono leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid gap-12 lg:grid-cols-4 items-start">
          {/* Sticky Sidebar Table of Contents */}
          <aside className="lg:col-span-1 sticky top-28 hidden lg:block border border-white/5 bg-zinc-950/20 rounded-xl p-4.5">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-4 px-2">
              Document Sections
            </h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className="w-full text-left font-mono text-[11px] text-zinc-400 hover:text-primary transition-colors py-2 px-2 hover:bg-white/[0.02] rounded-md flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-[9px] text-zinc-600 font-bold shrink-0">#</span>
                  <span className="truncate">{section.title}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Document Content */}
          <article className="lg:col-span-3 space-y-12">
            {sections.map((section) => (
              <section 
                key={section.id} 
                id={section.id}
                className="scroll-mt-28 border border-white/5 bg-zinc-950/10 rounded-2xl p-6 md:p-8 hover:border-white/10 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
              >
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground font-mono flex items-center gap-2.5 mb-5 pb-3 border-b border-white/5">
                  <span className="text-primary/70 font-normal">#</span>
                  {section.title}
                </h2>
                <div className="prose prose-invert max-w-none text-xs md:text-sm text-muted-foreground leading-relaxed font-sans space-y-4">
                  {section.content}
                </div>
              </section>
            ))}
          </article>
        </div>

      </main>

      <Footer />
    </div>
  );
}
