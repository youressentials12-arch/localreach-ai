import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { parsePeriod, buildFiltersHash, getCached, setCached } from "@/lib/analytics/queries";
import type { AnalyticsFilters, HeatmapCell } from "@/lib/analytics/queries";
import { generateBestTimeInsight } from "@/lib/analytics/insights";

const TZ = "Europe/Bucharest";
const DAY_MAP: Record<string, number> = {
  Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3,
  Friday: 4, Saturday: 5, Sunday: 6,
};

function getLocalDayHour(isoString: string): { day: number; hour: number } {
  const d = new Date(isoString);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "long",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const weekday = parts.find(p => p.type === "weekday")?.value ?? "Monday";
  const hourStr  = parts.find(p => p.type === "hour")?.value ?? "0";
  return {
    day:  DAY_MAP[weekday] ?? 0,
    hour: parseInt(hourStr, 10) % 24,
  };
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

  const cacheKey = `best-time:${buildFiltersHash(user.id, filters)}`;
  const cached = getCached<{ cells: HeatmapCell[]; insight: string }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const { from, to } = parsePeriod(filters.period);

  let query = supabase
    .from("outreach_messages")
    .select("sent_at, replied_at")
    .eq("user_id", user.id)
    .not("sent_at", "is", null)
    .gte("sent_at", from.toISOString())
    .lte("sent_at", to.toISOString());

  if (filters.campaign_id) query = query.eq("campaign_id", filters.campaign_id);
  if (filters.channel)     query = query.eq("channel", filters.channel);

  const { data: msgs } = await query;

  // Build 7×24 matrix
  const countMatrix:   number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const replyMatrix:   number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

  for (const m of msgs ?? []) {
    const { day, hour } = getLocalDayHour(m.sent_at);
    countMatrix[day][hour]++;
    if (m.replied_at) replyMatrix[day][hour]++;
  }

  const cells: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      cells.push({ day, hour, count: countMatrix[day][hour], replies: replyMatrix[day][hour] });
    }
  }

  const result = { cells, insight: generateBestTimeInsight(cells) };
  setCached(cacheKey, result);
  return NextResponse.json(result);
}
