import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { parsePeriod, buildFiltersHash, getCached, setCached } from "@/lib/analytics/queries";
import type { AnalyticsFilters, CostApiData } from "@/lib/analytics/queries";

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

  const cacheKey = `cost:${buildFiltersHash(user.id, filters)}`;
  const cached = getCached<CostApiData>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const { from, to } = parsePeriod(filters.period);

  let msgQuery = supabase
    .from("outreach_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("sent_at", from.toISOString())
    .lte("sent_at", to.toISOString());

  if (filters.campaign_id) msgQuery = msgQuery.eq("campaign_id", filters.campaign_id);

  let prospQuery = supabase
    .from("prospects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("outreach_status", "won")
    .gte("contacted_at", from.toISOString())
    .lte("contacted_at", to.toISOString());

  if (filters.campaign_id) prospQuery = prospQuery.eq("campaign_id", filters.campaign_id);

  const [{ count: messages_sent }, { count: clients_won }, { data: profile }] = await Promise.all([
    msgQuery,
    prospQuery,
    supabase.from("profiles").select("plan").eq("id", user.id).single(),
  ]);

  const result: CostApiData = {
    messages_sent: messages_sent ?? 0,
    clients_won:   clients_won ?? 0,
    plan:          profile?.plan ?? "starter",
  };

  setCached(cacheKey, result);
  return NextResponse.json(result);
}
