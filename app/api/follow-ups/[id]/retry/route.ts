import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("scheduled_follow_ups")
    .update({
      status: "pending",
      failure_reason: null,
      scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min from now
    })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .eq("status", "failed");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
