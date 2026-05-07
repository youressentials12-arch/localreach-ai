import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { parsePeriod, buildFiltersHash, getCached, setCached } from "@/lib/analytics/queries";
import type { AnalyticsFilters, HookStat } from "@/lib/analytics/queries";

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

  const cacheKey = `hooks:${buildFiltersHash(user.id, filters)}`;
  const cached = getCached<{ data: HookStat[] }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const { from } = parsePeriod(filters.period);

  let query = supabase
    .from("hooks")
    .select("id, hook_subject, hook_content, tone, channel, got_response, created_at, prospects(business_name)")
    .eq("user_id", user.id)
    .eq("was_used", true)
    .gte("created_at", from.toISOString())
    .order("got_response", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (filters.channel) query = query.eq("channel", filters.channel);

  const { data: hooks } = await query;

  const data: HookStat[] = (hooks ?? []).map(h => ({
    id: h.id,
    subject:       h.hook_subject ?? undefined,
    content:       h.hook_content,
    tone:          h.tone,
    channel:       h.channel,
    got_response:  h.got_response ?? false,
    business_name: (h.prospects as unknown as { business_name: string } | null)?.business_name ?? "Prospect",
    created_at:    h.created_at,
  }));

  const result = { data };
  setCached(cacheKey, result);
  return NextResponse.json(result);
}
