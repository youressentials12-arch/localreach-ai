"use client";

import { useState } from "react";
import { Download, Printer, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  period:    string;
  campaign?: string;
  channel?:  string;
}

export default function ExportFooter({ period, campaign, channel }: Props) {
  const [emailLoading, setEmailLoading] = useState(false);

  function downloadCSV() {
    const params = new URLSearchParams();
    params.set("period", period);
    if (campaign) params.set("campaign", campaign);
    if (channel)  params.set("channel", channel);
    window.open(`/api/analytics/export?${params.toString()}`, "_blank");
  }

  async function sendEmailReport() {
    setEmailLoading(true);
    try {
      const res = await fetch("/api/analytics/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      if (res.ok) toast.success("Raportul a fost trimis pe email!");
      else        toast.error("Eroare la trimiterea raportului.");
    } catch {
      toast.error("Eroare la trimiterea raportului.");
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-5 border-t border-[#2a2a3d] print:hidden">
      <button
        onClick={downloadCSV}
        className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#e2e2f0] border border-[#2a2a3d] hover:border-[#6366f1]/40 px-4 py-2 rounded-lg transition-colors"
      >
        <Download size={14} />
        Export CSV
      </button>
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#e2e2f0] border border-[#2a2a3d] hover:border-[#6366f1]/40 px-4 py-2 rounded-lg transition-colors"
      >
        <Printer size={14} />
        Salvează PDF
      </button>
      <button
        onClick={sendEmailReport}
        disabled={emailLoading}
        className="flex items-center gap-2 text-sm bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {emailLoading ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
        Trimite raport email
      </button>
    </div>
  );
}
