"use client";
import Link from "next/link";
import { useState } from "react";
import { usePlatform } from "./store";
import { Field, Modal, Notice } from "./ui";

export function SavedSearches({ query }: { query: string }) {
 const {data,update}=usePlatform();const [open,setOpen]=useState(false);const [error,setError]=useState("");
 return <div className="mb-5 rounded-xl border border-line bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted">Сохрани поиск, чтобы вернуться к нему позже.</p><button className="text-sm font-semibold underline" onClick={()=>setOpen(true)}>Сохранить поиск</button></div>{data.searches.length>0&&<ul className="mt-3 flex flex-wrap gap-2">{data.searches.map(s=><li key={s.id} className="flex items-center gap-2 rounded-lg bg-[#eff3e8] px-3 py-2 text-xs"><Link href={`/jobs?${s.query}`}>{s.name}</Link><button aria-label={`Удалить поиск ${s.name}`} onClick={()=>setError(update(d=>{d.searches=d.searches.filter(x=>x.id!==s.id);})||"")}>×</button></li>)}</ul>}<Notice error>{error}</Notice>{open&&<Modal title="Сохранить поиск" onClose={()=>setOpen(false)}><form className="space-y-5" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const name=String(f.get("name")).trim();if(!name){setError("Укажи название поиска.");return;}const p=new URLSearchParams(query);["page","saved","sort"].forEach(k=>p.delete(k));const failure=update(d=>{d.searches.unshift({id:crypto.randomUUID(),name,query:p.toString()});});setError(failure||"");if(!failure)setOpen(false);}}><Field label="Название поиска"><input className="field" required minLength={2} maxLength={80} name="name" placeholder="Например, дизайн на удалёнке"/></Field><p className="text-xs leading-6 text-muted">Сохранятся текущие фильтры. При публикации подходящей вакансии в деморежиме появится уведомление.</p><Notice error>{error}</Notice><button className="btn btn-primary">Сохранить</button></form></Modal>}</div>;
}
