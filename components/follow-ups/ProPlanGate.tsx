"use client";

import { useState, useEffect } from "react";
import { Lock, Zap, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import UpgradeButton from "@/components/shared/UpgradeButton";

interface Props {
  children: React.ReactNode;
}

export default function ProPlanGate({ children }: Props) {
  const [plan, setPlan] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          setPlan(data?.plan ?? "pro"); // default to pro if no profile
        });
    });
  }, []);

  if (plan === null) return null; // loading

  const isPro = plan === "pro" || plan === "agency";

  if (!isPro) {
    return (
      <>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#e2e2f0]">Follow-up</h1>
            <p className="text-[#6b7280] text-sm mt-0.5">Gestionează follow-up-urile programate și trimise</p>
          </div>

          <div
            className="bg-[#16161d] border border-[#2a2a3d] rounded-2xl p-12 text-center cursor-pointer hover:border-[#6366f1]/50 transition-colors"
            onClick={() => setShowModal(true)}
          >
            <div className="w-16 h-16 bg-[#6366f1]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-[#6366f1]" />
            </div>
            <h2 className="text-lg font-semibold text-[#e2e2f0] mb-2">Funcționalitate Pro</h2>
            <p className="text-[#6b7280] text-sm max-w-md mx-auto mb-6">
              Automatizarea follow-up-urilor este disponibilă pe planul Pro și Agency.
              Configurează secvențe, trimite automat și crește rata de răspuns cu până la 40%.
            </p>
            <button
              className="bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors inline-flex items-center gap-2"
              onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
            >
              <Zap className="w-4 h-4" />
              Upgrade la Pro
            </button>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#16161d] border border-[#2a2a3d] rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#e2e2f0]">Upgrade la Pro</h3>
                <button onClick={() => setShowModal(false)} className="text-[#6b7280] hover:text-[#e2e2f0]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 mb-6">
                {["Secvențe de follow-up automate", "Tracking deschideri și click-uri", "Până la 7 pași per secvență", "Calendar și vizualizare listă", "Dezabonare GDPR automată"].map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-sm text-[#9ca3af]">
                    <div className="w-4 h-4 rounded-full bg-[#6366f1]/20 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                    </div>
                    {feat}
                  </div>
                ))}
              </div>
              <UpgradeButton className="w-full justify-center bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors inline-flex items-center gap-2">
                Upgradează la Pro
              </UpgradeButton>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
