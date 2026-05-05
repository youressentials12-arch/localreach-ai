import { createClient } from "@/lib/supabase/server";
import { searchPlaces } from "@/lib/google-maps";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { campaign_id } = body as { campaign_id?: string };
  if (!campaign_id) return NextResponse.json({ error: "campaign_id required" }, { status: 400 });

  const { data: campaign, error: campErr } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaign_id)
    .eq("user_id", user.id)
    .single();

  if (campErr || !campaign) return NextResponse.json({ error: "Campanie negăsită" }, { status: 404 });

  let places;
  try {
    places = await searchPlaces(campaign.target_industry, campaign.target_location);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Eroare la căutare";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const { data: existing } = await supabase
    .from("prospects")
    .select("google_place_id")
    .eq("user_id", user.id)
    .eq("campaign_id", campaign_id);

  const existingIds = new Set((existing ?? []).map((p) => p.google_place_id).filter(Boolean));

  const newPlaces = places.filter((p) => !existingIds.has(p.place_id));
  if (newPlaces.length === 0) {
    return NextResponse.json({ inserted: 0, message: "Nu s-au găsit afaceri noi." });
  }

  const rows = newPlaces.map((p) => ({
    user_id: user.id,
    campaign_id,
    business_name: p.name,
    business_address: p.formatted_address,
    business_phone: p.formatted_phone_number,
    business_website: p.website,
    business_category: p.types?.[0],
    google_place_id: p.place_id,
    google_rating: p.rating,
    google_reviews_count: p.user_ratings_total,
    google_maps_url: p.url,
    outreach_status: "discovered",
  }));

  const { error: insertErr } = await supabase.from("prospects").insert(rows);
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  return NextResponse.json({ inserted: rows.length });
}
