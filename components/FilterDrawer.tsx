"use client";
import { useState } from "react";
import { Hashtag, HASHTAG_META } from "@/lib/content";

interface FilterState {
  hashtags: Hashtag[];
  sort: "new" | "old";
}

interface Props {
  open: boolean;
  onClose: () => void;
  value: FilterState;
  onChange: (v: FilterState) => void;
}

export function FilterDrawer({ open, onClose, value, onChange }: Props) {
  const [local, setLocal] = useState<FilterState>(value);

  const toggleTag = (tag: Hashtag) => {
    setLocal((prev) => ({
      ...prev,
      hashtags: prev.hashtags.includes(tag)
        ? prev.hashtags.filter((t) => t !== tag)
        : [...prev.hashtags, tag],
    }));
  };

  const apply = () => { onChange(local); onClose(); };
  const reset = () => { const v = { hashtags: [], sort: "new" as const }; setLocal(v); onChange(v); onClose(); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative rounded-t-3xl flex flex-col max-h-[85vh]"
        style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "var(--border)" }} />
        </div>

        <div className="px-4 pb-2 flex items-center justify-between">
          <p className="text-lg font-bold text-white">Фильтр</p>
          <button onClick={onClose} style={{ color: "var(--text-secondary)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 space-y-5 pb-4 scrollbar-hide">
          {/* Sort */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Сортировка</p>
            <div className="flex gap-2">
              {([["new", "От новых к старым"], ["old", "От старых к новым"]] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setLocal((p) => ({ ...p, sort: key }))}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: local.sort === key ? "var(--accent)" : "var(--bg-card)",
                    color: local.sort === key ? "#fff" : "var(--text-secondary)",
                    border: `1px solid ${local.sort === key ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Категории</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(HASHTAG_META) as [Hashtag, typeof HASHTAG_META[Hashtag]][]).map(([tag, meta]) => {
                const active = local.hashtags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                    style={{
                      backgroundColor: active ? `${meta.color}25` : "var(--bg-card)",
                      color: active ? meta.color : "var(--text-secondary)",
                      border: `1px solid ${active ? meta.color : "var(--border)"}`,
                    }}
                  >
                    {meta.emoji} {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-4 py-4 flex gap-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={reset}
            className="flex-1 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            Сбросить
          </button>
          <button
            onClick={apply}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(90deg, var(--accent), var(--accent2))" }}
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}
