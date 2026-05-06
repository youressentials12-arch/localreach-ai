import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") ?? "list";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const offset = (page - 1) * limit;
  const status = searchParams.get("status");
  const campaignId = searchParams.get("campaign_id");
  const channel = searchParams.get("channel");
  const search = searchParams.get("search");

  let query = supabase
    .from("scheduled_follow_ups")
    .select(
      `*,
      prospects(business_name, business_address, business_email, business_category),
      campaigns(name),
      follow_up_steps(subject_template, body_template, use_ai_generation, tone)`,
      view === "list" ? { count: "exact" } : {}
    )
    .eq("user_id", user.id);

  if (status) query = query.eq("status", status);
  if (campaignId) query = query.eq("campaign_id", campaignId);
  if (channel) query = query.eq("channel", channel);

  if (view === "calendar" && from && to) {
    query = query.gte("scheduled_for", from).lte("scheduled_for", to);
  } else if (view === "list") {
    if (from) query = query.gte("scheduled_for", from);
    if (to) query = query.lte("scheduled_for", to);
    query = query.order("scheduled_for", { ascending: true }).range(offset, offset + limit - 1);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let results = data ?? [];

  // Client-side search filter
  if (search) {
    const q = search.toLowerCase();
    results = results.filter((r) => {
      const prospect = r.prospects as { business_name: string } | null;
      return prospect?.business_name?.toLowerCase().includes(q);
    });
  }

  return NextResponse.json({ followUps: results, total: count ?? results.length, page, limit });
}
