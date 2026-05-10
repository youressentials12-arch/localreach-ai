"use client";

import { useState } from "react";
import { Sparkles, Mail, Copy, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

const DISCOUNT_CODE = "PRELAUNCH30";

interface Props {
  email: string;
}

export default function PrelaunchConfirmation({ email }: Props) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(DISCOUNT_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080810] relative overflow-hidden px-4">
      {/* Background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#6366f1]/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#8b5cf6]/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Sparkle icon */}
        <div className="w-20 h-20 rounded-2xl bg-[#6366f1]/15 border border-[#6366f1]/30 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-9 h-9 text-[#6366f1]" />
        </div>

        <h1 className="font-syne font-bold text-3xl sm:text-4xl text-white mb-3 leading-tight">
          Mulțumim pentru susținere!
        </h1>
        <p className="text-[#9ca3af] text-base mb-8 leading-relaxed max-w-md mx-auto">
          Ești printre primii care cred în LocalReach AI.
          Te vom anunța prin email imediat ce aplicația se lansează.
        </p>

        {/* Email verification notice */}
        <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl px-5 py-4 flex items-start gap-3 text-left mb-6">
          <div className="w-8 h-8 bg-[#6366f1]/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <Mail size={16} className="text-[#6366f1]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#e2e2f0] mb-0.5">Verifică emailul</p>
            <p className="text-sm text-[#6b7280]">
              Am trimis un link de confirmare la{" "}
              <span className="text-[#e2e2f0] font-medium">{email}</span>.
              Confirmă contul pentru a activa reducerea.
            </p>
          </div>
        </div>

        {/* Discount code card */}
        <div className="bg-gradient-to-br from-[#6366f1]/10 to-[#8b5cf6]/10 border border-[#6366f1]/30 rounded-2xl p-6 mb-8">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#6366f1] mb-3">
            Codul tău de reducere
          </p>

          {/* Code display */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-[#0f0f1a] border border-[#6366f1]/40 rounded-xl px-6 py-3">
              <span className="font-syne font-bold text-2xl text-white tracking-wider">
                {DISCOUNT_CODE}
              </span>
            </div>
            <button
              onClick={copyCode}
              className="w-11 h-11 bg-[#6366f1] hover:bg-[#4f46e5] rounded-xl flex items-center justify-center transition-colors"
              title="Copiază codul"
            >
              {copied ? <Check size={16} className="text-white" /> : <Copy size={16} className="text-white" />}
            </button>
          </div>

          {copied && (
            <p className="text-xs text-[#a3e635] font-medium mb-2">Cod copiat!</p>
          )}

          <p className="text-sm text-[#9ca3af]">
            <span className="text-[#a3e635] font-semibold">30% reducere</span> la abonamentul Pro · Prima lună
          </p>
          <p className="text-xs text-[#6b7280] mt-1">Limitat la primii 100 utilizatori · Valabil 30 de zile după lansare</p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Înapoi la pagina principală
        </Link>
      </div>
    </div>
  );
}
