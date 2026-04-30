"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Cât durează să obțin primii prospecți?",
    a: "Sub 3 minute de la înregistrare. Selectezi industria și locația, apăsăm Search, și în 60 de secunde ai o listă de afaceri calificate cu scoruri AI și hook-uri gata de trimis.",
  },
  {
    q: "Cum funcționează Scorul de Oportunitate?",
    a: "AI-ul analizează 8 factori pentru fiecare afacere: prezența website-ului și calitatea lui, activitatea pe social media, numărul și media recenziilor Google, vechimea afacerii, photos pe profil și date de contact incomplete. Scorul 0–100 reflectă cât de mult are nevoie acea afacere de serviciile tale.",
  },
  {
    q: "Funcționează pentru orice industrie?",
    a: "Funcționează cel mai bine pentru servicii B2B locale: web design, SEO, social media, foto/video, contabilitate, marketing, IT support, branding. Dacă clientul tău e o afacere locală românească — LocalReach te ajută.",
  },
  {
    q: "Datele sunt actualizate? De unde vin?",
    a: "Folosim date din Google Maps (publice), site-uri publice ale afacerilor și rețele sociale. Datele sunt preluate în timp real la fiecare căutare, nu dintr-o bază veche.",
  },
  {
    q: "Pot testa înainte să plătesc?",
    a: "Da. Ai 7 zile trial gratuit pe planul PRO, fără card. Dacă nu ești mulțumit, nu plătești nimic. Îți returnăm banii în primele 14 zile dacă ai plătit și nu ești satisfăcut.",
  },
  {
    q: "Ce se întâmplă dacă depășesc limita de afaceri/lună?",
    a: "Primești o notificare când ești aproape de limită. Poți face upgrade oricând în cont sau poți cumpăra un pachet suplimentar de căutări. Nu tăiem accesul brusc.",
  },
  {
    q: "Pot folosi LocalReach pentru mai mulți clienți (agenție)?",
    a: "Planul AGENCY include 5 useri și posibilitatea de white-label (+€50/lună) — poți oferi tool-ul clienților tăi sub brandul tău. API access disponibil pentru integrări custom.",
  },
  {
    q: "Hook-urile sunt în română?",
    a: "Da, 100% în română, cu ton adaptat per canal (formal pentru email, relaxat pentru Instagram). AI-ul înțelege contextul pieței locale și evită clișeele din templateurile occidentale.",
  },
];

function FAQItem({ q, a, index, inView }: { q: string; a: string; index: number; inView: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.04 * index }}
      className="border border-white/5 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-[#0f0f1a] hover:bg-[#13131f] transition-colors"
      >
        <span className="text-sm font-semibold text-white">{q}</span>
        {open ? (
          <Minus size={16} className="text-[#6366f1] shrink-0" />
        ) : (
          <Plus size={16} className="text-[#6b7280] shrink-0" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 pb-4 bg-[#0f0f1a] border-t border-white/5">
              <p className="text-sm text-[#9ca3af] leading-relaxed pt-3">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="py-28 px-4 bg-[#0a0a14]" ref={ref}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6366f1] mb-4"
          >
            Întrebări frecvente
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-syne font-bold text-3xl sm:text-4xl text-white"
          >
            Tot ce vrei să știi
          </motion.h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
