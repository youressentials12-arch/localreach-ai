import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeBusinessOpportunity } from "@/lib/anthropic";
import type { QualificationCriteria } from "@/types";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const body = await request.json();
  const {
    prospectId,
    serviceOffered,
    criteria,
  }: {
    prospectId: string;
    serviceOffered: string;
    criteria: QualificationCriteria;
  } = body;

  if (!prospectId || !serviceOffered) {
    return NextResponse.json(
      { error: "prospectId și serviceOffered sunt obligatorii" },
      { status: 400 }
    );
  }

  const { data: prospect, error: fetchError } = await supabase
    .from("prospects")
    .select("*")
    .eq("id", prospectId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !prospect) {
    return NextResponse.json({ error: "Prospectul nu a fost găsit" }, { status: 404 });
  }

  try {
    const result = await analyzeBusinessOpportunity(
      prospect.business_name,
      prospect.business_category,
      prospect.business_website,
      prospect.google_rating,
      prospect.google_reviews_count,
      prospect.business_address,
      serviceOffered,
      criteria
    );

    const { data: updated, error: updateError } = await supabase
      .from("prospects")
      .update({
        opportunity_score: result.opportunity_score,
        pain_points: result.pain_points,
        analysis_summary: result.analysis_summary,
      })
      .eq("id", prospectId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ prospect: updated, analysis: result });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "Eroare la analiza AI. Încearcă din nou." },
      { status: 500 }
    );
  }
}
