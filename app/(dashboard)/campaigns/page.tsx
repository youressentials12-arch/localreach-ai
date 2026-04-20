import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Megaphone } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*, prospects(count)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const statusLabels: Record<string, string> = {
    active: "Activă",
    paused: "Pausată",
    completed: "Finalizată",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    paused: "bg-yellow-500/20 text-yellow-400",
    completed: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2f0]">Campanii</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">
            Gestionează campaniile tale de prospecting
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Campanie nouă
        </Link>
      </div>

      {(campaigns ?? []).length === 0 ? (
        <div className="bg-[#16161d] border border-[#2a2a3d] border-dashed rounded-xl p-12 text-center">
          <Megaphone size={40} className="text-[#2a2a3d] mx-auto mb-3" />
          <p className="text-[#e2e2f0] font-medium mb-1">Nicio campanie încă</p>
          <p className="text-[#6b7280] text-sm mb-4">
            Creează prima ta campanie pentru a găsi afaceri locale calificate.
          </p>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Creează campanie
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns!.map((campaign) => {
            const prospectsCount =
              (campaign.prospects as unknown as { count: number }[])?.[0]
                ?.count ?? 0;
            return (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="bg-[#16161d] border border-[#2a2a3d] hover:border-[#6366f1] rounded-xl p-4 transition-colors block"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-[#e2e2f0] leading-tight pr-2">
                    {campaign.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      statusColors[campaign.status]
                    }`}
                  >
                    {statusLabels[campaign.status]}
                  </span>
                </div>

                <div className="space-y-1 mb-3">
                  <p className="text-sm text-[#6b7280]">
                    <span className="text-[#e2e2f0]">Serviciu:</span>{" "}
                    {campaign.service_offered}
                  </p>
                  <p className="text-sm text-[#6b7280]">
                    <span className="text-[#e2e2f0]">Țintă:</span>{" "}
                    {campaign.target_industry} · {campaign.target_location}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#2a2a3d]">
                  <span className="text-xs text-[#6b7280]">
                    {prospectsCount} prospecți
                  </span>
                  <span className="text-xs text-[#6b7280]">
                    {formatDate(campaign.created_at)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
