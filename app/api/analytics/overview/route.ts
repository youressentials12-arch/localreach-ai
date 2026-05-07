import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { parsePeriod, parsePrevPeriod, buildFiltersHash, getCached, setCached } from "@/lib/analytics/queries";
import type { OverviewData, OverviewCurrent, AnalyticsFilters } from "@/lib/analytics/queries";

async function fetchPeriodStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  from: Date,
  to: Date,
  filters: Partial<AnalyticsFilters>
): Promise<OverviewCurrent> {
  let msgQuery = supabase
    .from("outreach_messages")
    .select("channel, replied_at")
    .eq("user_id", userId)
    .gte("sent_at", from.toISOString())
    .lte("sent_at", to.toISOString());

  if (filters.campaign_id) msgQuery = msgQuery.eq("campaign_id", filters.campaign_id);
  if (filters.channel)     msgQuery = msgQuery.eq("channel", filters.channel);

  const { data: msgs } = await msgQuery;
  const messages = msgs ?? [];
  const messages_sent = messages.length;
  const replied = messages.filter(m => m.replied_at !== null).length;
  const reply_rate = messages_sent > 0 ? replied / messages_sent : 0;

  // Best channel by reply rate (min 3 sent)
  const chMap: Record<string, { sent: number; replied: number }> = {};
  for (const m of messages) {
    if (!chMap[m.channel]) chMap[m.channel] = { sent: 0, replied: 0 };
    chMap[m.channel].sent++;
    if (m.replied_at) chMap[m.channel].replied++;
  }
  let best_channel: string | null = null;
  let bestRate = -1;
  for (const [ch, s] of Object.entries(chMap)) {
    if (s.sent >= 3 && s.replied / s.sent > bestRate) {
      bestRate = s.replied / s.sent;
      best_channel = ch;
    }
  }

  let prospQuery = supabase
    .from("prospects")
    .select("outreach_status")
    .eq("user_id", userId)
    .gte("contacted_at", from.toISOString())
    .lte("contacted_at", to.toISOString());

  if (filters.campaign_id) prospQuery = prospQuery.eq("campaign_id", filters.campaign_id);

  const { data: prosp } = await prospQuery;
  const prospects = prosp ?? [];
  const clients_won = prospects.filter(p => p.outreach_status === "won").length;
  const contacted = prospects.length;
  const conversion_rate = contacted > 0 ? clients_won / contacted : 0;

  return { messages_sent, reply_rate, conversion_rate, clients_won, best_channel };
}

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

  const cacheKey = `overview:${buildFiltersHash(user.id, filters)}`;
  const cached = getCached<OverviewData>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const { from, to }             = parsePeriod(filters.period);
  const { from: pFrom, to: pTo } = parsePrevPeriod(filters.period);

  const [current, previous] = await Promise.all([
    fetchPeriodStats(supabase, user.id, from, to, filters),
    fetchPeriodStats(supabase, user.id, pFrom, pTo, filters),
  ]);

  const result: OverviewData = { current, previous };
  setCached(cacheKey, result);
  return NextResponse.json(result);
}
