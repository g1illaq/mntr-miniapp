"use client";
import { useState } from "react";
import { Hashtag, HASHTAG_META } from "@/lib/content";

interface FilterState { hashtags: Hashtag[]; sort: "new" | "old"; showSaved: boolean; }
interface Props { open: boolean; onClose: () => void; value: FilterState; onChange: (v: FilterState) => void; }

export function FilterDrawer({ open, onClose, value, onChange }: Props) {
  const [local, setLocal] = useState<FilterState>(value);

  const toggleTag = (tag: Hashtag) =>
    setLocal((p) => ({ ...p, hashtags: p.hashtags.includes(tag) ? p.hashtags.filter((t) => t !== tag) : [...p.hashtags, tag] }));

  const apply = () => { onChange(local); onClose(); };
  const reset = () => { const v = { hashtags: [], sort: "new" as const, showSaved: false }; setLocal(v); onChange(v); onClose(); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative rounded-t-3xl flex flex-col max-h-[85vh]"
        style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "var(--mc-ink-border)" }} />
        </div>

        <div className="px-5 pb-3 flex items-center justify-between">
          <p className="font-bold text-lg" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>Фильтр</p>
          <button onClick={onClose} style={{ color: "var(--mc-text-faint)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 space-y-5 pb-4 scrollbar-hide">
          <div className="space-y-2">
            <p className="label-mono">Сортировка</p>
            <div className="flex gap-2">
              {([["new", "От новых к старым"], ["old", "От старых к новым"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setLocal((p) => ({ ...p, sort: key }))}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    backgroundColor: local.sort === key ? "var(--mc-primary)" : "var(--mc-ink-3)",
                    color: local.sort === key ? "#fff" : "var(--mc-text-muted)",
                    border: `1px solid ${local.sort === key ? "var(--mc-primary)" : "var(--mc-ink-border)"}`,
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="label-mono">Категории</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(HASHTAG_META) as [Hashtag, typeof HASHTAG_META[Hashtag]][]).map(([tag, meta]) => {
                const active = local.hashtags.includes(tag);
                return (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: active ? "rgba(45,107,246,0.2)" : "var(--mc-ink-3)",
                      color: active ? "var(--mc-primary-bright)" : "var(--mc-text-muted)",
                      border: `1px solid ${active ? "var(--mc-primary)" : "var(--mc-ink-border)"}`,
                    }}>
                    {meta.emoji} {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 flex gap-3" style={{ borderTop: "1px solid var(--mc-ink-border)" }}>
          <button onClick={reset} className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "var(--mc-ink-3)", color: "var(--mc-text-muted)", border: "1px solid var(--mc-ink-border)" }}>
            Сбросить
          </button>
          <button onClick={apply} className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary))", color: "#fff" }}>
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}
