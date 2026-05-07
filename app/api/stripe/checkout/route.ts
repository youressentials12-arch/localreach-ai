import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://localreach-ai.vercel.app";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const plan: "pro" | "agency" = body.plan === "agency" ? "agency" : "pro";

  const priceId = plan === "agency"
    ? process.env.STRIPE_AGENCY_PRICE_ID
    : process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    return NextResponse.json(
      { error: "Prețul pentru acest plan nu este configurat. Contactați suportul." },
      { status: 400 }
    );
  }

  const stripe = getStripe();

  // Reuse existing Stripe customer so subscription history is preserved
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | null | undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer:             customerId,
    client_reference_id:  user.id,
    payment_method_types: ["card"],
    line_items:           [{ price: priceId, quantity: 1 }],
    mode:                 "subscription",
    allow_promotion_codes: true,
    success_url: `${APP_URL}/settings?upgraded=1`,
    cancel_url:  `${APP_URL}/settings`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
