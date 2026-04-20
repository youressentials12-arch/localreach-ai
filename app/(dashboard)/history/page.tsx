import { createClient } from "@/lib/supabase/server";
import HistoryClient from "./HistoryClient";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: prospects }, { data: campaigns }] = await Promise.all([
    supabase
      .from("prospects")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("campaigns")
      .select("id, name")
      .eq("user_id", user!.id)
      .order("name"),
  ]);

  const allProspects = prospects ?? [];
  const totalContacted = allProspects.filter((p) =>
    ["contacted", "replied", "negotiating", "won", "lost"].includes(
      p.outreach_status
    )
  ).length;
  const replied = allProspects.filter((p) => p.outreach_status === "replied").length;
  const won = allProspects.filter((p) => p.outreach_status === "won").length;
  const responseRate =
    totalContacted > 0 ? Math.round((replied / totalContacted) * 100) : 0;

  // Best industry
  const industryCounts: Record<string, number> = {};
  allProspects.forEach((p) => {
    if (
      p.business_category &&
      ["contacted", "replied", "won"].includes(p.outreach_status)
    ) {
      industryCounts[p.business_category] =
        (industryCounts[p.business_category] ?? 0) + 1;
    }
  });
  const bestIndustry = Object.entries(industryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <HistoryClient
      prospects={allProspects}
      campaigns={campaigns ?? []}
      stats={{ totalContacted, responseRate, won, bestIndustry }}
    />
  );
}
