"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowLeft, MapPin, Briefcase } from "lucide-react";
import ProspectCard from "@/components/prospects/ProspectCard";
import type { Campaign, Prospect } from "@/types";

interface Props {
  campaign: Campaign;
  initialProspects: Prospect[];
}

const CRITERIA_LABELS: Record<string, string> = {
  no_website: "Fără website",
  weak_website: "Website slab",
  low_reviews: "Sub 20 recenzii",
  low_rating: "Rating sub 4.0",
  no_review_responses: "Nu răspunde la recenzii",
  no_social_media: "Fără social media",
  new_business: "Afacere nouă (< 2 ani)",
  incomplete_contact: "Contact incomplet",
};

export default function CampaignDetailClient({
  campaign,
  initialProspects,
}: Props) {
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchMessage, setSearchMessage] = useState("");

  const activeCriteria = Object.entries(campaign.qualification_criteria)
    .filter(([, v]) => v)
    .map(([k]) => k);

  async function handleSearch() {
    setSearching(true);
    setSearchError("");
    setSearchMessage("");

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: campaign.target_industry,
          location: campaign.target_location,
          criteria: campaign.qualification_criteria,
          campaignId: campaign.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error ?? "Eroare la căutare");
        return;
      }

      const newProspects: Prospect[] = data.prospects;
      const addedCount = newProspects.filter(
        (np) => !prospects.find((p) => p.id === np.id)
      ).length;

      setProspects((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const fresh = newProspects.filter((p) => !ids.has(p.id));
        return [...prev, ...fresh];
      });

      setSearchMessage(
        addedCount > 0
          ? `${addedCount} afaceri noi găsite și adăugate.`
          : "Nu au fost găsite afaceri noi (toate există deja)."
      );
    } finally {
      setSearching(false);
    }
  }

  function handleProspectUpdate(updated: Prospect) {
    setProspects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/campaigns"
          className="text-[#6b7280] hover:text-[#e2e2f0] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2f0]">{campaign.name}</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">
            {campaign.target_industry} · {campaign.target_location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel — campaign info */}
        <div className="space-y-4">
          <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[#e2e2f0]">
              Detalii campanie
            </h3>

            <div className="flex items-start gap-2 text-sm">
              <Briefcase size={14} className="text-[#6366f1] mt-0.5 shrink-0" />
              <div>
                <p className="text-[#6b7280] text-xs">Serviciu oferit</p>
                <p className="text-[#e2e2f0]">{campaign.service_offered}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <MapPin size={14} className="text-[#6366f1] mt-0.5 shrink-0" />
              <div>
                <p className="text-[#6b7280] text-xs">Locație</p>
                <p className="text-[#e2e2f0]">{campaign.target_location}</p>
              </div>
            </div>

            {campaign.description && (
              <p className="text-xs text-[#6b7280] pt-1 border-t border-[#2a2a3d]">
                {campaign.description}
              </p>
            )}
          </div>

          {activeCriteria.length > 0 && (
            <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#e2e2f0] mb-2">
                Criterii de calificare
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {activeCriteria.map((k) => (
                  <span
                    key={k}
                    className="text-xs bg-[#6366f1]/15 text-[#6366f1] px-2 py-0.5 rounded-full"
                  >
                    {CRITERIA_LABELS[k] ?? k}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={searching}
            className="w-full flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            {searching ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Search size={16} />
            )}
            {searching ? "Se caută..." : "Caută afaceri"}
          </button>

          {searchError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">
              {searchError}
            </div>
          )}
          {searchMessage && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 text-sm text-green-400">
              {searchMessage}
            </div>
          )}

          <p className="text-xs text-[#6b7280] text-center">
            {prospects.length} afaceri găsite
          </p>
        </div>

        {/* Right panel — prospects grid */}
        <div className="lg:col-span-2">
          {prospects.length === 0 ? (
            <div className="bg-[#16161d] border border-[#2a2a3d] border-dashed rounded-xl p-12 text-center">
              <Search size={40} className="text-[#2a2a3d] mx-auto mb-3" />
              <p className="text-[#e2e2f0] font-medium mb-1">
                Nicio afacere găsită încă
              </p>
              <p className="text-[#6b7280] text-sm">
                Apasă &quot;Caută afaceri&quot; pentru a descoperi oportunități
                în {campaign.target_location}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {prospects.map((p) => (
                <ProspectCard
                  key={p.id}
                  prospect={p}
                  campaignId={campaign.id}
                  serviceOffered={campaign.service_offered}
                  criteria={campaign.qualification_criteria as Record<string, boolean>}
                  onUpdate={handleProspectUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
