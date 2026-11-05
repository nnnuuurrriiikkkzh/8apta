"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type Role, roleLabels, roleHomes } from "@/lib/platform";
import { useDemoSession } from "@/components/auth/demo-session";
import { usePlatform } from "./store";
import { Empty } from "./ui";

const menus: Record<Role, [string, string][]> = {
  seeker: [["/dashboard/seeker", "Обзор"], ["/dashboard/seeker/profile", "Профиль"], ["/dashboard/seeker/resumes", "Резюме"], ["/dashboard/seeker/applications", "Мои отклики"], ["/dashboard/seeker/favorites", "Избранное"]],
  employer: [["/dashboard/employer", "Обзор"], ["/dashboard/employer/company", "Моя компания"], ["/dashboard/employer/jobs", "Мои вакансии"], ["/dashboard/employer/jobs/new", "Создать вакансию"], ["/dashboard/employer/applications", "Отклики кандидатов"], ["/dashboard/employer/analytics", "Аналитика"]],
  moderator: [["/moderator", "Обзор"], ["/moderator/jobs", "Проверка вакансий"], ["/moderator/reports", "Жалобы"], ["/moderator/companies", "Проверка компаний"], ["/moderator/history", "История решений"]],
  admin: [["/admin", "Обзор платформы"], ["/admin/users", "Пользователи"], ["/admin/companies", "Компании"], ["/admin/jobs", "Все вакансии"], ["/admin/categories", "Категории"], ["/admin/roles", "Роли и доступ"], ["/admin/reports", "Жалобы"], ["/admin/analytics", "Аналитика"], ["/admin/subscriptions", "Тарифы"], ["/admin/history", "Журнал действий"], ["/admin/settings", "Настройки платформы"]],
};

export function DemoRoleSelect() {
  const { role, signIn } = useDemoSession(); const router = useRouter();
  return <label className="block text-xs text-muted">Демонстрация роли<select aria-label="Демонстрация роли" className="field mt-2" value={role} onChange={e => { const next = e.target.value as Role; signIn(next); router.push(roleHomes[next]); }}>{Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>;
}

export function WorkspaceShell({ children, area }: { children: React.ReactNode; area?: Role }) {
  const path = usePathname(); const router = useRouter(); const { role, signedIn, signOut } = useDemoSession();
  const { ready, data } = usePlatform(); const current = area || role;
  const restricted = current === "seeker" || current === "employer";
  if (ready && restricted && (!signedIn || (area && role !== area))) return <main id="main" className="shell py-12"><h1 className="mb-6 text-3xl font-semibold">Личный кабинет</h1><Empty title={!signedIn ? "Войди в аккаунт" : "Этот раздел для другой роли"} text={!signedIn ? "После входа здесь будут доступны твои инструменты и данные." : `Текущая роль: ${roleLabels[role]}. Открой свой кабинет.`} href={signedIn ? roleHomes[role] : "/login"} label={signedIn ? "Мой кабинет" : "Войти"}/>{!signedIn && <Link href="/register" className="mt-5 block text-center text-sm underline">Создать аккаунт</Link>}</main>;
  const unread = data.notifications.filter(n => n.role === current && !n.read).length;
  return <main id="main" className="shell py-8 sm:py-10"><div className="mb-6 flex flex-wrap justify-between gap-3 text-xs text-muted"><Link href="/">← На главную</Link><span>Рабочее пространство · {roleLabels[current]}</span></div><div className="grid min-w-0 items-start gap-6 lg:grid-cols-[230px_minmax(0,1fr)]"><aside className="rounded-2xl border border-line bg-white p-5"><Link href={roleHomes[current]} className="block border-b border-line pb-5 text-lg font-semibold">{roleLabels[current]}<span className="mt-1 block text-xs font-normal text-muted">JobHub / рабочий кабинет</span></Link><nav aria-label="Навигация кабинета" className="my-4 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">{[...menus[current], ...(["seeker", "employer"].includes(current) ? [["/messages", "Сообщения"] as [string, string]] : []), ["/notifications", `Уведомления${unread ? ` · ${unread}` : ""}`] as [string, string], ["/settings", "Мои настройки"] as [string, string]].map(([href,label]) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined} className={`rounded-lg px-3 py-2.5 text-sm ${path === href ? "bg-ink font-medium text-white" : "text-muted hover:bg-[#f0f4e8] hover:text-ink"}`}>{label}</Link>)}</nav><div className="border-t border-line pt-4">{(current === "admin" || current === "moderator") && <DemoRoleSelect />}<p className="mt-3 text-[11px] leading-5 text-muted">Учебный UI. Данные сохраняются в этом браузере. Реальная авторизация не подключена.</p>{signedIn && <button className="mt-3 text-sm underline" onClick={() => { signOut(); router.replace("/"); }}>Выйти</button>}</div></aside><div className="min-w-0">{ready ? children : <p role="status" className="p-8">Загружаем рабочее пространство…</p>}</div></div></main>;
}
