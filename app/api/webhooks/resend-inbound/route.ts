import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cancelPendingFollowUps } from "@/lib/follow-ups/scheduler";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Resend inbound webhook payload shape
  const inReplyTo = body?.headers?.["in-reply-to"] as string | undefined;
  const from = body?.from as string | undefined;

  if (!from) return NextResponse.json({ ok: true });

  const supabase = await createClient();

  // Try to find the message by In-Reply-To header (message ID) or by from email
  let messageId: string | null = null;

  if (inReplyTo) {
    // Resend assigns message IDs — check if we stored one
    const { data: msg } = await supabase
      .from("outreach_messages")
      .select("id, prospect_id")
      .eq("id", inReplyTo.replace(/[<>]/g, ""))
      .maybeSingle();

    if (msg) {
      messageId = msg.id;
      await supabase
        .from("outreach_messages")
        .update({ replied_at: new Date().toISOString() })
        .eq("id", msg.id);

      await supabase
        .from("prospects")
        .update({ outreach_status: "replied", last_activity_at: new Date().toISOString() })
        .eq("id", msg.prospect_id)
        .eq("outreach_status", "contacted");

      await cancelPendingFollowUps(supabase, msg.prospect_id, "replied");
    }
  }

  return NextResponse.json({ ok: true, messageId });
}
