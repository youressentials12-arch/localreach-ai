import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const { data, error } = await supabase
    .from("follow_up_steps")
    .update({
      delay_days: body.delay_days,
      delay_hours: body.delay_hours,
      channel: body.channel,
      subject_template: body.subject_template,
      body_template: body.body_template,
      tone: body.tone,
      use_ai_generation: body.use_ai_generation,
      step_order: body.step_order,
    })
    .eq("id", params.id)
    .select("*, follow_up_sequences!inner(user_id)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const seqUserId = (data.follow_up_sequences as unknown as { user_id: string } | null)?.user_id;
  if (seqUserId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ step: data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership via sequence
  const { data: step } = await supabase
    .from("follow_up_steps")
    .select("sequence_id, step_order, follow_up_sequences!inner(user_id)")
    .eq("id", params.id)
    .single();

  if (!step) return NextResponse.json({ error: "Negăsit" }, { status: 404 });
  const seqUserId = (step.follow_up_sequences as unknown as { user_id: string } | null)?.user_id;
  if (seqUserId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await supabase.from("follow_up_steps").delete().eq("id", params.id);

  // Re-number remaining steps
  const { data: remaining } = await supabase
    .from("follow_up_steps")
    .select("id")
    .eq("sequence_id", step.sequence_id)
    .order("step_order", { ascending: true });

  await Promise.all(
    (remaining ?? []).map((s, i) =>
      supabase.from("follow_up_steps").update({ step_order: i + 1 }).eq("id", s.id)
    )
  );

  return NextResponse.json({ ok: true });
}
