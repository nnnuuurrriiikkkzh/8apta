"use client";
import { canManageCompany, requireCompanyPermission, ownsJob, CompanyRegistrationError } from "@/lib/employer-company";
import { CompanyLink, CompanyText } from "@/components/company-link";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { dateLabel, notify } from "@/lib/platform";
import { useDemoSession } from "@/components/auth/demo-session";
import { usePlatform } from "./store";
import { Badge, Empty, Heading, Notice, Panel } from "./ui";

export function Messages({companyView=false}:{companyView?:boolean}) {
 const {data,update, actorId}=usePlatform();const {role,signedIn}=useDemoSession();const params=useSearchParams();const router=useRouter();
 const view=companyView||role==="employer"?"employer":"seeker";
 const [query,setQuery]=useState("");const [text,setText]=useState("");const [error,setError]=useState("");const bottom=useRef<HTMLDivElement>(null);
 const apps=data.applications.filter(a=>view==="employer"?canManageCompany(data,"applications",actorId)&&ownsJob(data,data.jobs.find(j=>j.id===a.jobId),actorId):a.mine);
 const selected=apps.find(a=>a.id===params.get("application"))||(!params.has("application")?apps[0]:undefined);
 const messages=data.messages.filter(m=>m.applicationId===selected?.id);const unread=messages.filter(m=>m.author!==view&&!m.read).map(m=>m.id).join(",");
 useEffect(()=>{
   if(!unread)return;
   const ids=unread.split(",");let cancelled=false;
   queueMicrotask(()=>{
     if(cancelled)return;
     const failure=update(d=>{
       if(view==="employer")requireCompanyPermission(d,"applications",actorId);
       d.messages.forEach(message=>{
         const application=d.applications.find(item=>item.id===message.applicationId);
         const accessible=application&&(view==="employer"?ownsJob(d,d.jobs.find(job=>job.id===application.jobId),actorId):application.mine);
         if(accessible&&ids.includes(message.id))message.read=true;
       });
     });
     if(failure)setError(failure);
   });
   return()=>{cancelled=true;};
 },[unread,update,actorId,view]);
 useEffect(()=>{bottom.current?.scrollIntoView({block:"nearest"});},[selected?.id,messages.length]);
 const list=apps.filter(a=>`${a.name} ${data.jobs.find(j=>j.id===a.jobId)?.title}`.toLowerCase().includes(query.toLowerCase()));
 if(view==="employer"&&!canManageCompany(data,"applications",actorId))return <Empty title="Переписка недоступна" text="Работать с кандидатами может владелец, администратор или рекрутер компании."/>;
 if(!signedIn)return <><Heading title="Сообщения"/><Empty title="Войди для общения" text="Переписка открывается после отклика на вакансию." href="/login" label="Войти"/></>;
 return <><Heading title="Сообщения" text={`Переписка по откликам · ${view==="employer"?"вид работодателя":"вид соискателя"}`} action={<Link className="btn btn-light" href={view==="employer"?"/dashboard/employer/applications":"/dashboard/seeker/applications"}>К откликам</Link>}/><Notice error>{error}</Notice>{!apps.length?<Empty text="Откликнись на вакансию, чтобы начать диалог с работодателем." href="/jobs"/>:<div className="grid min-w-0 overflow-hidden rounded-2xl border border-line bg-white xl:grid-cols-[260px_minmax(0,1fr)]"><aside className="min-w-0 border-b border-line p-4 xl:border-r xl:border-b-0"><label className="text-xs text-muted">Поиск диалога<input className="field mt-2" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Имя или вакансия"/></label><nav className="mt-4 max-h-72 space-y-2 overflow-y-auto xl:max-h-[560px]" aria-label="Диалоги">{list.map(a=>{const job=data.jobs.find(j=>j.id===a.jobId);const count=data.messages.filter(m=>m.applicationId===a.id&&m.author!==view&&!m.read).length;return <div key={a.id} className={`rounded-xl p-3 ${selected?.id===a.id?"bg-[#edf3e3]":"bg-paper"}`}><div className="flex justify-between gap-2 text-sm font-semibold"><span className="min-w-0 break-words">{view==="employer"?a.name:<CompanyLink name={job?.company} />}</span>{count>0&&<Badge tone="green">{count}</Badge>}</div><button type="button" onClick={()=>{router.replace(`/messages?application=${a.id}&view=${view}`,{scroll:false});setText("");setError("");}} aria-pressed={selected?.id===a.id} aria-label={`Открыть диалог: ${job?.title}`} className="mt-2 block w-full rounded text-left"><span className="block truncate text-xs text-muted">{job?.title}</span><span className="mt-2 block text-xs underline underline-offset-4">Открыть переписку →</span></button></div>;})}{!list.length&&<p className="p-3 text-sm text-muted">Диалоги не найдены.</p>}</nav></aside><section className="min-w-0">{selected?<><header className="border-b border-line p-5"><h2 className="font-semibold">{view==="employer"?selected.name:<CompanyLink name={data.jobs.find(j=>j.id===selected.jobId)?.company} />}</h2><p className="mt-1 text-xs text-muted">{data.jobs.find(j=>j.id===selected.jobId)?.title}</p></header><div className="flex h-[360px] flex-col gap-4 overflow-y-auto p-5" aria-label="История сообщений" role="log">{messages.map(m=><div key={m.id} className={`max-w-[90%] rounded-2xl px-4 py-3 ${m.author===view?"self-end bg-ink text-white":"self-start bg-[#eff3e8]"}`}><p className="whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]"><CompanyText text={m.text} /></p><p className="mt-2 text-[10px] opacity-70">{dateLabel(m.date)} · {new Date(m.date).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"})}{m.author===view?(m.read?" · Прочитано":" · Отправлено"):""}</p></div>)}{!messages.length&&<p className="my-auto text-center text-sm leading-6 text-muted">Начни диалог: задай вопрос о вакансии или предложи время встречи.</p>}<div ref={bottom}/></div><form className="border-t border-line p-4" onSubmit={e=>{e.preventDefault();if(!text.trim())return;const failure=update(d=>{if(view==="employer")requireCompanyPermission(d,"applications",actorId);if(view==="employer"&&!ownsJob(d,d.jobs.find(job=>job.id===selected.jobId),actorId))throw new CompanyRegistrationError("Диалог относится к другой компании.");d.messages.push({id:crypto.randomUUID(),applicationId:selected.id,author:view,text:text.trim(),date:new Date().toISOString(),read:false});if(d.preferences.messages)notify(d,view==="employer"?"seeker":"employer","Новое сообщение",text.trim().slice(0,100),`${view==="employer"?"/messages":"/dashboard/employer/messages"}?application=${selected.id}`);});setError(failure||"");if(!failure)setText("");}}><label className="sr-only" htmlFor="message-text">Сообщение</label><textarea id="message-text" className="field resize-y" rows={2} maxLength={3000} value={text} onChange={e=>setText(e.target.value)} placeholder="Напиши сообщение…"/><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-[11px] text-muted">Локальная демонстрация переписки</p><button disabled={!text.trim()} className="btn btn-primary">Отправить</button></div></form></>:<div className="p-6"><Empty title="Диалог недоступен" text="Выбери отклик из списка слева."/></div>}</section></div>}</>;
}

export function Notifications() {
 const {data,update, actorId}=usePlatform();const {role}=useDemoSession();const [onlyUnread,setOnlyUnread]=useState(false);const [error,setError]=useState("");const list=data.notifications.filter(n=>n.role===role&&(!n.recipientId||n.recipientId===actorId)&&(!onlyUnread||!n.read));
 function read(id?:string){setError(update(d=>{d.notifications.forEach(n=>{if(n.role===role&&(!n.recipientId||n.recipientId===actorId)&&(!id||n.id===id))n.read=true;});})||"");}
 return <><Heading title="Уведомления" text="Важные события по твоим вакансиям, откликам и переписке." action={<button className="btn btn-light" disabled={!data.notifications.some(n=>n.role===role&&(!n.recipientId||n.recipientId===actorId)&&!n.read)} onClick={()=>read()}>Прочитать все</button>}/><div className="mb-5 flex flex-wrap justify-between gap-3 text-sm"><label className="flex gap-2"><input type="checkbox" checked={onlyUnread} onChange={e=>setOnlyUnread(e.target.checked)}/>Только непрочитанные</label><Link className="underline" href="/settings">Настроить уведомления</Link></div><Notice error>{error}</Notice><div className="space-y-3">{list.map(n=><Panel key={n.id} className={!n.read?"border-l-4 border-l-[#9fbd62]":""}><div className="flex justify-between gap-3"><h2 className="font-semibold"><CompanyText text={n.title} /></h2>{!n.read&&<Badge tone="green">Новое</Badge>}</div><p className="mt-3 break-words text-sm leading-6 text-muted"><CompanyText text={n.text} /></p><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted">{dateLabel(n.date)}</p><div className="flex gap-4 text-sm">{!n.read&&<button onClick={()=>read(n.id)} className="underline">Прочитано</button>}<Link href={n.href} onClick={()=>read(n.id)} className="font-semibold">Перейти →</Link></div></div></Panel>)}</div>{!list.length&&<Empty title="Ты всё прочитал" text="Новые события появятся здесь. Настройки можно изменить в любой момент."/>}</>;
}
