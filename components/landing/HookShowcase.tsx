"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";

const channels = [
  { id: "email", label: "📧 Email" },
  { id: "phone", label: "📞 Telefon" },
  { id: "instagram", label: "📸 Instagram" },
  { id: "facebook", label: "👤 Facebook" },
];

const hooks: Record<string, { subject?: string; content: string }> = {
  email: {
    subject: "Am văzut că Mama's Kitchen nu are website încă",
    content: `Bună ziua,

Am căutat restaurante în Cluj și am observat că Mama's Kitchen are recenzii bune pe Google, dar fără un site propriu pierdeți rezervări online în fiecare zi.

Am ajutat 3 restaurante din Cluj să primească cu 40% mai multe rezervări după ce și-au creat un site simplu cu meniu și formular de rezervare...`,
  },
  phone: {
    content: `"Bună ziua, mă numesc [Nume].

Am văzut pe Google că aveți un restaurant cu recenzii bune, dar fără website — clienții care caută online nu vă găsesc.

Am o idee rapidă care v-ar putea aduce rezervări noi săptămâna viitoare. Aveți 2 minute să vă explic?"`,
  },
  instagram: {
    content: `Bună! Am văzut pagina voastră și mâncarea arată grozav 🍕

Aveți recenzii excelente pe Google, dar nu am găsit un site unde să rezerv — cred că pierdeți clienți în fiecare zi.

V-am trimis un DM cu o idee concretă. Ar dura 5 minute să vorbim?`,
  },
  facebook: {
    content: `Bună ziua!

Am dat peste pagina Mama's Kitchen și am văzut că aveți mâncare delicioasă + recenzii bune — felicitări!

Lucrez cu restaurante din Cluj pe site-uri și rezervări online. Cred că în 2 săptămâni v-aș putea aduce 15-20 rezervări noi/lună. Ar fi de interes?`,
  },
};

export default function HookShowcase() {
  const [active, setActive] = useState("email");
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  function copy() {
    const h = hooks[active];
    const text = h.subject ? `Subiect: ${h.subject}\n\n${h.content}` : h.content;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="py-28 px-4 bg-[#0a0a14]" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6366f1] mb-4"
          >
            Outreach personalizat
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-syne font-bold text-3xl sm:text-4xl text-white"
          >
            Hook-uri care primesc răspuns
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[#0f0f1a] border border-white/5 rounded-2xl overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4">
            {/* Channel tabs */}
            <div className="sm:border-r border-b sm:border-b-0 border-white/5 p-4 flex sm:flex-col gap-2">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActive(ch.id)}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                    active === ch.id
                      ? "bg-[#6366f1]/15 text-[#6366f1] font-medium"
                      : "text-[#6b7280] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>

            {/* Hook preview */}
            <div className="col-span-3 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {hooks[active].subject && (
                    <div className="mb-4 pb-4 border-b border-white/5">
                      <p className="text-xs text-[#6b7280] mb-1">Subiect:</p>
                      <p className="text-sm font-semibold text-white">{hooks[active].subject}</p>
                    </div>
                  )}
                  <div className="relative">
                    <p className="text-sm text-[#6b7280] whitespace-pre-line leading-relaxed">
                      {hooks[active].content}
                    </p>
                    {/* Fade blur at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0f0f1a] to-transparent" />
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
                <button
                  onClick={copy}
                  className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copiat!" : "Copiază Hook →"}
                </button>
                <span className="text-xs text-[#6b7280]">
                  Generat specific pentru Mama&apos;s Kitchen, Cluj
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
