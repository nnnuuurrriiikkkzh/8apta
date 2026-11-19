"use client";
import { CompanyLink } from "@/components/company-link";
import Link from "next/link";
import { useState } from "react";
import { type Job, salary } from "@/lib/jobs";
import { notify, audit } from "@/lib/platform";
import { SaveButton } from "./favorites";
import { useRequireSignIn } from "./auth/require-sign-in";
import { useDemoSession } from "./auth/demo-session";
import { useSeeker } from "./seeker/store";
import { usePlatform } from "./platform/store";
import { Field, Modal, Notice } from "./platform/ui";
import { ReportButton } from "./platform/reports";

export function JobActions({ job }: { job: Job }) {
  const requireSignIn = useRequireSignIn();
  const { signedIn, role } = useDemoSession(); const { data: seeker } = useSeeker(); const { data, update } = usePlatform();
  const [open, setOpen] = useState(false); const [resumeId, setResumeId] = useState(""); const [letter, setLetter] = useState(""); const [error, setError] = useState(""); const [shared, setShared] = useState("");
  const existing = signedIn && role === "seeker" && data.applications.find(a => a.mine && a.jobId === job.id && a.status !== "Withdrawn");
  async function share() { if (!requireSignIn()) return; try { await navigator.clipboard.writeText(window.location.href); setShared("Ссылка скопирована"); } catch { setShared("Скопируйте адрес из строки браузера"); } }
  function apply(e: React.FormEvent) {
    e.preventDefault(); if (!requireSignIn() || role !== "seeker") return; const resume = seeker.resumes.find(r => r.id === resumeId); if (!resume) { setError("Выбери резюме для отклика."); return; }
    const failure = update(d => {
      if (d.applications.some(a => a.mine && a.jobId === job.id && a.status !== "Withdrawn")) throw new Error("duplicate");
      if (d.jobs.find(j => j.id === job.id)?.status !== "Published") throw new Error("closed");
      d.applications.unshift({ id: crypto.randomUUID(), mine: true, name: resume.name, jobId: job.id, city: resume.city, experience: resume.experience, date: new Date().toISOString(), status: "Submitted", skills: resume.skills.split(",").map(s => s.trim()).filter(Boolean), summary: resume.summary, education: resume.education, coverLetter: letter.trim(), resume: structuredClone(resume) });
      notify(d, "employer", "Новый отклик", `${resume.name} · ${job.title}`, "/dashboard/employer/applications"); audit(d, `Отправлен отклик: ${job.title}`, "Соискатель");
    }); setError(failure || ""); if (!failure) { setOpen(false); setLetter(""); }
  }
  return <><div className="rounded-2xl border border-line bg-white p-6"><p className="text-xs text-muted">Зарплата в месяц, до вычета налогов</p><p className="mt-2 text-xl font-semibold">{salary(job)}</p>{existing ? <Link href="/dashboard/seeker/applications" className="btn btn-primary mt-6 w-full">Отклик отправлен →</Link> : <button onClick={() => { if (!requireSignIn()) return; setOpen(true); setResumeId(seeker.resumes[0]?.id || ""); setError(""); }} className="btn btn-primary mt-6 w-full">Откликнуться →</button>}<div className="mt-3"><SaveButton id={job.id} label /></div><div className="mt-6 space-y-4 border-t border-line pt-5">{[["Город", job.city], ["Формат", job.format], ["Занятость", job.employment], ["Опыт", job.experience]].map(([label,value]) => <div key={label}><p className="text-xs text-muted">{label}</p><p className="mt-1 text-sm">{value}</p></div>)}</div><button onClick={share} className="mt-6 w-full border-t border-line pt-5 text-sm">Поделиться вакансией ↗</button><Notice>{shared}</Notice><div className="mt-4 text-center"><ReportButton type="job" target={job.title} targetId={job.id} /></div></div>
  {open && <Modal title="Отклик на вакансию" onClose={() => setOpen(false)}><p className="mb-5 text-sm text-muted">{job.title} · <CompanyLink name={job.company} /></p>{!signedIn ? <><p className="text-sm">Войди, чтобы отправить резюме и следить за ответом.</p><Link href="/login" className="btn btn-primary mt-5">Войти</Link></> : role !== "seeker" ? <p className="text-sm leading-6">Отклики доступны в роли соискателя. Переключи демонстрационную роль в кабинете.</p> : !seeker.resumes.length ? <><p>Сначала добавь резюме в своём кабинете.</p><Link href="/dashboard/seeker/resumes" className="btn btn-primary mt-5">Создать резюме</Link></> : <form onSubmit={apply} className="space-y-5"><Field label="Резюме"><select required className="field" value={resumeId} onChange={e => setResumeId(e.target.value)}>{seeker.resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}</select></Field><Field label="Сопроводительное письмо (необязательно)"><textarea className="field" rows={5} maxLength={3000} value={letter} onChange={e => setLetter(e.target.value)} placeholder="Расскажи, почему тебе интересна эта работа" /></Field><label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" required className="mt-1 size-4 shrink-0 accent-ink" />Разрешаю приложить копию выбранного резюме к этому отклику.</label><p className="text-xs leading-5 text-muted">Учебная демонстрация. Отклик появится в локальных списках кабинетов. Реальной отправки нет.</p><Notice error>{error}</Notice><button className="btn btn-primary w-full">Отправить отклик</button></form>}</Modal>}</>;
}
