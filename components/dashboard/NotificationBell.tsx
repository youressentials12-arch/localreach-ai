"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, X, CheckCheck, ListChecks, Target, Megaphone, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import Link from "next/link";

interface AppNotification {
  id: string;
  type: "follow_up" | "goal_reached" | "campaign_done" | "system";
  title: string;
  body?: string;
  read: boolean;
  prospect_id?: string;
  campaign_id?: string;
  created_at: string;
}

const TYPE_ICON: Record<string, React.ElementType> = {
  follow_up: ListChecks,
  goal_reached: Target,
  campaign_done: Megaphone,
  system: Info,
};

const TYPE_COLOR: Record<string, string> = {
  follow_up: "text-[#f59e0b] bg-[#f59e0b]/10",
  goal_reached: "text-[#22c55e] bg-[#22c55e]/10",
  campaign_done: "text-[#6366f1] bg-[#6366f1]/10",
  system: "text-[#6b7280] bg-[#2a2a3d]",
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnread(data.unread ?? 0);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const supabase = createClient();
    const channel = supabase
      .channel("notifications-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => fetchNotifications()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((ns) => ns.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnread((u) => Math.max(0, u - 1));
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-[#16161d] border border-[#2a2a3d] text-[#6b7280] hover:text-[#e2e2f0] hover:border-[#6366f1]/50 transition-all"
        title="Notificări"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#6366f1] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-[#16161d] border border-[#2a2a3d] rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3d]">
            <span className="text-sm font-semibold text-[#e2e2f0]">Notificări</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[#6366f1] hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marchează toate
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-[#6b7280] hover:text-[#e2e2f0]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#2a2a3d]">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-[#2a2a3d] mx-auto mb-2" />
                <p className="text-xs text-[#6b7280]">Nicio notificare</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Info;
                const colorClass = TYPE_COLOR[n.type] ?? TYPE_COLOR.system;
                const href = n.prospect_id
                  ? `/prospects/${n.prospect_id}`
                  : n.campaign_id
                  ? `/campaigns/${n.campaign_id}`
                  : undefined;

                return (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 hover:bg-[#1c1c26] transition-colors cursor-pointer ${!n.read ? "bg-[#1c1c26]" : ""}`}
                    onClick={() => { if (!n.read) markRead(n.id); }}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs font-medium leading-snug ${!n.read ? "text-[#e2e2f0]" : "text-[#9ca3af]"}`}>
                          {n.title}
                        </p>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] shrink-0 mt-1" />}
                      </div>
                      {n.body && <p className="text-[10px] text-[#6b7280] mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-[#6b7280] mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ro })}
                      </p>
                      {href && (
                        <Link
                          href={href}
                          className="text-[10px] text-[#6366f1] hover:underline mt-0.5 block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Deschide →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
