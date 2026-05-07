import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { buildFiltersHash, getCached, setCached } from "@/lib/analytics/queries";
import type { AnalyticsFilters, IndustryStat } from "@/lib/analytics/queries";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const filters: AnalyticsFilters = {
    period:      (url.searchParams.get("period") ?? "30d") as AnalyticsFilters["period"],
    campaign_id: url.searchParams.get("campaign") ?? undefined,
    channel:     url.searchParams.get("channel")  ?? undefined,
    industry:    url.searchParams.get("industry") ?? undefined,
  };

  const cacheKey = `industries:${buildFiltersHash(user.id, filters)}`;
  const cached = getCached<{ data: IndustryStat[] }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  let query = supabase
    .from("prospects")
    .select("business_category, outreach_status")
    .eq("user_id", user.id)
    .not("outreach_status", "in", '("discovered","not_qualified")');

  if (filters.campaign_id) query = query.eq("campaign_id", filters.campaign_id);
  if (filters.industry)    query = query.ilike("business_category", `%${filters.industry}%`);

  const { data: prospects } = await query;

  // Group by category
  const map: Record<string, { contacted: number; won: number }> = {};
  for (const p of prospects ?? []) {
    const key = p.business_category ?? "Necunoscută";
    if (!map[key]) map[key] = { contacted: 0, won: 0 };
    map[key].contacted++;
    if (p.outreach_status === "won") map[key].won++;
  }

  const data: IndustryStat[] = Object.entries(map)
    .map(([industry, s]) => ({
      industry,
      contacted: s.contacted,
      won: s.won,
      conversion_rate: s.contacted > 0 ? s.won / s.contacted : 0,
    }))
    .sort((a, b) => b.conversion_rate - a.conversion_rate);

  const result = { data };
  setCached(cacheKey, result);
  return NextResponse.json(result);
}
