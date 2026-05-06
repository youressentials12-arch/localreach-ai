"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Phone, Linkedin, MessageSquare, MoreHorizontal, Send, Calendar, XCircle, RotateCcw, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { toast } from "sonner";
import type { ScheduledFollowUpWithRelations } from "@/types";

interface Filters {
  status: string;
  campaign_id: string;
  channel: string;
  search: string;
}

interface Props {
  filters: Filters;
  onOpenDrawer: (id: string) => void;
  refresh: number;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "În așteptare",
  sent: "Trimis",
  cancelled: "Anulat",
  failed: "Eșuat",
  skipped: "Sărit",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-[#6366f1]/15 text-[#6366f1]",
  sent: "bg-[#22c55e]/15 text-[#22c55e]",
  cancelled: "bg-[#6b7280]/15 text-[#6b7280]",
  failed: "bg-[#ef4444]/15 text-[#ef4444]",
  skipped: "bg-[#f59e0b]/15 text-[#f59e0b]",
};

const CHANNEL_ICON: Record<string, React.ElementType> = {
  email: Mail,
  phone: Phone,
  linkedin: Linkedin,
  sms: MessageSquare,
  whatsapp: MessageSquare,
  manual_call: Phone,
};

const CHANNEL_LABEL: Record<string, string> = {
  email: "Email",
  linkedin: "LinkedIn",
  sms: "SMS",
  whatsapp: "WhatsApp",
  manual_call: "Apel",
};

const PAGE_SIZE = 50;

export default function ListView({ filters, onOpenDrawer, refresh }: Props) {
  const [rows, setRows] = useState<ScheduledFollowUpWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      view: "list",
      page: String(page),
      limit: String(PAGE_SIZE),
      ...(filters.status && { status: filters.status }),
      ...(filters.campaign_id && { campaign_id: filters.campaign_id }),
      ...(filters.channel && { channel: filters.channel }),
      ...(filters.search && { search: filters.search }),
    });
    const res = await fetch(`/api/follow-ups?${params}`);
    if (res.ok) {
      const data = await res.json();
      setRows(data.followUps ?? []);
      setTotal(data.total ?? 0);
    }
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchData(); }, [fetchData, refresh]);
  useEffect(() => { setPage(1); }, [filters]);

  async function handleAction(id: string, path: string, method = "POST", body?: object) {
    setActing(id);
    const res = await fetch(`/api/follow-ups/${id}/${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    setActing(null);
    if (!res.ok) { toast.error(data.error ?? "Eroare"); return; }
    fetchData();
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[#6366f1]" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-12 text-center">
        <p className="text-[#e2e2f0] font-medium mb-1">Nicio înregistrare</p>
        <p className="text-[#6b7280] text-sm">Încearcă să modifici filtrele sau activează o secvență dintr-o campanie.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[#6b7280] border-b border-[#2a2a3d]">
                <th className="px-4 py-3 font-medium">Programat pentru</th>
                <th className="px-4 py-3 font-medium">Prospect</th>
                <th className="px-4 py-3 font-medium">Campanie</th>
                <th className="px-4 py-3 font-medium">Canal</th>
                <th className="px-4 py-3 font-medium">Pas</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3d]">
              {rows.map((row) => {
                const prospect = row.prospects as { business_name: string } | null;
                const campaign = row.campaigns as { name: string } | null;
                const Icon = CHANNEL_ICON[row.channel] ?? Mail;
                return (
                  <tr key={row.id} className="hover:bg-[#1c1c26] transition-colors">
                    <td className="px-4 py-3 text-[#9ca3af] whitespace-nowrap">
                      {format(new Date(row.scheduled_for), "d MMM yyyy, HH:mm", { locale: ro })}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#e2e2f0] truncate max-w-[160px]">{prospect?.business_name ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#1c1c26] border border-[#2a2a3d] text-[#9ca3af] px-2 py-0.5 rounded-full truncate max-w-[120px] block">{campaign?.name ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-[#9ca3af]">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-xs">{CHANNEL_LABEL[row.channel] ?? row.channel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6b7280] text-xs">#{row.step_order}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[row.status]}`}>
                        {STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="text-[#6b7280] hover:text-[#e2e2f0] p-1 rounded hover:bg-[#2a2a3d] transition-colors">
                            {acting === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-1.5 shadow-xl z-50 min-w-[160px]"
                            align="end"
                          >
                            {[
                              { label: "Vezi detalii", icon: Eye, action: () => onOpenDrawer(row.id), show: true },
                              { label: "Trimite acum", icon: Send, action: () => handleAction(row.id, "send-now"), show: row.status === "pending" },
                              { label: "Anulează", icon: XCircle, action: () => handleAction(row.id, "cancel", "POST", {}), show: row.status === "pending" },
                              { label: "Reîncearcă", icon: RotateCcw, action: () => handleAction(row.id, "retry"), show: row.status === "failed" },
                            ].filter((item) => item.show).map((item) => (
                              <DropdownMenu.Item
                                key={item.label}
                                onSelect={item.action}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-[#9ca3af] hover:text-[#e2e2f0] hover:bg-[#1c1c26] rounded-lg cursor-pointer outline-none transition-colors"
                              >
                                <item.icon className="w-3.5 h-3.5" />
                                {item.label}
                              </DropdownMenu.Item>
                            ))}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[#6b7280]">
          <span>{total} rezultate</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 hover:text-[#e2e2f0] disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Pagina {page} din {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 hover:text-[#e2e2f0] disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
