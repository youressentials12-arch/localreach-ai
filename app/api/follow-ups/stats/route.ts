import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
  const oneDayAgo = new Date(Date.now() - 86400 * 1000).toISOString();

  const [
    { count: scheduledToday },
    { count: sentThisWeek },
    { count: waitingReply },
    { count: failed },
  ] = await Promise.all([
    supabase
      .from("scheduled_follow_ups")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "pending")
      .gte("scheduled_for", todayStart)
      .lt("scheduled_for", todayEnd),
    supabase
      .from("scheduled_follow_ups")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "sent")
      .gte("sent_at", sevenDaysAgo),
    supabase
      .from("outreach_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("replied_at", null)
      .lt("sent_at", oneDayAgo),
    supabase
      .from("scheduled_follow_ups")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "failed"),
  ]);

  return NextResponse.json({
    scheduledToday: scheduledToday ?? 0,
    sentThisWeek: sentThisWeek ?? 0,
    waitingReply: waitingReply ?? 0,
    failed: failed ?? 0,
  });
}
