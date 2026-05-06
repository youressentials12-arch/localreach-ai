"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, ChevronDown, ChevronUp, Eye, Loader2, Mail, Phone, Linkedin, MessageSquare } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { FollowUpStep, FollowUpTone, FollowUpChannel } from "@/types";

interface Props {
  step: FollowUpStep;
  index: number;
  onUpdate: (id: string, changes: Partial<FollowUpStep>) => void;
  onDelete: (id: string) => void;
}

const CHANNEL_OPTIONS: { value: FollowUpChannel; label: string; icon: React.ElementType }[] = [
  { value: "email", label: "Email", icon: Mail },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "sms", label: "SMS", icon: MessageSquare },
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { value: "manual_call", label: "Apel telefonic", icon: Phone },
];

const TONE_OPTIONS: { value: FollowUpTone; label: string }[] = [
  { value: "friendly", label: "Prietenos" },
  { value: "direct", label: "Direct" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "professional", label: "Profesional" },
];

const VARS = ["{{prospect_name}}", "{{business_name}}", "{{city}}", "{{gap_identified}}", "{{user_name}}", "{{user_company}}"];

export default function StepCard({ step, index, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(index === 0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<{ subject?: string; body: string } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  async function loadPreview() {
    setLoadingPreview(true);
    const res = await fetch(`/api/steps/${step.id}/preview`, { method: "POST" });
    if (res.ok) setPreview(await res.json());
    setLoadingPreview(false);
    setPreviewOpen(true);
  }

  const inputCls = "w-full bg-[#0f0f13] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#e2e2f0] focus:outline-none focus:border-[#6366f1]";

  return (
    <div ref={setNodeRef} style={style} className="bg-[#1c1c26] border border-[#2a2a3d] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button {...attributes} {...listeners} className="text-[#2a2a3d] hover:text-[#6b7280] cursor-grab active:cursor-grabbing touch-none">
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="w-6 h-6 rounded-full bg-[#6366f1] text-white text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#e2e2f0] truncate">
            Pasul {index + 1} · După {step.delay_days} zile{step.delay_hours > 0 ? ` ${step.delay_hours}h` : ""} · {CHANNEL_OPTIONS.find((c) => c.value === step.channel)?.label ?? step.channel}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={loadPreview} className="text-[#6b7280] hover:text-[#e2e2f0] p-1" title="Previzualizare">
            {loadingPreview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(step.id)} className="text-[#6b7280] hover:text-[#ef4444] p-1" title="Șterge">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={() => setExpanded((e) => !e)} className="text-[#6b7280] hover:text-[#e2e2f0] p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#2a2a3d] pt-3">
          {/* Delay */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-[#6b7280] mb-1">Zile întârziere</label>
              <input type="number" min={0} value={step.delay_days} onChange={(e) => onUpdate(step.id, { delay_days: parseInt(e.target.value) || 0 })} className={inputCls} />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#6b7280] mb-1">Ore suplimentare</label>
              <input type="number" min={0} max={23} value={step.delay_hours} onChange={(e) => onUpdate(step.id, { delay_hours: parseInt(e.target.value) || 0 })} className={inputCls} />
            </div>
          </div>

          {/* Channel */}
          <div>
            <label className="block text-xs text-[#6b7280] mb-1">Canal</label>
            <select value={step.channel} onChange={(e) => onUpdate(step.id, { channel: e.target.value as FollowUpChannel })} className={inputCls}>
              {CHANNEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Subject (email only) */}
          {step.channel === "email" && (
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">Subiect email</label>
              <input type="text" value={step.subject_template ?? ""} onChange={(e) => onUpdate(step.id, { subject_template: e.target.value })} placeholder="Ex: Idee pentru {{business_name}}" className={inputCls} />
            </div>
          )}

          {/* AI toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#6b7280]">Generează cu AI la trimitere</label>
            <button
              onClick={() => onUpdate(step.id, { use_ai_generation: !step.use_ai_generation })}
              className={`w-10 h-5 rounded-full transition-colors relative ${step.use_ai_generation ? "bg-[#6366f1]" : "bg-[#2a2a3d]"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${step.use_ai_generation ? "left-5" : "left-0.5"}`} />
            </button>
          </div>

          {/* Tone */}
          <div>
            <label className="block text-xs text-[#6b7280] mb-1">Ton</label>
            <select value={step.tone} onChange={(e) => onUpdate(step.id, { tone: e.target.value as FollowUpTone })} className={inputCls}>
              {TONE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Body template */}
          {!step.use_ai_generation && (
            <div>
              <label className="block text-xs text-[#6b7280] mb-1">Mesaj</label>
              <textarea
                rows={4}
                value={step.body_template}
                onChange={(e) => onUpdate(step.id, { body_template: e.target.value })}
                className={`${inputCls} resize-y`}
                placeholder="Scrie mesajul sau folosește variabilele de mai jos..."
              />
              {/* Variable chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {VARS.map((v) => (
                  <button
                    key={v}
                    onClick={() => onUpdate(step.id, { body_template: step.body_template + v })}
                    className="text-[10px] bg-[#6366f1]/15 text-[#6366f1] px-2 py-0.5 rounded-full hover:bg-[#6366f1]/30 transition-colors font-mono"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview modal */}
      <Dialog.Root open={previewOpen} onOpenChange={setPreviewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-[#16161d] border border-[#2a2a3d] rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-base font-semibold text-[#e2e2f0]">Previzualizare mesaj</Dialog.Title>
              <Dialog.Close className="text-[#6b7280] hover:text-[#e2e2f0]"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            {preview ? (
              <div className="space-y-3">
                {preview.subject && (
                  <div>
                    <p className="text-xs text-[#6b7280] mb-1">Subiect</p>
                    <p className="text-sm font-medium text-[#e2e2f0] bg-[#1c1c26] rounded-lg px-3 py-2">{preview.subject}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-[#6b7280] mb-1">Mesaj</p>
                  <pre className="text-sm text-[#9ca3af] bg-[#1c1c26] rounded-lg p-3 whitespace-pre-wrap font-sans">{preview.body}</pre>
                </div>
                <p className="text-xs text-[#6b7280] italic">* Date de exemplu: Restaurant La Mama, Cluj-Napoca</p>
              </div>
            ) : (
              <p className="text-sm text-[#6b7280]">Eroare la generarea previzualizării.</p>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
