"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import ScoreBadge from "@/components/shared/ScoreBadge";
import { getStatusLabel, getStatusColor } from "@/lib/utils";
import type { Prospect, OutreachStatus } from "@/types";

const COLUMNS: { id: OutreachStatus; label: string; emoji: string }[] = [
  { id: "discovered", label: "Descoperit", emoji: "🔍" },
  { id: "contacted", label: "Contactat", emoji: "📤" },
  { id: "replied", label: "Răspuns", emoji: "💬" },
  { id: "negotiating", label: "Negociere", emoji: "🤝" },
  { id: "won", label: "Câștigat", emoji: "✅" },
  { id: "lost", label: "Pierdut", emoji: "❌" },
];

function KanbanCard({ prospect }: { prospect: Prospect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: prospect.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-[#1c1c26] border border-[#2a2a3d] rounded-lg p-3 cursor-grab active:cursor-grabbing transition-opacity ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      <Link
        href={`/prospects/${prospect.id}`}
        onClick={(e) => e.stopPropagation()}
        className="font-medium text-sm text-[#e2e2f0] hover:text-[#6366f1] transition-colors block mb-1 leading-tight"
      >
        {prospect.business_name}
      </Link>
      <p className="text-xs text-[#6b7280] truncate mb-2">
        {prospect.business_category}
      </p>
      {prospect.opportunity_score != null && (
        <ScoreBadge score={prospect.opportunity_score} size="sm" />
      )}
    </div>
  );
}

function KanbanColumn({
  column,
  prospects,
}: {
  column: (typeof COLUMNS)[0];
  prospects: Prospect[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex-1 min-w-[200px] max-w-[260px]">
      <div className="flex items-center gap-1.5 mb-3">
        <span>{column.emoji}</span>
        <span className="text-sm font-medium text-[#e2e2f0]">
          {column.label}
        </span>
        <span className="ml-auto text-xs text-[#6b7280] bg-[#2a2a3d] px-1.5 py-0.5 rounded">
          {prospects.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[400px] rounded-xl p-2 transition-colors ${
          isOver ? "bg-[#6366f1]/10 border border-[#6366f1]/30" : "bg-[#16161d]"
        }`}
      >
        <div className="space-y-2">
          {prospects.map((p) => (
            <KanbanCard key={p.id} prospect={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProspectKanban({
  initialProspects,
}: {
  initialProspects: Prospect[];
}) {
  const [prospects, setProspects] = useState(initialProspects);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeProspect = prospects.find((p) => p.id === activeId);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const newStatus = over.id as OutreachStatus;
    const prospect = prospects.find((p) => p.id === active.id);
    if (!prospect || prospect.outreach_status === newStatus) return;

    setProspects((prev) =>
      prev.map((p) =>
        p.id === active.id ? { ...p, outreach_status: newStatus } : p
      )
    );

    await fetch("/api/prospects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: active.id, outreach_status: newStatus }),
    });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            prospects={prospects.filter((p) => p.outreach_status === col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProspect && (
          <div className="bg-[#1c1c26] border border-[#6366f1] rounded-lg p-3 shadow-2xl w-[220px] rotate-2">
            <p className="font-medium text-sm text-[#e2e2f0] mb-1">
              {activeProspect.business_name}
            </p>
            <p className="text-xs text-[#6b7280]">
              {activeProspect.business_category}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
