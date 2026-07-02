"use client";
import { Sprint } from "@/lib/supabase";

function getSprintDay(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1);
}

function getSprintTotal(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
}

interface Props {
  sprint: Sprint;
  checkinStreak?: number;
  onCheckin?: () => void;
}

export function SprintCard({ sprint, checkinStreak = 0, onCheckin }: Props) {
  const day = getSprintDay(sprint.start_date);
  const total = getSprintTotal(sprint.start_date, sprint.end_date);
  const pct = Math.min(100, Math.round((day / total) * 100));

  return (
    <div className="rounded-2xl p-4 space-y-3"
      style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
      <div className="flex items-center justify-between">
        <span className="label-mono" style={{ color: "var(--mc-primary-bright)" }}>
          СПРИНТ · ДЕНЬ {day} ИЗ {total}
        </span>
        {checkinStreak > 0 && (
          <span className="label-mono" style={{ color: "var(--mc-text-faint)" }}>
            {checkinStreak} дн. подряд
          </span>
        )}
      </div>

      <p className="font-bold leading-snug" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
        {sprint.title}
      </p>

      {sprint.description && (
        <p className="text-sm leading-relaxed" style={{ color: "var(--mc-text-muted)" }}>
          {sprint.description}
        </p>
      )}

      {sprint.daily_task && (
        <div className="px-3 py-2.5 rounded-xl text-sm"
          style={{ backgroundColor: "rgba(45,107,246,0.1)", border: "1px solid rgba(45,107,246,0.2)" }}>
          <p className="label-mono mb-0.5" style={{ color: "var(--mc-primary-bright)", fontSize: 10 }}>ЗАДАНИЕ</p>
          <p style={{ color: "var(--mc-text)" }}>{sprint.daily_task}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--mc-ink-border)" }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary-bright))" }} />
        </div>
        <span className="label-mono" style={{ color: "var(--mc-text-faint)" }}>{pct}% пройдено</span>
      </div>

      {onCheckin && (
        <button
          onClick={onCheckin}
          className="w-full py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary))", color: "#fff" }}>
          Отметить чек-ин
        </button>
      )}
    </div>
  );
}
