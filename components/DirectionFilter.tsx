"use client";
import { Direction, DIRECTION_META } from "@/lib/content";

interface Props {
  active: Direction | "all";
  onChange: (d: Direction | "all") => void;
}

export function DirectionFilter({ active, onChange }: Props) {
  const all = [{ key: "all" as const, label: "Все" }];
  const dirs = Object.entries(DIRECTION_META).map(([key, meta]) => ({
    key: key as Direction,
    label: meta.label,
  }));

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {[...all, ...dirs].map(({ key, label }) => {
        const isActive = active === key;
        const color = key === "all" ? "#ffffff" : DIRECTION_META[key as Direction].color;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: isActive ? color : "var(--bg-card)",
              color: isActive ? "#000" : "var(--text-secondary)",
              border: `1px solid ${isActive ? color : "var(--border)"}`,
            }}
          >
            {key !== "all" ? `${key} · ` : ""}{label}
          </button>
        );
      })}
    </div>
  );
}
