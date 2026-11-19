"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { useSeeker } from "./store";
import { useDemoSession } from "@/components/auth/demo-session";
import { Empty } from "@/components/platform/ui";

export function Avatar({ name, src, large = false }: { name: string; src: string; large?: boolean }) {
  return src.startsWith("data:image/")
    ? <img src={src} alt={`Фото: ${name}`} className={`shrink-0 rounded-2xl object-cover ${large ? "size-20" : "size-12"}`} />
    : <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-2xl bg-[#e7eed9] font-semibold ${large ? "size-20 text-2xl" : "size-12 text-lg"}`}>{name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("") || "Я"}</span>;
}

export function SeekerShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { signedIn, signOut, role, home } = useDemoSession();
  const { data, ready } = useSeeker();
  if (ready && (!signedIn || role !== "seeker")) return <main id="main" className="shell py-12"><h1 className="mb-6 text-3xl font-semibold">Кабинет соискателя</h1><Empty title={signedIn ? "Этот раздел для соискателей" : "Войди в аккаунт"} text={signedIn ? "Перейди в кабинет своей роли." : "Здесь будут твой профиль, резюме и история откликов."} href={signedIn ? home : "/login"} label={signedIn ? "Мой кабинет" : "Войти"}/></main>;
  const links = [
    ["/dashboard/seeker", "Обзор", "chart"],
    ["/dashboard/seeker/profile", "Мой профиль", "people"],
    ["/dashboard/seeker/resumes", "Мои резюме", "briefcase"],
    ["/dashboard/seeker/applications", "Мои отклики", "briefcase"],
    ["/dashboard/seeker/favorites", "Избранные вакансии", "bookmark"],
    ["/messages", "Сообщения", "people"],
    ["/notifications", "Уведомления", "clock"],
    ["/settings", "Настройки", "filter"],
    ["/support", "Служба поддержки", "people"],
    ["/jobs", "Найти работу", "search"],
  ];
  return <main id="main" className="shell py-8 sm:py-10">
    <nav aria-label="Хлебные крошки" className="mb-6 flex flex-wrap gap-2 text-xs text-muted"><Link href="/">Главная</Link><span>/</span><span>Кабинет соискателя</span>{path.endsWith("/profile") && <><span>/</span><span>Профиль</span></>}{path.endsWith("/resumes") && <><span>/</span><span>Резюме</span></>}</nav>
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-6">
        <div className="flex items-center gap-3 border-b border-line pb-5"><Avatar name={data.profile.name} src={data.profile.avatar} /><div className="min-w-0"><p className="break-words text-sm font-semibold">{data.profile.name}</p><p className="mt-1 text-xs text-muted">Соискатель · демо</p></div></div>
        <nav aria-label="Кабинет соискателя" className="mt-4 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">{links.map(([href, label, icon]) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${path === href ? "bg-ink font-medium text-white" : "text-muted hover:bg-[#f1f5e9] hover:text-ink"}`}><Icon name={icon} className="size-4" />{label}</Link>)}</nav>
        <p className="mt-5 border-t border-line pt-4 text-xs leading-5 text-muted">Профиль и резюме доступны только в этом браузере. Используй тестовые данные.</p>
        {signedIn && <button type="button" onClick={() => { signOut(); router.replace("/"); }} className="mt-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-paper hover:text-ink">Выйти</button>}
      </aside>
      <div className="min-w-0">{ready ? children : <div role="status" className="rounded-2xl border border-line bg-white p-8">Загружаем кабинет…</div>}</div>
    </div>
  </main>;
}
