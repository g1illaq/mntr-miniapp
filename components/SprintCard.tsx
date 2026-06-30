"use client";
import { currentMonth } from "@/lib/content";

export function SprintCard() {
  const progress = Math.round(((currentMonth.sprintTotal - currentMonth.sprintDaysLeft) / currentMonth.sprintTotal) * 100);

  return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
      <div className="flex items-center justify-between">
        <span className="label-mono" style={{ color: "var(--mc-primary-bright)" }}>Спринт месяца</span>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--mc-ink-3)", color: "var(--mc-text-faint)" }}>
          осталось {currentMonth.sprintDaysLeft} дн.
        </span>
      </div>

      <p className="font-bold leading-snug" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
        {currentMonth.sprint}
      </p>

      <div className="space-y-1.5">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--mc-ink-border)" }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary-bright))" }} />
        </div>
        <span className="label-mono">{progress}% выполнено</span>
      </div>

      <button className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary))", color: "var(--mc-text)" }}>
        Отметить чек-ин
      </button>
    </div>
  );
}
