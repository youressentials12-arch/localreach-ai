import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const { data: seq } = await supabase
    .from("follow_up_sequences")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();
  if (!seq) return NextResponse.json({ error: "Negăsit" }, { status: 404 });

  // Count existing steps
  const { count } = await supabase
    .from("follow_up_steps")
    .select("*", { count: "exact", head: true })
    .eq("sequence_id", params.id);

  if ((count ?? 0) >= 7) {
    return NextResponse.json({ error: "Maxim 7 pași per secvență" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));

  const { data, error } = await supabase
    .from("follow_up_steps")
    .insert({
      sequence_id: params.id,
      step_order: (count ?? 0) + 1,
      delay_days: body.delay_days ?? 3,
      delay_hours: body.delay_hours ?? 0,
      channel: body.channel ?? "email",
      subject_template: body.subject_template,
      body_template: body.body_template ?? "",
      tone: body.tone ?? "friendly",
      use_ai_generation: body.use_ai_generation ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ step: data }, { status: 201 });
}
