"use client";
import { Material, HASHTAG_META } from "@/lib/content";

function openTgLink(url: string) {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    try { tg.openTelegramLink(url); return; } catch {}
  }
  window.location.href = url;
}

interface Props {
  material: Material;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onRead?: () => void;
}

export function MaterialCard({ material, isSaved = false, onToggleSave, onRead }: Props) {
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
          <img src={material.cover} alt={material.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--mc-ink-2)" }}>
            <span style={{ fontSize: 36, opacity: 0.3 }}>📚</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2.5">
        {/* Хэштеги + закладка */}
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
          {onToggleSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
              className="shrink-0 p-1 -mt-0.5 transition-colors"
              style={{ color: isSaved ? "var(--mc-primary-bright)" : "var(--mc-text-faint)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
        </div>

        {/* Заголовок */}
        <p className="font-bold text-base leading-snug cursor-pointer"
          style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}
          onClick={onRead}>
          {material.title}
        </p>

        {/* Описание */}
        {material.subtitle && (
          <p className="text-sm leading-relaxed cursor-pointer" style={{ color: "var(--mc-text-muted)" }} onClick={onRead}>
            {material.subtitle}
          </p>
        )}

        {/* Кнопка → пост в Telegram */}
        {material.tgLink && (
          <button
            onClick={() => openTgLink(material.tgLink!)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold mt-1"
            style={{ background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary))", color: "#fff" }}
          >
            Перейти к посту →
          </button>
        )}
      </div>
    </div>
  );
}
