"use client";
import { Material, HASHTAG_META } from "@/lib/content";

function openTgLink(url: string) {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, "_blank");
  }
}

export function MaterialCard({ material, onRead }: { material: Material; onRead?: () => void }) {
  return (
    <div
      className="rounded-2xl overflow-hidden active:opacity-80 transition-opacity"
      style={{ backgroundColor: "var(--mc-ink-3)", border: "1px solid var(--mc-ink-border)" }}
    >
      {/* Cover image */}
      <div
        className="relative w-full cursor-pointer"
        style={{ height: material.cover ? 220 : 80 }}
        onClick={onRead}
      >
        {material.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={material.cover}
            alt={material.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: "var(--mc-ink-2)" }}
          >
            <span style={{ fontSize: 36, opacity: 0.3 }}>📚</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2.5">
        {/* Hashtag chips */}
        {material.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {material.hashtags.map((tag) => {
              const meta = HASHTAG_META[tag];
              return (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: "rgba(45,107,246,0.15)",
                    color: "var(--mc-primary-bright)",
                    border: "1px solid rgba(45,107,246,0.25)",
                  }}
                >
                  {meta.emoji} {meta.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Title */}
        <p
          className="font-bold text-base leading-snug cursor-pointer"
          style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}
          onClick={onRead}
        >
          {material.title}
        </p>

        {/* Description */}
        {material.subtitle && (
          <p
            className="text-sm leading-relaxed cursor-pointer"
            style={{ color: "var(--mc-text-muted)" }}
            onClick={onRead}
          >
            {material.subtitle}
          </p>
        )}

        {/* CTA → открыть пост в Telegram через WebApp API */}
        {material.tgLink && (
          <button
            onClick={() => openTgLink(material.tgLink!)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold mt-1"
            style={{
              background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary))",
              color: "#fff",
            }}
          >
            Перейти к посту →
          </button>
        )}
      </div>
    </div>
  );
}
