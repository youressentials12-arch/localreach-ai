import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/follow-ups/tokens";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const payload = verifyUnsubscribeToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/unsubscribe?error=invalid", req.url));
  }

  const supabase = await createClient();
  await supabase
    .from("prospects")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("id", payload.prospectId);

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://localreach-ai.vercel.app";
  return NextResponse.redirect(`${APP_URL}/unsubscribe?success=1`);
}
