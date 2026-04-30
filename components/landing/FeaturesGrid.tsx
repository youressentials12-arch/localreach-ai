"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Map, BarChart2, MessageSquare, Layers, Bell, TrendingUp } from "lucide-react";

const features = [
  { icon: Map, title: "Hartă de Prospecți", body: "Vizualizare geografică cu heat map după scor de oportunitate.", color: "#6366f1" },
  { icon: BarChart2, title: "Scor de Oportunitate AI", body: "0–100 bazat pe 8 factori: website, reviews, social media, vechime.", color: "#8b5cf6" },
  { icon: MessageSquare, title: "Hook-uri Multi-Canal", body: "Email, telefon, Instagram, Facebook — ton adaptabil per afacere.", color: "#a3e635" },
  { icon: Layers, title: "CRM Integrat", body: "Kanban cu pipeline vizual. Istoric complet outreach per prospect.", color: "#6366f1" },
  { icon: Bell, title: "Follow-up Automatizat", body: "Reminder + mesaj nou dacă nu ai primit răspuns în X zile.", color: "#f59e0b" },
  { icon: TrendingUp, title: "Analytics Campanie", body: "Rată răspuns per canal, top industrii, clienți câștigați.", color: "#22c55e" },
];

export default function FeaturesGrid() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-28 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6366f1] mb-4"
          >
            Funcționalități
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-syne font-bold text-3xl sm:text-4xl text-white"
          >
            Tot ce ai nevoie pentru outreach la scară
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.05 * i }}
                className="bg-[#0f0f1a] border border-white/5 rounded-2xl p-6 card-hover"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}
                >
                  <Icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="font-syne font-bold text-base text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{f.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
