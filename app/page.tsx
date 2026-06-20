"use client";

import { useEffect, useState, useMemo } from "react";
import { materials, currentMonth, DIRECTION_META, HASHTAG_META, Direction, Hashtag } from "@/lib/content";
import { SprintCard } from "@/components/SprintCard";
import { MaterialCard } from "@/components/MaterialCard";
import { FilterDrawer } from "@/components/FilterDrawer";

type Tab = "home" | "materials" | "checkin" | "progress";
interface FilterState { hashtags: Hashtag[]; sort: "new" | "old"; }

const COLLECTIONS = [
  { key: "M" as Direction, label: "Мышление",    emoji: "🧠", count: 12 },
  { key: "N" as Direction, label: "Направление",  emoji: "🧭", count: 8  },
  { key: "T" as Direction, label: "Тело & Ритм",  emoji: "⚡", count: 15 },
  { key: "R" as Direction, label: "Реализация",   emoji: "🚀", count: 10 },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<FilterState>({ hashtags: [], sort: "new" });
  const [user, setUser] = useState<{ first_name: string } | null>(null);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState<number | null>(null);
  const [checkinText, setCheckinText] = useState("");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) { tg.ready(); tg.expand(); }
    const initData = tg?.initData || "";

    if (!initData) {
      setUser({ first_name: "Разработчик" });
      setIsMember(true);
      setLoading(false);
      return;
    }

    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    })
      .then((r) => r.json())
      .then((data) => { setUser(data.user); setIsMember(data.isMember); })
      .finally(() => setLoading(false));
  }, []);

  const filteredMaterials = useMemo(() => {
    let list = [...materials];
    if (search) list = list.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()) || m.subtitle.toLowerCase().includes(search.toLowerCase()));
    if (filter.hashtags.length > 0) list = list.filter((m) => m.hashtags.some((t) => filter.hashtags.includes(t)));
    if (filter.sort === "old") list = list.reverse();
    return list;
  }, [search, filter]);

  const activeFilterCount = filter.hashtags.length + (filter.sort === "old" ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white animate-spin" />
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-6">
        <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white font-black text-2xl tracking-widest"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent2))" }}>
          MNTR
        </div>
        <div>
          <p className="text-xl font-bold text-white">Доступ закрыт</p>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Это пространство только для участников MNTR Community
          </p>
        </div>
        <a href="https://t.me/mntrcomm" className="w-full py-3.5 rounded-xl text-sm font-semibold text-center text-white"
          style={{ background: "linear-gradient(90deg, var(--accent), var(--accent2))" }}>
          Вступить в комьюнити
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">

      {/* Search header */}
      <div className="px-4 pt-5 pb-3 space-y-3" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-secondary)", flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); if (tab !== "materials") setTab("materials"); }}
              placeholder="Поиск материалов..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
            />
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: activeFilterCount > 0 ? "var(--accent)" : "var(--bg-card)",
              color: activeFilterCount > 0 ? "#fff" : "var(--text-secondary)",
              border: `1px solid ${activeFilterCount > 0 ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Фильтр{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {tab === "home" && (
          <div className="space-y-6 pb-4">
            {/* Collections */}
            <div>
              <div className="flex items-center justify-between px-4 mb-3">
                <p className="text-lg font-bold text-white">Подборки</p>
                <button className="text-sm font-medium" style={{ color: "var(--accent)" }}
                  onClick={() => setTab("materials")}>Смотреть все →</button>
              </div>
              <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
                {COLLECTIONS.map((col) => {
                  const meta = DIRECTION_META[col.key];
                  return (
                    <button
                      key={col.key}
                      onClick={() => setTab("materials")}
                      className="shrink-0 w-36 h-36 rounded-2xl flex flex-col justify-between p-3.5 text-left active:opacity-70 transition-opacity"
                      style={{ background: `linear-gradient(135deg, ${meta.color}30, ${meta.color}10)`, border: `1px solid ${meta.color}30` }}
                    >
                      <span className="text-3xl">{col.emoji}</span>
                      <div>
                        <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold" style={{ backgroundColor: `${meta.color}25`, color: meta.color }}>
                          {col.count} материалов
                        </span>
                        <p className="text-white font-semibold text-sm mt-1">{col.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sprint */}
            <div className="px-4">
              <SprintCard />
            </div>

            {/* Month */}
            <div className="px-4">
              <div className="rounded-2xl p-4 space-y-2.5" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `var(--accent)18`, color: "var(--accent)" }}>
                    {currentMonth.month}
                  </span>
                </div>
                <p className="text-lg font-bold text-white">{currentMonth.theme}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{currentMonth.goal}</p>
                <div className="pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Вопрос месяца</p>
                  <p className="text-sm text-white/80 italic">"{currentMonth.question}"</p>
                </div>
              </div>
            </div>

            {/* Recent materials */}
            <div>
              <div className="flex items-center justify-between px-4 mb-3">
                <p className="text-lg font-bold text-white">Новые материалы</p>
              </div>
              <div className="px-4 space-y-3">
                {materials.slice(0, 3).map((m) => (
                  <MaterialCard key={m.id} material={m} />
                ))}
                <button onClick={() => setTab("materials")} className="w-full py-3 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                  Смотреть все материалы →
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "materials" && (
          <div className="px-4 pt-2 space-y-3">
            {/* Hashtag pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setFilter((f) => ({ ...f, hashtags: [] }))}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: filter.hashtags.length === 0 ? "var(--accent)" : "var(--bg-card)",
                  color: filter.hashtags.length === 0 ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${filter.hashtags.length === 0 ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                Все
              </button>
              {(Object.entries(HASHTAG_META) as [Hashtag, typeof HASHTAG_META[Hashtag]][]).map(([tag, meta]) => {
                const active = filter.hashtags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => setFilter((f) => ({
                      ...f,
                      hashtags: active ? f.hashtags.filter((t) => t !== tag) : [...f.hashtags, tag],
                    }))}
                    className="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
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

            {filteredMaterials.length === 0 ? (
              <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-sm">Ничего не найдено</p>
              </div>
            ) : (
              filteredMaterials.map((m) => <MaterialCard key={m.id} material={m} />)
            )}
          </div>
        )}

        {tab === "checkin" && (
          <div className="px-4 pt-2 space-y-4">
            <div className="rounded-2xl p-4 space-y-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div>
                <p className="font-bold text-white text-lg">Чек-ин на сегодня</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  Что сделал сегодня по спринту?
                </p>
              </div>
              <textarea
                rows={4}
                value={checkinText}
                onChange={(e) => setCheckinText(e.target.value)}
                placeholder="Напиши свои наблюдения..."
                className="w-full rounded-xl px-3.5 py-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none"
                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)" }}
              />
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Как прошёл день?</p>
                <div className="flex gap-2">
                  {["😔", "😐", "🙂", "😊", "🔥"].map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => setMood(i)}
                      className="flex-1 py-2.5 rounded-xl text-xl transition-all"
                      style={{
                        backgroundColor: mood === i ? "var(--accent)25" : "var(--bg-primary)",
                        border: `1px solid ${mood === i ? "var(--accent)" : "var(--border)"}`,
                        transform: mood === i ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(90deg, var(--accent), var(--accent2))", opacity: checkinText ? 1 : 0.5 }}
              >
                Сохранить
              </button>
            </div>
          </div>
        )}

        {tab === "progress" && (
          <div className="px-4 pt-2 space-y-4">
            <div className="rounded-2xl p-4 space-y-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="font-bold text-white text-lg">Мой путь MNTR</p>
              {([["M", 65], ["N", 40], ["T", 55], ["R", 30]] as [Direction, number][]).map(([dir, pct]) => {
                const meta = DIRECTION_META[dir];
                return (
                  <div key={dir} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">
                        <span style={{ color: meta.color }}>{dir}</span> — {meta.full.split(" — ")[1]}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="font-bold text-white">Активность</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[["12", "Материалов\nпрочитано"], ["4", "Чек-инов\nза месяц"], ["3", "Спринтов\nзавершено"]].map(([num, label]) => (
                  <div key={label} className="rounded-xl py-3 space-y-1" style={{ backgroundColor: "var(--bg-primary)" }}>
                    <p className="text-xl font-black" style={{ color: "var(--accent)" }}>{num}</p>
                    <p className="text-xs leading-tight whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 z-10"
        style={{
          backgroundColor: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
          paddingTop: "10px",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom))",
        }}>
        {([
          { key: "home" as Tab,      icon: "⌂",  label: "Главная"    },
          { key: "materials" as Tab, icon: "📚", label: "Материалы"  },
          { key: "checkin" as Tab,   icon: "✅", label: "Чек-ин"     },
          { key: "progress" as Tab,  icon: "📊", label: "Прогресс"   },
        ]).map(({ key, icon, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex flex-col items-center gap-0.5 px-4 transition-opacity"
            style={{ opacity: tab === key ? 1 : 0.35 }}>
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-medium" style={{ color: tab === key ? "#fff" : "var(--text-secondary)" }}>
              {label}
            </span>
          </button>
        ))}
      </nav>

      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} value={filter} onChange={setFilter} />
    </div>
  );
}
