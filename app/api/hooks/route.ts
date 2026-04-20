import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateHooks } from "@/lib/anthropic";
import { checkRateLimit } from "@/lib/utils";
import type { ContactChannel, HookTone } from "@/types";

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
  const {
    prospectId,
    channels,
    tone,
    serviceOffered,
  }: {
    prospectId: string;
    channels: ContactChannel[];
    tone: HookTone;
    serviceOffered: string;
  } = body;

  if (!prospectId || !channels?.length || !serviceOffered) {
    return NextResponse.json(
      { error: "prospectId, channels și serviceOffered sunt obligatorii" },
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
    const generatedHooks = await generateHooks(
      prospect.business_name,
      prospect.business_category,
      prospect.business_address,
      prospect.google_rating,
      prospect.google_reviews_count,
      prospect.business_website,
      prospect.pain_points ?? [],
      serviceOffered,
      channels,
      tone
    );

    // Save each hook to DB
    const hooksToInsert = channels
      .map((channel) => {
        const hookData = generatedHooks[channel];
        if (!hookData) return null;
        return {
          prospect_id: prospectId,
          user_id: user.id,
          channel,
          hook_subject:
            channel === "email" && "subject" in hookData
              ? (hookData as { subject: string; content: string }).subject
              : undefined,
          hook_content: hookData.content,
          tone,
        };
      })
      .filter(Boolean);

    const { data: savedHooks, error: insertError } = await supabase
      .from("hooks")
      .insert(hooksToInsert)
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({ hooks: savedHooks, generated: generatedHooks });
  } catch (err) {
    console.error("Hooks generation error:", err);
    return NextResponse.json(
      { error: "Eroare la generarea hook-urilor. Încearcă din nou." },
      { status: 500 }
    );
  }
}
