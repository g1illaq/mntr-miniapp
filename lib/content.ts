export type Hashtag =
  | "финансы" | "саморазвитие" | "softskills" | "hardskills"
  | "эффективность" | "здоровье" | "биохакинг" | "образование"
  | "digital" | "библиотека" | "разборы" | "встречи"
  | "анонсы" | "промокоды" | "обсуждения" | "faq";

export type Direction = "M" | "N" | "T" | "R";

export interface Material {
  id: string;
  title: string;
  subtitle: string;
  hashtags: Hashtag[];
  readTime: string;
  cover?: string;
}

export interface Collection {
  id: string;
  title: string;
  cover: string;
  count: number;
  hashtag: Hashtag;
}

export interface MonthData {
  month: string;
  theme: string;
  goal: string;
  question: string;
  sprint: string;
  sprintDaysLeft: number;
  sprintTotal: number;
}

export const HASHTAG_META: Record<Hashtag, { emoji: string; label: string }> = {
  финансы:       { emoji: "💰", label: "Финансы"       },
  саморазвитие:  { emoji: "🧠", label: "Саморазвитие"  },
  softskills:    { emoji: "🤝", label: "Soft Skills"   },
  hardskills:    { emoji: "🛠",  label: "Hard Skills"   },
  эффективность: { emoji: "⚡", label: "Эффективность" },
  здоровье:      { emoji: "🫀", label: "Здоровье"      },
  биохакинг:     { emoji: "🔬", label: "Биохакинг"     },
  образование:   { emoji: "📖", label: "Образование"   },
  digital:       { emoji: "💻", label: "Digital & ИИ"  },
  библиотека:    { emoji: "📚", label: "Библиотека"    },
  разборы:       { emoji: "🔍", label: "Разборы"       },
  встречи:       { emoji: "🎙", label: "Встречи"       },
  анонсы:        { emoji: "📣", label: "Анонсы"        },
  промокоды:     { emoji: "🎁", label: "Промокоды"     },
  обсуждения:    { emoji: "💬", label: "Обсуждения"    },
  faq:           { emoji: "❓", label: "FAQ"            },
};

export const DIRECTION_META: Record<Direction, { label: string; color: string; bg: string; full: string }> = {
  M: { label: "Mind",        color: "#4f8bff", bg: "#2d6bf610", full: "M — Мышление"   },
  N: { label: "Navigation",  color: "#4f8bff", bg: "#2d6bf610", full: "N — Направление" },
  T: { label: "Tempo",       color: "#4f8bff", bg: "#2d6bf610", full: "T — Тело & Ритм" },
  R: { label: "Realization", color: "#4f8bff", bg: "#2d6bf610", full: "R — Реализация"  },
};

export const currentMonth: MonthData = {
  month: "Июнь 2026",
  theme: "Мышление и фокус",
  goal: "Научиться управлять вниманием и снизить информационный шум",
  question: "Как устроено моё внимание и где я теряю фокус?",
  sprint: "7 дней без бездумного скроллинга",
  sprintDaysLeft: 4,
  sprintTotal: 7,
};

export const collections: Collection[] = [
  { id: "c1", title: "Финансовая грамотность", cover: "/mntrcomm_finansy.png",     count: 8,  hashtag: "финансы"       },
  { id: "c2", title: "ИИ и инструменты",       cover: "/ai_cover.png",              count: 6,  hashtag: "digital"       },
  { id: "c3", title: "Soft Skills",            cover: "/softskills_cover.png",      count: 5,  hashtag: "softskills"    },
  { id: "c4", title: "Продуктивность",         cover: "/productivity_cover.png",    count: 9,  hashtag: "эффективность" },
  { id: "c5", title: "Библиотека",             cover: "/books_cover.png",           count: 12, hashtag: "библиотека"    },
  { id: "c6", title: "Маркетплейсы",           cover: "/marketplaces_cover.png",    count: 4,  hashtag: "hardskills"    },
];

export const materials: Material[] = [
  {
    id: "1",
    title: "Глубокая работа",
    subtitle: "Как держать фокус 4 часа подряд в мире, который борется за твоё внимание. Внимание — твоя новая валюта.",
    hashtags: ["эффективность", "саморазвитие"],
    readTime: "10 мин",
    cover: "/productivity_cover.png",
  },
  {
    id: "2",
    title: "Фундамент успешной личности",
    subtitle: "Ключевые принципы, на которых строится устойчивое развитие — мышление, ценности, действия.",
    hashtags: ["саморазвитие"],
    readTime: "8 мин",
  },
  {
    id: "3",
    title: "Финансовая грамотность: база",
    subtitle: "Как выстроить личный бюджет, начать копить и перестать жить от зарплаты до зарплаты.",
    hashtags: ["финансы"],
    readTime: "9 мин",
    cover: "/mntrcomm_finansy.png",
  },
  {
    id: "4",
    title: "ChatGPT и ИИ в работе",
    subtitle: "10 реальных кейсов как использовать ИИ чтобы делать задачи в 3 раза быстрее.",
    hashtags: ["digital", "hardskills"],
    readTime: "12 мин",
    cover: "/ai_cover.png",
  },
  {
    id: "5",
    title: "Soft Skills: как говорить убедительно",
    subtitle: "Коммуникация, публичные выступления и переговоры — навыки, которые открывают двери.",
    hashtags: ["softskills"],
    readTime: "7 мин",
    cover: "/softskills_cover.png",
  },
  {
    id: "6",
    title: "Маркетплейсы: с чего начать",
    subtitle: "Пошаговый разбор: как выйти на Ozon или Wildberries и не слить бюджет в первый месяц.",
    hashtags: ["hardskills", "финансы"],
    readTime: "11 мин",
    cover: "/marketplaces_cover.png",
  },
  {
    id: "7",
    title: "Telegram Ads: продвижение канала",
    subtitle: "Как настроить рекламу в Telegram и получить первых подписчиков по минимальной цене.",
    hashtags: ["hardskills", "digital"],
    readTime: "9 мин",
    cover: "/tgads_cover.png",
  },
  {
    id: "8",
    title: "Топ-10 книг сообщества",
    subtitle: "Подборка книг, которые участники комьюнити советуют друг другу чаще всего.",
    hashtags: ["библиотека", "саморазвитие"],
    readTime: "5 мин",
    cover: "/books_cover.png",
  },
];
