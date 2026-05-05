"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Progress from "@radix-ui/react-progress";
import { Target, Pencil, X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface GoalItem {
  current: number;
  target: number;
  status: "reached" | "on_track" | "slightly_behind" | "behind";
}

interface GoalsData {
  goals: {
    goal_prospects: number;
    goal_contacted: number;
    goal_replies: number;
    goal_clients: number;
  };
  progress: {
    prospects: GoalItem;
    contacted: GoalItem;
    replies: GoalItem;
    clients: GoalItem;
  };
}

const STATUS_COLOR: Record<string, string> = {
  reached: "bg-[#22c55e]",
  on_track: "bg-[#6366f1]",
  slightly_behind: "bg-[#f59e0b]",
  behind: "bg-[#ef4444]",
};

const STATUS_LABEL: Record<string, string> = {
  reached: "Atins",
  on_track: "Pe drumul cel bun",
  slightly_behind: "Ușor în urmă",
  behind: "În urmă",
};

const GOAL_LABELS = [
  { key: "prospects" as const, label: "Prospecți descoperiți", goalKey: "goal_prospects" as const },
  { key: "contacted" as const, label: "Contactați", goalKey: "goal_contacted" as const },
  { key: "replies" as const, label: "Răspunsuri primite", goalKey: "goal_replies" as const },
  { key: "clients" as const, label: "Clienți câștigați", goalKey: "goal_clients" as const },
];

function GoalBar({ item, label }: { item: GoalItem; label: string }) {
  const pct = Math.min(100, Math.round((item.current / item.target) * 100));
  const color = STATUS_COLOR[item.status];

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#9ca3af]">{label}</span>
        <span className="text-xs text-[#6b7280]">
          <span className="text-[#e2e2f0] font-medium">{item.current}</span> / {item.target}
        </span>
      </div>
      <Progress.Root className="h-1.5 bg-[#2a2a3d] rounded-full overflow-hidden">
        <Progress.Indicator
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </Progress.Root>
      <div className="flex items-center justify-between mt-0.5">
        <span className={`text-[10px] ${item.status === "reached" ? "text-[#22c55e]" : item.status === "on_track" ? "text-[#6366f1]" : item.status === "slightly_behind" ? "text-[#f59e0b]" : "text-[#ef4444]"}`}>
          {STATUS_LABEL[item.status]}
        </span>
        <span className="text-[10px] text-[#6b7280]">{pct}%</span>
      </div>
    </div>
  );
}

export default function GoalsTracker() {
  const [data, setData] = useState<GoalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ goal_prospects: 50, goal_contacted: 30, goal_replies: 10, goal_clients: 2 });

  const fetchGoals = async () => {
    const res = await fetch("/api/goals");
    if (res.ok) {
      const d = await res.json();
      setData(d);
      setForm({
        goal_prospects: d.goals.goal_prospects,
        goal_contacted: d.goals.goal_contacted,
        goal_replies: d.goals.goal_replies,
        goal_clients: d.goals.goal_clients,
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchGoals(); }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Obiective salvate!");
      setEditOpen(false);
      fetchGoals();
    } else {
      toast.error("Eroare la salvare.");
    }
  }

  const now = new Date();
  const monthName = now.toLocaleDateString("ro-RO", { month: "long", year: "numeric" });

  return (
    <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#6366f1]" />
          <h2 className="text-sm font-semibold text-[#e2e2f0]">Obiective lunare</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6b7280] capitalize">{monthName}</span>
          <button
            onClick={() => setEditOpen(true)}
            className="text-[#6b7280] hover:text-[#e2e2f0] transition-colors"
            title="Editează obiectivele"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-1.5">
              <div className="h-2.5 bg-[#2a2a3d] rounded w-1/2" />
              <div className="h-1.5 bg-[#2a2a3d] rounded" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="space-y-4">
          {GOAL_LABELS.map(({ key, label }) => (
            <GoalBar key={key} item={data.progress[key]} label={label} />
          ))}
        </div>
      ) : null}

      <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-[#16161d] border border-[#2a2a3d] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-base font-semibold text-[#e2e2f0]">
                Editează obiectivele
              </Dialog.Title>
              <Dialog.Close className="text-[#6b7280] hover:text-[#e2e2f0]">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>
            <div className="space-y-3">
              {GOAL_LABELS.map(({ label, goalKey }) => (
                <div key={goalKey}>
                  <label className="block text-xs text-[#6b7280] mb-1">{label}</label>
                  <input
                    type="number"
                    min={1}
                    value={form[goalKey]}
                    onChange={(e) => setForm((f) => ({ ...f, [goalKey]: parseInt(e.target.value) || 1 }))}
                    className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#e2e2f0] focus:outline-none focus:border-[#6366f1]"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-5 w-full bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? "Se salvează..." : "Salvează"}
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
