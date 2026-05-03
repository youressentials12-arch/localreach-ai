import { createClient } from "@/lib/supabase/server";
import ProspectsClient from "./ProspectsClient";

export default async function ProspectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: prospects } = await supabase
    .from("prospects")
    .select("*, campaigns(name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#e2e2f0]">Toți prospecții</h1>
        <p className="text-[#6b7280] text-sm mt-0.5">
          {prospects?.length ?? 0} afaceri în baza de date
        </p>
      </div>
      <ProspectsClient prospects={(prospects ?? []) as Parameters<typeof ProspectsClient>[0]["prospects"]} />
    </div>
  );
}
