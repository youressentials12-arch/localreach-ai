import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { upgraded?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, stripe_customer_id")
    .eq("id", user.id)
    .single();

  return (
    <SettingsClient
      email={user.email ?? ""}
      plan={(profile?.plan ?? "starter") as "starter" | "pro" | "agency"}
      hasSubscription={!!profile?.stripe_customer_id}
      showUpgradeSuccess={searchParams.upgraded === "1"}
    />
  );
}
