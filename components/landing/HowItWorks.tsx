"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SlidersHorizontal, SearchCheck, Zap } from "lucide-react";

const steps = [
  {
    icon: SlidersHorizontal,
    number: "01",
    title: "Spui ce oferi și cine vrei",
    body: "Selectezi industria, locația și criteriile de calificare — fără website, reviews puține, social media inactiv. AI-ul știe exact ce să caute.",
    badge: "~2 minute setup",
    color: "#6366f1",
  },
  {
    icon: SearchCheck,
    number: "02",
    title: "Primești doar afacerile care chiar au nevoie",
    body: "Analizăm sute de afaceri locale și le dăm un Scor de Oportunitate 0–100. Fără afaceri care deja au totul rezolvat.",
    badge: "Scor AI bazat pe 8 factori",
    color: "#8b5cf6",
  },
  {
    icon: Zap,
    number: "03",
    title: "Mesaje care sună a om, nu a robot",
    body: "Primești hook-uri specifice acelei afaceri pentru email, telefon, Instagram și Facebook. Fiecare menționează ceva real despre ei.",
    badge: "4 canale de outreach",
    color: "#a3e635",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-28 px-4 bg-[#0a0a14]" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6366f1] mb-4"
          >
            Cum funcționează
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-syne font-bold text-3xl sm:text-4xl text-white"
          >
            De la zero la primul contact în 3 pași
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px border-t-2 border-dashed border-white/10 z-0" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.12 }}
                className="relative bg-[#0f0f1a] border border-white/5 rounded-2xl p-6 card-hover z-10"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${step.color}20`, border: `1px solid ${step.color}30` }}
                >
                  <Icon size={22} style={{ color: step.color }} />
                </div>
                <p className="text-xs text-[#6b7280] font-mono mb-2">{step.number}</p>
                <h3 className="font-syne font-bold text-lg text-white mb-3">{step.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed mb-5">{step.body}</p>
                <span
                  className="inline-block text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: `${step.color}15`, color: step.color }}
                >
                  {step.badge}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
