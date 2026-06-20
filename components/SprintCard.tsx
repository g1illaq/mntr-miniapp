"use client";
import { currentMonth } from "@/lib/content";

export function SprintCard() {
  const progress = Math.round(((currentMonth.sprintTotal - currentMonth.sprintDaysLeft) / currentMonth.sprintTotal) * 100);

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: "linear-gradient(135deg, #13131E 0%, #1A2035 100%)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
          Спринт месяца
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)" }}>
          осталось {currentMonth.sprintDaysLeft} дн.
        </span>
      </div>

      <p className="text-white font-semibold leading-snug">{currentMonth.sprint}</p>

      <div className="space-y-1.5">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--accent), var(--accent2))" }}
          />
        </div>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{progress}% выполнено</p>
      </div>

      <button
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: "linear-gradient(90deg, var(--accent), var(--accent2))" }}
      >
        Отметить чек-ин
      </button>
    </div>
  );
}
