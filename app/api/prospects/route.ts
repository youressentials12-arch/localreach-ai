import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");
  const status = searchParams.get("status");

  let query = supabase
    .from("prospects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (campaignId) query = query.eq("campaign_id", campaignId);
  if (status) query = query.eq("outreach_status", status);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ prospects: data });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "ID lipsește" }, { status: 400 });

  // Log activity if status changed
  if (updates.outreach_status) {
    const { data: existing } = await supabase
      .from("prospects")
      .select("outreach_status")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (existing && existing.outreach_status !== updates.outreach_status) {
      await supabase.from("outreach_activities").insert({
        prospect_id: id,
        user_id: user.id,
        activity_type: "status_changed",
        details: {
          from: existing.outreach_status,
          to: updates.outreach_status,
        },
      });
    }

    if (updates.outreach_status === "contacted") {
      updates.contacted_at = new Date().toISOString();
      updates.last_activity_at = new Date().toISOString();

      await supabase.from("outreach_activities").insert({
        prospect_id: id,
        user_id: user.id,
        activity_type: "contacted",
        channel: updates.contact_channel,
      });
    }
  }

  if (updates.notes) {
    await supabase.from("outreach_activities").insert({
      prospect_id: id,
      user_id: user.id,
      activity_type: "note_added",
      details: { note: updates.notes },
    });
    updates.last_activity_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("prospects")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ prospect: data });
}
