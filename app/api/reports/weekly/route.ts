import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: prospects, error } = await supabase
    .from("prospects")
    .select("business_name, business_address, business_category, outreach_status, contacted_at, opportunity_score, campaigns(name)")
    .eq("user_id", user.id)
    .gte("created_at", sevenDaysAgo)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const headers = [
    "Afacere",
    "Adresă",
    "Categorie",
    "Campanie",
    "Status",
    "Scor oportunitate",
    "Data contactării",
  ];

  const rows = (prospects ?? []).map((p) => [
    p.business_name,
    p.business_address ?? "",
    p.business_category ?? "",
    (p.campaigns as unknown as { name: string } | null)?.name ?? "",
    p.outreach_status,
    p.opportunity_score?.toString() ?? "",
    p.contacted_at ? new Date(p.contacted_at).toLocaleDateString("ro-RO") : "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="raport-saptamanal-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
