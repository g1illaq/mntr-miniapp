"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { materials as staticMaterials, collections, currentMonth, HASHTAG_META, Hashtag, Material } from "@/lib/content";
import type { Post } from "@/lib/supabase";
import { SprintCard } from "@/components/SprintCard";
import { MaterialCard } from "@/components/MaterialCard";
import { FilterDrawer } from "@/components/FilterDrawer";
import { Logo } from "@/components/Logo";
import { ArticleDrawer } from "@/components/ArticleDrawer";
type Tab = "home" | "materials" | "checkin" | "progress";
interface FilterState { hashtags: Hashtag[]; sort: "new" | "old"; }

function postToMaterial(post: Post): Material {
  const content = post.text || post.caption || "";
  const titleMatch = content.match(/^(.+?)[\n\r]/);
  const title = titleMatch ? titleMatch[1].replace(/[*_#]/g, "").trim() : content.slice(0, 60).trim();
  const rest = titleMatch ? content.slice(titleMatch[0].length).trim() : "";
  const subtitleMatch = rest.match(/^(.{10,120})/);
  const subtitle = subtitleMatch ? subtitleMatch[1].replace(/[*_#]/g, "").trim() : "";

  const validHashtags = post.hashtags.filter((h) => h.replace("#", "") in HASHTAG_META);
  const hashtags = validHashtags.map((h) => h.replace("#", "") as Hashtag);

  return {
    id: String(post.id),
    title: title || "Пост из канала",
    subtitle,
    hashtags: hashtags.length > 0 ? hashtags : [],
    readTime: `${Math.max(1, Math.ceil(content.length / 1200))} мин`,
    cover: post.photo_url || undefined,
    body: content,
  };
}

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
  const [openArticle, setOpenArticle] = useState<Material | null>(null);
  const [realPosts, setRealPosts] = useState<Material[] | null>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) { tg.ready(); tg.expand(); }
    const tgUser = tg?.initDataUnsafe?.user;
    setUser({ first_name: tgUser?.first_name || "Участник" });
    setIsMember(true);
    setLoading(false);

    // Load real posts from Supabase
    fetch("/api/posts")
      .then((r) => r.json())
      .then(({ posts }) => {
        if (posts && posts.length > 0) {
          setRealPosts(posts.map(postToMaterial));
        }
      })
      .catch(() => {});
  }, []);

  const materials = realPosts ?? staticMaterials;

  const filteredMaterials = useMemo(() => {
    let list = [...materials];
    if (search) list = list.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()) || m.subtitle.toLowerCase().includes(search.toLowerCase()));
    if (filter.hashtags.length > 0) list = list.filter((m) => m.hashtags.some((t) => filter.hashtags.includes(t)));
    if (filter.sort === "old") list = list.reverse();
    return list;
  }, [search, filter, materials]);

  const activeFilterCount = filter.hashtags.length + (filter.sort === "old" ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--mc-ink)" }}>
        <div className="flex flex-col items-center gap-4">
          <div style={{ color: "var(--mc-primary)" }}><Logo size={40} /></div>
          <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white animate-spin" />
        </div>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-8" style={{ backgroundColor: "var(--mc-ink)" }}>
        <div className="flex flex-col items-center gap-3">
          <div style={{ color: "var(--mc-primary)" }}><Logo size={56} /></div>
          <div>
            <p className="text-xs font-mono tracking-widest uppercase" style={{ color: "var(--mc-text-faint)", fontFamily: "var(--mc-font-mono)" }}>mntr · comm</p>
          </div>
        </div>
        <div>
          <p className="text-2xl font-black" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>Доступ закрыт</p>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--mc-text-muted)" }}>
            Это пространство только для участников MNTR Community
          </p>
        </div>
        <a href="https://t.me/mntrcomm" className="w-full py-3.5 rounded-xl text-sm font-semibold text-center"
          style={{ background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary))", color: "#fff" }}>
          Вступить в комьюнити
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20" style={{ backgroundColor: "var(--mc-ink)" }}>

      {/* Header with search */}
      <div className="px-4 pt-5 pb-3 space-y-3">
        {tab === "home" && (
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5" style={{ color: "var(--mc-text)" }}>
              <Logo size={26} />
              <div>
                <p className="font-black text-base leading-none" style={{ fontFamily: "var(--mc-font-heading)" }}>mntr comm</p>
                <p className="label-mono mt-0.5">Привет, {user?.first_name}</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
            style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--mc-text-faint)", flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input value={search} onChange={(e) => { setSearch(e.target.value); if (tab !== "materials") setTab("materials"); }}
              placeholder="Поиск материалов..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-body)" }} />
          </div>
          <button onClick={() => setFilterOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium"
            style={{
              backgroundColor: activeFilterCount > 0 ? "var(--mc-primary)" : "var(--mc-ink-2)",
              color: activeFilterCount > 0 ? "#fff" : "var(--mc-text-muted)",
              border: `1px solid ${activeFilterCount > 0 ? "var(--mc-primary)" : "var(--mc-ink-border)"}`,
            }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Фильтр{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
        </div>
      </div>

      <div className="flex-1">

        {/* HOME */}
        {tab === "home" && (
          <div className="space-y-7 pb-4">

            {/* Collections */}
            <div>
              <div className="flex items-center justify-between px-4 mb-3">
                <p className="font-bold text-lg" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>Подборки</p>
                <button className="text-sm font-semibold" style={{ color: "var(--mc-primary-bright)" }} onClick={() => setTab("materials")}>
                  Смотреть все →
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
                {collections.map((col) => (
                  <button key={col.id}
                    onClick={() => { setFilter((f) => ({ ...f, hashtags: [col.hashtag] })); setTab("materials"); }}
                    className="shrink-0 w-40 rounded-2xl overflow-hidden text-left active:opacity-70 transition-opacity"
                    style={{ border: "1px solid var(--mc-ink-border)" }}>
                    <div className="relative h-28">
                      <Image src={col.cover} alt={col.title} fill className="object-cover" />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(14,14,17,0.9))" }} />
                      <div className="absolute bottom-2 left-3">
                        <span className="label-mono" style={{ color: "var(--mc-primary-bright)" }}>{col.count} материалов</span>
                      </div>
                    </div>
                    <div className="px-3 py-2.5" style={{ backgroundColor: "var(--mc-ink-3)" }}>
                      <p className="text-sm font-bold leading-snug" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
                        {col.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sprint */}
            <div className="px-4"><SprintCard /></div>

            {/* Month theme */}
            <div className="px-4">
              <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
                <span className="label-mono" style={{ color: "var(--mc-primary-bright)" }}>{currentMonth.month} · Тема месяца</span>
                <p className="font-black text-xl leading-snug" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
                  {currentMonth.theme}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--mc-text-muted)" }}>{currentMonth.goal}</p>
                <div className="pt-3" style={{ borderTop: "1px solid var(--mc-ink-border)" }}>
                  <span className="label-mono">Вопрос месяца</span>
                  <p className="text-sm mt-1 italic" style={{ color: "var(--mc-text-muted)" }}>"{currentMonth.question}"</p>
                </div>
              </div>
            </div>

            {/* Recent */}
            <div>
              <p className="font-bold text-lg px-4 mb-3" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
                Новые материалы
              </p>
              <div className="px-4 space-y-3">
                {materials.slice(0, 3).map((m) => <MaterialCard key={m.id} material={m} onRead={() => setOpenArticle(m)} />)}
                <button onClick={() => setTab("materials")} className="w-full py-3 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "var(--mc-ink-2)", color: "var(--mc-text-muted)", border: "1px solid var(--mc-ink-border)" }}>
                  Все материалы →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MATERIALS */}
        {tab === "materials" && (
          <div className="px-4 pt-2 space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button onClick={() => setFilter((f) => ({ ...f, hashtags: [] }))}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: filter.hashtags.length === 0 ? "var(--mc-primary)" : "var(--mc-ink-2)",
                  color: filter.hashtags.length === 0 ? "#fff" : "var(--mc-text-muted)",
                  border: `1px solid ${filter.hashtags.length === 0 ? "var(--mc-primary)" : "var(--mc-ink-border)"}`,
                }}>Все</button>
              {(Object.entries(HASHTAG_META) as [Hashtag, typeof HASHTAG_META[Hashtag]][]).map(([tag, meta]) => {
                const active = filter.hashtags.includes(tag);
                return (
                  <button key={tag} onClick={() => setFilter((f) => ({
                    ...f, hashtags: active ? f.hashtags.filter((t) => t !== tag) : [...f.hashtags, tag],
                  }))}
                    className="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
                    style={{
                      backgroundColor: active ? "rgba(45,107,246,0.2)" : "var(--mc-ink-2)",
                      color: active ? "var(--mc-primary-bright)" : "var(--mc-text-muted)",
                      border: `1px solid ${active ? "var(--mc-primary)" : "var(--mc-ink-border)"}`,
                    }}>
                    {meta.emoji} {meta.label}
                  </button>
                );
              })}
            </div>
            {filteredMaterials.length === 0
              ? <div className="text-center py-16"><p className="text-4xl mb-3">🔍</p><p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>Ничего не найдено</p></div>
              : filteredMaterials.map((m) => <MaterialCard key={m.id} material={m} onRead={() => setOpenArticle(m)} />)
            }
          </div>
        )}

        {/* CHECKIN */}
        {tab === "checkin" && (
          <div className="px-4 pt-2 space-y-4">
            <div className="rounded-2xl p-4 space-y-4" style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
              <div>
                <span className="label-mono" style={{ color: "var(--mc-primary-bright)" }}>Спринт · {currentMonth.sprint}</span>
                <p className="font-black text-lg mt-1" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
                  Чек-ин на сегодня
                </p>
              </div>
              <textarea rows={4} value={checkinText} onChange={(e) => setCheckinText(e.target.value)}
                placeholder="Что сделал сегодня? Какие наблюдения?"
                className="w-full rounded-xl px-3.5 py-3 text-sm resize-none focus:outline-none"
                style={{ backgroundColor: "var(--mc-ink-3)", border: "1px solid var(--mc-ink-border)", color: "var(--mc-text)", fontFamily: "var(--mc-font-body)" }} />
              <div className="space-y-2">
                <span className="label-mono">Как прошёл день?</span>
                <div className="flex gap-2">
                  {["😔", "😐", "🙂", "😊", "🔥"].map((emoji, i) => (
                    <button key={i} onClick={() => setMood(i)}
                      className="flex-1 py-2.5 rounded-xl text-xl"
                      style={{
                        backgroundColor: mood === i ? "rgba(45,107,246,0.2)" : "var(--mc-ink-3)",
                        border: `1px solid ${mood === i ? "var(--mc-primary)" : "var(--mc-ink-border)"}`,
                        transform: mood === i ? "scale(1.08)" : "scale(1)",
                      }}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <button className="w-full py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary))",
                  color: "#fff",
                  opacity: checkinText ? 1 : 0.5,
                }}>
                Сохранить
              </button>
            </div>
          </div>
        )}

        {/* PROGRESS */}
        {tab === "progress" && (
          <div className="px-4 pt-2 space-y-4">
            <div className="rounded-2xl p-4 space-y-4" style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
              <p className="font-black text-lg" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>Мой путь MNTR</p>
              {([["M — Мышление", 65], ["N — Направление", 40], ["T — Тело & Ритм", 55], ["R — Реализация", 30]] as [string, number][]).map(([label, pct]) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "var(--mc-text)" }}>{label}</span>
                    <span className="label-mono">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--mc-ink-border)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary-bright))" }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
              <p className="font-black text-lg" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>Активность</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[["12", "Материалов\nпрочитано"], ["4", "Чек-инов\nза месяц"], ["3", "Спринтов\nзавершено"]].map(([num, label]) => (
                  <div key={label} className="rounded-xl py-3 space-y-1" style={{ backgroundColor: "var(--mc-ink-3)" }}>
                    <p className="text-xl font-black" style={{ color: "var(--mc-primary-bright)", fontFamily: "var(--mc-font-heading)" }}>{num}</p>
                    <p className="text-xs leading-tight whitespace-pre-line" style={{ color: "var(--mc-text-faint)" }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 z-10"
        style={{ backgroundColor: "var(--mc-ink-2)", borderTop: "1px solid var(--mc-ink-border)", paddingTop: "10px", paddingBottom: "calc(10px + env(safe-area-inset-bottom))" }}>
        {([
          { key: "home" as Tab,      icon: "⌂",  label: "Главная"   },
          { key: "materials" as Tab, icon: "📚", label: "Материалы" },
          { key: "checkin" as Tab,   icon: "✅", label: "Чек-ин"    },
          { key: "progress" as Tab,  icon: "📊", label: "Прогресс"  },
        ]).map(({ key, icon, label }) => (
          <button key={key} onClick={() => setTab(key)} className="flex flex-col items-center gap-0.5 px-4">
            <span className="text-xl" style={{ opacity: tab === key ? 1 : 0.35 }}>{icon}</span>
            <span className="text-[10px] font-medium"
              style={{ color: tab === key ? "var(--mc-primary-bright)" : "var(--mc-text-faint)", fontFamily: "var(--mc-font-mono)" }}>
              {label.toUpperCase()}
            </span>
          </button>
        ))}
      </nav>

      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} value={filter} onChange={setFilter} />
      <ArticleDrawer material={openArticle} onClose={() => setOpenArticle(null)} />
    </div>
  );
}
