"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput, EventDropArg } from "@fullcalendar/core";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { ro } from "date-fns/locale";
import { toast } from "sonner";
import { Loader2, CalendarX2 } from "lucide-react";
import Link from "next/link";
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

const STATUS_COLOR: Record<string, string> = {
  pending: "#6366f1",
  sent: "#22c55e",
  cancelled: "#4b5563",
  failed: "#ef4444",
  skipped: "#f59e0b",
};

const CHANNEL_EMOJI: Record<string, string> = {
  email: "✉",
  linkedin: "in",
  sms: "💬",
  whatsapp: "💬",
  manual_call: "📞",
};

function fuToEvent(fu: ScheduledFollowUpWithRelations): EventInput {
  const prospect = fu.prospects as { business_name: string } | null;
  const color = STATUS_COLOR[fu.status] ?? "#6b7280";
  const emoji = CHANNEL_EMOJI[fu.channel] ?? "";
  return {
    id: fu.id,
    title: `${emoji} ${prospect?.business_name ?? "Prospect"} #${fu.step_order}`,
    start: fu.scheduled_for,
    backgroundColor: color,
    borderColor: color,
    textColor: "#fff",
    extendedProps: { status: fu.status, fu },
    editable: fu.status === "pending",
    classNames: fu.status === "cancelled" ? ["line-through", "opacity-60"] : [],
  };
}

export default function CalendarView({ filters, onOpenDrawer, refresh }: Props) {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(true);
  const calRef = useRef<FullCalendar | null>(null);

  const fetchRange = useCallback(async (from: Date, to: Date) => {
    setLoading(true);
    const params = new URLSearchParams({
      view: "calendar",
      from: from.toISOString(),
      to: to.toISOString(),
      ...(filters.status && { status: filters.status }),
      ...(filters.campaign_id && { campaign_id: filters.campaign_id }),
      ...(filters.channel && { channel: filters.channel }),
      ...(filters.search && { search: filters.search }),
    });
    const res = await fetch(`/api/follow-ups?${params}`);
    if (res.ok) {
      const data = await res.json();
      setEvents((data.followUps ?? []).map(fuToEvent));
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    const now = new Date();
    fetchRange(startOfMonth(now), endOfMonth(addMonths(now, 1)));
  }, [fetchRange, refresh]);

  async function handleEventDrop(info: EventDropArg) {
    const newDate = info.event.start;
    if (!newDate || newDate <= new Date()) {
      info.revert();
      toast.error("Nu poți programa în trecut");
      return;
    }

    const res = await fetch(`/api/follow-ups/${info.event.id}/reschedule`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduled_for: newDate.toISOString() }),
    });

    if (!res.ok) {
      info.revert();
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Eroare la reprogramare");
    } else {
      toast.success("Reprogramat cu succes.");
    }
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-[#0f0f13]/60 flex items-center justify-center z-10 rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin text-[#6366f1]" />
        </div>
      )}

      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl overflow-hidden follow-up-calendar">
        {events.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <CalendarX2 className="w-12 h-12 text-[#2a2a3d] mb-4" />
            <p className="text-[#e2e2f0] font-medium mb-2">Nu ai follow-up-uri programate</p>
            <p className="text-[#6b7280] text-sm mb-6">Activează o secvență dintr-o campanie ca să începi.</p>
            <Link href="/campaigns" className="text-sm bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-lg transition-colors">
              Vezi campaniile
            </Link>
          </div>
        ) : (
          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="ro"
            firstDay={1}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            buttonText={{ today: "Azi", month: "Lună", week: "Săptămână" }}
            events={events}
            editable={true}
            droppable={false}
            eventDrop={handleEventDrop}
            eventClick={(info) => onOpenDrawer(info.event.id)}
            datesSet={(info) => fetchRange(info.start, info.end)}
            eventDisplay="block"
            dayMaxEvents={4}
            height="auto"
            eventClassNames="cursor-pointer text-xs"
          />
        )}
      </div>

      <style>{`
        .follow-up-calendar .fc {
          background: transparent;
          color: #e2e2f0;
        }
        .follow-up-calendar .fc-toolbar-title { font-size: 1rem; font-weight: 600; color: #e2e2f0; }
        .follow-up-calendar .fc-button { background: #1c1c26 !important; border: 1px solid #2a2a3d !important; color: #9ca3af !important; font-size: 0.75rem !important; padding: 0.25rem 0.625rem !important; border-radius: 0.5rem !important; }
        .follow-up-calendar .fc-button:hover { background: #2a2a3d !important; color: #e2e2f0 !important; }
        .follow-up-calendar .fc-button-active { background: #6366f1 !important; border-color: #6366f1 !important; color: #fff !important; }
        .follow-up-calendar .fc-col-header-cell { background: #1c1c26; border-color: #2a2a3d; }
        .follow-up-calendar .fc-col-header-cell-cushion { color: #6b7280; font-size: 0.7rem; font-weight: 500; padding: 0.5rem; text-decoration: none !important; }
        .follow-up-calendar .fc-daygrid-day { background: transparent; border-color: #2a2a3d; }
        .follow-up-calendar .fc-daygrid-day:hover { background: #1c1c26; }
        .follow-up-calendar .fc-daygrid-day-number { color: #6b7280; font-size: 0.75rem; padding: 0.25rem 0.5rem; text-decoration: none !important; }
        .follow-up-calendar .fc-day-today { background: rgba(99, 102, 241, 0.05) !important; }
        .follow-up-calendar .fc-day-today .fc-daygrid-day-number { color: #6366f1; font-weight: 700; }
        .follow-up-calendar .fc-event { border-radius: 4px; padding: 1px 4px; font-size: 0.7rem; }
        .follow-up-calendar .fc-more-link { color: #6366f1; font-size: 0.7rem; }
        .follow-up-calendar .fc-scrollgrid { border-color: #2a2a3d; }
        .follow-up-calendar .fc-scrollgrid-section td { border-color: #2a2a3d; }
        .follow-up-calendar .fc-toolbar { padding: 1rem; }
        .follow-up-calendar .fc-daygrid-body { background: transparent; }
        .follow-up-calendar .fc-sat .fc-daygrid-day, .follow-up-calendar .fc-sun .fc-daygrid-day { background: rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
}
