import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/follow-ups/tokens";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  let redirectUrl = "/";

  if (token) {
    const payload = verifyToken(token);
    if (payload?.t === "click" && typeof payload.mid === "string" && typeof payload.url === "string") {
      redirectUrl = payload.url;
      const supabase = await createClient();
      await supabase
        .from("outreach_messages")
        .update({ clicked_at: new Date().toISOString() })
        .eq("id", payload.mid)
        .is("clicked_at", null);
    }
  }

  return NextResponse.redirect(redirectUrl);
}
