"use client";

import { useState } from "react";

interface HeatmapCell { day: number; hour: number; count: number; replies: number }

interface Props {
  cells: HeatmapCell[];
  insight: string;
  loading: boolean;
}

const DAYS  = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function BestTimeHeatmap({ cells, insight, loading }: Props) {
  const [metric, setMetric] = useState<"count" | "rate">("count");

  if (loading) {
    return (
      <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6 animate-pulse">
        <div className="h-5 bg-[#2a2a3d] rounded w-56 mb-5" />
        <div className="h-44 bg-[#2a2a3d] rounded" />
      </div>
    );
  }

  function getValue(cell: HeatmapCell | undefined): number {
    if (!cell) return 0;
    if (metric === "count") return cell.count;
    return cell.count > 0 ? cell.replies / cell.count : 0;
  }

  const maxVal = Math.max(...cells.map(getValue), 0.001);

  function cellBg(cell: HeatmapCell | undefined): string {
    const v = getValue(cell);
    const intensity = v / maxVal;
    return `rgba(99,102,241,${(0.05 + intensity * 0.92).toFixed(2)})`;
  }

  function cellTitle(cell: HeatmapCell | undefined, day: number, hour: number): string {
    const d = DAYS[day];
    const h = `${hour.toString().padStart(2, "0")}:00`;
    if (!cell || cell.count === 0) return `${d} ${h} — fără date`;
    if (metric === "count") return `${d} ${h} — ${cell.count} mesaje`;
    const rate = cell.count > 0 ? Math.round((cell.replies / cell.count) * 100) : 0;
    return `${d} ${h} — ${rate}% rată răspuns (${cell.replies}/${cell.count})`;
  }

  const hasData = cells.some(c => c.count > 0);

  return (
    <div className="bg-[#16161d] border border-[#2a2a3d] rounded-xl p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#e2e2f0]">Harta timpului optim</h3>
          <p className="text-xs text-[#6b7280] mt-0.5">Europe/Bucharest</p>
        </div>
        <div className="flex bg-[#1c1c26] border border-[#2a2a3d] rounded-lg p-0.5 text-xs">
          {(["count", "rate"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1.5 rounded-md transition-colors ${metric === m ? "bg-[#6366f1] text-white" : "text-[#6b7280] hover:text-[#e2e2f0]"}`}
            >
              {m === "count" ? "Mesaje" : "Rată răspuns"}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="h-40 flex items-center justify-center text-[#6b7280] text-sm">
          Nicio dată disponibilă pentru perioada selectată.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Hour labels */}
              <div className="flex mb-1 ml-20">
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="text-[10px] text-[#6b7280] text-center"
                    style={{ width: 20, flexShrink: 0 }}
                  >
                    {h % 6 === 0 ? h : ""}
                  </div>
                ))}
              </div>
              {/* Grid rows */}
              {DAYS.map((day, di) => (
                <div key={di} className="flex items-center mb-0.5 gap-1">
                  <span className="text-[11px] text-[#6b7280] w-16 shrink-0 text-right pr-2">{day}</span>
                  {HOURS.map(h => {
                    const cell = cells.find(c => c.day === di && c.hour === h);
                    return (
                      <div
                        key={h}
                        title={cellTitle(cell, di, h)}
                        className="rounded-sm cursor-default"
                        style={{ width: 19, height: 19, flexShrink: 0, backgroundColor: cellBg(cell) }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 text-[10px] text-[#6b7280]">
            <span>Mai puțin</span>
            {[0.08, 0.25, 0.45, 0.65, 0.85].map(op => (
              <div key={op} className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: `rgba(99,102,241,${op})` }} />
            ))}
            <span>Mai mult</span>
          </div>

          {insight && (
            <p className="text-sm text-[#a5b4fc] mt-4 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg px-3 py-2.5 leading-relaxed">
              💡 {insight}
            </p>
          )}
        </>
      )}
    </div>
  );
}
