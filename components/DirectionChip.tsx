"use client";
import { Direction, DIRECTION_META } from "@/lib/content";

export function DirectionChip({ direction }: { direction: Direction }) {
  const meta = DIRECTION_META[direction];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      {direction} · {meta.label}
    </span>
  );
}
