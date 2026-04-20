import { createClient } from "@/lib/supabase/server";
import StatsCard from "@/components/shared/StatsCard";
import ScoreBadge from "@/components/shared/ScoreBadge";
import Link from "next/link";
import DashboardChart from "@/components/campaigns/DashboardChart";
import { Users, Megaphone, TrendingUp, Trophy } from "lucide-react";
import { getStatusLabel, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all stats
  const [
    { count: totalDiscovered },
    { data: allProspects },
    { data: activeCampaigns },
    { data: topProspects },
  ] = await Promise.all([
    supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("prospects")
      .select("outreach_status, contacted_at, created_at")
      .eq("user_id", user!.id),
    supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user!.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("prospects")
      .select("*")
      .eq("user_id", user!.id)
      .eq("outreach_status", "discovered")
      .not("opportunity_score", "is", null)
      .order("opportunity_score", { ascending: false })
      .limit(5),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const contactedThisMonth =
    allProspects?.filter(
      (p) => p.contacted_at && new Date(p.contacted_at) >= startOfMonth
    ).length ?? 0;

  const replied =
    allProspects?.filter((p) => p.outreach_status === "replied").length ?? 0;
  const contacted =
    allProspects?.filter((p) =>
      ["contacted", "replied", "negotiating", "won", "lost"].includes(
        p.outreach_status
      )
    ).length ?? 0;
  const won =
    allProspects?.filter((p) => p.outreach_status === "won").length ?? 0;
  const responseRate = contacted > 0 ? Math.round((replied / contacted) * 100) : 0;

  // Chart data — last 30 days
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    const count =
      allProspects?.filter(
        (p) => p.contacted_at && p.contacted_at.startsWith(dateStr)
      ).length ?? 0;
    return {
      date: d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" }),
      contactate: count,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e2f0]">Dashboard</h1>
        <p className="text-[#6b7280] text-sm mt-0.5">Bine ai revenit. Iată activitatea ta.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Afaceri descoperite"
          value={totalDiscovered ?? 0}
          icon={Users}
        />
        <StatsCard
          title="Contactate luna asta"
          value={contactedThisMonth}
          icon={Megaphone}
        />
        <StatsCard
          title="Rată de răspuns"
          value={`${responseRate}%`}
          subtitle={`${replied} din ${contacted} contactate`}
          icon={TrendingUp}
        />
        <StatsCard
          title="Clienți câștigați"
          value={won}
          icon={Trophy}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-[#e2e2f0] mb-4">
            Afaceri contactate — ultimele 30 zile
          </h2>
          <DashboardChart data={chartData} />
        </div>

        {/* Active campaigns */}
        <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#e2e2f0]">Campanii active</h2>
            <Link href="/campaigns" className="text-xs text-[#6366f1] hover:underline">
              Vezi toate
            </Link>
          </div>
          <div className="space-y-3">
            {(activeCampaigns ?? []).length === 0 ? (
              <p className="text-[#6b7280] text-sm">Nicio campanie activă</p>
            ) : (
              activeCampaigns!.map((c) => (
                <Link
                  key={c.id}
                  href={`/campaigns/${c.id}`}
                  className="block bg-[#1c1c26] rounded-lg p-3 hover:border-[#6366f1] border border-transparent transition-colors"
                >
                  <p className="text-sm font-medium text-[#e2e2f0] truncate">{c.name}</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    {c.target_industry} · {c.target_location}
                  </p>
                </Link>
              ))
            )}
            <Link
              href="/campaigns/new"
              className="block w-full text-center py-2 text-sm text-[#6366f1] hover:text-[#4f46e5] border border-dashed border-[#2a2a3d] hover:border-[#6366f1] rounded-lg transition-colors"
            >
              + Campanie nouă
            </Link>
          </div>
        </div>
      </div>

      {/* Top prospects */}
      {(topProspects ?? []).length > 0 && (
        <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#e2e2f0]">
              Afaceri cu scor ridicat necontactate
            </h2>
            <Link href="/prospects" className="text-xs text-[#6366f1] hover:underline">
              Vezi toți
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#6b7280] border-b border-[#2a2a3d]">
                  <th className="pb-2 font-medium">Afacere</th>
                  <th className="pb-2 font-medium">Categorie</th>
                  <th className="pb-2 font-medium">Scor</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3d]">
                {topProspects!.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1c1c26] transition-colors">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-[#e2e2f0] truncate max-w-[180px]">
                        {p.business_name}
                      </p>
                      <p className="text-xs text-[#6b7280] truncate">{p.business_address}</p>
                    </td>
                    <td className="py-2.5 pr-4 text-[#6b7280]">{p.business_category}</td>
                    <td className="py-2.5 pr-4">
                      {p.opportunity_score != null && (
                        <ScoreBadge score={p.opportunity_score} size="sm" />
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-[#6b7280]">
                      {getStatusLabel(p.outreach_status)}
                    </td>
                    <td className="py-2.5">
                      <Link
                        href={`/prospects/${p.id}`}
                        className="text-xs text-[#6366f1] hover:underline"
                      >
                        Deschide
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
