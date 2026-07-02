"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, CheckCircle2, ShieldAlert, Mail, Terminal } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSubmitting(true);
    
    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-black text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40" />
      <div className="absolute top-0 left-1/4 right-1/4 h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <Navbar />

      <main className="relative z-10 mx-auto max-w-5xl px-6 pt-32 pb-24">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Homepage
        </Link>

        {/* Header */}
        <div className="border-b border-white/5 pb-8 mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Get in touch</h1>
          <p className="mt-2 text-sm text-muted-foreground font-mono">
            Have questions about key encapsulation, integrations, or enterprise options? Drop us a message.
          </p>
        </div>

        {/* Dual Grid */}
        <div className="grid gap-12 md:grid-cols-5 items-start">
          
          {/* Info Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl border border-white/5 bg-zinc-950/20 p-5 space-y-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Developer Support
              </h3>
              
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>support@vaultify.dev</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span>cli-issues@vaultify.dev</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span>security@vaultify.dev</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-zinc-950/10 p-5">
              <h4 className="font-mono text-[10px] font-bold uppercase text-zinc-400 mb-2">Response Times</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We review support messages daily. Active workspace administrators typically receive responses within 4 hours.
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="md:col-span-3">
            <div className="glass rounded-2xl border border-white/5 bg-zinc-950/10 p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
              
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit} 
                    className="space-y-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="font-mono text-[10px] uppercase text-zinc-400">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Linus Torvalds"
                          className="bg-black/40 border-white/5 focus:border-primary/45 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="font-mono text-[10px] uppercase text-zinc-400">Work Email</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="linus@git.org"
                          className="bg-black/40 border-white/5 focus:border-primary/45 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="subject" className="font-mono text-[10px] uppercase text-zinc-400">Subject</Label>
                      <Input
                        id="subject"
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="CLI Sync Issues with Kubernetes Node"
                        className="bg-black/40 border-white/5 focus:border-primary/45 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message" className="font-mono text-[10px] uppercase text-zinc-400">Message</Label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your issue or custom workspace requirements..."
                        className="w-full bg-black/40 border border-white/5 focus:border-primary/45 rounded-lg p-3 text-xs outline-none text-foreground placeholder:text-muted-foreground/60 transition-colors"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full rounded-lg font-mono text-xs font-bold gap-2 cursor-pointer"
                    >
                      {isSubmitting ? "Transmitting..." : "Send Message"}
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    className="text-center py-10 space-y-4"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold font-mono">Transmission Complete</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Thank you, {name}. Your ticket has been securely logged. A Vaultify support representative will contact you at {email} shortly.
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setSubmitted(false)}
                      className="font-mono text-[10px] uppercase tracking-wider rounded-lg mt-4 cursor-pointer"
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
