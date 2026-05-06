import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cancelPendingFollowUps } from "@/lib/follow-ups/scheduler";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  // Get the prospect_id to cancel all pending (or just this one)
  const { data: fu } = await supabase
    .from("scheduled_follow_ups")
    .select("prospect_id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!fu) return NextResponse.json({ error: "Negăsit" }, { status: 404 });

  if (body.cancelAll) {
    await cancelPendingFollowUps(supabase, fu.prospect_id, "manual");
  } else {
    await supabase
      .from("scheduled_follow_ups")
      .update({ status: "cancelled", cancelled_reason: "manual" })
      .eq("id", params.id)
      .eq("user_id", user.id);
  }

  return NextResponse.json({ ok: true });
}
