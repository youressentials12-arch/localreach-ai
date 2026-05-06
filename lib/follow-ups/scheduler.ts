import type { SupabaseClient } from "@supabase/supabase-js";

export interface SequenceWindow {
  send_window_start: string;
  send_window_end: string;
  send_on_weekends: boolean;
  timezone: string;
}

// Returns local date/time components for a given UTC instant in a timezone
function getLocalParts(utcDate: Date, tz: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const parts = fmt.formatToParts(utcDate);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  return {
    year: parseInt(get("year")),
    month: parseInt(get("month")) - 1, // 0-indexed
    day: parseInt(get("day")),
    hour: parseInt(get("hour")) % 24,
    minute: parseInt(get("minute")),
    dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")),
  };
}

// Converts a "local" datetime (in tz) to UTC Date
function localToUTC(year: number, month: number, day: number, hour: number, minute: number, tz: string): Date {
  // Build a reference UTC instant at noon on this local date to get the TZ offset
  const noon = new Date(Date.UTC(year, month, day, 12, 0, 0));
  const localNoon = getLocalParts(noon, tz);

  // Compute offset: how many minutes ahead is local time vs UTC at this date
  const localMins = localNoon.hour * 60 + localNoon.minute;
  const utcMins = 12 * 60; // noon UTC
  const offsetMins = localMins - utcMins;

  // Convert target local time to UTC
  const targetLocalMins = year * 0 + month * 0 + day * 0 + hour * 60 + minute;
  const localEpoch = Date.UTC(year, month, day, hour, minute, 0);
  return new Date(localEpoch - offsetMins * 60 * 1000);
}

// Advance date by N days in a timezone-safe way
function addLocalDays(date: Date, days: number, tz: string): Date {
  const p = getLocalParts(date, tz);
  return localToUTC(p.year, p.month, p.day + days, p.hour, p.minute, tz);
}

export function computeScheduledFor(
  baseTime: Date,
  seq: SequenceWindow,
  delayDays: number,
  delayHours: number
): Date {
  const jitterMs = Math.round((Math.random() - 0.5) * 10 * 60 * 1000); // ±5 min
  let t = new Date(baseTime.getTime() + (delayDays * 86400 + delayHours * 3600) * 1000 + jitterMs);

  const [winStartH, winStartM] = seq.send_window_start.split(":").map(Number);
  const [winEndH, winEndM] = seq.send_window_end.split(":").map(Number);
  const startTotalMins = winStartH * 60 + winStartM;
  const endTotalMins = winEndH * 60 + winEndM;

  for (let i = 0; i < 10; i++) {
    const lp = getLocalParts(t, seq.timezone);
    const curMins = lp.hour * 60 + lp.minute;

    // Push off weekends
    if (!seq.send_on_weekends && (lp.dow === 0 || lp.dow === 6)) {
      const daysToAdd = lp.dow === 6 ? 2 : 1; // Sat→Mon, Sun→Mon
      t = localToUTC(lp.year, lp.month, lp.day + daysToAdd, winStartH, winStartM, seq.timezone);
      continue;
    }

    // Before window: set to window start same day
    if (curMins < startTotalMins) {
      t = localToUTC(lp.year, lp.month, lp.day, winStartH, winStartM, seq.timezone);
      continue;
    }

    // After window: push to next day window start
    if (curMins >= endTotalMins) {
      t = localToUTC(lp.year, lp.month, lp.day + 1, winStartH, winStartM, seq.timezone);
      continue;
    }

    break; // within window
  }

  return t;
}

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export function buildTrackingVars(prospect: {
  business_name: string;
  business_address?: string | null;
  business_email?: string | null;
}, userName: string, userCompany: string): Record<string, string> {
  const cityMatch = prospect.business_address?.match(/^[^,]+/);
  return {
    prospect_name: prospect.business_name,
    business_name: prospect.business_name,
    city: cityMatch?.[0] ?? "",
    gap_identified: "prezența online slabă",
    user_name: userName,
    user_company: userCompany,
  };
}

export async function cancelPendingFollowUps(
  supabase: SupabaseClient,
  prospectId: string,
  reason: "replied" | "unsubscribed" | "status_changed" | "manual" | "sequence_disabled"
): Promise<void> {
  await supabase
    .from("scheduled_follow_ups")
    .update({ status: "cancelled", cancelled_reason: reason })
    .eq("prospect_id", prospectId)
    .eq("status", "pending");
}

export async function scheduleNextStep(
  supabase: SupabaseClient,
  currentFollowUp: {
    user_id: string;
    prospect_id: string;
    campaign_id: string;
    sequence_id: string;
    step_order: number;
  },
  sentAt: Date
): Promise<void> {
  // Load sequence and next step
  const { data: seq } = await supabase
    .from("follow_up_sequences")
    .select("*")
    .eq("id", currentFollowUp.sequence_id)
    .single();

  if (!seq || !seq.enabled) return;

  const { data: nextStep } = await supabase
    .from("follow_up_steps")
    .select("*")
    .eq("sequence_id", currentFollowUp.sequence_id)
    .eq("step_order", currentFollowUp.step_order + 1)
    .single();

  if (!nextStep) return; // no more steps

  const scheduledFor = computeScheduledFor(
    sentAt,
    seq,
    nextStep.delay_days,
    nextStep.delay_hours
  );

  await supabase.from("scheduled_follow_ups").insert({
    user_id: currentFollowUp.user_id,
    prospect_id: currentFollowUp.prospect_id,
    campaign_id: currentFollowUp.campaign_id,
    sequence_id: currentFollowUp.sequence_id,
    step_id: nextStep.id,
    step_order: nextStep.step_order,
    channel: nextStep.channel,
    scheduled_for: scheduledFor.toISOString(),
    status: "pending",
  });
}

export async function scheduleFirstStep(
  supabase: SupabaseClient,
  sequenceId: string,
  prospectId: string,
  userId: string,
  campaignId: string,
  baseTime: Date = new Date()
): Promise<void> {
  const { data: seq } = await supabase
    .from("follow_up_sequences")
    .select("*")
    .eq("id", sequenceId)
    .single();

  if (!seq || !seq.enabled) return;

  const { data: firstStep } = await supabase
    .from("follow_up_steps")
    .select("*")
    .eq("sequence_id", sequenceId)
    .order("step_order", { ascending: true })
    .limit(1)
    .single();

  if (!firstStep) return;

  // Check if already scheduled for this prospect+step
  const { count } = await supabase
    .from("scheduled_follow_ups")
    .select("*", { count: "exact", head: true })
    .eq("prospect_id", prospectId)
    .eq("step_id", firstStep.id)
    .in("status", ["pending", "sent"]);

  if ((count ?? 0) > 0) return; // already scheduled

  const scheduledFor = computeScheduledFor(
    baseTime,
    seq,
    firstStep.delay_days,
    firstStep.delay_hours
  );

  await supabase.from("scheduled_follow_ups").insert({
    user_id: userId,
    prospect_id: prospectId,
    campaign_id: campaignId,
    sequence_id: sequenceId,
    step_id: firstStep.id,
    step_order: firstStep.step_order,
    channel: firstStep.channel,
    scheduled_for: scheduledFor.toISOString(),
    status: "pending",
  });
}
