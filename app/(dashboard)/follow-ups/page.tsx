"use client";

import { useState, useCallback } from "react";
import { Calendar, List } from "lucide-react";
import StatsCards from "@/components/follow-ups/StatsCards";
import FiltersBar from "@/components/follow-ups/FiltersBar";
import CalendarView from "@/components/follow-ups/CalendarView";
import ListView from "@/components/follow-ups/ListView";
import FollowUpDrawer from "@/components/follow-ups/FollowUpDrawer";
import ProPlanGate from "@/components/follow-ups/ProPlanGate";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

interface Campaign { id: string; name: string }

type View = "calendar" | "list";

interface Filters {
  status: string;
  campaign_id: string;
  channel: string;
  search: string;
}

function FollowUpsContent() {
  const [view, setView] = useState<View>("calendar");
  const [filters, setFilters] = useState<Filters>({ status: "", campaign_id: "", channel: "", search: "" });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("campaigns").select("id, name").eq("user_id", user.id).order("name").then(({ data }) => {
        setCampaigns(data ?? []);
      });
    });
  }, []);

  // Realtime refresh
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("follow-ups-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "scheduled_follow_ups" }, () => {
        setRefreshKey((k) => k + 1);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleFilterChange = useCallback((partial: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...partial }));
  }, []);

  const handleFilterFailed = useCallback(() => {
    setFilters((f) => ({ ...f, status: "failed" }));
    setView("list");
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2f0]">Follow-up</h1>
          <p className="text-[#6b7280] text-sm mt-0.5">Gestionează follow-up-urile programate și trimise</p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-[#16161d] border border-[#2a2a3d] rounded-xl p-1">
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${view === "calendar" ? "bg-[#6366f1] text-white" : "text-[#6b7280] hover:text-[#e2e2f0]"}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Calendar
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${view === "list" ? "bg-[#6366f1] text-white" : "text-[#6b7280] hover:text-[#e2e2f0]"}`}
          >
            <List className="w-3.5 h-3.5" />
            Listă
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards onFilterFailed={handleFilterFailed} />

      {/* Filters */}
      <FiltersBar filters={filters} onChange={handleFilterChange} campaigns={campaigns} />

      {/* Main content */}
      {view === "calendar" ? (
        <CalendarView
          filters={filters}
          onOpenDrawer={setDrawerOpen}
          refresh={refreshKey}
        />
      ) : (
        <ListView
          filters={filters}
          onOpenDrawer={setDrawerOpen}
          refresh={refreshKey}
        />
      )}

      {/* Drawer */}
      <FollowUpDrawer
        id={drawerOpen}
        onClose={() => setDrawerOpen(null)}
        onUpdate={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}

export default function FollowUpsPage() {
  return (
    <ProPlanGate>
      <FollowUpsContent />
    </ProPlanGate>
  );
}
