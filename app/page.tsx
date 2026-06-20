"use client";

import { useEffect, useState } from "react";
import { materials, currentMonth, DIRECTION_META, Direction } from "@/lib/content";
import { SprintCard } from "@/components/SprintCard";
import { MaterialCard } from "@/components/MaterialCard";
import { ProgressSection } from "@/components/ProgressSection";
import { DirectionFilter } from "@/components/DirectionFilter";

type Tab = "home" | "materials" | "checkin" | "progress";

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [filter, setFilter] = useState<Direction | "all">("all");
  const [user, setUser] = useState<{ first_name: string } | null>(null);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }

    const initData = tg?.initData || "";

    if (!initData) {
      // Dev mode: skip auth
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
      .then((data) => {
        setUser(data.user);
        setIsMember(data.isMember);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  if (!isMember) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center gap-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: "linear-gradient(135deg, #7C6FE0, #4CAF82)" }}
        >
          🔒
        </div>
        <div>
          <p className="text-xl font-bold text-white">Доступ закрыт</p>
          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
            Это пространство только для участников MNTR Community
          </p>
        </div>
        <a
          href="https://t.me/menotrcommunity"
          className="w-full py-3 rounded-xl text-sm font-semibold text-center text-white"
          style={{ background: "linear-gradient(90deg, #7C6FE0, #4CAF82)" }}
        >
          Вступить в комьюнити
        </a>
      </div>
    );
  }

  const filteredMaterials =
    filter === "all" ? materials : materials.filter((m) => m.direction === filter);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 space-y-1">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Привет, {user?.first_name} 👋
        </p>
        <p className="text-xl font-bold text-white">MNTR Community</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 space-y-6">
        {tab === "home" && (
          <>
            {/* Month card */}
            <div
              className="rounded-2xl p-4 space-y-2"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                {currentMonth.month}
              </span>
              <p className="text-lg font-bold text-white">{currentMonth.theme}</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {currentMonth.goal}
              </p>
              <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs text-white/40 mb-1">Вопрос месяца</p>
                <p className="text-sm text-white/80 italic">"{currentMonth.question}"</p>
              </div>
            </div>

            <SprintCard />

            {/* Direction cards */}
            <div>
              <p className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                Направления
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(DIRECTION_META) as [Direction, (typeof DIRECTION_META)[Direction]][]).map(
                  ([dir, meta]) => (
                    <button
                      key={dir}
                      onClick={() => {
                        setFilter(dir);
                        setTab("materials");
                      }}
                      className="rounded-2xl p-4 text-left space-y-1 transition-opacity active:opacity-70"
                      style={{ background: meta.bg, border: `1px solid ${meta.color}30` }}
                    >
                      <span className="text-xl font-black" style={{ color: meta.color }}>
                        {dir}
                      </span>
                      <p className="text-xs text-white/60 leading-tight">
                        {meta.full.split(" — ")[1]}
                      </p>
                    </button>
                  )
                )}
              </div>
            </div>
          </>
        )}

        {tab === "materials" && (
          <>
            <DirectionFilter active={filter} onChange={setFilter} />
            <div className="space-y-3">
              {filteredMaterials.map((m) => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          </>
        )}

        {tab === "checkin" && (
          <div className="space-y-4">
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <p className="font-semibold text-white">Чек-ин на сегодня</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Как прошёл день? Что сделал по спринту?
              </p>
              <textarea
                rows={4}
                placeholder="Напиши свои наблюдения..."
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 resize-none focus:outline-none"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                }}
              />
              <div className="space-y-2">
                <p className="text-xs text-white/40">Оцени свой день</p>
                <div className="flex gap-2">
                  {["😔", "😐", "🙂", "😊", "🔥"].map((emoji, i) => (
                    <button
                      key={i}
                      className="flex-1 py-2 rounded-xl text-lg transition-all hover:bg-white/10 active:scale-95"
                      style={{ backgroundColor: "var(--bg-primary)" }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="w-full py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(90deg, #7C6FE0, #4CAF82)" }}
              >
                Сохранить
              </button>
            </div>
          </div>
        )}

        {tab === "progress" && <ProgressSection />}
      </div>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-3 z-10"
        style={{
          backgroundColor: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        }}
      >
        {(
          [
            { key: "home" as Tab, icon: "⌂", label: "Главная" },
            { key: "materials" as Tab, icon: "📚", label: "Материалы" },
            { key: "checkin" as Tab, icon: "✅", label: "Чек-ин" },
            { key: "progress" as Tab, icon: "📊", label: "Прогресс" },
          ] as const
        ).map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex flex-col items-center gap-1 transition-opacity"
            style={{ opacity: tab === key ? 1 : 0.4 }}
          >
            <span className="text-xl">{icon}</span>
            <span
              className="text-[10px]"
              style={{ color: tab === key ? "#fff" : "var(--text-secondary)" }}
            >
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
