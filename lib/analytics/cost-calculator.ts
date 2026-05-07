export interface CostInput {
  plan: "starter" | "pro" | "agency";
  ad_spend: number;        // monthly ad spend in RON
  hourly_rate: number;     // user's hourly rate in RON
  messages_sent: number;
  clients_won: number;
  period_months: number;
}

export interface CostBreakdown {
  subscription: number;
  ad_spend: number;
  time_cost: number;
  time_hours: number;
  total: number;
  clients_won: number;
  cost_per_client: number | null;
}

const PLAN_PRICES_RON: Record<string, number> = {
  starter: 0,
  pro: 490,
  agency: 1200,
};

const AVG_MINUTES_PER_MESSAGE = 3;

export function calculateCost(input: CostInput): CostBreakdown {
  const subscription = (PLAN_PRICES_RON[input.plan] ?? 0) * input.period_months;
  const ad_spend     = input.ad_spend * input.period_months;
  const time_hours   = (input.messages_sent * AVG_MINUTES_PER_MESSAGE) / 60;
  const time_cost    = time_hours * input.hourly_rate;
  const total        = subscription + ad_spend + time_cost;
  const cost_per_client = input.clients_won > 0 ? Math.round(total / input.clients_won) : null;

  return { subscription, ad_spend, time_cost, time_hours: Math.round(time_hours * 10) / 10, total, clients_won: input.clients_won, cost_per_client };
}

export function periodToMonths(period: string): number {
  switch (period) {
    case "7d":  return 7 / 30;
    case "90d": return 3;
    case "12m": return 12;
    default:    return 1;
  }
}
