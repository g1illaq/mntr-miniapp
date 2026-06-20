"use client";
import { Direction, DIRECTION_META } from "@/lib/content";

const mockProgress: Record<Direction, number> = {
  M: 65,
  N: 40,
  T: 55,
  R: 30,
};

export function ProgressSection() {
  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <p className="text-sm font-semibold text-white/60 uppercase tracking-wider">Мой путь MNTR</p>

      <div className="space-y-3">
        {(Object.keys(DIRECTION_META) as Direction[]).map((dir) => {
          const meta = DIRECTION_META[dir];
          const pct = mockProgress[dir];
          return (
            <div key={dir} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  <span style={{ color: meta.color }}>{dir}</span> — {meta.label}
                </span>
                <span className="text-xs text-white/40">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: meta.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
