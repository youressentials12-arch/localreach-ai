import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { renderTemplate, buildTrackingVars } from "@/lib/follow-ups/scheduler";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: step } = await supabase
    .from("follow_up_steps")
    .select("*, follow_up_sequences!inner(user_id)")
    .eq("id", params.id)
    .single();

  if (!step) return NextResponse.json({ error: "Negăsit" }, { status: 404 });

  const seqUserId = (step.follow_up_sequences as { user_id: string } | null)?.user_id;
  if (seqUserId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const vars = buildTrackingVars(
    { business_name: "Restaurant La Mama", business_address: "Cluj-Napoca, jud. Cluj" },
    "Maria Ionescu",
    "Digital Agency SRL"
  );

  const subject = step.subject_template ? renderTemplate(step.subject_template, vars) : undefined;
  const body = renderTemplate(step.body_template, vars);

  return NextResponse.json({ subject, body });
}
