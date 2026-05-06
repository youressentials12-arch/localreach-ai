import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { scheduled_for } = body as { scheduled_for?: string };

  if (!scheduled_for) return NextResponse.json({ error: "scheduled_for required" }, { status: 400 });

  const newDate = new Date(scheduled_for);
  if (newDate <= new Date()) {
    return NextResponse.json({ error: "Nu poți programa în trecut" }, { status: 400 });
  }

  const { error } = await supabase
    .from("scheduled_follow_ups")
    .update({ scheduled_for })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
