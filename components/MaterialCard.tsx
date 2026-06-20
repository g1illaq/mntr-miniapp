"use client";
import { Material, DIRECTION_META } from "@/lib/content";
import { DirectionChip } from "./DirectionChip";

export function MaterialCard({ material }: { material: Material }) {
  const meta = DIRECTION_META[material.direction];

  return (
    <div
      className="rounded-2xl p-4 space-y-3 cursor-pointer transition-colors active:opacity-70"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <DirectionChip direction={material.direction} />
          {material.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40">
              {tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-white/30 shrink-0">{material.readTime}</span>
      </div>

      <div>
        <p className="text-white font-semibold leading-snug">{material.title}</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{material.subtitle}</p>
      </div>

      <div className="h-px" style={{ backgroundColor: "var(--border)" }} />

      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: meta.color }}>Читать →</span>
        <button className="text-white/20 hover:text-white/50 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
