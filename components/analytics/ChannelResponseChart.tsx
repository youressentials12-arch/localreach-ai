"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email", sms: "SMS", whatsapp: "WhatsApp",
  linkedin: "LinkedIn", manual_call: "Apel", instagram: "Instagram", facebook: "Facebook",
};

interface ChannelStat { channel: string; sent: number; replied: number; reply_rate: number }

interface Props {
  data: ChannelStat[];
  insight: string;
  loading: boolean;
}

export default function ChannelResponseChart({ data, insight, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6 animate-pulse">
        <div className="h-5 bg-[#2a2a3d] rounded w-52 mb-5" />
        <div className="h-48 bg-[#2a2a3d] rounded" />
      </div>
    );
  }

  const chartData = data
    .map(d => ({
      name: CHANNEL_LABELS[d.channel] ?? d.channel,
      rate: Math.round(d.reply_rate * 100),
      sent: d.sent,
    }))
    .sort((a, b) => b.rate - a.rate);

  return (
    <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6">
      <h3 className="text-base font-semibold text-[#e2e2f0] mb-5">Rata răspuns per canal</h3>

      {chartData.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-[#6b7280] text-sm">
          Nicio dată disponibilă pentru perioada selectată.
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={Math.max(140, chartData.length * 46)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 28, bottom: 0, left: 64 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3d" horizontal={false} />
              <XAxis
                type="number" domain={[0, 100]}
                tickFormatter={v => `${v}%`}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                type="category" dataKey="name" width={60}
                tick={{ fill: "#e2e2f0", fontSize: 13 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "#6366f1", opacity: 0.06 }}
                contentStyle={{ background: "#1c1c26", border: "1px solid #2a2a3d", borderRadius: 8, color: "#e2e2f0", fontSize: 12 }}
                formatter={(value: number, _name: string, props: { payload?: { sent?: number } }) => [
                  `${value}%  (${props?.payload?.sent ?? 0} trimise)`,
                  "Rată răspuns",
                ]}
              />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill="#6366f1" fillOpacity={i === 0 ? 1 : 0.65 - i * 0.06} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {insight && (
            <p className="text-sm text-[#a5b4fc] mt-4 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg px-3 py-2.5 leading-relaxed">
              💡 {insight}
            </p>
          )}
        </>
      )}
    </div>
  );
}
