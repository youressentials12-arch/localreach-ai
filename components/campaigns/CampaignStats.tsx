import type { Prospect } from "@/types";

interface CampaignStatsProps {
  prospects: Prospect[];
}

export default function CampaignStats({ prospects }: CampaignStatsProps) {
  const analyzed = prospects.filter((p) => p.opportunity_score != null).length;
  const contacted = prospects.filter(
    (p) =>
      p.outreach_status !== "discovered" && p.outreach_status !== "not_qualified"
  ).length;
  const avgScore =
    analyzed > 0
      ? Math.round(
          prospects
            .filter((p) => p.opportunity_score != null)
            .reduce((sum, p) => sum + (p.opportunity_score ?? 0), 0) / analyzed
        )
      : 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Total", value: prospects.length },
        { label: "Analizate", value: analyzed },
        { label: "Contactate", value: contacted },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="bg-[#1c1c26] rounded-lg p-2 text-center"
        >
          <p className="text-lg font-bold text-[#e2e2f0]">{value}</p>
          <p className="text-xs text-[#6b7280]">{label}</p>
        </div>
      ))}
    </div>
  );
}
