"use client";
import { CitySelect } from "@/components/city-select";
import { employerCompany, employerCanPost, ownsJob, CompanyRegistrationError } from "@/lib/employer-company";
import { CompanyRequired } from "./company-required";
import { useRequireSignIn } from "@/components/auth/require-sign-in";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { audit, publishVacancy, type Vacancy } from "@/lib/platform";
import { usePlatform } from "./store";
import { Field, Heading, Notice, Panel } from "./ui";

export function JobEditor({ job, onSaved, onCancel }: { job?: Vacancy; onSaved?: () => void; onCancel?: () => void }) {
  const { data,update , actorId}=usePlatform();const router=useRouter();const [error,setError]=useState("");const company=employerCompany(data,actorId);const requireSignIn=useRequireSignIn();
  function save(form: HTMLFormElement, status: "Draft" | "Published"){
    if(!requireSignIn())return;if(!employerCanPost(data,actorId) || (job && !ownsJob(data,job,actorId))){setError("Сначала зарегистрируй свою компанию.");return;}if(!form.reportValidity())return;const f=new FormData(form);const str=(key:string)=>String(f.get(key)||"").trim();const min=Number(f.get("min"));const max=Number(f.get("max"));if(max<min){setError("Верхняя граница зарплаты должна быть не меньше нижней.");return;}
    if(str("title").length<3||str("description").length<20){setError("Укажи название от 3 символов и описание от 20 символов.");return;}
    const failure=update(d=>{
      const current=employerCompany(d,actorId);
      const previous=job?d.jobs.find(item=>item.id===job.id):undefined;
      if(!current || current.id!==company?.id || !employerCanPost(d,actorId) || (job && !ownsJob(d,previous,actorId)))throw new CompanyRegistrationError("Компания или доступ к вакансии изменились. Обнови страницу.");
      const value:Vacancy={id:previous?.id||crypto.randomUUID(),title:str("title"),companyId:current.id,company:current.name,letter:current.name[0],color:previous?.color||"#e9e1fa",category:str("category"),city:str("city"),format:str("format"),experience:str("experience"),employment:str("employment"),min,max,tags:str("tags").split(",").map(s=>s.trim()).filter(Boolean),description:str("description"),tasks:str("tasks").split("\n").filter(Boolean),requirements:str("requirements").split("\n").filter(Boolean),conditions:str("conditions"),status:status==="Draft"?"Draft":previous?.status||"Draft",publishedAt:previous?.publishedAt||new Date().toISOString(),date:previous?.date||new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"long",year:"numeric"}),reason:""};
      if(status==="Published")publishVacancy(d,value);
      const index=d.jobs.findIndex(j=>j.id===value.id);
      if(index<0)d.jobs.unshift(value);else d.jobs[index]=value;
      const action=status==="Draft"?"Сохранён черновик":previous?.status==="Published"?"Обновлена вакансия":"Опубликована вакансия";
      audit(d,`${action}: ${value.title}`,"Работодатель",current.id);
    });setError(failure||"");if(!failure){if(onSaved)onSaved();else router.push("/dashboard/employer/jobs");}
  }
  if(!employerCanPost(data,actorId) || (job && !ownsJob(data,job,actorId)))return <CompanyRequired/>;
  return <>{!onSaved&&<Heading title="Новая вакансия" text="Расскажи о роли и команде. После публикации вакансия сразу появится в каталоге." />}<Panel><form onSubmit={e=>{e.preventDefault();save(e.currentTarget,"Published");}} className="space-y-5"><Field label="Название должности"><input className="field" name="title" required minLength={3} maxLength={120} defaultValue={job?.title} placeholder="Например, Frontend-разработчик" /></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="Направление"><select className="field" name="category" defaultValue={job?.category}>{Array.from(new Set([...data.categories,...(job?[job.category]:[])])).map(c=><option key={c}>{c}</option>)}</select></Field><Field label="Город"><CitySelect required className="field" name="city" defaultValue={job?.city||company?.city||""} /></Field>{[["Формат работы","format",["В офисе","Удалённо","Гибрид"]],["Занятость","employment",["Полная занятость","Частичная занятость","Стажировка"]],["Опыт","experience",["Без опыта","1–3 года","3–6 лет","Более 6 лет"]]].map(([label,name,options])=><Field key={String(name)} label={String(label)}><select className="field" name={String(name)} defaultValue={job?.[name as "format"|"employment"|"experience"]}>{(options as string[]).map(v=><option key={v}>{v}</option>)}</select></Field>)}</div><div className="grid gap-5 sm:grid-cols-2"><Field label="Зарплата от, ₸"><input className="field" required type="number" min={0} max={100000000} name="min" defaultValue={job?.min||0} /></Field><Field label="Зарплата до, ₸"><input className="field" required type="number" min={0} max={100000000} name="max" defaultValue={job?.max||0} /></Field></div>{[["Описание роли","description",job?.description],["Обязанности (по одной на строку)","tasks",job?.tasks.join("\n")],["Требования (по одному на строку)","requirements",job?.requirements.join("\n")],["Условия работы","conditions",job?.conditions]].map(([label,name,value])=><Field key={name} label={label!}><textarea className="field" required rows={4} maxLength={6000} name={name} defaultValue={value} /></Field>)}<Field label="Навыки через запятую"><input className="field" name="tags" maxLength={500} defaultValue={job?.tags.join(", ")} placeholder="React, TypeScript, Next.js" /></Field>{job?.status==="Published"&&<Notice>Изменения сразу появятся на сайте после сохранения.</Notice>}<Notice error>{error}</Notice><div className="flex flex-wrap gap-3"><button type="submit" className="btn btn-primary">{job?.status==="Published"?"Сохранить изменения":"Опубликовать вакансию"}</button><button type="button" className="btn btn-light" onClick={e=>save(e.currentTarget.form!,"Draft")}>Сохранить черновик</button><button type="button" className="btn btn-light" onClick={()=>onCancel?onCancel():router.push("/dashboard/employer/jobs")}>Отмена</button></div></form></Panel></>;
}
