import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { parsePeriod } from "@/lib/analytics/queries";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const period      = url.searchParams.get("period")   ?? "30d";
  const campaign_id = url.searchParams.get("campaign") ?? undefined;
  const channel     = url.searchParams.get("channel")  ?? undefined;

  const { from, to } = parsePeriod(period);

  let query = supabase
    .from("outreach_messages")
    .select("sent_at, channel, subject, body, opened_at, clicked_at, replied_at, prospects(business_name, business_category, business_address)")
    .eq("user_id", user.id)
    .gte("sent_at", from.toISOString())
    .lte("sent_at", to.toISOString())
    .order("sent_at", { ascending: false })
    .limit(1000);

  if (campaign_id) query = query.eq("campaign_id", campaign_id);
  if (channel)     query = query.eq("channel", channel);

  const { data: msgs } = await query;

  const rows = (msgs ?? []).map(m => {
    const p = m.prospects as unknown as { business_name: string; business_category: string | null; business_address: string | null } | null;
    return [
      m.sent_at ? new Date(m.sent_at).toLocaleDateString("ro-RO") : "",
      p?.business_name ?? "",
      p?.business_category ?? "",
      p?.business_address ?? "",
      m.channel,
      (m.subject ?? "").replace(/,/g, ";"),
      m.opened_at  ? "Da" : "Nu",
      m.clicked_at ? "Da" : "Nu",
      m.replied_at ? "Da" : "Nu",
    ].join(",");
  });

  const header = "Data,Prospect,Categorie,Oras,Canal,Subiect,Deschis,Click,Raspuns";
  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="analytics-${period}.csv"`,
    },
  });
}
