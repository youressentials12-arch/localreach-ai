"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import type { Hook, ContactChannel, HookTone } from "@/types";
import { getChannelLabel } from "@/lib/utils";

interface HookDisplayProps {
  hooks: Hook[];
  prospectId: string;
  serviceOffered: string;
  onHooksUpdated: (hooks: Hook[]) => void;
}

const TONES: { value: HookTone; label: string }[] = [
  { value: "direct", label: "Direct" },
  { value: "empathetic", label: "Empatic" },
  { value: "curious", label: "Curios" },
  { value: "provocative", label: "Provocator" },
  { value: "professional", label: "Profesional" },
];

const ALL_CHANNELS: ContactChannel[] = [
  "email",
  "phone",
  "instagram",
  "facebook",
  "linkedin",
];

export default function HookDisplay({
  hooks,
  prospectId,
  serviceOffered,
  onHooksUpdated,
}: HookDisplayProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState<ContactChannel | "generate">(
    hooks.length > 0 ? hooks[0].channel : "generate"
  );
  const [selectedChannels, setSelectedChannels] = useState<ContactChannel[]>([
    "email",
    "phone",
  ]);
  const [selectedTone, setSelectedTone] = useState<HookTone>("direct");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const channelsWithHooks = Array.from(new Set(hooks.map((h) => h.channel))) as ContactChannel[];

  function copyHook(hook: Hook) {
    const text =
      hook.hook_subject
        ? `Subiect: ${hook.hook_subject}\n\n${hook.hook_content}`
        : hook.hook_content;
    navigator.clipboard.writeText(text);
    setCopiedId(hook.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function toggleChannel(ch: ContactChannel) {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  }

  async function handleGenerate() {
    if (selectedChannels.length === 0) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId,
          channels: selectedChannels,
          tone: selectedTone,
          serviceOffered,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Eroare la generare");
        return;
      }

      onHooksUpdated(data.hooks);
      if (data.hooks.length > 0) {
        setActiveChannel(data.hooks[0].channel);
      }
    } finally {
      setGenerating(false);
    }
  }

  const activeHooks = hooks.filter((h) => h.channel === activeChannel);

  return (
    <div id="hooks" className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4">
      <h2 className="text-sm font-semibold text-[#e2e2f0] mb-4">Hook-uri generate</h2>

      {/* Channel tabs + generate button */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {channelsWithHooks.map((ch) => (
          <button
            key={ch}
            onClick={() => setActiveChannel(ch)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeChannel === ch
                ? "bg-[#6366f1] text-white"
                : "bg-[#1c1c26] text-[#6b7280] hover:text-[#e2e2f0]"
            }`}
          >
            {getChannelLabel(ch)}
          </button>
        ))}
        <button
          onClick={() => setActiveChannel("generate")}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeChannel === "generate"
              ? "bg-[#6366f1] text-white"
              : "bg-[#1c1c26] text-[#6b7280] hover:text-[#e2e2f0]"
          }`}
        >
          + Generează
        </button>
      </div>

      {/* Generate panel */}
      {activeChannel === "generate" && (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[#6b7280] mb-2 font-medium">
              Canale dorite
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_CHANNELS.map((ch) => (
                <button
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    selectedChannels.includes(ch)
                      ? "bg-[#6366f1]/20 border-[#6366f1] text-[#6366f1]"
                      : "bg-[#1c1c26] border-[#2a2a3d] text-[#6b7280] hover:text-[#e2e2f0]"
                  }`}
                >
                  {getChannelLabel(ch)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-[#6b7280] mb-2 font-medium">
              Ton mesaj
            </p>
            <div className="flex flex-wrap gap-2">
              {TONES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSelectedTone(value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    selectedTone === value
                      ? "bg-[#6366f1]/20 border-[#6366f1] text-[#6366f1]"
                      : "bg-[#1c1c26] border-[#2a2a3d] text-[#6b7280] hover:text-[#e2e2f0]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating || selectedChannels.length === 0}
            className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {generating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {generating ? "Se generează..." : "Generează hook-uri"}
          </button>
        </div>
      )}

      {/* Display hooks */}
      {activeChannel !== "generate" && activeHooks.length > 0 && (
        <div className="space-y-3">
          {activeHooks.map((hook) => (
            <div
              key={hook.id}
              className="bg-[#1c1c26] border border-[#2a2a3d] rounded-lg p-3"
            >
              {hook.hook_subject && (
                <div className="mb-2">
                  <p className="text-xs text-[#6b7280] font-medium mb-0.5">
                    Subiect:
                  </p>
                  <p className="text-sm font-medium text-[#e2e2f0]">
                    {hook.hook_subject}
                  </p>
                </div>
              )}
              <p className="text-sm text-[#e2e2f0] whitespace-pre-wrap leading-relaxed">
                {hook.hook_content}
              </p>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#2a2a3d]">
                <button
                  onClick={() => copyHook(hook)}
                  className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#e2e2f0] transition-colors"
                >
                  {copiedId === hook.id ? (
                    <Check size={12} className="text-green-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                  {copiedId === hook.id ? "Copiat!" : "Copiază"}
                </button>
                <span className="text-[#2a2a3d]">·</span>
                <span className="text-xs text-[#6b7280]">
                  Ton: {TONES.find((t) => t.value === hook.tone)?.label ?? hook.tone}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeChannel !== "generate" && activeHooks.length === 0 && (
        <p className="text-sm text-[#6b7280]">
          Niciun hook generat pentru {getChannelLabel(activeChannel)} încă.
        </p>
      )}
    </div>
  );
}
