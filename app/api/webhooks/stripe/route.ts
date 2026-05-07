import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Service-role client — bypasses RLS, safe because this route validates Stripe signatures
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function planFromPriceId(priceId: string): "starter" | "pro" | "agency" {
  const proIds = (process.env.STRIPE_PRO_PRICE_IDS ?? process.env.STRIPE_PRO_PRICE_ID ?? "")
    .split(",").filter(Boolean);
  const agencyIds = (process.env.STRIPE_AGENCY_PRICE_IDS ?? process.env.STRIPE_AGENCY_PRICE_ID ?? "")
    .split(",").filter(Boolean);
  if (proIds.includes(priceId))    return "pro";
  if (agencyIds.includes(priceId)) return "agency";
  return "starter";
}

export async function POST(request: NextRequest) {
  const body      = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Semnătură lipsă" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Semnătură invalidă" }, { status: 400 });
  }

  const supabase = getSupabase();

  switch (event.type) {
    case "checkout.session.completed": {
      const session    = event.data.object as Stripe.Checkout.Session;
      const userId     = session.client_reference_id;
      const customerId = session.customer as string;
      const subId      = session.subscription as string;

      if (!userId || !subId) break;

      const sub     = await stripe.subscriptions.retrieve(subId);
      const priceId = sub.items.data[0]?.price.id ?? "";
      const plan    = planFromPriceId(priceId);

      await supabase
        .from("profiles")
        .update({ plan, stripe_customer_id: customerId, stripe_subscription_id: subId })
        .eq("id", userId);
      break;
    }

    case "customer.subscription.updated": {
      const sub        = event.data.object as Stripe.Subscription;
      const priceId    = sub.items.data[0]?.price.id ?? "";
      const plan       = planFromPriceId(priceId);
      const customerId = sub.customer as string;

      await supabase
        .from("profiles")
        .update({ plan, stripe_subscription_id: sub.id })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub        = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      await supabase
        .from("profiles")
        .update({ plan: "starter", stripe_subscription_id: null })
        .eq("stripe_customer_id", customerId);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
