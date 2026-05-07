"use client";

import { TrendingUp, TrendingDown, Minus, MessageSquare, Reply, Trophy, Target, Zap } from "lucide-react";

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email", sms: "SMS", whatsapp: "WhatsApp",
  linkedin: "LinkedIn", manual_call: "Apel", instagram: "Instagram", facebook: "Facebook",
};

interface OverviewData {
  current:  { messages_sent: number; reply_rate: number; conversion_rate: number; clients_won: number; best_channel: string | null };
  previous: { messages_sent: number; reply_rate: number; conversion_rate: number; clients_won: number };
}

interface Props {
  data: OverviewData | null;
  loading: boolean;
}

function trend(curr: number, prev: number): { dir: "up" | "down" | "same"; pct: number } {
  if (!prev) return { dir: "same", pct: 0 };
  const pct = Math.round(((curr - prev) / prev) * 100);
  return { dir: pct > 0 ? "up" : pct < 0 ? "down" : "same", pct: Math.abs(pct) };
}

function TrendBadge({ dir, pct }: { dir: "up" | "down" | "same"; pct: number }) {
  if (dir === "same" || !pct) return <span className="flex items-center gap-0.5 text-[#6b7280] text-xs"><Minus size={10} />—</span>;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${dir === "up" ? "text-emerald-400" : "text-red-400"}`}>
      {dir === "up" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {pct}%
    </span>
  );
}

function Card({
  label, value, trend: tr, icon: Icon, accent = false, loading,
}: {
  label: string;
  value: string;
  trend?: ReturnType<typeof trend>;
  icon: React.ElementType;
  accent?: boolean;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-5 animate-pulse">
        <div className="h-3 bg-[#2a2a3d] rounded w-28 mb-4" />
        <div className="h-7 bg-[#2a2a3d] rounded w-16" />
      </div>
    );
  }
  return (
    <div className={`bg-[#16161d] border rounded-xl p-5 ${accent ? "border-[#6366f1]/40" : "border-[#2a2a3d]"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#6b7280] text-xs font-medium">{label}</span>
        <Icon size={15} className={accent ? "text-[#6366f1]" : "text-[#4b5563]"} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-bold text-[#e2e2f0] leading-none">{value}</p>
        {tr && <TrendBadge {...tr} />}
      </div>
    </div>
  );
}

export default function KPIOverview({ data, loading }: Props) {
  const c = data?.current;
  const p = data?.previous;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card label="Mesaje trimise"   value={c ? String(c.messages_sent) : "—"} trend={c && p ? trend(c.messages_sent, p.messages_sent) : undefined} icon={MessageSquare} loading={loading} />
      <Card label="Rată răspuns"     value={c ? `${Math.round(c.reply_rate * 100)}%` : "—"} trend={c && p ? trend(c.reply_rate, p.reply_rate) : undefined} icon={Reply} accent loading={loading} />
      <Card label="Rată conversie"   value={c ? `${Math.round(c.conversion_rate * 100)}%` : "—"} trend={c && p ? trend(c.conversion_rate, p.conversion_rate) : undefined} icon={Target} loading={loading} />
      <Card label="Clienți câștigați" value={c ? String(c.clients_won) : "—"} trend={c && p ? trend(c.clients_won, p.clients_won) : undefined} icon={Trophy} loading={loading} />
      <Card label="Cel mai bun canal" value={c?.best_channel ? (CHANNEL_LABELS[c.best_channel] ?? c.best_channel) : "—"} icon={Zap} loading={loading} />
    </div>
  );
}
