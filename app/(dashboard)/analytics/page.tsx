import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AnalyticsPageClient from "./AnalyticsPageClient";

export const dynamic = "force-dynamic";

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-[#16161d] rounded-lg w-40" />
      <div className="h-10 bg-[#16161d] rounded-xl" />
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-[#16161d] rounded-xl" />)}
      </div>
      <div className="h-64 bg-[#16161d] rounded-xl" />
      <div className="h-72 bg-[#16161d] rounded-xl" />
    </div>
  );
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: campaigns }] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user.id).single(),
    supabase
      .from("campaigns")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <Suspense fallback={<Skeleton />}>
      <AnalyticsPageClient
        plan={(profile?.plan ?? "starter") as "starter" | "pro" | "agency"}
        campaigns={campaigns ?? []}
      />
    </Suspense>
  );
}
