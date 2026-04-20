"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Globe,
  Phone,
  MapPin,
  Loader2,
  Zap,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import ScoreBadge from "@/components/shared/ScoreBadge";
import { getStatusColor, getStatusLabel, getChannelLabel } from "@/lib/utils";
import type { Prospect, ContactChannel } from "@/types";

interface ProspectCardProps {
  prospect: Prospect;
  campaignId: string;
  serviceOffered: string;
  criteria: Record<string, boolean>;
  onUpdate: (updated: Prospect) => void;
}

const CHANNELS: ContactChannel[] = ["email", "phone", "instagram", "facebook", "linkedin"];

export default function ProspectCard({
  prospect,
  campaignId,
  serviceOffered,
  criteria,
  onUpdate,
}: ProspectCardProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingHooks, setGeneratingHooks] = useState(false);
  const [markingContact, setMarkingContact] = useState(false);
  const [showChannelPicker, setShowChannelPicker] = useState(false);

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
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
      if (data.prospect) onUpdate(data.prospect);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleMarkContacted(channel: ContactChannel) {
    setMarkingContact(true);
    setShowChannelPicker(false);
    try {
      const res = await fetch("/api/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: prospect.id,
          outreach_status: "contacted",
          contact_channel: channel,
        }),
      });
      const data = await res.json();
      if (data.prospect) onUpdate(data.prospect);
    } finally {
      setMarkingContact(false);
    }
  }

  return (
    <div className="bg-[#16161d] border border-[#2a2a3d] hover:border-[#6366f1]/40 rounded-xl p-4 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/prospects/${prospect.id}`}
            className="font-semibold text-[#e2e2f0] hover:text-[#6366f1] transition-colors leading-tight block truncate"
          >
            {prospect.business_name}
          </Link>
          {prospect.business_category && (
            <p className="text-xs text-[#6b7280] mt-0.5">{prospect.business_category}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {prospect.opportunity_score != null && (
            <ScoreBadge score={prospect.opportunity_score} size="sm" />
          )}
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
              prospect.outreach_status
            )}`}
          >
            {getStatusLabel(prospect.outreach_status)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1 mb-3">
        {prospect.business_address && (
          <div className="flex items-start gap-1.5 text-xs text-[#6b7280]">
            <MapPin size={12} className="mt-0.5 shrink-0" />
            <span className="truncate">{prospect.business_address}</span>
          </div>
        )}
        {prospect.business_phone && (
          <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
            <Phone size={12} className="shrink-0" />
            <span>{prospect.business_phone}</span>
          </div>
        )}
        {prospect.business_website ? (
          <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
            <Globe size={12} className="shrink-0" />
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
          <div className="flex items-center gap-1.5 text-xs text-orange-400">
            <Globe size={12} className="shrink-0" />
            <span>Fără website</span>
          </div>
        )}
        {prospect.google_rating && (
          <div className="flex items-center gap-1.5 text-xs text-[#6b7280]">
            <Star size={12} className="shrink-0 text-yellow-400" />
            <span>
              {prospect.google_rating}/5
              {prospect.google_reviews_count
                ? ` (${prospect.google_reviews_count} recenzii)`
                : ""}
            </span>
          </div>
        )}
      </div>

      {/* AI Summary */}
      {prospect.analysis_summary && (
        <p className="text-xs text-[#6b7280] bg-[#1c1c26] rounded-lg p-2 mb-3 line-clamp-2">
          {prospect.analysis_summary}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {prospect.opportunity_score == null ? (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 text-xs bg-[#6366f1]/15 hover:bg-[#6366f1]/25 text-[#6366f1] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {analyzing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Zap size={12} />
            )}
            {analyzing ? "Se analizează..." : "Analizează AI"}
          </button>
        ) : null}

        <Link
          href={`/prospects/${prospect.id}#hooks`}
          className="flex items-center gap-1.5 text-xs bg-[#1c1c26] hover:bg-[#2a2a3d] text-[#e2e2f0] px-3 py-1.5 rounded-lg transition-colors"
        >
          <MessageSquare size={12} />
          Hook-uri
        </Link>

        {prospect.outreach_status === "discovered" && (
          <div className="relative">
            <button
              onClick={() => setShowChannelPicker((v) => !v)}
              disabled={markingContact}
              className="flex items-center gap-1.5 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {markingContact ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <CheckCircle size={12} />
              )}
              Marcare contactat
            </button>
            {showChannelPicker && (
              <div className="absolute bottom-full left-0 mb-1 bg-[#1c1c26] border border-[#2a2a3d] rounded-lg overflow-hidden z-10 w-40">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => handleMarkContacted(ch)}
                    className="w-full text-left text-xs text-[#e2e2f0] hover:bg-[#2a2a3d] px-3 py-2 transition-colors"
                  >
                    {getChannelLabel(ch)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
