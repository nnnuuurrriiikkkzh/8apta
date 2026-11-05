"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import type { Resume } from "@/lib/seeker";
import { readAttachment } from "./store";

export function ResumeEditor({ initial, onSave, onCancel }: { initial: Resume; onSave: (resume: Resume) => string | null; onCancel: () => void }) {
  const [draft, setDraft] = useState<Resume>({ ...initial });
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  function change(key: keyof Resume, value: string) { setDraft(current => ({ ...current, [key]: value })); setError(""); }
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    setReading(true); setError("");
    try { const fileData = await readAttachment(file, "pdf"); setDraft(current => ({ ...current, fileName: file.name, fileData })); }
    catch (error) { setError(error instanceof Error ? error.message : "Не удалось прочитать PDF."); }
    finally { setReading(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reading) return;
    if (draft.title.trim().length < 2 || draft.name.trim().length < 2) { setError("Укажи название резюме и имя: минимум 2 символа."); return; }
    if (draft.portfolio && !/^https?:\/\//i.test(draft.portfolio.trim())) { setError("Ссылка на портфолио должна начинаться с https:// или http://."); return; }
    const failure = onSave({ ...draft, title: draft.title.trim(), name: draft.name.trim(), email: draft.email.trim(), city: draft.city.trim(), portfolio: draft.portfolio.trim(), updatedAt: new Date().toISOString() });
    if (failure) setError(failure);
  }
  return <form onSubmit={submit} className="mt-5 space-y-5">
    <p className="rounded-lg bg-[#f0f4e8] p-3 text-xs leading-5 text-muted">Резюме сохраняется только в этом браузере. Поля со звёздочкой обязательны.</p>
    <div className="grid gap-4 sm:grid-cols-2">{([
      ["title", "Название резюме / должность", "text", true], ["name", "Имя и фамилия", "text", true],
      ["email", "Email", "email", true], ["phone", "Телефон", "tel", false],
      ["city", "Город", "text", true], ["portfolio", "Ссылка на портфолио", "url", false],
    ] as const).map(([key, label, type, required]) => <label key={key} className="text-sm font-medium">{label}{required ? " *" : ""}<input value={draft[key]} onChange={event => change(key, event.target.value)} type={type} required={required} maxLength={key === "portfolio" ? 500 : 254} className="field mt-2" /></label>)}</div>
    {([
      ["summary", "О себе", "Коротко о твоих сильных сторонах", 3],
      ["skills", "Навыки", "Например: Figma, React, английский язык", 2],
      ["experience", "Опыт работы", "Компания, должность, период и основные задачи", 4],
      ["education", "Образование", "Учебное заведение, специальность, годы обучения", 3],
      ["languages", "Языки", "Например: русский — свободно, английский — B2", 2],
    ] as const).map(([key, label, placeholder, rows]) => <label key={key} className="block text-sm font-medium">{label}<textarea value={draft[key]} onChange={event => change(key, event.target.value)} rows={rows} maxLength={3000} placeholder={placeholder} className="field mt-2 resize-y" /></label>)}
    <label className="block text-sm font-medium">Видимость<select aria-label="Видимость резюме" value={draft.visibility} onChange={event => change("visibility", event.target.value)} className="field mt-2"><option value="private">Только для меня</option><option value="application">Доступно для выбора при отклике</option></select></label>
    <p className="text-xs leading-5 text-muted">Резюме не публикуется в общем доступе. Отправку работодателю подключим на этапе откликов.</p>
    <div className="rounded-xl border border-line p-4"><label htmlFor="resume-pdf" className="text-sm font-medium">PDF-резюме</label><input id="resume-pdf" type="file" accept="application/pdf,.pdf" onChange={upload} disabled={reading} className="mt-3 block w-full text-xs file:mr-3 file:rounded-lg file:border file:border-line file:bg-paper file:px-3 file:py-2" /><p className="mt-2 text-xs text-muted">Не больше 1 МБ. Файл хранится локально вместе с резюме.</p>{draft.fileName && <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="min-w-0 break-all">{draft.fileName}</span><button type="button" disabled={reading} onClick={() => setDraft(current => ({ ...current, fileName: "", fileData: "" }))} className="underline">Убрать PDF</button></div>}</div>
    {error && <p role="alert" className="rounded-lg bg-[#fcece9] p-3 text-sm text-[#a4352d]">{error}</p>}
    <p role="status" className="text-sm text-muted">{reading ? "Читаем PDF…" : ""}</p>
    <div className="flex flex-wrap gap-3 border-t border-line pt-5"><button disabled={reading} className="btn btn-primary">Сохранить резюме</button><button type="button" onClick={onCancel} className="btn btn-light">Отмена</button></div>
  </form>;
}
