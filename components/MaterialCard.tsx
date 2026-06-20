"use client";
import { useState } from "react";
import { Material, HASHTAG_META } from "@/lib/content";

export function MaterialCard({ material }: { material: Material }) {
  const [saved, setSaved] = useState(false);

  return (
    <div
      className="rounded-2xl p-4 space-y-3 cursor-pointer active:opacity-70 transition-opacity"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {material.hashtags.map((tag) => {
            const meta = HASHTAG_META[tag];
            return (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${meta.color}18`,
                  color: meta.color,
                  border: `1px solid ${meta.color}30`,
                }}
              >
                {meta.emoji} {meta.label}
              </span>
            );
          })}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
          className="shrink-0 mt-0.5 transition-colors"
          style={{ color: saved ? "var(--accent)" : "var(--text-secondary)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      <div>
        <p className="text-white font-semibold text-base leading-snug">{material.title}</p>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {material.subtitle}
        </p>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {material.readTime}
        </span>
        <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
          Читать →
        </span>
      </div>
    </div>
  );
}
