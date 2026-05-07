"use client";

import { useState } from "react";
import { Copy, X, Check, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface HookStat {
  id: string;
  subject?: string;
  content: string;
  tone: string;
  channel: string;
  got_response: boolean;
  business_name: string;
  created_at: string;
}

interface Props {
  data: HookStat[];
  loading: boolean;
}

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email", sms: "SMS", whatsapp: "WhatsApp", linkedin: "LinkedIn",
  instagram: "Instagram", facebook: "Facebook",
};

const TONE_LABELS: Record<string, string> = {
  direct: "Direct", empathetic: "Empatic", curious: "Curios",
  provocative: "Provocator", professional: "Professional",
};

type SortDir = "desc" | "asc";

export default function TopHooksTable({ data, loading }: Props) {
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<HookStat | null>(null);
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6 animate-pulse">
        <div className="h-5 bg-[#2a2a3d] rounded w-52 mb-5" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-[#2a2a3d] rounded" />)}
        </div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => {
    const av = a.got_response ? 1 : 0;
    const bv = b.got_response ? 1 : 0;
    return sortDir === "desc" ? bv - av : av - bv;
  });

  async function copyHook(hook: HookStat) {
    const text = hook.subject ? `${hook.subject}\n\n${hook.content}` : hook.content;
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    toast.success("Hook copiat în clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-[#e2e2f0]">Top hook-uri performante</h3>
        <span className="text-xs text-[#6b7280]">{data.length} hook-uri folosite</span>
      </div>

      {sorted.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-[#6b7280] text-sm">
          Nicio dată disponibilă pentru perioada selectată.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a3d]">
                <th className="text-left text-xs text-[#6b7280] font-medium pb-2 pr-4 w-8">#</th>
                <th className="text-left text-xs text-[#6b7280] font-medium pb-2 pr-4">Subiect / Conținut</th>
                <th className="text-left text-xs text-[#6b7280] font-medium pb-2 pr-4">Canal</th>
                <th className="text-left text-xs text-[#6b7280] font-medium pb-2 pr-4">Ton</th>
                <th
                  className="text-left text-xs text-[#6b7280] font-medium pb-2 pr-4 cursor-pointer hover:text-[#e2e2f0] transition-colors"
                  onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
                >
                  <span className="flex items-center gap-1">
                    Răspuns
                    {sortDir === "desc" ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                  </span>
                </th>
                <th className="pb-2 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3d]">
              {sorted.map((hook, i) => (
                <tr
                  key={hook.id}
                  className="hover:bg-[#1c1c26] transition-colors cursor-pointer"
                  onClick={() => setSelected(hook)}
                >
                  <td className="py-3 pr-4 text-[#6b7280] text-xs align-top">
                    {i === 0 && <span className="text-yellow-400">🥇</span>}
                    {i === 1 && <span className="text-gray-300">🥈</span>}
                    {i === 2 && <span className="text-amber-600">🥉</span>}
                    {i > 2 && <span className="text-[#6b7280]">{i + 1}</span>}
                  </td>
                  <td className="py-3 pr-4 max-w-xs align-top">
                    {hook.subject && <p className="text-[#e2e2f0] font-medium truncate text-xs mb-0.5">{hook.subject}</p>}
                    <p className="text-[#6b7280] text-xs truncate">{hook.content.slice(0, 80)}{hook.content.length > 80 ? "…" : ""}</p>
                  </td>
                  <td className="py-3 pr-4 text-xs text-[#6b7280] align-top whitespace-nowrap">
                    {CHANNEL_LABELS[hook.channel] ?? hook.channel}
                  </td>
                  <td className="py-3 pr-4 text-xs text-[#6b7280] align-top">
                    {TONE_LABELS[hook.tone] ?? hook.tone}
                  </td>
                  <td className="py-3 pr-4 align-top">
                    {hook.got_response ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                        <Check size={10} />Top
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 text-xs px-2 py-0.5 rounded-full">
                        Fără răspuns
                      </span>
                    )}
                  </td>
                  <td className="py-3 align-top" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => copyHook(hook)}
                      className="text-[#6b7280] hover:text-[#6366f1] transition-colors p-1"
                      title="Duplică hook"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelected(null)}>
          <div
            className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-[#6b7280]">Hook pentru {selected.business_name}</p>
                {selected.subject && <p className="text-[#e2e2f0] font-semibold mt-1">{selected.subject}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="text-[#6b7280] hover:text-[#e2e2f0] ml-4 shrink-0">
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#1c1c26] rounded-lg p-4 text-sm text-[#e2e2f0] whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto mb-4">
              {selected.content}
            </div>

            <div className="flex items-center gap-3 text-xs text-[#6b7280] mb-4">
              <span>Canal: {CHANNEL_LABELS[selected.channel] ?? selected.channel}</span>
              <span>·</span>
              <span>Ton: {TONE_LABELS[selected.tone] ?? selected.tone}</span>
              <span>·</span>
              {selected.got_response
                ? <span className="text-emerald-400">✓ A primit răspuns</span>
                : <span className="text-red-400">✗ Fără răspuns</span>}
            </div>

            <button
              onClick={() => copyHook(selected)}
              className="w-full flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              <Copy size={14} />
              Duplică hook (copiază)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
