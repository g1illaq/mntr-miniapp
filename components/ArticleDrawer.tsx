"use client";
import { Material, HASHTAG_META } from "@/lib/content";

function extractLinks(text: string): { url: string; label: string }[] {
  const matches = text.match(/https?:\/\/[^\s]+/g) || [];
  return matches.map((url) => {
    if (url.includes("youtu")) return { url, label: "▶️ Смотреть на YouTube" };
    if (url.includes("t.me")) return { url, label: "📨 Открыть в Telegram" };
    if (url.includes(".pdf")) return { url, label: "📄 Открыть PDF" };
    return { url, label: "🔗 Перейти по ссылке" };
  });
}

function renderBody(text: string) {
  return text.split("\n").map((line, i) => {
    if (/^https?:\/\//.test(line.trim())) return null;
    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="text-lg font-bold mt-6 mb-2"
          style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
          {line.slice(3)}
        </h2>
      );
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1
        ? <strong key={j} style={{ color: "var(--mc-text)" }}>{part}</strong>
        : part
    );
    return (
      <p key={i} className="text-sm leading-relaxed mb-1" style={{ color: "var(--mc-text-muted)" }}>
        {rendered}
      </p>
    );
  });
}

export function ArticleDrawer({ material, onClose }: { material: Material | null; onClose: () => void }) {
  if (!material) return null;
  const links = extractLinks(material.body || "");

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className="relative flex flex-col rounded-t-3xl max-h-[92vh]"
        style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "var(--mc-ink-border)" }} />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 flex items-start justify-between gap-3 shrink-0">
          <div className="flex-1">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {material.hashtags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: "rgba(45,107,246,0.15)", color: "var(--mc-primary-bright)", border: "1px solid rgba(45,107,246,0.25)" }}>
                  {HASHTAG_META[tag]?.emoji} {HASHTAG_META[tag]?.label}
                </span>
              ))}
            </div>
            <h1 className="text-xl font-black leading-snug"
              style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
              {material.title}
            </h1>
          </div>
          <button onClick={onClose} className="mt-1 shrink-0" style={{ color: "var(--mc-text-faint)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-px shrink-0" style={{ backgroundColor: "var(--mc-ink-border)" }} />

        <div className="overflow-y-auto flex-1 px-5 py-4 scrollbar-hide">
          {/* Cover image */}
          {material.cover && (
            <div className="w-full rounded-2xl overflow-hidden mb-5" style={{ height: 220 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={material.cover} alt={material.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Body text */}
          {material.body ? renderBody(material.body) : (
            <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>{material.subtitle}</p>
          )}

          {/* Links from lesson body */}
          {links.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-xs mb-3"
                style={{ color: "var(--mc-text-faint)", fontFamily: "var(--mc-font-mono)" }}>
                МАТЕРИАЛЫ УРОКА
              </p>
              {links.map(({ url, label }, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold w-full"
                  style={{ backgroundColor: "rgba(45,107,246,0.12)", color: "var(--mc-primary-bright)", border: "1px solid rgba(45,107,246,0.2)" }}>
                  {label}
                </a>
              ))}
            </div>
          )}

          {/* Main CTA → Telegram post (video lessons in comments) */}
          {material.tgLink && (
            <a
              href={material.tgLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full mt-6 py-3.5 rounded-xl text-sm font-semibold"
              style={{
                background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary))",
                color: "#fff",
              }}
            >
              Смотреть уроки в Telegram →
            </a>
          )}

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
