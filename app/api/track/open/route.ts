import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/follow-ups/tokens";

// 1x1 transparent PNG
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64"
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (token) {
    const payload = verifyToken(token);
    if (payload?.t === "open" && typeof payload.mid === "string") {
      const supabase = await createClient();
      await supabase
        .from("outreach_messages")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", payload.mid)
        .is("opened_at", null); // only record first open
    }
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
