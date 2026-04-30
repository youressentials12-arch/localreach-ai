import Link from "next/link";

const links = {
  Produs: [
    { label: "Funcționalități", href: "#features" },
    { label: "Cum funcționează", href: "#how-it-works" },
    { label: "Prețuri", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  Legal: [
    { label: "Termeni și condiții", href: "/terms" },
    { label: "Politica de confidențialitate", href: "/privacy" },
    { label: "Politica cookies", href: "/cookies" },
    { label: "GDPR", href: "/gdpr" },
  ],
  Cont: [
    { label: "Înregistrare", href: "/signup" },
    { label: "Autentificare", href: "/login" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Contact", href: "mailto:contact@localreach.ai" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#080810]">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-baseline gap-0.5 mb-4">
              <span className="font-syne font-bold text-xl text-white">Local</span>
              <span className="font-syne font-bold text-xl text-[#6366f1]">Reach</span>
              <sup className="text-[10px] font-bold text-[#a3e635] ml-0.5">AI</sup>
            </Link>
            <p className="text-sm text-[#6b7280] leading-relaxed max-w-[220px]">
              Găsește clienți locali calificați și trimite outreach personalizat în câteva minute.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#6b7280] mb-4">
                {section}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#6b7280] hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6b7280]">
            © {new Date().getFullYear()} LocalReach AI. Toate drepturile rezervate.
          </p>
          <p className="text-xs text-[#6b7280]">
            Construit în România 🇷🇴 pentru freelanceri români
          </p>
        </div>
      </div>
    </footer>
  );
}
