export type SeekerProfile = {
  name: string; title: string; email: string; phone: string; city: string; bio: string; avatar: string;
};
export type Resume = {
  id: string; title: string; name: string; email: string; phone: string; city: string;
  summary: string; skills: string; experience: string; education: string; languages: string;
  portfolio: string; visibility: "private" | "application";
  fileName: string; fileData: string; updatedAt: string;
};
export type SeekerData = { version: 1; profile: SeekerProfile; resumes: Resume[] };

export const initialSeekerData: SeekerData = {
  version: 1,
  profile: {
    name: "Александр Ким", title: "UI/UX-дизайнер", email: "alex.demo@example.com",
    phone: "", city: "Алматы", avatar: "",
    bio: "Создаю понятные интерфейсы и хочу развиваться в продуктовой команде. Интересуюсь исследованиями и дизайн-системами.",
  },
  resumes: [{
    id: "demo-resume", title: "UI/UX-дизайнер", name: "Александр Ким", email: "alex.demo@example.com",
    phone: "", city: "Алматы", summary: "Проектирую интерфейсы сайтов и приложений. Ищу команду для работы над полезным продуктом.",
    skills: "Figma, Auto Layout, UX/UI, прототипирование", experience: "2024–2026 · Дизайнер в учебной студии\nРазрабатывал адаптивные интерфейсы и библиотеку компонентов.",
    education: "2020–2024 · Бакалавриат, информационные системы", languages: "Русский — свободно\nАнглийский — B1",
    portfolio: "", visibility: "private", fileName: "", fileData: "", updatedAt: "2026-11-05T09:00:00.000Z",
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
