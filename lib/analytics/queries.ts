import crypto from "crypto";

export type AnalyticsPeriod = "7d" | "30d" | "90d" | "12m";

export interface AnalyticsFilters {
  period: AnalyticsPeriod;
  campaign_id?: string;
  channel?: string;
  industry?: string;
}

export interface PeriodRange {
  from: Date;
  to: Date;
}

export function parsePeriod(period: string): PeriodRange {
  const to = new Date();
  const from = new Date();
  switch (period) {
    case "7d":  from.setDate(from.getDate() - 7);         break;
    case "90d": from.setDate(from.getDate() - 90);        break;
    case "12m": from.setFullYear(from.getFullYear() - 1); break;
    default:    from.setDate(from.getDate() - 30);
  }
  return { from, to };
}

export function parsePrevPeriod(period: string): PeriodRange {
  const curr = parsePeriod(period);
  const duration = curr.to.getTime() - curr.from.getTime();
  return {
    from: new Date(curr.from.getTime() - duration),
    to:   new Date(curr.from),
  };
}

export function buildFiltersHash(userId: string, filters: AnalyticsFilters): string {
  return crypto.createHash("md5")
    .update(JSON.stringify({ userId, ...filters }))
    .digest("hex");
}

const _cache = new Map<string, { data: unknown; exp: number }>();

export function getCached<T>(key: string): T | null {
  const entry = _cache.get(key);
  if (!entry || Date.now() > entry.exp) { _cache.delete(key); return null; }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
  _cache.set(key, { data, exp: Date.now() + ttlMs });
}

// --- Shared response types ---

export interface OverviewCurrent {
  messages_sent: number;
  reply_rate: number;
  conversion_rate: number;
  clients_won: number;
  best_channel: string | null;
}

export interface OverviewData {
  current: OverviewCurrent;
  previous: Omit<OverviewCurrent, "best_channel">;
}

export interface ChannelStat {
  channel: string;
  sent: number;
  replied: number;
  reply_rate: number;
}

export interface IndustryStat {
  industry: string;
  contacted: number;
  won: number;
  conversion_rate: number;
}

export interface HeatmapCell {
  day: number;   // 0=Mon … 6=Sun
  hour: number;  // 0-23
  count: number;
  replies: number;
}

export interface HookStat {
  id: string;
  subject?: string;
  content: string;
  tone: string;
  channel: string;
  got_response: boolean;
  business_name: string;
  created_at: string;
}

export interface CostApiData {
  messages_sent: number;
  clients_won: number;
  plan: string;
}
