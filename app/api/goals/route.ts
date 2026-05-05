import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function firstDayOfMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const monthStr = firstDayOfMonth(now);

  const { data: goals, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", monthStr)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const targets = goals ?? {
    goal_prospects: 50,
    goal_contacted: 30,
    goal_replies: 10,
    goal_clients: 2,
  };

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    { count: prospects },
    { count: contacted },
    { count: replies },
    { count: clients },
  ] = await Promise.all([
    supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("contacted_at", "is", null)
      .gte("contacted_at", startOfMonth.toISOString()),
    supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("outreach_status", ["replied", "negotiating", "won"])
      .gte("last_activity_at", startOfMonth.toISOString()),
    supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("outreach_status", "won")
      .gte("last_activity_at", startOfMonth.toISOString()),
  ]);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const paceFraction = dayOfMonth / daysInMonth;

  function getStatus(current: number, target: number) {
    const expected = paceFraction * target;
    const ratio = expected > 0 ? current / expected : 1;
    if (current >= target) return "reached";
    if (ratio >= 0.9) return "on_track";
    if (ratio >= 0.6) return "slightly_behind";
    return "behind";
  }

  const progress = {
    prospects: {
      current: prospects ?? 0,
      target: targets.goal_prospects,
      status: getStatus(prospects ?? 0, targets.goal_prospects),
    },
    contacted: {
      current: contacted ?? 0,
      target: targets.goal_contacted,
      status: getStatus(contacted ?? 0, targets.goal_contacted),
    },
    replies: {
      current: replies ?? 0,
      target: targets.goal_replies,
      status: getStatus(replies ?? 0, targets.goal_replies),
    },
    clients: {
      current: clients ?? 0,
      target: targets.goal_clients,
      status: getStatus(clients ?? 0, targets.goal_clients),
    },
  };

  return NextResponse.json({ goals: targets, progress, month: monthStr });
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { goal_prospects, goal_contacted, goal_replies, goal_clients } = body as {
    goal_prospects?: number;
    goal_contacted?: number;
    goal_replies?: number;
    goal_clients?: number;
  };

  const monthStr = firstDayOfMonth(new Date());

  const { error } = await supabase.from("user_goals").upsert(
    {
      user_id: user.id,
      month: monthStr,
      ...(goal_prospects != null && { goal_prospects }),
      ...(goal_contacted != null && { goal_contacted }),
      ...(goal_replies != null && { goal_replies }),
      ...(goal_clients != null && { goal_clients }),
    },
    { onConflict: "user_id,month" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
