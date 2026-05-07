"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import UpgradeButton from "@/components/shared/UpgradeButton";
import AnalyticsFilters    from "@/components/analytics/AnalyticsFilters";
import KPIOverview         from "@/components/analytics/KPIOverview";
import ChannelResponseChart from "@/components/analytics/ChannelResponseChart";
import IndustryConversionChart from "@/components/analytics/IndustryConversionChart";
import CostPerClientCard   from "@/components/analytics/CostPerClientCard";
import BestTimeHeatmap     from "@/components/analytics/BestTimeHeatmap";
import TopHooksTable       from "@/components/analytics/TopHooksTable";
import ExportFooter        from "@/components/analytics/ExportFooter";

// ── local response-shape types (mirrors lib/analytics/queries.ts but no crypto import) ──
interface ChannelStat  { channel: string; sent: number; replied: number; reply_rate: number }
interface IndustryStat { industry: string; contacted: number; won: number; conversion_rate: number }
interface HeatmapCell  { day: number; hour: number; count: number; replies: number }
interface HookStat     { id: string; subject?: string; content: string; tone: string; channel: string; got_response: boolean; business_name: string; created_at: string }
interface OverviewData {
  current:  { messages_sent: number; reply_rate: number; conversion_rate: number; clients_won: number; best_channel: string | null };
  previous: { messages_sent: number; reply_rate: number; conversion_rate: number; clients_won: number };
}
interface AllData {
  overview:   OverviewData | null;
  channels:   { data: ChannelStat[];   insight: string }      | null;
  industries: { data: IndustryStat[] }                        | null;
  cost:       { messages_sent: number; clients_won: number; plan: string } | null;
  bestTime:   { cells: HeatmapCell[]; insight: string }       | null;
  hooks:      { data: HookStat[] }                            | null;
}

interface Props {
  plan:      "starter" | "pro" | "agency";
  campaigns: { id: string; name: string }[];
}

async function safeFetch(url: string): Promise<unknown> {
  try {
    const res = await fetch(url);
    return res.ok ? res.json() : null;
  } catch { return null; }
}

function buildQS(params: Record<string, string>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v && v !== "30d") q.set(k === "campaignId" ? "campaign" : k, v);
  // always pass period
  q.set("period", params.period);
  const s = q.toString();
  return s ? `?${s}` : "";
}

function ProGate({ children, locked }: { children: React.ReactNode; locked: boolean }) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-40">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center rounded-xl">
        <div className="bg-[#16161d] border border-[#6366f1]/30 rounded-xl px-8 py-7 text-center shadow-2xl">
          <Lock size={26} className="text-[#6366f1] mx-auto mb-3" />
          <p className="text-[#e2e2f0] font-semibold mb-1">Funcție Pro</p>
          <p className="text-[#6b7280] text-xs mb-5 max-w-[220px] leading-relaxed">
            Cost per client, harta timpului optim și performanța hook-urilor sunt disponibile pentru abonații Pro.
          </p>
          <UpgradeButton />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPageClient({ plan, campaigns }: Props) {
  const searchParams = useSearchParams();
  const [data, setData]       = useState<AllData>({ overview: null, channels: null, industries: null, cost: null, bestTime: null, hooks: null });
  const [loading, setLoading] = useState(true);

  const period     = searchParams.get("period")   ?? "30d";
  const campaignId = searchParams.get("campaign") ?? "";
  const channel    = searchParams.get("channel")  ?? "";
  const industry   = searchParams.get("industry") ?? "";

  const isStarter = plan === "starter";

  useEffect(() => {
    setLoading(true);
    const qs = buildQS({ period, campaignId, channel, industry });

    const baseReqs = [
      safeFetch(`/api/analytics/overview${qs}`),
      safeFetch(`/api/analytics/channels${qs}`),
      safeFetch(`/api/analytics/industries${qs}`),
    ];
    const proReqs = isStarter
      ? [Promise.resolve(null), Promise.resolve(null), Promise.resolve(null)]
      : [
          safeFetch(`/api/analytics/cost${qs}`),
          safeFetch(`/api/analytics/best-time${qs}`),
          safeFetch(`/api/analytics/hooks${qs}`),
        ];

    Promise.all([...baseReqs, ...proReqs] as Promise<unknown>[])
      .then(([overview, channels, industries, cost, bestTime, hooks]) => {
        setData({
          overview:   overview   as OverviewData | null,
          channels:   channels   as AllData["channels"],
          industries: industries as AllData["industries"],
          cost:       cost       as AllData["cost"],
          bestTime:   bestTime   as AllData["bestTime"],
          hooks:      hooks      as AllData["hooks"],
        });
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, campaignId, channel, industry]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e2f0]">Analytics</h1>
        <p className="text-[#6b7280] text-sm mt-0.5">Analizează performanța outreach-ului tău</p>
      </div>

      {/* Sticky filters */}
      <AnalyticsFilters campaigns={campaigns} />

      {/* KPI overview */}
      <KPIOverview data={data.overview} loading={loading} />

      {/* Section 1 — Channel response */}
      <ChannelResponseChart
        data={data.channels?.data ?? []}
        insight={data.channels?.insight ?? ""}
        loading={loading}
      />

      {/* Section 2 — Industry conversion */}
      <IndustryConversionChart
        data={data.industries?.data ?? []}
        loading={loading}
      />

      {/* Sections 3-5 — Pro only */}
      <ProGate locked={isStarter}>
        <div className="space-y-6">
          {/* Section 3 — Cost per client */}
          <CostPerClientCard
            data={data.cost}
            loading={isStarter ? true : loading}
            plan={plan}
            period={period}
          />

          {/* Section 4 — Best time heatmap */}
          <BestTimeHeatmap
            cells={data.bestTime?.cells ?? []}
            insight={data.bestTime?.insight ?? ""}
            loading={isStarter ? true : loading}
          />

          {/* Section 5 — Top hooks */}
          <TopHooksTable
            data={data.hooks?.data ?? []}
            loading={isStarter ? true : loading}
          />
        </div>
      </ProGate>

      {/* Export footer */}
      <ExportFooter period={period} campaign={campaignId} channel={channel} />
    </div>
  );
}
