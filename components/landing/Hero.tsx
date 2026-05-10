"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown, Zap } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: EASE } },
});

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="blob1 absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#6366f1]/20 blur-[120px]" />
        <div className="blob2 absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#8b5cf6]/15 blur-[120px]" />
        <div className="blob3 absolute bottom-1/4 left-1/2 w-[350px] h-[350px] rounded-full bg-[#a3e635]/8 blur-[120px]" />
        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        {/* Badge */}
        <motion.div {...fade(0)} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-[#6b7280] mb-8">
          <Zap size={13} className="text-[#a3e635]" />
          Powered by Gemini AI · OpenStreetMap
        </motion.div>

        {/* H1 */}
        <motion.h1
          {...fade(0.1)}
          className="font-syne font-bold text-5xl sm:text-6xl lg:text-7xl leading-tight tracking-tight text-white mb-6"
        >
          Găsește afaceri locale
          <br />
          care au nevoie de{" "}
          <em className="not-italic text-[#a3e635]">tine.</em>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          {...fade(0.2)}
          className="text-lg text-[#6b7280] max-w-xl mx-auto mb-10 leading-relaxed"
        >
          LocalReach AI analizează mii de afaceri locale, identifică pe cele cu gap-uri
          digitale reale și generează hook-uri personalizate pentru email, telefon și
          social media — în secunde.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fade(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/signup?ref=prelaunch"
            className="group flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-7 py-3.5 rounded-full font-semibold text-base transition-all hover:scale-[1.03] glow-indigo"
          >
            Înregistrează-te pentru lansare
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 border border-white/10 hover:border-white/25 text-[#6b7280] hover:text-white px-6 py-3.5 rounded-full text-base transition-all"
          >
            Vezi cum funcționează
            <ChevronDown size={16} />
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div {...fade(0.4)} className="flex items-center justify-center gap-3">
          <div className="flex -space-x-2">
            {["AM", "RP", "MD"].map((init, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[#080810] flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: ["#6366f1", "#8b5cf6", "#a3e635"][i], color: i === 2 ? "#000" : "#fff" }}
              >
                {init}
              </div>
            ))}
          </div>
          <span className="text-sm text-[#6b7280]">
            ⭐ Folosit de <span className="text-white font-medium">200+ freelanceri</span> și agenții din România
          </span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 1.2 } }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1.5 bg-white/40 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
