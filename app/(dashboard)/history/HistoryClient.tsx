"use client";

import { useState } from "react";
import Link from "next/link";
import ProspectKanban from "@/components/prospects/ProspectKanban";
import ScoreBadge from "@/components/shared/ScoreBadge";
import {
  getStatusColor,
  getStatusLabel,
  getChannelLabel,
  formatDate,
} from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";
import type { Prospect } from "@/types";

interface Props {
  prospects: Prospect[];
  campaigns: { id: string; name: string }[];
  stats: {
    totalContacted: number;
    responseRate: number;
    won: number;
    bestIndustry: string;
  };
}

export default function HistoryClient({ prospects, campaigns, stats }: Props) {
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const [filterCampaign, setFilterCampaign] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filtered = prospects.filter((p) => {
    if (filterCampaign && p.campaign_id !== filterCampaign) return false;
    if (filterStatus && p.outreach_status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e2f0]">Istoric CRM</h1>
        <p className="text-[#6b7280] text-sm mt-0.5">
          Urmărește toate afacerile contactate
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total contactate", value: stats.totalContacted },
          { label: "Rată răspuns", value: `${stats.responseRate}%` },
          { label: "Clienți câștigați", value: stats.won },
          { label: "Cea mai bună industrie", value: stats.bestIndustry },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-[#16161d] border border-[#2a2a3d] rounded-xl px-4 py-3"
          >
            <p className="text-xs text-[#6b7280] font-medium">{label}</p>
            <p className="text-xl font-bold text-[#e2e2f0] mt-0.5 truncate">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-[#16161d] border border-[#2a2a3d] rounded-lg p-0.5">
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
              view === "kanban"
                ? "bg-[#6366f1] text-white"
                : "text-[#6b7280] hover:text-[#e2e2f0]"
            }`}
          >
            <LayoutGrid size={13} />
            Kanban
          </button>
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors ${
              view === "table"
                ? "bg-[#6366f1] text-white"
                : "text-[#6b7280] hover:text-[#e2e2f0]"
            }`}
          >
            <List size={13} />
            Tabel
          </button>
        </div>

        <select
          value={filterCampaign}
          onChange={(e) => setFilterCampaign(e.target.value)}
          className="bg-[#16161d] border border-[#2a2a3d] rounded-lg px-3 py-1.5 text-sm text-[#e2e2f0] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
        >
          <option value="">Toate campaniile</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#16161d] border border-[#2a2a3d] rounded-lg px-3 py-1.5 text-sm text-[#e2e2f0] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
        >
          <option value="">Toate statusurile</option>
          {[
            "discovered",
            "contacted",
            "replied",
            "negotiating",
            "won",
            "lost",
            "not_qualified",
          ].map((s) => (
            <option key={s} value={s}>
              {getStatusLabel(s)}
            </option>
          ))}
        </select>

        <span className="text-xs text-[#6b7280]">{filtered.length} afaceri</span>
      </div>

      {/* Views */}
      {view === "kanban" ? (
        <ProspectKanban initialProspects={filtered} />
      ) : (
        <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a3d] text-xs text-[#6b7280]">
                  <th className="text-left px-4 py-3 font-medium">Afacere</th>
                  <th className="text-left px-4 py-3 font-medium">Industrie</th>
                  <th className="text-left px-4 py-3 font-medium">Canal</th>
                  <th className="text-left px-4 py-3 font-medium">Data contact</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Scor</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3d]">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1c1c26] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#e2e2f0] truncate max-w-[180px]">
                        {p.business_name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">
                      {p.business_category ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">
                      {p.contact_channel
                        ? getChannelLabel(p.contact_channel)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#6b7280] text-xs whitespace-nowrap">
                      {p.contacted_at ? formatDate(p.contacted_at) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                          p.outreach_status
                        )}`}
                      >
                        {getStatusLabel(p.outreach_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.opportunity_score != null ? (
                        <ScoreBadge score={p.opportunity_score} size="sm" />
                      ) : (
                        <span className="text-[#6b7280]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/prospects/${p.id}`}
                        className="text-xs text-[#6366f1] hover:underline"
                      >
                        Deschide
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
