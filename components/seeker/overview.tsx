"use client";

import Link from "next/link";
import { useSeeker } from "./store";
import { useFavorites } from "@/components/favorites";
import { JobCard } from "@/components/job-card";
import { Icon } from "@/components/icon";
import { usePlatform } from "@/components/platform/store";
import { visibleJobs } from "@/lib/platform";
import { profileProgress } from "@/lib/seeker";

export function SeekerOverview() {
  const { data } = useSeeker();
  const { ids } = useFavorites();
  const { data: platform } = usePlatform(); const jobs = visibleJobs(platform);
  const progress = profileProgress(data.profile);
  const saved = jobs.filter(job => ids.includes(job.id));
  return <>
    <div className="rounded-2xl bg-[#edf2e3] p-6 sm:p-8"><p className="eyebrow text-[#718058]">ТВОЯ КАРЬЕРА · ТВОЙ РИТМ</p><h1 className="mt-3 break-words text-3xl font-semibold tracking-tight">Привет, {data.profile.name.trim().split(/\s+/)[0] || "соискатель"}!</h1><p className="mt-3 max-w-lg text-sm leading-6 text-muted">Здесь начинается твой следующий шаг. Обнови профиль, подготовь резюме и выбери интересные вакансии.</p><Link href="/dashboard/seeker/resumes" className="btn btn-primary mt-5">Перейти к резюме <Icon name="arrow" /></Link></div>
    <div className="my-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[[String(platform.applications.filter(a => a.mine).length), "Отклики", "/dashboard/seeker/applications"], [String(data.resumes.length), "Резюме", "/dashboard/seeker/resumes"], [String(saved.length), "В избранном", "/dashboard/seeker/favorites"], [`${progress}%`, "Профиль заполнен", "/dashboard/seeker/profile"]].map(([value, label, href]) => <Link href={href} key={label} className="rounded-xl border border-line bg-white p-5 hover:border-[#a8bb8c]"><p className="text-3xl font-semibold">{value}</p><p className="mt-2 text-sm text-muted">{label}</p></Link>)}</div>
    <section className="rounded-2xl border border-line bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">Расскажи о себе чуть больше</h2><p className="mt-2 text-sm leading-6 text-muted">Добавь контакты, город, желаемую должность и фото.</p></div><Link href="/dashboard/seeker/profile" className="btn btn-light">Редактировать профиль</Link></div><div role="progressbar" aria-label="Заполненность профиля" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf1e6]"><div style={{ width: `${progress}%` }} className="h-full rounded-full bg-[#8fad50]" /></div><p className="mt-2 text-xs text-muted">Заполнено {progress}%</p></section>
    <section className="mt-7"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Твои резюме</h2><Link href="/dashboard/seeker/resumes" className="text-sm font-semibold underline underline-offset-4">Управлять резюме</Link></div>{data.resumes.length ? <div className="space-y-3">{data.resumes.slice(0, 2).map(resume => <Link key={resume.id} href="/dashboard/seeker/resumes" className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white p-5"><div className="min-w-0"><p className="break-words font-semibold">{resume.title}</p><p className="mt-1 text-xs text-muted">{resume.city || "Город не указан"} · {resume.visibility === "private" ? "Только для меня" : "Для отклика"}</p></div><Icon name="arrow" /></Link>)}</div> : <p className="rounded-xl border border-dashed border-line p-6 text-sm text-muted">Пока нет резюме. Создай первое в разделе «Мои резюме».</p>}</section>
    <section className="mt-7"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">{saved.length ? "Ты сохранил" : "Возможности для знакомства"}</h2><Link href={saved.length ? "/dashboard/seeker/favorites" : "/jobs"} className="text-sm font-semibold underline underline-offset-4">Смотреть все</Link></div><div className="grid gap-4 xl:grid-cols-2">{(saved.length ? saved : jobs).slice(0, 2).map(job => <JobCard key={job.id} job={job} compact />)}</div></section>
  </>;
}
