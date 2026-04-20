import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchPlaces } from "@/lib/google-maps";
import { checkRateLimit } from "@/lib/utils";
import type { QualificationCriteria } from "@/types";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: "Prea multe cereri. Încearcă din nou în 1 minut." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { industry, location, criteria, campaignId }: {
    industry: string;
    location: string;
    criteria: QualificationCriteria;
    campaignId: string;
  } = body;

  if (!industry || !location) {
    return NextResponse.json(
      { error: "Industria și locația sunt obligatorii" },
      { status: 400 }
    );
  }

  try {
    const places = await searchPlaces(industry, location);

    if (places.length === 0) {
      return NextResponse.json(
        { error: `Nu au fost găsite afaceri de tip "${industry}" în "${location}". Încearcă un termen mai general.` },
        { status: 404 }
      );
    }

    const prospects = [];

    for (const place of places) {
      // Filtrare criteriu no_website
      if (criteria.no_website && place.website) continue;
      if (criteria.low_reviews && place.user_ratings_total !== undefined && place.user_ratings_total >= 20) continue;
      if (criteria.low_rating && place.rating !== undefined && place.rating >= 4.0) continue;

      // Skip dacă există deja pentru acest user
      const { data: existing } = await supabase
        .from("prospects")
        .select("id")
        .eq("google_place_id", place.place_id)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        prospects.push(existing);
        continue;
      }

      const category = place.types?.[0];

      const { data: prospect, error } = await supabase
        .from("prospects")
        .insert({
          user_id: user.id,
          campaign_id: campaignId,
          business_name: place.name,
          business_address: place.formatted_address,
          business_phone: place.formatted_phone_number,
          business_website: place.website,
          business_category: category,
          google_place_id: place.place_id,
          google_rating: place.rating ?? null,
          google_reviews_count: place.user_ratings_total ?? null,
          google_maps_url: place.url,
        })
        .select()
        .single();

      if (!error && prospect) {
        prospects.push(prospect);
      }
    }

    return NextResponse.json({ prospects });
  } catch (err) {
    console.error("Search error:", err);
    const message = err instanceof Error ? err.message : "Eroare necunoscută";
    return NextResponse.json(
      { error: `Eroare la căutare: ${message}` },
      { status: 500 }
    );
  }
}
