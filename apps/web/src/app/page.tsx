import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Security } from "@/components/landing/security";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen relative bg-[#090909] text-foreground overflow-hidden">
      {/* Global Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-45 [mask-image:radial-gradient(ellipse_65%_95%_at_50%_45%,black_70%,transparent_100%)]" />

      {/* Global Ambient Glow Overlays (blended across sections without clipping) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-center Hero Glow */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 h-[700px] w-[900px] rounded-full bg-emerald-glow/70 blur-[150px]" />
        
        {/* Features Left Glow */}
        <div className="absolute top-[28%] -left-[10%] h-[800px] w-[800px] rounded-full bg-emerald-glow/35 blur-[160px]" />

        {/* How It Works Right Glow */}
        <div className="absolute top-[52%] -right-[15%] h-[800px] w-[800px] rounded-full bg-emerald-glow/40 blur-[155px]" />

        {/* CTA Bottom Center Glow */}
        <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 h-[800px] w-[1000px] rounded-full bg-emerald-glow/65 blur-[170px]" />
      </div>

      {/* Landing Page Content Sections */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Security />
        <Footer />
      </div>
    </main>
  );
}
