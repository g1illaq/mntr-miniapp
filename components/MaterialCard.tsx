"use client";
import { useState } from "react";
import Image from "next/image";
import { Material, HASHTAG_META } from "@/lib/content";

export function MaterialCard({ material }: { material: Material }) {
  const [saved, setSaved] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden cursor-pointer active:opacity-70 transition-opacity"
      style={{ backgroundColor: "var(--mc-ink-3)", border: "1px solid var(--mc-ink-border)" }}
    >
      {material.cover && (
        <div className="relative w-full h-36">
          <Image src={material.cover} alt={material.title} fill className="object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, var(--mc-ink-3))" }} />
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {material.hashtags.map((tag) => {
              const meta = HASHTAG_META[tag];
              return (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: "rgba(45,107,246,0.15)", color: "var(--mc-primary-bright)", border: "1px solid rgba(45,107,246,0.25)" }}>
                  {meta.emoji} {meta.label}
                </span>
              );
            })}
          </div>
          <button onClick={(e) => { e.stopPropagation(); setSaved(!saved); }}
            className="shrink-0 mt-0.5 transition-colors"
            style={{ color: saved ? "var(--mc-primary)" : "var(--mc-text-faint)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        <div>
          <p className="font-bold text-base leading-snug" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
            {material.title}
          </p>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--mc-text-muted)" }}>{material.subtitle}</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="label-mono">{material.readTime}</span>
          <span className="text-xs font-semibold" style={{ color: "var(--mc-primary-bright)" }}>Читать →</span>
        </div>
      </div>
    </div>
  );
}
