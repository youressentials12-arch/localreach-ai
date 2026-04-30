"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const cards = [
  { name: "Restaurant Mama's Kitchen", rating: "3.2", reviews: 12, tag: "Fără website", score: 94, color: "bg-red-500" },
  { name: "Pizzeria Da Vinci", rating: "4.1", reviews: 8, tag: "Website slab", score: 71, color: "bg-orange-500" },
  { name: "Bistro Central", rating: "3.8", reviews: 31, tag: "Social media inactiv", score: 68, color: "bg-orange-500" },
];

export default function ProductMockup() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 px-4" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="font-syne font-bold text-3xl sm:text-4xl text-white"
          >
            Vezi totul dintr-o privire
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          {/* Glow */}
          <div className="absolute -inset-4 bg-[#6366f1]/10 rounded-3xl blur-2xl" />

          {/* Browser chrome */}
          <div className="relative bg-[#0f0f1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Browser bar */}
            <div className="bg-[#13131f] border-b border-white/5 px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 bg-[#1c1c2e] rounded-md px-3 py-1 text-xs text-[#6b7280] max-w-xs mx-auto text-center">
                app.localreach.ai/campaigns/restaurante-cluj
              </div>
            </div>

            {/* App UI */}
            <div className="flex min-h-[420px]">
              {/* Sidebar */}
              <div className="hidden sm:flex flex-col w-44 bg-[#0a0a14] border-r border-white/5 p-3 gap-1">
                {["Dashboard", "Campanii", "Prospecți", "Istoric", "Setări"].map((item, i) => (
                  <div
                    key={item}
                    className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                      i === 1
                        ? "bg-[#6366f1]/15 text-[#6366f1] font-medium"
                        : "text-[#6b7280]"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Main area */}
              <div className="flex-1 p-5">
                <div className="mb-4">
                  <p className="text-xs text-[#6b7280] mb-0.5">Campanii › Restaurante Cluj-Napoca</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-white text-sm">Restaurante Cluj-Napoca</h3>
                    <span className="text-xs text-[#6b7280] bg-white/5 px-2 py-0.5 rounded-full">47 găsite</span>
                    <span className="text-xs text-[#6366f1] bg-[#6366f1]/10 px-2 py-0.5 rounded-full">12 calificate</span>
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">3 contactate</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {cards.map((card, i) => (
                    <div
                      key={i}
                      className="bg-[#13131f] border border-white/5 rounded-xl p-3 hover:border-[#6366f1]/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-semibold text-white leading-tight pr-2">{card.name}</p>
                        <span className={`${card.color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0`}>
                          {card.score}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#6b7280] mb-1">
                        ⭐ {card.rating} ({card.reviews} rec.)
                      </p>
                      <p className="text-[10px] text-orange-400 mb-3">{card.tag}</p>
                      <button className="w-full text-[10px] bg-[#6366f1]/15 text-[#6366f1] py-1.5 rounded-lg hover:bg-[#6366f1]/25 transition-colors">
                        Vezi Hook-uri →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-[#6b7280] mt-4">
            Interface reală — fără stock photos
          </p>
        </motion.div>
      </div>
    </section>
  );
}
