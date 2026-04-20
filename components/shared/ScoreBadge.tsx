import { cn, getScoreColor, getScoreLabel } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const colorClass = getScoreColor(score);
  const label = getScoreLabel(score);

  if (size === "lg") {
    return (
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center shrink-0",
            colorClass
          )}
        >
          <span className="text-white text-2xl font-bold">{score}</span>
        </div>
        <div>
          <p className="text-sm text-[#6b7280]">Scor oportunitate</p>
          <p className="font-semibold text-[#e2e2f0]">{label}</p>
          <div className="mt-1.5 w-32 h-2 bg-[#2a2a3d] rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", colorClass)}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (size === "sm") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-white",
          colorClass
        )}
      >
        {score}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-semibold text-white",
        colorClass
      )}
    >
      {score}
      <span className="text-white/70 text-xs font-normal">{label}</span>
    </span>
  );
}
