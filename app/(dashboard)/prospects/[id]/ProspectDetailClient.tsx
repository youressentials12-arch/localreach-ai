"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Phone,
  MapPin,
  Star,
  ExternalLink,
  Loader2,
  Zap,
} from "lucide-react";
import ScoreBadge from "@/components/shared/ScoreBadge";
import HookDisplay from "@/components/prospects/HookDisplay";
import {
  getStatusColor,
  getStatusLabel,
  getChannelLabel,
  formatDate,
} from "@/lib/utils";
import type { Prospect, Hook, OutreachActivity, OutreachStatus, ContactChannel } from "@/types";

const STATUS_OPTIONS: OutreachStatus[] = [
  "discovered",
  "contacted",
  "replied",
  "negotiating",
  "won",
  "lost",
  "not_qualified",
];

interface Props {
  prospect: Prospect;
  initialHooks: Hook[];
  activities: OutreachActivity[];
  serviceOffered: string;
  criteria: Record<string, boolean>;
}

export default function ProspectDetailClient({
  prospect: initialProspect,
  initialHooks,
  activities: initialActivities,
  serviceOffered,
  criteria,
}: Props) {
  const [prospect, setProspect] = useState(initialProspect);
  const [hooks, setHooks] = useState<Hook[]>(initialHooks);
  const [activities, setActivities] = useState<OutreachActivity[]>(initialActivities);
  const [notes, setNotes] = useState(prospect.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  async function handleStatusChange(status: OutreachStatus) {
    const res = await fetch("/api/prospects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: prospect.id, outreach_status: status }),
    });
    const data = await res.json();
    if (data.prospect) {
      setProspect(data.prospect);
      setActivities((prev) => [
        {
          id: Date.now().toString(),
          prospect_id: prospect.id,
          user_id: prospect.user_id,
          activity_type: "status_changed",
          details: { from: prospect.outreach_status, to: status },
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    const res = await fetch("/api/prospects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: prospect.id, notes }),
    });
    const data = await res.json();
    if (data.prospect) setProspect(data.prospect);
    setSavingNotes(false);
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prospectId: prospect.id,
        serviceOffered,
        criteria,
      }),
    });
    const data = await res.json();
    if (data.prospect) setProspect(data.prospect);
    setAnalyzing(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/prospects"
          className="text-[#6b7280] hover:text-[#e2e2f0] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#e2e2f0] truncate">
            {prospect.business_name}
          </h1>
          {prospect.business_category && (
            <p className="text-[#6b7280] text-sm mt-0.5">
              {prospect.business_category}
            </p>
          )}
        </div>
        <span
          className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(
            prospect.outreach_status
          )}`}
        >
          {getStatusLabel(prospect.outreach_status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Business info */}
          <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-[#e2e2f0]">
              Date afacere
            </h2>

            {prospect.business_address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin size={14} className="text-[#6b7280] mt-0.5 shrink-0" />
                <span className="text-[#6b7280]">{prospect.business_address}</span>
              </div>
            )}

            {prospect.business_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-[#6b7280] shrink-0" />
                <a
                  href={`tel:${prospect.business_phone}`}
                  className="text-[#6366f1] hover:underline"
                >
                  {prospect.business_phone}
                </a>
              </div>
            )}

            {prospect.business_website ? (
              <div className="flex items-center gap-2 text-sm">
                <Globe size={14} className="text-[#6b7280] shrink-0" />
                <a
                  href={prospect.business_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6366f1] hover:underline truncate"
                >
                  {prospect.business_website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-orange-400">
                <Globe size={14} className="shrink-0" />
                <span>Fără website</span>
              </div>
            )}

            {prospect.google_rating && (
              <div className="flex items-center gap-2 text-sm">
                <Star size={14} className="text-yellow-400 shrink-0" />
                <span className="text-[#6b7280]">
                  {prospect.google_rating}/5 ({prospect.google_reviews_count ?? 0}{" "}
                  recenzii)
                </span>
              </div>
            )}

            {prospect.google_maps_url && (
              <a
                href={prospect.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#6366f1] transition-colors"
              >
                <ExternalLink size={12} />
                Deschide în Google Maps
              </a>
            )}
          </div>

          {/* AI Score */}
          <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-[#e2e2f0]">
              Analiză AI
            </h2>

            {prospect.opportunity_score != null ? (
              <>
                <ScoreBadge score={prospect.opportunity_score} size="lg" />
                {prospect.analysis_summary && (
                  <p className="text-sm text-[#6b7280] leading-relaxed">
                    {prospect.analysis_summary}
                  </p>
                )}
                {(prospect.pain_points as string[] | null)?.length && (
                  <div>
                    <p className="text-xs text-[#6b7280] font-medium mb-1.5">
                      Pain points:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(prospect.pain_points as string[]).map((pp, i) => (
                        <span
                          key={i}
                          className="text-xs bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full"
                        >
                          {pp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-[#e2e2f0] transition-colors"
                >
                  {analyzing ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Zap size={12} />
                  )}
                  {analyzing ? "Se re-analizează..." : "Re-analizează"}
                </button>
              </>
            ) : (
              <div>
                <p className="text-sm text-[#6b7280] mb-3">
                  Afacerea nu a fost analizată încă.
                </p>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-60 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  {analyzing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Zap size={14} />
                  )}
                  {analyzing ? "Se analizează..." : "Analizează cu AI"}
                </button>
              </div>
            )}
          </div>

          {/* Status change */}
          <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-[#e2e2f0]">
              Schimbă status
            </h2>
            <div className="space-y-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    prospect.outreach_status === s
                      ? getStatusColor(s) + " font-medium"
                      : "text-[#6b7280] hover:bg-[#1c1c26] hover:text-[#e2e2f0]"
                  }`}
                >
                  {getStatusLabel(s)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Hooks */}
          <HookDisplay
            hooks={hooks}
            prospectId={prospect.id}
            serviceOffered={serviceOffered}
            onHooksUpdated={setHooks}
          />

          {/* Notes */}
          <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-semibold text-[#e2e2f0]">Note</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full bg-[#1c1c26] border border-[#2a2a3d] rounded-lg px-3 py-2.5 text-[#e2e2f0] text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent resize-none"
              placeholder="Adaugă note despre această afacere..."
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="text-sm bg-[#1c1c26] hover:bg-[#2a2a3d] text-[#e2e2f0] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {savingNotes ? "Se salvează..." : "Salvează nota"}
            </button>
          </div>

          {/* Activity timeline */}
          {activities.length > 0 && (
            <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4">
              <h2 className="text-sm font-semibold text-[#e2e2f0] mb-4">
                Activitate
              </h2>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[#e2e2f0]">
                        {activity.activity_type === "status_changed" &&
                          `Status schimbat: ${getStatusLabel(
                            (activity.details as { from: string })?.from
                          )} → ${getStatusLabel(
                            (activity.details as { to: string })?.to
                          )}`}
                        {activity.activity_type === "contacted" &&
                          `Contactat via ${getChannelLabel(
                            activity.channel ?? ""
                          )}`}
                        {activity.activity_type === "note_added" && "Notă adăugată"}
                        {activity.activity_type === "hook_used" && "Hook utilizat"}
                        {activity.activity_type === "replied" && "A răspuns"}
                      </p>
                      {activity.activity_type === "note_added" &&
                        activity.details && (
                          <p className="text-xs text-[#6b7280] mt-0.5 truncate">
                            {(activity.details as { note: string }).note}
                          </p>
                        )}
                    </div>
                    <span className="text-xs text-[#6b7280] shrink-0 whitespace-nowrap">
                      {formatDate(activity.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
