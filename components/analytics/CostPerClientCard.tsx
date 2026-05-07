"use client";

import { useState, useEffect } from "react";
import { Settings, X } from "lucide-react";
import { calculateCost, periodToMonths } from "@/lib/analytics/cost-calculator";

interface CostApiData { messages_sent: number; clients_won: number; plan: string }

interface Props {
  data: CostApiData | null;
  loading: boolean;
  plan: "starter" | "pro" | "agency";
  period?: string;
}

const FMT_RON = new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON", maximumFractionDigits: 0 });

export default function CostPerClientCard({ data, loading, plan, period = "30d" }: Props) {
  const [showModal, setShowModal]   = useState(false);
  const [hourlyRate, setHourlyRate] = useState(75);
  const [adSpend, setAdSpend]       = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("analytics_cost_prefs");
    if (saved) {
      const { hourlyRate: h, adSpend: a } = JSON.parse(saved);
      if (h) setHourlyRate(h);
      if (a !== undefined) setAdSpend(a);
    }
  }, []);

  function savePrefs() {
    localStorage.setItem("analytics_cost_prefs", JSON.stringify({ hourlyRate, adSpend }));
    setShowModal(false);
  }

  if (loading) {
    return (
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6 animate-pulse">
        <div className="h-5 bg-[#2a2a3d] rounded w-48 mb-5" />
        <div className="h-16 bg-[#2a2a3d] rounded mb-4" />
        <div className="h-3 bg-[#2a2a3d] rounded" />
      </div>
    );
  }

  const breakdown = data ? calculateCost({
    plan:          plan,
    ad_spend:      adSpend,
    hourly_rate:   hourlyRate,
    messages_sent: data.messages_sent,
    clients_won:   data.clients_won,
    period_months: periodToMonths(period),
  }) : null;

  const totalPct = breakdown?.total ?? 1;
  const subPct   = breakdown ? (breakdown.subscription / totalPct * 100) : 0;
  const adPct    = breakdown ? (breakdown.ad_spend     / totalPct * 100) : 0;
  const timePct  = breakdown ? (breakdown.time_cost    / totalPct * 100) : 0;

  return (
    <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-[#e2e2f0]">Cost per client câștigat</h3>
        <button
          onClick={() => setShowModal(true)}
          className="text-[#6b7280] hover:text-[#e2e2f0] transition-colors p-1"
          title="Configurează costurile"
        >
          <Settings size={16} />
        </button>
      </div>

      {breakdown ? (
        <>
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-4xl font-bold text-[#e2e2f0]">
              {breakdown.cost_per_client !== null ? FMT_RON.format(breakdown.cost_per_client) : "—"}
            </span>
            <span className="text-[#6b7280] text-sm">/ client ({breakdown.clients_won} clienți)</span>
          </div>

          {/* Stacked bar */}
          {breakdown.total > 0 && (
            <div className="mb-4">
              <div className="flex h-2.5 rounded-full overflow-hidden gap-px mb-3">
                {subPct  > 0 && <div className="bg-[#6366f1]" style={{ width: `${subPct}%` }} title="Abonament" />}
                {adPct   > 0 && <div className="bg-[#8b5cf6]" style={{ width: `${adPct}%` }} title="Ad spend" />}
                {timePct > 0 && <div className="bg-[#a78bfa]" style={{ width: `${timePct}%` }} title="Timp" />}
              </div>
              <div className="flex gap-4 text-xs text-[#6b7280]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#6366f1] inline-block" />Abonament {FMT_RON.format(breakdown.subscription)}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#8b5cf6] inline-block" />Ad spend {FMT_RON.format(breakdown.ad_spend)}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#a78bfa] inline-block" />Timp {FMT_RON.format(breakdown.time_cost)}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-[#6b7280]">
            {breakdown.time_hours}h muncă · {data?.messages_sent ?? 0} mesaje · total {FMT_RON.format(breakdown.total)}
          </p>
        </>
      ) : (
        <div className="h-32 flex items-center justify-center text-[#6b7280] text-sm">
          Date insuficiente pentru calcul.
        </div>
      )}

      {/* Settings modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6 w-80 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-semibold text-[#e2e2f0]">Configurare costuri</h4>
              <button onClick={() => setShowModal(false)} className="text-[#6b7280] hover:text-[#e2e2f0]"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[#6b7280] mb-1.5">Tarif orar (RON/h)</label>
                <input
                  type="number" min="0" value={hourlyRate}
                  onChange={e => setHourlyRate(Number(e.target.value))}
                  className="w-full bg-[#1c1c26] border border-[#2a2a3d] text-[#e2e2f0] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#6366f1]"
                />
                <p className="text-xs text-[#6b7280] mt-1">Valoarea timpului tău alocat outreach-ului.</p>
              </div>
              <div>
                <label className="block text-xs text-[#6b7280] mb-1.5">Cheltuieli reclame lunare (RON)</label>
                <input
                  type="number" min="0" value={adSpend}
                  onChange={e => setAdSpend(Number(e.target.value))}
                  className="w-full bg-[#1c1c26] border border-[#2a2a3d] text-[#e2e2f0] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#6366f1]"
                />
              </div>
            </div>
            <button
              onClick={savePrefs}
              className="w-full mt-5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Salvează
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
