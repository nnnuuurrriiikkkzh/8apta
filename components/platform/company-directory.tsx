"use client";

import Link from "next/link";
import { CitySelect } from "@/components/city-select";
import { TeamJoin } from "./team-join";
import { useState } from "react";
import { companyHref } from "@/lib/company-links";
import { visibleJobs } from "@/lib/platform";
import { CompanyLink, CompanyText } from "@/components/company-link";
import { CompanyMark } from "@/components/company-mark";
import { JobCard } from "@/components/job-card";
import { usePlatform } from "./store";
import { ReportButton } from "./reports";
import { Badge, Empty, Field, Panel } from "./ui";

export function Companies({ id }: { id?: string }) {
  const { data, ready } = usePlatform();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [sort, setSort] = useState("jobs");
  const [jobQuery, setJobQuery] = useState("");
  const [format, setFormat] = useState("");
  const companies = data.companies.filter(company => !company.blocked);
  const company = companies.find(item => item.id === id);
  const jobs = visibleJobs(data);
  const jobCounts = new Map<string, number>();
  for (const job of jobs) jobCounts.set(job.company, (jobCounts.get(job.company) || 0) + 1);
  function reset() { setQuery(""); setCity(""); setIndustry(""); setOnlyOpen(false); setSort("jobs"); }

  if (!ready) return <main id="main" className="shell py-12" role="status">Загружаем компании…</main>;
  if (id && !company) return <main id="main" className="shell py-12"><Empty headingLevel="h1" title="Компания недоступна" text="Профиль не найден или скрыт из каталога." href="/companies" label="Все компании" /></main>;

  if (company) {
    const companyJobs = jobs.filter(job => job.company === company.name);
    const filteredJobs = companyJobs.filter(job => (!format || job.format === format) && `${job.title} ${job.tags.join(" ")}`.toLocaleLowerCase("ru").includes(jobQuery.trim().toLocaleLowerCase("ru")));
    return <main id="main" className="shell py-8 sm:py-10">
      <nav aria-label="Хлебные крошки" className="mb-6 flex flex-wrap gap-2 text-xs text-muted"><Link href="/">Главная</Link><span>/</span><Link href="/companies" className="underline underline-offset-4">Компании</Link><span>/</span><span className="break-words">{company.name}</span></nav>
      <section className="rounded-3xl border border-line bg-[#edf3e3] p-6 sm:p-8" aria-labelledby="company-title">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex min-w-0 items-start gap-4"><CompanyMark company={company} /><div className="min-w-0"><p className="eyebrow mb-2 text-muted">ЗНАКОМСТВО С КОМАНДОЙ</p><h1 id="company-title" className="break-words text-3xl font-semibold tracking-tight sm:text-4xl [overflow-wrap:anywhere]">{company.name}</h1><p className="mt-3 text-sm text-muted">{company.industry} · {company.city}</p></div></div>
          <Badge tone={company.verified ? "green" : "neutral"}>{company.verified ? "Профиль проверен" : "Профиль компании"}</Badge>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-5 border-t border-ink/10 pt-6"><p className="text-sm">{company.size}<span className="mx-3 text-ink/30">/</span>Открытых вакансий: <strong>{companyJobs.length}</strong></p><a className="btn btn-primary" href="#company-vacancies">Смотреть вакансии →</a></div>
      </section>
      <nav aria-label="Разделы компании" className="my-6 flex flex-wrap gap-x-6 gap-y-3 border-b border-line pb-4 text-sm font-medium"><a href="#company-about" className="hover:underline">О компании</a><a href="#company-vacancies" className="hover:underline">Вакансии · {companyJobs.length}</a><a href="#company-contacts" className="hover:underline">Контакты</a></nav>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="min-w-0 space-y-7">
          <section id="company-about" className="scroll-mt-6"><Panel><p className="eyebrow text-muted">КОМАНДА И ПРОДУКТЫ</p><h2 className="mt-3 text-2xl font-semibold">О компании</h2><p className="mt-5 whitespace-pre-line break-words text-sm leading-7 text-muted"><CompanyText text={company.description} /></p></Panel></section>
          <section id="company-vacancies" className="scroll-mt-6" aria-labelledby="vacancies-title">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 id="vacancies-title" className="text-2xl font-semibold">Вакансии компании</h2><Badge>{companyJobs.length} открыто</Badge></div>
            {companyJobs.length > 0 && <Panel className="mb-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="Поиск по вакансиям"><input className="field" value={jobQuery} onChange={e => setJobQuery(e.target.value)} placeholder="Должность или навык" /></Field><Field label="Формат работы"><select className="field" value={format} onChange={e => setFormat(e.target.value)}><option value="">Любой формат</option>{Array.from(new Set(companyJobs.map(job => job.format))).map(item => <option key={item}>{item}</option>)}</select></Field></div><p aria-live="polite" className="mt-4 text-xs text-muted">Найдено вакансий: {filteredJobs.length}</p></Panel>}
            <div className="grid gap-4 xl:grid-cols-2">{filteredJobs.map(job => <JobCard key={job.id} job={job} />)}</div>
            {!filteredJobs.length && <><Empty title={companyJobs.length ? "Нет подходящих вакансий" : "Пока нет открытых вакансий"} text={companyJobs.length ? "Измени запрос или формат работы, чтобы увидеть другие предложения команды." : "Компания пока не ведёт набор. Можно посмотреть предложения других работодателей."} href={companyJobs.length ? undefined : "/jobs"} label="Все вакансии" />{companyJobs.length > 0 && <button className="btn btn-light mt-4" onClick={() => { setJobQuery(""); setFormat(""); }}>Сбросить поиск вакансий</button>}</>}
          </section>
        </div>
        <aside className="min-w-0 space-y-5 lg:sticky lg:top-6"><TeamJoin company={company} />
          <Panel><h2 className="text-lg font-semibold">Коротко о компании</h2><dl className="mt-5 space-y-4 text-sm">{[["Направление", company.industry], ["Город", company.city], ["Размер команды", company.size]].map(([label, value]) => <div key={label}><dt className="text-xs text-muted">{label}</dt><dd className="mt-1 break-words">{value}</dd></div>)}</dl></Panel>
          <section id="company-contacts" className="scroll-mt-6"><Panel><h2 className="text-lg font-semibold">Контакты</h2><div className="mt-5 space-y-5 text-sm"><div><p className="text-xs text-muted">Email</p><a href={`mailto:${company.email}`} className="mt-1 block break-all underline underline-offset-4">{company.email}</a></div>{/^https?:\/\//i.test(company.website) && <div><p className="text-xs text-muted">Сайт</p><a href={company.website} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all underline underline-offset-4">{company.website.replace(/^https?:\/\//i, "")} ↗</a></div>}</div><div className="mt-6 border-t border-line pt-4"><ReportButton type="company" target={company.name} targetId={company.id} /></div></Panel></section>
          <p className="px-2 text-xs leading-6 text-muted">Учебный профиль. Компания, контакты и вакансии вымышлены.</p>
        </aside>
      </div>
      <Link href="/companies" className="mt-9 inline-block text-sm font-semibold underline underline-offset-4">← Вернуться к компаниям</Link>
    </main>;
  }

  const list = companies.filter(item => (!city || item.city === city) && (!industry || item.industry === industry) && (!onlyOpen || (jobCounts.get(item.name) || 0) > 0) && `${item.name} ${item.industry}`.toLocaleLowerCase("ru").includes(query.trim().toLocaleLowerCase("ru"))).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "ru") : (jobCounts.get(b.name) || 0) - (jobCounts.get(a.name) || 0) || a.name.localeCompare(b.name, "ru"));
  const filtered = Boolean(query || city || industry || onlyOpen);
  return <main id="main" className="shell py-8 sm:py-10">
    <section className="mb-7 rounded-3xl border border-line bg-[#edf3e3] p-6 sm:p-8"><div className="grid gap-7 lg:grid-cols-[1.4fr_1fr]"><div><p className="eyebrow text-muted">КОМПАНИИ НА JOBHUB</p><h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Найди свою команду</h1><p className="mt-4 max-w-xl text-sm leading-7 text-muted">Сравни направления, познакомься с работодателями и посмотри, кого они ищут сейчас.</p></div><dl className="grid grid-cols-3 gap-3 self-center">{[["Компаний", companies.length], ["Вакансий", jobs.length], ["Городов", new Set(companies.map(item => item.city)).size]].map(([label, count]) => <div key={label} className="rounded-2xl bg-white/70 px-2 py-5 text-center"><dd className="text-2xl font-semibold sm:text-3xl">{count}</dd><dt className="mt-2 text-xs text-muted">{label}</dt></div>)}</dl></div></section>
    <section aria-label="Фильтры компаний"><Panel className="mb-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]"><Field label="Поиск компаний"><input className="field" value={query} onChange={e => setQuery(e.target.value)} placeholder="Название или направление" /></Field><Field label="Город"><CitySelect className="field" value={city} onChange={e => setCity(e.target.value)} placeholder="Все города" /></Field><Field label="Отрасль"><select className="field" value={industry} onChange={e => setIndustry(e.target.value)}><option value="">Все отрасли</option>{Array.from(new Set(companies.map(item => item.industry))).sort().map(item => <option key={item}>{item}</option>)}</select></Field></div><div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4"><label className="flex items-center gap-3 text-sm"><input type="checkbox" className="size-4 accent-ink" checked={onlyOpen} onChange={e => setOnlyOpen(e.target.checked)} />Только с открытыми вакансиями</label>{filtered && <button className="text-sm underline underline-offset-4" onClick={reset}>Сбросить фильтры</button>}</div></Panel></section>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><p aria-live="polite" className="text-sm text-muted">Компаний найдено: <strong className="text-ink">{list.length}</strong></p><label className="flex items-center gap-3 text-sm text-muted">Сортировка<select className="field !w-auto" value={sort} onChange={e => setSort(e.target.value)}><option value="jobs">Больше вакансий</option><option value="name">По названию</option></select></label></div>
    <div className="grid gap-5 md:grid-cols-2">{list.map(item => <article key={item.id} className="flex min-w-0 flex-col rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink/30 sm:p-6">
      <div className="flex items-start gap-4"><Link href={companyHref(item.id)} aria-label={`Страница компании ${item.name}`} className="shrink-0 rounded-2xl"><CompanyMark company={item} /></Link><div className="min-w-0"><h2 className="text-xl font-semibold"><CompanyLink id={item.id} /></h2><p className="mt-2 text-xs leading-5 text-muted">{item.industry}</p><div className="mt-2">{item.verified && <Badge tone="green">Проверена</Badge>}</div></div></div>
      <p className="my-5 line-clamp-2 text-sm leading-6 text-muted"><CompanyText text={item.description} /></p>
      <dl className="mb-5 grid grid-cols-2 gap-4 rounded-xl bg-paper p-4 text-sm"><div><dt className="text-xs text-muted">Город</dt><dd className="mt-1 break-words">{item.city}</dd></div><div><dt className="text-xs text-muted">Команда</dt><dd className="mt-1 break-words">{item.size}</dd></div></dl>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"><Link href={`${companyHref(item.id)}#company-vacancies`} className="text-sm font-medium underline underline-offset-4">Открытых вакансий: {jobCounts.get(item.name) || 0}</Link><Link href={companyHref(item.id)} className="btn btn-light">О компании →</Link></div>
    </article>)}</div>
    {!list.length && <Empty title="Компании не найдены" text="Попробуй другое название, город или отрасль либо сбрось фильтры." />}
  </main>;
}
