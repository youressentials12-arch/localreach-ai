import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("scheduled_follow_ups")
    .select(`*,
      prospects(business_name, business_address, business_email, business_category),
      campaigns(name),
      follow_up_steps(subject_template, body_template, use_ai_generation, tone),
      outreach_messages(id, sent_at, opened_at, clicked_at, replied_at)`)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Negăsit" }, { status: 404 });

  // Past messages for this prospect in this campaign
  const { data: history } = await supabase
    .from("outreach_messages")
    .select("*")
    .eq("user_id", user.id)
    .eq("prospect_id", data.prospect_id)
    .eq("campaign_id", data.campaign_id)
    .order("sent_at", { ascending: false })
    .limit(10);

  return NextResponse.json({ followUp: data, messageHistory: history ?? [] });
}
