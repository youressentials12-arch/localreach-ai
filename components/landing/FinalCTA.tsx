"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 px-4" ref={ref}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 via-[#0f0f1a] to-[#8b5cf6]/20" />
          <div className="absolute inset-0 border border-[#6366f1]/20 rounded-3xl" />
          <div className="absolute -inset-8 bg-[#6366f1]/5 blur-3xl" />

          <div className="relative px-8 py-16 sm:px-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 bg-[#6366f1]/15 border border-[#6366f1]/25 rounded-full px-4 py-1.5 mb-6"
            >
              <Zap size={12} className="text-[#a3e635]" />
              <span className="text-xs text-[#6366f1] font-semibold">7 zile trial gratuit</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-syne font-bold text-3xl sm:text-5xl text-white mb-5 leading-tight"
            >
              Primul tău client
              <br />
              <span className="text-[#6366f1]">e la 5 minute distanță</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[#9ca3af] text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
            >
              Încearcă gratuit 7 zile. Fără card. Fără contract.
              Dacă nu găsești cel puțin 10 prospecți calificați în prima oră — îți returnăm banii.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-[#6366f1]/25 hover:shadow-[#6366f1]/40"
              >
                Începe Gratuit
                <ArrowRight size={16} />
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white/25 text-[#9ca3af] hover:text-white font-medium px-8 py-3.5 rounded-xl transition-all"
              >
                Vezi planurile
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.55 }}
              className="text-xs text-[#6b7280] mt-6"
            >
              Nicio taxă ascunsă · Anulezi oricând · Setup în 3 minute
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
