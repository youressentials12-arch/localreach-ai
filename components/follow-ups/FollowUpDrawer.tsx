"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Mail, Phone, Linkedin, MessageSquare, Clock, Send, XCircle, RotateCcw, Pencil, Loader2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ro } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";
import type { ScheduledFollowUpWithRelations, OutreachMessage } from "@/types";

interface Props {
  id: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "În așteptare",
  sent: "Trimis",
  cancelled: "Anulat",
  failed: "Eșuat",
  skipped: "Sărit",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-[#6366f1]/20 text-[#6366f1]",
  sent: "bg-[#22c55e]/20 text-[#22c55e]",
  cancelled: "bg-[#6b7280]/20 text-[#6b7280]",
  failed: "bg-[#ef4444]/20 text-[#ef4444]",
  skipped: "bg-[#f59e0b]/20 text-[#f59e0b]",
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
  manual_call: "Apel telefonic",
};

export default function FollowUpDrawer({ id, onClose, onUpdate }: Props) {
  const [fu, setFu] = useState<ScheduledFollowUpWithRelations | null>(null);
  const [history, setHistory] = useState<OutreachMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editBody, setEditBody] = useState("");
  const [editSubject, setEditSubject] = useState("");

  useEffect(() => {
    if (!id) { setFu(null); return; }
    setLoading(true);
    fetch(`/api/follow-ups/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setFu(d.followUp);
        setHistory(d.messageHistory ?? []);
        setEditBody(d.followUp?.custom_body ?? d.followUp?.follow_up_steps?.body_template ?? "");
        setEditSubject(d.followUp?.custom_subject ?? d.followUp?.follow_up_steps?.subject_template ?? "");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function act(path: string, method = "POST", body?: object) {
    setActing(true);
    const res = await fetch(`/api/follow-ups/${id}/${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    setActing(false);
    if (!res.ok) { toast.error(data.error ?? "Eroare"); return false; }
    onUpdate();
    return true;
  }

  async function handleSendNow() {
    if (await act("send-now")) toast.success("Programat pentru trimitere imediată.");
  }
  async function handleCancel() {
    if (await act("cancel", "POST", {})) { toast.success("Anulat."); onClose(); }
  }
  async function handleRetry() {
    if (await act("retry")) { toast.success("Reîncercat."); onClose(); }
  }
  async function handleSaveEdit() {
    if (await act("edit-message", "PUT", { subject: editSubject, body: editBody })) {
      toast.success("Mesaj actualizat.");
      setEditMode(false);
    }
  }

  const prospect = fu?.prospects as { business_name: string; business_address?: string } | null;
  const campaign = fu?.campaigns as { name: string } | null;
  const Icon = fu ? (CHANNEL_ICON[fu.channel] ?? Mail) : Mail;

  return (
    <AnimatePresence>
      {id && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#16161d] border-l border-[#2a2a3d] z-50 overflow-y-auto shadow-2xl"
          >
            <div className="p-5 border-b border-[#2a2a3d] flex items-center justify-between sticky top-0 bg-[#16161d] z-10">
              <h2 className="text-base font-semibold text-[#e2e2f0]">Detalii follow-up</h2>
              <button onClick={onClose} className="text-[#6b7280] hover:text-[#e2e2f0]"><X className="w-5 h-5" /></button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#6366f1]" /></div>
            )}

            {fu && !loading && (
              <div className="p-5 space-y-5">
                {/* Prospect info */}
                <div className="bg-[#1c1c26] rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#e2e2f0]">{prospect?.business_name ?? "—"}</p>
                    <Link href={`/prospects/${fu.prospect_id}`} className="text-xs text-[#6366f1] hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Deschide
                    </Link>
                  </div>
                  {prospect?.business_address && <p className="text-xs text-[#6b7280]">{prospect.business_address}</p>}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-[#6b7280]">Campanie:</span>
                    <span className="text-xs text-[#e2e2f0]">{campaign?.name ?? "—"}</span>
                  </div>
                </div>

                {/* Status + channel */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[fu.status]}`}>
                    {STATUS_LABEL[fu.status]}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm text-[#9ca3af]">
                    <Icon className="w-4 h-4" />
                    {CHANNEL_LABEL[fu.channel] ?? fu.channel}
                  </div>
                  <span className="text-xs text-[#6b7280]">Pasul {fu.step_order}</span>
                </div>

                {/* Scheduled time */}
                <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
                  <Clock className="w-4 h-4 text-[#6b7280]" />
                  <span>
                    {format(new Date(fu.scheduled_for), "d MMMM yyyy, HH:mm", { locale: ro })}
                    {" · "}
                    {formatDistanceToNow(new Date(fu.scheduled_for), { addSuffix: true, locale: ro })}
                  </span>
                </div>

                {/* Message preview / edit */}
                <div className="bg-[#1c1c26] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-[#6b7280]">Mesaj</p>
                    {fu.status === "pending" && (
                      <button onClick={() => setEditMode((e) => !e)} className="text-xs text-[#6366f1] hover:underline flex items-center gap-1">
                        <Pencil className="w-3 h-3" />
                        {editMode ? "Anulează editarea" : "Editează"}
                      </button>
                    )}
                  </div>

                  {editMode ? (
                    <div className="space-y-2">
                      {fu.channel === "email" && (
                        <input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          placeholder="Subiect"
                          className="w-full bg-[#0f0f13] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#e2e2f0] focus:outline-none focus:border-[#6366f1]"
                        />
                      )}
                      <textarea
                        rows={5}
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        className="w-full bg-[#0f0f13] border border-[#2a2a3d] rounded-lg px-3 py-2 text-sm text-[#e2e2f0] focus:outline-none focus:border-[#6366f1] resize-y"
                      />
                      <button
                        onClick={handleSaveEdit}
                        disabled={acting}
                        className="text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Salvează mesajul
                      </button>
                    </div>
                  ) : (
                    <div>
                      {(fu.custom_subject ?? fu.follow_up_steps?.subject_template) && (
                        <p className="text-xs text-[#6b7280] mb-1">Subiect: <span className="text-[#e2e2f0]">{fu.custom_subject ?? fu.follow_up_steps?.subject_template}</span></p>
                      )}
                      <pre className="text-xs text-[#9ca3af] whitespace-pre-wrap font-sans leading-relaxed">
                        {fu.custom_body ?? fu.follow_up_steps?.body_template ?? "(AI va genera la trimitere)"}
                      </pre>
                      {fu.follow_up_steps?.use_ai_generation && !fu.custom_body && (
                        <p className="text-[10px] text-[#6366f1] mt-2 italic">AI va genera conținut personalizat la momentul trimiterii</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {fu.status === "pending" && (
                    <>
                      <button onClick={handleSendNow} disabled={acting} className="flex items-center gap-1.5 text-sm bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors">
                        <Send className="w-3.5 h-3.5" />
                        Trimite acum
                      </button>
                      <button onClick={handleCancel} disabled={acting} className="flex items-center gap-1.5 text-sm bg-[#1c1c26] hover:bg-[#2a2a3d] text-[#9ca3af] hover:text-[#ef4444] px-3 py-2 rounded-lg border border-[#2a2a3d] transition-colors">
                        <XCircle className="w-3.5 h-3.5" />
                        Anulează
                      </button>
                    </>
                  )}
                  {fu.status === "failed" && (
                    <button onClick={handleRetry} disabled={acting} className="flex items-center gap-1.5 text-sm bg-[#f59e0b] hover:bg-[#d97706] text-black font-medium px-3 py-2 rounded-lg transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reîncearcă
                    </button>
                  )}
                </div>

                {/* Message history */}
                {history.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#6b7280] mb-3">Istoric mesaje în această campanie</p>
                    <div className="space-y-2">
                      {history.map((m) => (
                        <div key={m.id} className="bg-[#1c1c26] rounded-lg px-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-[#e2e2f0]">{m.channel}</span>
                            <span className="text-[10px] text-[#6b7280]">{format(new Date(m.sent_at), "d MMM, HH:mm", { locale: ro })}</span>
                          </div>
                          <div className="flex gap-3 text-[10px] text-[#6b7280]">
                            {m.opened_at && <span className="text-[#22c55e]">✓ Deschis</span>}
                            {m.clicked_at && <span className="text-[#6366f1]">✓ Click</span>}
                            {m.replied_at && <span className="text-[#f59e0b]">✓ Răspuns</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
