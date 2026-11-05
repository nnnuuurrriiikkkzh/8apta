"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { applications, applicationStatuses, type ApplicationStatus } from "@/lib/applications";
import { jobs } from "@/lib/jobs";
import { Icon } from "./icon";

const storageKey = "jobhub-demo-application-statuses";
const listeners = new Set<() => void>();
let memory = "{}";
function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => { listeners.delete(callback); window.removeEventListener("storage", callback); };
}
function snapshot() {
  try { return localStorage.getItem(storageKey) ?? memory; } catch { return memory; }
}
function readStatuses(raw: string): Record<string, ApplicationStatus> {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([id, status]) =>
      applications.some(item => item.id === id) && typeof status === "string" && Object.hasOwn(applicationStatuses, status),
    )) as Record<string, ApplicationStatus>;
  } catch { return {}; }
}
const statusStyles: Record<ApplicationStatus, string> = {
  Submitted: "bg-[#eaf2db] text-[#486326]",
  Viewed: "bg-[#e8eef5] text-[#365573]",
  Interview: "bg-[#f0e8fa] text-[#70449b]",
  Accepted: "bg-[#dff2e7] text-[#286546]",
  Rejected: "bg-[#fbe8e5] text-[#9a4840]",
  Withdrawn: "bg-[#eef0ed] text-[#697268]",
};
const dateLabel = (date: string) => new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));

export function EmployerApplications() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "{}");
  const overrides = readStatuses(raw);
  const [query, setQuery] = useState("");
  const [vacancy, setVacancy] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const rows = applications.map(item => ({ ...item, status: item.status === "Withdrawn" ? item.status : overrides[item.id] ?? item.status }));
  const selected = rows.find(item => item.id === selectedId);
  const companyJobs = jobs.filter(job => job.company === "Линия");
  const filtered = rows.filter(item => {
    const job = jobs.find(job => job.id === item.jobId);
    return (!vacancy || item.jobId === vacancy) && (!statusFilter || item.status === statusFilter)
      && `${item.name} ${job?.title} ${item.skills.join(" ")}`.toLocaleLowerCase("ru").includes(query.trim().toLocaleLowerCase("ru"));
  });

  function updateStatus(id: string, status: ApplicationStatus) {
    const candidate = rows.find(item => item.id === id);
    if (!candidate || candidate.status === "Withdrawn" || status === "Withdrawn") return;
    memory = JSON.stringify({ ...readStatuses(snapshot()), [id]: status });
    let persisted = true;
    try { localStorage.setItem(storageKey, memory); } catch { persisted = false; }
    listeners.forEach(callback => callback());
    setNotice(`${candidate.name}: ${applicationStatuses[status]}. ${persisted ? "Изменение сохранено в этом браузере." : "Изменение действует до закрытия страницы: хранилище браузера недоступно."}`);
  }

  function openCandidate(id: string) {
    setSelectedId(id);
    dialog.current?.showModal();
  }

  function statusSelect(id: string, status: ApplicationStatus, name: string) {
    return <label className="block text-xs text-muted">Статус заявки
      <select aria-label={`Статус заявки: ${name}`} value={status} disabled={status === "Withdrawn"}
        onChange={event => updateStatus(id, event.target.value as ApplicationStatus)}
        className="field mt-1.5 disabled:cursor-not-allowed disabled:bg-paper disabled:opacity-70">
        {Object.entries(applicationStatuses).filter(([key]) => key !== "Withdrawn" || status === "Withdrawn").map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </label>;
  }

  return <div className="shell py-8 sm:py-12">
    <nav aria-label="Хлебные крошки" className="mb-6 flex flex-wrap gap-2 text-xs text-muted">
      <Link href="/">Главная</Link><span>/</span><span>Работодателю</span><span>/</span><span className="text-ink">Заявки кандидатов</span>
    </nav>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="eyebrow text-muted">КАБИНЕТ РАБОТОДАТЕЛЯ · ЛИНИЯ</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Заявки кандидатов</h1><p className="mt-3 text-sm text-muted">Знакомьтесь с кандидатами и отслеживайте этапы подбора.</p></div>
      <Link href="/jobs?q=Линия" className="btn btn-light">Вакансии компании <Icon name="arrow" /></Link>
    </div>
    <p className="mt-6 rounded-xl border border-[#dbe5cc] bg-[#edf2e5] p-4 text-sm leading-6">Демонстрационный кабинет: кандидаты вымышлены. Изменения статусов сохраняются только в этом браузере, уведомления кандидатам не отправляются.</p>
    <div className="my-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[["Всего заявок", rows.length], ["Новые", rows.filter(item => item.status === "Submitted").length], ["Собеседование", rows.filter(item => item.status === "Interview").length], ["Приняты", rows.filter(item => item.status === "Accepted").length]].map(([label, count]) =>
        <div key={label} className="rounded-xl border border-line bg-white p-5"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-3xl font-semibold">{count}</p></div>)}
    </div>
    <section aria-label="Список заявок" className="rounded-2xl border border-line bg-white p-4 sm:p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium">Поиск кандидата<input className="field mt-2" value={query} onChange={event => setQuery(event.target.value)} placeholder="Имя, навык или должность" /></label>
        <label className="text-sm font-medium">Вакансия<select className="field mt-2" value={vacancy} onChange={event => setVacancy(event.target.value)}><option value="">Все вакансии</option>{companyJobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}</select></label>
        <label className="text-sm font-medium">Статус<select className="field mt-2" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="">Все статусы</option>{Object.entries(applicationStatuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      </div>
      <div className="my-5 flex flex-wrap items-center justify-between gap-2 text-sm"><p aria-live="polite">Найдено заявок: <strong>{filtered.length}</strong></p>{(query || vacancy || statusFilter) && <button onClick={() => { setQuery(""); setVacancy(""); setStatusFilter(""); }} className="text-muted underline">Сбросить фильтры</button>}</div>
      <p role="status" className="mb-3 text-sm text-[#486326]">{notice}</p>
      <ul className="space-y-3">
        {filtered.map(item => {
          const job = jobs.find(job => job.id === item.jobId)!;
          return <li key={item.id} className="grid min-w-0 gap-5 rounded-xl border border-line p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_210px]">
            <div className="min-w-0"><div className="flex items-start gap-3"><span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#edf2e5] text-sm font-semibold">{item.name.split(" ").map(part => part[0]).join("")}</span><div className="min-w-0"><button onClick={() => openCandidate(item.id)} className="text-left font-semibold hover:underline">{item.name}</button><p className="mt-1 text-xs text-muted">{item.city} · {item.experience}</p></div></div><div className="mt-3 flex flex-wrap gap-1.5">{item.skills.map(skill => <span key={skill} className="rounded-md bg-paper px-2 py-1 text-[11px] text-muted">{skill}</span>)}</div></div>
            <div className="min-w-0"><Link href={`/jobs/${job.id}`} className="text-sm font-medium hover:underline">{job.title}</Link><p className="mt-2 text-xs text-muted">Отклик: {dateLabel(item.date)}</p><span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs ${statusStyles[item.status]}`}>{applicationStatuses[item.status]}</span></div>
            <div>{statusSelect(item.id, item.status, item.name)}<button onClick={() => openCandidate(item.id)} className="mt-3 flex items-center gap-2 text-sm font-semibold">Посмотреть заявку <Icon name="arrow" className="size-4" /></button></div>
          </li>;
        })}
      </ul>
      {!filtered.length && <div className="py-14 text-center"><h2 className="text-lg font-semibold">Заявок не найдено</h2><p className="mt-2 text-sm text-muted">Измените запрос или сбросьте фильтры.</p></div>}
    </section>
    <dialog ref={dialog} aria-labelledby="candidate-title" className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-32px)] max-w-xl overflow-y-auto rounded-2xl border border-line bg-paper p-6 text-ink shadow-2xl sm:p-8">
      <button autoFocus aria-label="Закрыть заявку" onClick={() => dialog.current?.close()} className="absolute right-4 top-4 rounded-lg p-2 hover:bg-line"><Icon name="close" /></button>
      {selected && <><p className="eyebrow pr-8 text-muted">ДЕМОНСТРАЦИОННОЕ РЕЗЮМЕ</p><h2 id="candidate-title" className="mt-4 pr-6 text-2xl font-semibold">{selected.name}</h2><p className="mt-2 text-sm text-muted">{selected.city} · Опыт: {selected.experience}</p><p className="mt-3 text-sm font-medium">На вакансию: {jobs.find(job => job.id === selected.jobId)?.title}</p>
        <h3 className="mt-6 font-semibold">Опыт и проекты</h3><p className="mt-2 text-sm leading-6 text-muted">{selected.summary}</p>
        <h3 className="mt-5 font-semibold">Образование</h3><p className="mt-2 text-sm leading-6 text-muted">{selected.education}</p>
        <h3 className="mt-5 font-semibold">Навыки</h3><div className="mt-2 flex flex-wrap gap-2">{selected.skills.map(skill => <span key={skill} className="rounded-lg bg-[#edf2e5] px-3 py-1.5 text-xs">{skill}</span>)}</div>
        <h3 className="mt-5 font-semibold">Сопроводительное письмо</h3><p className="mt-2 text-sm leading-6 text-muted">{selected.coverLetter}</p>
        <div className="mt-6 border-t border-line pt-5">{statusSelect(selected.id, selected.status, selected.name)}</div>
        {selected.status === "Withdrawn" && <p className="mt-3 text-xs text-muted">Кандидат отозвал заявку. Изменение статуса недоступно.</p>}
        <p role="status" className="mt-3 text-xs text-[#486326]">{notice}</p>
      </>}
    </dialog>
  </div>;
}
