"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const problems = [
  "Cauți manual pe Google Maps.",
  "Deschizi 20 de tab-uri.",
  "Verifici dacă au website.",
  "Copiezi numere de telefon.",
  "Scrii același mesaj de 50 de ori.",
  "Și la final... jumătate nici nu sunt clienți potențiali reali.",
];

export default function ProblemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="problem" className="py-28 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — text */}
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4 }}
            className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6366f1] mb-4"
          >
            Problema
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-syne font-bold text-3xl sm:text-4xl text-white mb-10"
          >
            Prospecting-ul manual
            <br />
            îți omoară timpul.
          </motion.h2>

          <div className="space-y-3 mb-8">
            {problems.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
                className="flex items-start gap-3 text-[#6b7280]"
              >
                <span className="text-red-500 mt-0.5 shrink-0">✕</span>
                <span>{p}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="pt-6 border-t border-white/5"
          >
            <p className="text-lg font-bold text-[#a3e635]">
              ✓ LocalReach face toate astea în 60 de secunde.
            </p>
          </motion.div>
        </div>

        {/* Right — Before/After visual */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Before */}
          <div className="bg-[#120a0a] border border-red-500/20 rounded-2xl p-5">
            <p className="text-xs text-red-400 font-semibold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              Înainte — Manual
            </p>
            <div className="space-y-2">
              {["Tab 1: Google Maps", "Tab 2: Website check", "Tab 3: Facebook page", "Tab 4: Copy-paste nr telefon", "Tab 5: Notepad cu mesaje..."].map((t, i) => (
                <div key={i} className="bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2 text-xs text-red-300/70 font-mono flex items-center justify-between">
                  <span>{t}</span>
                  {i === 4 && <span className="text-red-500">×</span>}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-red-500/10">
                <span className="text-2xl">🕐</span>
                <div>
                  <p className="text-sm font-semibold text-red-400">4+ ore / zi</p>
                  <p className="text-xs text-red-400/50">pierdute pe prospecting</p>
                </div>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="bg-[#080f0a] border border-[#6366f1]/30 rounded-2xl p-5 glow-indigo-sm">
            <p className="text-xs text-[#6366f1] font-semibold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] inline-block" />
              După — LocalReach AI
            </p>
            <div className="space-y-2">
              <div className="bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg px-3 py-2 text-xs text-[#6366f1] flex items-center justify-between">
                <span>Restaurant Mama&apos;s Kitchen — Cluj</span>
                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">94</span>
              </div>
              <div className="bg-[#6366f1]/5 border border-[#6366f1]/10 rounded-lg px-3 py-2 text-xs text-[#6b7280]">
                ✓ Fără website · ✓ 12 recenzii · ✓ Social inactiv
              </div>
              <div className="bg-[#0a1a0a] border border-[#a3e635]/20 rounded-lg px-3 py-2 text-xs text-[#a3e635]/80 font-mono leading-relaxed">
                &ldquo;Bună ziua, am văzut că Mama&apos;s Kitchen are recenzii
                bune dar fără site, pierdeți rezervări în fiecare zi...&rdquo;
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#6366f1]/10">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-[#a3e635]">60 secunde</p>
                  <p className="text-xs text-[#6b7280]">de la zero la hook personalizat</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
