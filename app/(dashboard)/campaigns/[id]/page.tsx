import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CampaignDetailClient from "./CampaignDetailClient";

export default async function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .single();

  if (!campaign) notFound();

  const { data: prospects } = await supabase
    .from("prospects")
    .select("*")
    .eq("campaign_id", params.id)
    .eq("user_id", user!.id)
    .order("opportunity_score", { ascending: false, nullsFirst: false });

  return (
    <CampaignDetailClient
      campaign={campaign}
      initialProspects={prospects ?? []}
    />
  );
}
