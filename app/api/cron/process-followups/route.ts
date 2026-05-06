import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { renderTemplate, buildTrackingVars, cancelPendingFollowUps, scheduleNextStep } from "@/lib/follow-ups/scheduler";
import { makeOpenToken, makeClickToken, makeUnsubscribeToken } from "@/lib/follow-ups/tokens";
import { Resend } from "resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://localreach-ai.vercel.app";
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}
const STUBBED_CHANNELS = ["sms", "whatsapp", "linkedin"];

function addTrackingToEmail(body: string, messageId: string, prospectId: string, userId: string): string {
  const openPixel = `<img src="${APP_URL}/api/track/open?token=${makeOpenToken(messageId)}" width="1" height="1" style="display:none" alt="" />`;
  const unsubLink = `${APP_URL}/api/unsubscribe?token=${makeUnsubscribeToken(prospectId, userId)}`;
  const footer = `\n\n---\n<small>Dacă nu mai vrei să primești mesaje, <a href="${unsubLink}">dezabonează-te aici</a>.</small>`;

  // Rewrite http links for click tracking
  const tracked = body.replace(/href="(https?:\/\/[^"]+)"/g, (_, url) => {
    const clickToken = makeClickToken(messageId, url);
    return `href="${APP_URL}/api/track/click?token=${clickToken}"`;
  });

  return tracked + footer + openPixel;
}

export async function POST(req: Request) {
  // Verify cron secret
  const cronSecret = req.headers.get("x-cron-secret") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Fetch pending follow-ups due now
  const { data: pending, error } = await supabase
    .from("scheduled_follow_ups")
    .select(`*,
      prospects(id, business_name, business_address, business_email, outreach_status, unsubscribed_at),
      follow_up_sequences(enabled, max_per_day, timezone, send_window_start, send_window_end, send_on_weekends),
      follow_up_steps(subject_template, body_template, tone, use_ai_generation, channel)`)
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results = { sent: 0, cancelled: 0, failed: 0, skipped: 0 };

  for (const fu of pending ?? []) {
    const prospect = fu.prospects as { id: string; business_name: string; business_address?: string; business_email?: string; outreach_status: string; unsubscribed_at?: string } | null;
    const seq = fu.follow_up_sequences as { enabled: boolean; max_per_day: number } | null;
    const step = fu.follow_up_steps as { subject_template?: string; body_template: string; tone: string; use_ai_generation: boolean; channel: string } | null;

    try {
      // Auto-stop checks
      if (!prospect) {
        await supabase.from("scheduled_follow_ups").update({ status: "cancelled", cancelled_reason: "status_changed" }).eq("id", fu.id);
        results.cancelled++;
        continue;
      }

      if (prospect.unsubscribed_at) {
        await cancelPendingFollowUps(supabase, prospect.id, "unsubscribed");
        results.cancelled++;
        continue;
      }

      if (["won", "lost", "negotiating"].includes(prospect.outreach_status)) {
        await cancelPendingFollowUps(supabase, prospect.id, "status_changed");
        results.cancelled++;
        continue;
      }

      if (!seq?.enabled) {
        await supabase.from("scheduled_follow_ups").update({ status: "cancelled", cancelled_reason: "sequence_disabled" }).eq("id", fu.id);
        results.cancelled++;
        continue;
      }

      // Check daily max for this user
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      const { count: sentToday } = await supabase
        .from("scheduled_follow_ups")
        .select("*", { count: "exact", head: true })
        .eq("user_id", fu.user_id)
        .eq("status", "sent")
        .gte("sent_at", dayStart.toISOString());

      if ((sentToday ?? 0) >= seq.max_per_day) {
        // Push to tomorrow
        const tomorrow = new Date(fu.scheduled_for);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        await supabase.from("scheduled_follow_ups").update({ scheduled_for: tomorrow.toISOString() }).eq("id", fu.id);
        continue;
      }

      // Handle stubbed channels
      if (STUBBED_CHANNELS.includes(fu.channel)) {
        await supabase.from("scheduled_follow_ups").update({
          status: "skipped",
          failure_reason: `Canal ${fu.channel} nu este integrat încă.`,
          sent_at: new Date().toISOString(),
        }).eq("id", fu.id);

        if (fu.channel === "manual_call") {
          // Create notification for manual call
          await supabase.from("notifications").insert({
            user_id: fu.user_id,
            type: "follow_up",
            title: `Sună ${prospect.business_name} azi`,
            body: `Pasul ${fu.step_order} al secvenței necesită un apel manual.`,
            prospect_id: fu.prospect_id,
            campaign_id: fu.campaign_id,
          });
        }

        results.skipped++;
        await scheduleNextStep(supabase, fu, new Date());
        continue;
      }

      // Build message content
      const vars = buildTrackingVars(prospect, "Utilizator", "Compania Ta");
      let subject = fu.custom_subject ?? (step?.subject_template ? renderTemplate(step.subject_template, vars) : `Follow-up: ${prospect.business_name}`);
      let body = fu.custom_body ?? (step?.body_template ? renderTemplate(step.body_template, vars) : "Bună ziua,\n\nRevin cu un mesaj.");

      // Create message record first (to get ID for tracking)
      const { data: msg } = await supabase
        .from("outreach_messages")
        .insert({
          prospect_id: fu.prospect_id,
          user_id: fu.user_id,
          campaign_id: fu.campaign_id,
          channel: fu.channel,
          subject,
          body,
        })
        .select()
        .single();

      if (!msg) throw new Error("Failed to create message record");

      // Add tracking to email
      if (fu.channel === "email") {
        const htmlBody = body.replace(/\n/g, "<br>") + "\n";
        const trackedBody = addTrackingToEmail(htmlBody, msg.id, fu.prospect_id, fu.user_id);

        const toEmail = prospect.business_email;
        if (!toEmail) {
          await supabase.from("scheduled_follow_ups").update({
            status: "skipped",
            failure_reason: "Prospect nu are email.",
            sent_at: new Date().toISOString(),
            outreach_message_id: msg.id,
          }).eq("id", fu.id);
          results.skipped++;
          await scheduleNextStep(supabase, fu, new Date());
          continue;
        }

        if (process.env.RESEND_API_KEY) {
          await getResend().emails.send({
            from: process.env.RESEND_FROM_EMAIL ?? "noreply@localreach.ai",
            to: toEmail,
            subject,
            html: trackedBody,
            headers: {
              "List-Unsubscribe": `<${APP_URL}/api/unsubscribe?token=${makeUnsubscribeToken(fu.prospect_id, fu.user_id)}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          });
        }
      }

      // Mark as sent
      const now = new Date();
      await supabase.from("scheduled_follow_ups").update({
        status: "sent",
        sent_at: now.toISOString(),
        outreach_message_id: msg.id,
      }).eq("id", fu.id);

      // Log activity
      await supabase.from("outreach_activities").insert({
        prospect_id: fu.prospect_id,
        user_id: fu.user_id,
        activity_type: "contacted",
        channel: fu.channel,
        details: { step: fu.step_order, follow_up: true, message_id: msg.id },
      });

      results.sent++;

      // Schedule next step
      await scheduleNextStep(supabase, fu, now);

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Eroare necunoscută";
      const newRetry = (fu.retry_count ?? 0) + 1;

      if (newRetry >= 3) {
        await supabase.from("scheduled_follow_ups").update({
          status: "failed",
          failure_reason: errMsg,
          retry_count: newRetry,
        }).eq("id", fu.id);

        await supabase.from("notifications").insert({
          user_id: fu.user_id,
          type: "follow_up",
          title: "Follow-up eșuat",
          body: `Nu s-a putut trimite follow-up pentru ${(fu.prospects as { business_name: string } | null)?.business_name ?? "prospect"}. Motiv: ${errMsg}`,
          prospect_id: fu.prospect_id,
        });
        results.failed++;
      } else {
        await supabase.from("scheduled_follow_ups").update({
          scheduled_for: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          retry_count: newRetry,
        }).eq("id", fu.id);
      }
    }
  }

  return NextResponse.json({ processed: pending?.length ?? 0, ...results });
}
