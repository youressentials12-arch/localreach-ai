import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  const { data, error } = await supabase
    .from("follow_up_sequences")
    .update({
      name: body.name,
      enabled: body.enabled,
      send_window_start: body.send_window_start,
      send_window_end: body.send_window_end,
      send_on_weekends: body.send_on_weekends,
      timezone: body.timezone,
      max_per_day: body.max_per_day,
    })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sequence: data });
}
