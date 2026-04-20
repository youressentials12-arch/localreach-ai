import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ScoreBadge from "@/components/shared/ScoreBadge";
import { getStatusColor, getStatusLabel, formatDate } from "@/lib/utils";
import { Users } from "lucide-react";

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

      {(prospects ?? []).length === 0 ? (
        <div className="bg-[#16161d] border border-[#2a2a3d] border-dashed rounded-xl p-12 text-center">
          <Users size={40} className="text-[#2a2a3d] mx-auto mb-3" />
          <p className="text-[#e2e2f0] font-medium mb-1">Niciun prospect găsit</p>
          <p className="text-[#6b7280] text-sm mb-4">
            Creează o campanie și caută afaceri pentru a popula această listă.
          </p>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Creează campanie
          </Link>
        </div>
      ) : (
        <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a3d] text-xs text-[#6b7280] font-medium">
                  <th className="text-left px-4 py-3">Afacere</th>
                  <th className="text-left px-4 py-3">Industrie</th>
                  <th className="text-left px-4 py-3">Locație</th>
                  <th className="text-left px-4 py-3">Scor</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Campanie</th>
                  <th className="text-left px-4 py-3">Adăugat</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3d]">
                {prospects!.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#1c1c26] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#e2e2f0] truncate max-w-[200px]">
                        {p.business_name}
                      </p>
                      {p.business_phone && (
                        <p className="text-xs text-[#6b7280]">
                          {p.business_phone}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#6b7280]">
                      {p.business_category ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#6b7280] max-w-[150px] truncate">
                      {p.business_address ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {p.opportunity_score != null ? (
                        <ScoreBadge score={p.opportunity_score} size="sm" />
                      ) : (
                        <span className="text-[#6b7280]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                          p.outreach_status
                        )}`}
                      >
                        {getStatusLabel(p.outreach_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6b7280] text-xs">
                      {(p.campaigns as unknown as { name: string } | null)
                        ?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#6b7280] text-xs whitespace-nowrap">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/prospects/${p.id}`}
                        className="text-xs text-[#6366f1] hover:underline"
                      >
                        Deschide
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
