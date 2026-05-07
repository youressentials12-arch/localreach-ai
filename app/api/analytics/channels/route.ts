import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { parsePeriod, buildFiltersHash, getCached, setCached } from "@/lib/analytics/queries";
import type { AnalyticsFilters, ChannelStat } from "@/lib/analytics/queries";
import { generateChannelInsight } from "@/lib/analytics/insights";

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

  const cacheKey = `channels:${buildFiltersHash(user.id, filters)}`;
  const cached = getCached<{ data: ChannelStat[]; insight: string }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const { from, to } = parsePeriod(filters.period);

  let query = supabase
    .from("outreach_messages")
    .select("channel, replied_at")
    .eq("user_id", user.id)
    .gte("sent_at", from.toISOString())
    .lte("sent_at", to.toISOString());

  if (filters.campaign_id) query = query.eq("campaign_id", filters.campaign_id);
  if (filters.channel)     query = query.eq("channel", filters.channel);

  const { data: msgs } = await query;

  // Group by channel
  const map: Record<string, { sent: number; replied: number }> = {};
  for (const m of msgs ?? []) {
    if (!map[m.channel]) map[m.channel] = { sent: 0, replied: 0 };
    map[m.channel].sent++;
    if (m.replied_at) map[m.channel].replied++;
  }

  const data: ChannelStat[] = Object.entries(map).map(([channel, s]) => ({
    channel,
    sent: s.sent,
    replied: s.replied,
    reply_rate: s.sent > 0 ? s.replied / s.sent : 0,
  })).sort((a, b) => b.reply_rate - a.reply_rate);

  const result = { data, insight: generateChannelInsight(data) };
  setCached(cacheKey, result);
  return NextResponse.json(result);
}
