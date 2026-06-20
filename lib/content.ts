export type Direction = "M" | "N" | "T" | "R";

export interface Material {
  id: string;
  title: string;
  subtitle: string;
  direction: Direction;
  tags: string[];
  readTime: string;
}

export interface MonthData {
  month: string;
  theme: string;
  goal: string;
  question: string;
  sprint: string;
  sprintDaysLeft: number;
}

export const DIRECTION_META: Record<Direction, { label: string; color: string; bg: string; full: string }> = {
  M: { label: "Mind", color: "#7C6FE0", bg: "#7C6FE020", full: "M — Мышление" },
  N: { label: "Navigation", color: "#4CAF82", bg: "#4CAF8220", full: "N — Направление" },
  T: { label: "Tempo", color: "#E07C4F", bg: "#E07C4F20", full: "T — Тело & Ритм" },
  R: { label: "Realization", color: "#E0C24F", bg: "#E0C24F20", full: "R — Реализация" },
};

export const currentMonth: MonthData = {
  month: "Июнь 2026",
  theme: "Мышление и фокус",
  goal: "Научиться управлять вниманием и снизить информационный шум",
  question: "Как устроено моё внимание и где я теряю фокус?",
  sprint: "7 дней без бездумного скроллинга",
  sprintDaysLeft: 4,
};

export const materials: Material[] = [
  {
    id: "1",
    title: "Почему мы не можем сосредоточиться",
    subtitle: "Как работает внимание и что его разрушает",
    direction: "M",
    tags: ["Фокус", "Нейронаука"],
    readTime: "7 мин",
  },
  {
    id: "2",
    title: "Принципы без компромиссов",
    subtitle: "Как найти свои ценности и принимать решения из них",
    direction: "N",
    tags: ["Ценности", "Решения"],
    readTime: "9 мин",
  },
  {
    id: "3",
    title: "Сон как основа продуктивности",
    subtitle: "Что происходит с мозгом когда ты не высыпаешься",
    direction: "T",
    tags: ["Сон", "Здоровье"],
    readTime: "6 мин",
  },
  {
    id: "4",
    title: "Система вместо мотивации",
    subtitle: "Почему дисциплина надёжнее вдохновения",
    direction: "R",
    tags: ["Дисциплина", "Привычки"],
    readTime: "8 мин",
  },
  {
    id: "5",
    title: "Deep Work: практика глубокой работы",
    subtitle: "Как работать в состоянии потока каждый день",
    direction: "M",
    tags: ["Фокус", "Продуктивность"],
    readTime: "11 мин",
  },
];
