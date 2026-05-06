import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DEFAULT_STEPS = [
  { step_order: 1, delay_days: 3, delay_hours: 0, channel: "email", tone: "friendly", use_ai_generation: true, body_template: "Bună ziua,\n\nAm observat că {{business_name}} din {{city}} ar putea beneficia de {{gap_identified}}.\n\nAș fi bucuros să discutăm.\n\n{{user_name}}", subject_template: "O idee pentru {{business_name}}" },
  { step_order: 2, delay_days: 5, delay_hours: 0, channel: "email", tone: "direct", use_ai_generation: true, body_template: "Revin cu un mesaj scurt.\n\nȘtiu că ești ocupat, dar am câteva idei concrete pentru {{business_name}} pe care le-aș putea implementa rapid.\n\n{{user_name}}", subject_template: "Revin: {{business_name}}" },
  { step_order: 3, delay_days: 7, delay_hours: 0, channel: "linkedin", tone: "casual", use_ai_generation: true, body_template: "Bună! Am văzut că {{business_name}} este activ și aș vrea să îți propun o colaborare. Ai 5 minute pentru un apel rapid?", subject_template: undefined },
];

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sequence } = await supabase
    .from("follow_up_sequences")
    .select("*")
    .eq("campaign_id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sequence) return NextResponse.json({ sequence: null, steps: [] });

  const { data: steps } = await supabase
    .from("follow_up_steps")
    .select("*")
    .eq("sequence_id", sequence.id)
    .order("step_order", { ascending: true });

  const { count: prospectsInSequence } = await supabase
    .from("scheduled_follow_ups")
    .select("prospect_id", { count: "exact", head: true })
    .eq("sequence_id", sequence.id)
    .eq("status", "pending");

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
  const { count: sentThisWeek } = await supabase
    .from("scheduled_follow_ups")
    .select("*", { count: "exact", head: true })
    .eq("sequence_id", sequence.id)
    .eq("status", "sent")
    .gte("sent_at", sevenDaysAgo);

  return NextResponse.json({ sequence, steps: steps ?? [], stats: { prospectsInSequence: prospectsInSequence ?? 0, sentThisWeek: sentThisWeek ?? 0 } });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify campaign ownership
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();
  if (!campaign) return NextResponse.json({ error: "Campanie negăsită" }, { status: 404 });

  const body = await req.json().catch(() => ({}));

  // Upsert sequence
  const { data: seq, error: seqErr } = await supabase
    .from("follow_up_sequences")
    .upsert(
      {
        campaign_id: params.id,
        user_id: user.id,
        name: body.name ?? "Secvență principală",
        enabled: body.enabled ?? false,
        send_window_start: body.send_window_start ?? "09:00",
        send_window_end: body.send_window_end ?? "18:00",
        send_on_weekends: body.send_on_weekends ?? false,
        timezone: body.timezone ?? "Europe/Bucharest",
        max_per_day: body.max_per_day ?? 50,
      },
      { onConflict: "campaign_id", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (seqErr) return NextResponse.json({ error: seqErr.message }, { status: 500 });

  // If brand new sequence, seed default steps
  const { count: existingSteps } = await supabase
    .from("follow_up_steps")
    .select("*", { count: "exact", head: true })
    .eq("sequence_id", seq.id);

  if ((existingSteps ?? 0) === 0) {
    await supabase.from("follow_up_steps").insert(
      DEFAULT_STEPS.map((s) => ({ ...s, sequence_id: seq.id }))
    );
  }

  // If sequence is now enabled, schedule step 1 for all 'contacted' prospects in campaign
  if (seq.enabled) {
    const { scheduleFirstStep } = await import("@/lib/follow-ups/scheduler");
    const { data: contacted } = await supabase
      .from("prospects")
      .select("id")
      .eq("campaign_id", params.id)
      .eq("user_id", user.id)
      .eq("outreach_status", "contacted")
      .is("unsubscribed_at", null);

    await Promise.allSettled(
      (contacted ?? []).map((p) =>
        scheduleFirstStep(supabase, seq.id, p.id, user.id, params.id)
      )
    );
  }

  const { data: steps } = await supabase
    .from("follow_up_steps")
    .select("*")
    .eq("sequence_id", seq.id)
    .order("step_order", { ascending: true });

  return NextResponse.json({ sequence: seq, steps: steps ?? [] });
}
