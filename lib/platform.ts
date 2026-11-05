import { jobs, categories, type Job } from "./jobs";
import { applications, type Application } from "./applications";
import type { Resume } from "./seeker";

export const jobStatuses = { Draft: "Черновик", Pending: "На проверке", Published: "Опубликована", Rejected: "Отклонена", Closed: "Закрыта", Archived: "В архиве" } as const;
export type JobStatus = keyof typeof jobStatuses;
export type Vacancy = Job & { status: JobStatus; publishedAt: string; reason: string; conditions: string };
export type Company = { id: string; name: string; city: string; industry: string; size: string; website: string; description: string; email: string; logo: string; verified: boolean; blocked: boolean };
export type Response = Application & { mine?: boolean; resume?: Resume };
export type Role = "seeker" | "employer" | "moderator" | "admin";
export const roleLabels: Record<Role, string> = { seeker: "Соискатель", employer: "Работодатель", moderator: "Модератор", admin: "Администратор" };
export const roleHomes: Record<Role, string> = { seeker: "/dashboard/seeker", employer: "/dashboard/employer", moderator: "/moderator", admin: "/admin" };
export type Report = { id: string; target: string; targetId: string; type: "job" | "company"; reason: string; description: string; status: "Open" | "InReview" | "Resolved" | "Rejected"; decision: string; escalated: boolean; date: string };
export const reportStatuses = { Open: "Новая", InReview: "В работе", Resolved: "Решена", Rejected: "Отклонена" };
export type Platform = {
  version: 1; jobs: Vacancy[]; companies: Company[]; applications: Response[];
  messages: { id: string; applicationId: string; author: "seeker" | "employer"; text: string; date: string; read: boolean }[];
  notifications: { id: string; role: Role; title: string; text: string; href: string; date: string; read: boolean }[];
  reports: Report[]; history: { id: string; action: string; date: string; actor: string }[];
  users: { id: string; name: string; email: string; role: Role; blocked: boolean }[];
  categories: string[];
  preferences: { email: boolean; messages: boolean; applications: boolean; profileVisible: boolean };
  settings: { name: string; support: string; moderation: boolean; registration: boolean };
  subscription: "Free" | "Premium";
  searches: { id: string; name: string; query: string }[];
};

export const initialPlatform: Platform = {
  version: 1,
  jobs: jobs.map(job => ({ ...job, status: "Published", publishedAt: `2026-10-${String(Number.parseInt(job.date)).padStart(2, "0")}T10:00:00.000Z`, reason: "", conditions: "Гибкий график, обучение и поддержка команды." })),
  companies: ["Линия", "Орбита", "Поток", "Спектр", "Маяк"].map((name, i) => ({ id: ["liniya", "orbita", "potok", "spektr", "mayak"][i], name, city: i % 2 ? "Астана" : "Алматы", industry: ["Финтех и дизайн", "IT и разработка", "Маркетинг", "Данные и аналитика", "Продуктовые команды"][i], size: i % 2 ? "51–200 сотрудников" : "11–50 сотрудников", website: "https://example.com", description: `${name} — команда, которая создаёт полезные цифровые продукты. Мы ценим самостоятельность, открытый диалог и желание учиться. Присоединяйся, чтобы работать над задачами, результат которых видят люди.`, email: "team@example.com", logo: "", verified: true, blocked: false })),
  applications,
  messages: [{ id: "msg-demo", applicationId: "demo-3", author: "employer", text: "Мария, здравствуйте! Приглашаем вас обсудить вакансию. Когда вам будет удобно?", date: "2026-10-28T10:30:00.000Z", read: false }],
  notifications: [{ id: "welcome", role: "seeker", title: "Твой следующий шаг", text: "Заполни резюме и отправь первый отклик.", href: "/dashboard/seeker/resumes", date: "2026-11-05T08:00:00.000Z", read: false }],
  reports: [], history: [], searches: [],
  users: [{ id: "me", name: "Александр Ким", email: "alex.demo@example.com", role: "seeker", blocked: false }, { id: "hr", name: "Елена Соколова", email: "hr@example.com", role: "employer", blocked: false }, { id: "mod", name: "Олег Иванов", email: "moderator@example.com", role: "moderator", blocked: false }, { id: "admin", name: "Анна Пак", email: "admin@example.com", role: "admin", blocked: false }],
  categories, preferences: { email: true, messages: true, applications: true, profileVisible: false }, settings: { name: "JobHub", support: "support@example.com", moderation: true, registration: true }, subscription: "Free",
};

export function audit(data: Platform, action: string, actor = "Демонстрация") {
  data.history.unshift({ id: crypto.randomUUID(), action, actor, date: new Date().toISOString() });
}
export function notify(data: Platform, role: Role, title: string, text: string, href: string) {
  data.notifications.unshift({ id: crypto.randomUUID(), role, title, text, href, date: new Date().toISOString(), read: false });
}
export function visibleJobs(data: Platform) { return data.jobs.filter(job => job.status === "Published" && !data.companies.find(c => c.name === job.company)?.blocked); }
export function dateLabel(date: string) { return new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" }); }

export function matchesSearch(job: Vacancy, query: string) {
  const p = new URLSearchParams(query);
  const text = `${job.title} ${job.company} ${job.category} ${job.tags.join(" ")}`.toLowerCase();
  return text.includes((p.get("q") || "").trim().toLowerCase())
    && ["city", "category", "employment"].every(key => !p.get(key) || job[key as "city" | "category" | "employment"] === p.get(key))
    && ["format", "experience"].every(key => !p.getAll(key).length || p.getAll(key).includes(job[key as "format" | "experience"]))
    && job.min >= (Number(p.get("salary")) || 0)
    && (!Number(p.get("days")) || Date.parse(job.publishedAt) >= Date.now() - Number(p.get("days")) * 86400000);
}
