"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

const OWNER_ID = 7276417797;

const HASHTAGS = [
  "финансы", "саморазвитие", "softskills", "hardskills",
  "эффективность", "здоровье", "биохакинг", "образование",
  "digital", "библиотека", "разборы", "встречи",
  "анонсы", "промокоды", "обсуждения", "faq",
];

interface Post {
  id: number;
  caption: string;
  body: string;
  hashtags: string[];
  published_at: string;
}

export default function AdminPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) { tg.ready(); tg.expand(); }
    const id = tg?.initDataUnsafe?.user?.id || null;
    setUserId(id);
    if (id === OWNER_ID) loadPosts();
  }, []);

  async function loadPosts() {
    const r = await fetch("/api/posts?limit=100");
    const { posts } = await r.json();
    setPosts(posts || []);
  }

  async function save() {
    if (!title.trim() || !body.trim()) { setMsg("Заполни заголовок и содержание"); return; }
    setSaving(true);
    setMsg("");
    const r = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title, body, hashtags: selectedTags.join(" "), photoUrl }),
    });
    const d = await r.json();
    if (d.ok) {
      setMsg("✓ Сохранено");
      setTitle(""); setBody(""); setSelectedTags([]); setPhotoUrl("");
      loadPosts();
    } else {
      setMsg("Ошибка: " + d.error);
    }
    setSaving(false);
  }

  async function deletePost(id: number) {
    if (!confirm("Удалить?")) return;
    await fetch("/api/admin/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, postId: id }),
    });
    loadPosts();
  }

  if (userId === null) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--mc-ink)" }}>
        <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white animate-spin" />
      </div>
    );
  }

  if (userId !== OWNER_ID) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--mc-ink)" }}>
        <p style={{ color: "var(--mc-text-faint)" }}>Нет доступа</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 px-4 pt-5 space-y-6" style={{ backgroundColor: "var(--mc-ink)" }}>
      <div className="flex items-center gap-2.5">
        <Logo size={26} />
        <div>
          <p className="font-black text-base" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>Админ-панель</p>
          <p className="text-xs" style={{ color: "var(--mc-text-faint)", fontFamily: "var(--mc-font-mono)" }}>MNTR COMM</p>
        </div>
      </div>

      {/* Add form */}
      <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
        <p className="font-bold" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>Добавить материал</p>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Заголовок поста из канала"
          className="w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
          style={{ backgroundColor: "var(--mc-ink-3)", border: "1px solid var(--mc-ink-border)", color: "var(--mc-text)" }}
        />

        <textarea
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Вставь сюда текст из комментария (урок)"
          className="w-full rounded-xl px-3.5 py-3 text-sm resize-none focus:outline-none"
          style={{ backgroundColor: "var(--mc-ink-3)", border: "1px solid var(--mc-ink-border)", color: "var(--mc-text)" }}
        />

        <div>
          <p className="text-xs mb-2" style={{ color: "var(--mc-text-faint)", fontFamily: "var(--mc-font-mono)" }}>ХЭШТЕГИ</p>
          <div className="flex flex-wrap gap-2">
            {HASHTAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button key={tag}
                  onClick={() => setSelectedTags((prev) => active ? prev.filter((t) => t !== tag) : [...prev, tag])}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: active ? "rgba(45,107,246,0.2)" : "var(--mc-ink-3)",
                    color: active ? "var(--mc-primary-bright)" : "var(--mc-text-muted)",
                    border: `1px solid ${active ? "var(--mc-primary)" : "var(--mc-ink-border)"}`,
                  }}>
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        <input
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="URL обложки (необязательно)"
          className="w-full rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
          style={{ backgroundColor: "var(--mc-ink-3)", border: "1px solid var(--mc-ink-border)", color: "var(--mc-text)" }}
        />

        {msg && (
          <p className="text-sm" style={{ color: msg.startsWith("✓") ? "#4ade80" : "#f87171" }}>{msg}</p>
        )}

        <button onClick={save} disabled={saving}
          className="w-full py-3 rounded-xl text-sm font-semibold"
          style={{
            background: "linear-gradient(90deg, var(--mc-primary-dark), var(--mc-primary))",
            color: "#fff",
            opacity: saving ? 0.5 : 1,
          }}>
          {saving ? "Сохраняю..." : "Сохранить материал"}
        </button>
      </div>

      {/* Existing posts */}
      <div className="space-y-2">
        <p className="font-bold" style={{ color: "var(--mc-text)", fontFamily: "var(--mc-font-heading)" }}>
          Материалы в базе ({posts.length})
        </p>
        {posts.map((p) => (
          <div key={p.id} className="rounded-xl p-3 flex items-start justify-between gap-3"
            style={{ backgroundColor: "var(--mc-ink-2)", border: "1px solid var(--mc-ink-border)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--mc-text)" }}>{p.caption || "—"}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--mc-text-faint)" }}>
                {p.hashtags?.join(" ")} · {p.body ? `${p.body.length} симв.` : "нет тела"}
              </p>
            </div>
            <button onClick={() => deletePost(p.id)}
              className="shrink-0 text-xs px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
