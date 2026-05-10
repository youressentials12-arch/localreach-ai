"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";

export default function PrelaunchBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative z-[60] bg-gradient-to-r from-[#6366f1]/90 via-[#8b5cf6]/90 to-[#6366f1]/90 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-sm text-white">
        <Sparkles size={14} className="text-[#a3e635] shrink-0" />
        <span>
          <span className="font-semibold">Pre-lansare exclusivă</span>
          {" · "}Înregistrează-te acum și primești{" "}
          <span className="font-bold text-[#a3e635]">30% reducere</span> la Pro prima lună
          {" · "}
          <Link
            href="/signup?ref=prelaunch"
            className="underline underline-offset-2 hover:no-underline font-semibold transition-opacity hover:opacity-80"
          >
            Rezervă locul tău →
          </Link>
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 text-white/70 hover:text-white transition-colors"
          aria-label="Închide"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
