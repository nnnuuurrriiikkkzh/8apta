"use client";
import { CompanyText } from "@/components/company-link";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDemoSession } from "@/components/auth/demo-session";
import { useRequireSignIn } from "@/components/auth/require-sign-in";
import { useSeeker } from "@/components/seeker/store";
import { audit, dateLabel, notify } from "@/lib/platform";
import { supportCategories, supportStatuses, type SupportStatus } from "@/lib/support";
import { usePlatform } from "./store";
import { Badge, Empty, Field, Heading, Modal, Notice, Panel } from "./ui";

export function Support({ admin = false }: { admin?: boolean }) {
  const { data, update } = usePlatform();
  const { data: seeker } = useSeeker();
  const { role, home } = useDemoSession();
  const requireSignIn = useRequireSignIn();
  const router = useRouter();
  const params = useSearchParams();
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reply, setReply] = useState("");
  const base = admin ? "/admin/support" : "/support";
  const allowed = !admin || role === "admin";
  const ownTickets = data.supportTickets.filter(ticket => admin ? allowed : ticket.ownerRole === role);
  const list = ownTickets.filter(ticket => (!status || ticket.status === status) && `${ticket.subject} ${ticket.name} ${ticket.category}`.toLocaleLowerCase("ru").includes(query.toLocaleLowerCase("ru"))).sort((a,b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const ticket = ownTickets.find(item => item.id === params.get("ticket"));
  const person = role === "seeker" ? seeker.profile : data.users.find(user => user.id === (role === "employer" ? "hr" : role === "moderator" ? "mod" : "admin"));

  function open(id?: string) {
    setReply(""); setError("");
    router.replace(id ? `${base}?ticket=${encodeURIComponent(id)}` : base, { scroll: false });
  }
  function changeStatus(next: SupportStatus) {
    if (!requireSignIn() || !ticket || !allowed) return;
    const failure = update(draft => {
      const current = draft.supportTickets.find(item => item.id === ticket.id);
      if (!current || (!admin && current.ownerRole !== role)) return;
      current.status = next; current.updatedAt = new Date().toISOString();
      audit(draft, `Поддержка: «${current.subject}» — ${supportStatuses[next]}`, admin ? "Служба поддержки" : current.name);
      notify(draft, admin ? current.ownerRole : "admin", "Статус обращения изменён", `${current.subject}: ${supportStatuses[next]}`, `${admin ? "/support" : "/admin/support"}?ticket=${current.id}`);
    });
    setError(failure || "");
  }

  if (!allowed) return <><Heading title="Служба поддержки"/><Empty title="Раздел для администратора" text="В своём кабинете ты можешь создать обращение и прочитать ответы поддержки." href="/support" label="Мои обращения"/></>;

  return <>
    <Heading title={admin ? "Обращения в поддержку" : "Служба поддержки"} text={admin ? "Рассматривай заявки, отвечай пользователям и отмечай решённые вопросы." : "Опиши вопрос — история обращения и ответы будут доступны здесь."} action={!admin ? <button className="btn btn-primary" onClick={() => { if (requireSignIn()) { setError(""); setCreating(true); } }}>+ Новое обращение</button> : undefined}/>
    <p className="mb-6 rounded-xl bg-[#edf3e3] p-4 text-xs leading-6 text-muted">Локальная демонстрация. Обращения сохраняются в этом браузере. Ответ можно добавить в админ-панели; реальной отправки оператору и email-рассылки пока нет.</p>
    {!admin && <Panel className="mb-6"><h2 className="mb-4 text-lg font-semibold">Быстрые ответы</h2>{[
      ["Как добавить резюме?", "Открой «Мои резюме» в кабинете соискателя и нажми «Создать резюме». Можно сохранить несколько вариантов для разных вакансий."],
      ["Почему не загружается файл?", "Для резюме подходит PDF до 1 МБ. Для фото и логотипа — PNG, JPEG или WebP до 512 КБ. При заполненном хранилище браузера сохранение может не выполниться."],
      ["Где посмотреть ответ работодателя?", "Статус виден в «Моих откликах», переписка — в «Сообщениях». Важные изменения также появляются в уведомлениях."],
    ].map(([question, answer]) => <details key={question} className="border-t border-line py-3"><summary className="cursor-pointer text-sm font-medium">{question}</summary><p className="mt-3 text-sm leading-6 text-muted">{answer}</p></details>)}</Panel>}
    <Panel className="mb-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="Поиск обращений"><input className="field" value={query} onChange={e => setQuery(e.target.value)} placeholder="Тема или категория"/></Field><Field label="Статус обращения"><select className="field" value={status} onChange={e => setStatus(e.target.value)}><option value="">Все статусы</option>{Object.entries(supportStatuses).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></Field></div></Panel>
    <Notice>{notice}</Notice><p className="mb-4 text-xs text-muted">Обращений: {list.length}</p>
    <div className="space-y-4">{list.map(item => <Panel key={item.id}><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs text-muted">{item.category} · {dateLabel(item.updatedAt)}</p><h2 className="mt-2 break-words text-lg font-semibold"><CompanyText text={item.subject} /></h2>{admin && <p className="mt-2 break-words text-sm text-muted">{item.name} · {item.email}</p>}</div><Badge tone={item.status === "Resolved" ? "green" : item.status === "Waiting" ? "amber" : "neutral"}>{supportStatuses[item.status]}</Badge></div><button className="btn btn-light mt-5" onClick={() => open(item.id)}>Открыть обращение</button></Panel>)}</div>
    {!list.length && <Empty title={ownTickets.length ? "Обращения не найдены" : "Пока нет обращений"} text={ownTickets.length ? "Измени поиск или выбранный статус." : "Нажми «Новое обращение», чтобы задать вопрос. Он сохранится вместе с историей ответов."}/>}
    {params.has("ticket") && !ticket && <Notice error>Обращение недоступно для текущей роли или не найдено. <Link href={base} className="underline">К списку</Link></Notice>}
    {creating && <Modal title="Новое обращение" onClose={() => setCreating(false)}><form className="space-y-5" onSubmit={e => {
      e.preventDefault(); if (!requireSignIn()) return;
      const form = new FormData(e.currentTarget); const subject = String(form.get("subject")).trim(); const text = String(form.get("message")).trim();
      if (subject.length < 3 || text.length < 10) { setError("Укажи тему от 3 символов и описание от 10 символов."); return; }
      const id = crypto.randomUUID(); const date = new Date().toISOString();
      const failure = update(draft => {
        draft.supportTickets.unshift({ id, subject, category: String(form.get("category")), status: "Open", ownerRole: role, name: person?.name || "Пользователь", email: person?.email || "", createdAt: date, updatedAt: date, messages: [{ id: crypto.randomUUID(), author: "user", text, date }] });
        notify(draft, "admin", "Новое обращение в поддержку", subject, `/admin/support?ticket=${id}`);
      });
      setError(failure || ""); if (!failure) { setCreating(false); setNotice("Обращение сохранено. Ответ появится в его переписке."); open(id); }
    }}><p className="text-sm text-muted">Отправитель: {person?.name}</p><Field label="Тема"><input name="subject" className="field" required minLength={3} maxLength={120} placeholder="Коротко опиши вопрос"/></Field><Field label="Категория"><select name="category" className="field">{supportCategories.map(item => <option key={item}>{item}</option>)}</select></Field><Field label="Описание проблемы"><textarea name="message" required minLength={10} maxLength={4000} rows={5} className="field" placeholder="Что произошло и какого результата ты ожидал?"/></Field><Notice error>{error}</Notice><button className="btn btn-primary">Отправить обращение</button></form></Modal>}
    {ticket && <Modal title={<CompanyText text={ticket.subject} />} onClose={() => open()}><div className="mb-4 flex flex-wrap gap-3"><Badge>{supportStatuses[ticket.status]}</Badge><span className="text-xs text-muted">{ticket.category} · {dateLabel(ticket.createdAt)}</span></div><div role="log" aria-label="Переписка с поддержкой" className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-line bg-white p-4">{ticket.messages.map(message => <div key={message.id} className={`rounded-xl p-4 ${message.author === "support" ? "bg-[#edf3e3]" : "bg-paper"}`}><p className="text-xs font-semibold">{message.author === "support" ? "Служба поддержки" : ticket.name}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 [overflow-wrap:anywhere]"><CompanyText text={message.text} /></p><p className="mt-2 text-[10px] text-muted">{dateLabel(message.date)} · {new Date(message.date).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</p></div>)}</div>
      {admin && <div className="mt-5"><Field label="Изменить статус"><select className="field" value={ticket.status} onChange={e => changeStatus(e.target.value as SupportStatus)}>{Object.entries(supportStatuses).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></Field></div>}
      <Notice error>{error}</Notice>
      {ticket.status === "Resolved" ? <div className="mt-5"><p className="text-sm text-muted">Обращение решено. Если вопрос остался, его можно открыть снова.</p><button className="btn btn-light mt-4" onClick={() => changeStatus("Open")}>Открыть снова</button></div> : <form className="mt-5 space-y-4" onSubmit={e => {
        e.preventDefault(); if (!requireSignIn() || !reply.trim() || !allowed) return;
        const failure = update(draft => {
          const current = draft.supportTickets.find(item => item.id === ticket.id);
          if (!current || current.status === "Resolved" || (!admin && current.ownerRole !== role)) throw new Error("Обращение уже закрыто или недоступно");
          const date = new Date().toISOString();
          current.messages.push({ id: crypto.randomUUID(), author: admin ? "support" : "user", text: reply.trim(), date });
          current.updatedAt = date; current.status = admin ? "Waiting" : "InProgress";
          notify(draft, admin ? current.ownerRole : "admin", admin ? "Ответ службы поддержки" : "Новое сообщение в обращении", current.subject, `${admin ? "/support" : "/admin/support"}?ticket=${current.id}`);
        });
        setError(failure || ""); if (!failure) setReply("");
      }}><Field label={admin ? "Ответ пользователю" : "Сообщение поддержке"}><textarea className="field" required maxLength={4000} rows={3} value={reply} onChange={e => setReply(e.target.value)}/></Field><button disabled={!reply.trim()} className="btn btn-primary">Отправить ответ</button></form>}
    </Modal>}
    {!admin && <Link href={home} className="mt-7 inline-block text-sm underline">Вернуться в кабинет</Link>}
  </>;
}
