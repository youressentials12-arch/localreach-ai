"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    name: "Alexandru Popescu",
    role: "Web designer freelancer, Cluj",
    avatar: "AP",
    color: "#6366f1",
    stars: 5,
    text: "Înainte petreceam 3-4 ore/zi căutând clienți pe Google Maps. Acum LocalReach îmi găsește 20-30 de prospecți calificați în 5 minute și îmi generează mesajele pe loc. Am închis 4 clienți noi în prima lună.",
  },
  {
    name: "Mihaela Ionescu",
    role: "Agenție social media, București",
    avatar: "MI",
    color: "#8b5cf6",
    stars: 5,
    text: "Scorul de Oportunitate AI chiar funcționează — nu mai pierd timp cu afaceri care nu au nevoie de mine. Rata mea de răspuns a crescut de la 8% la 31% de când folosesc hook-urile personalizate.",
  },
  {
    name: "Bogdan Radu",
    role: "Consultant SEO, Timișoara",
    avatar: "BR",
    color: "#a3e635",
    stars: 5,
    text: "Am testat 3 tool-uri similare. LocalReach e singurul care înțelege piața românească. Hook-urile sună natural în română, nu ca o traducere din engleză. ROI-ul din prima lună a acoperit 6 luni de abonament.",
  },
  {
    name: "Cristina Marin",
    role: "Freelancer foto/video, Iași",
    avatar: "CM",
    color: "#f59e0b",
    stars: 5,
    text: "Nu mă pricepeam deloc la outreach și mă temeam să contactez afacerile. Cu LocalReach am un script gata, știu exact ce să spun și de ce au nevoie de mine. Am semnat primul contract în a doua zi.",
  },
  {
    name: "Vlad Dumitrescu",
    role: "Dezvoltator web, Brașov",
    avatar: "VD",
    color: "#22c55e",
    stars: 5,
    text: "Pipeline-ul CRM integrat e exact ce aveam nevoie. Văd dintr-o privire cine e în negociere, cine nu a răspuns, cine a semnat. Follow-up-urile automate mi-au salvat mai multe dealuri care altfel s-ar fi pierdut.",
  },
  {
    name: "Raluca Stancu",
    role: "Designer grafic, Cluj",
    avatar: "RS",
    color: "#ec4899",
    stars: 5,
    text: "M-am înscris cu planul Starter să testez și în 2 săptămâni am trecut la Pro. Calitatea prospecților e remarcabilă — fiecare afacere are un motiv concret să aibă nevoie de serviciile mele.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" fill="#f59e0b" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6366f1] mb-4"
          >
            Testimoniale
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-syne font-bold text-3xl sm:text-4xl text-white"
          >
            Freelanceri care au crescut cu LocalReach
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 * i }}
              className="bg-[#0f0f1a] border border-white/5 rounded-2xl p-6 card-hover"
            >
              <Stars count={t.stars} />
              <p className="text-sm text-[#9ca3af] leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: `${t.color}30`, border: `1px solid ${t.color}40` }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-[#6b7280]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
