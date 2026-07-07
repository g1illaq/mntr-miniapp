"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { collections, DIRECTION_META, HASHTAG_META, Hashtag, Material, Direction } from "@/lib/content";
import type { Post, Sprint, Checkin } from "@/lib/supabase";
import { SprintCard } from "@/components/SprintCard";
import { MaterialCard } from "@/components/MaterialCard";
import { FilterDrawer } from "@/components/FilterDrawer";
import { Logo } from "@/components/Logo";
import { ArticleDrawer } from "@/components/ArticleDrawer";

type Tab = "home" | "materials" | "checkin" | "progress";
interface FilterState { hashtags: Hashtag[]; sort: "new" | "old"; showSaved: boolean; }

const OWNER_ID = 7276417797;

function getSprintDay(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1);
}

function getSprintTotal(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
}

function getSavedKey(userId?: number) { return `mntr_saved_${userId ?? "guest"}`; }
function loadSaved(userId?: number): Set<string> {
  try {
    const raw = localStorage.getItem(getSavedKey(userId));
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}
function persistSaved(ids: Set<string>, userId?: number) {
  try { localStorage.setItem(getSavedKey(userId), JSON.stringify([...ids])); } catch {}
}

function postToMaterial(post: Post): Material {
  const caption = post.caption || "";
  const body = post.body || "";

  const stripEmoji = (s: string) =>
    s.replace(/[\u{1F000}-\u{1FAFF}\u{2300}-\u{27BF}\u{2B00}-\u{2BFF}]/gu, "").replace(/\s{2,}/g, " ").trim();

  const captionLines2 = caption.split("\n");
  let titleLine = "";
  // Pass 1: первая строка без эмодзи, не начинающаяся с #
  for (const line of captionLines2) {
    const cleaned = stripEmoji(line.replace(/[*_]/g, "")).trim();
    if (cleaned && !cleaned.startsWith("#")) {
      titleLine = cleaned.slice(0, 100);
      break;
    }
  }
  // Pass 2: первая непустая строка, вырезаем # (бывает когда весь caption = хэштеги)
  if (!titleLine) {
    for (const line of captionLines2) {
      const cleaned = stripEmoji(line).trim();
      if (cleaned) {
        titleLine = cleaned.replace(/#[\wа-яА-ЯёЁ]+/g, (m) => m.slice(1)).replace(/\s+/g, " ").trim().slice(0, 100);
        break;
      }
    }
  }
  const title = titleLine || "Материал из канала";

  const captionLines = caption.split("\n").slice(1).filter(l => !l.startsWith("#")).join(" ").replace(/[*_]/g, "").trim();
  const subtitle = stripEmoji(captionLines || body.split("\n")[0].replace(/[*_]/g, "")).slice(0, 160);

  const validHashtags = post.hashtags
    .map((h) => h.replace("#", ""))
    .filter((h) => h in HASHTAG_META) as Hashtag[];

  const cover = post.photo_url || undefined;

  const tgLink = post.message_id > 0 && post.message_id < 1_000_000
    ? `https://t.me/c/3555330551/${post.message_id}`
    : undefined;

  return {
    id: String(post.id),
    title,
    subtitle,
    hashtags: validHashtags,
    readTime: `${Math.max(1, Math.ceil((body.length || caption.length) / 1000))} мин`,
    cover,
    body: body || caption,
    tgLink,
  };
}

interface ProgressData {
  completedCount: number;
  completedIds: string[];
  checkinCount: number;
  dirTotal: Record<string, number>;
  dirCompleted: Record<string, number>;
}

interface AdminForm {
  title: string;
  description: string;
  direction: string;
  daily_task: string;
  start_date: string;
  end_date: string;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<FilterState>({ hashtags: [], sort: "new", showSaved: false });
  const [user, setUser] = useState<{ first_name: string } | null>(null);
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [openArticle, setOpenArticle] = useState<Material | null>(null);
  const [realPosts, setRealPosts] = useState<Material[]>([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Sprint & check-in state
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [sprintLoaded, setSprintLoaded] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState<Checkin | null>(null);
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [checkinDone, setCheckinDone] = useState(false);
  const [energy, setEnergy] = useState<number | null>(null);
  const [practiceDone, setPracticeDone] = useState<"yes" | "partial" | "no" | null>(null);
  const [checkinNote, setCheckinNote] = useState("");
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);

  // Progress & completed
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [progressLoaded, setProgressLoaded] = useState(false);

  // Admin sprint form
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminForm, setAdminForm] = useState<AdminForm>({
    title: "", description: "", direction: "", daily_task: "",
    start_date: new Date().toISOString().split("T")[0], end_date: "",
  });
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminDeleting, setAdminDeleting] = useState(false);

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      persistSaved(next, userId);
      return next;
    });
  };

  const toggleComplete = async (materialId: string) => {
    if (!userId) return;
    const wasCompleted = completedIds.has(materialId);
    setCompletedIds(prev => {
      const next = new Set(prev);
      wasCompleted ? next.delete(materialId) : next.add(materialId);
      return next;
    });
    await fetch("/api/complete", {
      method: wasCompleted ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, postId: materialId }),
    });
    // Refresh progress counts
    fetch(`/api/progress?userId=${userId}`)
      .then(r => r.json())
      .then((data: ProgressData) => setProgressData(data))
      .catch(() => {});
  };

  const submitCheckin = async () => {
    if (!energy || !userId) return;
    setCheckinSubmitting(true);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sprintId: activeSprint?.id ?? null,
          energy,
          practice_done: practiceDone ?? "no",
          note: checkinNote || null,
        }),
      });
      const { checkin } = await res.json();
      if (checkin) {
        setTodayCheckin(checkin);
        setCheckinDone(true);
        setCheckinStreak(s => Math.max(1, s + 1));
      }
    } catch {}
    setCheckinSubmitting(false);
  };

  const deleteSprint = async () => {
    if (!userId) return;
    setAdminDeleting(true);
    try {
      await fetch("/api/sprint", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setActiveSprint(null);
      setAdminOpen(false);
    } catch {}
    setAdminDeleting(false);
  };

  const submitSprint = async () => {
    if (!adminForm.title || !adminForm.start_date || !adminForm.end_date) return;
    setAdminSubmitting(true);
    try {
      const res = await fetch("/api/sprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...adminForm }),
      });
      const { sprint } = await res.json();
      if (sprint) {
        setActiveSprint(sprint);
        setAdminOpen(false);
        setAdminForm({ title: "", description: "", direction: "", daily_task: "", start_date: new Date().toISOString().split("T")[0], end_date: "" });
      }
    } catch {}
    setAdminSubmitting(false);
  };

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) { tg.ready(); tg.expand(); }

    const initData: string = tg?.initData || "";
    const tgUser = tg?.initDataUnsafe?.user;

    // Проверяем членство в канале через сервер
    if (initData) {
      fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      })
        .then(r => r.json())
        .then(({ user: u, isMember: m }) => {
          const uid = u?.id as number | undefined;
          setUserId(uid);
          setUser({ first_name: u?.first_name || "Участник" });
          setSavedIds(loadSaved(uid));
          setIsMember(!!m);
          setLoading(false);
        })
        .catch(() => {
          // Ошибка сети — даём доступ, не блокируем
          const uid = tgUser?.id as number | undefined;
          setUserId(uid);
          setUser({ first_name: tgUser?.first_name || "Участник" });
          setSavedIds(loadSaved(uid));
          setIsMember(true);
          setLoading(false);
        });
    } else {
      // Нет initData (открыто в браузере, не в Telegram) — блокируем
      const uid = tgUser?.id as number | undefined;
      setUserId(uid);
      setUser({ first_name: tgUser?.first_name || "Участник" });
      setSavedIds(loadSaved(uid));
      setIsMember(false);
      setLoading(false);
    }

    fetch("/api/posts")
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(({ posts, error }) => {
        if (error) throw new Error(error);
        const mapped = (posts || [])
          .filter((p: any) => (p.caption || p.body || "").trim())
          .map((p: any) => {
            try { return postToMaterial(p); } catch { return null; }
          }).filter(Boolean) as Material[];
        setRealPosts(mapped);
        setPostsLoaded(true);
      })
      .catch((e) => { setFetchError(String(e)); setPostsLoaded(true); });
  }, []);

  // Загружаем спринт/прогресс после того как userId стал известен
  useEffect(() => {
    if (!userId) {
      setSprintLoaded(true);
      setProgressLoaded(true);
      return;
    }
    Promise.all([
      fetch("/api/sprint").then(r => r.json()),
      fetch(`/api/checkins?userId=${userId}`).then(r => r.json()),
      fetch(`/api/progress?userId=${userId}`).then(r => r.json()),
    ]).then(([sprintRes, checkinRes, progressRes]) => {
      setActiveSprint(sprintRes.sprint ?? null);
      setSprintLoaded(true);
      setTodayCheckin(checkinRes.checkin ?? null);
      setCheckinStreak(checkinRes.streak ?? 0);
      if (checkinRes.checkin) setCheckinDone(true);
      if (progressRes.completedIds) setCompletedIds(new Set(progressRes.completedIds));
      setProgressData(progressRes);
      setProgressLoaded(true);
    }).catch(() => { setSprintLoaded(true); setProgressLoaded(true); });
  }, [userId]);

  const materials = realPosts;

  const filteredMaterials = useMemo(() => {
    let list = [...materials];
    if (filter.showSaved) list = list.filter((m) => savedIds.has(m.id));
    if (search) list = list.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()) || m.subtitle.toLowerCase().includes(search.toLowerCase()));
    if (filter.hashtags.length > 0) list = list.filter((m) => m.hashtags.some((t) => filter.hashtags.includes(t)));
    if (filter.sort === "old") list = list.reverse();
    return list;
  }, [search, filter, materials, savedIds]);

  const liveCollections = useMemo(() =>
    collections
      .map((col) => ({ ...col, count: materials.filter((m) => m.hashtags.includes(col.hashtag)).length }))
      .filter((col) => col.count > 0),
  [materials]);

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
          <p className="text-xs font-mono tracking-widest uppercase" style={{ color: "var(--mc-text-faint)", fontFamily: "var(--mc-font-mono)" }}>mntr · comm</p>
        </div>
        <div>
          <p className="text-2xl font-black" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>Доступ закрыт</p>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--mc-text-muted)" }}>Это пространство только для участников MNTR Community</p>
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

      {/* Header */}
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
          <div className="px-4 space-y-4 pb-4">
            {/* Active sprint on home */}
            {activeSprint && (
              <SprintCard sprint={activeSprint} checkinStreak={checkinStreak} onCheckin={() => setTab("checkin")} />
            )}

            {liveCollections.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-lg" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>Подборки</p>
                  <button className="text-sm font-semibold" style={{ color: "var(--mc-primary-bright)" }} onClick={() => setTab("materials")}>
                    Смотреть все →
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {liveCollections.map((col) => (
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
            )}

            <div>
              {materials.length > 0 && (
                <p className="font-bold text-lg mb-3" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
                  Новые материалы
                </p>
              )}
              {!postsLoaded
                ? <div className="flex justify-center py-16"><div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white animate-spin" /></div>
                : materials.length === 0
                  ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                      <div className="text-5xl">📭</div>
                      <p className="text-base font-semibold" style={{ color: "var(--mc-text)" }}>Материалы появятся здесь</p>
                      <p className="text-sm text-center" style={{ color: "var(--mc-text-muted)" }}>Перешли посты из канала в бота — они сразу появятся</p>
                    </div>
                  )
                  : (
                    <div className="space-y-3">
                      {materials.slice(0, 3).map((m) => (
                        <MaterialCard key={m.id} material={m}
                          isSaved={savedIds.has(m.id)} onToggleSave={() => toggleSave(m.id)}
                          isCompleted={completedIds.has(m.id)} onToggleComplete={() => toggleComplete(m.id)}
                          onRead={() => setOpenArticle(m)} />
                      ))}
                      {materials.length > 3 && (
                        <button onClick={() => setTab("materials")} className="w-full py-3 rounded-xl text-sm font-semibold"
                          style={{ backgroundColor: "var(--mc-ink-2)", color: "var(--mc-text-muted)", border: "1px solid var(--mc-ink-border)" }}>
                          Все материалы →
                        </button>
                      )}
                    </div>
                  )
              }
            </div>
          </div>
        )}

        {/* MATERIALS */}
        {tab === "materials" && (
          <div className="px-4 pt-2 space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setFilter((f) => ({ ...f, showSaved: !f.showSaved, hashtags: [] }))}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
                style={{
                  backgroundColor: filter.showSaved ? "rgba(45,107,246,0.2)" : "var(--mc-ink-2)",
                  color: filter.showSaved ? "var(--mc-primary-bright)" : "var(--mc-text-muted)",
                  border: `1px solid ${filter.showSaved ? "var(--mc-primary)" : "var(--mc-ink-border)"}`,
                }}>
                🔖 Сохранённые{savedIds.size > 0 ? ` (${savedIds.size})` : ""}
              </button>
              <button onClick={() => setFilter((f) => ({ ...f, hashtags: [], showSaved: false }))}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: !filter.showSaved && filter.hashtags.length === 0 ? "var(--mc-primary)" : "var(--mc-ink-2)",
                  color: !filter.showSaved && filter.hashtags.length === 0 ? "#fff" : "var(--mc-text-muted)",
                  border: `1px solid ${!filter.showSaved && filter.hashtags.length === 0 ? "var(--mc-primary)" : "var(--mc-ink-border)"}`,
                }}>Все</button>
              {(Object.entries(HASHTAG_META) as [Hashtag, typeof HASHTAG_META[Hashtag]][]).map(([tag, meta]) => {
                const active = filter.hashtags.includes(tag);
                return (
                  <button key={tag} onClick={() => setFilter((f) => ({
                    ...f, showSaved: false, hashtags: active ? f.hashtags.filter((t) => t !== tag) : [...f.hashtags, tag],
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
            {!postsLoaded
              ? <div className="flex justify-center py-16"><div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white animate-spin" /></div>
              : fetchError
                ? <div className="text-center py-16 px-4">
                    <p className="text-2xl mb-3">⚠️</p>
                    <p className="text-sm mb-2" style={{ color: "var(--mc-text-muted)" }}>Ошибка загрузки</p>
                    <p className="text-xs mb-4" style={{ color: "var(--mc-text-faint)", fontFamily: "var(--mc-font-mono)" }}>{fetchError}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ backgroundColor: "var(--mc-primary)", color: "#fff" }}>Обновить</button>
                  </div>
              : filteredMaterials.length === 0
                ? <div className="text-center py-16">
                    <p className="text-4xl mb-3">{filter.showSaved ? "🔖" : search || filter.hashtags.length > 0 ? "🔍" : "📭"}</p>
                    <p className="text-sm" style={{ color: "var(--mc-text-muted)" }}>
                      {filter.showSaved ? "Нет сохранённых материалов" : search || filter.hashtags.length > 0 ? "Ничего не найдено" : "Материалы скоро появятся"}
                    </p>
                  </div>
                : filteredMaterials.map((m) => (
                    <MaterialCard key={m.id} material={m}
                      isSaved={savedIds.has(m.id)} onToggleSave={() => toggleSave(m.id)}
                      isCompleted={completedIds.has(m.id)} onToggleComplete={() => toggleComplete(m.id)}
                      onRead={() => setOpenArticle(m)} />
                  ))
            }
          </div>
        )}

        {/* CHECKIN */}
        {tab === "checkin" && (
          <div className="px-4 pt-2 space-y-4 pb-6">
            {!sprintLoaded ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white animate-spin" />
              </div>
            ) : !activeSprint ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    style={{ color: "var(--mc-text-faint)" }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-bold" style={{ color: "var(--mc-text)" }}>Нет активного спринта</p>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--mc-text-muted)" }}>
                    Спринт появится здесь, когда будет объявлен в сообществе
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Sprint info block */}
                <div className="rounded-2xl p-4 space-y-3"
                  style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
                  <div className="flex items-center justify-between">
                    <span className="label-mono" style={{ color: "var(--mc-primary-bright)" }}>
                      СПРИНТ · ДЕНЬ {getSprintDay(activeSprint.start_date)} ИЗ {getSprintTotal(activeSprint.start_date, activeSprint.end_date)}
                    </span>
                    {checkinStreak > 1 && (
                      <span className="label-mono" style={{ color: "var(--mc-text-faint)" }}>
                        {checkinStreak} дн. подряд
                      </span>
                    )}
                  </div>
                  <p className="font-black text-lg leading-snug"
                    style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
                    {activeSprint.title}
                  </p>
                  {activeSprint.description && (
                    <p className="text-sm leading-relaxed" style={{ color: "var(--mc-text-muted)" }}>
                      {activeSprint.description}
                    </p>
                  )}
                  {activeSprint.daily_task && (
                    <div className="px-3 py-2.5 rounded-xl"
                      style={{ backgroundColor: "rgba(45,107,246,0.1)", border: "1px solid rgba(45,107,246,0.2)" }}>
                      <p className="label-mono mb-1" style={{ color: "var(--mc-primary-bright)", fontSize: 10 }}>ЗАДАНИЕ</p>
                      <p className="text-sm" style={{ color: "var(--mc-text)" }}>{activeSprint.daily_task}</p>
                    </div>
                  )}
                  <div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--mc-ink-border)" }}>
                      <div className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((getSprintDay(activeSprint.start_date) / getSprintTotal(activeSprint.start_date, activeSprint.end_date)) * 100))}%`,
                          background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary-bright))",
                        }} />
                    </div>
                  </div>
                </div>

                {/* Check-in form or done state */}
                {checkinDone ? (
                  <div className="rounded-2xl p-4 space-y-3"
                    style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "linear-gradient(135deg, var(--mc-primary-dark), var(--mc-primary))" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "var(--mc-text)" }}>Чек-ин за сегодня сохранён</p>
                        {checkinStreak > 0 && (
                          <p className="text-xs mt-0.5" style={{ color: "var(--mc-text-faint)" }}>
                            {checkinStreak} {checkinStreak === 1 ? "день" : checkinStreak < 5 ? "дня" : "дней"} подряд
                          </p>
                        )}
                      </div>
                    </div>
                    {todayCheckin && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {todayCheckin.energy && (
                          <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "var(--mc-ink-3)" }}>
                            <p className="label-mono mb-0.5" style={{ color: "var(--mc-text-faint)", fontSize: 10 }}>ЭНЕРГИЯ</p>
                            <p className="text-sm font-semibold" style={{ color: "var(--mc-text)" }}>
                              {["", "Тяжело", "Устал", "Норм", "Хорошо", "Огонь"][todayCheckin.energy]}
                            </p>
                          </div>
                        )}
                        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "var(--mc-ink-3)" }}>
                          <p className="label-mono mb-0.5" style={{ color: "var(--mc-text-faint)", fontSize: 10 }}>ПРАКТИКА</p>
                          <p className="text-sm font-semibold" style={{ color: "var(--mc-text)" }}>
                            {todayCheckin.practice_done === "yes" ? "Выполнил" : todayCheckin.practice_done === "partial" ? "Частично" : "Не выполнил"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 space-y-5"
                    style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
                    <p className="font-bold text-base" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
                      Чек-ин на сегодня
                    </p>

                    {/* Energy */}
                    <div className="space-y-2">
                      <p className="label-mono">Уровень энергии</p>
                      <div className="flex gap-1.5">
                        {([1, 2, 3, 4, 5] as const).map((n) => (
                          <button key={n} onClick={() => setEnergy(n)}
                            className="flex-1 py-3 rounded-xl flex flex-col items-center gap-1"
                            style={{
                              backgroundColor: energy === n ? "rgba(45,107,246,0.2)" : "var(--mc-ink-3)",
                              border: `1px solid ${energy === n ? "var(--mc-primary)" : "var(--mc-ink-border)"}`,
                              color: energy === n ? "var(--mc-primary-bright)" : "var(--mc-text-faint)",
                            }}>
                            <span className="text-base font-black">{n}</span>
                            <span style={{ fontSize: 8, fontFamily: "var(--mc-font-mono)", letterSpacing: "0.04em" }}>
                              {["", "ТЯЖЕЛО", "УСТАЛ", "НОРМ", "ХОРОШО", "ОГОНЬ"][n]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Practice */}
                    <div className="space-y-2">
                      <p className="label-mono">Практика выполнена?</p>
                      <div className="flex gap-2">
                        {(["yes", "partial", "no"] as const).map((val) => {
                          const labels = { yes: "Да", partial: "Частично", no: "Нет" };
                          return (
                            <button key={val} onClick={() => setPracticeDone(val)}
                              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                              style={{
                                backgroundColor: practiceDone === val ? "rgba(45,107,246,0.18)" : "var(--mc-ink-3)",
                                border: `1px solid ${practiceDone === val ? "var(--mc-primary)" : "var(--mc-ink-border)"}`,
                                color: practiceDone === val ? "var(--mc-primary-bright)" : "var(--mc-text-muted)",
                              }}>
                              {labels[val]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                      <p className="label-mono">
                        Заметка{" "}
                        <span style={{ color: "var(--mc-text-faint)", fontWeight: 400, textTransform: "none" }}>
                          (необязательно)
                        </span>
                      </p>
                      <textarea rows={3} value={checkinNote} onChange={(e) => setCheckinNote(e.target.value)}
                        placeholder="Что заметил сегодня?"
                        className="w-full rounded-xl px-3.5 py-3 text-sm resize-none focus:outline-none"
                        style={{ backgroundColor: "var(--mc-ink-3)", border: "1px solid var(--mc-ink-border)", color: "var(--mc-text)", fontFamily: "var(--mc-font-body)" }} />
                    </div>

                    <button disabled={checkinSubmitting || !energy} onClick={submitCheckin}
                      className="w-full py-3 rounded-xl text-sm font-semibold"
                      style={{
                        background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary))",
                        color: "#fff",
                        opacity: energy ? 1 : 0.4,
                      }}>
                      {checkinSubmitting ? "Сохраняем..." : "Сохранить чек-ин"}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Admin sprint panel */}
            {userId === OWNER_ID && (
              <div className="pt-2">
                <button onClick={() => setAdminOpen(true)}
                  className="w-full py-2.5 rounded-xl text-xs"
                  style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)", color: "var(--mc-text-faint)", fontFamily: "var(--mc-font-mono)" }}>
                  {activeSprint ? "Изменить спринт" : "+ Создать спринт"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* PROGRESS */}
        {tab === "progress" && (
          <div className="px-4 pt-2 space-y-4 pb-6">
            {!progressLoaded ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white animate-spin" />
              </div>
            ) : (
              <>
                {/* MNTR directions */}
                <div className="rounded-2xl p-4 space-y-4"
                  style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
                  <p className="font-black text-lg" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
                    Мой путь MNTR
                  </p>
                  {(["M", "N", "T", "R"] as Direction[]).map((dir) => {
                    const total = progressData?.dirTotal?.[dir] ?? 0;
                    const done = progressData?.dirCompleted?.[dir] ?? 0;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    return (
                      <div key={dir} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold" style={{ color: "var(--mc-text)" }}>
                            {DIRECTION_META[dir].full}
                          </span>
                          <span className="label-mono" style={{ color: "var(--mc-text-faint)" }}>
                            {done}/{total}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--mc-ink-border)" }}>
                          <div className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary-bright))" }} />
                        </div>
                      </div>
                    );
                  })}
                  {(progressData?.completedCount ?? 0) === 0 && (
                    <p className="text-xs text-center pt-1" style={{ color: "var(--mc-text-faint)" }}>
                      Отмечай материалы изученными — и здесь появится прогресс
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="rounded-2xl p-4 space-y-3"
                  style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
                  <p className="font-black text-lg" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
                    Активность
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      [String(progressData?.completedCount ?? 0), "Изучено\nматериалов"],
                      [String(progressData?.checkinCount ?? 0), "Чек-инов\nв этом месяце"],
                    ].map(([num, label]) => (
                      <div key={label} className="rounded-xl py-4 text-center space-y-1"
                        style={{ backgroundColor: "var(--mc-ink-3)" }}>
                        <p className="text-2xl font-black" style={{ color: "var(--mc-primary-bright)", fontFamily: "var(--mc-font-heading)" }}>
                          {num}
                        </p>
                        <p className="text-xs leading-tight whitespace-pre-line" style={{ color: "var(--mc-text-faint)" }}>
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hint to go mark materials */}
                {(progressData?.completedCount ?? 0) === 0 && (
                  <button onClick={() => setTab("materials")}
                    className="w-full py-3 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "var(--mc-ink-2)", color: "var(--mc-text-muted)", border: "1px solid var(--mc-ink-border)" }}>
                    Перейти к материалам →
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 z-10"
        style={{ backgroundColor: "var(--mc-ink-2)", borderTop: "1px solid var(--mc-ink-border)", paddingTop: "10px", paddingBottom: "calc(10px + env(safe-area-inset-bottom))" }}>
        {([
          { key: "home" as Tab, label: "Главная", icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
              <path d="M9 21V12h6v9"/>
            </svg>
          )},
          { key: "materials" as Tab, label: "Материалы", icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          )},
          { key: "checkin" as Tab, label: "Чек-ин", icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18"/>
              <path d="M8 14l2.5 2.5L16 11"/>
            </svg>
          )},
          { key: "progress" as Tab, label: "Прогресс", icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          )},
        ]).map(({ key, icon, label }) => (
          <button key={key} onClick={() => setTab(key)} className="flex flex-col items-center gap-1 px-4"
            style={{ color: tab === key ? "var(--mc-primary-bright)" : "var(--mc-text-faint)", opacity: tab === key ? 1 : 0.45 }}>
            {icon}
            <span className="text-[10px] font-medium" style={{ fontFamily: "var(--mc-font-mono)" }}>
              {label.toUpperCase()}
            </span>
          </button>
        ))}
      </nav>

      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} value={filter} onChange={setFilter} />
      <ArticleDrawer material={openArticle} onClose={() => setOpenArticle(null)} />

      {/* Admin sprint drawer */}
      {adminOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70" onClick={() => setAdminOpen(false)} />
          <div className="relative rounded-t-3xl flex flex-col max-h-[90vh]"
            style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "var(--mc-ink-border)" }} />
            </div>
            <div className="px-5 pb-3 flex items-center justify-between shrink-0">
              <p className="font-bold text-lg" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
                {activeSprint ? "Изменить спринт" : "Создать спринт"}
              </p>
              <button onClick={() => setAdminOpen(false)} style={{ color: "var(--mc-text-faint)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 space-y-4 pb-4 scrollbar-hide">
              {/* Title */}
              <div className="space-y-1.5">
                <p className="label-mono">Название спринта *</p>
                <input value={adminForm.title} onChange={(e) => setAdminForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="7 дней без бездумного скроллинга"
                  className="w-full rounded-xl px-3.5 py-3 text-sm focus:outline-none"
                  style={{ backgroundColor: "var(--mc-ink-3)", border: "1px solid var(--mc-ink-border)", color: "var(--mc-text)" }} />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <p className="label-mono">Описание <span style={{ color: "var(--mc-text-faint)", textTransform: "none" }}>(необязательно)</span></p>
                <textarea rows={2} value={adminForm.description} onChange={(e) => setAdminForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Контекст спринта..."
                  className="w-full rounded-xl px-3.5 py-3 text-sm resize-none focus:outline-none"
                  style={{ backgroundColor: "var(--mc-ink-3)", border: "1px solid var(--mc-ink-border)", color: "var(--mc-text)" }} />
              </div>

              {/* Направление */}
              <div className="space-y-1.5">
                <p className="label-mono">Направление MNTR</p>
                <div className="flex gap-2 flex-wrap">
                  {[["", "Все"], ["M", "M — Мышление"], ["N", "N — Навигация"], ["T", "T — Темп"], ["R", "R — Реализация"]].map(([val, label]) => (
                    <button key={val} onClick={() => setAdminForm(f => ({ ...f, direction: val }))}
                      className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: adminForm.direction === val ? "rgba(45,107,246,0.2)" : "var(--mc-ink-3)",
                        border: `1px solid ${adminForm.direction === val ? "var(--mc-primary)" : "var(--mc-ink-border)"}`,
                        color: adminForm.direction === val ? "var(--mc-primary-bright)" : "var(--mc-text-muted)",
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily task */}
              <div className="space-y-1.5">
                <p className="label-mono">Задание дня <span style={{ color: "var(--mc-text-faint)", textTransform: "none" }}>(показывается в чек-ине)</span></p>
                <input value={adminForm.daily_task} onChange={(e) => setAdminForm(f => ({ ...f, daily_task: e.target.value }))}
                  placeholder="Не открывать соцсети до 12:00"
                  className="w-full rounded-xl px-3.5 py-3 text-sm focus:outline-none"
                  style={{ backgroundColor: "var(--mc-ink-3)", border: "1px solid var(--mc-ink-border)", color: "var(--mc-text)" }} />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="label-mono">Начало *</p>
                  <input type="date" value={adminForm.start_date} onChange={(e) => setAdminForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full rounded-xl px-3.5 py-3 text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--mc-ink-3)", border: "1px solid var(--mc-ink-border)", color: "var(--mc-text)" }} />
                </div>
                <div className="space-y-1.5">
                  <p className="label-mono">Конец *</p>
                  <input type="date" value={adminForm.end_date} onChange={(e) => setAdminForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full rounded-xl px-3.5 py-3 text-sm focus:outline-none"
                    style={{ backgroundColor: "var(--mc-ink-3)", border: "1px solid var(--mc-ink-border)", color: "var(--mc-text)" }} />
                </div>
              </div>
            </div>

            <div className="px-5 py-4 space-y-2 shrink-0" style={{ borderTop: "1px solid var(--mc-ink-border)" }}>
              <div className="flex gap-3">
                <button onClick={() => setAdminOpen(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "var(--mc-ink-3)", color: "var(--mc-text-muted)", border: "1px solid var(--mc-ink-border)" }}>
                  Отмена
                </button>
                <button
                  disabled={adminSubmitting || !adminForm.title || !adminForm.start_date || !adminForm.end_date}
                  onClick={submitSprint}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary))",
                    color: "#fff",
                    opacity: adminForm.title && adminForm.start_date && adminForm.end_date ? 1 : 0.4,
                  }}>
                  {adminSubmitting ? "Создаём..." : "Создать"}
                </button>
              </div>
              {activeSprint && (
                <button
                  disabled={adminDeleting}
                  onClick={deleteSprint}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold"
                  style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                  {adminDeleting ? "Удаляем..." : "Удалить текущий спринт"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
