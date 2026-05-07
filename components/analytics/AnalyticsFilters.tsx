"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, RotateCcw } from "lucide-react";

const PERIOD_OPTIONS = [
  { value: "7d",  label: "Ultimele 7 zile" },
  { value: "30d", label: "Ultima lună" },
  { value: "90d", label: "Ultimele 3 luni" },
  { value: "12m", label: "Ultimul an" },
];

const CHANNEL_OPTIONS = [
  { value: "",           label: "Toate canalele" },
  { value: "email",      label: "Email" },
  { value: "sms",        label: "SMS" },
  { value: "whatsapp",   label: "WhatsApp" },
  { value: "linkedin",   label: "LinkedIn" },
  { value: "instagram",  label: "Instagram" },
  { value: "facebook",   label: "Facebook" },
];

interface Props {
  campaigns: { id: string; name: string }[];
}

export default function AnalyticsFilters({ campaigns }: Props) {
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();

  const period   = searchParams.get("period")   ?? "30d";
  const campaign = searchParams.get("campaign") ?? "";
  const channel  = searchParams.get("channel")  ?? "";
  const industry = searchParams.get("industry") ?? "";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = period !== "30d" || campaign || channel || industry;

  return (
    <div className="sticky top-0 z-20 bg-[#0d0d14]/95 backdrop-blur border-b border-[#2a2a3d] -mx-6 px-6 py-3 mb-6 print:hidden">
      <div className="flex flex-wrap items-center gap-2.5">
        <Filter size={13} className="text-[#6b7280] shrink-0" />

        <select
          value={period}
          onChange={e => update("period", e.target.value)}
          className="bg-[#16161d] border border-[#2a2a3d] text-[#e2e2f0] text-sm rounded-lg px-3 py-1.5 outline-none focus:border-[#6366f1]"
        >
          {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {campaigns.length > 0 && (
          <select
            value={campaign}
            onChange={e => update("campaign", e.target.value)}
            className="bg-[#16161d] border border-[#2a2a3d] text-[#e2e2f0] text-sm rounded-lg px-3 py-1.5 outline-none focus:border-[#6366f1]"
          >
            <option value="">Toate campaniile</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}

        <select
          value={channel}
          onChange={e => update("channel", e.target.value)}
          className="bg-[#16161d] border border-[#2a2a3d] text-[#e2e2f0] text-sm rounded-lg px-3 py-1.5 outline-none focus:border-[#6366f1]"
        >
          {CHANNEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <input
          type="text"
          placeholder="Industrie..."
          value={industry}
          onChange={e => update("industry", e.target.value)}
          className="bg-[#16161d] border border-[#2a2a3d] text-[#e2e2f0] text-sm rounded-lg px-3 py-1.5 outline-none focus:border-[#6366f1] placeholder:text-[#6b7280] w-40"
        />

        {hasFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#e2e2f0] transition-colors px-2"
          >
            <RotateCcw size={12} />
            Resetează
          </button>
        )}
      </div>
    </div>
  );
}
