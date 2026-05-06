"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Send, Clock, AlertTriangle } from "lucide-react";

interface Stats {
  scheduledToday: number;
  sentThisWeek: number;
  waitingReply: number;
  failed: number;
}

interface Props {
  onFilterFailed?: () => void;
}

export default function StatsCards({ onFilterFailed }: Props) {
  const [stats, setStats] = useState<Stats>({ scheduledToday: 0, sentThisWeek: 0, waitingReply: 0, failed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/follow-ups/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Programate azi", value: stats.scheduledToday, icon: CalendarClock, color: "text-[#6366f1]", bg: "bg-[#6366f1]/10" },
    { label: "Trimise săptămâna asta", value: stats.sentThisWeek, icon: Send, color: "text-[#22c55e]", bg: "bg-[#22c55e]/10" },
    { label: "Așteaptă răspuns", value: stats.waitingReply, icon: Clock, color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
    { label: "Eșuate", value: stats.failed, icon: AlertTriangle, color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", onClick: stats.failed > 0 ? onFilterFailed : undefined },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <button
          key={c.label}
          onClick={c.onClick}
          className={`bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4 text-left transition-all ${c.onClick ? "hover:border-[#ef4444]/50 cursor-pointer" : "cursor-default"}`}
        >
          <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
            <c.icon className={`w-4 h-4 ${c.color}`} />
          </div>
          <p className="text-2xl font-bold text-[#e2e2f0]">
            {loading ? "—" : c.value}
          </p>
          <p className="text-xs text-[#6b7280] mt-0.5">{c.label}</p>
        </button>
      ))}
    </div>
  );
}
