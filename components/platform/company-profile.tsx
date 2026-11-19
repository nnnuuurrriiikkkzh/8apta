"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoSession } from "@/components/auth/demo-session";
import { useRequireSignIn } from "@/components/auth/require-sign-in";
import { CompanyMark } from "@/components/company-mark";
import { readAttachment } from "@/components/seeker/store";
import { companyHref } from "@/lib/company-links";
import { companyErrors, CompanyRegistrationError, createEmployerCompany, emptyCompanyDetails, employerCompany, normalizeCompanyDetails, type CompanyErrors } from "@/lib/employer-company";
import { audit, notify, type Company } from "@/lib/platform";
import { CompanyFields } from "./company-fields";
import { usePlatform } from "./store";
import { Empty, Field, Heading, Notice, Panel } from "./ui";

export function CompanyProfile() {
  const { data } = usePlatform();
  const { role } = useDemoSession();
  const company = employerCompany(data);
  const [notice, setNotice] = useState("");
  if (role !== "employer") return <Empty title="Раздел для работодателя" text="Зарегистрируйся как работодатель, чтобы добавить свою компанию." href="/register" label="Регистрация" />;
  return <><Heading title={company ? "Профиль компании" : "Регистрация компании"} text="Опиши, чем занимается ваша команда. Эти сведения будут доступны кандидатам." action={company && <Link href={companyHref(company.id)} className="btn btn-light">Открыть страницу ↗</Link>} /><Notice>{notice}</Notice>{!company && <p className="mb-6 rounded-xl bg-[#edf3e3] p-4 text-sm leading-6"><span className="mb-2 block font-semibold">Шаг 2 из 2 · Регистрация компании</span>Аккаунт работодателя уже создан. Теперь расскажи о компании — после сохранения профиля можно будет создавать вакансии. Если заполнишь позже, вернись в раздел «Моя компания».</p>}<CompanyProfileForm key={company?.id || data.users.find(user => user.id === "hr")?.email || "new"} company={company} onSaved={setNotice} />{company && !company.blocked && <Link href="/dashboard/employer/jobs/new" className="btn btn-primary mt-6">Создать вакансию →</Link>}</>;
}

function CompanyProfileForm({ company, onSaved }: { company?: Company; onSaved: (message: string) => void }) {
  const { data, update } = usePlatform();
  const requireSignIn = useRequireSignIn();
  const initial = company || emptyCompanyDetails(data.users.find(user => user.id === "hr")?.email);
  const [details, setDetails] = useState(initial);
  const [logo, setLogo] = useState(company?.logo || "");
  const [errors, setErrors] = useState<CompanyErrors>({});
  const [error, setError] = useState("");
  return <Panel><form noValidate className="space-y-6" onSubmit={event => {
    event.preventDefault(); if (!requireSignIn()) return;
    const issues = companyErrors(details, data.companies, company?.id); setErrors(issues); setError("");
    const field = Object.keys(issues)[0];
    if (field) { (event.currentTarget.elements.namedItem(`company-${field}`) as HTMLInputElement | null)?.focus(); return; }
    const failure = update(draft => {
      const current = employerCompany(draft);
      if (current?.id !== company?.id) throw new CompanyRegistrationError("Компания изменилась в другой вкладке. Обнови страницу перед сохранением.");
      const latestIssues = companyErrors(details, draft.companies, current?.id);
      if (Object.keys(latestIssues).length) throw new CompanyRegistrationError(Object.values(latestIssues)[0]);
      if (current) {
        const previous = current.name;
        Object.assign(current, normalizeCompanyDetails(details), { logo, verified: false });
        draft.jobs.forEach(job => { if (job.companyId ? job.companyId === current.id : job.company === previous) { job.companyId = current.id; job.company = current.name; job.letter = current.name[0]; } });
      } else { createEmployerCompany(draft, details).logo = logo; }
      const saved = employerCompany(draft)!;
      audit(draft, `${current ? "Обновлён профиль" : "Зарегистрирована компания"}: ${saved.name}`, "Работодатель");
      notify(draft, "moderator", current ? "Профиль компании обновлён" : "Новая компания", saved.name, "/moderator/companies");
    });
    setError(failure || ""); if (!failure) onSaved(company ? "Профиль сохранён. Изменения доступны на странице компании." : "Компания зарегистрирована. Теперь можно создать первую вакансию.");
  }}>
    <CompanyFields value={details} onChange={(key, value) => { setDetails(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); onSaved(""); }} errors={errors} />
    <div className="flex flex-wrap items-center gap-5"><CompanyMark company={{ ...details, id: company?.id || "new", logo, verified: false, blocked: false }} /><div className="min-w-0"><Field label="Логотип компании (необязательно)"><input className="field" type="file" accept="image/png,image/jpeg,image/webp" onChange={async event => { const file = event.target.files?.[0]; if (!file) return; try { setLogo(await readAttachment(file, "avatar")); setError(""); onSaved(""); } catch (error) { setError((error as Error).message); } event.target.value = ""; }} /></Field><p className="mt-2 text-xs text-muted">PNG, JPEG, WebP · до 512 КБ</p>{logo && <button type="button" className="mt-2 text-sm underline" onClick={() => setLogo("")}>Удалить логотип</button>}</div></div>
    {company?.blocked && <Notice error>Компания скрыта модератором. Изменение профиля не снимает ограничение на публикацию вакансий.</Notice>}
    <Notice error>{error}</Notice><div className="flex flex-wrap gap-3"><button className="btn btn-primary">{company ? "Сохранить профиль" : "Зарегистрировать компанию"}</button><button type="button" className="btn btn-light" onClick={() => { setDetails(initial); setLogo(company?.logo || ""); setErrors({}); setError(""); onSaved(""); }}>Отменить изменения</button></div>
  </form></Panel>;
}
