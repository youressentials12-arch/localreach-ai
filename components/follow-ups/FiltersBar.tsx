"use client";

import { Search, X } from "lucide-react";

interface Campaign { id: string; name: string }

interface Filters {
  status: string;
  campaign_id: string;
  channel: string;
  search: string;
}

interface Props {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  campaigns: Campaign[];
}

const STATUS_OPTIONS = [
  { value: "", label: "Toate statusurile" },
  { value: "pending", label: "În așteptare" },
  { value: "sent", label: "Trimise" },
  { value: "cancelled", label: "Anulate" },
  { value: "failed", label: "Eșuate" },
  { value: "skipped", label: "Sărite" },
];

const CHANNEL_OPTIONS = [
  { value: "", label: "Toate canalele" },
  { value: "email", label: "Email" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "manual_call", label: "Apel telefonic" },
];

export default function FiltersBar({ filters, onChange, campaigns }: Props) {
  const hasActiveFilters = filters.status || filters.campaign_id || filters.channel || filters.search;

  const selectCls = "bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#e2e2f0] focus:outline-none focus:border-[#6366f1] h-9";

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b7280]" />
        <input
          type="text"
          placeholder="Caută prospect..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="pl-8 pr-3 py-2 bg-[#1c1c26] border border-[#2a2a3d] rounded-lg text-sm text-[#e2e2f0] placeholder-[#6b7280] focus:outline-none focus:border-[#6366f1] h-9 w-48"
        />
      </div>

      {/* Campaign */}
      <select
        value={filters.campaign_id}
        onChange={(e) => onChange({ campaign_id: e.target.value })}
        className={selectCls}
      >
        <option value="">Toate campaniile</option>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Channel */}
      <select
        value={filters.channel}
        onChange={(e) => onChange({ channel: e.target.value })}
        className={selectCls}
      >
        {CHANNEL_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) => onChange({ status: e.target.value })}
        className={selectCls}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange({ status: "", campaign_id: "", channel: "", search: "" })}
          className="flex items-center gap-1 text-xs text-[#6b7280] hover:text-[#e2e2f0] transition-colors h-9 px-2"
        >
          <X className="w-3.5 h-3.5" />
          Șterge filtrele
        </button>
      )}
    </div>
  );
}
