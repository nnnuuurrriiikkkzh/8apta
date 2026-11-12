export type SeekerProfile = {
  name: string; title: string; email: string; phone: string; city: string; bio: string; avatar: string;
};
export type Resume = {
  id: string; title: string; name: string; email: string; phone: string; city: string;
  summary: string; skills: string; experience: string; education: string; languages: string;
  portfolio: string; visibility: "private" | "application";
  fileName: string; fileData: string; updatedAt: string;
};
export type SeekerData = { version: 1; demoVersion?: 1; profile: SeekerProfile; resumes: Resume[] };

export const initialSeekerData: SeekerData = {
  version: 1,
  demoVersion: 1,
  profile: {
    name: "Александр Ким", title: "UI/UX-дизайнер", email: "alex.demo@example.com",
    phone: "+7 (000) 000-00-00", city: "Алматы", avatar: "",
    bio: "Создаю понятные интерфейсы и хочу развиваться в продуктовой команде. Интересуюсь исследованиями и дизайн-системами.",
  },
  resumes: [{
    id: "demo-resume", title: "UI/UX-дизайнер", name: "Александр Ким", email: "alex.demo@example.com",
    phone: "+7 (000) 000-00-00", city: "Алматы", summary: "Проектирую интерфейсы сайтов и приложений. Ищу команду для работы над полезным продуктом.",
    skills: "Figma, Auto Layout, UX/UI, прототипирование", experience: "2024–2026 · Дизайнер в учебной студии\nРазрабатывал адаптивные интерфейсы и библиотеку компонентов.",
    education: "2020–2024 · Бакалавриат, информационные системы", languages: "Русский — свободно\nАнглийский — B1",
    portfolio: "https://example.com/portfolio", visibility: "application", fileName: "", fileData: "", updatedAt: "2026-11-05T09:00:00.000Z",
  }, {
    id: "demo-resume-frontend", title: "Frontend-разработчик · React", name: "Александр Ким", email: "alex.demo@example.com",
    phone: "+7 (000) 000-00-00", city: "Алматы", summary: "Совмещаю опыт проектирования интерфейсов с разработкой. Создаю адаптивные приложения на React и TypeScript.",
    skills: "React, TypeScript, Next.js, Tailwind CSS, Git", experience: "2025–2026 · Разработчик в учебной команде\nСоздал каталог с фильтрами и личный кабинет. Работал с формами, доступностью и адаптивной вёрсткой.",
    education: "2020–2024 · Бакалавриат, информационные системы\n2025 · Практический курс React", languages: "Русский — свободно\nАнглийский — B1",
    portfolio: "https://example.com/frontend", visibility: "application", fileName: "", fileData: "", updatedAt: "2026-11-04T10:00:00.000Z",
  }, {
    id: "demo-resume-content", title: "UX-редактор / контент-менеджер", name: "Александр Ким", email: "alex.demo@example.com",
    phone: "+7 (000) 000-00-00", city: "Алматы", summary: "Пишу понятные тексты для цифровых продуктов: подсказки, инструкции и письма. Хочу развивать навыки UX-редактуры.",
    skills: "UX writing, Figma, Редактура, Контент-план", experience: "2024–2026 · Учебные проекты\nРазрабатывал тексты интерфейса, справочные статьи и сценарии первого знакомства с продуктом.",
    education: "2020–2024 · Бакалавриат, информационные системы", languages: "Русский — свободно\nКазахский — разговорный\nАнглийский — B1",
    portfolio: "https://example.com/writing", visibility: "private", fileName: "", fileData: "", updatedAt: "2026-11-03T11:00:00.000Z",
  }],
};

export function blankResume(profile: SeekerProfile): Resume {
  return { id: "", title: profile.title, name: profile.name, email: profile.email, phone: profile.phone,
    city: profile.city, summary: profile.bio, skills: "", experience: "", education: "", languages: "",
    portfolio: "", visibility: "private", fileName: "", fileData: "", updatedAt: "" };
}

export function profileProgress(profile: SeekerProfile) {
  return Math.round([profile.name, profile.title, profile.email, profile.phone, profile.city, profile.bio, profile.avatar].filter(value => value.trim()).length / 7 * 100);
}
