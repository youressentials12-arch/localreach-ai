import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { parsePeriod } from "@/lib/analytics/queries";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}

const PERIOD_LABELS: Record<string, string> = {
  "7d": "ultimele 7 zile",
  "30d": "ultima lună",
  "90d": "ultimele 3 luni",
  "12m": "ultimul an",
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const period = body.period ?? "30d";
  const { from, to } = parsePeriod(period);

  // Fetch summary data
  const [msgRes, wonRes] = await Promise.all([
    supabase.from("outreach_messages")
      .select("channel, replied_at", { count: "exact" })
      .eq("user_id", user.id)
      .gte("sent_at", from.toISOString())
      .lte("sent_at", to.toISOString()),
    supabase.from("prospects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("outreach_status", "won")
      .gte("contacted_at", from.toISOString()),
  ]);

  const msgs        = msgRes.data ?? [];
  const total_sent  = msgs.length;
  const total_reply = msgs.filter(m => m.replied_at).length;
  const reply_rate  = total_sent > 0 ? Math.round((total_reply / total_sent) * 100) : 0;
  const clients_won = wonRes.count ?? 0;

  const periodLabel = PERIOD_LABELS[period] ?? period;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb">
      <h2 style="color:#6366f1;margin-bottom:4px">📊 Raport Analytics LocalReach AI</h2>
      <p style="color:#6b7280;font-size:14px;margin-top:0">Perioadă: ${periodLabel}</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:12px;background:#f9fafb;border-radius:8px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#1f2937">${total_sent}</div>
            <div style="font-size:13px;color:#6b7280;margin-top:4px">Mesaje trimise</div>
          </td>
          <td style="width:12px"></td>
          <td style="padding:12px;background:#f9fafb;border-radius:8px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#6366f1">${reply_rate}%</div>
            <div style="font-size:13px;color:#6b7280;margin-top:4px">Rată răspuns</div>
          </td>
          <td style="width:12px"></td>
          <td style="padding:12px;background:#f9fafb;border-radius:8px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#10b981">${clients_won}</div>
            <div style="font-size:13px;color:#6b7280;margin-top:4px">Clienți câștigați</div>
          </td>
        </tr>
      </table>
      <p style="color:#6b7280;font-size:13px;margin-top:24px;text-align:center">
        Vizualizează raportul complet pe <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://localreach-ai.vercel.app"}/analytics" style="color:#6366f1">LocalReach AI</a>
      </p>
    </div>`;

  if (process.env.RESEND_API_KEY && user.email) {
    await getResend().emails.send({
      from:    process.env.RESEND_FROM_EMAIL ?? "noreply@localreach.ai",
      to:      user.email,
      subject: `Raport Analytics LocalReach AI — ${periodLabel}`,
      html,
    });
  }

  return NextResponse.json({ ok: true });
}
