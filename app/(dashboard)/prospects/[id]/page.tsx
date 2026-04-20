import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProspectDetailClient from "./ProspectDetailClient";

export default async function ProspectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: prospect }, { data: hooks }, { data: activities }] =
    await Promise.all([
      supabase
        .from("prospects")
        .select("*, campaigns(service_offered, qualification_criteria)")
        .eq("id", params.id)
        .eq("user_id", user!.id)
        .single(),
      supabase
        .from("hooks")
        .select("*")
        .eq("prospect_id", params.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("outreach_activities")
        .select("*")
        .eq("prospect_id", params.id)
        .order("created_at", { ascending: false }),
    ]);

  if (!prospect) notFound();

  const campaign = prospect.campaigns as unknown as {
    service_offered: string;
    qualification_criteria: Record<string, boolean>;
  } | null;

  return (
    <ProspectDetailClient
      prospect={prospect}
      initialHooks={hooks ?? []}
      activities={activities ?? []}
      serviceOffered={campaign?.service_offered ?? ""}
      criteria={campaign?.qualification_criteria ?? {}}
    />
  );
}
