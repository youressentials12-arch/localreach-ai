"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, Download, UserPlus, ListChecks, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Campaign {
  id: string;
  name: string;
  target_industry: string;
  target_location: string;
}

interface QuickActionsProps {
  campaigns: Campaign[];
  followUpCount: number;
}

function GenerateModal({ campaigns, onClose }: { campaigns: Campaign[]; onClose: () => void }) {
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleGenerate() {
    if (!selectedCampaign) return;
    setLoading(true);
    const tid = toast.loading("Se caută afaceri...");
    try {
      const res = await fetch("/api/prospects/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: selectedCampaign }),
      });
      const data = await res.json();
      toast.dismiss(tid);
      if (!res.ok) {
        toast.error(data.error ?? "Eroare la generare.");
      } else if (data.inserted === 0) {
        toast.info(data.message ?? "Nu s-au găsit afaceri noi.");
      } else {
        toast.success(`${data.inserted} afaceri noi adăugate!`);
        router.refresh();
        onClose();
      }
    } catch {
      toast.dismiss(tid);
      toast.error("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-[#6b7280] mb-1.5">Campanie</label>
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#e2e2f0] focus:outline-none focus:border-[#6366f1]"
        >
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.target_industry} în {c.target_location}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={handleGenerate}
        disabled={loading || !selectedCampaign}
        className="w-full bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        {loading ? "Se caută..." : "Caută afaceri"}
      </button>
    </div>
  );
}

function FollowUpsModal({ count, onClose }: { count: number; onClose: () => void }) {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#9ca3af]">
        Ai <span className="text-[#f59e0b] font-semibold">{count}</span>{" "}
        {count === 1 ? "prospect contactat" : "prospecți contactați"} care nu au răspuns în ultimele 3 zile.
      </p>
      <p className="text-xs text-[#6b7280]">
        Fă follow-up cu un mesaj scurt — rata de răspuns crește cu până la 30% după un al doilea contact.
      </p>
      <button
        onClick={() => { router.push("/prospects?status=contacted"); onClose(); }}
        className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-black text-sm font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <ListChecks className="w-4 h-4" />
        Vezi prospecții
      </button>
    </div>
  );
}

const ACTIONS = [
  {
    id: "generate",
    label: "Generează prospecți",
    description: "Caută afaceri noi",
    icon: Search,
    color: "text-[#6366f1]",
    bg: "bg-[#6366f1]/10",
  },
  {
    id: "report",
    label: "Descarcă raport",
    description: "CSV ultimele 7 zile",
    icon: Download,
    color: "text-[#22c55e]",
    bg: "bg-[#22c55e]/10",
  },
  {
    id: "followups",
    label: "Follow-up-uri",
    description: "Prospecți fără răspuns",
    icon: ListChecks,
    color: "text-[#f59e0b]",
    bg: "bg-[#f59e0b]/10",
  },
  {
    id: "new-campaign",
    label: "Campanie nouă",
    description: "Lansează o campanie",
    icon: UserPlus,
    color: "text-[#a78bfa]",
    bg: "bg-[#a78bfa]/10",
  },
];

export default function QuickActions({ campaigns, followUpCount }: QuickActionsProps) {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const router = useRouter();

  function handleAction(id: string) {
    if (id === "report") {
      window.location.href = "/api/reports/weekly";
      return;
    }
    if (id === "new-campaign") {
      router.push("/campaigns/new");
      return;
    }
    setOpenModal(id);
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            className="relative bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4 text-left hover:border-[#6366f1]/50 hover:bg-[#1c1c26] transition-all group"
          >
            {action.id === "followups" && followUpCount > 0 && (
              <span className="absolute top-2 right-2 bg-[#f59e0b] text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {followUpCount > 9 ? "9+" : followUpCount}
              </span>
            )}
            <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center mb-3`}>
              <action.icon className={`w-4 h-4 ${action.color}`} />
            </div>
            <p className="text-sm font-medium text-[#e2e2f0] leading-tight">{action.label}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Generate prospects modal */}
      <Dialog.Root open={openModal === "generate"} onOpenChange={(o) => !o && setOpenModal(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[#16161d] border border-[#2a2a3d] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-base font-semibold text-[#e2e2f0]">
                Generează prospecți noi
              </Dialog.Title>
              <Dialog.Close className="text-[#6b7280] hover:text-[#e2e2f0]">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>
            {campaigns.length === 0 ? (
              <p className="text-sm text-[#6b7280]">
                Nu ai nicio campanie activă. Creează una mai întâi.
              </p>
            ) : (
              <GenerateModal campaigns={campaigns} onClose={() => setOpenModal(null)} />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Follow-ups modal */}
      <Dialog.Root open={openModal === "followups"} onOpenChange={(o) => !o && setOpenModal(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[#16161d] border border-[#2a2a3d] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-base font-semibold text-[#e2e2f0]">
                Follow-up-uri în așteptare
              </Dialog.Title>
              <Dialog.Close className="text-[#6b7280] hover:text-[#e2e2f0]">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>
            <FollowUpsModal count={followUpCount} onClose={() => setOpenModal(null)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
