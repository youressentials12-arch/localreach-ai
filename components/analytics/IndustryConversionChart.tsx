"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface IndustryStat { industry: string; contacted: number; won: number; conversion_rate: number }

interface Props {
  data: IndustryStat[];
  loading: boolean;
}

type SortKey = "conversion_rate" | "contacted" | "won";

export default function IndustryConversionChart({ data, loading }: Props) {
  const [sortBy, setSortBy]           = useState<SortKey>("conversion_rate");
  const [hideLowSample, setHideLow]   = useState(false);

  if (loading) {
    return (
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6 animate-pulse">
        <div className="h-5 bg-[#2a2a3d] rounded w-64 mb-5" />
        <div className="h-64 bg-[#2a2a3d] rounded" />
      </div>
    );
  }

  const chartData = data
    .filter(d => !hideLowSample || d.contacted >= 5)
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, 12)
    .map(d => ({
      name:     d.industry.length > 15 ? d.industry.slice(0, 15) + "…" : d.industry,
      fullName: d.industry,
      Contactate: d.contacted,
      Câștigate:  d.won,
    }));

  return (
    <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h3 className="text-base font-semibold text-[#e2e2f0]">Rata conversie per industrie</h3>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-[#6b7280] cursor-pointer select-none">
            <input
              type="checkbox" checked={hideLowSample}
              onChange={e => setHideLow(e.target.checked)}
              className="accent-[#6366f1]"
            />
            Ascunde &lt;5 contacte
          </label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
            className="bg-[#1c1c26] border border-[#2a2a3d] text-[#e2e2f0] text-xs rounded-lg px-2 py-1 outline-none"
          >
            <option value="conversion_rate">Sortare: Conversie</option>
            <option value="contacted">Sortare: Contactate</option>
            <option value="won">Sortare: Câștigate</option>
          </select>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-[#6b7280] text-sm">
          Nicio dată disponibilă pentru perioada selectată.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={270}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 28, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false} tickLine={false}
              angle={-20} textAnchor="end"
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "#6366f1", opacity: 0.06 }}
              contentStyle={{ background: "#1c1c26", border: "1px solid #2a2a3d", borderRadius: 8, color: "#e2e2f0", fontSize: 12 }}
              labelFormatter={(_: unknown, payload: { payload?: { fullName?: string } }[]) =>
                payload?.[0]?.payload?.fullName ?? ""}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#6b7280", paddingTop: 8 }} />
            <Bar dataKey="Contactate" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={26} />
            <Bar dataKey="Câștigate"  fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
