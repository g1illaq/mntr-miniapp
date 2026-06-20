export type Hashtag =
  | "финансы"
  | "саморазвитие"
  | "softskills"
  | "hardskills"
  | "эффективность"
  | "здоровье"
  | "биохакинг"
  | "образование"
  | "digital"
  | "библиотека"
  | "разборы"
  | "встречи"
  | "анонсы"
  | "промокоды"
  | "обсуждения"
  | "faq";

export type Direction = "M" | "N" | "T" | "R";

export interface Material {
  id: string;
  title: string;
  subtitle: string;
  hashtags: Hashtag[];
  readTime: string;
  direction?: Direction;
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

export const HASHTAG_META: Record<Hashtag, { emoji: string; label: string; color: string }> = {
  финансы:      { emoji: "💰", label: "Финансы",      color: "#4CAF82" },
  саморазвитие: { emoji: "🧠", label: "Саморазвитие", color: "#7C6FE0" },
  softskills:   { emoji: "🤝", label: "Soft Skills",  color: "#5B9BD5" },
  hardskills:   { emoji: "🛠", label: "Hard Skills",  color: "#E07C4F" },
  эффективность:{ emoji: "⚡", label: "Эффективность",color: "#E0C24F" },
  здоровье:     { emoji: "🫀", label: "Здоровье",     color: "#E05C7C" },
  биохакинг:    { emoji: "🔬", label: "Биохакинг",    color: "#4FCFE0" },
  образование:  { emoji: "📖", label: "Образование",  color: "#A78BFA" },
  digital:      { emoji: "💻", label: "Digital & ИИ", color: "#34D399" },
  библиотека:   { emoji: "📚", label: "Библиотека",   color: "#F59E0B" },
  разборы:      { emoji: "🔍", label: "Разборы",      color: "#6B7280" },
  встречи:      { emoji: "🎙", label: "Встречи",      color: "#EC4899" },
  анонсы:       { emoji: "📣", label: "Анонсы",       color: "#8B5CF6" },
  промокоды:    { emoji: "🎁", label: "Промокоды",    color: "#10B981" },
  обсуждения:   { emoji: "💬", label: "Обсуждения",   color: "#64748B" },
  faq:          { emoji: "❓", label: "FAQ",           color: "#94A3B8" },
};

export const DIRECTION_META: Record<Direction, { label: string; color: string; bg: string; full: string }> = {
  M: { label: "Mind",         color: "#7C6FE0", bg: "#7C6FE015", full: "M — Мышление"   },
  N: { label: "Navigation",   color: "#4CAF82", bg: "#4CAF8215", full: "N — Направление" },
  T: { label: "Tempo",        color: "#E07C4F", bg: "#E07C4F15", full: "T — Тело & Ритм" },
  R: { label: "Realization",  color: "#E0C24F", bg: "#E0C24F15", full: "R — Реализация"  },
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

export const materials: Material[] = [
  {
    id: "1",
    title: "Почему мы не можем сосредоточиться",
    subtitle: "Как работает внимание и что его разрушает в эпоху информационного перегруза",
    hashtags: ["саморазвитие", "эффективность"],
    direction: "M",
    readTime: "7 мин",
  },
  {
    id: "2",
    title: "Принципы без компромиссов",
    subtitle: "Как найти свои ценности и принимать решения из осознанной позиции",
    hashtags: ["саморазвитие", "softskills"],
    direction: "N",
    readTime: "9 мин",
  },
  {
    id: "3",
    title: "Сон как основа продуктивности",
    subtitle: "Что происходит с мозгом когда ты не высыпаешься — наука и практика",
    hashtags: ["здоровье", "биохакинг"],
    direction: "T",
    readTime: "6 мин",
  },
  {
    id: "4",
    title: "Система вместо мотивации",
    subtitle: "Почему дисциплина надёжнее вдохновения и как выстроить свою систему",
    hashtags: ["эффективность", "саморазвитие"],
    direction: "R",
    readTime: "8 мин",
  },
  {
    id: "5",
    title: "Deep Work: практика глубокой работы",
    subtitle: "Как работать в состоянии потока каждый день — метод Кэла Ньюпорта",
    hashtags: ["эффективность", "библиотека"],
    direction: "M",
    readTime: "11 мин",
  },
  {
    id: "6",
    title: "Финансовая подушка: с чего начать",
    subtitle: "Простая система для тех, кто хочет перестать жить от зарплаты до зарплаты",
    hashtags: ["финансы"],
    readTime: "8 мин",
  },
  {
    id: "7",
    title: "ChatGPT для работы: 10 реальных кейсов",
    subtitle: "Как использовать ИИ чтобы делать задачи в 3 раза быстрее",
    hashtags: ["digital", "hardskills"],
    readTime: "10 мин",
  },
];
