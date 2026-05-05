"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { Mail, Phone, Instagram, Facebook, Linkedin, RefreshCw, MessageSquare, Tag, FileText } from "lucide-react";
import Link from "next/link";

interface ActivityItem {
  id: string;
  activity_type: string;
  channel?: string;
  details?: Record<string, unknown>;
  created_at: string;
  prospects: { business_name: string; business_category: string | null } | null;
}

const CHANNEL_ICON: Record<string, React.ElementType> = {
  email: Mail,
  phone: Phone,
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
};

const ACTIVITY_LABELS: Record<string, string> = {
  contacted: "Contactat",
  replied: "A răspuns",
  status_changed: "Status schimbat",
  note_added: "Notă adăugată",
  hook_used: "Hook trimis",
};

function ActivityIcon({ type, channel }: { type: string; channel?: string }) {
  if (channel && CHANNEL_ICON[channel]) {
    const Icon = CHANNEL_ICON[channel];
    return <Icon className="w-3.5 h-3.5" />;
  }
  const icons: Record<string, React.ElementType> = {
    replied: MessageSquare,
    status_changed: Tag,
    note_added: FileText,
  };
  const Icon = icons[type] ?? RefreshCw;
  return <Icon className="w-3.5 h-3.5" />;
}

function typeColor(type: string): string {
  if (type === "contacted" || type === "hook_used") return "bg-[#6366f1]/20 text-[#6366f1]";
  if (type === "replied") return "bg-[#22c55e]/20 text-[#22c55e]";
  if (type === "status_changed") return "bg-[#f59e0b]/20 text-[#f59e0b]";
  return "bg-[#2a2a3d] text-[#6b7280]";
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    const res = await fetch("/api/activity?limit=15");
    if (res.ok) {
      const data = await res.json();
      setActivities(data.activities ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActivities();

    const supabase = createClient();
    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "outreach_activities" },
        () => fetchActivities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities]);

  return (
    <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#e2e2f0]">Activitate recentă</h2>
        <button
          onClick={fetchActivities}
          className="text-[#6b7280] hover:text-[#e2e2f0] transition-colors"
          title="Reîmprospătează"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-[#2a2a3d] shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-[#2a2a3d] rounded w-3/4" />
                <div className="h-2.5 bg-[#2a2a3d] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-[#6b7280] text-sm text-center py-6">
          Nicio activitate înregistrată încă.
        </p>
      ) : (
        <div className="space-y-0 divide-y divide-[#2a2a3d]">
          {activities.map((a) => (
            <div key={a.id} className="py-2.5 flex gap-3 items-start">
              <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${typeColor(a.activity_type)}`}>
                <ActivityIcon type={a.activity_type} channel={a.channel} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#e2e2f0] leading-snug">
                  <span className="font-medium">{ACTIVITY_LABELS[a.activity_type] ?? a.activity_type}</span>
                  {a.prospects?.business_name && (
                    <>
                      {" · "}
                      <span className="text-[#6366f1] truncate">
                        {a.prospects.business_name}
                      </span>
                    </>
                  )}
                </p>
                {a.details?.note != null && (
                  <p className="text-xs text-[#6b7280] mt-0.5 truncate">
                    {String(a.details.note)}
                  </p>
                )}
                <p className="text-xs text-[#6b7280] mt-0.5">
                  {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: ro })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length > 0 && (
        <Link
          href="/prospects"
          className="block text-center text-xs text-[#6366f1] hover:underline mt-3 pt-3 border-t border-[#2a2a3d]"
        >
          Vezi toți prospecții
        </Link>
      )}
    </div>
  );
}
