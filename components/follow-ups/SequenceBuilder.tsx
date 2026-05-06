"use client";

import { useState, useEffect, useCallback } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Plus, Save, Loader2, Users, Send, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import StepCard from "./StepCard";
import type { FollowUpSequence, FollowUpStep } from "@/types";

interface Props {
  campaignId: string;
}

const TIMEZONES = [
  { value: "Europe/Bucharest", label: "Europa/București (UTC+2/+3)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "Londra (UTC+0/+1)" },
  { value: "Europe/Berlin", label: "Berlin (UTC+1/+2)" },
];

export default function SequenceBuilder({ campaignId }: Props) {
  const [sequence, setSequence] = useState<FollowUpSequence | null>(null);
  const [steps, setSteps] = useState<FollowUpStep[]>([]);
  const [stats, setStats] = useState({ prospectsInSequence: 0, sentThisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingStep, setAddingStep] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const load = useCallback(async () => {
    const res = await fetch(`/api/campaigns/${campaignId}/sequence`);
    if (res.ok) {
      const data = await res.json();
      setSequence(data.sequence);
      setSteps(data.steps ?? []);
      if (data.stats) setStats(data.stats);
    }
    setLoading(false);
  }, [campaignId]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setSaving(true);
    const seqData = sequence ?? {};
    const res = await fetch(`/api/campaigns/${campaignId}/sequence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(seqData),
    });
    if (res.ok) {
      const data = await res.json();
      setSequence(data.sequence);
      setSteps(data.steps ?? steps);
      toast.success("Secvența a fost salvată!");
    } else {
      toast.error("Eroare la salvare.");
    }
    setSaving(false);
  }

  async function handleAddStep() {
    if (!sequence) { await handleSave(); return; }
    if (steps.length >= 7) { toast.error("Maxim 7 pași per secvență."); return; }
    setAddingStep(true);
    const res = await fetch(`/api/sequences/${sequence.id}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delay_days: 3, channel: "email", tone: "friendly", use_ai_generation: true, body_template: "" }),
    });
    if (res.ok) {
      const data = await res.json();
      setSteps((s) => [...s, data.step]);
    }
    setAddingStep(false);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = steps.findIndex((s) => s.id === active.id);
    const newIndex = steps.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(steps, oldIndex, newIndex).map((s, i) => ({ ...s, step_order: i + 1 }));
    setSteps(reordered);

    // Persist new order
    await Promise.all(
      reordered.map((s) =>
        fetch(`/api/steps/${s.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step_order: s.step_order }),
        })
      )
    );
  }

  async function handleStepUpdate(id: string, changes: Partial<FollowUpStep>) {
    setSteps((ss) => ss.map((s) => (s.id === id ? { ...s, ...changes } : s)));
    if (sequence) {
      await fetch(`/api/steps/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
    }
  }

  async function handleStepDelete(id: string) {
    setSteps((ss) => ss.filter((s) => s.id !== id));
    await fetch(`/api/steps/${id}`, { method: "DELETE" });
    toast.success("Pasul a fost șters.");
  }

  function updateSeq(changes: Partial<FollowUpSequence>) {
    setSequence((s) => (s ? { ...s, ...changes } : null));
  }

  const inputCls = "bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#e2e2f0] focus:outline-none focus:border-[#6366f1]";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  const seqForm = sequence ?? {
    name: "Secvență principală",
    enabled: false,
    send_window_start: "09:00",
    send_window_end: "18:00",
    send_on_weekends: false,
    timezone: "Europe/Bucharest",
    max_per_day: 50,
  } as Partial<FollowUpSequence>;

  return (
    <div className="space-y-6">
      {/* Settings card */}
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#e2e2f0]">Setări secvență</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6b7280]">{seqForm.enabled ? "Activă" : "Inactivă"}</span>
            <button
              onClick={() => updateSeq({ enabled: !seqForm.enabled })}
              className={`w-10 h-5 rounded-full transition-colors relative ${seqForm.enabled ? "bg-[#6366f1]" : "bg-[#2a2a3d]"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${seqForm.enabled ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-[#6b7280] mb-1">Nume secvență</label>
            <input
              type="text"
              value={seqForm.name ?? ""}
              onChange={(e) => updateSeq({ name: e.target.value })}
              className={`${inputCls} w-full`}
            />
          </div>
          <div>
            <label className="block text-xs text-[#6b7280] mb-1">Fereastră trimitere</label>
            <div className="flex gap-2">
              <input type="time" value={seqForm.send_window_start ?? "09:00"} onChange={(e) => updateSeq({ send_window_start: e.target.value })} className={`${inputCls} flex-1`} />
              <span className="text-[#6b7280] self-center">—</span>
              <input type="time" value={seqForm.send_window_end ?? "18:00"} onChange={(e) => updateSeq({ send_window_end: e.target.value })} className={`${inputCls} flex-1`} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#6b7280] mb-1">Max trimiteri/zi</label>
            <input
              type="number"
              min={1}
              max={500}
              value={seqForm.max_per_day ?? 50}
              onChange={(e) => updateSeq({ max_per_day: parseInt(e.target.value) || 50 })}
              className={`${inputCls} w-full`}
            />
          </div>
          <div>
            <label className="block text-xs text-[#6b7280] mb-1">Fus orar</label>
            <select value={seqForm.timezone ?? "Europe/Bucharest"} onChange={(e) => updateSeq({ timezone: e.target.value })} className={`${inputCls} w-full`}>
              {TIMEZONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              id="weekends"
              checked={seqForm.send_on_weekends ?? false}
              onChange={(e) => updateSeq({ send_on_weekends: e.target.checked })}
              className="w-4 h-4 accent-[#6366f1]"
            />
            <label htmlFor="weekends" className="text-sm text-[#9ca3af]">Trimite și în weekend</label>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Se salvează..." : "Salvează setările"}
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#e2e2f0]">Pași secvență ({steps.length}/7)</h3>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {steps.map((step, i) => (
              <StepCard
                key={step.id}
                step={step}
                index={i}
                onUpdate={handleStepUpdate}
                onDelete={handleStepDelete}
              />
            ))}
          </SortableContext>
        </DndContext>

        {steps.length < 7 && (
          <button
            onClick={handleAddStep}
            disabled={addingStep}
            className="w-full border border-dashed border-[#2a2a3d] hover:border-[#6366f1] rounded-xl py-4 text-sm text-[#6b7280] hover:text-[#6366f1] transition-colors flex items-center justify-center gap-2"
          >
            {addingStep ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Adaugă pas
          </button>
        )}
      </div>

      {/* Stats footer */}
      {sequence && (
        <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#6366f1] mb-1">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">În secvență</span>
            </div>
            <p className="text-xl font-bold text-[#e2e2f0]">{stats.prospectsInSequence}</p>
            <p className="text-xs text-[#6b7280]">prospecți activi</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#22c55e] mb-1">
              <Send className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Săptămâna asta</span>
            </div>
            <p className="text-xl font-bold text-[#e2e2f0]">{stats.sentThisWeek}</p>
            <p className="text-xs text-[#6b7280]">mesaje trimise</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#f59e0b] mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Pași activi</span>
            </div>
            <p className="text-xl font-bold text-[#e2e2f0]">{steps.length}</p>
            <p className="text-xs text-[#6b7280]">din 7 maxim</p>
          </div>
        </div>
      )}
    </div>
  );
}
