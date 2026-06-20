"use client";
import { currentMonth } from "@/lib/content";

export function SprintCard() {
  const progress = ((7 - currentMonth.sprintDaysLeft) / 7) * 100;

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: "linear-gradient(135deg, #1a1535 0%, #1a2a1a 100%)", border: "1px solid #2a2a2a" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Спринт месяца</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
          осталось {currentMonth.sprintDaysLeft} дн.
        </span>
      </div>

      <p className="text-white font-semibold leading-snug">{currentMonth.sprint}</p>

      <div className="space-y-1.5">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7C6FE0, #4CAF82)" }}
          />
        </div>
        <p className="text-xs text-white/40">{Math.round(progress)}% выполнено</p>
      </div>

      <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-80 active:opacity-60"
        style={{ background: "linear-gradient(90deg, #7C6FE0, #4CAF82)" }}>
        Отметить чек-ин
      </button>
    </div>
  );
}
