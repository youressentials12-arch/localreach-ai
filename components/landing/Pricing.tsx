"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "STARTER",
    monthly: 29,
    annual: 23,
    features: ["100 afaceri/lună", "50 hook-uri/lună", "2 campanii active", "CRM basic", "Export CSV", "Email support"],
    cta: "Înregistrează-te pentru lansare",
    href: "/signup?ref=prelaunch",
    highlight: false,
  },
  {
    name: "PRO",
    badge: "Cel mai popular",
    monthly: 69,
    annual: 55,
    features: [
      "500 afaceri/lună", "Hook-uri nelimitate", "10 campanii active",
      "Scor Oportunitate AI", "Analiză website+social", "Follow-up automatizat",
      "Analytics avansat", "AI Asistent Obiecții",
    ],
    cta: "Înregistrează-te pentru lansare",
    href: "/signup?ref=prelaunch",
    highlight: true,
  },
  {
    name: "AGENCY",
    monthly: 149,
    annual: 119,
    features: [
      "2.000 afaceri/lună", "Hook-uri nelimitate", "Campanii nelimitate",
      "5 useri în cont", "White-label +€50/lună", "API access", "Onboarding dedicat",
    ],
    cta: "Înregistrează-te pentru lansare",
    href: "/signup?ref=prelaunch",
    highlight: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="py-28 px-4 bg-[#0a0a14]" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6366f1] mb-4"
          >
            Prețuri
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-syne font-bold text-3xl sm:text-4xl text-white mb-8"
          >
            Prețuri clare. Fără surprize.
          </motion.h2>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-[#0f0f1a] border border-white/10 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${!annual ? "bg-[#6366f1] text-white font-medium" : "text-[#6b7280]"}`}
            >
              Lunar
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all flex items-center gap-2 ${annual ? "bg-[#6366f1] text-white font-medium" : "text-[#6b7280]"}`}
            >
              Anual
              <span className="text-[10px] bg-[#a3e635] text-black px-1.5 py-0.5 rounded-full font-bold">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.1 }}
              className={`relative rounded-2xl p-6 transition-all ${
                plan.highlight
                  ? "bg-[#0f0f1a] border-2 border-[#6366f1] scale-[1.03] glow-indigo"
                  : "bg-[#0f0f1a] border border-white/5"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6366f1] text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              )}

              <p className="text-xs font-bold tracking-[0.15em] text-[#6b7280] mb-3">{plan.name}</p>

              <div className="flex items-end gap-1 mb-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={annual ? "a" : "m"}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="font-syne font-bold text-4xl text-white"
                  >
                    €{annual ? plan.annual : plan.monthly}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[#6b7280] text-sm mb-1">/lună</span>
              </div>

              {annual && (
                <p className="text-xs text-[#a3e635] mb-4">
                  Economisești €{(plan.monthly - plan.annual) * 12}/an
                </p>
              )}

              <div className="my-5 border-t border-white/5" />

              <ul className="space-y-2.5 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#6b7280]">
                    <Check size={14} className="text-[#6366f1] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  plan.highlight
                    ? "bg-[#6366f1] hover:bg-[#4f46e5] text-white"
                    : "border border-white/10 hover:border-white/25 text-[#6b7280] hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
