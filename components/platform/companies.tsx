"use client";
import { CompanyLink, CompanyText } from "@/components/company-link";

import { useState } from "react";
import { audit, notify } from "@/lib/platform";
import { usePlatform } from "./store";

import { CompanyMark } from "@/components/company-mark";
import { Badge, Empty, Field, Heading, Modal, Notice, Panel } from "./ui";

export { Companies } from "./company-directory";

export { CompanyProfile } from "./company-profile";

export function CompanyManagement({admin=false}:{admin?:boolean}) {
 const {data,update}=usePlatform();const [query,setQuery]=useState("");const [selected,setSelected]=useState<string|null>(null);const [error,setError]=useState("");const company=data.companies.find(c=>c.id===selected);const list=data.companies.filter(c=>c.name.toLowerCase().includes(query.toLowerCase()));
 return <><Heading title={admin?"Управление компаниями":"Проверка компаний"} text="Проверяй публичные сведения и фиксируй решения по профилям."/><Field label="Название компании"><input className="field mb-5" value={query} onChange={e=>setQuery(e.target.value)}/></Field><div className="space-y-4">{list.map(c=><Panel key={c.id}><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><CompanyMark company={c}/><div><h2 className="font-semibold"><CompanyLink id={c.id} /></h2><p className="mt-1 text-xs text-muted">{c.city} · {c.industry}</p></div></div><Badge tone={c.blocked?"red":c.verified?"green":"amber"}>{c.blocked?"Скрыта":c.verified?"Проверена":"Нужна проверка"}</Badge></div><button className="btn btn-light mt-5" onClick={()=>{setSelected(c.id);setError("");}}>Рассмотреть профиль</button></Panel>)}</div>{!list.length&&<Empty text="Компаний с таким названием не найдено."/>}{company&&<Modal title={<CompanyLink id={company.id} />} onClose={()=>setSelected(null)}><p className="whitespace-pre-line text-sm leading-7 text-muted"><CompanyText text={company.description} /></p><p className="mt-4 break-words text-sm">{company.email} · {company.website}</p><form className="mt-6 space-y-5" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const failure=update(d=>{const c=d.companies.find(c=>c.id===company.id)!;const action=String(f.get("action"));c.blocked=action==="block";c.verified=action==="verify";const reason=String(f.get("reason")).trim();audit(d,`Компания ${c.name}: ${action==="block"?"скрыта":action==="verify"?"проверена":"возвращена на доработку"}. ${reason}`,admin?"Администратор":"Модератор");notify(d,"employer","Проверка компании",reason,"/dashboard/employer/company");});setError(failure||"");if(!failure)setSelected(null);}}><Field label="Действие"><select name="action" className="field"><option value="verify">Подтвердить профиль / снять блокировку</option><option value="revise">Вернуть на доработку</option><option value="block">Скрыть компанию и её вакансии</option></select></Field><Field label="Комментарий"><textarea name="reason" required minLength={5} maxLength={1000} rows={3} className="field"/></Field><Notice error>{error}</Notice><button className="btn btn-primary">Сохранить решение</button></form></Modal>}</>;
}
